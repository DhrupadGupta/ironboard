/**
 * T-A-010..T-A-017 — session lifecycle (ADR-006) on the Phase 3 `Session` table.
 *
 * Expiry is tested by moving an injected clock, never by sleeping.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { testDb, uid, purgeTestRows, expectPristine } from '../helpers.js';
import { applyPragmas } from '../../src/db/client.js';
import { config } from '../../src/config.js';
import { fakeClock, makeStaff, testContext, type TestContext } from './helpers.js';
import {
  createSession, publicSessionView, revokeAllForSubject, revokeById, revokeByToken, validateSession,
} from '../../src/platform/auth/session.service.js';
import { SessionInvalidError } from '../../src/platform/auth/errors.js';
import { hashToken } from '../../src/platform/auth/tokens.js';

let db: PrismaClient;
let ctx: TestContext;
let staffId: string;

beforeAll(async () => {
  db = testDb();
  await applyPragmas(db);
  await expectPristine(db, 'entry');
  ctx = testContext(db);
  staffId = (await makeStaff(db, 'receptionist', 'active')).id;
});
afterAll(async () => {
  await purgeTestRows(db);
  await expectPristine(db, 'exit');
  await db.$disconnect();
});

describe('T-A-010 session creation stores only a hash of the token', () => {
  it('returns the raw token once and persists sha256(token)', async () => {
    const issued = await createSession(ctx.deps, 'staff', staffId);
    const row = await db.session.findUniqueOrThrow({ where: { id: issued.sessionId } });

    expect(row.tokenHash).toBe(hashToken(issued.token));
    // The raw token must not be recoverable from the database.
    expect(row.tokenHash).not.toBe(issued.token);
    expect(JSON.stringify(row)).not.toContain(issued.token);
    expect(row.subjectType).toBe('staff');
    expect(row.subjectId).toBe(staffId);
    expect(row.revokedAt).toBeNull();
  });

  it('mints a distinct high-entropy token every time', async () => {
    const a = await createSession(ctx.deps, 'staff', staffId);
    const b = await createSession(ctx.deps, 'staff', staffId);
    expect(a.token).not.toBe(b.token);
    // 32 random bytes, base64url — 43 characters, no padding.
    expect(a.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});

describe('T-A-011 a valid session resolves to its subject', () => {
  it('validates and returns the subject', async () => {
    const issued = await createSession(ctx.deps, 'staff', staffId);
    const active = await validateSession(ctx.deps, issued.token);
    expect(active.subjectType).toBe('staff');
    expect(active.subjectId).toBe(staffId);
    expect(active.sessionId).toBe(issued.sessionId);
  });
});

describe('T-A-012 invalid session tokens are rejected', () => {
  it('rejects missing, empty, unknown and malformed tokens alike', async () => {
    for (const token of [undefined, '', 'not-a-real-token', 'A'.repeat(43)]) {
      await expect(validateSession(ctx.deps, token)).rejects.toBeInstanceOf(SessionInvalidError);
    }
  });

  it('a forged token whose hash does not exist is simply unknown', async () => {
    await expect(validateSession(ctx.deps, uid('forged'))).rejects.toMatchObject({ reason: 'UNKNOWN' });
  });
});

describe('T-A-013 idle expiry — a session unused for the idle TTL dies', () => {
  it('expires after the idle window and is revoked in place', async () => {
    const clock = fakeClock();
    const local = testContext(db, clock);
    const issued = await createSession(local.deps, 'staff', staffId);

    clock.advance(config.session.idleTtlMs - 1_000);
    await expect(validateSession(local.deps, issued.token)).resolves.toBeTruthy(); // still alive

    clock.advance(config.session.idleTtlMs + 1_000);
    await expect(validateSession(local.deps, issued.token)).rejects.toMatchObject({ reason: 'EXPIRED' });

    // Expired rows are revoked, not deleted — the audit trail keeps the evidence.
    const row = await db.session.findUniqueOrThrow({ where: { id: issued.sessionId } });
    expect(row.revokedAt).not.toBeNull();
  });

  it('activity slides the idle window forward', async () => {
    const clock = fakeClock();
    const local = testContext(db, clock);
    const issued = await createSession(local.deps, 'staff', staffId);
    const first = await db.session.findUniqueOrThrow({ where: { id: issued.sessionId } });

    // Use it repeatedly, each time just short of the idle limit.
    for (let i = 0; i < 3; i += 1) {
      clock.advance(config.session.idleTtlMs - 60_000);
      await expect(validateSession(local.deps, issued.token)).resolves.toBeTruthy();
    }
    const later = await db.session.findUniqueOrThrow({ where: { id: issued.sessionId } });
    expect(later.expiresAt.getTime()).toBeGreaterThan(first.expiresAt.getTime());
  });
});

describe('T-A-014 absolute expiry caps a session however busy it is', () => {
  it('dies at createdAt + absoluteTtl even with constant activity', async () => {
    const clock = fakeClock();
    const local = testContext(db, clock);
    const issued = await createSession(local.deps, 'staff', staffId);

    // Keep it warm right up to the absolute cap. Sliding must never pass it.
    const step = config.session.idleTtlMs - 60_000;
    const steps = Math.floor(config.session.absoluteTtlMs / step);
    for (let i = 0; i < steps; i += 1) {
      clock.advance(step);
      const active = await validateSession(local.deps, issued.token);
      expect(active.expiresAt.getTime()).toBeLessThanOrEqual(
        issued.expiresAt.getTime() - config.session.idleTtlMs + config.session.absoluteTtlMs,
      );
    }

    clock.advance(config.session.absoluteTtlMs);
    await expect(validateSession(local.deps, issued.token)).rejects.toMatchObject({ reason: 'EXPIRED' });
  });
});

describe('T-A-015 revocation is immediate (AC-11, AC-17)', () => {
  it('a revoked session stops working at once', async () => {
    const issued = await createSession(ctx.deps, 'staff', staffId);
    await expect(validateSession(ctx.deps, issued.token)).resolves.toBeTruthy();

    await revokeById(ctx.deps, issued.sessionId, 'test');
    await expect(validateSession(ctx.deps, issued.token)).rejects.toMatchObject({ reason: 'REVOKED' });
  });

  it('logout by token revokes, and is idempotent', async () => {
    const issued = await createSession(ctx.deps, 'staff', staffId);
    await revokeByToken(ctx.deps, issued.token);
    await revokeByToken(ctx.deps, issued.token); // second call must not throw
    await revokeByToken(ctx.deps, undefined);
    await revokeByToken(ctx.deps, 'never-existed');
    await expect(validateSession(ctx.deps, issued.token)).rejects.toBeInstanceOf(SessionInvalidError);
  });

  it('revoking every session for a subject kills all of them at once', async () => {
    const subject = (await makeStaff(db, 'trainer', 'active')).id;
    const a = await createSession(ctx.deps, 'staff', subject);
    const b = await createSession(ctx.deps, 'staff', subject);
    const other = await createSession(ctx.deps, 'staff', staffId);

    const count = await revokeAllForSubject(ctx.deps, 'staff', subject, 'test');
    expect(count).toBe(2);
    await expect(validateSession(ctx.deps, a.token)).rejects.toBeInstanceOf(SessionInvalidError);
    await expect(validateSession(ctx.deps, b.token)).rejects.toBeInstanceOf(SessionInvalidError);
    // A different subject's session is untouched.
    await expect(validateSession(ctx.deps, other.token)).resolves.toBeTruthy();
  });
});

describe('T-A-016 an already-revoked session is never resurrected', () => {
  it('re-revoking does not change the original revocation time', async () => {
    const issued = await createSession(ctx.deps, 'staff', staffId);
    await revokeById(ctx.deps, issued.sessionId, 'first');
    const first = await db.session.findUniqueOrThrow({ where: { id: issued.sessionId } });
    await revokeById(ctx.deps, issued.sessionId, 'second');
    const second = await db.session.findUniqueOrThrow({ where: { id: issued.sessionId } });
    expect(second.revokedAt?.getTime()).toBe(first.revokedAt?.getTime());
  });
});

describe('T-A-017 session internals never leave the server', () => {
  it('the public view exposes only an expiry', async () => {
    const issued = await createSession(ctx.deps, 'staff', staffId);
    const view = publicSessionView({
      sessionId: issued.sessionId, subjectType: 'staff', subjectId: staffId, expiresAt: issued.expiresAt,
    });
    expect(Object.keys(view)).toEqual(['expiresAt']);
    const json = JSON.stringify(view);
    for (const secret of [issued.token, issued.sessionId, staffId, 'tokenHash', 'subjectId']) {
      expect(json).not.toContain(secret);
    }
  });
});

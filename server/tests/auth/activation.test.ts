/**
 * T-A-020..T-A-026 — `AC-11` staff approval and activation.
 *
 * ⚠️ These verify the **activation mechanism**. `AC-11` itself is NOT verified
 * here: the criterion says "Then activate the account and send login details",
 * and until the outbox dispatcher exists nothing is actually *sent*. The
 * acceptance-criterion suite belongs to Phase 6/7.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { testDb, purgeTestRows, expectPristine } from '../helpers.js';
import { applyPragmas } from '../../src/db/client.js';
import { config } from '../../src/config.js';
import { fakeClock, makeStaff, testContext, type TestContext } from './helpers.js';
import { activateStaff, approveStaff } from '../../src/platform/auth/activation.service.js';
import { ActivationError } from '../../src/platform/auth/errors.js';
import { login } from '../../src/platform/auth/auth.service.js';
import { createSession, validateSession } from '../../src/platform/auth/session.service.js';
import { hashToken } from '../../src/platform/auth/tokens.js';
import { verifyPassword } from '../../src/platform/auth/password.js';

const NEW_PASSWORD = 'BrandNewPassword!7';

let db: PrismaClient;
let ctx: TestContext;
let adminId: string;

beforeAll(async () => {
  db = testDb();
  await applyPragmas(db);
  await expectPristine(db, 'entry');
  ctx = testContext(db);
  adminId = (await makeStaff(db, 'administrator', 'active')).id;
});
afterAll(async () => {
  await purgeTestRows(db);
  await expectPristine(db, 'exit');
  await db.$disconnect();
});

describe('T-A-020 approval issues login details and a hashed, time-limited token', () => {
  it('returns all four "login details" and never a password', async () => {
    const pending = await makeStaff(db, 'trainer', 'pending');
    const result = await approveStaff(ctx.deps, pending.id, adminId);

    // The four components of the finalized AC-11 interpretation.
    expect(result.loginDetails.signInUrl).toBe(config.signInUrl);
    expect(result.loginDetails.identifier).toBe(pending.email);
    expect(result.loginDetails.role).toBe('Trainer');
    expect(result.loginDetails.activationUrl).toContain(result.activationToken);
    expect(result.loginDetails.activationExpiresAt.getTime())
      .toBe(ctx.deps.now().getTime() + config.activation.ttlMs);

    // No password is generated or transmitted anywhere in the payload.
    const serialised = JSON.stringify(result.loginDetails);
    expect(serialised).not.toMatch(/password/i);
  });

  it('stores only the hash of the activation token', async () => {
    const pending = await makeStaff(db, 'receptionist', 'pending');
    const { activationToken } = await approveStaff(ctx.deps, pending.id, adminId);

    const row = await db.staff.findUniqueOrThrow({ where: { id: pending.id } });
    expect(row.activationTokenHash).toBe(hashToken(activationToken));
    expect(row.activationTokenHash).not.toBe(activationToken);
    expect(row.approvedByStaffId).toBe(adminId);
    expect(row.approvedAt).not.toBeNull();
    // Still pending: approval grants the right to set a password, not a login.
    expect(row.status).toBe('pending');
    expect(row.passwordHash).toBeNull();
  });

  it('queues the notification rather than sending inline (ADR-008)', async () => {
    const pending = await makeStaff(db, 'trainer', 'pending');
    const { activationToken } = await approveStaff(ctx.deps, pending.id, adminId);

    const outbox = await db.notificationOutbox.findFirstOrThrow({
      where: { recipient: pending.email, template: 'staff_approved_activation' },
    });
    expect(outbox.status).toBe('pending');
    expect(outbox.channel).toBe('email');
    // The token is in the queued payload — that is the one place it may live —
    // and no password is.
    expect(outbox.payloadJson).toContain(activationToken);
    expect(outbox.payloadJson).not.toMatch(/"password"/i);
  });

  it('refuses to approve an account that is not pending, or does not exist', async () => {
    const active = await makeStaff(db, 'trainer', 'active');
    await expect(approveStaff(ctx.deps, active.id, adminId)).rejects.toBeInstanceOf(ActivationError);

    const disabled = await makeStaff(db, 'trainer', 'disabled');
    await expect(approveStaff(ctx.deps, disabled.id, adminId)).rejects.toBeInstanceOf(ActivationError);

    await expect(approveStaff(ctx.deps, 'stf_does_not_exist', adminId))
      .rejects.toMatchObject({ reason: 'NOT_PENDING' });
  });
});

describe('T-A-021 successful activation sets the password and activates the account', () => {
  it('stores an Argon2id hash of the chosen password and flips status to active', async () => {
    const pending = await makeStaff(db, 'membership_manager', 'pending');
    const { activationToken } = await approveStaff(ctx.deps, pending.id, adminId);

    const { staffId } = await activateStaff(ctx.deps, activationToken, NEW_PASSWORD);
    expect(staffId).toBe(pending.id);

    const row = await db.staff.findUniqueOrThrow({ where: { id: pending.id } });
    expect(row.status).toBe('active');
    expect(row.passwordHash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(row.passwordHash, NEW_PASSWORD)).toBe(true);
    expect(row.passwordHash).not.toContain(NEW_PASSWORD);
  });

  it('the activated account can then log in', async () => {
    const pending = await makeStaff(db, 'accounting_executive', 'pending');
    const { activationToken } = await approveStaff(ctx.deps, pending.id, adminId);
    await activateStaff(ctx.deps, activationToken, NEW_PASSWORD);

    const result = await login(ctx.deps, pending.email, NEW_PASSWORD);
    expect(result.actor.role).toBe('accounting_executive');
    expect(result.actor.subjectType).toBe('staff');
  });
});

describe('T-A-022 activation tokens are single-use', () => {
  it('the token is cleared on use and a replay fails', async () => {
    const pending = await makeStaff(db, 'trainer', 'pending');
    const { activationToken } = await approveStaff(ctx.deps, pending.id, adminId);

    await activateStaff(ctx.deps, activationToken, NEW_PASSWORD);

    const row = await db.staff.findUniqueOrThrow({ where: { id: pending.id } });
    expect(row.activationTokenHash).toBeNull();
    expect(row.activationExpiresAt).toBeNull();

    // Replay: the same link must not work a second time.
    await expect(activateStaff(ctx.deps, activationToken, 'AnotherPassword!8'))
      .rejects.toMatchObject({ reason: 'UNKNOWN' });

    // And the replay must not have changed the password.
    const after = await db.staff.findUniqueOrThrow({ where: { id: pending.id } });
    expect(await verifyPassword(after.passwordHash, NEW_PASSWORD)).toBe(true);
    expect(await verifyPassword(after.passwordHash, 'AnotherPassword!8')).toBe(false);
  });

  it('two concurrent uses of one token cannot both succeed', async () => {
    const pending = await makeStaff(db, 'trainer', 'pending');
    const { activationToken } = await approveStaff(ctx.deps, pending.id, adminId);

    const results = await Promise.allSettled([
      activateStaff(ctx.deps, activationToken, NEW_PASSWORD),
      activateStaff(ctx.deps, activationToken, 'RacePassword!9'),
    ]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    expect(fulfilled).toHaveLength(1); // the transaction makes this exact
  });
});

describe('T-A-023 activation tokens are time-limited', () => {
  it('an expired token is refused and is cleared so it cannot be probed', async () => {
    const clock = fakeClock();
    const local = testContext(db, clock);
    const pending = await makeStaff(db, 'trainer', 'pending');
    const { activationToken } = await approveStaff(local.deps, pending.id, adminId);

    clock.advance(config.activation.ttlMs + 1_000);
    await expect(activateStaff(local.deps, activationToken, NEW_PASSWORD))
      .rejects.toMatchObject({ reason: 'EXPIRED' });

    const row = await db.staff.findUniqueOrThrow({ where: { id: pending.id } });
    expect(row.activationTokenHash).toBeNull(); // dead token removed
    expect(row.status).toBe('pending');         // never activated
    expect(row.passwordHash).toBeNull();
  });

  it('a token used one millisecond before expiry still works', async () => {
    const clock = fakeClock();
    const local = testContext(db, clock);
    const pending = await makeStaff(db, 'trainer', 'pending');
    const { activationToken } = await approveStaff(local.deps, pending.id, adminId);

    clock.advance(config.activation.ttlMs - 1);
    await expect(activateStaff(local.deps, activationToken, NEW_PASSWORD)).resolves.toBeTruthy();
  });
});

describe('T-A-024 an unknown activation token is refused', () => {
  it('rejects a well-formed token that was never issued', async () => {
    await expect(activateStaff(ctx.deps, 'a'.repeat(43), NEW_PASSWORD))
      .rejects.toMatchObject({ reason: 'UNKNOWN' });
  });
});

describe('T-A-025 activation refuses a weak password and changes nothing', () => {
  it('leaves the account pending with its token intact', async () => {
    const pending = await makeStaff(db, 'trainer', 'pending');
    const { activationToken } = await approveStaff(ctx.deps, pending.id, adminId);

    await expect(activateStaff(ctx.deps, activationToken, 'short')).rejects.toThrow();

    const row = await db.staff.findUniqueOrThrow({ where: { id: pending.id } });
    expect(row.status).toBe('pending');
    expect(row.passwordHash).toBeNull();
    // The token survives a rejected attempt, so a typo does not burn the link.
    expect(row.activationTokenHash).toBe(hashToken(activationToken));
  });
});

describe('T-A-026 setting a password revokes every existing session', () => {
  it('no session survives a password being set', async () => {
    const pending = await makeStaff(db, 'trainer', 'pending');
    // A session that somehow predates the password must not outlive it.
    const stale = await createSession(ctx.deps, 'staff', pending.id);
    const { activationToken } = await approveStaff(ctx.deps, pending.id, adminId);

    await activateStaff(ctx.deps, activationToken, NEW_PASSWORD);

    await expect(validateSession(ctx.deps, stale.token)).rejects.toBeInstanceOf(Error);
    const live = await db.session.count({
      where: { subjectType: 'staff', subjectId: pending.id, revokedAt: null },
    });
    expect(live).toBe(0);
  });
});

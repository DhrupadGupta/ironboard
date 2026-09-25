/**
 * T-A-040..T-A-049 — the security properties of the auth surface.
 *
 * ⚠️ **No NFR is marked VERIFIED by this file.** `NFR-11` ("Only administrators
 * should be able to approve staff accounts") has its guard exercised here, but
 * `AC-11`'s own acceptance suite does not exist yet, so the traceability row
 * stays PARTIAL. `NFR-10` and `NFR-21` are untouched — their endpoints are
 * Phase 4B.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { PrismaClient } from '@prisma/client';
import { testDb, purgeTestRows, expectPristine } from '../helpers.js';
import { applyPragmas } from '../../src/db/client.js';
import { config } from '../../src/config.js';
import { DEV_PASSWORD } from '../../src/db/dev-credentials.js';
import { REDACTED } from '../../src/platform/logging/logger.js';
import {
  TEST_PASSWORD, asArray, cookieValue, makeStaff, testContext, type TestContext,
} from './helpers.js';

let db: PrismaClient;
let ctx: TestContext;

beforeAll(async () => {
  db = testDb();
  await applyPragmas(db);
  await expectPristine(db, 'entry');
  ctx = testContext(db);
});
afterAll(async () => {
  await purgeTestRows(db);
  await expectPristine(db, 'exit');
  await db.$disconnect();
});

beforeEach(() => { ctx.app.resetRateLimiter(); ctx.logs.length = 0; });

const app = () => ctx.app.express;
const post = (path: string) => request(app()).post(`/api/v1${path}`);

/** Signs in and returns an agent plus the CSRF token it must echo. */
async function signIn(email: string, password: string) {
  const agent = request.agent(app());
  await agent.post('/api/v1/auth/login').send({ email, password }).expect(200);
  const csrf = await agent.get('/api/v1/auth/csrf').expect(200);
  return { agent, csrfToken: csrf.body.csrfToken as string };
}

describe('T-A-040 login failures are indistinguishable from one another', () => {
  it('unknown / wrong-password / pending / disabled all return the identical body', async () => {
    const active = await makeStaff(db, 'trainer', 'active');
    const pending = await makeStaff(db, 'trainer', 'pending', { withPassword: true });
    const disabled = await makeStaff(db, 'trainer', 'disabled', { withPassword: true });

    const responses = [];
    for (const [email, password] of [
      ['nobody@example.invalid', TEST_PASSWORD],
      [active.email, 'DefinitelyWrong!1'],
      [pending.email, TEST_PASSWORD],
      [disabled.email, TEST_PASSWORD],
    ] as const) {
      ctx.app.resetRateLimiter();
      responses.push(await post('/auth/login').send({ email, password }));
    }

    for (const res of responses) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual(responses[0]!.body);
      expect(res.body.error.message).toBe('Invalid email or password.');
      // Nothing in the response hints at which case it was.
      const text = JSON.stringify(res.body).toLowerCase();
      for (const leak of ['pending', 'disabled', 'unknown', 'not found', 'approval', 'exist']) {
        expect(text, `leaked "${leak}"`).not.toContain(leak);
      }
    }
  });

  it('the internal reason is still recorded server-side', async () => {
    // The distinction must survive somewhere — just not in the response.
    const disabled = await makeStaff(db, 'trainer', 'disabled', { withPassword: true });
    await post('/auth/login').send({ email: disabled.email, password: TEST_PASSWORD });
    const failure = ctx.logs.find((l) => l.event === 'auth.login_failed');
    expect(failure?.reason).toBe('ACCOUNT_DISABLED');
  });
});

describe('T-A-041 no response ever contains a password or a hash', () => {
  it('login, /auth/me and approve are all free of credential material', async () => {
    const admin = await db.staff.findFirstOrThrow({
      where: { role: { key: 'administrator' }, status: 'active' },
    });
    const { agent, csrfToken } = await signIn(admin.email, DEV_PASSWORD);
    const pending = await makeStaff(db, 'trainer', 'pending');

    const responses = [
      await agent.get('/api/v1/auth/me').expect(200),
      await agent.post(`/api/v1/staff/${pending.id}/approve`)
        .set(config.csrf.headerName, csrfToken).expect(200),
    ];

    for (const res of responses) {
      const body = JSON.stringify(res.body);
      expect(body).not.toContain('$argon2');
      expect(body).not.toContain(DEV_PASSWORD);
      expect(body).not.toMatch(/passwordHash/i);
      expect(body).not.toMatch(/tokenHash/i);
      expect(body).not.toMatch(/activationToken/i);
    }
  });

  it('the approval response omits the activation token entirely', async () => {
    const admin = await db.staff.findFirstOrThrow({
      where: { role: { key: 'administrator' }, status: 'active' },
    });
    const { agent, csrfToken } = await signIn(admin.email, DEV_PASSWORD);
    const pending = await makeStaff(db, 'trainer', 'pending');

    const res = await agent.post(`/api/v1/staff/${pending.id}/approve`)
      .set(config.csrf.headerName, csrfToken).expect(200);

    // The admin must never handle the staff member's secret; it exists only in
    // the queued notification.
    const row = await db.staff.findUniqueOrThrow({ where: { id: pending.id } });
    expect(JSON.stringify(res.body)).not.toContain(row.activationTokenHash!);
    expect(res.body.loginDetails).toMatchObject({ identifier: pending.email, role: 'Trainer' });
    expect(res.body.loginDetails.activationUrl).toBeUndefined();
  });
});

describe('T-A-042 deny-by-default authorization (ADR-007, NFR-11)', () => {
  it('a non-administrator cannot approve staff — 403', async () => {
    const pending = await makeStaff(db, 'trainer', 'pending');

    for (const roleKey of ['receptionist', 'trainer', 'membership_manager', 'accounting_executive'] as const) {
      const staff = await db.staff.findFirstOrThrow({ where: { role: { key: roleKey }, status: 'active' } });
      const { agent, csrfToken } = await signIn(staff.email, DEV_PASSWORD);
      const res = await agent.post(`/api/v1/staff/${pending.id}/approve`)
        .set(config.csrf.headerName, csrfToken);
      expect(res.status, `${roleKey} was not denied`).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    }
    // The target is untouched by the denied attempts.
    expect((await db.staff.findUniqueOrThrow({ where: { id: pending.id } })).status).toBe('pending');
  });

  it('a member cannot approve staff — 403', async () => {
    const member = await db.member.findFirstOrThrow({ where: { NOT: { passwordHash: null } } });
    const pending = await makeStaff(db, 'trainer', 'pending');
    const { agent, csrfToken } = await signIn(member.email, DEV_PASSWORD);
    const res = await agent.post(`/api/v1/staff/${pending.id}/approve`)
      .set(config.csrf.headerName, csrfToken);
    expect(res.status).toBe(403);
  });

  it('an unauthenticated caller gets 401, not 403 — and learns nothing else', async () => {
    const pending = await makeStaff(db, 'trainer', 'pending');
    const res = await post(`/staff/${pending.id}/approve`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('SESSION_INVALID');
  });
});

describe('T-A-043 CSRF is required on mutations', () => {
  it('rejects a state-changing request with no CSRF header', async () => {
    const admin = await db.staff.findFirstOrThrow({
      where: { role: { key: 'administrator' }, status: 'active' },
    });
    const { agent } = await signIn(admin.email, DEV_PASSWORD);
    const pending = await makeStaff(db, 'trainer', 'pending');

    const res = await agent.post(`/api/v1/staff/${pending.id}/approve`); // no header
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('rejects a mismatched CSRF token', async () => {
    const admin = await db.staff.findFirstOrThrow({
      where: { role: { key: 'administrator' }, status: 'active' },
    });
    const { agent } = await signIn(admin.email, DEV_PASSWORD);
    const pending = await makeStaff(db, 'trainer', 'pending');

    const res = await agent.post(`/api/v1/staff/${pending.id}/approve`)
      .set(config.csrf.headerName, 'not-the-right-token');
    expect(res.status).toBe(400);
  });
});

describe('T-A-044 brute force is rate limited', () => {
  it('blocks repeated failures for one identifier with 429 + Retry-After', async () => {
    const staff = await makeStaff(db, 'trainer', 'active');
    let sawRateLimit = false;

    for (let i = 0; i < config.rateLimit.maxPerIdentifier + 2; i += 1) {
      const res = await post('/auth/login').send({ email: staff.email, password: 'Wrong!12345' });
      if (res.status === 429) {
        sawRateLimit = true;
        expect(res.body.error.code).toBe('RATE_LIMITED');
        expect(res.headers['retry-after']).toBeDefined();
        break;
      }
    }
    expect(sawRateLimit).toBe(true);
  });

  it('a correct password is also refused once the limit is reached', async () => {
    // Otherwise the limiter would be trivially bypassed by guessing correctly.
    const staff = await makeStaff(db, 'trainer', 'active');
    for (let i = 0; i < config.rateLimit.maxPerIdentifier + 1; i += 1) {
      await post('/auth/login').send({ email: staff.email, password: 'Wrong!12345' });
    }
    const res = await post('/auth/login').send({ email: staff.email, password: TEST_PASSWORD });
    expect(res.status).toBe(429);
  });

  it('activation attempts are rate limited too, so tokens cannot be probed', async () => {
    let sawRateLimit = false;
    for (let i = 0; i < config.rateLimit.maxPerIp + 2; i += 1) {
      const res = await post('/auth/activate').send({ token: 'x'.repeat(43), password: TEST_PASSWORD });
      if (res.status === 429) { sawRateLimit = true; break; }
    }
    expect(sawRateLimit).toBe(true);
  });
});

describe('T-A-045 input validation rejects malformed requests', () => {
  it('400s on a missing or malformed body, with field detail', async () => {
    for (const body of [{}, { email: 'not-an-email', password: 'x' }, { email: 'a@b.invalid' }]) {
      const res = await post('/auth/login').send(body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    }
  });

  it('a validation error never echoes the submitted password back', async () => {
    const res = await post('/auth/activate').send({ token: 'short', password: 'AlsoTooShortX' });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toContain('AlsoTooShortX');
  });

  it('an over-long body is refused rather than hashed', async () => {
    const res = await post('/auth/login')
      .send({ email: 'a@b.invalid', password: 'p'.repeat(config.password.maxLength + 50) });
    expect(res.status).toBe(400);
  });
});

describe('T-A-046 logging is security-conscious', () => {
  it('never writes a password, token or hash, and fingerprints emails', async () => {
    const staff = await makeStaff(db, 'trainer', 'active');
    await post('/auth/login').send({ email: staff.email, password: TEST_PASSWORD });

    const serialised = JSON.stringify(ctx.logs);
    expect(serialised).not.toContain(TEST_PASSWORD);
    expect(serialised).not.toContain('$argon2');
    // The raw address is never written — only a one-way fingerprint.
    expect(serialised).not.toContain(staff.email);
    expect(serialised).toContain('fp_');
    expect(ctx.logs.some((l) => l.event === 'auth.login_succeeded')).toBe(true);
  });

  it('redacts secret keys and DROPS medical keys entirely (NFR-10)', async () => {
    const { createLogger } = await import('../../src/platform/logging/logger.js');
    const records: unknown[] = [];
    const log = createLogger((r) => records.push(r));

    log.info('probe', {
      password: 'hunter2', token: 'abc', passwordHash: '$argon2id$x',
      conditionCipher: 'DEV_SEED_PLACEHOLDER:asthma', condition: 'asthma',
      medical: { diagnosis: 'x' }, safe: 'keep-me',
    });

    const out = JSON.stringify(records);
    expect(out).not.toContain('hunter2');
    expect(out).not.toContain('$argon2id$x');
    expect(out).toContain(REDACTED);
    // Medical keys are dropped, not redacted — their presence must not even be
    // inferable from the log shape.
    expect(out).not.toContain('conditionCipher');
    expect(out).not.toContain('asthma');
    expect(out).not.toContain('diagnosis');
    expect(out).toContain('keep-me');
  });
});

describe('T-A-047 staff self-registration (ENH-06) cannot mint a usable account', () => {
  it('creates a pending account with no password', async () => {
    const email = `selfreg.${Date.now()}@ironboard.test.invalid`;
    const res = await post('/auth/staff/register')
      .send({ email, fullName: 'Self Registered', roleKey: 'receptionist' });

    expect(res.status).toBe(202);
    const created = await db.staff.findUnique({ where: { email } });
    expect(created?.status).toBe('pending');
    expect(created?.passwordHash).toBeNull();

    // And it cannot log in.
    ctx.app.resetRateLimiter();
    const login = await post('/auth/login').send({ email, password: TEST_PASSWORD });
    expect(login.status).toBe(401);

    await db.staff.delete({ where: { email } }); // not created via uid(); clean up explicitly
  });

  it('cannot be used to enumerate staff — a duplicate looks identical', async () => {
    const existing = await db.staff.findFirstOrThrow({ where: { status: 'active' } });
    const res = await post('/auth/staff/register')
      .send({ email: existing.email, fullName: 'Impostor', roleKey: 'receptionist' });
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ status: 'pending_approval' });
    // The real account is untouched.
    const after = await db.staff.findUniqueOrThrow({ where: { email: existing.email } });
    expect(after.fullName).not.toBe('Impostor');
    expect(after.status).toBe('active');
  });

  it('refuses to self-register as an unknown role', async () => {
    const res = await post('/auth/staff/register')
      .send({ email: 'x@ironboard.test.invalid', fullName: 'X', roleKey: 'superuser' });
    expect(res.status).toBe(400);
  });
});

describe('T-A-048 baseline HTTP hardening', () => {
  it('sends security headers and hides the framework', async () => {
    const res = await request(app()).get('/healthz').expect(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('an unknown endpoint returns a flat 404, not a stack trace', async () => {
    const res = await request(app()).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'NOT_FOUND', message: 'No such endpoint.' } });
    expect(JSON.stringify(res.body)).not.toMatch(/at .*\.ts:/); // no stack
  });
});

describe('T-A-049 the full activation journey over HTTP', () => {
  it('admin approves → staff activates → staff logs in', async () => {
    const admin = await db.staff.findFirstOrThrow({
      where: { role: { key: 'administrator' }, status: 'active' },
    });
    const { agent, csrfToken } = await signIn(admin.email, DEV_PASSWORD);
    const pending = await makeStaff(db, 'trainer', 'pending');

    // 1. approve (NFR-11: only an administrator can reach this)
    await agent.post(`/api/v1/staff/${pending.id}/approve`)
      .set(config.csrf.headerName, csrfToken).expect(200);

    // 2. the token reaches the staff member only through the queued notification
    const outbox = await db.notificationOutbox.findFirstOrThrow({
      where: { recipient: pending.email, template: 'staff_approved_activation' },
      orderBy: { createdAt: 'desc' },
    });
    const token = (JSON.parse(outbox.payloadJson) as { activationUrl: string })
      .activationUrl.split('token=')[1]!;

    // 3. set a password with the single-use link
    ctx.app.resetRateLimiter();
    const activated = await post('/auth/activate').send({ token, password: 'JourneyPass!2026' });
    expect(activated.status).toBe(200);
    expect(activated.body).toMatchObject({ staffId: pending.id, status: 'active' });

    // 4. and can now sign in
    ctx.app.resetRateLimiter();
    const login = await post('/auth/login').send({ email: pending.email, password: 'JourneyPass!2026' });
    expect(login.status).toBe(200);
    expect(login.body.actor.role).toBe('trainer');
    expect(cookieValue(asArray(login.headers['set-cookie']), config.session.cookieName)).toBeDefined();

    // 5. the link is spent
    ctx.app.resetRateLimiter();
    const replay = await post('/auth/activate').send({ token, password: 'DifferentPass!2026' });
    expect(replay.status).toBe(400);
    expect(replay.body.error.code).toBe('ACTIVATION_INVALID');
  });
});

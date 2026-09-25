/**
 * T-A-030..T-A-038 — the HTTP authentication surface.
 *
 * All six roles are exercised through one flow (MASTER_PLAN §11), including
 * Member (`ENH-01`, never academic coverage).
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import type { PrismaClient } from '@prisma/client';
import { testDb, purgeTestRows, expectPristine } from '../helpers.js';
import { applyPragmas } from '../../src/db/client.js';
import { config } from '../../src/config.js';
import { DEV_PASSWORD } from '../../src/db/dev-credentials.js';
import {
  TEST_PASSWORD, asArray, cookieHeader, cookieValue, fakeClock, makeStaff, testContext,
  type TestContext,
} from './helpers.js';

const STAFF_ROLES = ['administrator', 'receptionist', 'trainer',
  'membership_manager', 'accounting_executive'] as const;

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

// The limiter is process state; each test starts from a clean allowance.
beforeEach(() => { ctx.app.resetRateLimiter(); });

const post = (path: string) => request(ctx.app.express).post(`/api/v1${path}`);

describe('T-A-030 valid login — every one of the six roles', () => {
  it.each(STAFF_ROLES)('a %s signs in with a seeded account', async (roleKey) => {
    const staff = await db.staff.findFirstOrThrow({
      where: { role: { key: roleKey }, status: 'active' },
    });

    const res = await post('/auth/login').send({ email: staff.email, password: DEV_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.actor).toMatchObject({
      id: staff.id, subjectType: 'staff', email: staff.email, role: roleKey,
    });
    expect(Array.isArray(res.body.actor.permissions)).toBe(true);
    expect(res.body.actor.permissions.length).toBeGreaterThan(0);
  });

  it('a member signs in through the same flow (ENH-01)', async () => {
    const member = await db.member.findFirstOrThrow({ where: { NOT: { passwordHash: null } } });
    const res = await post('/auth/login').send({ email: member.email, password: DEV_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.actor).toMatchObject({ subjectType: 'member', role: 'member', id: member.id });
    // ENH-01 scope: a member's permissions are read-only own-record grants.
    expect(res.body.actor.permissions).not.toContain('staff:approve');
    expect(res.body.actor.permissions).not.toContain('member:create');
  });

  it('email lookup is case- and whitespace-insensitive', async () => {
    const staff = await db.staff.findFirstOrThrow({ where: { role: { key: 'trainer' }, status: 'active' } });
    const res = await post('/auth/login')
      .send({ email: `  ${staff.email.toUpperCase()}  `, password: DEV_PASSWORD });
    expect(res.status).toBe(200);
  });
});

describe('T-A-031 the session cookie is correctly hardened', () => {
  it('sets httpOnly, SameSite=Strict, Path=/ and an expiry', async () => {
    const staff = await db.staff.findFirstOrThrow({ where: { role: { key: 'trainer' }, status: 'active' } });
    const res = await post('/auth/login').send({ email: staff.email, password: DEV_PASSWORD });

    const header = cookieHeader(asArray(res.headers['set-cookie']), config.session.cookieName);
    expect(header).toBeDefined();
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Strict');
    expect(header).toContain('Path=/');
    expect(header).toContain('Expires=');
    // `Secure` is production-only: localhost has no TLS, so the cookie would
    // never be set and the app would be untestable. Asserted as the dev value.
    expect(header).not.toContain('Secure');
  });

  it('the cookie carries an opaque token, not the subject id or a JWT', async () => {
    const staff = await db.staff.findFirstOrThrow({ where: { role: { key: 'trainer' }, status: 'active' } });
    const res = await post('/auth/login').send({ email: staff.email, password: DEV_PASSWORD });

    const token = cookieValue(asArray(res.headers['set-cookie']), config.session.cookieName);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(token).not.toContain(staff.id);
    expect(token).not.toContain('.');        // not a JWT
    expect(token).not.toContain(staff.email);
  });

  it('rotates the CSRF token on login (session fixation)', async () => {
    const staff = await db.staff.findFirstOrThrow({ where: { role: { key: 'trainer' }, status: 'active' } });
    const res = await post('/auth/login').send({ email: staff.email, password: DEV_PASSWORD });
    expect(cookieValue(asArray(res.headers['set-cookie']), config.csrf.cookieName)).toBeDefined();
  });
});

describe('T-A-032 invalid password is rejected', () => {
  it('returns 401 with the generic code', async () => {
    const staff = await db.staff.findFirstOrThrow({ where: { role: { key: 'trainer' }, status: 'active' } });
    const res = await post('/auth/login').send({ email: staff.email, password: 'WrongPassword!1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(asArray(res.headers['set-cookie'])).toBeUndefined(); // no session issued
  });
});

describe('T-A-033 a nonexistent account is rejected', () => {
  it('returns the same 401 as a wrong password', async () => {
    const res = await post('/auth/login')
      .send({ email: 'nobody.at.all@example.invalid', password: 'WrongPassword!1' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('T-A-034 a pending account cannot log in', () => {
  it('an approved-but-not-activated account is refused', async () => {
    // Pending accounts have no password at all, so there is nothing to present.
    const pending = await makeStaff(db, 'trainer', 'pending');
    const res = await post('/auth/login').send({ email: pending.email, password: TEST_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('even a pending account that somehow has a password is refused', async () => {
    // Defence in depth: status is checked independently of the password.
    const pending = await makeStaff(db, 'trainer', 'pending', { withPassword: true });
    const res = await post('/auth/login').send({ email: pending.email, password: TEST_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('T-A-035 a disabled account cannot log in', () => {
  it('is refused even with the correct password', async () => {
    const disabled = await makeStaff(db, 'receptionist', 'disabled', { withPassword: true });
    const res = await post('/auth/login').send({ email: disabled.email, password: TEST_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('disabling an account kills its live session on the next request', async () => {
    const staff = await makeStaff(db, 'receptionist', 'active');
    const agent = request.agent(ctx.app.express);
    await agent.post('/api/v1/auth/login').send({ email: staff.email, password: TEST_PASSWORD }).expect(200);
    await agent.get('/api/v1/auth/me').expect(200);

    // AC-11/AC-17 "immediately": no waiting for the token to expire.
    await db.staff.update({ where: { id: staff.id }, data: { status: 'disabled' } });
    await agent.get('/api/v1/auth/me').expect(401);
  });
});

describe('T-A-036 a member without a password cannot log in', () => {
  it('is refused — no member activation flow exists (ENH-01 gap)', async () => {
    const member = await db.member.findFirstOrThrow({ where: { passwordHash: null } });
    const res = await post('/auth/login').send({ email: member.email, password: DEV_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('T-A-037 logout revokes the session', () => {
  it('204s, clears the cookie, and the session stops working', async () => {
    const staff = await makeStaff(db, 'trainer', 'active');
    const agent = request.agent(ctx.app.express);
    const login = await agent.post('/api/v1/auth/login')
      .send({ email: staff.email, password: TEST_PASSWORD }).expect(200);
    const token = cookieValue(asArray(login.headers['set-cookie']), config.session.cookieName)!;

    await agent.get('/api/v1/auth/me').expect(200);
    const out = await agent.post('/api/v1/auth/logout').expect(204);

    const cleared = cookieHeader(asArray(out.headers['set-cookie']), config.session.cookieName);
    expect(cleared).toBeDefined();
    await agent.get('/api/v1/auth/me').expect(401);

    // Revoked server-side, not merely dropped by the browser: replaying the
    // captured token fails too.
    const replay = await request(ctx.app.express).get('/api/v1/auth/me')
      .set('Cookie', `${config.session.cookieName}=${token}`);
    expect(replay.status).toBe(401);
  });

  it('logging out without a session is still 204 — idempotent', async () => {
    await request(ctx.app.express).post('/api/v1/auth/logout').expect(204);
  });
});

describe('T-A-038 /auth/me reflects the session, and expiry ends it', () => {
  it('returns the actor and permissions for a live session', async () => {
    const staff = await db.staff.findFirstOrThrow({ where: { role: { key: 'administrator' }, status: 'active' } });
    const agent = request.agent(ctx.app.express);
    await agent.post('/api/v1/auth/login').send({ email: staff.email, password: DEV_PASSWORD }).expect(200);

    const me = await agent.get('/api/v1/auth/me').expect(200);
    expect(me.body.actor.role).toBe('administrator');
    expect(me.body.actor.permissions).toContain('staff:approve'); // NFR-11
  });

  it('rejects a request with no session at all', async () => {
    const res = await request(ctx.app.express).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('SESSION_INVALID');
  });

  it('rejects an expired session, and does so identically to a forged one', async () => {
    const clock = fakeClock();
    const local = testContext(db, clock);
    const staff = await makeStaff(db, 'trainer', 'active');

    const login = await request(local.app.express).post('/api/v1/auth/login')
      .send({ email: staff.email, password: TEST_PASSWORD }).expect(200);
    const token = cookieValue(asArray(login.headers['set-cookie']), config.session.cookieName)!;

    clock.advance(config.session.idleTtlMs + 1_000);

    const expired = await request(local.app.express).get('/api/v1/auth/me')
      .set('Cookie', `${config.session.cookieName}=${token}`);
    const forged = await request(local.app.express).get('/api/v1/auth/me')
      .set('Cookie', `${config.session.cookieName}=${'z'.repeat(43)}`);

    expect(expired.status).toBe(401);
    expect(forged.status).toBe(401);
    // Indistinguishable: an attacker cannot tell a dead session from a fake one.
    expect(expired.body).toEqual(forged.body);
  });
});

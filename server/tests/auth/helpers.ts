/**
 * Shared fixtures for the Phase 4A authentication suites.
 *
 * Two rules every helper here exists to honour:
 *
 *  1. **The isolation contract.** Services mint ids through an injected factory,
 *     so tests inject `uid()` and every row they create carries the `_test_`
 *     marker the purge looks for. A service that minted its own cuid2 ids would
 *     write rows `purgeTestRows()` cannot see.
 *  2. **The clock is injected**, so expiry is tested by moving time, never by
 *     sleeping. A suite that sleeps for a 30-minute idle timeout is a suite
 *     nobody runs.
 */
import type { PrismaClient } from '@prisma/client';
import { authDeps, type AuthDeps } from '../../src/platform/auth/deps.js';
import { createApp, type App } from '../../src/http/app.js';
import { hashPassword } from '../../src/platform/auth/password.js';
import { createLogger, type LogRecord } from '../../src/platform/logging/logger.js';
import { uid } from '../helpers.js';

export const TEST_PASSWORD = 'TestPassword!2026';

/** A clock the test moves by hand. */
export interface FakeClock { now: () => Date; advance: (ms: number) => void; set: (d: Date) => void }

/**
 * Defaults to the **real** current time, not a fixed past date.
 *
 * This matters for the HTTP suites: the session cookie carries `Expires`, and a
 * clock anchored in the past issues a cookie that a real cookie jar discards
 * immediately as already-expired — which reads as "login succeeded but the
 * session does not work". Tests that need a fixed instant pass one explicitly.
 */
export function fakeClock(start = new Date()): FakeClock {
  let current = start;
  return {
    now: () => current,
    advance: (ms) => { current = new Date(current.getTime() + ms); },
    set: (d) => { current = d; },
  };
}

export interface TestContext {
  deps: AuthDeps;
  clock: FakeClock;
  /** Everything the logger would have written, for the redaction assertions. */
  logs: LogRecord[];
  app: App;
}

export function testContext(db: PrismaClient, clock: FakeClock = fakeClock()): TestContext {
  const logs: LogRecord[] = [];
  const deps = authDeps(db, {
    now: clock.now,
    // `uid()` embeds the `_test_` marker, so every row is purgeable.
    newId: (prefix) => uid(prefix),
    log: createLogger((record) => { logs.push(record); }),
  });
  return { deps, clock, logs, app: createApp(deps) };
}

/** A staff account in a chosen state, with a real Argon2id hash. */
export async function makeStaff(
  db: PrismaClient,
  roleKey: string,
  status: 'pending' | 'active' | 'disabled',
  opts: { withPassword?: boolean } = {},
): Promise<{ id: string; email: string }> {
  const role = await db.role.findUniqueOrThrow({ where: { key: roleKey } });
  const email = `${uid('staff')}@ironboard.test.invalid`;
  const withPassword = opts.withPassword ?? status === 'active';
  const staff = await db.staff.create({
    data: {
      id: uid('stf'),
      email,
      fullName: 'Auth Probe',
      roleId: role.id,
      status,
      passwordHash: withPassword ? await hashPassword(TEST_PASSWORD) : null,
    },
  });
  return { id: staff.id, email: staff.email };
}

/** Reads one cookie's value out of a `set-cookie` header array. */
export function cookieValue(setCookie: string[] | undefined, name: string): string | undefined {
  const header = (setCookie ?? []).find((c) => c.startsWith(`${name}=`));
  if (header === undefined) return undefined;
  const value = header.slice(name.length + 1).split(';')[0];
  return value === '' ? undefined : value;
}

/** The raw `set-cookie` entry, so flags (`HttpOnly`, `SameSite`) can be asserted. */
export function cookieHeader(setCookie: string[] | undefined, name: string): string | undefined {
  return (setCookie ?? []).find((c) => c.startsWith(`${name}=`));
}

export const asArray = (h: unknown): string[] | undefined =>
  Array.isArray(h) ? (h as string[]) : typeof h === 'string' ? [h] : undefined;

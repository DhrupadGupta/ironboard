/**
 * T-A-001..T-A-006 — password hashing (ADR-006, Argon2id).
 *
 * These are the tests that make "secure password storage" a claim rather than an
 * aspiration: they assert the algorithm, that the plaintext is absent, that
 * salts differ, and that a corrupt stored value reads as a failed login instead
 * of an exception.
 */
import { describe, it, expect } from 'vitest';
import {
  ARGON2ID_PREFIX, WeakPasswordError, assertPasswordAcceptable, hashPassword, verifyDummy,
  verifyPassword,
} from '../../src/platform/auth/password.js';
import { config } from '../../src/config.js';

// This file touches no database, so it needs no isolation hooks.

const PASSWORD = 'CorrectHorseBattery!9';

describe('T-A-001 hashing produces an Argon2id hash, never the plaintext', () => {
  it('emits a PHC-encoded Argon2id string', async () => {
    const hash = await hashPassword(PASSWORD);
    expect(hash.startsWith(ARGON2ID_PREFIX)).toBe(true);
    // The encoded hash carries its own parameters, so a future cost change is
    // backwards-compatible with already-stored hashes.
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=\d+,t=\d+,p=\d+\$/);
  });

  it('never contains the plaintext, in any casing', async () => {
    const hash = await hashPassword(PASSWORD);
    expect(hash).not.toContain(PASSWORD);
    expect(hash.toLowerCase()).not.toContain(PASSWORD.toLowerCase());
  });

  it('uses the configured cost parameters', async () => {
    const hash = await hashPassword(PASSWORD);
    expect(hash).toContain(`m=${config.password.memoryCost}`);
    expect(hash).toContain(`t=${config.password.timeCost}`);
    expect(hash).toContain(`p=${config.password.parallelism}`);
  });
});

describe('T-A-002 every hash is independently salted', () => {
  it('hashing the same password twice yields different hashes that both verify', async () => {
    const [a, b] = await Promise.all([hashPassword(PASSWORD), hashPassword(PASSWORD)]);
    expect(a).not.toBe(b); // identical hashes would mean no salt — a rainbow-table hole
    expect(await verifyPassword(a, PASSWORD)).toBe(true);
    expect(await verifyPassword(b, PASSWORD)).toBe(true);
  });
});

describe('T-A-003 verification accepts only the right password', () => {
  it('accepts the correct password', async () => {
    expect(await verifyPassword(await hashPassword(PASSWORD), PASSWORD)).toBe(true);
  });

  it('rejects a wrong password, a near-miss, and a case change', async () => {
    const hash = await hashPassword(PASSWORD);
    for (const wrong of [`${PASSWORD} `, ` ${PASSWORD}`, PASSWORD.toLowerCase(),
      PASSWORD.slice(0, -1), `${PASSWORD}x`, '']) {
      expect(await verifyPassword(hash, wrong), `accepted ${JSON.stringify(wrong)}`).toBe(false);
    }
  });
});

describe('T-A-004 a missing or corrupt stored hash reads as "wrong password"', () => {
  it('returns false rather than throwing', async () => {
    // A 500 here would tell an attacker the stored record is unusual.
    expect(await verifyPassword(null, PASSWORD)).toBe(false);
    expect(await verifyPassword('', PASSWORD)).toBe(false);
    expect(await verifyPassword('not-a-hash', PASSWORD)).toBe(false);
    expect(await verifyPassword('$argon2id$broken', PASSWORD)).toBe(false);
    expect(await verifyPassword('DEV_SEED_NOT_A_REAL_HASH', PASSWORD)).toBe(false);
  });
});

describe('T-A-005 length bounds are enforced', () => {
  it('rejects a password below the minimum', () => {
    expect(() => assertPasswordAcceptable('short')).toThrow(WeakPasswordError);
    expect(() => assertPasswordAcceptable('a'.repeat(config.password.minLength - 1)))
      .toThrow(WeakPasswordError);
  });

  it('accepts the minimum exactly', () => {
    expect(() => assertPasswordAcceptable('a'.repeat(config.password.minLength))).not.toThrow();
  });

  it('rejects an over-long password — a memory-hard hasher is a DoS surface', () => {
    expect(() => assertPasswordAcceptable('a'.repeat(config.password.maxLength + 1)))
      .toThrow(WeakPasswordError);
  });

  it('hashPassword refuses a weak password outright', async () => {
    await expect(hashPassword('tiny')).rejects.toThrow(WeakPasswordError);
  });
});

describe('T-A-006 the dummy verify spends real work and always fails', () => {
  it('returns false and costs a comparable amount of time to a real verify', async () => {
    const hash = await hashPassword(PASSWORD);

    const t0 = performance.now();
    await verifyPassword(hash, 'definitely-wrong-password');
    const real = performance.now() - t0;

    const t1 = performance.now();
    expect(await verifyDummy('definitely-wrong-password')).toBe(false);
    const dummy = performance.now() - t1;

    // Loose bound on purpose — CI timing is noisy and this is a smoke check that
    // the dummy path actually hashes rather than returning instantly. The
    // security claim it supports is asserted behaviourally in security.api.test.
    expect(dummy).toBeGreaterThan(real / 10);
  });
});

/**
 * Password hashing — Argon2id (ADR-006, SECURITY_ARCHITECTURE §2).
 *
 * 🟦 ENGINEERING DECISION. No source requires any algorithm; `AMB-03` records
 * that authentication is undefined in every supplied document.
 *
 * INVARIANTS this module exists to guarantee:
 *   1. A plaintext password never leaves this module and is never stored.
 *   2. A hash is never compared with `===` — only `verify()` decides.
 *   3. `verifyDummy()` exists so an unknown account costs the same time as a
 *      known one (SECURITY_ARCHITECTURE §6 "constant-time credential
 *      comparison; identical response for unknown user vs wrong password").
 */
import { Algorithm, hash, verify } from '@node-rs/argon2';
import { config } from '../../config.js';

const OPTIONS = {
  algorithm: Algorithm.Argon2id,
  memoryCost: config.password.memoryCost,
  timeCost: config.password.timeCost,
  parallelism: config.password.parallelism,
} as const;

/** Marker every Argon2id encoded hash starts with. Asserted by tests. */
export const ARGON2ID_PREFIX = '$argon2id$';

export class WeakPasswordError extends Error {
  readonly code = 'WEAK_PASSWORD';
  constructor(message: string) {
    super(message);
    this.name = 'WeakPasswordError';
  }
}

/**
 * Length bounds only. Composition rules (upper/lower/digit/symbol) are
 * deliberately NOT enforced: they push users toward predictable substitutions,
 * and no source requirement asks for them. A minimum length is the control that
 * actually correlates with strength.
 */
export function assertPasswordAcceptable(plaintext: string): void {
  if (plaintext.length < config.password.minLength) {
    throw new WeakPasswordError(`password must be at least ${config.password.minLength} characters`);
  }
  if (plaintext.length > config.password.maxLength) {
    // An unbounded password is a memory-hard-hash DoS vector.
    throw new WeakPasswordError(`password must be at most ${config.password.maxLength} characters`);
  }
}

/** Returns the Argon2id encoded hash — salt and parameters included, per PHC. */
export async function hashPassword(plaintext: string): Promise<string> {
  assertPasswordAcceptable(plaintext);
  return hash(plaintext, OPTIONS);
}

/**
 * Never throws on a malformed or absent hash — a corrupt stored value must read
 * as "wrong password", not as a 500 that tells an attacker the record is odd.
 */
export async function verifyPassword(storedHash: string | null, plaintext: string): Promise<boolean> {
  if (storedHash === null || storedHash === '') return false;
  try {
    return await verify(storedHash, plaintext);
  } catch {
    return false;
  }
}

/**
 * A pre-computed hash of a value no caller can supply, used to spend the same
 * CPU on a nonexistent account as on a real one. Without this, "unknown email"
 * returns in ~0 ms and "wrong password" in ~50 ms, which enumerates accounts by
 * stopwatch regardless of how careful the response body is.
 */
let dummyHash: string | null = null;

export async function verifyDummy(plaintext: string): Promise<false> {
  dummyHash ??= await hash(`dummy:${Math.random()}:${Date.now()}`, OPTIONS);
  await verify(dummyHash, plaintext).catch(() => false);
  return false;
}

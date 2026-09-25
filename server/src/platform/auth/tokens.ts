/**
 * Opaque token minting and lookup hashing (ADR-006).
 *
 * 🟦 ENGINEERING DECISION.
 *
 * Session tokens and activation tokens are **opaque random bytes**, never JWTs
 * and never anything derived from the subject: an opaque token carries no
 * information to leak and cannot be forged without the database.
 *
 * Only the SHA-256 **hash** is stored. A stolen database dump therefore yields
 * no usable session cookie and no usable activation link.
 *
 * SHA-256 rather than Argon2 here is deliberate and is not a weakening: these
 * are 256-bit uniformly-random secrets, so there is nothing to brute-force and
 * no need for a slow KDF. Passwords are the opposite case and use Argon2id.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** 32 bytes = 256 bits of entropy, URL-safe so it can live in a link. */
export function mintToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Deterministic lookup key for a token. Stored; the token itself never is. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

/**
 * Length-safe constant-time comparison, for the CSRF double-submit check where
 * both sides are attacker-influenced strings.
 */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

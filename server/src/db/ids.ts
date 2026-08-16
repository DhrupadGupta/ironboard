/**
 * Deterministic identifiers and PRNG for DEVELOPMENT SEED DATA.
 *
 * ⚠️ SEED DATA ONLY. Production identifiers use CUID2 (see ADR-005 / schema).
 * Deterministic ids exist so the seed is byte-for-byte reproducible, which the
 * NFR verification thresholds (ADR-012) depend on.
 */

/** mulberry32 — small, fast, fully deterministic from a fixed seed. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const id = (prefix: string, n: number, width = 4): string =>
  `${prefix}_${String(n).padStart(width, '0')}`;

export function pick<T>(rng: () => number, xs: readonly T[]): T {
  const v = xs[Math.floor(rng() * xs.length)];
  if (v === undefined) throw new Error('pick from empty array');
  return v;
}

export const intBetween = (rng: () => number, lo: number, hi: number): number =>
  lo + Math.floor(rng() * (hi - lo + 1));

/** Fixed epoch so seeded dates never drift with wall-clock time. */
export const SEED_EPOCH = new Date('2026-08-16T00:00:00.000Z');

export const daysFromEpoch = (days: number): Date =>
  new Date(SEED_EPOCH.getTime() + days * 86_400_000);

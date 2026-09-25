/**
 * Injected dependencies for every auth service.
 *
 * 🟦 ENGINEERING DECISION, and it closes a debt item recorded in Phase 3:
 * *"Phase 4 report code should inject a clock rather than call `new Date()`
 * directly"* — the seed is anchored to a fixed epoch, so anything that compares
 * against wall-clock time must be able to have time supplied to it.
 *
 * `newId` is injected for the same reason the clock is: the test suite shares
 * one SQLite file and its isolation contract identifies test-created rows by the
 * `_test_` marker that `uid()` embeds. Services that minted ids internally would
 * write rows the purge cannot see, so the id factory is a seam, not a detail.
 */
import { createId } from '@paralleldrive/cuid2';
import type { PrismaClient } from '@prisma/client';
import { createLogger, type Logger } from '../logging/logger.js';

export interface AuthDeps {
  db: PrismaClient;
  /** Current time. Injected so expiry is testable without sleeping. */
  now: () => Date;
  /** Primary-key factory. Injected so tests can mint purgeable ids. */
  newId: (prefix: string) => string;
  log: Logger;
}

export function authDeps(db: PrismaClient, overrides: Partial<AuthDeps> = {}): AuthDeps {
  return {
    db,
    now: () => new Date(),
    newId: (prefix) => `${prefix}_${createId()}`,
    log: createLogger(),
    ...overrides,
  };
}

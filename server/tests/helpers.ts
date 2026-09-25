import { PrismaClient, Prisma } from '@prisma/client';

export const testDb = (): PrismaClient =>
  new PrismaClient({ datasources: { db: { url: 'file:./test.db' } } });

/** Assert that a promise rejects with a message matching `pattern`. */
export async function expectRejection(p: Promise<unknown>, pattern: RegExp): Promise<string> {
  try {
    await p;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!pattern.test(msg)) throw new Error(`rejected, but not matching ${pattern}:\n${msg}`);
    return msg;
  }
  throw new Error(`expected rejection matching ${pattern}, but the promise resolved`);
}

/**
 * Marker embedded in every id minted by `uid()`. It is what makes a row
 * created by a test distinguishable from a row created by the seed, and it is
 * the sole basis for the purge below — so no test may mint an id any other way.
 */
export const TEST_ID_MARKER = '_test_';

export const uid = (p: string): string => `${p}${TEST_ID_MARKER}${Math.random().toString(36).slice(2, 10)}`;

/* ------------------------------------------------------------------------- *
 * TEST ISOLATION
 *
 * The suite runs against ONE shared SQLite file (single-writer; see
 * vitest.config.ts `fileParallelism: false`). Rows a test leaves behind are
 * therefore visible to every later test file, which silently corrupts any
 * assertion that counts or sums seeded data — T-U-063 (seed determinism) most
 * of all, because it compares the database before and after a re-seed and the
 * re-seed truncates leaked rows away.
 *
 * The contract every test file honours:
 *   beforeAll -> expectPristine(db, 'entry')  proves the PREVIOUS file cleaned up
 *   afterAll  -> purgeTestRows(db)            removes what THIS file created
 *                expectPristine(db, 'exit')   proves the purge was complete
 *
 * The entry assertion is what makes the guarantee order-independent: Vitest
 * reorders files between runs (it sequences by cached duration), so a leak that
 * happens to be harmless in one ordering must still fail the run.
 * ------------------------------------------------------------------------- */

type AnyClient = PrismaClient | Prisma.TransactionClient;

/**
 * Every table carrying an `id` column, in FK-safe CHILD-FIRST order — the same
 * order `src/db/seed.ts` truncates in.
 *
 * Deleting in this order deliberately runs with `foreign_keys = ON`: a wrong
 * order fails loudly instead of silently orphaning rows.
 *
 * `RolePermission` is absent on purpose — it has a composite primary key and no
 * `id` column, so it cannot carry the marker and no test creates one.
 * `T-U-006` guards this list against schema drift.
 */
export const PURGE_ORDER = [
  'NotificationOutbox', 'AuditEvent', 'LedgerEntry', 'Refund', 'Receipt', 'Payment',
  'Invoice', 'MaintenanceSchedule', 'Equipment', 'AttendanceDaily', 'AttendanceEvent',
  'SessionSlot', 'ProgressEntry', 'PlanExercise', 'WorkoutPlan', 'Exercise',
  'TrainerAssignment', 'MembershipEvent', 'Membership', 'MembershipPlan', 'Prospect',
  'MedicalRestriction', 'Member', 'Session', 'Staff', 'Permission', 'Role', 'Branch',
] as const;

/** Tables with no `id` column, and therefore outside the marker mechanism. */
export const PURGE_EXEMPT = ['RolePermission'] as const;

/**
 * `_` is a single-character wildcard in SQL LIKE, so the marker is matched with
 * an explicit ESCAPE — otherwise `%_test_%` would also match e.g. `XtestY`.
 */
const MARKER_PREDICATE = `"id" LIKE '%\\_test\\_%' ESCAPE '\\'`;

/** Per-table count of rows minted by `uid()`. Tables with none are omitted. */
export async function findTestRows(client: AnyClient): Promise<Record<string, number>> {
  const residue: Record<string, number> = {};
  for (const table of PURGE_ORDER) {
    const rows = await client.$queryRawUnsafe<{ n: bigint | number }[]>(
      `SELECT COUNT(*) AS n FROM "${table}" WHERE ${MARKER_PREDICATE};`,
    );
    const n = Number(rows[0]?.n ?? 0);
    if (n > 0) residue[table] = n;
  }
  return residue;
}

/**
 * Deletes every marker row, children first. Returns the number of rows removed.
 *
 * A test row in `LedgerEntry` or `AuditEvent` would abort here, because both
 * carry an append-only DELETE trigger (ADR-011, ENH-13). That is correct and
 * intended: those tables cannot be cleaned up, so no test may write to them
 * outside a rolled-back transaction. With no matching rows the statement is a
 * no-op and the trigger never fires.
 */
export async function purgeTestRows(client: AnyClient): Promise<number> {
  let deleted = 0;
  for (const table of PURGE_ORDER) {
    deleted += await client.$executeRawUnsafe(`DELETE FROM "${table}" WHERE ${MARKER_PREDICATE};`);
  }
  return deleted;
}

/**
 * Throws — naming the offending tables — if any marker row exists.
 * `phase` is 'entry' (someone else leaked) or 'exit' (this file leaked).
 */
export async function expectPristine(client: AnyClient, phase: 'entry' | 'exit'): Promise<void> {
  const residue = await findTestRows(client);
  const offenders = Object.entries(residue);
  if (offenders.length === 0) return;

  const detail = offenders.map(([t, n]) => `${t}=${n}`).join(', ');
  const cause = phase === 'entry'
    ? 'a PREVIOUS test file did not clean up after itself'
    : 'THIS test file did not clean up after itself';
  throw new Error(
    `TEST ISOLATION VIOLATION at ${phase}: ${cause}. ` +
    `Leaked rows: ${detail}. ` +
    `Every test file must call purgeTestRows() in afterAll — see tests/helpers.ts.`,
  );
}

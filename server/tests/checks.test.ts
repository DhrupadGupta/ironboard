/**
 * T-U-030..T-U-032 — EXHAUSTIVE CHECK-constraint coverage.
 *
 * Why this file exists (Phase 3 self-review finding):
 * `constraints.test.ts` covers the CHECK constraints that carry a resolved
 * decision (B-05 states, ENH-20, NFR-24). It does NOT cover the other ~24.
 * A CHECK constraint that is never exercised is indistinguishable from one
 * that was never written, so every one of them is asserted here.
 *
 * Technique — "clone and violate":
 *   INSERT INTO T (cols...) SELECT <cols, some replaced by literals> FROM T ...
 * The clone inherits every NOT NULL column and every foreign key from a real
 * seeded row, so the ONLY thing wrong with the candidate row is the value the
 * case deliberately breaks. Nothing crosses into JS, so no Date/BigInt
 * round-tripping can corrupt the candidate.
 *
 * Each table also gets a POSITIVE CONTROL: the same clone with a legal value
 * must succeed. Without it, a rejection would prove nothing — a typo in the
 * clone SQL would look exactly like a working constraint. Positive controls
 * run inside a rolled-back transaction so they never pollute the seeded
 * aggregates other test files assert on.
 *
 * T-U-032 is a drift guard: it re-reads the live DDL and fails if any CHECK
 * constraint in the database has no case here.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, Prisma } from '@prisma/client';
import { testDb, expectRejection, uid } from './helpers.js';
import { applyPragmas } from '../src/db/client.js';

let db: PrismaClient;

/** Rows created here as clone sources / FK anchors, removed in afterAll. */
const cleanup: (() => Promise<unknown>)[] = [];

/** Ids allocated in beforeAll and referenced by the case table below. */
let emptyPlanId = '';
let sessionId = '';

type Client = PrismaClient | Prisma.TransactionClient;

/**
 * Clones one existing row of `table`, replacing the named columns with raw SQL
 * literals. Returns the promise so the caller decides whether to expect a
 * rejection or a success.
 */
async function insertClone(
  client: Client,
  table: string,
  overrides: Record<string, string>,
  where = '1=1',
): Promise<number> {
  const cols = await client.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info("${table}");`);
  if (cols.length === 0) throw new Error(`no such table: ${table}`);
  const names = cols.map((c) => `"${c.name}"`).join(', ');
  const select = cols.map((c) => overrides[c.name] ?? `"${c.name}"`).join(', ');
  const n = await client.$executeRawUnsafe(
    `INSERT INTO "${table}" (${names}) SELECT ${select} FROM "${table}" WHERE ${where} LIMIT 1;`,
  );
  if (n !== 1) throw new Error(`clone of ${table} inserted ${n} rows — no source row matched`);
  return n;
}

/** SQL string literal. */
const s = (v: string): string => `'${v.replace(/'/g, "''")}'`;

interface Case {
  /** Table the CHECK constraint lives on. */
  table: string;
  /** What the constraint protects, used as the test name. */
  constraint: string;
  /** Columns that must be replaced to keep the clone legal (ids, unique cols). */
  base: () => Record<string, string>;
  /** The single change that violates the constraint. */
  violation: Record<string, string>;
  /** A legal value for the same columns, used by the positive control. */
  legal: Record<string, string>;
  /** Restricts which seeded row is cloned. */
  where?: string;
}

/**
 * One entry per CHECK constraint in the migration. T-U-032 fails if this list
 * and the live schema ever disagree.
 */
const CASES: Case[] = [
  // --- identity & access ---------------------------------------------------
  {
    table: 'Branch', constraint: "status IN ('active','disabled')",
    base: () => ({ id: s(uid('brn')), code: s(uid('BR')) }),
    violation: { status: s('closed') }, legal: { status: s('disabled') },
  },
  {
    table: 'Staff', constraint: "status IN ('pending','active','disabled')",
    base: () => ({ id: s(uid('stf')), email: s(`${uid('e')}@example.invalid`), activationTokenHash: 'NULL' }),
    violation: { status: s('suspended') }, legal: { status: s('pending') },
  },
  {
    table: 'Session', constraint: "subjectType IN ('staff','member')",
    base: () => ({ id: s(uid('ses')), tokenHash: s(uid('tok')) }),
    violation: { subjectType: s('robot') }, legal: { subjectType: s('member') },
  },

  // --- members & health ----------------------------------------------------
  {
    table: 'MedicalRestriction', constraint: 'conditionCipher is non-empty (NFR-21)',
    base: () => ({ id: s(uid('mdr')) }),
    violation: { conditionCipher: s('') }, legal: { conditionCipher: s('DEV_SEED_PLACEHOLDER:x') },
  },

  // --- membership ----------------------------------------------------------
  {
    table: 'MembershipPlan', constraint: 'priceMinor >= 0 (NFR-24)',
    base: () => ({ id: s(uid('pln')), name: s(uid('Plan')) }),
    violation: { priceMinor: '-1' }, legal: { priceMinor: '0' },
  },
  {
    table: 'MembershipPlan', constraint: 'durationDays > 0',
    base: () => ({ id: s(uid('pln')), name: s(uid('Plan')) }),
    violation: { durationDays: '0' }, legal: { durationDays: '1' },
  },
  {
    // The partial unique index only covers ACTIVE, so every Membership clone is
    // pinned to a non-ACTIVE state to keep uniqueness out of the way.
    table: 'Membership', constraint: "state IN ('ACTIVE','EXPIRED','CANCELLED') (B-05)",
    base: () => ({ id: s(uid('mbs')), cancelledAt: 'NULL' }),
    violation: { state: s('EXPIRING') }, legal: { state: s('EXPIRED') },
  },
  {
    table: 'Membership', constraint: 'expiresAt > startsAt',
    base: () => ({ id: s(uid('mbs')), state: s('EXPIRED'), cancelledAt: 'NULL' }),
    violation: { expiresAt: '"startsAt"' }, legal: { expiresAt: '"startsAt" + 1' },
  },
  {
    table: 'Membership', constraint: "cancelledAt set iff state = 'CANCELLED' (B-05)",
    base: () => ({ id: s(uid('mbs')) }),
    violation: { state: s('CANCELLED'), cancelledAt: 'NULL' },
    legal: { state: s('CANCELLED'), cancelledAt: '1' },
  },
  {
    table: 'MembershipEvent', constraint: 'toState IN the three states (B-05)',
    base: () => ({ id: s(uid('mev')) }),
    violation: { toState: s('EXPIRING') }, legal: { toState: s('EXPIRED') },
  },
  {
    table: 'MembershipEvent', constraint: 'fromState IS NULL OR IN the three states (B-05)',
    base: () => ({ id: s(uid('mev')) }),
    violation: { fromState: s('EXPIRING') }, legal: { fromState: 'NULL' },
  },

  // --- training ------------------------------------------------------------
  {
    table: 'WorkoutPlan', constraint: 'version > 0 (NFR-09)',
    base: () => ({ id: s(uid('wkp')) }),
    violation: { version: '0' }, legal: { version: '2' },
  },
  {
    table: 'WorkoutPlan', constraint: 'isTemplate XOR memberId (ENH-08)',
    base: () => ({ id: s(uid('wkp')) }),
    violation: { isTemplate: '1' }, legal: { isTemplate: '0' },
    where: `"memberId" IS NOT NULL`,
  },
  {
    table: 'PlanExercise', constraint: 'sets > 0 (AC-09)',
    base: () => ({ id: s(uid('pex')), workoutPlanId: s(emptyPlanId) }),
    violation: { sets: '0' }, legal: { sets: '3' },
  },
  {
    table: 'PlanExercise', constraint: 'reps > 0 (AC-09)',
    base: () => ({ id: s(uid('pex')), workoutPlanId: s(emptyPlanId) }),
    violation: { reps: '0' }, legal: { reps: '10' },
  },
  {
    // revokedAt is forced non-null so the "one live assignment per pair"
    // partial index cannot fire before the CHECK.
    table: 'TrainerAssignment', constraint: "source IN ('workout_plan','pt_session','admin') (ENH-20)",
    base: () => ({ id: s(uid('tas')), revokedAt: '1' }),
    violation: { source: s('guess') }, legal: { source: s('admin') },
  },
  {
    table: 'SessionSlot', constraint: "kind IN ('trial','personal_training')",
    base: () => ({ id: s(uid('slt')) }),
    violation: { kind: s('massage') }, legal: { kind: s('trial') },
  },
  {
    table: 'SessionSlot', constraint: "status IN ('booked','completed','cancelled')",
    base: () => ({ id: s(uid('slt')) }),
    violation: { status: s('no_show') }, legal: { status: s('cancelled') },
  },
  {
    table: 'SessionSlot', constraint: 'endsAt > startsAt',
    base: () => ({ id: s(uid('slt')) }),
    violation: { endsAt: '"startsAt"' }, legal: { endsAt: '"startsAt" + 1' },
  },
  {
    table: 'SessionSlot', constraint: 'exactly one of memberId / prospectId',
    base: () => ({ id: s(uid('slt')) }),
    violation: { memberId: 'NULL', prospectId: 'NULL' },
    legal: { memberId: `(SELECT "id" FROM "Member" LIMIT 1)`, prospectId: 'NULL' },
  },

  // --- attendance ----------------------------------------------------------
  {
    // date is pushed to 2100 so the (date, branchId) unique index cannot fire.
    table: 'AttendanceDaily', constraint: 'visits >= 0 (NFR-14)',
    base: () => ({ id: s(uid('atd')), date: '4102444800000' }),
    violation: { visits: '-1' }, legal: { visits: '0' },
  },
  {
    table: 'AttendanceDaily', constraint: 'peakHour IS NULL OR 0..23',
    base: () => ({ id: s(uid('atd')), date: '4102444800000' }),
    violation: { peakHour: '24' }, legal: { peakHour: '23' },
  },

  // --- equipment -----------------------------------------------------------
  {
    table: 'Equipment', constraint: "status IN ('operational','in_maintenance','retired') (AC-13)",
    base: () => ({ id: s(uid('eqp')), assetCode: s(uid('A')) }),
    violation: { status: s('broken') }, legal: { status: s('retired') },
  },
  {
    table: 'MaintenanceSchedule', constraint: 'intervalDays > 0 (AC-13)',
    base: () => ({ id: s(uid('mts')) }),
    violation: { intervalDays: '0' }, legal: { intervalDays: '90' },
  },

  // --- money ---------------------------------------------------------------
  {
    table: 'Payment', constraint: "method IN ('cash','card','online') (AC-21)",
    base: () => ({ id: s(uid('pay')), idempotencyKey: 'NULL' }),
    violation: { method: s('crypto') }, legal: { method: s('online') },
  },
  {
    table: 'Payment', constraint: "status IN ('settled','failed')",
    base: () => ({ id: s(uid('pay')), idempotencyKey: 'NULL' }),
    violation: { status: s('pending') }, legal: { status: s('failed') },
  },
  {
    table: 'Payment', constraint: 'amountMinor > 0 (NFR-24)',
    base: () => ({ id: s(uid('pay')), idempotencyKey: 'NULL' }),
    violation: { amountMinor: '0' }, legal: { amountMinor: '1' },
  },
  {
    table: 'Invoice', constraint: "status IN ('open','paid','overdue','void') (AC-25)",
    base: () => ({ id: s(uid('inv')), number: s(uid('INV')), idempotencyKey: 'NULL' }),
    violation: { status: s('cancelled') }, legal: { status: s('void') },
  },
  {
    table: 'Invoice', constraint: 'amountMinor > 0 (NFR-24)',
    base: () => ({ id: s(uid('inv')), number: s(uid('INV')), idempotencyKey: 'NULL' }),
    violation: { amountMinor: '0' }, legal: { amountMinor: '1' },
  },
  {
    // Redirected onto a payment that carries no refund yet, so the
    // "refund total <= payment" trigger cannot fire ahead of the CHECK.
    table: 'Refund', constraint: 'amountMinor > 0 (AC-24, NFR-24)',
    base: () => ({
      id: s(uid('rfd')),
      paymentId: `(SELECT p."id" FROM "Payment" p
                    WHERE p."amountMinor" > 1000
                      AND NOT EXISTS (SELECT 1 FROM "Refund" r WHERE r."paymentId" = p."id")
                    LIMIT 1)`,
    }),
    violation: { amountMinor: '0' }, legal: { amountMinor: '1' },
  },
  {
    table: 'LedgerEntry', constraint: "kind IN ('payment','refund','charge') (ADR-011)",
    base: () => ({ id: s(uid('led')) }),
    violation: { kind: s('adjustment') }, legal: { kind: s('charge') },
  },
  {
    table: 'LedgerEntry', constraint: 'amountMinor <> 0 (ADR-011)',
    base: () => ({ id: s(uid('led')) }),
    violation: { amountMinor: '0' }, legal: { amountMinor: '-1' },
  },

  // --- platform ------------------------------------------------------------
  {
    table: 'AuditEvent', constraint: "actorType IN ('staff','member','system') (ENH-13)",
    base: () => ({ id: s(uid('aud')) }),
    violation: { actorType: s('daemon') }, legal: { actorType: s('system') },
  },
  {
    table: 'NotificationOutbox', constraint: "channel IN ('email','sms') (ADR-008)",
    base: () => ({ id: s(uid('ntf')) }),
    violation: { channel: s('push') }, legal: { channel: s('sms') },
  },
  {
    table: 'NotificationOutbox', constraint: "status IN ('pending','sent','failed')",
    base: () => ({ id: s(uid('ntf')) }),
    violation: { status: s('queued') }, legal: { status: s('failed') },
  },
  {
    table: 'NotificationOutbox', constraint: 'attempts >= 0',
    base: () => ({ id: s(uid('ntf')) }),
    violation: { attempts: '-1' }, legal: { attempts: '0' },
  },
];

beforeAll(async () => {
  db = testDb();
  await applyPragmas(db);

  // The seed creates no Session rows (nobody has logged in), so there is
  // nothing to clone. Create one legal row as the clone source.
  const staff = await db.staff.findFirstOrThrow();
  const session = await db.session.create({
    data: {
      id: uid('ses'), tokenHash: uid('tok'), subjectType: 'staff', subjectId: staff.id,
      expiresAt: new Date(Date.now() + 3_600_000),
    },
  });
  sessionId = session.id;
  cleanup.push(() => db.session.deleteMany({ where: { id: sessionId } }));

  // PlanExercise is unique on (workoutPlanId, exerciseId). Cloning a row back
  // into its own plan would trip that index instead of the CHECK, so the
  // clones are redirected into a plan that holds no exercises.
  const trainer = await db.staff.findFirstOrThrow({ where: { role: { key: 'trainer' } } });
  const plan = await db.workoutPlan.create({
    data: { id: uid('wkp'), trainerId: trainer.id, name: 'CHECK-probe plan', isTemplate: true },
  });
  emptyPlanId = plan.id;
  cleanup.push(() => db.workoutPlan.deleteMany({ where: { id: emptyPlanId } }));
});

afterAll(async () => {
  for (const fn of cleanup.reverse()) await fn();
  await db.$disconnect();
});

describe('T-U-030 every CHECK constraint rejects a violating row', () => {
  for (const c of CASES) {
    it(`${c.table}: ${c.constraint}`, async () => {
      await expectRejection(
        insertClone(db, c.table, { ...c.base(), ...c.violation }, c.where),
        /CHECK constraint failed/i,
      );
    });
  }
});

describe('T-U-031 positive control — the same clone with a legal value is accepted', () => {
  for (const c of CASES) {
    it(`${c.table}: ${c.constraint}`, async () => {
      // Rolled back: proves the clone SQL is sound without changing the data
      // that seed/aggregate assertions in other files depend on.
      const marker = 'ROLLBACK_POSITIVE_CONTROL';
      await expect(
        db.$transaction(async (tx) => {
          const n = await insertClone(tx, c.table, { ...c.base(), ...c.legal }, c.where);
          expect(n).toBe(1);
          throw new Error(marker);
        }),
      ).rejects.toThrow(marker);
    });
  }
});

describe('T-U-032 the case list covers the live schema', () => {
  it('every CHECK constraint in the database has a case above', async () => {
    const tables = await db.$queryRawUnsafe<{ name: string; sql: string }[]>(
      `SELECT name, sql FROM sqlite_master
        WHERE type = 'table' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%';`,
    );

    const inSchema: Record<string, number> = {};
    let total = 0;
    for (const t of tables) {
      const n = (t.sql.match(/\bCHECK\s*\(/gi) ?? []).length;
      if (n > 0) { inSchema[t.name] = n; total += n; }
    }

    const covered: Record<string, number> = {};
    for (const c of CASES) covered[c.table] = (covered[c.table] ?? 0) + 1;

    expect(covered).toEqual(inSchema);
    expect(CASES.length).toBe(total);
  });
});

/**
 * T-I-050..T-I-058 — B-03 branch scoping, ENH-20 assignment, money relationships.
 * DATABASE SUPPORT ONLY.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { testDb, purgeTestRows, expectPristine } from './helpers.js';
import { applyPragmas } from '../src/db/client.js';

let db: PrismaClient;

// This file is READ-ONLY, so its aggregate assertions below are also isolation
// detectors: a leaked row from any earlier file would break them. The entry
// assertion names the culprit before that happens.
beforeAll(async () => {
  db = testDb();
  await applyPragmas(db);
  await expectPristine(db, 'entry');
});
afterAll(async () => {
  await purgeTestRows(db);
  await expectPristine(db, 'exit');
  await db.$disconnect();
});

describe('T-I-050 B-03 branch scoping', () => {
  it('Member.homeBranchId and Staff.homeBranchId are NULLABLE', async () => {
    // PRAGMA returns BigInt via Prisma raw queries — coerce before comparing.
    const notNull = async (t: string, col: string): Promise<number> => {
      const cols = await db.$queryRawUnsafe<{ name: string; notnull: bigint }[]>(`PRAGMA table_info("${t}");`);
      return Number(cols.find((c) => c.name === col)?.notnull ?? -1);
    };
    expect(await notNull('Member', 'homeBranchId')).toBe(0);
    expect(await notNull('Staff', 'homeBranchId')).toBe(0);
  });

  it('Equipment.branchId and AttendanceEvent.branchId are NOT NULL', async () => {
    const notNull = async (t: string, col: string): Promise<number> => {
      const cols = await db.$queryRawUnsafe<{ name: string; notnull: bigint }[]>(`PRAGMA table_info("${t}");`);
      return Number(cols.find((c) => c.name === col)?.notnull ?? -1);
    };
    expect(await notNull('Equipment', 'branchId')).toBe(1);
    expect(await notNull('AttendanceEvent', 'branchId')).toBe(1);
    expect(await notNull('AttendanceDaily', 'branchId')).toBe(1);
  });

  it('MembershipPlan has NO branch column — plans are global', async () => {
    const cols = await db.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info("MembershipPlan");`);
    expect(cols.map((c) => c.name)).not.toContain('branchId');
    expect(cols.map((c) => c.name)).not.toContain('homeBranchId');
  });

  it('the seed actually exercises the nullable column', async () => {
    expect(await db.member.count({ where: { homeBranchId: null } })).toBeGreaterThan(0);
    expect(await db.staff.count({ where: { homeBranchId: null } })).toBeGreaterThan(0);
  });

  it('cross-branch reads are possible — branch is NOT a tenant boundary', async () => {
    const branches = await db.branch.findMany();
    expect(branches.length).toBeGreaterThan(1);
    const perBranch = await db.attendanceEvent.groupBy({ by: ['branchId'], _count: true });
    expect(perBranch.length).toBeGreaterThan(1);
    // A single query spans every branch — US-12 "monitored from one system".
    const all = await db.attendanceEvent.count();
    expect(all).toBe(perBranch.reduce((s, r) => s + r._count, 0));
  });
});

describe('T-I-051 ENH-20 trainer assignment supports NFR-10', () => {
  it('links trainer to member with provenance and revocation', async () => {
    const a = await db.trainerAssignment.findFirstOrThrow({ include: { trainer: true, member: true } });
    expect(a.trainerId).toBeTruthy();
    expect(a.memberId).toBeTruthy();
    expect(['workout_plan', 'pt_session', 'admin']).toContain(a.source);
    expect(a.revokedAt).toBeNull();
  });

  it('answers the NFR-10 authorization question with one indexed lookup', async () => {
    const a = await db.trainerAssignment.findFirstOrThrow({ where: { revokedAt: null } });
    const authorized = await db.trainerAssignment.findFirst({
      where: { trainerId: a.trainerId, memberId: a.memberId, revokedAt: null },
    });
    expect(authorized).not.toBeNull();
    const other = await db.staff.findFirstOrThrow({
      where: { role: { key: 'trainer' }, id: { not: a.trainerId } } });
    const denied = await db.trainerAssignment.findFirst({
      where: { trainerId: other.id, memberId: a.memberId, revokedAt: null } });
    expect(denied).toBeNull(); // an unassigned trainer has no authorization row
  });
});

describe('T-I-052 money relationships (NFR-24)', () => {
  it('all monetary columns are INTEGER — never a float', async () => {
    const check = async (table: string, col: string) => {
      const cols = await db.$queryRawUnsafe<{ name: string; type: string }[]>(`PRAGMA table_info("${table}");`);
      expect(cols.find((c) => c.name === col)?.type).toBe('INTEGER');
    };
    await check('MembershipPlan', 'priceMinor');
    await check('Payment', 'amountMinor');
    await check('Invoice', 'amountMinor');
    await check('Refund', 'amountMinor');
    await check('LedgerEntry', 'amountMinor');
  });

  it('every payment has exactly one receipt', async () => {
    // Unscoped: with the isolation contract in force there are no probe rows
    // left to exclude, so this now covers the whole table.
    const paid = await db.payment.count();
    const receipts = await db.receipt.count();
    expect(receipts).toBe(paid);
  });

  it('ledger totals reconcile with payments and refunds', async () => {
    const payTotal = await db.ledgerEntry.aggregate({ where: { kind: 'payment' }, _sum: { amountMinor: true } });
    const refTotal = await db.ledgerEntry.aggregate({ where: { kind: 'refund' }, _sum: { amountMinor: true } });
    const payments = await db.payment.aggregate({ _sum: { amountMinor: true } });
    const refunds = await db.refund.aggregate({ _sum: { amountMinor: true } });
    expect(payTotal._sum.amountMinor).toBe(payments._sum.amountMinor);
    // Refund ledger rows are stored negative.
    expect(-(refTotal._sum.amountMinor ?? 0)).toBe(refunds._sum.amountMinor);
  });

  it('no refund exceeds its payment', async () => {
    const rows = await db.$queryRawUnsafe<{ n: number }[]>(`
      SELECT COUNT(*) AS n FROM (
        SELECT r."paymentId", SUM(r."amountMinor") AS refunded, p."amountMinor" AS paid
        FROM "Refund" r JOIN "Payment" p ON p."id" = r."paymentId"
        GROUP BY r."paymentId" HAVING refunded > paid);`);
    expect(Number(rows[0]?.n)).toBe(0);
  });

  it('invoices link to member and optionally membership', async () => {
    const inv = await db.invoice.findFirstOrThrow({ include: { member: true, membership: true } });
    expect(inv.member).toBeTruthy();
    expect(inv.amountMinor).toBeGreaterThan(0);
  });
});

describe('T-I-053 attendance aggregation matches raw events', () => {
  it('AttendanceDaily totals equal the AttendanceEvent counts', async () => {
    const daily = await db.attendanceDaily.aggregate({ _sum: { visits: true } });
    const raw = await db.attendanceEvent.count(); // unscoped — see the receipt test above
    expect(daily._sum.visits).toBe(raw);
  });

  it('every peakHour is a valid hour', async () => {
    const bad = await db.attendanceDaily.count({ where: { OR: [{ peakHour: { lt: 0 } }, { peakHour: { gt: 23 } }] } });
    expect(bad).toBe(0);
  });
});

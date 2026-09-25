/**
 * T-U-020..T-U-035 — CHECK constraints, uniqueness, append-only triggers.
 * The point of these tests: invalid data is rejected BY THE DATABASE, not only
 * by application code that does not exist yet.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { testDb, expectRejection, uid, purgeTestRows, expectPristine } from './helpers.js';
import { applyPragmas } from '../src/db/client.js';

let db: PrismaClient;

// This file creates persistent probe rows on purpose — the rejections it
// asserts need real parents to hang off. They are removed at exit so no later
// file ever counts them. See tests/helpers.ts for the isolation contract.
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

const newMember = async (): Promise<string> => {
  const b = await db.branch.findFirstOrThrow();
  const m = await db.member.create({ data: { id: uid('mem'), memberCode: uid('C'),
    fullName: 'Constraint Probe', email: `${uid('e')}@example.invalid`, phone: '+910000000002',
    homeBranchId: b.id } });
  return m.id;
};

describe('T-U-020 membership state CHECK (B-05)', () => {
  it('rejects EXPIRING — it is a derived condition, never a stored state', async () => {
    const memberId = await newMember();
    const plan = await db.membershipPlan.findFirstOrThrow();
    await expectRejection(
      db.membership.create({ data: { id: uid('mbs'), memberId, planId: plan.id,
        state: 'EXPIRING', startsAt: new Date(), expiresAt: new Date(Date.now() + 86400000) } }),
      /CHECK constraint failed/i,
    );
  });

  it('rejects any state outside the three resolved values', async () => {
    const memberId = await newMember();
    const plan = await db.membershipPlan.findFirstOrThrow();
    for (const bad of ['active', 'Active', 'PENDING', 'SUSPENDED', '']) {
      await expectRejection(
        db.membership.create({ data: { id: uid('mbs'), memberId, planId: plan.id, state: bad,
          startsAt: new Date(), expiresAt: new Date(Date.now() + 86400000) } }),
        /CHECK constraint failed/i,
      );
    }
  });

  it('rejects expiresAt <= startsAt', async () => {
    const memberId = await newMember();
    const plan = await db.membershipPlan.findFirstOrThrow();
    const now = new Date();
    await expectRejection(
      db.membership.create({ data: { id: uid('mbs'), memberId, planId: plan.id, state: 'ACTIVE',
        startsAt: now, expiresAt: now } }),
      /CHECK constraint failed/i,
    );
  });

  it('requires cancelledAt exactly when state = CANCELLED', async () => {
    const memberId = await newMember();
    const plan = await db.membershipPlan.findFirstOrThrow();
    await expectRejection(
      db.membership.create({ data: { id: uid('mbs'), memberId, planId: plan.id, state: 'CANCELLED',
        startsAt: new Date(), expiresAt: new Date(Date.now() + 86400000), cancelledAt: null } }),
      /CHECK constraint failed/i,
    );
  });
});

describe('T-U-021 enumerated columns are constrained', () => {
  it('rejects an invalid Payment.method', async () => {
    const memberId = await newMember();
    await expectRejection(
      db.payment.create({ data: { id: uid('pay'), memberId, amountMinor: 100, method: 'crypto',
        status: 'settled', paidAt: new Date() } }),
      /CHECK constraint failed/i,
    );
  });

  it('rejects a non-positive Payment.amountMinor', async () => {
    const memberId = await newMember();
    for (const amt of [0, -1]) {
      await expectRejection(
        db.payment.create({ data: { id: uid('pay'), memberId, amountMinor: amt, method: 'cash',
          status: 'settled', paidAt: new Date() } }),
        /CHECK constraint failed/i,
      );
    }
  });

  it('rejects an invalid Equipment.status and TrainerAssignment.source', async () => {
    const b = await db.branch.findFirstOrThrow();
    await expectRejection(
      db.equipment.create({ data: { id: uid('eqp'), assetCode: uid('A'), name: 'X',
        branchId: b.id, status: 'broken' } }),
      /CHECK constraint failed/i,
    );
    const t = await db.staff.findFirstOrThrow({ where: { role: { key: 'trainer' } } });
    const memberId = await newMember();
    await expectRejection(
      db.trainerAssignment.create({ data: { id: uid('tas'), trainerId: t.id, memberId, source: 'guess' } }),
      /CHECK constraint failed/i,
    );
  });

  it('rejects a SessionSlot with both or neither of member/prospect', async () => {
    const memberId = await newMember();
    const p = await db.prospect.findFirstOrThrow();
    const now = new Date();
    const later = new Date(now.getTime() + 3600000);
    await expectRejection(
      db.sessionSlot.create({ data: { id: uid('slt'), kind: 'trial', memberId, prospectId: p.id,
        startsAt: now, endsAt: later, status: 'booked' } }),
      /CHECK constraint failed/i,
    );
    await expectRejection(
      db.sessionSlot.create({ data: { id: uid('slt'), kind: 'trial', startsAt: now, endsAt: later,
        status: 'booked' } }),
      /CHECK constraint failed/i,
    );
  });

  it('rejects a non-template WorkoutPlan without a member', async () => {
    const t = await db.staff.findFirstOrThrow({ where: { role: { key: 'trainer' } } });
    await expectRejection(
      db.workoutPlan.create({ data: { id: uid('wkp'), memberId: null, trainerId: t.id,
        name: 'Orphan', isTemplate: false } }),
      /CHECK constraint failed/i,
    );
  });
});

describe('T-U-022 uniqueness', () => {
  it('rejects a duplicate member email and memberCode', async () => {
    const existing = await db.member.findFirstOrThrow();
    await expectRejection(
      db.member.create({ data: { id: uid('mem'), memberCode: uid('C'), fullName: 'Dup',
        email: existing.email, phone: '+910000000003' } }),
      /Unique constraint/i,
    );
    await expectRejection(
      db.member.create({ data: { id: uid('mem'), memberCode: existing.memberCode, fullName: 'Dup',
        email: `${uid('e')}@example.invalid`, phone: '+910000000004' } }),
      /Unique constraint/i,
    );
  });

  it('allows at most ONE ACTIVE membership per member (B-05 partial index)', async () => {
    const memberId = await newMember();
    const plan = await db.membershipPlan.findFirstOrThrow();
    const mk = (state: string) => ({ id: uid('mbs'), memberId, planId: plan.id, state,
      startsAt: new Date(), expiresAt: new Date(Date.now() + 86400000),
      cancelledAt: state === 'CANCELLED' ? new Date() : null });
    await db.membership.create({ data: mk('ACTIVE') });
    await expectRejection(db.membership.create({ data: mk('ACTIVE') }), /Unique constraint/i);
    // Non-ACTIVE rows are unaffected by the partial index.
    await db.membership.create({ data: mk('EXPIRED') });
    expect(await db.membership.count({ where: { memberId } })).toBe(2);
  });

  it('allows at most one LIVE trainer assignment per pair (ENH-20)', async () => {
    const memberId = await newMember();
    const t = await db.staff.findFirstOrThrow({ where: { role: { key: 'trainer' } } });
    await db.trainerAssignment.create({ data: { id: uid('tas'), trainerId: t.id, memberId, source: 'pt_session' } });
    await expectRejection(
      db.trainerAssignment.create({ data: { id: uid('tas'), trainerId: t.id, memberId, source: 'workout_plan' } }),
      /Unique constraint/i,
    );
    // Revoking frees the pair.
    await db.trainerAssignment.updateMany({ where: { trainerId: t.id, memberId }, data: { revokedAt: new Date() } });
    await db.trainerAssignment.create({ data: { id: uid('tas'), trainerId: t.id, memberId, source: 'admin' } });
    expect(await db.trainerAssignment.count({ where: { trainerId: t.id, memberId, revokedAt: null } })).toBe(1);
  });

  it('rejects a duplicate idempotency key on Payment (NFR-22 pattern)', async () => {
    const memberId = await newMember();
    const key = uid('idem');
    await db.payment.create({ data: { id: uid('pay'), memberId, amountMinor: 500, method: 'card',
      status: 'settled', paidAt: new Date(), idempotencyKey: key } });
    await expectRejection(
      db.payment.create({ data: { id: uid('pay'), memberId, amountMinor: 500, method: 'card',
        status: 'settled', paidAt: new Date(), idempotencyKey: key } }),
      /Unique constraint/i,
    );
  });

  it('rejects a second receipt for the same payment', async () => {
    const p = await db.payment.findFirstOrThrow({ where: { receipt: { isNot: null } } });
    await expectRejection(
      db.receipt.create({ data: { id: uid('rcp'), paymentId: p.id, receiptNumber: uid('R') } }),
      /Unique constraint/i,
    );
  });
});

describe('T-U-023 append-only triggers (ADR-011, ENH-13)', () => {
  /**
   * ⚠️ KNOWN LIMITATION (recorded in DATABASE_DESIGN.md):
   * Prisma maps SQLite SQLITE_CONSTRAINT_TRIGGER (1811) onto its generic
   * P2003 "Foreign key constraint violated", DISCARDING the RAISE(ABORT) text.
   * So each trigger is asserted twice:
   *   (a) through Prisma  -> the write is rejected (behaviour is correct);
   *   (b) through raw SQL -> the real message is visible and asserted.
   * The service layer must therefore NEVER branch on the Prisma message text.
   */
  it('blocks UPDATE and DELETE on LedgerEntry', async () => {
    const e = await db.ledgerEntry.findFirstOrThrow();
    await expectRejection(db.ledgerEntry.update({ where: { id: e.id }, data: { amountMinor: 1 } }), /./);
    await expectRejection(db.ledgerEntry.delete({ where: { id: e.id } }), /./);
    await expectRejection(
      db.$executeRawUnsafe(`UPDATE "LedgerEntry" SET "amountMinor" = 1 WHERE "id" = ?;`, e.id),
      /LedgerEntry is append-only/i);
    await expectRejection(
      db.$executeRawUnsafe(`DELETE FROM "LedgerEntry" WHERE "id" = ?;`, e.id),
      /LedgerEntry is append-only/i);
    expect(await db.ledgerEntry.count({ where: { id: e.id } })).toBe(1); // survived
  });

  it('blocks UPDATE and DELETE on AuditEvent', async () => {
    const e = await db.auditEvent.findFirstOrThrow();
    await expectRejection(db.auditEvent.update({ where: { id: e.id }, data: { action: 'tamper' } }), /./);
    await expectRejection(
      db.$executeRawUnsafe(`UPDATE "AuditEvent" SET "action" = 'tamper' WHERE "id" = ?;`, e.id),
      /AuditEvent is append-only/i);
    await expectRejection(
      db.$executeRawUnsafe(`DELETE FROM "AuditEvent" WHERE "id" = ?;`, e.id),
      /AuditEvent is append-only/i);
    expect(await db.auditEvent.count({ where: { id: e.id } })).toBe(1);
  });

  it('blocks UPDATE on MembershipEvent history', async () => {
    const e = await db.membershipEvent.findFirstOrThrow();
    await expectRejection(db.membershipEvent.update({ where: { id: e.id }, data: { toState: 'ACTIVE' } }), /./);
    await expectRejection(
      db.$executeRawUnsafe(`UPDATE "MembershipEvent" SET "toState" = 'ACTIVE' WHERE "id" = ?;`, e.id),
      /MembershipEvent is append-only/i);
  });
});

describe('T-U-024 refund total may never exceed the payment (NFR-24)', () => {
  it('rejects an over-refund', async () => {
    const memberId = await newMember();
    const pay = await db.payment.create({ data: { id: uid('pay'), memberId, amountMinor: 1000,
      method: 'cash', status: 'settled', paidAt: new Date() } });
    await db.refund.create({ data: { id: uid('rfd'), paymentId: pay.id, amountMinor: 600,
      approvedAt: new Date(), approvalReference: 'TEST-1' } });
    // Prisma discards the trigger message (see T-U-023) — assert both layers.
    await expectRejection(
      db.refund.create({ data: { id: uid('rfd'), paymentId: pay.id, amountMinor: 500,
        approvedAt: new Date(), approvalReference: 'TEST-2' } }), /./);
    await expectRejection(
      db.$executeRawUnsafe(
        `INSERT INTO "Refund" ("id","paymentId","amountMinor","approvedAt","approvalReference","processedAt")
         VALUES (?, ?, 500, 1, 'TEST-2', 1);`, uid('rfd'), pay.id),
      /Refund total exceeds payment amount/i);
    // A refund that fits is accepted.
    await db.refund.create({ data: { id: uid('rfd'), paymentId: pay.id, amountMinor: 400,
      approvedAt: new Date(), approvalReference: 'TEST-3' } });
    const total = await db.refund.aggregate({ where: { paymentId: pay.id }, _sum: { amountMinor: true } });
    expect(total._sum.amountMinor).toBe(1000);
  });
});

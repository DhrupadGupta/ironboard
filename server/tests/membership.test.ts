/**
 * T-U-040..T-I-045 — B-05 state machine + ENH-19 membership creation.
 *
 * ⚠️ These verify DATABASE SUPPORT ONLY. AC-17/AC-18/AC-19/AC-20 are NOT
 * verified here — they need the service + API layers, which do not exist yet.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { testDb, expectRejection, uid, purgeTestRows, expectPristine } from './helpers.js';
import { applyPragmas } from '../src/db/client.js';

let db: PrismaClient;

// Every transition test needs its own membership, so this file creates rows on
// purpose and removes them at exit. See tests/helpers.ts for the contract.
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

async function freshMembership(state = 'ACTIVE') {
  const b = await db.branch.findFirstOrThrow();
  const plan = await db.membershipPlan.findFirstOrThrow();
  const m = await db.member.create({ data: { id: uid('mem'), memberCode: uid('C'),
    fullName: 'State Probe', email: `${uid('e')}@example.invalid`, phone: '+910000000005',
    homeBranchId: b.id } });
  return db.membership.create({ data: { id: uid('mbs'), memberId: m.id, planId: plan.id, state,
    startsAt: new Date(Date.now() - 86400000), expiresAt: new Date(Date.now() + 86400000),
    cancelledAt: state === 'CANCELLED' ? new Date() : null } });
}

describe('T-U-040 exactly three states exist (B-05)', () => {
  it('seeded data contains only ACTIVE, EXPIRED, CANCELLED', async () => {
    const groups = await db.membership.groupBy({ by: ['state'], _count: true });
    const states = groups.map((g) => g.state).sort();
    expect(states).toEqual(['ACTIVE', 'CANCELLED', 'EXPIRED']);
    expect(states).not.toContain('EXPIRING');
  });
});

describe('T-U-041 valid transitions are permitted', () => {
  it('ACTIVE -> EXPIRED (T2)', async () => {
    const ms = await freshMembership('ACTIVE');
    const out = await db.membership.update({ where: { id: ms.id }, data: { state: 'EXPIRED' } });
    expect(out.state).toBe('EXPIRED');
  });

  it('ACTIVE -> CANCELLED (T3)', async () => {
    const ms = await freshMembership('ACTIVE');
    const out = await db.membership.update({ where: { id: ms.id },
      data: { state: 'CANCELLED', cancelledAt: new Date() } });
    expect(out.state).toBe('CANCELLED');
  });

  it('EXPIRED -> ACTIVE (T5, renewal)', async () => {
    const ms = await freshMembership('EXPIRED');
    const out = await db.membership.update({ where: { id: ms.id },
      data: { state: 'ACTIVE', expiresAt: new Date(Date.now() + 30 * 86400000) } });
    expect(out.state).toBe('ACTIVE');
  });

  it('EXPIRED -> CANCELLED (T4)', async () => {
    const ms = await freshMembership('EXPIRED');
    const out = await db.membership.update({ where: { id: ms.id },
      data: { state: 'CANCELLED', cancelledAt: new Date() } });
    expect(out.state).toBe('CANCELLED');
  });

  it('ACTIVE -> ACTIVE extension (T6) is not a state change and is allowed', async () => {
    const ms = await freshMembership('ACTIVE');
    const newExpiry = new Date(Date.now() + 60 * 86400000);
    const out = await db.membership.update({ where: { id: ms.id }, data: { expiresAt: newExpiry } });
    expect(out.state).toBe('ACTIVE');
    expect(out.expiresAt.getTime()).toBe(newExpiry.getTime());
  });
});

describe('T-U-042 invalid transitions are rejected by the database', () => {
  it('CANCELLED is terminal', async () => {
    const ms = await freshMembership('CANCELLED');
    for (const target of ['ACTIVE', 'EXPIRED']) {
      // Prisma discards the trigger text (see T-U-023) — assert both layers.
      await expectRejection(db.membership.update({ where: { id: ms.id }, data: { state: target } }), /./);
      await expectRejection(
        db.$executeRawUnsafe(`UPDATE "Membership" SET "state" = ? WHERE "id" = ?;`, target, ms.id),
        /CANCELLED is terminal/i);
    }
    const after = await db.membership.findUniqueOrThrow({ where: { id: ms.id } });
    expect(after.state).toBe('CANCELLED'); // unchanged
  });
});

describe('T-I-043 ENH-19 membership creation', () => {
  it('creates an ACTIVE membership with expiresAt = startsAt + plan.durationDays', async () => {
    const b = await db.branch.findFirstOrThrow();
    const plan = await db.membershipPlan.findFirstOrThrow({ where: { published: true } });
    const member = await db.member.create({ data: { id: uid('mem'), memberCode: uid('C'),
      fullName: 'ENH-19 Probe', email: `${uid('e')}@example.invalid`, phone: '+910000000006',
      homeBranchId: b.id } });

    const startsAt = new Date('2026-09-01T00:00:00.000Z');
    const expiresAt = new Date(startsAt.getTime() + plan.durationDays * 86_400_000);

    // ENH-19: one insert, plus the T1 history row. No payment required.
    const [ms] = await db.$transaction([
      db.membership.create({ data: { id: uid('mbs'), memberId: member.id, planId: plan.id,
        state: 'ACTIVE', startsAt, expiresAt } }),
    ]);
    await db.membershipEvent.create({ data: { id: uid('mev'), membershipId: ms.id,
      fromState: null, toState: 'ACTIVE', reason: 'ENH-19 membership created' } });

    expect(ms.state).toBe('ACTIVE');
    expect(ms.expiresAt.getTime() - ms.startsAt.getTime()).toBe(plan.durationDays * 86_400_000);

    // No payment is linked — initial creation is NOT payment-gated.
    expect(await db.payment.count({ where: { membershipId: ms.id } })).toBe(0);

    const ev = await db.membershipEvent.findFirstOrThrow({ where: { membershipId: ms.id } });
    expect(ev.fromState).toBeNull();
    expect(ev.toState).toBe('ACTIVE');
  });
});

describe('T-U-044 "expiring soon" is DERIVED, never stored (B-05, AC-19)', () => {
  it('is expressible as a query over expiresAt with no EXPIRING state', async () => {
    const now = new Date('2026-08-16T00:00:00.000Z');
    const windowEnd = new Date(now.getTime() + 7 * 86_400_000);
    const expiring = await db.membership.count({
      where: { state: 'ACTIVE', expiresAt: { gte: now, lte: windowEnd } },
    });
    expect(expiring).toBeGreaterThan(0); // seed guarantees matches
    // The column itself never holds the word.
    const rows = await db.$queryRawUnsafe<{ n: number }[]>(
      `SELECT COUNT(*) AS n FROM "Membership" WHERE "state" = 'EXPIRING';`);
    expect(Number(rows[0]?.n)).toBe(0);
  });
});

describe('T-U-045 membership history is retained', () => {
  it('every SEEDED membership has at least a creation event', async () => {
    // Scoped to seed rows because EARLIER TESTS IN THIS FILE create bare
    // memberships to drive transitions. Cross-file contamination cannot reach
    // here — the entry assertion in beforeAll would have failed first.
    const rows = await db.$queryRawUnsafe<{ n: bigint }[]>(`
      SELECT COUNT(*) AS n FROM "Membership" m
      WHERE m."id" NOT LIKE '%_test_%'
        AND NOT EXISTS (SELECT 1 FROM "MembershipEvent" e WHERE e."membershipId" = m."id");`);
    expect(Number(rows[0]?.n)).toBe(0);
  });
});

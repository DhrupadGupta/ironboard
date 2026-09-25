/**
 * T-U-001..T-U-010 — schema, pragmas, foreign keys, indexes.
 * Verifies DATABASE SUPPORT ONLY. No acceptance criterion is verified here.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  testDb, expectRejection, uid, purgeTestRows, expectPristine, PURGE_ORDER, PURGE_EXEMPT,
} from './helpers.js';
import { applyPragmas, readPragmas } from '../src/db/client.js';

let db: PrismaClient;

// The cascade/set-null tests create rows and delete them inline; the purge at
// exit is the backstop that proves nothing was missed.
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

describe('T-U-001 migration applied from scratch', () => {
  it('creates all 29 tables', async () => {
    const rows = await db.$queryRawUnsafe<{ name: string }[]>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name;`,
    );
    const names = rows.map((r) => r.name);
    const expected = ['Branch','Role','Permission','RolePermission','Staff','Session','Member',
      'MedicalRestriction','Prospect','MembershipPlan','Membership','MembershipEvent','WorkoutPlan',
      'Exercise','PlanExercise','ProgressEntry','TrainerAssignment','SessionSlot','AttendanceEvent',
      'AttendanceDaily','Equipment','MaintenanceSchedule','Payment','Receipt','Invoice','Refund',
      'LedgerEntry','AuditEvent','NotificationOutbox'];
    for (const t of expected) expect(names, `missing table ${t}`).toContain(t);
    // Exact, not "at least": an unlisted table means the schema drifted.
    expect(names.sort()).toEqual([...expected].sort());
  });

  it('records the migration as applied', async () => {
    const rows = await db.$queryRawUnsafe<{ migration_name: string; finished_at: unknown }[]>(
      `SELECT migration_name, finished_at FROM _prisma_migrations;`);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows.every((r) => r.finished_at !== null)).toBe(true);
  });
});

describe('T-U-002 pragmas', () => {
  it('foreign_keys ON, WAL, synchronous FULL', async () => {
    const p = await readPragmas(db);
    expect(p.foreignKeys).toBe(1);
    expect(p.journalMode.toLowerCase()).toBe('wal');
    expect(p.synchronous).toBe(2); // FULL — required by the NFR-07 threshold
  });
});

describe('T-U-003 foreign keys are enforced', () => {
  it('rejects an AttendanceEvent with an unknown branchId', async () => {
    await expectRejection(
      db.attendanceEvent.create({ data: { id: uid('att'), memberId: (await db.member.findFirstOrThrow()).id,
        branchId: 'brn_does_not_exist', checkedInAt: new Date(), source: 'test' } }),
      /Foreign key constraint|violat/i,
    );
  });

  it('rejects a Membership with an unknown planId', async () => {
    await expectRejection(
      db.membership.create({ data: { id: uid('mbs'), memberId: (await db.member.findFirstOrThrow()).id,
        planId: 'pln_nope', state: 'ACTIVE', startsAt: new Date(), expiresAt: new Date(Date.now() + 86400000) } }),
      /Foreign key constraint|violat/i,
    );
  });
});

describe('T-U-004 cascade and restrict behaviour', () => {
  it('CASCADE: deleting a member removes its memberships and attendance', async () => {
    const branch = await db.branch.findFirstOrThrow();
    const plan = await db.membershipPlan.findFirstOrThrow();
    const m = await db.member.create({ data: { id: uid('mem'), memberCode: uid('C'),
      fullName: 'Cascade Probe', email: `${uid('e')}@example.invalid`, phone: '+910000000000',
      homeBranchId: branch.id } });
    await db.membership.create({ data: { id: uid('mbs'), memberId: m.id, planId: plan.id,
      state: 'ACTIVE', startsAt: new Date(), expiresAt: new Date(Date.now() + 86400000) } });
    await db.attendanceEvent.create({ data: { id: uid('att'), memberId: m.id, branchId: branch.id,
      checkedInAt: new Date(), source: 'test' } });

    await db.member.delete({ where: { id: m.id } });
    expect(await db.membership.count({ where: { memberId: m.id } })).toBe(0);
    expect(await db.attendanceEvent.count({ where: { memberId: m.id } })).toBe(0);
  });

  it('RESTRICT: a branch with equipment cannot be deleted', async () => {
    const eq = await db.equipment.findFirstOrThrow();
    await expectRejection(db.branch.delete({ where: { id: eq.branchId } }),
      /Foreign key constraint|violat/i);
  });

  it('RESTRICT: a member with payments cannot be deleted', async () => {
    const pay = await db.payment.findFirstOrThrow();
    await expectRejection(db.member.delete({ where: { id: pay.memberId } }),
      /Foreign key constraint|violat/i);
  });

  it('SET NULL: disabling a branch reference nulls Member.homeBranchId', async () => {
    const b = await db.branch.create({ data: { id: uid('brn'), code: uid('B').slice(0, 12), name: 'Temp' } });
    const m = await db.member.create({ data: { id: uid('mem'), memberCode: uid('C'),
      fullName: 'SetNull Probe', email: `${uid('e')}@example.invalid`, phone: '+910000000001',
      homeBranchId: b.id } });
    await db.branch.delete({ where: { id: b.id } });
    const after = await db.member.findUniqueOrThrow({ where: { id: m.id } });
    expect(after.homeBranchId).toBeNull(); // B-03: nullable is meaningful
    await db.member.delete({ where: { id: m.id } });
  });
});

describe('T-U-005 indexes exist for the NFR budgets', () => {
  it('has the indexes the report thresholds depend on', async () => {
    const rows = await db.$queryRawUnsafe<{ name: string }[]>(
      `SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';`);
    const idx = rows.map((r) => r.name).join(' ');
    // NFR-14 attendance report, NFR-23 revenue report, AC-20 status filter, AC-19 sweep
    expect(idx).toMatch(/AttendanceDaily_date_branchId_key/);
    expect(idx).toMatch(/LedgerEntry_occurredAt_kind_idx/);
    expect(idx).toMatch(/Membership_memberId_state_idx/);
    expect(idx).toMatch(/Membership_state_expiresAt_idx/);
    expect(idx).toMatch(/TrainerAssignment_trainerId_memberId_idx/);
    expect(idx).toMatch(/Membership_one_active_per_member/);
    expect(idx).toMatch(/TrainerAssignment_one_live_per_pair/);
  });
});

describe('T-U-006 the isolation purge list covers the live schema', () => {
  it('PURGE_ORDER + PURGE_EXEMPT names every table, exactly once', async () => {
    const rows = await db.$queryRawUnsafe<{ name: string }[]>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%';`);
    const live = rows.map((r) => r.name).sort();
    const listed = [...PURGE_ORDER, ...PURGE_EXEMPT].sort();
    // A table added to the schema but not to PURGE_ORDER would leak silently:
    // its rows would never be purged and never be counted as residue.
    expect(listed).toEqual(live);
    expect(new Set(listed).size).toBe(listed.length);
  });

  it('every table in PURGE_ORDER really has an id column, and the exempt ones do not', async () => {
    for (const t of PURGE_ORDER) {
      const cols = await db.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info("${t}");`);
      expect(cols.map((c) => c.name), `${t} has no id column`).toContain('id');
    }
    for (const t of PURGE_EXEMPT) {
      const cols = await db.$queryRawUnsafe<{ name: string }[]>(`PRAGMA table_info("${t}");`);
      expect(cols.map((c) => c.name), `${t} has an id and should be purged`).not.toContain('id');
    }
  });
});

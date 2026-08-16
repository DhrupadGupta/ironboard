/**
 * T-U-060..T-U-066 — DEVELOPMENT SEED DATA (ENH-16).
 * Determinism, scale against the ADR-012 ENGINEERING VERIFICATION THRESHOLD,
 * and the guarantee that no real personal data or usable credential is present.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { testDb } from './helpers.js';
import { applyPragmas } from '../src/db/client.js';

const serverRoot = resolve(import.meta.dirname, '..');
let db: PrismaClient;
beforeAll(async () => { db = testDb(); await applyPragmas(db); });
afterAll(async () => { await db.$disconnect(); });

describe('T-U-060 seed scale matches ADR-012 (student/college project)', () => {
  it('3 branches, 1000 members, 5 plans, 90 days of attendance', async () => {
    expect(await db.branch.count()).toBe(3);
    expect(await db.membershipPlan.count()).toBe(5);
    // Tests in other files add probe members; assert the seed floor.
    expect(await db.member.count()).toBeGreaterThanOrEqual(1000);
    // Prisma stores DateTime as INTEGER epoch-milliseconds in SQLite, so
    // date() needs an explicit conversion — date("col") alone yields NULL.
    const days = await db.$queryRawUnsafe<{ n: bigint }[]>(
      `SELECT COUNT(DISTINCT date("checkedInAt"/1000, 'unixepoch')) AS n FROM "AttendanceEvent";`);
    expect(Number(days[0]?.n)).toBeGreaterThanOrEqual(85);
  });

  it('is NOT production scale — deliberately bounded', async () => {
    expect(await db.member.count()).toBeLessThan(5_000);
    expect(await db.attendanceEvent.count()).toBeLessThan(100_000);
  });
});

describe('T-U-061 seed populates every entity the phase requires', () => {
  it('has rows in all 26 tables', async () => {
    const counts: Record<string, number> = {
      Branch: await db.branch.count(), Role: await db.role.count(),
      Permission: await db.permission.count(), RolePermission: await db.rolePermission.count(),
      Staff: await db.staff.count(), Member: await db.member.count(),
      MembershipPlan: await db.membershipPlan.count(), Membership: await db.membership.count(),
      MembershipEvent: await db.membershipEvent.count(), TrainerAssignment: await db.trainerAssignment.count(),
      WorkoutPlan: await db.workoutPlan.count(), Exercise: await db.exercise.count(),
      PlanExercise: await db.planExercise.count(), ProgressEntry: await db.progressEntry.count(),
      MedicalRestriction: await db.medicalRestriction.count(), Prospect: await db.prospect.count(),
      SessionSlot: await db.sessionSlot.count(), AttendanceEvent: await db.attendanceEvent.count(),
      AttendanceDaily: await db.attendanceDaily.count(), Equipment: await db.equipment.count(),
      MaintenanceSchedule: await db.maintenanceSchedule.count(), Payment: await db.payment.count(),
      Receipt: await db.receipt.count(), Invoice: await db.invoice.count(),
      Refund: await db.refund.count(), LedgerEntry: await db.ledgerEntry.count(),
      AuditEvent: await db.auditEvent.count(), NotificationOutbox: await db.notificationOutbox.count(),
    };
    for (const [t, n] of Object.entries(counts)) expect(n, `${t} is empty`).toBeGreaterThan(0);
  });

  it('covers the six roles including Member (ENH-01)', async () => {
    const keys = (await db.role.findMany()).map((r) => r.key).sort();
    expect(keys).toEqual(['accounting_executive','administrator','member','membership_manager',
      'receptionist','trainer']);
  });

  it('includes a pending staff account so AC-11 has a subject', async () => {
    expect(await db.staff.count({ where: { status: 'pending' } })).toBeGreaterThan(0);
    expect(await db.staff.count({ where: { approvedAt: { not: null } } })).toBeGreaterThan(0);
  });
});

describe('T-U-062 DEVELOPMENT SEED DATA is clearly not production data', () => {
  it('contains no real credential — only the placeholder marker', async () => {
    const staff = await db.staff.findMany({ select: { passwordHash: true } });
    for (const s of staff) {
      if (s.passwordHash !== null) expect(s.passwordHash).toBe('DEV_SEED_NOT_A_REAL_HASH');
    }
    const members = await db.member.findMany({ select: { passwordHash: true } });
    expect(members.every((m) => m.passwordHash === null)).toBe(true);
  });

  it('uses only reserved, non-routable example domains', async () => {
    const emails = [
      ...(await db.member.findMany({ select: { email: true } })).map((m) => m.email),
      ...(await db.staff.findMany({ select: { email: true } })).map((s) => s.email),
    ];
    // .invalid is reserved by RFC 2606 and can never resolve.
    expect(emails.every((e) => e.endsWith('.invalid'))).toBe(true);
  });

  it('medical values are placeholders, not real encrypted data', async () => {
    const rows = await db.medicalRestriction.findMany({ select: { conditionCipher: true } });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.conditionCipher.startsWith('DEV_SEED_PLACEHOLDER:'))).toBe(true);
  });
});

describe('T-U-063 seeding is deterministic and reproducible', () => {
  it('re-running the seed produces identical content', async () => {
    const fingerprint = async (): Promise<string> => {
      const rows = await db.$queryRawUnsafe<Record<string, unknown>[]>(`
        SELECT (SELECT COUNT(*) FROM "Member") AS members,
               (SELECT COUNT(*) FROM "Membership") AS memberships,
               (SELECT COUNT(*) FROM "AttendanceEvent") AS attendance,
               (SELECT COUNT(*) FROM "Payment") AS payments,
               (SELECT SUM("amountMinor") FROM "Payment") AS paymentTotal,
               (SELECT SUM("amountMinor") FROM "LedgerEntry") AS ledgerTotal,
               (SELECT group_concat("memberCode") FROM (SELECT "memberCode" FROM "Member" ORDER BY "memberCode" LIMIT 25)) AS codes,
               (SELECT group_concat("state") FROM (SELECT "state" FROM "Membership" ORDER BY "id" LIMIT 50)) AS states;`);
      // Raw aggregates come back as BigInt — JSON.stringify cannot serialise it.
      return JSON.stringify(rows[0], (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
    };

    const before = await fingerprint();
    execFileSync('npx', ['tsx', 'src/db/seed.ts'], {
      cwd: serverRoot, env: { ...process.env, DATABASE_URL: 'file:./test.db' }, stdio: 'pipe',
    });
    const after = await fingerprint();
    expect(after).toBe(before);
  });
});

describe('T-U-064 referential integrity across the seeded dataset', () => {
  it('SQLite reports no foreign key violations', async () => {
    const rows = await db.$queryRawUnsafe<unknown[]>('PRAGMA foreign_key_check;');
    expect(rows).toHaveLength(0);
  });

  it('database integrity check passes', async () => {
    const rows = await db.$queryRawUnsafe<{ integrity_check: string }[]>('PRAGMA integrity_check;');
    expect(rows[0]?.integrity_check).toBe('ok');
  });
});

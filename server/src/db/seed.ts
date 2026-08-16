/**
 * Ironboard — DEVELOPMENT SEED DATA  (ENH-16)
 * ===========================================================================
 * ⚠️ THIS IS DEVELOPMENT SEED DATA. IT IS NOT PRODUCTION DATA.
 *
 *  - Every person, address, phone and email below is FABRICATED for testing.
 *    No real personal information appears anywhere in this file.
 *  - `passwordHash` values are the literal placeholder string
 *    `DEV_SEED_NOT_A_REAL_HASH`. They are NOT valid credentials and cannot be
 *    used to authenticate — password hashing arrives with auth in a later phase.
 *  - `conditionCipher` values are placeholder text, NOT encrypted data.
 *    Real field encryption (NFR-21 / NFR-10) arrives with the service layer.
 *
 * Deterministic: a fixed PRNG seed and a fixed epoch mean repeated runs produce
 * byte-identical data. ADR-012's verification thresholds depend on this.
 *
 * Scale — ADR-012 ENGINEERING VERIFICATION THRESHOLD, student/college project:
 *   3 operating branches (+1 disabled, AC-12) · 1 000 members · 5 plans ·
 *   90 days attendance · ≤ 10 concurrent.
 *   Deliberately NOT production scale.
 */
import { PrismaClient } from '@prisma/client';
import { applyPragmas } from './client.js';
import { makeRng, id, pick, intBetween, daysFromEpoch, SEED_EPOCH } from './ids.js';

const prisma = new PrismaClient();

const SEED = 20260816;
const N_BRANCHES = 3;
const N_MEMBERS = 1_000;
const N_PLANS = 5;
const ATTENDANCE_DAYS = 90;
const N_EQUIPMENT_PER_BRANCH = 12;

const DEV_HASH = 'DEV_SEED_NOT_A_REAL_HASH';

const ROLES = [
  { key: 'receptionist', name: 'Receptionist' },
  { key: 'trainer', name: 'Trainer' },
  { key: 'administrator', name: 'Administrator' },
  { key: 'membership_manager', name: 'Membership Manager' },
  { key: 'accounting_executive', name: 'Accounting Executive' },
  { key: 'member', name: 'Member' }, // ENH-01 — owns no Lab 1 story
] as const;

const PERMISSIONS = [
  'member:create', 'member:read', 'member:update',
  'medical:read', 'medical:create',
  'session:create', 'session:read',
  'plan:create', 'plan:update', 'plan:publish', 'plan:read',
  'progress:create', 'progress:read',
  'staff:read', 'staff:approve',
  'branch:read', 'branch:create', 'branch:update', 'branch:disable',
  'equipment:read', 'equipment:create', 'equipment:update',
  'attendance:read', 'attendance:create',
  'membership:create', 'membership:cancel', 'membership:renew', 'membership:read',
  'payment:create', 'invoice:create', 'invoice:read', 'invoice:notify',
  'refund:create', 'report:attendance', 'report:revenue', 'dashboard:read',
] as const;

/** ADR-007 deny-by-default: each role gets exactly what its stories need. */
const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  receptionist: ['member:create', 'member:read', 'member:update', 'medical:create',
    'session:create', 'session:read', 'attendance:read', 'attendance:create',
    'membership:read', 'report:attendance'],
  trainer: ['member:read', 'medical:read', 'medical:create', 'plan:create', 'plan:update',
    'plan:read', 'progress:create', 'progress:read', 'session:create', 'session:read',
    'membership:read'],
  administrator: ['member:read', 'staff:read', 'staff:approve', 'branch:read', 'branch:create',
    'branch:update', 'branch:disable', 'equipment:read', 'equipment:create', 'equipment:update',
    'attendance:read', 'attendance:create', 'report:attendance', 'report:revenue',
    'dashboard:read', 'membership:read', 'session:read'],
  membership_manager: ['member:read', 'plan:create', 'plan:update', 'plan:publish', 'plan:read',
    'membership:create', 'membership:cancel', 'membership:renew', 'membership:read'],
  accounting_executive: ['member:read', 'membership:read', 'payment:create', 'invoice:create',
    'invoice:read', 'invoice:notify', 'refund:create', 'report:revenue'],
  member: ['membership:read', 'invoice:read', 'progress:read', 'plan:read', 'session:read'],
};

const FIRST = ['Aarav','Isha','Rohan','Meera','Kabir','Ananya','Vikram','Sneha','Arjun','Priya',
  'Nikhil','Divya','Rahul','Tara','Sameer','Neha','Karan','Riya','Aditya','Pooja'] as const;
const LAST = ['Sharma','Patel','Nair','Iyer','Gupta','Reddy','Menon','Joshi','Rao','Kulkarni',
  'Desai','Bose','Chopra','Malhotra','Verma'] as const;

const EXERCISES = ['Back Squat','Bench Press','Deadlift','Overhead Press','Barbell Row',
  'Pull-up','Lunge','Plank','Leg Press','Lat Pulldown','Bicep Curl','Tricep Extension'] as const;

const EQUIPMENT_NAMES = ['Treadmill','Rowing Machine','Leg Press','Cable Crossover','Smith Machine',
  'Elliptical','Spin Bike','Lat Pulldown','Chest Press','Squat Rack','Dumbbell Rack','Seated Row'] as const;

async function main(): Promise<void> {
  await applyPragmas(prisma);
  const rng = makeRng(SEED);
  const t0 = Date.now();

  // Truncate in FK-safe order (children first).
  //
  // ⚠️ The append-only triggers (LedgerEntry / AuditEvent / MembershipEvent)
  // deliberately block DELETE, so a re-seed would abort. The trigger DDL is
  // read back from sqlite_master, dropped for the truncation, then restored
  // verbatim — this keeps a single source of truth (the migration) and cannot
  // drift from it.
  console.log('• clearing existing rows');
  const triggers = await prisma.$queryRawUnsafe<{ name: string; sql: string }[]>(
    `SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND sql IS NOT NULL;`,
  );
  for (const t of triggers) await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS "${t.name}";`);

  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
  for (const t of ['NotificationOutbox','AuditEvent','LedgerEntry','Refund','Receipt','Payment',
    'Invoice','MaintenanceSchedule','Equipment','AttendanceDaily','AttendanceEvent','SessionSlot',
    'ProgressEntry','PlanExercise','WorkoutPlan','Exercise','TrainerAssignment','MembershipEvent',
    'Membership','MembershipPlan','Prospect','MedicalRestriction','Member','Session',
    'RolePermission','Staff','Permission','Role','Branch']) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${t}";`);
  }
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');

  for (const t of triggers) await prisma.$executeRawUnsafe(t.sql);
  console.log(`  restored ${triggers.length} append-only / guard triggers`);

  // --- Branches (B-03: scoping attribute, not a tenant boundary) -----------
  // N_BRANCHES active branches carry members/equipment/attendance, plus ONE
  // disabled branch with no dependents so AC-12's "disables a branch" path has
  // a seeded example. Without it nothing in the dataset exercised `disabled`.
  const branches = Array.from({ length: N_BRANCHES }, (_, i) => ({
    id: id('brn', i + 1, 3),
    code: `BR${String(i + 1).padStart(2, '0')}`,
    name: ['Ironboard Andheri', 'Ironboard Bandra', 'Ironboard Powai'][i]!,
    status: 'active',
    createdAt: SEED_EPOCH, updatedAt: SEED_EPOCH,
  }));
  await prisma.branch.createMany({
    data: [...branches, {
      id: id('brn', N_BRANCHES + 1, 3),
      code: `BR${String(N_BRANCHES + 1).padStart(2, '0')}`,
      name: 'Ironboard Vashi (closed)',
      status: 'disabled', // AC-12
      createdAt: SEED_EPOCH, updatedAt: SEED_EPOCH,
    }],
  });

  // --- Roles & permissions (ADR-007) ---------------------------------------
  await prisma.role.createMany({
    data: ROLES.map((r, i) => ({ id: id('rol', i + 1, 2), key: r.key, name: r.name })),
  });
  await prisma.permission.createMany({
    data: PERMISSIONS.map((k, i) => ({ id: id('prm', i + 1, 3), key: k, description: k })),
  });
  const roleRows = await prisma.role.findMany();
  const permRows = await prisma.permission.findMany();
  const permByKey = new Map(permRows.map((p) => [p.key, p.id]));
  await prisma.rolePermission.createMany({
    data: roleRows.flatMap((r) =>
      (ROLE_PERMISSIONS[r.key] ?? []).map((k) => ({ roleId: r.id, permissionId: permByKey.get(k)! })),
    ),
  });

  // --- Staff (AC-11: pending → active; B-03: homeBranchId NULLABLE) --------
  const roleByKey = new Map(roleRows.map((r) => [r.key, r.id]));
  type StaffSeed = { id: string; email: string; fullName: string; roleId: string;
    homeBranchId: string | null; status: string; passwordHash: string | null;
    approvedByStaffId: string | null; approvedAt: Date | null; createdAt: Date; updatedAt: Date };
  const staff: StaffSeed[] = [];
  let sIdx = 0;
  const addStaff = (roleKey: string, branchIdx: number | null, status: string): StaffSeed => {
    sIdx += 1;
    const row: StaffSeed = {
      id: id('stf', sIdx, 3),
      email: `${roleKey}${sIdx}@ironboard.dev.invalid`,
      fullName: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
      roleId: roleByKey.get(roleKey)!,
      // Administrator is org-wide → null home branch (B-03 nullable is meaningful).
      homeBranchId: branchIdx === null ? null : branches[branchIdx]!.id,
      status,
      passwordHash: status === 'active' ? DEV_HASH : null,
      approvedByStaffId: null, approvedAt: null,
      createdAt: SEED_EPOCH, updatedAt: SEED_EPOCH,
    };
    staff.push(row);
    return row;
  };
  const admin = addStaff('administrator', null, 'active');
  for (let b = 0; b < N_BRANCHES; b += 1) {
    addStaff('receptionist', b, 'active');
    addStaff('trainer', b, 'active');
    addStaff('trainer', b, 'active');
    addStaff('membership_manager', b, 'active');
    addStaff('accounting_executive', b, 'active');
  }
  // AC-11: one account awaiting approval, and one already approved by the admin.
  addStaff('trainer', 0, 'pending');
  const approved = addStaff('receptionist', 1, 'active');
  approved.approvedByStaffId = admin.id;
  approved.approvedAt = daysFromEpoch(-30);
  for (const s of staff) await prisma.staff.create({ data: s });

  const trainers = staff.filter((s) => s.roleId === roleByKey.get('trainer') && s.status === 'active');
  const membershipMgr = staff.find((s) => s.roleId === roleByKey.get('membership_manager'))!;
  const accountant = staff.find((s) => s.roleId === roleByKey.get('accounting_executive'))!;
  const receptionist = staff.find((s) => s.roleId === roleByKey.get('receptionist'))!;

  // --- Plans (AC-16; B-03: GLOBAL, no branchId) ----------------------------
  const planSpecs = [
    { name: 'Monthly Basic', priceMinor: 150_000, durationDays: 30 },
    { name: 'Quarterly Basic', priceMinor: 400_000, durationDays: 90 },
    { name: 'Half-Yearly Plus', priceMinor: 750_000, durationDays: 180 },
    { name: 'Annual Plus', priceMinor: 1_350_000, durationDays: 365 },
    { name: 'Annual Elite', priceMinor: 2_100_000, durationDays: 365 },
  ].slice(0, N_PLANS);
  await prisma.membershipPlan.createMany({
    data: planSpecs.map((p, i) => ({
      id: id('pln', i + 1, 3), name: p.name,
      priceMinor: p.priceMinor, durationDays: p.durationDays,
      accessRules: JSON.stringify({ allBranches: true, peakHours: i >= 2 }),
      published: true, createdAt: SEED_EPOCH, updatedAt: SEED_EPOCH,
    })),
  });

  await prisma.exercise.createMany({
    data: EXERCISES.map((n, i) => ({ id: id('exr', i + 1, 3), name: n })),
  });

  // --- Members (B-03: homeBranchId NULLABLE, non-restrictive) --------------
  console.log(`• seeding ${N_MEMBERS} members`);
  const members = Array.from({ length: N_MEMBERS }, (_, i) => {
    const n = i + 1;
    return {
      id: id('mem', n, 5),
      memberCode: `IB${String(n).padStart(6, '0')}`,
      fullName: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
      email: `member${n}@example.invalid`,
      phone: `+9190000${String(n).padStart(5, '0')}`,
      // ~4% have no home branch — exercises the nullable column (B-03).
      homeBranchId: rng() < 0.04 ? null : pick(rng, branches).id,
      passwordHash: null,
      createdAt: daysFromEpoch(-intBetween(rng, 30, 400)),
      updatedAt: SEED_EPOCH,
    };
  });
  for (let i = 0; i < members.length; i += 250) {
    await prisma.member.createMany({ data: members.slice(i, i + 250) });
  }

  // --- Memberships (ENH-19; B-05 three states, no EXPIRING) ---------------
  console.log('• seeding memberships (ACTIVE / EXPIRED / CANCELLED)');
  const memberships: { id: string; memberId: string; planId: string; state: string;
    startsAt: Date; expiresAt: Date; cancelledAt: Date | null; createdAt: Date; updatedAt: Date }[] = [];
  const events: { id: string; membershipId: string; fromState: string | null; toState: string;
    reason: string; occurredAt: Date }[] = [];
  let evIdx = 0;
  members.forEach((m, i) => {
    const plan = planSpecs[Math.floor(rng() * planSpecs.length)]!;
    const planId = id('pln', planSpecs.indexOf(plan) + 1, 3);
    const roll = rng();
    // 70% ACTIVE, 20% EXPIRED, 10% CANCELLED.
    const state = roll < 0.7 ? 'ACTIVE' : roll < 0.9 ? 'EXPIRED' : 'CANCELLED';
    // ACTIVE: ~12% fall inside the 7-day window so "expiring soon" (AC-19) is a
    // DERIVED query with real matches — it is NOT a stored state (B-05).
    const startOffset = state === 'ACTIVE'
      ? (rng() < 0.12 ? -(plan.durationDays - intBetween(rng, 1, 7)) : -intBetween(rng, 1, Math.max(1, plan.durationDays - 10)))
      : -(plan.durationDays + intBetween(rng, 1, 120));
    const startsAt = daysFromEpoch(startOffset);
    const expiresAt = daysFromEpoch(startOffset + plan.durationDays);
    const mid = id('mbs', i + 1, 5);
    memberships.push({
      id: mid, memberId: m.id, planId, state, startsAt, expiresAt,
      cancelledAt: state === 'CANCELLED' ? daysFromEpoch(startOffset + plan.durationDays + 5) : null,
      createdAt: startsAt, updatedAt: SEED_EPOCH,
    });
    evIdx += 1;
    events.push({ id: id('mev', evIdx, 6), membershipId: mid, fromState: null, toState: 'ACTIVE',
      reason: 'ENH-19 membership created', occurredAt: startsAt });
    if (state !== 'ACTIVE') {
      evIdx += 1;
      events.push({ id: id('mev', evIdx, 6), membershipId: mid, fromState: 'ACTIVE', toState: 'EXPIRED',
        reason: 'expiresAt reached (T2)', occurredAt: expiresAt });
    }
    if (state === 'CANCELLED') {
      evIdx += 1;
      events.push({ id: id('mev', evIdx, 6), membershipId: mid, fromState: 'EXPIRED', toState: 'CANCELLED',
        reason: 'cancellation confirmed (T4)', occurredAt: daysFromEpoch(startOffset + plan.durationDays + 5) });
    }
  });
  for (let i = 0; i < memberships.length; i += 250) {
    await prisma.membership.createMany({ data: memberships.slice(i, i + 250) });
  }
  for (let i = 0; i < events.length; i += 500) {
    await prisma.membershipEvent.createMany({ data: events.slice(i, i + 500) });
  }

  // --- Trainer assignments (ENH-20: side effect of AC-06 / AC-08) ---------
  console.log('• seeding trainer assignments, workout plans, progress');
  const assigned = members.filter(() => rng() < 0.35);
  const assignments = assigned.map((m, i) => ({
    id: id('tas', i + 1, 5), trainerId: pick(rng, trainers).id, memberId: m.id,
    source: rng() < 0.6 ? 'workout_plan' : 'pt_session',
    grantedByStaffId: null, createdAt: daysFromEpoch(-intBetween(rng, 5, 200)), revokedAt: null,
  }));
  for (let i = 0; i < assignments.length; i += 250) {
    await prisma.trainerAssignment.createMany({ data: assignments.slice(i, i + 250) });
  }

  // Workout plans only for assigned members (AC-06 "link the plan to the profile").
  const plansForMembers = assignments.filter(() => rng() < 0.7);
  const workoutPlans = plansForMembers.map((a, i) => ({
    id: id('wkp', i + 1, 5), memberId: a.memberId, trainerId: a.trainerId,
    name: `Plan ${i + 1}`, version: 1, isTemplate: false, createdAt: a.createdAt,
  }));
  // ENH-08 templates (memberId NULL — enforced by CHECK).
  const templates = Array.from({ length: 3 }, (_, i) => ({
    id: id('wkp', 90_000 + i, 5), memberId: null, trainerId: trainers[0]!.id,
    name: `Template ${['Beginner','Intermediate','Advanced'][i]}`, version: 1,
    isTemplate: true, createdAt: SEED_EPOCH,
  }));
  for (let i = 0; i < workoutPlans.length; i += 250) {
    await prisma.workoutPlan.createMany({ data: workoutPlans.slice(i, i + 250) });
  }
  await prisma.workoutPlan.createMany({ data: templates });

  const planExercises = workoutPlans.flatMap((wp, i) => {
    const count = intBetween(rng, 3, 5);
    const chosen = new Set<number>();
    while (chosen.size < count) chosen.add(intBetween(rng, 1, EXERCISES.length));
    return [...chosen].map((exNo, k) => ({
      id: id('pex', i * 10 + k + 1, 6), workoutPlanId: wp.id, exerciseId: id('exr', exNo, 3),
      sets: intBetween(rng, 3, 5), reps: intBetween(rng, 6, 12), position: k,
    }));
  });
  for (let i = 0; i < planExercises.length; i += 500) {
    await prisma.planExercise.createMany({ data: planExercises.slice(i, i + 500) });
  }

  const progress = assignments.flatMap((a, i) =>
    Array.from({ length: intBetween(rng, 1, 4) }, (_, k) => ({
      id: id('prg', i * 10 + k + 1, 6), memberId: a.memberId, trainerId: a.trainerId,
      weightKg: 55 + Math.round(rng() * 400) / 10,
      measurements: JSON.stringify({ chestCm: 90 + intBetween(rng, 0, 20), waistCm: 70 + intBetween(rng, 0, 20) }),
      recordedAt: daysFromEpoch(-intBetween(rng, 1, 120)),
    })),
  );
  for (let i = 0; i < progress.length; i += 500) {
    await prisma.progressEntry.createMany({ data: progress.slice(i, i + 500) });
  }

  // --- Medical restrictions (AC-10 / ENH-03) -------------------------------
  const medical = assigned.filter(() => rng() < 0.12).map((m, i) => ({
    id: id('med', i + 1, 4), memberId: m.id,
    // ⚠️ PLACEHOLDER TEXT — not encrypted. Real encryption arrives with services.
    conditionCipher: `DEV_SEED_PLACEHOLDER:${pick(rng, ['knee-injury','asthma','hypertension','lower-back'])}`,
    severity: pick(rng, ['low', 'medium', 'high']),
    recordedByStaffId: receptionist.id, createdAt: daysFromEpoch(-intBetween(rng, 10, 300)),
  }));
  await prisma.medicalRestriction.createMany({ data: medical });

  // --- Prospects & sessions (AC-03, AC-08) --------------------------------
  const prospects = Array.from({ length: 40 }, (_, i) => ({
    id: id('pro', i + 1, 4), fullName: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
    phone: `+9198000${String(i + 1).padStart(5, '0')}`,
    email: `prospect${i + 1}@example.invalid`, createdAt: daysFromEpoch(-intBetween(rng, 1, 60)),
  }));
  await prisma.prospect.createMany({ data: prospects });

  const slots = [
    ...prospects.map((p, i) => {
      const s = daysFromEpoch(-intBetween(rng, 0, 30));
      s.setUTCHours(intBetween(rng, 7, 20), 0, 0, 0);
      return { id: id('slt', i + 1, 5), kind: 'trial', memberId: null, prospectId: p.id,
        trainerId: pick(rng, trainers).id, startsAt: s, endsAt: new Date(s.getTime() + 3_600_000),
        status: 'booked', createdAt: SEED_EPOCH };
    }),
    ...assignments.filter(() => rng() < 0.3).map((a, i) => {
      const s = daysFromEpoch(-intBetween(rng, 0, 45));
      s.setUTCHours(intBetween(rng, 6, 21), 0, 0, 0);
      return { id: id('slt', 50_000 + i, 5), kind: 'personal_training', memberId: a.memberId,
        prospectId: null, trainerId: a.trainerId, startsAt: s, endsAt: new Date(s.getTime() + 3_600_000),
        status: pick(rng, ['booked', 'completed']), createdAt: SEED_EPOCH };
    }),
  ];
  for (let i = 0; i < slots.length; i += 250) {
    await prisma.sessionSlot.createMany({ data: slots.slice(i, i + 250) });
  }

  // --- Attendance (ENH-02; B-03 branchId NOT NULL) -------------------------
  console.log(`• seeding ${ATTENDANCE_DAYS} days of attendance`);
  const activeMembers = members.filter((_, i) => memberships[i]!.state === 'ACTIVE');
  const attendance: { id: string; memberId: string; branchId: string; checkedInAt: Date; source: string }[] = [];
  let aIdx = 0;
  for (let d = 0; d < ATTENDANCE_DAYS; d += 1) {
    for (const m of activeMembers) {
      if (rng() > 0.18) continue;
      const at = daysFromEpoch(-d);
      at.setUTCHours(intBetween(rng, 6, 21), intBetween(rng, 0, 59), 0, 0);
      aIdx += 1;
      attendance.push({
        id: id('att', aIdx, 7), memberId: m.id,
        branchId: m.homeBranchId ?? branches[0]!.id, checkedInAt: at, source: 'seed',
      });
    }
  }
  for (let i = 0; i < attendance.length; i += 1000) {
    await prisma.attendanceEvent.createMany({ data: attendance.slice(i, i + 1000) });
  }

  // Pre-aggregate for NFR-14's 5 s budget.
  const dailyMap = new Map<string, { visits: number; hours: number[] }>();
  for (const a of attendance) {
    const day = new Date(Date.UTC(a.checkedInAt.getUTCFullYear(), a.checkedInAt.getUTCMonth(), a.checkedInAt.getUTCDate()));
    const key = `${day.toISOString()}|${a.branchId}`;
    const cur = dailyMap.get(key) ?? { visits: 0, hours: [] };
    cur.visits += 1; cur.hours.push(a.checkedInAt.getUTCHours());
    dailyMap.set(key, cur);
  }
  const daily = [...dailyMap.entries()].map(([key, v], i) => {
    const [iso, branchId] = key.split('|') as [string, string];
    const counts = new Map<number, number>();
    for (const h of v.hours) counts.set(h, (counts.get(h) ?? 0) + 1);
    const peak = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]![0];
    return { id: id('atd', i + 1, 5), date: new Date(iso), branchId, visits: v.visits, peakHour: peak };
  });
  for (let i = 0; i < daily.length; i += 500) {
    await prisma.attendanceDaily.createMany({ data: daily.slice(i, i + 500) });
  }

  // --- Equipment (ENH-04; B-03 branchId NOT NULL) -------------------------
  const equipment = branches.flatMap((b, bi) =>
    Array.from({ length: N_EQUIPMENT_PER_BRANCH }, (_, i) => ({
      id: id('eqp', bi * 100 + i + 1, 4),
      assetCode: `${b.code}-EQ${String(i + 1).padStart(3, '0')}`,
      name: EQUIPMENT_NAMES[i % EQUIPMENT_NAMES.length]!,
      branchId: b.id,
      status: rng() < 0.08 ? 'in_maintenance' : 'operational',
      createdAt: SEED_EPOCH, updatedAt: SEED_EPOCH,
    })),
  );
  await prisma.equipment.createMany({ data: equipment });
  await prisma.maintenanceSchedule.createMany({
    data: equipment.map((e, i) => ({
      id: id('mnt', i + 1, 4), equipmentId: e.id,
      intervalDays: pick(rng, [30, 90, 180]),
      nextDueAt: daysFromEpoch(intBetween(rng, 1, 90)),
      lastServicedAt: daysFromEpoch(-intBetween(rng, 10, 180)),
    })),
  });

  // --- Money (NFR-24: integer minor units, append-only ledger) ------------
  console.log('• seeding payments, receipts, invoices, refunds, ledger');
  const payments: { id: string; memberId: string; membershipId: string; amountMinor: number;
    method: string; status: string; paidAt: Date; idempotencyKey: string; createdAt: Date }[] = [];
  const receipts: { id: string; paymentId: string; receiptNumber: string; issuedAt: Date }[] = [];
  const invoices: { id: string; number: string; memberId: string; membershipId: string;
    amountMinor: number; dueAt: Date; status: string; idempotencyKey: string; createdAt: Date }[] = [];
  const ledger: { id: string; kind: string; amountMinor: number; memberId: string;
    sourceType: string; sourceId: string; occurredAt: Date }[] = [];
  let lIdx = 0;

  memberships.forEach((ms, i) => {
    if (ms.state === 'CANCELLED' && rng() < 0.5) return; // some cancelled never paid
    const plan = planSpecs[Number(ms.planId.split('_')[1]) - 1]!;
    const pid = id('pay', i + 1, 5);
    payments.push({
      id: pid, memberId: ms.memberId, membershipId: ms.id, amountMinor: plan.priceMinor,
      method: pick(rng, ['cash', 'card', 'online']), status: 'settled', paidAt: ms.startsAt,
      idempotencyKey: `seed-pay-${i + 1}`, createdAt: ms.startsAt,
    });
    receipts.push({ id: id('rcp', i + 1, 5), paymentId: pid,
      receiptNumber: `RCP-${String(i + 1).padStart(6, '0')}`, issuedAt: ms.startsAt });
    lIdx += 1;
    ledger.push({ id: id('lgr', lIdx, 6), kind: 'payment', amountMinor: plan.priceMinor,
      memberId: ms.memberId, sourceType: 'Payment', sourceId: pid, occurredAt: ms.startsAt });

    const overdue = ms.state !== 'ACTIVE' && rng() < 0.25;
    invoices.push({
      id: id('inv', i + 1, 5), number: `INV-2026-${String(i + 1).padStart(6, '0')}`,
      memberId: ms.memberId, membershipId: ms.id, amountMinor: plan.priceMinor,
      dueAt: daysFromEpoch(-intBetween(rng, 1, 60)),
      status: overdue ? 'overdue' : 'paid', idempotencyKey: `seed-inv-${i + 1}`, createdAt: ms.startsAt,
    });
  });
  for (let i = 0; i < payments.length; i += 250) await prisma.payment.createMany({ data: payments.slice(i, i + 250) });
  for (let i = 0; i < receipts.length; i += 250) await prisma.receipt.createMany({ data: receipts.slice(i, i + 250) });
  for (let i = 0; i < invoices.length; i += 250) await prisma.invoice.createMany({ data: invoices.slice(i, i + 250) });

  // AC-24 — approval is captured as DATA (B-04: ENH-05 workflow withdrawn).
  const refundable = payments.filter(() => rng() < 0.03);
  const refunds = refundable.map((p, i) => {
    const amt = Math.min(p.amountMinor, Math.round(p.amountMinor * (rng() < 0.5 ? 1 : 0.5)));
    lIdx += 1;
    ledger.push({ id: id('lgr', lIdx, 6), kind: 'refund', amountMinor: -amt, memberId: p.memberId,
      sourceType: 'Refund', sourceId: id('rfd', i + 1, 4), occurredAt: daysFromEpoch(-intBetween(rng, 1, 60)) });
    return {
      id: id('rfd', i + 1, 4), paymentId: p.id, amountMinor: amt,
      approvedByStaffId: accountant.id, approvedAt: daysFromEpoch(-intBetween(rng, 2, 60)),
      approvalReference: `DEV-APPROVAL-${String(i + 1).padStart(4, '0')}`,
      processedAt: daysFromEpoch(-intBetween(rng, 1, 59)),
    };
  });
  for (const r of refunds) await prisma.refund.create({ data: r });
  for (let i = 0; i < ledger.length; i += 500) await prisma.ledgerEntry.createMany({ data: ledger.slice(i, i + 500) });

  // --- Notifications (ADR-008 outbox) & audit (ENH-13) --------------------
  const notifications = memberships
    .filter((m) => m.state === 'ACTIVE' && (m.expiresAt.getTime() - SEED_EPOCH.getTime()) <= 7 * 86_400_000)
    .slice(0, 120)
    .map((m, i) => ({
      id: id('ntf', i + 1, 5), channel: 'email',
      recipient: members.find((x) => x.id === m.memberId)!.email,
      template: 'renewal_reminder',
      payloadJson: JSON.stringify({ membershipId: m.id, expiresAt: m.expiresAt.toISOString() }),
      status: i % 5 === 0 ? 'pending' : 'sent', attempts: i % 5 === 0 ? 0 : 1,
      lastError: null, createdAt: daysFromEpoch(-1), sentAt: i % 5 === 0 ? null : daysFromEpoch(-1),
    }));
  await prisma.notificationOutbox.createMany({ data: notifications });

  const audit = [
    { id: id('aud', 1, 6), actorType: 'staff', actorId: admin.id, action: 'staff.approve',
      entityType: 'Staff', entityId: approved.id, beforeJson: JSON.stringify({ status: 'pending' }),
      afterJson: JSON.stringify({ status: 'active' }), ip: '127.0.0.1', occurredAt: daysFromEpoch(-30) },
    ...payments.slice(0, 50).map((p, i) => ({
      id: id('aud', i + 2, 6), actorType: 'staff', actorId: accountant.id, action: 'payment.create',
      entityType: 'Payment', entityId: p.id, beforeJson: null,
      afterJson: JSON.stringify({ amountMinor: p.amountMinor, method: p.method }),
      ip: '127.0.0.1', occurredAt: p.paidAt,
    })),
    ...memberships.slice(0, 50).map((m, i) => ({
      id: id('aud', i + 60, 6), actorType: 'staff', actorId: membershipMgr.id,
      action: 'membership.create', entityType: 'Membership', entityId: m.id, beforeJson: null,
      afterJson: JSON.stringify({ state: 'ACTIVE', planId: m.planId }), ip: '127.0.0.1',
      occurredAt: m.startsAt,
    })),
  ];
  await prisma.auditEvent.createMany({ data: audit });

  // --- Summary -------------------------------------------------------------
  const counts = {
    Branch: await prisma.branch.count(), Role: await prisma.role.count(),
    Permission: await prisma.permission.count(), Staff: await prisma.staff.count(),
    Member: await prisma.member.count(), MembershipPlan: await prisma.membershipPlan.count(),
    Membership: await prisma.membership.count(), MembershipEvent: await prisma.membershipEvent.count(),
    TrainerAssignment: await prisma.trainerAssignment.count(), WorkoutPlan: await prisma.workoutPlan.count(),
    PlanExercise: await prisma.planExercise.count(), ProgressEntry: await prisma.progressEntry.count(),
    MedicalRestriction: await prisma.medicalRestriction.count(), Prospect: await prisma.prospect.count(),
    SessionSlot: await prisma.sessionSlot.count(), AttendanceEvent: await prisma.attendanceEvent.count(),
    AttendanceDaily: await prisma.attendanceDaily.count(), Equipment: await prisma.equipment.count(),
    MaintenanceSchedule: await prisma.maintenanceSchedule.count(), Payment: await prisma.payment.count(),
    Receipt: await prisma.receipt.count(), Invoice: await prisma.invoice.count(),
    Refund: await prisma.refund.count(), LedgerEntry: await prisma.ledgerEntry.count(),
    AuditEvent: await prisma.auditEvent.count(), NotificationOutbox: await prisma.notificationOutbox.count(),
  };
  console.log(`\n✔ DEVELOPMENT SEED complete in ${Date.now() - t0} ms`);
  console.table(counts);
  const byState = await prisma.membership.groupBy({ by: ['state'], _count: true });
  console.log('membership states:', byState.map((s) => `${s.state}=${s._count}`).join(' '));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

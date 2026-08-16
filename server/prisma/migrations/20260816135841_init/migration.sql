-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("status" IN ('active','disabled'))
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    PRIMARY KEY ("roleId", "permissionId"),
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "fullName" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "homeBranchId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "activationTokenHash" TEXT,
    "activationExpiresAt" DATETIME,
    "approvedByStaffId" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Staff_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Staff_homeBranchId_fkey" FOREIGN KEY ("homeBranchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Staff_approvedByStaffId_fkey" FOREIGN KEY ("approvedByStaffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("status" IN ('pending','active','disabled'))
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("subjectType" IN ('staff','member'))
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "homeBranchId" TEXT,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_homeBranchId_fkey" FOREIGN KEY ("homeBranchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicalRestriction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "conditionCipher" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "recordedByStaffId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MedicalRestriction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MedicalRestriction_recordedByStaffId_fkey" FOREIGN KEY ("recordedByStaffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK (length("conditionCipher") > 0)
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MembershipPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "priceMinor" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "accessRules" TEXT NOT NULL DEFAULT '{}',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("priceMinor" >= 0),
    CHECK ("durationDays" > 0)
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startsAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Membership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Membership_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("state" IN ('ACTIVE','EXPIRED','CANCELLED')),
    CHECK ("expiresAt" > "startsAt"),
    CHECK (("state" = 'CANCELLED') = ("cancelledAt" IS NOT NULL))
);

-- CreateTable
CREATE TABLE "MembershipEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membershipId" TEXT NOT NULL,
    "fromState" TEXT,
    "toState" TEXT NOT NULL,
    "reason" TEXT,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MembershipEvent_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("toState" IN ('ACTIVE','EXPIRED','CANCELLED')),
    CHECK ("fromState" IS NULL OR "fromState" IN ('ACTIVE','EXPIRED','CANCELLED'))
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT,
    "trainerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkoutPlan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkoutPlan_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("version" > 0),
    CHECK (("isTemplate" = 1 AND "memberId" IS NULL) OR ("isTemplate" = 0 AND "memberId" IS NOT NULL))
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PlanExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workoutPlanId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PlanExercise_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlanExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("sets" > 0),
    CHECK ("reps" > 0)
);

-- CreateTable
CREATE TABLE "ProgressEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "weightKg" REAL,
    "measurements" TEXT NOT NULL DEFAULT '{}',
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgressEntry_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgressEntry_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainerAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainerId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "grantedByStaffId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    CONSTRAINT "TrainerAssignment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainerAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainerAssignment_grantedByStaffId_fkey" FOREIGN KEY ("grantedByStaffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("source" IN ('workout_plan','pt_session','admin'))
);

-- CreateTable
CREATE TABLE "SessionSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "memberId" TEXT,
    "prospectId" TEXT,
    "trainerId" TEXT,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionSlot_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionSlot_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionSlot_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("kind" IN ('trial','personal_training')),
    CHECK ("status" IN ('booked','completed','cancelled')),
    CHECK ("endsAt" > "startsAt"),
    CHECK ((("memberId" IS NOT NULL) + ("prospectId" IS NOT NULL)) = 1)
);

-- CreateTable
CREATE TABLE "AttendanceEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "checkedInAt" DATETIME NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'reception',
    CONSTRAINT "AttendanceEvent_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttendanceEvent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceDaily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "branchId" TEXT NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "peakHour" INTEGER,
    CONSTRAINT "AttendanceDaily_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("visits" >= 0),
    CHECK ("peakHour" IS NULL OR ("peakHour" BETWEEN 0 AND 23))
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'operational',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equipment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("status" IN ('operational','in_maintenance','retired'))
);

-- CreateTable
CREATE TABLE "MaintenanceSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "intervalDays" INTEGER NOT NULL,
    "nextDueAt" DATETIME NOT NULL,
    "lastServicedAt" DATETIME,
    CONSTRAINT "MaintenanceSchedule_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("intervalDays" > 0)
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "membershipId" TEXT,
    "amountMinor" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'settled',
    "paidAt" DATETIME NOT NULL,
    "idempotencyKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("method" IN ('cash','card','online')),
    CHECK ("status" IN ('settled','failed')),
    CHECK ("amountMinor" > 0)
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "membershipId" TEXT,
    "amountMinor" INTEGER NOT NULL,
    "dueAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "idempotencyKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("status" IN ('open','paid','overdue','void')),
    CHECK ("amountMinor" > 0)
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "approvedByStaffId" TEXT,
    "approvedAt" DATETIME NOT NULL,
    "approvalReference" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Refund_approvedByStaffId_fkey" FOREIGN KEY ("approvedByStaffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("amountMinor" > 0)
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "memberId" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LedgerEntry_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("kind" IN ('payment','refund','charge')),
    CHECK ("amountMinor" <> 0)
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "beforeJson" TEXT,
    "afterJson" TEXT,
    "ip" TEXT,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("actorType" IN ('staff','member','system'))
);

-- CreateTable
CREATE TABLE "NotificationOutbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" DATETIME,
    -- CHECK constraints (Phase 3): enforced by the DB, not only by app code
    CHECK ("channel" IN ('email','sms')),
    CHECK ("status" IN ('pending','sent','failed')),
    CHECK ("attempts" >= 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE INDEX "Branch_status_idx" ON "Branch"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_activationTokenHash_key" ON "Staff"("activationTokenHash");

-- CreateIndex
CREATE INDEX "Staff_status_idx" ON "Staff"("status");

-- CreateIndex
CREATE INDEX "Staff_roleId_idx" ON "Staff"("roleId");

-- CreateIndex
CREATE INDEX "Staff_homeBranchId_idx" ON "Staff"("homeBranchId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_subjectType_subjectId_idx" ON "Session"("subjectType", "subjectId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberCode_key" ON "Member"("memberCode");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_homeBranchId_idx" ON "Member"("homeBranchId");

-- CreateIndex
CREATE INDEX "Member_fullName_idx" ON "Member"("fullName");

-- CreateIndex
CREATE INDEX "MedicalRestriction_memberId_idx" ON "MedicalRestriction"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipPlan_name_key" ON "MembershipPlan"("name");

-- CreateIndex
CREATE INDEX "MembershipPlan_published_idx" ON "MembershipPlan"("published");

-- CreateIndex
CREATE INDEX "Membership_memberId_state_idx" ON "Membership"("memberId", "state");

-- CreateIndex
CREATE INDEX "Membership_state_expiresAt_idx" ON "Membership"("state", "expiresAt");

-- CreateIndex
CREATE INDEX "MembershipEvent_membershipId_occurredAt_idx" ON "MembershipEvent"("membershipId", "occurredAt");

-- CreateIndex
CREATE INDEX "WorkoutPlan_memberId_version_idx" ON "WorkoutPlan"("memberId", "version");

-- CreateIndex
CREATE INDEX "WorkoutPlan_trainerId_idx" ON "WorkoutPlan"("trainerId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_isTemplate_idx" ON "WorkoutPlan"("isTemplate");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- CreateIndex
CREATE INDEX "PlanExercise_workoutPlanId_idx" ON "PlanExercise"("workoutPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanExercise_workoutPlanId_exerciseId_key" ON "PlanExercise"("workoutPlanId", "exerciseId");

-- CreateIndex
CREATE INDEX "ProgressEntry_memberId_recordedAt_idx" ON "ProgressEntry"("memberId", "recordedAt");

-- CreateIndex
CREATE INDEX "TrainerAssignment_trainerId_memberId_idx" ON "TrainerAssignment"("trainerId", "memberId");

-- CreateIndex
CREATE INDEX "TrainerAssignment_memberId_idx" ON "TrainerAssignment"("memberId");

-- CreateIndex
CREATE INDEX "SessionSlot_trainerId_startsAt_idx" ON "SessionSlot"("trainerId", "startsAt");

-- CreateIndex
CREATE INDEX "SessionSlot_startsAt_status_idx" ON "SessionSlot"("startsAt", "status");

-- CreateIndex
CREATE INDEX "SessionSlot_memberId_idx" ON "SessionSlot"("memberId");

-- CreateIndex
CREATE INDEX "AttendanceEvent_memberId_checkedInAt_idx" ON "AttendanceEvent"("memberId", "checkedInAt");

-- CreateIndex
CREATE INDEX "AttendanceEvent_branchId_checkedInAt_idx" ON "AttendanceEvent"("branchId", "checkedInAt");

-- CreateIndex
CREATE INDEX "AttendanceDaily_branchId_date_idx" ON "AttendanceDaily"("branchId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceDaily_date_branchId_key" ON "AttendanceDaily"("date", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_assetCode_key" ON "Equipment"("assetCode");

-- CreateIndex
CREATE INDEX "Equipment_branchId_status_idx" ON "Equipment"("branchId", "status");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_nextDueAt_idx" ON "MaintenanceSchedule"("nextDueAt");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_equipmentId_idx" ON "MaintenanceSchedule"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_memberId_paidAt_idx" ON "Payment"("memberId", "paidAt");

-- CreateIndex
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_paymentId_key" ON "Receipt"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_idempotencyKey_key" ON "Invoice"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Invoice_status_dueAt_idx" ON "Invoice"("status", "dueAt");

-- CreateIndex
CREATE INDEX "Invoice_memberId_idx" ON "Invoice"("memberId");

-- CreateIndex
CREATE INDEX "Refund_paymentId_idx" ON "Refund"("paymentId");

-- CreateIndex
CREATE INDEX "Refund_processedAt_idx" ON "Refund"("processedAt");

-- CreateIndex
CREATE INDEX "LedgerEntry_occurredAt_kind_idx" ON "LedgerEntry"("occurredAt", "kind");

-- CreateIndex
CREATE INDEX "LedgerEntry_sourceType_sourceId_idx" ON "LedgerEntry"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditEvent_occurredAt_idx" ON "AuditEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "AuditEvent_action_idx" ON "AuditEvent"("action");

-- CreateIndex
CREATE INDEX "NotificationOutbox_status_attempts_idx" ON "NotificationOutbox"("status", "attempts");

-- CreateIndex
CREATE INDEX "NotificationOutbox_createdAt_idx" ON "NotificationOutbox"("createdAt");


-- ============================================================================
-- Phase 3 additions beyond the Prisma-generated DDL
-- Authority: PRE_PHASE_3_DECISION_REGISTER.md (B-03, B-05, ENH-19, ENH-20)
-- ============================================================================

-- B-05: at most ONE ACTIVE membership per member.
CREATE UNIQUE INDEX "Membership_one_active_per_member"
  ON "Membership"("memberId") WHERE "state" = 'ACTIVE';

-- ENH-20 / NFR-10: at most one LIVE assignment per (trainer, member).
CREATE UNIQUE INDEX "TrainerAssignment_one_live_per_pair"
  ON "TrainerAssignment"("trainerId","memberId") WHERE "revokedAt" IS NULL;

-- ADR-011: LedgerEntry is APPEND-ONLY.
CREATE TRIGGER "LedgerEntry_no_update" BEFORE UPDATE ON "LedgerEntry"
BEGIN SELECT RAISE(ABORT, 'LedgerEntry is append-only (ADR-011, NFR-24)'); END;
CREATE TRIGGER "LedgerEntry_no_delete" BEFORE DELETE ON "LedgerEntry"
BEGIN SELECT RAISE(ABORT, 'LedgerEntry is append-only (ADR-011, NFR-24)'); END;

-- ENH-13: AuditEvent is APPEND-ONLY.
CREATE TRIGGER "AuditEvent_no_update" BEFORE UPDATE ON "AuditEvent"
BEGIN SELECT RAISE(ABORT, 'AuditEvent is append-only (ENH-13, NFR-24)'); END;
CREATE TRIGGER "AuditEvent_no_delete" BEFORE DELETE ON "AuditEvent"
BEGIN SELECT RAISE(ABORT, 'AuditEvent is append-only (ENH-13, NFR-24)'); END;

-- WF-02: MembershipEvent history is APPEND-ONLY.
CREATE TRIGGER "MembershipEvent_no_update" BEFORE UPDATE ON "MembershipEvent"
BEGIN SELECT RAISE(ABORT, 'MembershipEvent is append-only (WF-02)'); END;

-- B-05: enforce the resolved transition table at the database layer.
--   ACTIVE  -> ACTIVE (renew/extend, T6) | EXPIRED (T2) | CANCELLED (T3)
--   EXPIRED -> ACTIVE (renewal payment, T5) | CANCELLED (T4)
--   CANCELLED is TERMINAL — no transition out.
CREATE TRIGGER "Membership_state_transition_guard" BEFORE UPDATE OF "state" ON "Membership"
WHEN OLD."state" <> NEW."state"
BEGIN
  SELECT CASE
    WHEN OLD."state" = 'CANCELLED'
      THEN RAISE(ABORT, 'Invalid membership transition: CANCELLED is terminal (B-05)')
    WHEN OLD."state" = 'ACTIVE'  AND NEW."state" NOT IN ('EXPIRED','CANCELLED')
      THEN RAISE(ABORT, 'Invalid membership transition from ACTIVE (B-05)')
    WHEN OLD."state" = 'EXPIRED' AND NEW."state" NOT IN ('ACTIVE','CANCELLED')
      THEN RAISE(ABORT, 'Invalid membership transition from EXPIRED (B-05)')
  END;
END;

-- NFR-24: total refunds for a payment may never exceed the payment amount.
CREATE TRIGGER "Refund_not_exceeding_payment" BEFORE INSERT ON "Refund"
BEGIN
  SELECT CASE WHEN (
    NEW."amountMinor"
    + COALESCE((SELECT SUM("amountMinor") FROM "Refund" WHERE "paymentId" = NEW."paymentId"), 0)
  ) > (SELECT "amountMinor" FROM "Payment" WHERE "id" = NEW."paymentId")
  THEN RAISE(ABORT, 'Refund total exceeds payment amount (NFR-24)') END;
END;

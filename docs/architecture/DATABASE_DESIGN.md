# Ironboard — Database Design

**Phase:** 3 — Database Implementation · **Date:** 2026-08-16
**Status:** ✅ **IMPLEMENTED** — schema, migration, constraints, indexes, seed and tests exist.
**Schema:** `server/prisma/schema.prisma` · **Migration:** `server/prisma/migrations/20260816135841_init/`
**Seed:** `server/src/db/seed.ts` · **Reset:** `server/src/db/reset.ts` · **Tests:** `server/tests/` (139 passing)
**Evidence:** `docs/testing/evidence/phase3-db-20260816T140858Z.log` (implementation) ·
`docs/testing/evidence/phase3-selfreview-20260816T145257Z.log` (self-review)
**Diagram:** `docs/diagrams/er/er-model.png` (`DIA-16`, ENHANCEMENT)
**Engine:** SQLite (WAL) via Prisma 6 + `better-sqlite3` — ADR-005

---

## ⚠️ 0. The governing caveat

**Neither Lab 1 nor Lab 2 defines a data model** (`INC-04`). No source document names a single
entity, attribute, type, key, index or relationship.

**Everything in this document is an engineering decision derived from acceptance-criteria
prose.** Nothing here may be cited as a sourced requirement. The handful of fields that come
closest to being sourced are listed in §3.1; everything else is assumption.

No field-level rules exist either (`INC-05`) — formats, lengths, uniqueness and required-ness
are all invented, and `NFR-02` ("validate all member information") gives no guidance on what
"valid" means.

---

## 1. Conventions

| Convention | Choice | Rationale |
|---|---|---|
| Primary keys | `TEXT` CUID2 | Non-sequential; safe to expose in URLs |
| Money | `INTEGER` minor units (paise) | **Never floats.** `NFR-24` requires exact arithmetic |
| Timestamps | `DATETIME` UTC | Single timezone; `AMB-04` leaves "working hours" undefined |
| Enums | `TEXT` + `CHECK` | SQLite has no native enum; Prisma maps to a union type |
| Soft delete | `disabled` status, not row deletion | `AC-12` "disables a branch"; `NFR-13` |
| JSON columns | `TEXT` holding JSON | Only where the shape is genuinely open (`accessRules`, `measurements`) |
| Naming | `PascalCase` models, `camelCase` fields | Prisma convention |

---

## 2. Entity catalogue

**29 entities in eight groups.** Verified against the implementation, not asserted: 29 `model`
blocks in `server/prisma/schema.prisma`, 29 `CREATE TABLE` statements in
`prisma/migrations/20260816135841_init/migration.sql`, and 29 live tables — `T-U-001` asserts
the set exactly. `RefundRequest` was withdrawn by `B-04` and is **not** among them.

> ⚠️ **Corrected 2026-08-16.** This heading previously read "28 entities" while the catalogue
> below already listed 29 (6+3+3+5+3+2+5+2). The error had propagated into `PHASE_STATUS.md`,
> `SESSION_HANDOFF.md` and `LAB1_TRACEABILITY_MATRIX.md`; all are now 29.
`⚠️` marks an entity that exists **only** to unblock a Lab 1 story whose write path no story
provides. Every entity has a documented purpose; none was added because it "sounded useful".

### 2.1 Identity & Access

| Entity | Purpose | Traces to |
|---|---|---|
| `Branch` | Gym locations; `add / update / disable` | `AC-12`, `NFR-12` |
| `Role` | Six roles incl. Member (`ENH-01`) | `NFR-10`, `NFR-11`, `NFR-21` |
| `Permission` | Atomic capability | ADR-007 |
| `RolePermission` | Join | ADR-007 |
| `Staff` ⚠️ | Staff account, `pending → active` | `AC-11`, `ENH-06` |
| `Session` | Revocable server-side session | ADR-006, `AC-11`, `AC-17` |

### 2.2 Members & Health

| Entity | Purpose | Traces to |
|---|---|---|
| `Member` | Member record + Member ID | `AC-01`, `AC-02`, `NFR-02` |
| `MedicalRestriction` ⚠️ | Health conditions, **encrypted** | `AC-10`, `NFR-10`, `ENH-03` |
| `Prospect` ⚠️ | Trial-session lead | `AC-03`, `ENH-07` |

### 2.3 Membership lifecycle

| Entity | Purpose | Traces to |
|---|---|---|
| `MembershipPlan` | Price, duration, access rules; draft → published | `AC-16`, `NFR-16` |
| `Membership` | The state machine | `AC-17`–`AC-20`, `NFR-17` |
| `MembershipEvent` | Transition history | `WF-02`, feeds `DIA-07` |

### 2.4 Training

| Entity | Purpose | Traces to |
|---|---|---|
| `WorkoutPlan` | Versioned; `isTemplate` for `ENH-08` | `AC-06`, `AC-09`, `NFR-09` |
| `Exercise` | Catalogue | `AC-09` |
| `PlanExercise` | Sets and reps | `AC-09` |
| `ProgressEntry` | Weight, measurements | `AC-07`, `NFR-07` |
| `TrainerAssignment` | **Which trainer may see which member** | `NFR-10` |

### 2.5 Scheduling & attendance

| Entity | Purpose | Traces to |
|---|---|---|
| `SessionSlot` | Trial and PT bookings | `AC-03`, `AC-08` |
| `AttendanceEvent` ⚠️ | Entrance check-in | `AC-05`, `AC-14`, `ENH-02` |
| `AttendanceDaily` | Pre-aggregate for the 5 s budget | `NFR-14` |

### 2.6 Equipment

| Entity | Purpose | Traces to |
|---|---|---|
| `Equipment` ⚠️ | Machine register, `In Maintenance` state | `AC-13`, `ENH-04` |
| `MaintenanceSchedule` | Recurring interval | `AC-13`, `NFR-13` |

### 2.7 Money

| Entity | Purpose | Traces to |
|---|---|---|
| `Payment` | cash / card / online | `AC-21`, `NFR-21` |
| `Receipt` | 1:1 with payment | `AC-04`, `AC-21` |
| `Invoice` | Numbered, idempotent | `AC-22`, `AC-25`, `NFR-22` |
| `Refund` | Executed refund. **`RefundRequest` was WITHDRAWN (`B-04`)** — `AC-24` treats approval as an *external* precondition, so `approvedByStaffId` / `approvedAt` / `approvalReference` capture it as data | `AC-24`, `NFR-24` |
| `LedgerEntry` | **Append-only** financial record | `AC-23`, `NFR-24`, ADR-011 |

### 2.8 Platform

| Entity | Purpose | Traces to |
|---|---|---|
| `AuditEvent` | **Append-only** audit trail | `NFR-24`, `ENH-13` |
| `NotificationOutbox` | Async dispatch | `NFR-01`, `NFR-19`, ADR-008 |

---

## 3. Field derivation

### 3.1 Fields closest to being sourced

| Field | Source text (verbatim) |
|---|---|
| `Member.name / email / phone` | `AC-01` "valid member info (Name, Email, Phone)" |
| `Member.memberCode` | `AC-01` "generate a Member ID" |
| `MembershipPlan.priceMinor / durationDays / accessRules` | `AC-16` "price, duration, and access rules are entered" |
| `MembershipPlan.published` | `AC-16` "saves and **publishes** the plan" |
| `Membership.state` | `AC-17` "Cancelled" · `AC-20` "Active"/"Expired" · `AC-19` expiring |
| `PlanExercise.sets / reps` | `AC-09` "exercises, sets, or reps" |
| `ProgressEntry.weightKg / measurements` | `AC-07` "logs weight or measurements" |
| `Payment.method` | `AC-21` "cash, card, or online" |
| `Equipment.status` | `AC-13` mark the machine "In Maintenance" |
| `MaintenanceSchedule.intervalDays` | `AC-13` "recurring service schedule (e.g., every 3 months)" |
| `Staff.status` | `AC-11` register → review → "Approve" → activate |

**Everything else is invented**: all ids, timestamps, hashes, JSON payloads, idempotency keys,
statuses not listed above, and every type and length.

### 3.2 `accessRules` — load-bearing and undefined

`AC-16` requires "access rules" on a plan. `AC-17` says cancelling must **"stop gym access"**;
`AC-18` says renewal must **"restore gym access"**. So `accessRules` is the mechanism behind two
other criteria — yet **no source says what an access rule is**.

Modelled as an open JSON column precisely because inventing a rigid schema would be inventing a
requirement. Logged as an assumption.

---

## 4. Membership state machine

**✅ RESOLVED — `B-05`.** See `docs/decisions/B-05_MEMBERSHIP_STATE_MACHINE.md`.
**Supersedes ADR-013.** The source supports **THREE** persisted states, not four:
`ACTIVE`, `EXPIRED`, `CANCELLED` — each appears in Lab 1 as a quoted status value.
**`Expiring` is NOT a state** — `AC-19` "expiring soon (e.g., in 7 days)" is a *predicate over
`expiresAt`*, never "set status to". Storing it would also hide rows from `AC-20`'s two named
filters. It is computed:
`isExpiringSoon ≡ state = ACTIVE ∧ (expiresAt − now) ≤ 7d`.

⚠️ **New finding (`B-05` §7): no user story creates a membership.** Transition T1 has no
source. Tracked as `ENH-19`, **IMPLIED-MANDATORY** — without it `US-17`, `US-18`, `US-19` and
`US-20` have nothing to operate on.

The diagram below retains the original four-state proposal for history and is **superseded**.

```
            ┌──────────────────────────────────────────┐
            │                                          │
   ┌────────▼────────┐  expiresAt - 7d   ┌─────────────┴───┐
   │     Active      │──────────────────►│    Expiring     │
   │     (AC-20)     │                   │    (AC-19)      │
   └────────┬────────┘                   └─────────┬───────┘
            │                                      │ expiresAt reached
            │ cancellation confirmed               ▼
            │ (AC-17)                     ┌─────────────────┐
            │                             │     Expired     │
            │                             │     (AC-20)     │
            │                             └────────┬────────┘
            │                                      │ renewal payment
            │                                      │ completed (AC-18)
            │                                      └──────────► Active
            ▼
   ┌─────────────────┐
   │    Cancelled    │  terminal — ASSUMED, no source states reversibility
   │     (AC-17)     │
   └─────────────────┘
```

⚠️ **Three problems the source leaves open:**
1. `AC-20` filters on **only two** states (Active, Expired). The UI must expose all four or
   contradict the criterion.
2. Whether `Cancelled` is reversible is **stated nowhere**. Assumed terminal.
3. `NFR-17` "only **valid** inactive memberships should be cancelled" — "valid" is undefined
   (`AMB-07`). Implemented as: only `Active`, `Expiring` and `Expired` may transition to
   `Cancelled`.

Every transition writes a `MembershipEvent` row. This table is the direct input to the required
state chart (`DIA-07`).

---

## 4b. Implemented constraints, indexes and triggers

SQLite cannot express `CHECK` via Prisma, so **36 CHECK constraints** are injected into the
migration SQL, alongside 2 partial unique indexes and 7 triggers. This is deliberate: the rules
below hold **even when application code is absent or wrong**.

### CHECK constraints (36)

| Table | Constraint |
|---|---|
| `Membership` | `state IN ('ACTIVE','EXPIRED','CANCELLED')` · `expiresAt > startsAt` · `(state='CANCELLED') = (cancelledAt IS NOT NULL)` |
| `MembershipEvent` | `toState` and nullable `fromState` limited to the same three values |
| `Payment` | `method IN ('cash','card','online')` · `status IN ('settled','failed')` · `amountMinor > 0` |
| `Invoice` | `status IN ('open','paid','overdue','void')` · `amountMinor > 0` |
| `Refund`, `LedgerEntry` | `amountMinor > 0` / `amountMinor <> 0`; `kind IN ('payment','refund','charge')` |
| `Branch`, `Staff`, `Equipment`, `SessionSlot`, `NotificationOutbox`, `AuditEvent`, `Session` | status/kind/channel/actor value sets |
| `SessionSlot` | `endsAt > startsAt` · **exactly one** of `memberId`/`prospectId` |
| `WorkoutPlan` | template ⇒ no member; non-template ⇒ member required |
| `MembershipPlan` | `priceMinor >= 0` · `durationDays > 0` |
| `PlanExercise` | `sets > 0` · `reps > 0` |
| `AttendanceDaily` | `visits >= 0` · `peakHour BETWEEN 0 AND 23` |
| `TrainerAssignment` | `source IN ('workout_plan','pt_session','admin')` |
| `MedicalRestriction` | `length(conditionCipher) > 0` |

**All 36 are exercised.** `tests/checks.test.ts` (`T-U-030`) has one case per constraint: a row
cloned from a real seeded row with exactly one value broken must be rejected. `T-U-031` is the
positive control — the same clone with a legal value must be **accepted** (inside a rolled-back
transaction), so a rejection cannot be an artefact of malformed test SQL. `T-U-032` re-reads the
live DDL from `sqlite_master` and fails if the schema ever grows a CHECK that has no case.

### Partial unique indexes (2)

| Index | Enforces |
|---|---|
| `Membership_one_active_per_member` | At most **one ACTIVE membership per member** (`B-05`) |
| `TrainerAssignment_one_live_per_pair` | At most one **live** assignment per (trainer, member); revoking frees the pair (`ENH-20`) |

### Triggers (7)

| Trigger | Enforces |
|---|---|
| `LedgerEntry_no_update` / `_no_delete` | Append-only ledger (ADR-011, `NFR-24`) |
| `AuditEvent_no_update` / `_no_delete` | Append-only audit trail (`ENH-13`) |
| `MembershipEvent_no_update` | Append-only state history (`WF-02`) |
| `Membership_state_transition_guard` | The **`B-05` transition table**: `CANCELLED` is terminal; `ACTIVE→{EXPIRED,CANCELLED}`; `EXPIRED→{ACTIVE,CANCELLED}` |
| `Refund_not_exceeding_payment` | Σ refunds ≤ payment amount (`NFR-24`) |

### Test isolation — the shared-database contract

The suite runs against **one** SQLite file (single-writer, so `vitest.config.ts` sets
`fileParallelism: false`). Rows a test leaves behind are therefore visible to every later test
file. This is not hypothetical: it produced a real defect — a cold-cache run failed
**135 / 136** because `constraints.test.ts` (12 members, 2 memberships, 2 payments, 2 refunds,
3 trainer assignments) and `membership.test.ts` (7 members, 7 memberships, 1 event) cleaned up
nothing, and `T-U-063` (seed determinism) compares the database either side of a re-seed that
truncates. The leaked rows were read as **seed non-determinism**, which they were not. Because
Vitest sequences files by cached duration, the failure moved between runs.

Every id minted by `uid()` carries the marker `_test_`. That marker — nothing else — defines a
test row, and the contract each test file honours is:

| Hook | Call | Proves |
|---|---|---|
| `beforeAll` | `expectPristine(db, 'entry')` | the **previous** file cleaned up |
| `afterAll` | `purgeTestRows(db)` | this file's rows are gone |
| `afterAll` | `expectPristine(db, 'exit')` | the purge was complete |
| suite teardown (`tests/global-setup.ts`) | `findTestRows(db)` | nothing survived the whole run |

The entry assertion is what makes the guarantee **order-independent** — a leak that happens to
be harmless in one file ordering still fails the run, and the error names the offending tables.

`purgeTestRows()` deletes child-first with `foreign_keys = ON` (a wrong order fails loudly
rather than orphaning rows) and deliberately does **not** disable the append-only triggers: a
test row in `LedgerEntry` or `AuditEvent` cannot be cleaned up, so no test may write to those
tables outside a rolled-back transaction. `RolePermission` is exempt — composite primary key,
no `id` column, and no test creates one. `T-U-006` guards the table list against schema drift.

`T-U-064` is the proof the mechanism works rather than the proof it is unused: it plants a row,
asserts the detector sees it, asserts `expectPristine` throws naming the table, purges, and
asserts the baseline is restored. Verified by negative control — with the purge disabled, every
individual test still passed while the run exited **1**. Evidence:
`docs/testing/evidence/phase3-test-isolation-20260816T152251Z.log`.

### ⚠️ Known limitation — Prisma discards trigger messages

Prisma maps SQLite `SQLITE_CONSTRAINT_TRIGGER` (code 1811) onto its generic **P2003 "Foreign key
constraint violated"**, throwing away the `RAISE(ABORT)` text. Verified in Phase 3:

```
via Prisma  → "Foreign key constraint violated on the foreign key"
via raw SQL → "Invalid membership transition: CANCELLED is terminal (B-05)"
```

**The write is still correctly rejected** — only the message is lost. Two consequences:

1. **The service layer must never branch on the Prisma error message** to distinguish a
   business-rule abort from a genuine FK violation. It must pre-check the rule and treat the
   trigger as a backstop.
2. Tests assert triggers **twice** — through Prisma (rejection happens) and through raw SQL
   (the real message is visible).

### ⚠️ Append-only triggers vs. re-seeding

The append-only triggers block the seed's own `DELETE` on re-run. `seed.ts` therefore reads the
trigger DDL back from `sqlite_master`, drops the triggers, truncates, then **restores them
verbatim** — so the migration stays the single source of truth and the DDL cannot drift. This
was found by the determinism test, not by inspection.

---

## 5. Branch scoping

**✅ RESOLVED — `B-03`.** See `docs/decisions/B-03_DECISION.md`. **Supersedes ADR-014.**
Branch is a **non-isolating scoping attribute**. Only four source sentences mention branches at
all, and `US-12` — "all locations can be **monitored from one system**" — argues *against*
tenant isolation. Classification: **ASSUMPTION**, not a requirement.

**Change from the Phase 2 proposal:** `Member.branchId` and `Staff.branchId` become
**`homeBranchId`, NULLABLE** — descriptive, not restrictive. No source restricts a member or a
staff member to one location. `Equipment` and attendance keep a **NOT NULL** `branchId`
(physical reality; `AC-14` "recorded at the entrance"). Plans stay global.
**No row-level tenant isolation. Admin reporting is cross-branch by default.**

The table below reflects the Phase 2 proposal and is superseded on the two nullability rows.

| Entity | `branchId`? | Rationale |
|---|---|---|
| `Staff` | ✅ | Staff work at a branch |
| `Member` | ✅ | Members register at a branch |
| `Equipment` | ✅ | Physically located |
| `AttendanceEvent`, `AttendanceDaily` | ✅ | Check-in happens somewhere |
| `MembershipPlan` | ❌ global | Plans assumed org-wide |
| `Payment`, `Invoice`, `LedgerEntry` | ❌ | Reachable via `Member` |

Scoping is enforced in **queries and RBAC**, not by row-level security. `NFR-12` becomes
testable as *10 branches × 1 000 members, no query > 5 s*.

⚠️ `AC-12` permits **disabling** a branch, and what happens to members attached to it is
**undefined** (`INC-09`). Assumed: the branch is marked disabled, rows are retained, and new
assignment is blocked.

---

## 6. Indexes

Added deliberately to serve a specific NFR, not speculatively.

| Index | Serves |
|---|---|
| `Member(memberCode)` UNIQUE | `AC-01`, `AC-02` lookup |
| `Member(email)` UNIQUE | `NFR-02` |
| `Member(branchId, name)` | Directory filtering, `AC-20` |
| `Membership(memberId, state)` | `AC-20` Active/Expired filter |
| `Membership(state, expiresAt)` | `AC-19` scheduler sweep |
| `AttendanceEvent(memberId, checkedInAt)` | `AC-05` |
| `AttendanceDaily(branchId, date)` UNIQUE | **`NFR-14` 5 s** |
| `LedgerEntry(occurredAt, kind)` | **`NFR-23` 5 s** |
| `Invoice(status, dueAt)` | `AC-25` overdue |
| `SessionSlot(trainerId, startsAt)` | `AC-08` availability |
| `SessionSlot(startsAt, status)` | `AC-03` open slots |
| `Session(tokenHash)` UNIQUE | Every authenticated request |
| `NotificationOutbox(status, attempts)` | Worker poll |
| `TrainerAssignment(trainerId, memberId)` UNIQUE | **`NFR-10`** |
| `Payment(idempotencyKey)` UNIQUE | `NFR-22` |
| `Invoice(idempotencyKey)` UNIQUE | `NFR-22` |

---

## 7. Constraints and integrity

**[REQ]** `NFR-02`, `NFR-17`, `NFR-24`.

| Constraint | Enforces | Implemented as |
|---|---|---|
| `Membership.state` CHECK ∈ **3** values (`ACTIVE`, `EXPIRED`, `CANCELLED`) | `NFR-17`, `B-05` | CHECK |
| `Payment.method` CHECK ∈ {cash, card, online} | `AC-21` | CHECK |
| `Payment.amountMinor > 0` | `NFR-24` | CHECK |
| Σ `Refund.amountMinor` ≤ `Payment.amountMinor` | `NFR-24` — no over-refund | `Refund_not_exceeding_payment` trigger |
| `Receipt.paymentId` UNIQUE | `AC-04` one receipt per payment | UNIQUE index |
| `Refund.approvedAt` / `approvedByStaffId` / `approvalReference` | `AC-24` "Given an **approved** refund request" — approval is an **external** precondition captured as data (`ENH-05` WITHDRAWN by `B-04`) | columns on `Refund` |
| FK `ON DELETE` `Cascade` / `Restrict` / `SetNull`, declared per relation | `NFR-13`, `NFR-07` | FK actions |
| `LedgerEntry`, `AuditEvent` — no UPDATE/DELETE; `MembershipEvent` — no UPDATE | ADR-011, `ENH-13`, `WF-02` | triggers |

> ⚠️ **Corrected 2026-08-16.** This table previously described a 4-value state CHECK (superseded
> by `B-05`), a `Refund.refundRequestId` UNIQUE and a `RefundRequest.status` precondition — none
> of which exists: `RefundRequest` was withdrawn by `B-04` and never implemented.

**Append-only is enforced by the database, not by application code** — `LedgerEntry` and
`AuditEvent` carry `BEFORE UPDATE` and `BEFORE DELETE` triggers, `MembershipEvent` a
`BEFORE UPDATE` trigger. This was previously described as a repository-layer concern with
triggers "a possible belt-and-braces addition"; the triggers are implemented and there is no
repository layer yet, so the database is the only thing enforcing it.

---

## 8. Transactions

Services own transaction boundaries (ADR-002). Three operations **must** be atomic:

| Operation | Must include | Driver |
|---|---|---|
| Register member (`AC-01`) | `Member` + `AuditEvent` + outbox row | `NFR-01`, `NFR-24` |
| Collect payment (`AC-21`) | `Payment` + `Receipt` + `LedgerEntry` + `AuditEvent` | `NFR-24` |
| Process refund (`AC-24`) | `Refund` + `LedgerEntry` + `AuditEvent` + request status | `NFR-24` |
| Renew membership (`AC-18`) | `Payment` + `Membership.expiresAt` + `MembershipEvent` | `NFR-18` |

SQLite is single-writer; transactions must stay short. Report queries are read-only and run
outside transactions.

---

## 9. Migrations

`prisma migrate` — timestamped SQL, committed, applied via `prisma migrate deploy` on boot.
Never hand-edited after being applied; corrections are new migrations.

**[ENG]** — no source requires migrations, but they give `NFR-07`/`NFR-13` (durability) a
tested path and make the academic demonstration reproducible.

---

## 10. Backup and durability

**[REQ]** `NFR-07` "without data loss", `NFR-13` "should **never** be lost".

⚠️ Both are **absolutes and unfalsifiable as written** (ADR-012). Realistic proxies:

| Control | Proxy for |
|---|---|
| WAL mode + `synchronous = FULL` | `NFR-07` — committed transactions survive crash |
| Scheduled file backup + `PRAGMA integrity_check` | `NFR-13` |
| **Tested restore drill** | `NFR-13` — an untested backup is not a backup |
| Soft delete + append-only tables | `NFR-13` |

Reports must state that the absolute claim cannot be proven, and report the proxy instead.

---

## 11. Seed data (`ENH-16`) — IMPLEMENTED

> ⚠️ **DEVELOPMENT SEED DATA — NOT PRODUCTION DATA.**
> Every name, email and phone number is fabricated. Emails use the RFC 2606 reserved
> `.invalid` TLD and can never resolve. `passwordHash` is the literal placeholder
> `DEV_SEED_NOT_A_REAL_HASH` — **not a usable credential**. `conditionCipher` values are
> `DEV_SEED_PLACEHOLDER:` strings, **not encrypted data**. All three facts are asserted by
> `T-U-062`.

**Deterministic**: a fixed mulberry32 seed (`20260816`) and a fixed epoch mean repeated runs
produce byte-identical data. `T-U-063` re-runs the seed and compares a content fingerprint.

Scale — the ADR-012 🟦 **ENGINEERING VERIFICATION THRESHOLD** for a student/college project:

| Entity | Rows | Entity | Rows |
|---|---|---|---|
| Branch | 4 — **3 `active` · 1 `disabled`** (`AC-12`) | AttendanceEvent | 11 792 |
| Role / Permission | 6 / 36 | AttendanceDaily | 270 |
| Staff | 18 (incl. 1 `pending` for `AC-11`) | Equipment | 36 |
| Member | 1 000 | MaintenanceSchedule | 36 |
| MembershipPlan | 5 | Payment / Receipt | 952 / 952 |
| Membership | 1 000 — **725 ACTIVE · 175 EXPIRED · 100 CANCELLED** | Invoice | 952 |
| MembershipEvent | 1 375 | Refund | 37 |
| TrainerAssignment | 350 | LedgerEntry | 989 |
| WorkoutPlan / PlanExercise | 250 / 960 | AuditEvent | 101 |
| ProgressEntry | 840 | NotificationOutbox | 100 |
| MedicalRestriction / Prospect | 40 / 40 | SessionSlot | 158 |

Runs in **~950 ms**. Deliberately **not** production scale — `T-U-060` asserts both the floor
(so NFR measurement is meaningful) and a ceiling (so no production-scale claim is implied).

The seed also guarantees a non-empty result for the **derived** "expiring soon" query (`AC-19`),
so `B-05`'s decision that `EXPIRING` is a predicate rather than a state is exercised with real
data.

## 11b. Database initialisation / reset

```bash
npm run db:deploy        # apply migrations
npm run db:seed          # deterministic development seed
npm run db:reset         # delete local dev DB file -> migrate -> seed
npm run db:reset:noseed  # schema only
```

⚠️ `prisma migrate reset` is **not** used. It is guarded against invocation by AI agents, and
that guard was respected rather than bypassed. `src/db/reset.ts` performs the equivalent for a
**local development SQLite file** (delete file → `migrate deploy` → seed) and refuses to run
when `NODE_ENV=production`.

## 11c. NFR testing implications

| NFR | What the database now provides | Still required |
|---|---|---|
| `NFR-01` 3 s registration | Indexed `Member` insert; outbox row avoids inline email | Service + API + timing harness |
| `NFR-14` 5 s attendance report | `AttendanceDaily` pre-aggregate + `(branchId,date)` unique index | Report query + measurement |
| `NFR-23` 5 s revenue report | `LedgerEntry(occurredAt,kind)` index; append-only ledger | Report query + measurement |
| `NFR-10` medical access | `TrainerAssignment` + `(trainerId,memberId)` index | RBAC guard + `T-SEC-001` |
| `NFR-17` valid cancellation | Transition guard trigger + CHECK | Service-level rule + `AC-17` test |
| `NFR-22` invoice accuracy | `idempotencyKey` unique on `Payment` and `Invoice` | Idempotent generation |
| `NFR-24` financial accuracy | Integer minor units · append-only ledger · refund ≤ payment trigger | Ledger invariant test |
| `NFR-07`/`NFR-13` durability | WAL + `synchronous = FULL`; soft delete; no hard-delete path | Backup/restore drill |

**None of these NFRs is VERIFIED.** Database support exists; verification needs the service,
API and test layers.

---

## 12. Decision status

`B-03`, `B-04` and `B-05` were **resolved** in the pre-Phase-3 decision review and the schema
implements those resolutions. They are no longer open.

| ID | Question | Resolution | Where it lives in the schema |
|---|---|---|---|
| `B-03` | Branch scoping | **RESOLVED** — descriptive attribute, not a tenant boundary | `docs/decisions/B-03-*` · §5; `Member.homeBranchId` / `Staff.homeBranchId` NULLABLE |
| `B-04` | Five missing write paths | **RESOLVED** — `ENH-02/03/04/06/07` implemented, `ENH-05` withdrawn | `docs/decisions/B-04-*`; approval captured as data on `Refund` |
| `B-05` | Membership state set | **RESOLVED** — exactly `ACTIVE` / `EXPIRED` / `CANCELLED` | `docs/decisions/B-05-*` · §4; CHECK + transition-guard trigger |

Still open, and **not** database-blocking:

| ID | Question | Assumed | Cost if wrong |
|---|---|---|---|
| `B-01` / `B-02` | Member login · authorisation model | Six roles incl. Member (`ENH-01`) | Service-layer RBAC, not schema |
| `B-06` | Experiment numbering | Recorded unresolved in `PRE_PHASE_3_DECISION_REGISTER.md` | Submission labelling only |
| — | `accessRules` shape (`AMB`) | Open JSON | Two other criteria depend on it |

---

## 13. Related

`docs/diagrams/er/er-model.png` + `NOTES.md` · `SYSTEM_ARCHITECTURE.md` ·
`SECURITY_ARCHITECTURE.md` · `ARCHITECTURAL_DECISIONS.md` (ADR-005, 011, 013, 014) ·
`docs/requirements/LAB1_TRACEABILITY_MATRIX.md`

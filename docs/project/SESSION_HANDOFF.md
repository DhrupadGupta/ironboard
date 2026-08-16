# Ironboard — Session Handoff

**Written:** 2026-08-16 · **Branch:** `claude/analyze-repo-requirements-06itgc` ·
**HEAD:** `2c67587` · **PR:** [#1](https://github.com/DhrupadGupta/ironboard/pull/1)

> **This document is a HANDOFF, not a replacement for the academic sources.**
> `reference/` remains the authoritative source and is **READ-ONLY**. Every requirement claim in
> this file must be re-verified against `reference/lab1/`, `reference/lab2/`,
> `reference/course-policy/` and `reference/experiments/` before being relied on. Nothing in
> `reference/` may be modified, renamed, deleted or overwritten.

---

## 1. CURRENT PROJECT STATE

| Field | Value |
|---|---|
| **Current phase** | **Phase 3 — Foundation / Database. COMPLETE, self-review PASSED.** |
| **Completed phases** | Phase 0 (analysis + skills) · Phase 1 (master plan) · Phase 2 (architecture documents + architecture diagram) · Phase 3 (database) |
| **Current phase status** | Phase 3 closed. 12-point self-review executed against a live database; 3 defects found and fixed. A **4th defect — test isolation — was found later by repository re-verification and is now fixed** (see §12). **139 tests passing**; typecheck clean. **Phase 4 NOT started.** |
| **Overall project status** | 🟡 **Foundation only.** A database layer exists. **No service layer, no API, no HTTP server, no frontend, no authentication, no authorisation, no UI.** Zero of the 25 functional requirements are functionally delivered. Zero of the 25 NFRs are VERIFIED. 0 of the 11 mandatory academic diagrams and 0 of the 1 mandatory written artefact exist. |

### Phase table (mirrors `docs/project/PHASE_STATUS.md`)

| Phase | Name | Status |
|---|---|---|
| 0 | Analysis & skills | ✅ |
| 1 | Master plan | ✅ |
| 2 | Architecture ✅ / Requirements & design diagrams 🔴 | 🟡 |
| 3 | Foundation — database | ✅ |
| 4 | Department modules (service + API) | 🔴 not started |
| 5 | Frontend | 🔴 |
| 6 | Cross-cutting | 🔴 |
| 7 | Verification | 🔴 |
| 8 | Academic deliverables | 🔴 |
| 9 | Audit & submission | 🔴 |

---

## 2. WHAT WAS COMPLETED IN THIS SESSION

This session spanned Phase 0 → Phase 3 plus the Phase 3 self-review.

### Features implemented

**Database layer only.** No application feature is reachable by a user. What exists is the
persistence substrate: 28 entities, DB-level integrity enforcement, deterministic development
seed, and a reset mechanism.

### Files created

**Server (`server/`)**

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | 28 Prisma models — the core Phase 3 artefact |
| `prisma/migrations/20260816135841_init/migration.sql` | Prisma DDL + hand-injected CHECK constraints, partial unique indexes and triggers |
| `prisma/migrations/migration_lock.toml` | Provider lock (sqlite) |
| `src/db/client.ts` | Prisma singleton + `applyPragmas()` / `readPragmas()` |
| `src/db/ids.ts` | mulberry32 PRNG, `SEED_EPOCH`, deterministic id helpers |
| `src/db/seed.ts` | DEVELOPMENT SEED DATA (`ENH-16`) |
| `src/db/reset.ts` | Local reset: delete DB file → `migrate deploy` → seed; refuses under `NODE_ENV=production` |
| `tests/global-setup.ts` | Builds a fresh test DB from migrations + seed before every run |
| `tests/helpers.ts` | `testDb()`, `expectRejection()`, `uid()` |
| `tests/schema.test.ts` | `T-U-001..005` |
| `tests/constraints.test.ts` | `T-U-020..024` |
| `tests/checks.test.ts` | `T-U-030..032` — **created in the self-review** |
| `tests/membership.test.ts` | `T-U-040..045`, `T-I-043` |
| `tests/relationships.test.ts` | `T-I-050..053` |
| `tests/seed.test.ts` | `T-U-060..064` |
| `package.json`, `tsconfig.json`, `vitest.config.ts`, `.env` (untracked) | Workspace config |

**Documentation (`docs/`)**

| File | Purpose |
|---|---|
| `project/REFERENCE_ANALYSIS.md` | Full extraction of every requirement with its source document |
| `project/REQUIREMENT_GAP_ANALYSIS.md` | `CON-01..11`, `AMB-01..16`, `INC-01..12`, risks, `B-01..06` |
| `project/MASTER_PLAN.md` | Phase 1 master plan (29 sections) |
| `project/PHASE_STATUS.md` | Live phase status |
| `project/MANDATORY_DIAGRAM_COVERAGE.md` | **11 mandatory diagrams + 1 written artefact = 12 deliverables** |
| `project/PRE_PHASE_3_DECISION_REGISTER.md` | ENH-19, ENH-20, ADR-012; B-06/ASM-09/AMB-10 recorded unresolved; "DATABASE SAFE TO IMPLEMENT: YES" |
| `project/SESSION_HANDOFF.md` | This file |
| `decisions/B-03_DECISION.md` | Branch scoping |
| `decisions/B-04_API_DECISIONS.md` | The five missing write paths |
| `decisions/B-05_MEMBERSHIP_STATE_MACHINE.md` | Membership state set |
| `decisions/DEVIATIONS.md` | AC-11 and NFR-10 deviations |
| `architecture/SYSTEM_ARCHITECTURE.md`, `DATABASE_DESIGN.md`, `API_ARCHITECTURE.md`, `SECURITY_ARCHITECTURE.md` | Phase 2 architecture |
| `architecture/ARCHITECTURAL_DECISIONS.md` | ADR-001…ADR-015 |
| `architecture/TECHNOLOGY_DECISIONS.md` | Stack + ORM justification |
| `architecture/ADR-012-NFR-THRESHOLDS.md` | Engineering verification thresholds |
| `requirements/LAB1_TRACEABILITY_MATRIX.md` | US ↔ AC ↔ FR |
| `requirements/LAB2_NFR_TRACEABILITY.md` | NFR-01..25 |
| `requirements/ENH-19_MEMBERSHIP_CREATION.md`, `ENH-20_TRAINER_ASSIGNMENT.md`, `NFR_VERIFICATION_THRESHOLDS.md` | Pre-Phase-3 resolutions |
| `ui/DESIGN_SYSTEM.md` | Token-level extraction of the homepage |
| `diagrams/architecture/architecture.puml` + `.png` + `NOTES.md` | Architecture diagram (ENHANCEMENT) |
| `diagrams/er/er-model.puml` + `.png` + `NOTES.md` | `DIA-16` ER model (ENHANCEMENT) |
| `testing/evidence/phase3-db-20260816T140858Z.log` | Phase 3 implementation evidence |
| `testing/evidence/phase3-selfreview-20260816T145257Z.log` | Phase 3 self-review evidence |

**Skills (`.claude/skills/`)** — six: `software-engineering-diagrams`,
`requirements-traceability`, `ironboard-ui-visual-qa`, `testing-and-quality`,
`academic-submission-audit`, `software-engineering-documentation`.

### Files modified (in the self-review specifically)

| File | Change |
|---|---|
| `server/src/db/seed.ts` | Removed a dead ternary; added a dependent-free `disabled` branch (`AC-12` fixture); header scale comment corrected |
| `server/tests/seed.test.ts` | `T-U-060` now expects 4 branches (3 active + 1 disabled) and asserts the split |
| `docs/diagrams/er/er-model.puml` + `.png` | Redrawn from the implemented schema |
| `docs/diagrams/er/NOTES.md` | `RefundRequest` struck through as WITHDRAWN; B-03/B-04/B-05 marked RESOLVED; aspect ratio recorded honestly as an accepted deviation |
| `docs/architecture/DATABASE_DESIGN.md` | Test count 63→136; CHECK coverage paragraph; seed counts corrected; §12 rewritten from "Open decisions" to "Decision status" |
| `docs/project/PHASE_STATUS.md` | Self-review outcome recorded |
| `CLAUDE.md` | Updated across the session (skills table, ID system, environment notes) |

### Database changes

- 28 entities; 36 CHECK constraints; 2 partial unique indexes; 7 triggers; FKs with explicit
  `Cascade` / `Restrict` / `SetNull`; indexes on every documented query path.
- Pragmas: `foreign_keys = ON`, `synchronous = FULL`, `journal_mode = WAL`.
- Money stored as `INTEGER` minor units throughout (`NFR-24`). **No floats anywhere.**
- Deterministic seed: 4 branches (3 active + 1 disabled) · 6 roles · 36 permissions · 18 staff
  (1 `pending`) · 1 000 members · 5 plans · 1 000 memberships (`ACTIVE=725 EXPIRED=175
  CANCELLED=100`) · 11 792 attendance events · 952 payments/receipts/invoices · 989 ledger
  entries. Runs in ~1.3 s.

### API changes

**None.** No HTTP server, no route, no controller, no service exists. `docs/architecture/API_ARCHITECTURE.md` is a *design*, not an implementation.

### UI changes

**None.** No frontend package exists. `docs/ui/DESIGN_SYSTEM.md` is an extraction of the
read-only homepage `reference/design/gym-management-homepage-2.html`, not code.

### Documentation changes

See the file tables above. All Phase 0–3 documents plus the self-review corrections.

### Diagrams created

| Diagram | ID | Status |
|---|---|---|
| `docs/diagrams/architecture/architecture.png` | — | **ENHANCEMENT** — not academic coverage |
| `docs/diagrams/er/er-model.png` | `DIA-16` | **ENHANCEMENT** — not academic coverage |

**0 of the 11 mandatory academic diagrams exist.** Neither of the two above counts toward
academic diagram coverage.

### Tests created

63 tests in Phase 3, plus 73 in the self-review = 136, plus 3 in the test-isolation fix
(§12) = **139**.

| File | IDs |
|---|---|
| `schema.test.ts` | `T-U-001..005` — tables, pragmas, indexes, nullability |
| `constraints.test.ts` | `T-U-020..024` — decision-carrying CHECKs, uniqueness, append-only triggers, refund ≤ payment |
| `checks.test.ts` | `T-U-030` all 36 CHECKs reject · `T-U-031` positive controls · `T-U-032` schema-drift guard |
| `membership.test.ts` | `T-U-040..045`, `T-I-043` — B-05 state machine and transition guard |
| `relationships.test.ts` | `T-I-050..053` — FK cascade/restrict/set-null, financial invariants |
| `seed.test.ts` | `T-U-060..064` — scale, coverage, no real credentials, determinism, integrity |

### Tests run

`npm run typecheck` clean · `npm test` → **139/139 passing**, 6 files, ~9.4 s ·
clean rebuild from migrations verified.
Evidence: `docs/testing/evidence/phase3-selfreview-20260816T145257Z.log`,
`docs/testing/evidence/phase3-test-isolation-20260816T152251Z.log`.

⚠️ **The "136/136" figure originally recorded in this file was wrong** — see §12. It held only
for the file orderings in which `seed.test.ts` ran first.

---

## 3. CURRENT ARCHITECTURE

> **Read this section as "what exists on disk today".** Where something is designed but not
> built, it says so explicitly.

### Frontend architecture

**DOES NOT EXIST.** No `client/` or `web/` package, no React code, no Vite config, no component.
The *decision* is React + TypeScript + Vite (`TECHNOLOGY_DECISIONS.md`); the *implementation* is
nothing.

### Backend architecture

**PARTIAL — database access only.**

- Exists: `server/src/db/` — Prisma client singleton, pragma application, deterministic id
  helpers, seed, reset.
- Does not exist: Express, HTTP server, routing, controllers, services, repositories,
  validation, error middleware, logging middleware.
- npm workspaces; ESM; TypeScript strict; `tsx` for execution; Vitest for tests.

### Database architecture

**EXISTS AND IS THE ONLY WORKING LAYER.**

- SQLite (WAL, `synchronous = FULL`, `foreign_keys = ON`) via Prisma 6.19.3 +
  `better-sqlite3` (ADR-005).
- 28 entities across identity/access, members & health, membership, training, attendance,
  equipment, money, platform.
- Integrity is enforced **by the database, not by absent application code**: 36 CHECK
  constraints, 2 partial unique indexes (`WHERE state = 'ACTIVE'`,
  `WHERE revokedAt IS NULL`), 7 triggers (append-only on `LedgerEntry` / `AuditEvent` /
  `MembershipEvent`; membership transition guard; refund ≤ payment).
- CHECK constraints are hand-injected into the generated migration SQL because **Prisma cannot
  express CHECK**. `T-U-032` guards against schema drift.

### Authentication

**DOES NOT EXIST.** A `Session` table exists (revocable server-side sessions, ADR-006 — chosen
over JWT because `AC-11` and `AC-17` both need immediate access change) and contains **0 rows**.
`Staff.passwordHash` and `Member.passwordHash` hold the literal placeholder
`DEV_SEED_NOT_A_REAL_HASH` — **no hashing algorithm has been chosen or implemented**.

### Authorization

**DOES NOT EXIST.** `Role` (6), `Permission` (36) and `RolePermission` (60) rows are seeded, and
`TrainerAssignment` exists to support `NFR-10`'s "authorized trainers". **No guard, middleware
or check reads any of it.** `B-01` (do members log in) and `B-02` (authorisation model) are
still unresolved.

### Integrations

**None.** `NotificationOutbox` implements the transactional-outbox *data shape* (ADR-008) but no
dispatcher, no email provider, no SMS provider. SMS is explicitly a stub (`AMB-12`).

### Important design decisions

| ID | Decision |
|---|---|
| ADR-005 | SQLite + Prisma + `better-sqlite3` |
| ADR-006 | Revocable server-side sessions, not JWT |
| ADR-008 | Transactional outbox for notifications — keeps third-party latency out of `NFR-01`'s 3 s budget |
| ADR-011 | Append-only ledger; corrections are compensating entries, never edits |
| ADR-012 | Engineering verification thresholds for a student/college project — **not** production SLAs |
| ADR-013 | Membership state set (superseded by the B-05 resolution — three states, not four) |
| ADR-014 | Branch columns (superseded by the B-03 resolution — descriptive, not isolating) |
| — | Money as `INTEGER` minor units, never a float (`NFR-24`) |
| — | Integrity enforced at the DB layer so rules hold even when application code is absent or wrong |

---

## 4. REQUIREMENT STATUS

> **Definitions used here.** *Completed* = the requirement is functionally delivered and
> evidenced. *Database support exists* ≠ completed. Per the standing instruction, no requirement
> is marked VERIFIED merely because a table or constraint exists.

### Lab 1 requirements

**Completed: 0 of 25.** `FR-REC-01..05`, `FR-TRN-01..05`, `FR-ADM-01..05`, `FR-MEM-01..05`,
`FR-ACC-01..05` — none has a service, API or UI. `US-01`…`US-25` and `AC-01`…`AC-25` are all
incomplete.

**Incomplete: all 25.** They fall into three groups:

| Group | IDs | Position |
|---|---|---|
| Database support exists; service + API + UI + test remain | `US-01/AC-01/FR-REC-01` … and the majority of the 25 | Unblocked — Phase 4 can start on these |
| Depended on a `B-04` "read data nobody creates" gap, now resolved by an enhancement | `US-05`, `US-14` (`ENH-02` check-ins) · `US-10` (`ENH-03` medical) · `US-13` (`ENH-04` equipment) · `US-11` (`ENH-06` staff self-registration) · `US-03` (`ENH-07` prospects) | Unblocked, but the unblocking entity is an **enhancement**, not a source requirement |
| Depends on an unresolved decision | Anything requiring login or role enforcement — gated on `B-01`, `B-02` | **Blocked** |

### Lab 2 NFRs

**Completed / VERIFIED: 0 of 25.** `NFR-01`…`NFR-25` are all unverified. Verification requires
the service layer, the API layer and a timing harness, none of which exist.

**Database support exists (not verification) for:** `NFR-01` (indexed insert + outbox),
`NFR-07`/`NFR-13` (WAL + `synchronous = FULL`, soft delete), `NFR-09` (`WorkoutPlan.version`),
`NFR-10` (`TrainerAssignment` + index), `NFR-14` (`AttendanceDaily` pre-aggregate),
`NFR-17` (transition-guard trigger + CHECK), `NFR-19` (outbox dispatch),
`NFR-22` (`idempotencyKey` unique on `Payment` and `Invoice`),
`NFR-23` (`LedgerEntry(occurredAt, kind)` index), `NFR-24` (integer minor units, append-only
ledger, refund ≤ payment trigger).

**No database support yet for:** `NFR-21` (field encryption — `conditionCipher` holds
placeholders, not ciphertext), and every NFR whose subject is the UI or the API surface.

### Experiment deliverables

**Completed: 0 diagrams, 0 written artefacts.**

**Incomplete — the full mandatory set (11 diagrams + 1 written artefact = 12 deliverables),
per `docs/project/MANDATORY_DIAGRAM_COVERAGE.md`:**

| Source | Deliverable | Status |
|---|---|---|
| Policy Lab 3 | DFD level-0, level-1, level-2 (3) | 🔴 |
| Policy Lab 4 | Use case diagram · Activity diagram (2) | 🔴 |
| Policy Lab 4 | **Documentation of use cases** (1 **written artefact**, not a diagram) | 🔴 |
| Policy Lab 5 | State chart diagram (1) | 🔴 |
| Policy Lab 6 | Sequence · Class · State transition (3) | 🔴 |
| Policy Lab 7 | User interface diagram — three golden rules (1) | 🔴 |
| `EXP-7-COLLAB.docx` | Collaboration diagram (1) | 🔴 |

⚠️ **Do not describe this as "12 diagrams."** It is **11 diagrams + 1 written artefact**.
`DIA-15` and `DIA-16` are **engineering enhancements** and must never be counted toward academic
diagram coverage.

Also outstanding: `AMB-10` — the source does not provide the five shortlisted case studies for
the literature survey. **They must not be fabricated.** Recorded as
**EVIDENCE NOT AVAILABLE** in `PRE_PHASE_3_DECISION_REGISTER.md`.

---

## 5. IMPORTANT DECISIONS

### `B-03` — Is branch a data-scoping boundary? **RESOLVED: NO**

Branch is a **descriptive attribute, not a tenant/isolation boundary**. Only a handful of source
sentences mention branches, and none bars a member from using another branch.
Implementation: `Member.homeBranchId` and `Staff.homeBranchId` **NULLABLE**;
`Equipment.branchId`, `AttendanceEvent.branchId`, `AttendanceDaily.branchId` NOT NULL (physical
location); `MembershipPlan` carries **no** branch column (plans are global). Verified live: 44
members and 1 staff carry NULL. **No query path filters by branch.**
→ `docs/decisions/B-03_DECISION.md`

### `B-04` — Who creates the five missing record types? **RESOLVED**

Five acceptance criteria read data that no user story creates. Resolution: `ENH-02` (check-in
events), `ENH-03` (medical restrictions), `ENH-04` (equipment + maintenance), `ENH-06`
(staff self-registration → `Staff.status = 'pending'`), `ENH-07` (prospects) are implemented as
enhancements. **`ENH-05` (a `RefundRequest` workflow) was WITHDRAWN as over-engineered** —
`AC-24`'s "approved refund request" is an **external** precondition, so approval is captured as
*data* on `Refund` (`approvedByStaffId`, `approvedAt`, `approvalReference`).
→ `docs/decisions/B-04_API_DECISIONS.md`

### `B-05` — Membership state set? **RESOLVED: exactly three**

`ACTIVE` · `EXPIRED` · `CANCELLED`. **`EXPIRING` is a derived predicate, never a stored state.**
Enforced three ways: CHECK constraint; `RAISE(ABORT)` transition-guard trigger (CANCELLED is
terminal); partial unique index allowing one ACTIVE membership per member. Live counts
`ACTIVE=725 EXPIRED=175 CANCELLED=100`; the derived "expiring within 7 days" query returns 100.
This **supersedes ADR-013**, which had four states.
→ `docs/decisions/B-05_MEMBERSHIP_STATE_MACHINE.md`

### `ENH-19` — Membership creation is separate from member registration

`AC-01` registers a member; it says nothing about a membership. `ENH-19` attaches a membership
**after** registration so `AC-01`'s wording is never rewritten. Structurally guaranteed:
`Membership.memberId` is NOT NULL and `Member` has no membership column, so a member row is
creatable with no membership. Verified: the `US-01` block contains **zero** occurrences of
"membership". → `docs/requirements/ENH-19_MEMBERSHIP_CREATION.md`

### `ENH-20` — Trainer assignment provenance

`NFR-10` says "**authorized** trainers", which is stricter than a role check.
`TrainerAssignment` records *why* a trainer may see a member: `source ∈ {workout_plan,
pt_session, admin}` (CHECK-enforced), with `grantedByStaffId` and a nullable `revokedAt`. A
partial unique index allows one **live** assignment per (trainer, member) pair; revoking frees
the pair. → `docs/requirements/ENH-20_TRAINER_ASSIGNMENT.md`

### `AC-11` — Staff activation, no password transmission

Staff self-register as `status = 'pending'` and are approved by an administrator. **No password
is ever transmitted.** The schema carries `activationTokenHash` (unique, nullable) +
activation fields; the token is hashed, never stored in the clear. Seed contains exactly 1
pending staff account so the criterion has a subject. Recorded deviation in
`docs/decisions/DEVIATIONS.md`.

### `NFR-10` — Medical data restricted to *assigned* trainers

Role alone is insufficient; access must be gated on a live `TrainerAssignment`. Live fixture
check: all 40 members with a restriction have ≥ 1 live trainer, **and there are 240
(trainer, restricted-member) pairs with no assignment** — the denial fixture the security test
will need. **The guard itself does not exist yet.** Recorded deviation in `DEVIATIONS.md`.

### `ADR-012` — NFR verification thresholds

🟦 **ENGINEERING VERIFICATION THRESHOLDS**, explicitly **not** sourced from the academic
material and explicitly **not** production SLAs. Scaled for a student-developed local/college
project: 3 operating branches · 1 000 members · 90 days of attendance · ≤ 10 concurrent users.
Every threshold is labelled so it can never be mistaken for a source requirement.
→ `docs/architecture/ADR-012-NFR-THRESHOLDS.md`, `docs/requirements/NFR_VERIFICATION_THRESHOLDS.md`

### `ENH-16` — Development seed data

Deterministic (mulberry32, seed `20260816`, fixed `SEED_EPOCH = 2026-08-16T00:00:00Z`) so
repeated runs are byte-identical; `T-U-063` proves it. **Contains no real personal information
and no real credential**: `.invalid` (RFC 2606) email domains, `DEV_SEED_NOT_A_REAL_HASH`
password placeholders, `DEV_SEED_PLACEHOLDER:` medical strings. `T-U-062` asserts all three.

### New decisions made in this session's self-review

| # | Decision | Rationale |
|---|---|---|
| SR-1 | **Every CHECK constraint must have a negative case, a positive control and a drift guard** | A CHECK that is never exercised is indistinguishable from one that was never written. The positive control exists so a rejection cannot be an artefact of malformed test SQL. |
| SR-2 | **The seed must contain a `disabled` branch** | `AC-12` disables a branch; without a disabled fixture, half the criterion has nothing to test against. Added as a dependent-free 4th branch. |
| SR-3 | **The ER diagram is regenerated from `schema.prisma`, not maintained in parallel** | It had already drifted (4 states, withdrawn `RefundRequest`, wrong branch columns). The schema is the single source of truth. |
| SR-4 | **The ER diagram's 2.56 aspect ratio is an accepted deviation, recorded as such** | It exceeds the skill's 2.5 guideline. Every label was read back and is legible, so it was accepted — but recorded as a **deviation, not a passed check**. |
| SR-5 | **The service layer must never branch on Prisma's error message text for trigger-enforced rules** | Prisma maps `SQLITE_CONSTRAINT_TRIGGER` (1811) onto generic P2003 "Foreign key constraint violated", discarding the `RAISE(ABORT)` text. |

---

## 6. ASSUMPTIONS

### 🟩 SOURCE REQUIREMENT — from `reference/`, never to be rewritten

- 25 functional requirements · 25 user stories · 25 acceptance criteria · 25 NFRs.
- `US-nn ↔ AC-nn ↔ FR-…-nn ↔ NFR-nn` is a fixed 1:1 mapping. **Never renumber.**
- 5 departments `D01`–`D05`; 10 actors `ACT-01`–`ACT-10`; 7 workflows `WF-01`–`WF-07`.
- 11 mandatory diagrams + 1 mandatory written use-case documentation artefact.
- The homepage `reference/design/gym-management-homepage-2.html` is the visual source of truth
  and **must not be redesigned**.
- The requirement set is **closed**. Anything else is an enhancement.

### 🟦 ENGINEERING DECISION — chosen by us, justified, not sourced

- Stack: React + TypeScript + Vite / Node + Express + TypeScript / SQLite.
- ORM: Prisma 6 + `better-sqlite3` (ADR-005).
- Revocable server-side sessions over JWT (ADR-006).
- Transactional outbox (ADR-008); append-only ledger (ADR-011).
- Money as `INTEGER` minor units.
- Integrity enforced at the DB layer (CHECKs, partial indexes, triggers).
- All ADR-012 verification thresholds.
- Six roles including Member.
- B-03, B-04, B-05 resolutions (derived *from* sources, but the resolution is ours).

### ⬜ ASSUMPTION — unresolved, could be wrong, would cost rework

| ID | Assumption | Cost if wrong |
|---|---|---|
| `AMB` | `MembershipPlan.accessRules` is open JSON | Two acceptance criteria depend on its shape |
| `INC-05` | No field type or length is sourced — every one is chosen | Broad but shallow rework |
| `ASM-09` | Recorded unresolved in `PRE_PHASE_3_DECISION_REGISTER.md` | See that file |
| — | Six roles incl. Member is the right actor set (pending `B-01`/`B-02`) | Service-layer RBAC rework, not schema |
| — | Data volumes in `ENH-16` are adequate to make NFR measurement meaningful | Performance NFRs become unmeasurable |

### 🟨 ENGINEERING ENHANCEMENT — `ENH-nn`, never counted toward academic coverage

`ENH-01` Member role · `ENH-02` check-in events · `ENH-03` medical restrictions ·
`ENH-04` equipment + maintenance · ~~`ENH-05` RefundRequest~~ **WITHDRAWN** ·
`ENH-06` staff self-registration · `ENH-07` prospects · `ENH-08` workout-plan templates ·
`ENH-13` audit log · `ENH-16` development seed · `ENH-19` membership creation ·
`ENH-20` trainer-assignment provenance · `DIA-15`, `DIA-16` diagrams · the architecture diagram.

---

## 7. CURRENT BLOCKERS

### Blockers (work cannot correctly proceed)

| ID | Blocker |
|---|---|
| `B-01` | **Do members log in, or is this staff-only?** Unresolved. Gates the entire authentication surface. |
| `B-02` | **What is the authorisation model?** Unresolved. Gates every RBAC guard in Phase 4. |
| `B-06` | **Which experiment numbering governs?** Unresolved. Affects submission labelling only, not code. |
| `AMB-10` | The source does **not** provide the five shortlisted case studies for the literature survey. Recorded as **EVIDENCE NOT AVAILABLE**. **They must not be fabricated.** |

### Warnings

1. **Prisma discards SQLite trigger messages.** `SQLITE_CONSTRAINT_TRIGGER` (1811) → generic
   P2003 "Foreign key constraint violated". The service layer must **never** branch on the
   Prisma message text for trigger-enforced rules. Verified: via Prisma → "Foreign key
   constraint violated"; via raw SQL → "Invalid membership transition: CANCELLED is terminal
   (B-05)". Tests assert both layers.
2. **`prisma migrate reset` refuses to run** under an AI agent without explicit user consent.
   This guard was **not bypassed**; `npm run db:reset` uses our own `src/db/reset.ts`.
3. **No NFR is VERIFIED.** Database support must never be reported as NFR coverage.
4. **Neither existing diagram counts toward academic coverage.**

### Unresolved issues / technical debt

| # | Item |
|---|---|
| 1 | **No password hashing.** `passwordHash` holds `DEV_SEED_NOT_A_REAL_HASH`. No algorithm chosen. **A security hole if shipped as-is.** |
| 2 | **No field encryption.** `MedicalRestriction.conditionCipher` holds `DEV_SEED_PLACEHOLDER:` strings, **not ciphertext**. `NFR-21`/`NFR-10` need real encryption. |
| 3 | **Seed is anchored to a fixed epoch (2026-08-16).** Determinism was chosen over relevance, so "expiring soon" fixtures drift as wall-clock time advances. Phase 4 report code should **inject a clock** rather than call `new Date()` directly. |
| 4 | `Session` table is empty; no login path exists. |
| 5 | `MembershipPlan.accessRules` shape is undecided. |
| 6 | ER diagram aspect ratio 2.56 exceeds the 2.5 guideline — accepted deviation, recorded. |
| 7 | ADR-013 and ADR-014 are **superseded** by the B-05 and B-03 resolutions. `ARCHITECTURAL_DECISIONS.md` should be checked for stale wording. |

### Documentation gaps

- 0 of 11 mandatory diagrams and 0 of 1 mandatory written artefact exist.
- Literature-survey case studies: EVIDENCE NOT AVAILABLE (`AMB-10`).
- No API documentation reflecting an implementation, because there is no implementation.

### Known bugs

**None known.**

### Test failures

**None now.** One existed and was missed: `T-U-063` failed on a cold cache at `2c67587`
(135/136). Fixed — see §12. **139/139 passing.** Typecheck clean.

---

## 8. CURRENT WORK-IN-PROGRESS

**Nothing is half-finished.** Phase 3 closed cleanly: working tree clean, all tests green, all
self-review defects fixed and committed.

The correct way to read the current state is *layer* incompleteness, not *task* incompleteness:

| Layer | What exists | What remains | Files involved |
|---|---|---|---|
| Database | Everything (schema, migration, constraints, seed, reset, 139 tests) | Nothing for Phase 3 | `server/prisma/`, `server/src/db/`, `server/tests/` |
| Service | Nothing | All business logic for the 25 FRs | `server/src/services/` (to be created) |
| API | Design only (`API_ARCHITECTURE.md`) | Express app, routing, validation, error handling | `server/src/` (to be created) |
| Auth | `Session`/`Role`/`Permission` tables, 0 sessions | Hashing, login, session issue/revoke, RBAC guard | blocked on `B-01`, `B-02` |
| Frontend | Nothing | Entire app | not created |
| Academic diagrams | Nothing mandatory | 11 diagrams + 1 written artefact | `docs/diagrams/` |

**What should happen next:** either resolve `B-01`/`B-02` so Phase 4's auth surface can be
built, or start Phase 4 on the FRs that need no login. **Course Policy Lab 9 requires coding to
follow the designs**, so producing the mandatory diagrams before/alongside Phase 4 is the
academically safer order. This is a decision for the user, not an assumption to make.

---

## 9. NEXT EXACT ACTION

> **Ask the user to resolve `B-01` (do members log in, or is this staff-only?) and `B-02` (what
> is the authorisation model?) before writing any Phase 4 service or API code — then, once
> answered, begin Phase 4 by implementing the `FR-REC-*` (Reception) service layer in
> `server/src/services/`, starting with member registration (`US-01`/`AC-01`/`FR-REC-01`) plus
> its `ENH-19` separate membership-creation path.**

`B-01` and `B-02` are listed in `CLAUDE.md` as gating implementation and **must not be resolved
by assumption**. They are the only two blockers standing between the completed database layer
and Phase 4.

If the user instead prioritises the academic submission, the equivalent single action is:
**produce `DIA-01` (DFD level-0) using the `software-engineering-diagrams` skill** — it has no
blocker and is the first of the 11 mandatory diagrams.

---

## 10. FILES TO READ FIRST

Read in this order.

| # | File | Why |
|---|---|---|
| 1 | `CLAUDE.md` | Hard rules, ID system, the six gating decisions |
| 2 | `docs/project/PHASE_STATUS.md` | Live phase state |
| 3 | `docs/project/REQUIREMENT_GAP_ANALYSIS.md` §3 | `B-01`…`B-06`, conflicts, ambiguities |
| 4 | `docs/project/PRE_PHASE_3_DECISION_REGISTER.md` | ENH-19/ENH-20/ADR-012; what is recorded as unresolved |
| 5 | `docs/decisions/B-03_DECISION.md`, `B-04_API_DECISIONS.md`, `B-05_MEMBERSHIP_STATE_MACHINE.md`, `DEVIATIONS.md` | The resolutions the schema implements |
| 6 | `server/prisma/schema.prisma` | The single source of truth for the data model |
| 7 | `server/prisma/migrations/20260816135841_init/migration.sql` | CHECKs, partial indexes and triggers Prisma cannot express |
| 8 | `docs/architecture/DATABASE_DESIGN.md` | What the database does and does **not** guarantee |
| 9 | `docs/requirements/LAB1_TRACEABILITY_MATRIX.md` + `LAB2_NFR_TRACEABILITY.md` | Requirement coverage |
| 10 | `docs/project/MANDATORY_DIAGRAM_COVERAGE.md` | **11 diagrams + 1 written artefact** — do not miscount |
| 11 | `docs/architecture/API_ARCHITECTURE.md` + `SECURITY_ARCHITECTURE.md` | The Phase 4 design to implement against |
| 12 | `.claude/skills/*/SKILL.md` | The six project skills governing how work is done |
| 13 | `reference/` | **The authority.** Re-verify every requirement claim here. READ-ONLY. |

---

## 11. GIT STATE

| Field | Value |
|---|---|
| **Current branch** | `claude/analyze-repo-requirements-06itgc` |
| **Tracking** | `origin/claude/analyze-repo-requirements-06itgc` — pushed, up to date |
| **Latest commit** | `2c67587` — `test(db): close Phase 3 self-review findings — full CHECK coverage, ER drift, AC-12 fixture` |
| **Uncommitted changes** | **None at the time of the last check** — working tree was clean. This handoff file is a **new untracked file** and has **not** been committed. |
| **Pull request** | [#1](https://github.com/DhrupadGupta/ironboard/pull/1) — pushing to this branch updates it |

### Recent commits

```
2c67587 test(db): close Phase 3 self-review findings — full CHECK coverage, ER drift, AC-12 fixture
e7978ca feat(db): Phase 3 — database schema, migration, seed and tests
4eaf6c7 docs: correct mandatory diagram set to 11 diagrams + 1 written artefact
8f1ce41 feat: add software-engineering-documentation skill
53b8b85 docs: resolve ENH-19, ENH-20 and ADR-012 before Phase 3
fd7444f docs: resolve B-03, B-04 and B-05 via source-based decision review
e81ccf7 docs: add Phase 2 technical architecture and architecture diagrams
c682235 docs: add Phase 1 master plan and architecture decisions
```

### Files changed in `2c67587`

```
A  docs/testing/evidence/phase3-selfreview-20260816T145257Z.log
A  server/tests/checks.test.ts
M  docs/architecture/DATABASE_DESIGN.md
M  docs/diagrams/er/NOTES.md
M  docs/diagrams/er/er-model.png
M  docs/diagrams/er/er-model.puml
M  docs/project/PHASE_STATUS.md
M  server/src/db/seed.ts
M  server/tests/seed.test.ts
```

### Not tracked, by design

`server/.env` · `server/prisma/*.db*` · `node_modules/` — all covered by `.gitignore`.

---

## 12. TEST-ISOLATION DEFECT — found in re-verification, FIXED

**Status: FIXED and verified. This section supersedes every "136/136" claim above.**

### What was wrong

The suite shares **one** SQLite file (single-writer, so `fileParallelism: false`).
`constraints.test.ts` and `membership.test.ts` created persistent rows and cleaned up
**nothing**:

| File | Rows leaked per run |
|---|---|
| `constraints.test.ts` | Member ×12 · Membership ×2 · Payment ×2 · Refund ×2 · TrainerAssignment ×3 |
| `membership.test.ts` | Member ×7 · Membership ×7 · MembershipEvent ×1 |
| `schema.test.ts`, `checks.test.ts` | none — both already cleaned up |
| `relationships.test.ts`, `seed.test.ts` | none — read-only |

`T-U-063` fingerprints the database, re-runs the seed (which **truncates**), and compares. Any
leaked row makes `before ≠ after`, so **test contamination was being reported as seed
non-determinism** — the seed was never at fault. Vitest sequences files by cached duration, so
the failure appeared only when `seed.test.ts` did not run first: cold cache **135 / 136**, warm
cache 136 / 136.

### What was changed

Every id from `uid()` carries the marker `_test_`; that marker alone defines a test row.

- `tests/helpers.ts` — `PURGE_ORDER` (28 tables, FK-safe child-first), `PURGE_EXEMPT`
  (`RolePermission`: composite PK, no `id`), `findTestRows()`, `purgeTestRows()`,
  `expectPristine()`.
- **All six test files** — `beforeAll: expectPristine('entry')` (proves the *previous* file
  cleaned up, which is what makes the guarantee order-independent) and
  `afterAll: purgeTestRows() + expectPristine('exit')`.
- `tests/global-setup.ts` — returns a teardown that fails the run if any test row survived,
  even when every assertion passed.
- **+3 tests:** `T-U-006` (×2) guards `PURGE_ORDER` against schema drift; `T-U-064` proves the
  machinery works by planting a row, asserting detection, purging and asserting the baseline.
- **Assertions tightened** — these had been *weakened to tolerate the leak*:
  `T-U-060` member count `>= 1000` → `= 1000`; `relationships.test.ts` dropped three
  `NOT LIKE '%_test_%'` scopes so the receipt, ledger and attendance invariants now cover
  **every** row. `T-U-045` keeps its scope — that one is genuinely intra-file.
- **Stale test titles corrected:** `T-U-001` "all 26 tables" → **29** (and now asserts the set
  exactly, not just containment); `T-U-061` "all 26 tables" → "all 28 tables the seed
  populates" (`Session` is empty by design — no login path exists).

`T-U-063` was **not** deleted and **not** weakened. It is unchanged; the database it observes
is now clean.

### Verification — `docs/testing/evidence/phase3-test-isolation-20260816T152251Z.log`

Database deleted → `prisma migrate deploy` → seed → then: **3 cold-cache full runs, 2
warm-cache full runs, 6 files individually, 11 shuffled file orderings — 139/139 every time.**
Zero marker rows and zero `C_test_*` member codes after the suite; post-suite totals identical
to the pristine seed (members 1000, memberships 1000, payments 952, paymentTotal 934150000).
`npm run typecheck` clean.

**Negative control** (the reason this is a PASS and not an assumption): the purge was
temporarily disabled and a deliberate leak added. The entry guard failed the run naming the
leaked tables, and — with the leaking file run alone — **every individual test passed while the
run exited 1** because the teardown guard fired. Both changes reverted; the file is
byte-identical to the committed one.

### Standing rule this adds

**A test that writes a row owns its removal.** Mint ids only through `uid()`, never write to
`LedgerEntry` or `AuditEvent` outside a rolled-back transaction (their append-only DELETE
triggers make cleanup impossible), and add any new table to `PURGE_ORDER` — `T-U-006` will fail
if you forget.

---

## Standing rules the next session must not break

1. **`reference/` is READ-ONLY.** Extract to a scratch directory instead.
2. **Never invent a requirement.** The set is closed at 25/25/25/25. Anything else is `ENH-nn`.
3. **Never silently reconcile conflicting sources.** Cite the `CON-nn` ID and record both positions.
4. **Never mark work PASS without evidence** — command, actual output, timestamp, commit SHA;
   screenshots for UI, measured numbers for performance.
5. **Do not redesign the homepage.**
6. **Never fabricate** test results, performance numbers, user research, literature-survey
   results, requirements, diagrams, screenshots or implementation evidence. If evidence does not
   exist, write **EVIDENCE NOT AVAILABLE**.
7. **Never present an engineering threshold as if it came from the academic source.**
8. **Do not mark a requirement VERIFIED merely because database support exists.**
9. **`B-01`, `B-02` and `B-06` must be escalated to the user, not assumed.**

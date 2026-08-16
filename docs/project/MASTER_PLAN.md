# Ironboard — Master Plan

**Phase:** 1 — Master Plan
**Date:** 2026-08-16
**Status:** Plan of record. **Reconciled with the implementation 2026-08-16.** The database
layer described in §10 is **built and verified**; §§8–9, 11–17 and 21–22 remain design with no
code behind them. Where this plan's original text conflicts with what was built, the
implementation and the `docs/decisions/` records govern — the conflicting passages are marked
in place rather than silently rewritten.
**Authority:** `docs/project/REFERENCE_ANALYSIS.md`, verified against the originals in `reference/`.

---

## 0. How to read this plan

Every requirement below carries a source. The requirement set is **closed**: 25 functional
requirements, 25 user stories, 25 acceptance criteria, 25 NFRs — all from `reference/lab1/`
and `reference/lab2/` Part B. Anything else is an **enhancement** (`ENH-nn`), tracked
separately in §27 and **never counted toward academic coverage**.

### Verification performed for this plan

Re-extracted from the original PDFs rather than trusted from the analysis:

| Check | Result |
|---|---|
| Given/When/Then triples in Lab 1 Part B | **25** ✅ |
| "Story n:" headings in Lab 1 Part B | **25** ✅ |
| Distinct story-owning roles in Lab 1 | **5** — receptionist, trainer, administrator, membership manager, accounting executive |
| **Is `Member` a story-owning role in Lab 1?** | **No** ❌ — see §2.1 |
| NFR category labels in Lab 2 Part B | **25** — Performance 5, Availability 5, Reliability 5, Data Integrity 3, Security 3, Usability 2, Maintainability 1, Scalability 1 |

> This pass corrected an arithmetic error in the earlier analysis (Availability was listed as 6
> and Data Integrity as 4, summing to 27). The verified counts sum to exactly 25.

---

## 1. Product scope

**Ironboard** is a gym management system connecting five departments into one operational
system. Source for the name and positioning: `reference/design/gym-management-homepage-2.html`
(`<title>`, `.logo`, footer) — the labs never name the product (`AMB-01`).

Product statement, verbatim from the homepage hero:

> "Ironboard connects reception, training, administration, membership and accounting into a
> single board — so no member, session or payment falls through the cracks."

### In scope (academic — mandatory)
- 25 functional requirements across 5 departments (§4)
- 25 acceptance criteria, each testable (§5)
- 25 non-functional requirements, each implemented **and** verified (§6)
- The visual identity of the supplied homepage, unaltered (§21)
- Every experiment deliverable in `reference/course-policy/` and `reference/experiments/` (§24)

### In scope (enhancement — required to make the above functional)
The five missing write paths (§27). Six Lab 1 stories read data that **no story creates**;
without these, those stories cannot function at all.

### Explicitly out of scope
Payment gateway integration · SMS delivery · multi-tenancy beyond branch · mobile apps ·
reporting beyond `AC-23` · anything from the Experiment 2 handout's **sample** constraints
tables (credit-card masking, `payment_preferences` log, 10-second inactivity logout) — those
describe a different system and are not Ironboard requirements.

---

## 2. Actors

### 2.1 Primary actors — own user stories

| ID | Actor | Dept | Stories | Source |
|---|---|---|---|---|
| `ACT-01` | Receptionist | D01 | US-01…05 | `reference/lab1/` p.5 §1 |
| `ACT-02` | Trainer | D02 | US-06…10 | p.5 §2 |
| `ACT-03` | Administrator | D03 | US-11…15 | p.5 §3 |
| `ACT-04` | Membership Manager | D04 | US-16…20 | p.5 §4 |
| `ACT-05` | Accounting Executive | D05 | US-21…25 | p.5 §5 |

### 2.2 The Member role — a scope decision, not a Lab 1 requirement ⚠️

The instruction for this phase lists **six** roles, adding **Member**. This is a legitimate
product decision and it **resolves `B-01`** ("do members log in?") as **yes**.

It must be recorded honestly:

- **Zero of the 25 Lab 1 user stories are owned by a member.** Verified against the original
  PDF — the five story-owning roles are staff only.
- `Member` appears in Lab 1 **only as a recipient** inside acceptance criteria: receives a
  welcome email (`AC-01`), is notified (`AC-06`, `AC-09`), appears on both calendars
  (`AC-08`), receives a PDF invoice (`AC-22`), receives reminders (`AC-19`), receives refunds
  (`AC-24`).
- The homepage shows a `Sign in` button, but its `href` is `#` (`AMB-13`).

**Therefore:** the Member role and every member-facing screen are tracked as **`ENH-01`**.
They are built, but they do **not** count toward the 25-story academic coverage. Any audit
that merges them is wrong.

| ID | Actor | Status |
|---|---|---|
| `ACT-06` | **Member** | `ENH-01` — logs in per this phase's decision; owns no Lab 1 story |
| `ACT-07` | Prospect | `ENH-07` — referenced in `AC-03`, no story creates one |
| `ACT-08` | Staff Applicant | `ENH-06` — referenced in `AC-11`, no story creates one |
| `ACT-09` | System Scheduler | Non-human; drives `AC-19` |
| `ACT-10` | Entrance Check-in | `ENH-02` — referenced in `AC-14`, no story creates one |

---

## 3. Departments / modules

Five modules, one per department. Confirmed across three independent sources (Lab 1 headings,
homepage cards, homepage footer).

| ID | Module | Code path | Stories | Homepage |
|---|---|---|---|---|
| `D01` | Reception | `server/src/modules/reception` | 5 | `Dept / 01` |
| `D02` | Trainer | `server/src/modules/trainer` | 5 | `Dept / 02` |
| `D03` | Administration | `server/src/modules/administration` | 5 | `Dept / 03` |
| `D04` | Membership | `server/src/modules/membership` | 5 | `Dept / 04` |
| `D05` | Accounting | `server/src/modules/accounting` | 5 | `Dept / 05` |

Module boundaries are deliberate: they map 1:1 to the **DFD Level-1 processes** (`DIA-02`),
giving the design deliverable a mechanical counterpart in code.

---

## 4. Functional requirements — all 25

Labels verbatim from `reference/lab2/` Part B FR column (verified by y-coordinate pairing).

| FR | Requirement | US | AC | NFR |
|---|---|---|---|---|
| `FR-REC-01` | Register new members | US-01 | AC-01 | NFR-01 |
| `FR-REC-02` | Verify member details | US-02 | AC-02 | NFR-02 |
| `FR-REC-03` | Schedule trial sessions | US-03 | AC-03 | NFR-03 |
| `FR-REC-04` | Print payment receipts | US-04 | AC-04 | NFR-04 |
| `FR-REC-05` | Check member attendance | US-05 | AC-05 | NFR-05 |
| `FR-TRN-01` | Assign workout plans | US-06 | AC-06 | NFR-06 |
| `FR-TRN-02` | Record member progress | US-07 | AC-07 | NFR-07 |
| `FR-TRN-03` | Schedule personal training sessions | US-08 | AC-08 | NFR-08 |
| `FR-TRN-04` | Update exercise routines | US-09 | AC-09 | NFR-09 |
| `FR-TRN-05` | View member medical restrictions | US-10 | AC-10 | NFR-10 |
| `FR-ADM-01` | Approve new staff accounts | US-11 | AC-11 | NFR-11 |
| `FR-ADM-02` | Manage gym branches | US-12 | AC-12 | NFR-12 |
| `FR-ADM-03` | Maintain equipment schedules | US-13 | AC-13 | NFR-13 |
| `FR-ADM-04` | Monitor daily gym attendance | US-14 | AC-14 | NFR-14 |
| `FR-ADM-05` | Monitor department activities | US-15 | AC-15 | NFR-15 |
| `FR-MEM-01` | Create membership plans | US-16 | AC-16 | NFR-16 |
| `FR-MEM-02` | Cancel inactive memberships | US-17 | AC-17 | NFR-17 |
| `FR-MEM-03` | Renew memberships | US-18 | AC-18 | NFR-18 |
| `FR-MEM-04` | Send renewal reminders | US-19 | AC-19 | NFR-19 |
| `FR-MEM-05` | Track membership status | US-20 | AC-20 | NFR-20 |
| `FR-ACC-01` | Collect membership payments | US-21 | AC-21 | NFR-21 |
| `FR-ACC-02` | Generate invoices | US-22 | AC-22 | NFR-22 |
| `FR-ACC-03` | Review revenue reports | US-23 | AC-23 | NFR-23 |
| `FR-ACC-04` | Process refunds | US-24 | AC-24 | NFR-24 |
| `FR-ACC-05` | Track overdue payments | US-25 | AC-25 | NFR-25 |

> `CON-04`: `FR-ACC-03` has four conflicting verbs across sources. **"Review revenue reports"**
> (the Lab 2 label) governs in code and diagrams; the conflict is cited, not reconciled.

---

## 5. User stories and acceptance criteria — all 25

Verbatim text with source defects preserved lives in
`docs/requirements/LAB1_TRACEABILITY_MATRIX.md`. Condensed here for planning.

| US | Story (abbreviated) | AC — Given / When / Then |
|---|---|---|
| US-01 | Receptionist registers new members | valid info (Name, Email, Phone) / submits form / create profile + generate Member ID + send welcome email |
| US-02 | Receptionist verifies member details | member gives Name or ID / updates and saves / update instantly + success message |
| US-03 | Receptionist schedules trial sessions | open slot + prospect details / books slot / reserve session + send confirmation |
| US-04 | Receptionist prints payment receipts | payment successful / clicks "Print Receipt" / print receipt with payment details |
| US-05 | Receptionist checks member attendance | attendance page open / filters by date or inactive / show total visits + lapsed list |
| US-06 | Trainer assigns workout plans | selects member profile / chooses or creates plan and saves / link plan + notify member |
| US-07 | Trainer records member progress | member completes progress test / logs weight or measurements / save + update chart |
| US-08 | Trainer schedules PT sessions | both free at a time / books date and time / reserve slot + add to both calendars |
| US-09 | Trainer updates exercise routines | member already has a plan / changes exercises, sets, reps / update plan + inform member |
| US-10 | Trainer views medical restrictions | health condition logged / opens member profile / display medical alert before workouts set |
| US-11 | Admin approves staff accounts | staff registers for access / admin reviews and approves / activate account + send login details |
| US-12 | Admin manages gym branches | on branch management page / adds, updates or disables / update system records |
| US-13 | Admin maintains equipment schedules | machine needs service / sets recurring schedule / set reminders + mark "In Maintenance" |
| US-14 | Admin monitors daily attendance | check-in data recorded at entrance / views attendance page / display total visits + peak hours |
| US-15 | Admin monitors all departments | dashboard open / checks activities / show summary from all departments |
| US-16 | Manager creates membership plans | price, duration, access rules entered / saves and publishes / show as available for purchase |
| US-17 | Manager cancels inactive memberships | expired or cancellation requested / confirms / status "Cancelled" + stop gym access |
| US-18 | Manager renews memberships | expiring or expired profile / renewal payment completed / extend expiry + restore access |
| US-19 | Manager sends renewal reminders | expiring soon (e.g. 7 days) / automated system checks / send reminder email or SMS |
| US-20 | Manager tracks membership status | member directory / filters "Active" or "Expired" / display matching list |
| US-21 | Accountant collects payments | balance due / paid via cash, card or online / clear balance + issue receipt |
| US-22 | Accountant generates invoices | payment or subscription charge / billing triggers or manual / create PDF invoice + email |
| US-23 | Accountant reviews revenue reports | transaction logs / selects date range / show income, refunds, pending |
| US-24 | Accountant processes refunds | approved refund request / enters refund details / send funds back + log transaction |
| US-25 | Accountant tracks overdue payments | members with late payments / opens overdue page / list balances + offer notices |

### Testability

Each AC becomes a test directly: Given → fixture, When → call under test, Then → **one
assertion per clause**. Nine criteria have multiple Then-clauses and must produce multiple
assertions (`AC-01`, `AC-05`, `AC-13`, `AC-14`, `AC-17`, `AC-18`, `AC-21`, `AC-23`, `AC-24`,
`AC-25`).

⚠️ **`INC-01`: no rejection paths exist.** Lab 1's heading reads "Accepatnce 1:", implying a
missing second set; the Experiment 1 handout models two criteria per story. All 25 negative
paths will be authored as **`ENH-09`** and labelled `AC-nn-NEG`, never counted as academic
coverage.

---

## 6. Lab 2 NFR strategy — all 25

Each NFR needs an **implementation** and a **verification**. Full detail:
`docs/requirements/LAB2_NFR_TRACEABILITY.md`.

### 6.1 The 10 measurable NFRs — assert these exact numbers

| NFR | Target | Implementation approach | Verification |
|---|---|---|---|
| `NFR-01` | Registration ≤ **3 s** | Async welcome email via outbox — email latency must not sit inside the budget | `T-P-001` p95 |
| `NFR-06` | Plan **load** ≤ **2 s** | Indexed read, eager-load exercises | `T-P-002` p95 |
| `NFR-14` | Attendance report ≤ **5 s** | Pre-aggregated daily counts | `T-P-003` p95 |
| `NFR-18` | Renewal ≤ **2 s** | Payment settlement excluded from the budget (see `N-2`) | `T-P-004` p95 |
| `NFR-23` | Revenue report ≤ **5 s** | Indexed date-range query over the ledger | `T-P-005` p95 |
| `NFR-03` | Scheduling **99.9 %** | Health checks, graceful degradation | `T-R-001` uptime probe |
| `NFR-15` | Dashboard **99.9 %** | Per-module failure isolation — it aggregates all five | `T-R-002` uptime probe |
| `NFR-10` | Medical data — authorised trainers only | RBAC + per-member trainer assignment | `T-SEC-001` |
| `NFR-11` | Staff approval — admins only | RBAC guard | `T-SEC-002` |
| `NFR-21` | Payment data encrypted + restricted | Field encryption at rest + RBAC | `T-SEC-003` |

### 6.2 The 15 unquantified NFRs

`NFR-02, 04, 05, 07, 08, 09, 12, 13, 16, 17, 19, 20, 22, 24, 25` state no measurable target.
The Experiment 2 handout names this failure itself: *"a bad smell … too vague to be
implemented."*

**Procedure:** thresholds are **decided and accepted** — see
`docs/requirements/NFR_VERIFICATION_THRESHOLDS.md` and
`docs/architecture/ADR-012-NFR-THRESHOLDS.md`. Results report as
**`PASS (ENGINEERING THRESHOLD)`**, never plain `PASS`. Thresholds are scaled for a
student/college local project; no production SLA is claimed.

Two are unfalsifiable as written and will be reported as such: `NFR-13` "should **never** be
lost" and `NFR-22` "accurately **every time**". Realistic proxies (tested backup/restore;
idempotent invoice generation) will be measured, with the absolute claim flagged.

### 6.3 NFR conflicts — cited, not resolved

`N-1` `NFR-03` 99.9 % vs `NFR-08` "always during working hours" (and "working hours" is
undefined, `AMB-04`) · `N-2` `NFR-18`'s 2 s is tighter than `NFR-01`'s 3 s despite requiring a
completed payment · `N-4` `NFR-16` demands plan *modification*, which no story provides
(`ENH-14`).

---

## 7. Technology stack

Full justification: `docs/architecture/TECHNOLOGY_DECISIONS.md`.

| Layer | Choice | Set by |
|---|---|---|
| Frontend | **React 19 + TypeScript + Vite** | Phase instruction |
| Backend | **Node.js 22 + Express 5 + TypeScript** | Phase instruction |
| Database | **SQLite** (WAL mode, `better-sqlite3`) | Phase instruction |
| **ORM** | **Prisma** | **This plan — see ADR-005** |
| Routing | React Router | This plan |
| Server state | TanStack Query | This plan |
| Validation | Zod (shared client/server) | This plan |
| Auth | Argon2id + server-side sessions | ADR-006 |
| Testing | Vitest · Supertest · Testing Library · Playwright | ADR-010 |
| Styling | Plain CSS + custom properties from the design source | ADR-009 |

**Why Prisma** (summary; full reasoning in ADR-005): its single declarative `schema.prisma`
**is** the data model, so the required class diagram (`DIA-09`) and ER model (`DIA-16`) trace
mechanically to one reviewable file; generated types enforce `NFR-02` at compile time; and
`prisma migrate` gives versioned migrations. Runner-up **Drizzle ORM** was rejected only on the
traceability argument, not on technical merit.

---

## 8. Frontend architecture

```
client/src/
├── app/                    routing, providers, error boundaries
├── design-system/          tokens.css + primitives (Button, Card, Board, Tag, StatRail)
├── modules/                reception/ trainer/ administration/ membership/ accounting/
│   └── <module>/           pages/ components/ api/ hooks/
├── shared/                 auth, layout, formatting, hooks
└── types/                  generated API types
```

- **Module folders mirror `D01`–`D05`** so the UI maps to the same boundaries as the backend
  and the DFD Level-1 processes.
- **Design system is not optional.** Primitives are built once from
  `docs/ui/DESIGN_SYSTEM.md` and reused; no component may introduce a colour, radius or
  shadow outside the token set (`ironboard-ui-visual-qa`).
- Server state via TanStack Query; **no global client store** — this application is
  overwhelmingly server-state, and Redux would be unjustified complexity.
- Routes are role-gated at the router level and re-checked server-side. Client-side gating is
  UX, never security.

---

## 9. Backend architecture

**Modular monolith.** Five department modules over a shared kernel.

```
server/src/
├── modules/<dept>/         routes.ts · controller.ts · service.ts · repository.ts · schema.ts
├── platform/
│   ├── auth/               sessions, password hashing, guards
│   ├── rbac/               permission matrix, middleware
│   ├── notifications/      outbox + adapters (email, sms-stub)
│   ├── audit/              append-only event log
│   ├── reporting/          aggregation queries
│   └── scheduler/          ACT-09 — reminder + maintenance jobs
├── db/                     prisma client, migrations, seed
└── http/                   app bootstrap, error handler, middleware
```

**Layering:** route → controller (HTTP only) → service (business rules, transactions) →
repository (Prisma). Services never touch `req`/`res`; controllers never touch Prisma. This
keeps services unit-testable without HTTP, which is what makes the 25 acceptance tests cheap.

**Why a monolith:** SQLite is a single-writer embedded database — distributing services over it
would be incoherent. A modular monolith also keeps the DFD Level-1 decomposition honest.

---

## 10. Database architecture

SQLite with WAL mode. Entities derived from the acceptance criteria — **no data model exists in
any source document (`INC-04`), so every attribute is an assumption** recorded in the gap
analysis.

| Entity | Source | Notes |
|---|---|---|
| `Branch` | AC-12 | add / update / **disable** |
| `Staff` | AC-11 | pending → active; role FK |
| `Role`, `Permission` | NFR-10/11/21 | RBAC (§12) |
| `Session` | ADR-006 | server-side, revocable |
| `Member` | AC-01 | Member ID, name, email, phone |
| `MedicalRestriction` | AC-10 | ⚠️ `ENH-03` — no story writes it |
| `Prospect` | AC-03 | ⚠️ `ENH-07` |
| `MembershipPlan` | AC-16 | price, duration, **access rules** |
| `Membership` | AC-17/18/20 | state machine (§6, `B-05`) |
| `TrialSession`, `PTSession` | AC-03/08 | slot model |
| `WorkoutPlan`, `Exercise`, `PlanExercise` | AC-06/09 | plan versioning for `NFR-09` |
| `ProgressEntry` | AC-07 | weight, measurements |
| `AttendanceEvent` | AC-14 | ⚠️ `ENH-02` — no story writes it |
| `Equipment`, `MaintenanceSchedule` | AC-13 | ⚠️ `ENH-04` |
| `Payment`, `Invoice`, `Receipt` | AC-21/22/04 | |
| ~~`RefundRequest`~~, `Refund` | AC-24 | ⚠️ `ENH-05` **WITHDRAWN by `B-04`** — only `Refund` exists; approval is captured as data on it |
| `LedgerEntry` | AC-23/24, NFR-24 | append-only |
| `AuditEvent` | NFR-24, AC-23 | append-only (`ENH-13`) |
| `NotificationOutbox` | AC-01/19/22 | async dispatch |

**Migrations** via `prisma migrate` — versioned and committed, never ad-hoc SQL.
**Indexes** are added deliberately to serve `NFR-14` and `NFR-23`, not speculatively.

✅ **`B-03` is RESOLVED and implemented** (this supersedes the `ASM-05` assumption this section
originally carried — members and staff are **not** branch-scoped). Branch is a **non-isolating
descriptive attribute**: `Member.homeBranchId` and `Staff.homeBranchId` are **nullable**;
`Equipment.branchId`, `AttendanceEvent.branchId` and `AttendanceDaily.branchId` are NOT NULL
(physical location); `MembershipPlan` carries **no** branch column. No row-level isolation
exists and no query path filters by branch.
→ `docs/decisions/B-03_DECISION.md`, ADR-014

✅ **`B-05` is RESOLVED**: three states, not four — `ACTIVE`, `EXPIRED`, `CANCELLED`.
`EXPIRING` is derived, never stored. → `docs/decisions/B-05_MEMBERSHIP_STATE_MACHINE.md`, ADR-013

✅ **`B-04` is RESOLVED**: `ENH-05` (`RefundRequest`) was **withdrawn** — `AC-24` treats approval
as an external precondition, captured as data on `Refund`. The `RefundRequest` row in the table
above is therefore **not implemented and never will be**.
→ `docs/decisions/B-04_API_DECISIONS.md`

**Implemented:** 29 entities (not the count this section's table implies), 36 CHECK constraints,
2 partial unique indexes, 7 triggers. See `docs/architecture/DATABASE_DESIGN.md`.

---

## 11. Authentication

Full reasoning: ADR-006.

- **Argon2id** password hashing (memory-hard; correct default in 2026).
- **Server-side sessions** in SQLite, delivered as an `httpOnly`, `Secure`, `SameSite=Strict`
  cookie. **Chosen over JWT because revocation is a functional requirement**: `AC-17` says
  "stop gym access" and `AC-11` activates accounts — both demand immediate effect. A stateless
  JWT cannot do that without a denylist, which is a session table with extra steps.
- Six roles authenticate through one flow; `Member` (`ENH-01`) uses the same mechanism.
- Staff accounts start **pending** and are activated only by `AC-11` approval.

⚠️ No source document defines authentication at all (`AMB-03`). This entire section is
`ASM-03`/`ASM-04`.

---

## 12. Authorisation / RBAC

`B-02` is resolved by this phase's role list. Model: **role → permission set**, enforced by
middleware at the route boundary **and** re-checked in services.

| Role | Scope |
|---|---|
| Receptionist | D01 full; read member directory |
| Trainer | D02 full; **medical data only for assigned members** (`NFR-10`) |
| Administrator | D03 full; **sole approver of staff accounts** (`NFR-11`); read-only across all |
| Membership Manager | D04 full; read member directory |
| Accounting Executive | D05 full; **payment data** (`NFR-21`) |
| **Member** (`ENH-01`) | Own record only — profile, plan, sessions, invoices |

Two rules are stricter than plain role checks and must be implemented as such:

- **`NFR-10`** says "authorized **trainers**", not "trainers" → per-member trainer assignment,
  not a blanket role grant.
- **`NFR-11`** says "**Only** administrators" → the other four roles must be provably denied,
  which is exactly what `T-SEC-002` asserts.

Deny-by-default. Every endpoint declares its required permission explicitly; an endpoint with
no declaration fails closed.

---

## 13. API architecture

REST, versioned at `/api/v1`, resource-oriented, JSON.

| Concern | Decision |
|---|---|
| Naming | Plural nouns — `/members`, `/memberships`, `/payments` |
| Errors | RFC 9457 Problem Details; consistent shape |
| Validation | **Zod at the boundary**, schemas shared with the client (`NFR-02`) |
| Pagination | Cursor-based on list endpoints |
| Idempotency | `Idempotency-Key` on payment and invoice creation (`NFR-22`) |
| Auth | Session cookie; CSRF token on mutations |
| Types | Generated from Zod, consumed by the client — one source of truth |

Endpoints are grouped by module so the API surface mirrors `D01`–`D05`. Full endpoint list is
produced in Phase 3, with each endpoint traced to its `FR`/`AC` in
`docs/requirements/TRACEABILITY.md`.

---

## 14. Integrations

| Integration | Status | Requirement |
|---|---|---|
| Email | **Adapter interface + local dev transport** | `AC-01`, `AC-19`, `AC-22` |
| SMS | **Stub adapter, logged not sent** | `AC-19` "email or SMS" |
| Payment gateway | **Not integrated** — `AC-21` "online" recorded as a payment method only | `AC-21` |
| PDF generation | In-process (invoices `AC-22`, receipts `AC-04`) | `AC-22` |

⚠️ No source names a provider for any of these (`AMB-12`). All are behind interfaces so a real
provider can be substituted without touching business logic. **Never claim a real email or SMS
was delivered when the stub is active.**

---

## 15. Notifications

**Transactional outbox**, not inline sending. Three notification types exist across Lab 1:
welcome email (`AC-01`), renewal reminder (`AC-19`), invoice email (`AC-22`), plus payment
notices (`AC-25`) and plan/routine notifications (`AC-06`, `AC-09`).

Rationale: `NFR-01` gives registration a **3-second budget**, and `AC-01` requires a welcome
email. Sending inline puts a third-party's latency inside a measured budget. The outbox writes
a row in the same transaction as the business change, and a worker dispatches it.

`NFR-19` ("reminders delivered successfully") is **partly outside system control** — providers
can fail. The system guarantees *dispatch with retry*, and the report will say exactly that
rather than claiming delivery.

---

## 16. Reporting

Three reports are required: attendance (`AC-14`, ≤ 5 s), revenue (`AC-23`, ≤ 5 s), overdue
(`AC-25`).

- Revenue reads an **append-only ledger** — `AC-23` says "system transaction logs" and must
  show income, refunds and pending together.
- Attendance uses **pre-aggregated daily counts** plus peak-hour bucketing (`FR-SUB-14`).
- `AC-23`'s date range has **no stated bounds** (`INC-08`); a maximum range will be set as an
  assumption so the 5 s budget is meaningful.
- The admin dashboard (`AC-15`) aggregates all five modules and must **degrade gracefully** —
  it carries a 99.9 % target (`NFR-15`) while depending on everything else.

---

## 17. Audit logging (`ENH-13`)

Append-only `AuditEvent` table. Not named by any story, but three requirements point straight
at it: `AC-24` "log the transaction", `AC-23` "system transaction logs", `NFR-24` "maintain
accurate financial records".

Captured: authentication events · staff approval (`AC-11`) · payments, refunds, invoices ·
membership state transitions · medical data access (`NFR-10`) · branch disable (`AC-12`).

Records actor, action, entity, before/after, timestamp, IP. **Never mutated or deleted.**

---

## 18. Testing strategy

Owned by the `testing-and-quality` skill. **No PASS without evidence** — command, actual
output, timestamp, commit SHA; screenshots for UI, measured numbers for performance.

| Level | Tool | Target |
|---|---|---|
| Unit | Vitest | Services, domain logic |
| Integration | Vitest + in-memory SQLite | Service + repository + DB |
| API | Supertest | Contract, status codes, authz |
| Component | Testing Library | Design-system primitives, module screens |
| System | Playwright | One department end-to-end |
| E2E | Playwright | `WF-01` walk-in → renewal |
| Acceptance | Vitest/Playwright | **One suite per `AC-nn`, all 25** |
| Security | Supertest | `NFR-10`, `NFR-11`, `NFR-21` per role |
| Performance | Autocannon + timing harness | The five timing NFRs, p95 |
| Accessibility | axe + Playwright | `ENH-10` — no NFR requires it |
| Reliability | Vitest + restore drills | `NFR-07`, `NFR-13`, `NFR-19`, `NFR-22` |

**Academic deliverable** (separate from the above): four test cases covering two
functionalities in the Experiment 9 **nine-field format**, satisfying both readings of `CON-05`.

---

## 19. Documentation strategy

| Document | Owner skill | Status |
|---|---|---|
| Reference analysis, gap analysis | — | ✅ done |
| Traceability matrices, coverage | `requirements-traceability` | Partial |
| Problem statement, feasibility, development plan, process model, user-vs-system requirements | `requirements-traceability` | Phase 2 |
| Use case documentation | `software-engineering-diagrams` | Phase 2 |
| Design system | `ironboard-ui-visual-qa` | ✅ done |
| Test report, academic test cases, constraints, Definition of Done | `testing-and-quality` | Phase 7–8 |
| Submission audit | `academic-submission-audit` | Phase 9 |
| ADRs | — | This phase |

---

## 20. Diagram strategy

Owned by `software-engineering-diagrams`. **PlantUML source + rendered PNG + visual
inspection**, all three required. Graphviz must be installed (`apt-get install -y graphviz`).

`DIA-01`–`DIA-12` are academic requirements. `DIA-13` and `DIA-15` are taught but assigned by
no lab. `DIA-14` is *proposed*. `DIA-16` (ER) is an enhancement.

Two conflicts honoured by producing the superset: `CON-02` — build DFD L0, L1 **and** L2;
`AMB-08` — build both a state chart (membership) and a state transition diagram (second
entity), noting they may be one artefact.

⚠️ Course Policy Lab 5 names **Star UML**, which is unavailable here. PlantUML is used and the
substitution is recorded. **Never claim Star UML was used.**

**Sequencing constraint:** Course Policy Lab 9 requires coding to follow "the designs analyzed
in EXP.4,5". Diagrams therefore precede implementation — this drives the phase order in §24.

---

## 21. UI architecture

`reference/design/gym-management-homepage-2.html` is the **visual source of truth** and is
never redesigned. Tokens, patterns and QA procedure: `docs/ui/DESIGN_SYSTEM.md` +
`ironboard-ui-visual-qa`.

- Ink `#0c0c09` ground · volt `#cbff3d` sole accent · Anton / Oswald / JetBrains Mono ·
  **`border-radius: 0`** · hairline borders, **no shadows**.
- The **locker board** (`P-01`) becomes the department dashboard shell — it is the design's
  signature pattern and already reflows via `auto-fit`.
- Application screens reuse the homepage's patterns rather than inventing admin chrome.
  **No sidebar-and-topbar dashboard.**
- **Mobile navigation must be added** (`ENH-11`) — the source hides nav links below 860px with
  no replacement (`INC-11`). Built from existing tokens; desktop design unchanged.
- Visual QA at **1280 / 900 / 860 / 760 / 640 / 375**, screenshots read back as evidence.

---

## 22. Deployment strategy

Single Node process serving the built React bundle as static assets plus the API under
`/api/v1`. SQLite file on a mounted volume, WAL mode.

| Concern | Approach |
|---|---|
| Build | `vite build` → static; `tsc` → server |
| Runtime | One Node 22 process |
| Database | SQLite file + WAL; `prisma migrate deploy` on boot |
| Backups | Scheduled file copy + integrity check (`NFR-13`) |
| Health | `/healthz` liveness, `/readyz` readiness (`NFR-03`, `NFR-15`) |
| Config | Environment variables; no secrets committed |

Deliberately simple — this is a single-instance academic system, and SQLite's single-writer
model makes horizontal scaling meaningless. `NFR-12` ("multiple branches efficiently") is a
**data-scoping** requirement, not a clustering one.

---

## 23. Security strategy

| Control | Driver |
|---|---|
| Argon2id password hashing | `AMB-03` (no source requirement) |
| Server-side revocable sessions | `AC-11`, `AC-17` |
| Deny-by-default RBAC | `NFR-10`, `NFR-11`, `NFR-21` |
| Field encryption at rest — payment + medical | `NFR-21`, `NFR-10` |
| Zod validation at every boundary | `NFR-02` |
| Parameterised queries via Prisma | Injection |
| CSRF tokens on mutations | Cookie auth |
| Helmet security headers, strict CORS | Baseline |
| Rate limiting on auth endpoints | Baseline |
| Append-only audit log | `NFR-24` |
| No secrets in the repository | Baseline |

⚠️ Items marked "Baseline" are **engineering practice, not Lab 2 requirements**. Lab 2 contains
exactly three security NFRs. Do not present baseline hardening as academic coverage.

---

## 24. Development phases

Ordered so each phase unblocks the next. Course Policy Lab 9 forces design before code.

| Phase | Name | Output | Gate |
|---|---|---|---|
| **0** | Analysis & skills | ✅ Analysis docs, **6 skills**, CLAUDE.md | Done |
| **1** | **Master plan** | ✅ This document + ADRs + phase status | Done |
| **2** | Requirements & design | Problem statement, feasibility, process model, development plan; `DIA-01`–`DIA-12`, `DIA-16` | ✅ gate cleared — `B-03`, `B-04`, `B-05` all **RESOLVED** |
| **3** | Foundation | Repo scaffold, Prisma schema + migrations, auth, RBAC, API skeleton, design-system primitives | ✅ **database subset COMPLETE**; auth / RBAC / API skeleton / design-system primitives remain (tracked as Phase 3b) |
| **4** | Department modules | `D01`→`D04`→`D02`→`D05`→`D03` (dependency order) | Phase 3 |
| **5** | Frontend | Module screens on the design system | Phase 3 primitives |
| **6** | Cross-cutting | Notifications, reporting, audit log, scheduler | Phase 4 |
| **7** | Verification | Full test suite; 25 AC tests; 25 NFR verifications | Phase 5–6 |
| **8** | Academic deliverables | Nine-field test cases, bug reports, burndown, constraints, DoD | Phase 7 |
| **9** | Audit & submission | `academic-submission-audit` report; close gaps | All |

**Module order in Phase 4 is dictated by dependencies, not by department number:**
D01 (Member ID is the universal key) → D04 (plans must exist) → D02 → D05 → D03 (the dashboard
aggregates everything and must be built last).

---

## 25. Dependencies

### Cross-department (from acceptance criteria)

| Dependent | Requires | Evidence |
|---|---|---|
| `FR-REC-04` Print receipt (D01) | `FR-ACC-01` (D05) | AC-04 "Given a payment is successful" |
| `FR-MEM-03` Renew (D04) | `FR-ACC-01` (D05) | AC-18 "When a renewal payment is completed" |
| `FR-ADM-05` Monitor all (D03) | D01, D02, D04, D05 | AC-15 "summary updates from all departments" |
| `FR-ACC-05` Overdue (D05) | `FR-MEM-01` (D04) | AC-25 — dues arise from plans |
| Every member-scoped FR | `FR-REC-01` | AC-01 generates the Member ID |
| `FR-TRN-04` | `FR-TRN-01` | AC-09 "Given a member already has a workout plan" |

### Technical
Auth + RBAC precede every module · Prisma schema precedes all repositories · design-system
primitives precede all screens · outbox precedes `AC-01`/`AC-19`/`AC-22` · ledger precedes
`AC-23`.

### Academic
Diagrams (Phase 2) precede coding (Phase 4) per Course Policy Lab 9 — though `CON-01` makes
"EXP.4,5" itself ambiguous, so **all** design diagrams are produced before coding.

---

## 26. Risks

Carried from `docs/project/REQUIREMENT_GAP_ANALYSIS.md`, updated for this phase.

Status column reconciled with the implementation on 2026-08-16.

| # | Risk | Severity | Status / mitigation |
|---|---|---|---|
| `R-01` | No auth model in any source | 🔴 | ✅ **Closed by decision** — `B-01`/`B-02` resolved (§11–12, ADR-006, ADR-007); recorded as `ASM-02`/`ASM-03`. **No auth code exists yet** — the decision is made, the implementation is Phase 3b |
| `R-02` | Member scope undecided | 🔴 | ✅ **Closed** — `B-01` resolved: members log in; Member is a role (`ENH-01`), excluded from academic coverage |
| `R-03` | Five missing write paths | 🔴 | ✅ **Closed** — `B-04` resolved. `ENH-02`/`03`/`04`/`06`/`07` kept and their tables exist; **`ENH-05` withdrawn** |
| `R-04` | No data model | 🔴 | ✅ **Closed** — 29 entities implemented and migrated; every attribute remains an assumption (`INC-05`), which is recorded, not fixed |
| `R-05` | Branch scoping undefined | 🟠 | ✅ **Closed** — `B-03` resolved: non-isolating attribute, nullable `homeBranchId` on people. **`ASM-05` is withdrawn**, not assumed |
| `R-06` | 15 NFRs untestable | 🟠 | 🟡 Open — ADR-012 thresholds accepted; reported as `PASS (ENGINEERING THRESHOLD)`, never bare `PASS`. Nothing verified yet |
| `R-08` | Membership state set undefined | 🟠 | ✅ **Closed** — `B-05` resolved: **three** states. `ASM-13`'s four-state reading is withdrawn |
| `R-09` | Payment gateway unnamed | 🟠 | 🟡 Open — not integrated; "online" is a recorded method only |
| `R-10` | No negative paths | 🟠 | 🟡 Open — `ENH-09`, clearly labelled |
| `R-19` | **Scope inflation via `ENH-01`** | 🟠 | 🟡 Open — Member portal must never be counted as academic coverage |
| `R-20` | **Prisma + SQLite migration drift** | 🟡 | 🟢 Mitigated — migrations committed; the test suite rebuilds from them on every run (`tests/global-setup.ts`), and `T-U-032` guards CHECK drift |
| `R-07` | Experiment numbering (`CON-01`) | 🟠 | 🟡 Open — `B-06` unresolved; label by artefact, never bare number |
| `R-21` | **Test contamination via the shared test database** | 🟠 | 🟢 **Closed** — found in re-verification (135/136 cold-cache), fixed by the per-file isolation contract + suite teardown guard; 139/139 |

---

## 27. Engineering enhancements

**None of these count toward academic coverage.** Reported in a separate table forever.

| ID | Enhancement | Why needed | Priority |
|---|---|---|---|
| `ENH-01` | **Member role and portal** | This phase's role list; no Lab 1 story owns it | High |
| `ENH-02` | **Check-in capture** | `AC-14` precondition; unblocks `US-05` **and** `US-14` | **Critical** |
| `ENH-03` | **Medical restriction entry** | `AC-10` precondition; unblocks `US-10` | **Critical** |
| `ENH-04` | **Equipment register CRUD** | `AC-13` precondition; unblocks `US-13` | **IMPLIED-MANDATORY** |
| `ENH-05` | ~~Refund request + approval~~ | **NOT REQUIRED** — `AC-24` treats approval as an external precondition; building a workflow invents a requirement | Withdrawn |
| `ENH-06` | **Staff self-registration** | `AC-11` precondition; unblocks `US-11` | **Critical** |
| `ENH-07` | Prospect record | `AC-03` references prospect details | High |
| `ENH-08` | Workout plan template library | `AC-06` "chooses or creates" | Medium |
| `ENH-09` | 25 rejection-path criteria | `INC-01` | High |
| `ENH-10` | Accessibility | No NFR requires it; the design already exceeds the spec | Medium |
| `ENH-11` | Mobile navigation | `INC-11` | High |
| `ENH-12` | ER / data model (`DIA-16`) | Makes `DIA-09` tractable | High |
| `ENH-13` | Audit log | `NFR-24`, `AC-23`, `AC-24` all point at it | High |
| `ENH-14` | Plan modification | `NFR-16` names "modify"; no story provides it | Medium |
| `ENH-15` | Session revocation / logout | Implied by `AC-11`/`AC-17`; never stated | High |
| `ENH-16` | Seed / demo dataset | The five timing NFRs cannot be measured without data | High |
| `ENH-17` | Performance budgets in CI | Keeps the five timing NFRs honest | Medium |
| `ENH-18` | Constraints list + Definition of Done | `EXP-2` Step 2, `INC-02` | Medium |
| `ENH-19` | **Create a membership** (`POST /members/:id/memberships`) | No story creates one, yet four stories presuppose it | **IMPLIED-MANDATORY** |
| `ENH-20` | **`TrainerAssignment` record** | `NFR-10` per-member reading needs it; write as a side effect of `AC-06` | **IMPLIED-MANDATORY** |

**`ENH-02` … `ENH-06` are critical**: without them, six of the 25 mandatory Lab 1 stories
cannot function. They are enhancements only in the sense that no source document assigns
them an owner — the functionality they unblock **is** mandatory.

---

## 28. Open decisions — status after the B-03/B-04/B-05 review

**Four of six blocking decisions are now RESOLVED.** See `docs/decisions/`.

| ID | Decision | Status | Outcome |
|---|---|---|---|
| `B-01` | Do members log in? | ✅ Resolved (Phase 1) | Yes — tracked as `ENH-01`, excluded from academic coverage |
| `B-02` | Authorisation model | ✅ Resolved (Phase 1) | Six roles, deny-by-default (ADR-007) |
| `B-03` | Is branch a data-scoping boundary? | ✅ **RESOLVED** | **Non-isolating scoping attribute.** Classified an **ASSUMPTION** — only four source sentences mention branches, and `US-12` argues *against* isolation. `Member`/`Staff` → nullable `homeBranchId`; `Equipment`/attendance → NOT NULL `branchId`; plans global. Supersedes ADR-014 |
| `B-04` | Who creates the five missing record types? | ✅ **RESOLVED** | **None of the six endpoints was actually blocked.** All were always MANDATORY. `ENH-05` withdrawn as over-engineered; `ENH-04` reclassified IMPLIED-MANDATORY |
| `B-05` | Membership state set | ✅ **RESOLVED** | **THREE states**, not four: `ACTIVE`, `EXPIRED`, `CANCELLED`. `Expiring` is a **derived predicate**, not a stored state. Supersedes ADR-013 |
| `B-06` | Which experiment numbering governs? | ⚠️ **OPEN** | Mitigated by labelling per artefact (`ASM-16`); affects submission labelling only |

### Two new findings from the review

| ID | Finding | Classification |
|---|---|---|
| `ENH-19` | **No user story creates a membership.** `US-17`, `US-18`, `US-19` and `US-20` all presuppose one. Sixth missing write path | **IMPLIED-MANDATORY** |
| `ENH-20` | `NFR-10` under the chosen per-member reading needs a `TrainerAssignment` record no story creates. Minimum: write it as a side effect of `AC-06` | **IMPLIED-MANDATORY** |

## 29. Related documents

| Document | Contents |
|---|---|
| `docs/project/PHASE_STATUS.md` | Live phase and deliverable status |
| `docs/architecture/TECHNOLOGY_DECISIONS.md` | Stack choices with alternatives and trade-offs |
| `docs/architecture/ARCHITECTURAL_DECISIONS.md` | Numbered ADRs |
| `docs/project/REFERENCE_ANALYSIS.md` | Full source extraction |
| `docs/project/REQUIREMENT_GAP_ANALYSIS.md` | Conflicts, ambiguities, risks, blocking decisions |
| `docs/requirements/LAB1_TRACEABILITY_MATRIX.md` | Verbatim stories and criteria |
| `docs/requirements/LAB2_NFR_TRACEABILITY.md` | NFR verification detail |
| `docs/ui/DESIGN_SYSTEM.md` | Visual source of truth |

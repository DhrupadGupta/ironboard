# Ironboard — Architectural Decision Records

**Phase:** 1 — Master Plan · **Date:** 2026-08-16 · **Last reconciled with the implementation:**
2026-08-16 · **Status:** Decided. **The database layer (ADR-005, ADR-011, ADR-013, ADR-014) is
implemented and verified in Phase 3.** Every other ADR remains a design decision with no code
behind it.

Each ADR states context, decision, alternatives, consequences, and the **requirement that
drives it**. Where a decision rests on an assumption rather than a source document, the `ASM`
or `B` ID is named — no assumption is presented as a requirement.

| ADR | Decision | Status |
|---|---|---|
| [001](#adr-001) | Modular monolith, five department modules | Accepted |
| [002](#adr-002) | Layered module structure | Accepted |
| [003](#adr-003) | REST API at `/api/v1` | Accepted |
| [004](#adr-004) | Shared Zod schemas as the contract | Accepted |
| [005](#adr-005) | **Prisma as ORM** | Accepted |
| [006](#adr-006) | Server-side sessions, not JWT | Accepted |
| [007](#adr-007) | Deny-by-default RBAC with resource-level checks | Accepted |
| [008](#adr-008) | Transactional outbox for notifications | Accepted |
| [009](#adr-009) | Plain CSS tokens; no CSS framework | Accepted |
| [010](#adr-010) | Test pyramid with one suite per acceptance criterion | Accepted |
| [011](#adr-011) | Append-only ledger and audit log | Accepted |
| [012](#adr-012) | Verification thresholds for the 15 unquantified NFRs | ✅ Accepted |
| [013](#adr-013) | ~~Four-state membership machine~~ | ❌ **Superseded by B-05** (three states) |
| [014](#adr-014) | ~~Branch as a NOT NULL scoping column~~ | ❌ **Superseded by B-03** (nullable homeBranchId) |
| [015](#adr-015) | Member role is an enhancement, not academic coverage | Accepted |

---

## ADR-001 — Modular monolith with five department modules {#adr-001}

**Context.** Lab 1 organises 25 stories into exactly five departments. The homepage
corroborates (`05 Core departments`, five cards, footer "modules"). The database is SQLite.

**Decision.** A single deployable Node process containing five modules — `reception`,
`trainer`, `administration`, `membership`, `accounting` — over a shared platform kernel.

**Alternatives.** *Microservices* — incoherent over an embedded single-writer database, and
five services for an academic project is unjustifiable overhead. *Layered monolith without
module boundaries* — loses the 1:1 mapping to the DFD Level-1 processes.

**Consequences.** ✅ Module boundaries mirror `D01`–`D05` and therefore the DFD Level-1
decomposition (`DIA-02`), making the design deliverable verifiable against code.
⚠️ Cross-module calls (`FR-REC-04` → `FR-ACC-01`) go through service interfaces, not direct
repository access, or the boundary erodes.

**Drives:** `D01`–`D05`, `DIA-02`, `AC-15`.

---

## ADR-002 — Layered module structure {#adr-002}

**Decision.** `routes → controller → service → repository`. Controllers handle HTTP only and
never touch Prisma. Services hold business rules and own transactions, and never see
`req`/`res`. Repositories are the only Prisma consumers.

**Consequences.** ✅ Services are unit-testable without HTTP, which is what makes 25 acceptance
test suites affordable. ✅ Transaction boundaries sit in one layer, which `NFR-24` needs.
⚠️ More files per feature; accepted for testability.

**Drives:** all 25 `AC-nn` tests, `NFR-24`.

---

## ADR-003 — REST API at `/api/v1` {#adr-003}

**Decision.** Resource-oriented REST, plural nouns, JSON, RFC 9457 Problem Details for errors,
cursor pagination, `Idempotency-Key` on payment and invoice creation.

**Alternatives.** *GraphQL* — the domain is resource-shaped and REST endpoints trace more
legibly to `FR` IDs. *tRPC* — excellent DX but couples client to server internals and produces
no inspectable API surface for the API documentation deliverable.

**Consequences.** ✅ Every endpoint maps to one `FR`/`AC` row in the traceability matrix.
✅ Idempotency addresses `NFR-22`, since `AC-22` allows both automatic and manual invoice
triggering — a genuine duplicate risk.

**Drives:** `NFR-22`, `AC-22`, traceability API column.

---

## ADR-004 — Shared Zod schemas as the contract {#adr-004}

**Context.** `NFR-02` requires validating "all member information before saving". **No field
rules exist in any source** (`INC-05`) — formats, lengths, required-ness and uniqueness are all
invented.

**Decision.** One Zod schema per resource in a shared workspace package, imported by both
client form and server boundary. Types are inferred from the schemas, not hand-written.

**Consequences.** ✅ Client and server cannot disagree about validity. ✅ Every invented rule
sits in one reviewable place rather than being scattered — important because they are
assumptions, not requirements. ⚠️ Each rule must be logged as an `ASM-nn`.

**Drives:** `NFR-02`, `INC-05`.

---

## ADR-005 — Prisma as ORM {#adr-005}

**Context.** The instruction set React/Express/SQLite and delegated the ORM choice. **No data
model exists in any source document** (`INC-04`), yet Course Policy Lab 6 and `EXP-5-CLASS.docx`
both require a class diagram with attributes and relationships.

**Decision.** **Prisma 6** with the SQLite provider.

**Why.**
1. `schema.prisma` is a single declarative file expressing entities, fields, types, relations
   and cardinality — it maps 1:1 to `DIA-09` (class) and `DIA-16` (ER). On a project graded on
   traceability, having the *invented* data model in one reviewable artefact is decisive.
2. Generated types make structural violations a compile error, complementing Zod's value-level
   rules for `NFR-02`.
3. `prisma migrate` gives versioned, committed SQL — reproducible for demonstration, and a
   tested path for the durability claims in `NFR-07`/`NFR-13`.
4. `$transaction` expresses `AC-21` (clear balance **and** issue receipt) and `AC-24` (refund
   **and** log) atomically, which is what `NFR-24` requires.

**Alternatives.** **Drizzle ORM** was the runner-up and is arguably the better engineering
choice — lighter, SQL-transparent, no codegen. It loses only on the schema-as-deliverable
argument, since its schema is TypeScript code rather than a declarative model file. *TypeORM*
rejected (weak type safety, decorator runtime). *Sequelize* rejected (poor TypeScript).
*Kysely* rejected (query builder, no migrations). *Raw `better-sqlite3`* rejected (no
migrations, no generated types — `INC-05` makes hand-rolled validation a liability).

**Consequences.** ✅ Data model traces mechanically to two required diagrams. ⚠️ Codegen step
in the build. ⚠️ Less control over emitted SQL — acceptable, with raw queries available for
the report aggregations behind `NFR-14`/`NFR-23`.

**Drives:** `DIA-09`, `DIA-16`, `NFR-02`, `NFR-24`, `INC-04`.

---

## ADR-006 — Server-side sessions, not JWT {#adr-006}

**Context.** ⚠️ **No source document defines authentication at all** (`AMB-03`). But two
acceptance criteria demand immediate access changes: `AC-11` activates a staff account on
approval, and `AC-17` sets status "Cancelled" **and stops gym access**.

**Decision.** Argon2id password hashing; opaque session tokens in a SQLite `Session` table;
`httpOnly`, `Secure`, `SameSite=Strict` cookie; CSRF token on mutations.

**Alternatives.** *Stateless JWT* — cannot be revoked before expiry. Adding a denylist to fix
that produces a session table with extra moving parts. *JWT with very short TTL + refresh* —
more complexity, still not immediate. *Third-party identity provider* — out of scope; no source
mentions one.

**Consequences.** ✅ Revocation is immediate, which `AC-11` and `AC-17` actually require.
✅ Session rows are auditable (`ENH-13`). ⚠️ Every authenticated request reads the session
table — trivially cheap in embedded SQLite. ⚠️ Entirely `ASM-03`; must be flagged as an
assumption in the traceability rows it touches.

**Drives:** `AC-11`, `AC-17`, `NFR-11`, `NFR-21`, `ENH-15`.

---

## ADR-007 — Deny-by-default RBAC with resource-level checks {#adr-007}

**Context.** Three NFRs are access-control requirements: `NFR-10` (medical data — "authorized
**trainers**"), `NFR-11` ("**Only** administrators"), `NFR-21` (payment data). `B-02` is
resolved by the six-role list.

**Decision.** Role → permission set. Every endpoint declares a required permission; an endpoint
with no declaration **fails closed**. Two checks are resource-level, not role-level:

- `NFR-10` — a trainer sees medical data only for **assigned** members. "Authorized trainers"
  is stricter than "trainers", and implementing it as a blanket role grant would not satisfy
  the requirement as written.
- Member (`ENH-01`) — own records only.

**Consequences.** ✅ `T-SEC-001/002/003` become straightforward per-role assertions.
✅ Adding an endpoint without a permission declaration is a failure, not a silent hole.
⚠️ Resource-level checks live in services, so controllers alone cannot be trusted for authz.

**Drives:** `NFR-10`, `NFR-11`, `NFR-21`, `B-02`.

---

## ADR-008 — Transactional outbox for notifications {#adr-008}

**Context.** `NFR-01` gives registration a **3-second budget** while `AC-01` requires a welcome
email. `AC-19` sends reminders, `AC-22` emails invoices, `AC-25` offers payment notices. No
provider is named anywhere (`AMB-12`).

**Decision.** Business transactions write a `NotificationOutbox` row atomically; a worker
dispatches asynchronously through an adapter interface (email transport; **SMS stubbed and
logged, not sent**).

**Alternatives.** *Inline sending* — puts third-party latency inside a measured budget and
would make `NFR-01` fail for reasons unrelated to the system. *External queue* — unnecessary
infrastructure at this scale.

**Consequences.** ✅ `NFR-01` measures system work, not provider latency. ✅ Retries give
`NFR-19` a defensible implementation. ⚠️ **`NFR-19` says reminders are "delivered
successfully" — delivery is partly outside system control.** The system guarantees dispatch
with retry, and reports must say exactly that rather than claiming delivery.

**Drives:** `NFR-01`, `NFR-19`, `AC-01`, `AC-19`, `AC-22`.

---

## ADR-009 — Plain CSS tokens; no CSS framework {#adr-009}

**Context.** `reference/design/gym-management-homepage-2.html` is the visual source of truth
and is READ-ONLY. It uses nine `:root` custom properties, `border-radius: 0` everywhere except
decorative circles, hairline borders instead of shadows, and a non-8pt spacing scale.

**Decision.** Copy the `:root` block verbatim into `design-system/tokens.css`; build primitives
(Button, Card, Board, Tag, StatRail, FlowStrip) directly from the source patterns. No CSS
framework.

**Alternatives.** *Tailwind* — its default palette, radius and shadow utilities pull toward
exactly the generic SaaS look the `ironboard-ui-visual-qa` skill exists to block; overriding
its scale costs more than it saves. *Material UI / shadcn / Bootstrap* — each imposes a design
language that would overwrite the source of truth. *CSS-in-JS* — runtime cost, no benefit.

**Consequences.** ✅ Tokens stay byte-identical to the source. ✅ `--ink-3` and `--volt-dim`
(declared but unused in the source) are preserved rather than pruned. ⚠️ Primitives must be
built by hand — deliberate, and the reason the design system document exists.

**Drives:** `UI-01`…`UI-10`, `INC-12`.

---

## ADR-010 — Test pyramid with one suite per acceptance criterion {#adr-010}

**Decision.** Vitest (unit/integration/acceptance), Supertest (API), Testing Library
(component), Playwright (system/E2E/visual). **One acceptance suite per `AC-nn`, all 25**, each
assertion mapped to a single Then-clause.

**Consequences.** ✅ Academic coverage becomes mechanically countable. ✅ Nine multi-clause
criteria yield multiple assertions rather than one weak one. ⚠️ Five criteria are **untestable
until `B-04`** (`AC-05`, `AC-10`, `AC-11`, `AC-13`, `AC-14`, `AC-24`) — marked `BLOCKED`, never
`FAIL`. ⚠️ Negative paths are `ENH-09`, labelled and excluded from academic coverage.

**Drives:** all `AC-nn`, `INC-01`, `B-04`.

---

## ADR-011 — Append-only ledger and audit log {#adr-011}

**Context.** `AC-23` reads "system transaction logs"; `AC-24` requires "log the transaction";
`NFR-24` requires accurate financial records. **No story defines either table.**

**Decision.** `LedgerEntry` (financial, append-only, the source for `AC-23`) and `AuditEvent`
(security and lifecycle, append-only). Neither is ever updated or deleted; corrections are
compensating entries.

**Consequences.** ✅ `NFR-24` becomes verifiable via balance invariants. ✅ `AC-23`'s three
figures (income, refunds, pending) derive from one source. ⚠️ Storage grows monotonically —
acceptable; no retention requirement exists (`INC-06`). ⚠️ The audit log is `ENH-13`, not
academic coverage.

**Drives:** `AC-23`, `AC-24`, `NFR-24`, `ENH-13`.

---

## ADR-012 — Verification thresholds for the 15 unquantified NFRs {#adr-012}

**Status: ✅ ACCEPTED — expanded into `docs/architecture/ADR-012-NFR-THRESHOLDS.md`.**

The provisional table that stood here has been **superseded**. Two changes matter:

1. **Strict 🟩 SOURCE / 🟦 ENGINEERING labelling.** No invented figure may be cited as an
   academic requirement; 🟦 results report as `PASS (ENGINEERING THRESHOLD)`.
2. **Scaled down to student/college project reality.** The earlier draft proposed
   production-shaped figures (10 branches × 1 000 members; availability as uptime percentages).
   Availability NFRs are now verified as bounded 30-minute soak runs with 0 unhandled 5xx, and
   `NFR-12` targets 3 branches / 1 000 members at ≤ 10 concurrent requests.

`NFR-13` and `NFR-22` remain **unfalsifiable absolutes** and are reported as
`PASS (PROXY)`. `NFR-19` measures **dispatch**, never delivery. The two 🟩 99.9 % figures
(`NFR-03`, `NFR-15`) stay as source requirements but are proxy-verified, since demonstrating
99.9 % needs production telemetry this project does not have.

Full detail: `docs/architecture/ADR-012-NFR-THRESHOLDS.md` and
`docs/requirements/NFR_VERIFICATION_THRESHOLDS.md`.

---

## ADR-013 — Membership as an explicit state machine {#adr-013}

**Status: FINAL — `B-05` RESOLVED. Superseded in substance by the `B-05` decision:
three states, not four.** Implemented and verified in Phase 3.
→ `docs/decisions/B-05_MEMBERSHIP_STATE_MACHINE.md`

**Context.** `AC-20` filters on **two** states (Active, Expired). `AC-17` introduces
**Cancelled**. `AC-19` implies **Expiring** (7-day threshold). **Lab 1 never defines the state
set** (`AMB-07`).

**Decision (as implemented).** **Exactly three persisted states — `ACTIVE`, `EXPIRED`,
`CANCELLED`.** `EXPIRING` is a **derived predicate** over `expiresAt`, never a stored value:
`AC-19` describes a temporal condition, not a status, and `AC-17`/`AC-20` quote only the other
three as status values.

Transition table, enforced at the database layer:

| From | To |
|---|---|
| `ACTIVE` | `ACTIVE` (extend/renew, T6) · `EXPIRED` (T2) · `CANCELLED` (T3) |
| `EXPIRED` | `ACTIVE` (renewal, T5) · `CANCELLED` (T4) |
| `CANCELLED` | **terminal — no transition out** |

**Enforcement.** Three independent mechanisms, none of them application code:
a CHECK constraint on `Membership.state`; the `Membership_state_transition_guard` trigger
(`RAISE(ABORT)` on any transition outside the table above); and the
`Membership_one_active_per_member` partial unique index (`WHERE state = 'ACTIVE'`).

**Consequences.** ✅ Produces the required state chart (`DIA-07`) and gives `NFR-17` ("only
**valid** inactive memberships") a decidable meaning. ✅ `AC-20`'s two-state filter is satisfied
without contradiction, because `EXPIRING` is a query rather than a fourth status the UI would
have to expose. ⚠️ `CANCELLED` being terminal is **not stated in any source** — it is the
`B-05` decision, and the trigger makes it irreversible in data.

**Superseded text (retained for the record).** This ADR originally specified four states,
`Active → Expiring → Expired → Cancelled` (`ASM-13`), and flagged that `AC-20` filters only two
of them. That reading was rejected by the `B-05` review.

**Drives:** `AC-17`–`AC-20`, `NFR-17`, `DIA-07`, `DIA-10`, `WF-02`.

**Verified:** `T-U-020`, `T-U-040`–`T-U-042`, `T-U-044` · live counts `ACTIVE=725 EXPIRED=175
CANCELLED=100`, zero rows in any other state.

---

## ADR-014 — Branch as a scoping column, not a tenant boundary {#adr-014}

**Status: FINAL — `B-03` RESOLVED. Superseded in substance by the `B-03` decision:
branch is a descriptive attribute, and people are NOT branch-isolated.** Implemented and
verified in Phase 3. → `docs/decisions/B-03_DECISION.md`

**Context.** `AC-12` manages branches; `NFR-12` requires supporting several "efficiently".
**No source states whether members, staff, equipment or plans are branch-scoped** (`AMB-05`).

**Decision (as implemented).** Branch is a **non-isolating descriptive attribute, not a tenant
boundary.** `US-12` argues against isolation — "all locations … monitored from one system" —
and no source sentence bars a member from using another branch.

| Column | Implemented as | Why |
|---|---|---|
| `Member.homeBranchId` | **nullable** | a person's home branch is descriptive; membership is not branch-bound |
| `Staff.homeBranchId` | **nullable** | same |
| `Equipment.branchId` | **NOT NULL** | a machine is physically at one location |
| `AttendanceEvent.branchId` | **NOT NULL** | a check-in happened at one location |
| `AttendanceDaily.branchId` | **NOT NULL** | aggregate of the above |
| `MembershipPlan` | **no branch column** | plans are global |

**No row-level tenancy isolation exists, and no query path filters by branch.** `NFR-12` is
satisfied by indexing, not by partitioning.

**Alternatives rejected.** *Everything branch-scoped* — heavier, and no source demands it;
it would also contradict `US-12`. *Branch as a display label only* — cheapest, but loses the
physical-location facts that `AC-13` and `AC-14` genuinely need.

**Consequences.** ✅ Cross-branch reads are the default, which is what `AC-15`'s all-department
dashboard needs. ✅ `INC-09` (what happens to members of a disabled branch) is answered
structurally: `homeBranchId` is `SET NULL`, and the member is unaffected. ⚠️ `NFR-12`
"efficiently" remains unquantified in source (`INC-07`); the verification threshold is
🟦 engineering, per ADR-012.

**Superseded text (retained for the record).** This ADR originally assumed `ASM-05` — `Member`
and `Staff` carrying a NOT NULL `branchId` — and warned that the decision "gates Phase 3".
Both statements are obsolete: the `B-03` review reversed the nullability and Phase 3 shipped.

**Drives:** `AC-12`, `NFR-12`, `B-03`, `R-05`.

**Verified:** `T-I-050` · live data — 44 members and 1 staff carry `NULL`, attendance spans
every branch in one query, `MembershipPlan` has no branch column.

---

## ADR-015 — Member role is an enhancement, not academic coverage {#adr-015}

**Context.** The Phase 1 instruction lists six roles including **Member**, resolving `B-01`
as "members log in". Verified against `reference/lab1/`: **zero of the 25 user stories are
owned by a member**; the five story-owning roles are staff only. Member appears in Lab 1 only
as a *recipient* inside acceptance criteria.

**Decision.** Build the Member role and its screens, tracked as **`ENH-01`**. Report member
functionality in the enhancement table, **never** in the 25-story academic coverage.

**Consequences.** ✅ The product decision is honoured. ✅ Academic coverage stays truthful — an
audit cannot be inflated by counting member screens as Lab 1 stories. ⚠️ Member permissions are
entirely invented; no source constrains them. ⚠️ Roughly doubles the UI surface; scheduled
after the mandatory 25 are functional.

**Drives:** `B-01`, `ACT-06`, `ENH-01`, `R-19`.

---

## Related

`docs/architecture/TECHNOLOGY_DECISIONS.md` · `docs/project/MASTER_PLAN.md` ·
`docs/project/REQUIREMENT_GAP_ANALYSIS.md` (source of every `B`, `ASM`, `AMB`, `INC`, `CON` ID).

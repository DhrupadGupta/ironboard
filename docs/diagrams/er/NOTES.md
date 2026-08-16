# ER / data model — notes

## Contents

| File | ID | Status |
|---|---|---|
| `er-model.puml` / `.png` | `DIA-16` | **ENHANCEMENT** — not academic coverage |

## Status and provenance

`DIA-16` is **not** required by any lab. It is introduced by the
`software-engineering-diagrams` skill because **neither Lab 1 nor Lab 2 defines a data model**
(`INC-04`), and both the class diagram (`DIA-09`, Course Policy Lab 6 / `EXP-5-CLASS.docx`) and
the database layer need one.

`docs/project/REFERENCE_ANALYSIS.md` §10 registers `DIA-01`…`DIA-15`. `DIA-16` sits
deliberately outside that registry. **Never count it toward academic diagram coverage.**

## ⚠️ Every attribute here is an assumption

This is the single most important caveat on this diagram. Lab 1 and Lab 2 name **no** entity,
attribute, type, key or relationship. Everything was derived from acceptance-criteria prose.

Fields that come closest to being sourced:

| Field | Source text |
|---|---|
| `Member.name/email/phone` | `AC-01` "valid member info (Name, Email, Phone)" |
| `Member.memberCode` | `AC-01` "generate a Member ID" |
| `MembershipPlan.price/duration/accessRules` | `AC-16` "price, duration, and access rules are entered" |
| `Membership.state` | `AC-17` "Cancelled", `AC-20` "Active"/"Expired", `AC-19` expiring |
| `PlanExercise.sets/reps` | `AC-09` "exercises, sets, or reps" |
| `Payment.method` | `AC-21` "cash, card, or online" |
| `Equipment.status` | `AC-13` "In Maintenance" |
| `ProgressEntry.weightKg` | `AC-07` "logs weight or measurements" |

Everything else — all ids, timestamps, statuses, JSON columns, idempotency keys, hashes — is an
engineering decision. No type or length is sourced (`INC-05`).

## Entities that exist only to unblock a Lab 1 story

Six Lab 1 stories read data that **no story creates** (`B-04`, unresolved). These entities are
enhancements; the stories they unblock are mandatory.

| Entity | Enhancement | Unblocks | Precondition text |
|---|---|---|---|
| `AttendanceEvent` | `ENH-02` | `US-05`, `US-14` | "check-in data is recorded at the entrance" |
| `MedicalRestriction` | `ENH-03` | `US-10` | "a member has a health condition logged" |
| `Equipment`, `MaintenanceSchedule` | `ENH-04` | `US-13` | "a machine needs regular service" |
| ~~`RefundRequest`~~ | `ENH-05` **WITHDRAWN** (`B-04`) | `US-24` | "an approved refund request" — approval is an **external** precondition, captured as data on `Refund` |
| `Staff.status = pending` | `ENH-06` | `US-11` | "a new staff member registers for access" |
| `Prospect` | `ENH-07` | `US-03` | "a potential customer's details" |
| `WorkoutPlan.isTemplate` | `ENH-08` | `US-06` | "chooses **or creates** a workout plan" |

## Entities driven by NFRs rather than stories

| Entity | Driver |
|---|---|
| `TrainerAssignment` | `NFR-10` says "**authorized** trainers" — stricter than a role check |
| `AttendanceDaily` | `NFR-14` 5 s budget — pre-aggregation |
| `LedgerEntry` | `NFR-24`, `AC-23` "system transaction logs" — ADR-011 |
| `AuditEvent` | `NFR-24`, `AC-24` "log the transaction" — `ENH-13` |
| `NotificationOutbox` | `NFR-01` 3 s budget with `AC-01`'s welcome email — ADR-008 |
| `MembershipEvent` | `WF-02`, feeds the state chart `DIA-07` |
| `WorkoutPlan.version` | `NFR-09` "without affecting existing data" |
| `Payment/Invoice.idempotencyKey` | `NFR-22`, `AC-22` dual trigger paths |

## Decisions baked into this model — now RESOLVED

The three decisions below were open when this diagram was first drawn. They were resolved in the
pre-Phase-3 decision review, and the diagram was **redrawn from the implemented schema** during
the Phase 3 self-review.

| ID | Effect on the model | Resolution |
|---|---|---|
| `B-03` | Which entities carry a branch column | **Descriptive, not isolating.** `Member.homeBranchId` and `Staff.homeBranchId` are NULLABLE; `Equipment`, `AttendanceEvent`, `AttendanceDaily` carry a NOT NULL `branchId`; `MembershipPlan` carries none. |
| `B-04` | Whether the `ENH-02`…`ENH-07` entities are correct | `ENH-02/03/04/06/07` kept; **`ENH-05` (`RefundRequest`) withdrawn** — approval is external and stored as data on `Refund`. |
| `B-05` | `Membership.state` value set | **Exactly three:** `ACTIVE` / `EXPIRED` / `CANCELLED`. `EXPIRING` is a derived predicate, never a stored state. |

## Cross-diagram consistency

`Membership.state` values **must** match the state chart (`DIA-07`) exactly.
Entity names **must** match the class diagram (`DIA-09`) when it is built.
Both checks are required by the skill and are currently pending, since `DIA-07` and `DIA-09`
do not exist yet. The diagram now matches `server/prisma/schema.prisma`, so both future diagrams
must be drawn against the same three states and the same entity set.

## Verification

| Check | Result |
|---|---|
| Renders without exception | ✅ 0 exceptions |
| **Matches the implemented schema** | ✅ re-verified in the Phase 3 self-review, which found and fixed drift (4 states, withdrawn `RefundRequest`, wrong branch columns) |
| PNG read and inspected | ✅ 3655 × 1429, ratio **2.56** — see the note below |
| All entity names, attributes, cardinalities legible | ✅ |
| Crow's-foot cardinality on every relation | ✅ |

**Aspect ratio, stated honestly:** the redraw is 2.56 wide-to-tall, just past the skill's 2.5
guideline. The overrun comes from adding the resolved-decision legend, not from added entities.
Every entity name, attribute and cardinality was read back from the PNG and is legible, so the
diagram was accepted at 2.56 rather than split into two figures. **This is a known, accepted
deviation, not a passed check.**

**Known layout limitation, stated honestly:** `Branch` sits at the far right while its children
sit left of centre, so those relations cross most of the canvas. Both `linetype ortho` and
`linetype polyline` were tried; `ortho` crashes Graphviz here and `polyline` produced a
byte-identical layout. The lines remain individually traceable, so the diagram was accepted
rather than split. `B-03` resolved to "descriptive attribute", which keeps the columns but
removes any isolation semantics from these edges.

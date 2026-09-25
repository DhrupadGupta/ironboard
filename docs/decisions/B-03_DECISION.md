# B-03 — Branch Scoping: Decision Record

**Status:** ✅ **RESOLVED** · **Date:** 2026-08-16
**Authority:** original documents in `reference/`, re-extracted for this review
**Supersedes:** ADR-014 (provisional)

---

## 1. Source evidence — the complete set

An exhaustive search of `reference/lab1/` and `reference/lab2/` for `branch`, `Branch`,
`location`, `Location`, `multiple`, `across` returns **four** distinct mentions. This is the
entire evidential basis for branch scoping in the project.

| # | Source | Verbatim |
|---|---|---|
| 1 | `reference/lab1/` p.5 — `US-12` | "As an administrator, I want to **manage gym branches** so that **all locations can be monitored from one system**." |
| 2 | `reference/lab1/` p.7 — `AC-12` | "Given the admin is on the branch management page, When the admin **adds, updates, or disables a branch**, Then update the system records for that location." |
| 3 | `reference/lab2/` p.7 — FR column | "Manage gym branches" |
| 4 | `reference/lab2/` p.7 — `NFR-12` | "Scalability: The system should **support multiple gym branches efficiently**." |

### What the sources do NOT say

Verified absent from **every** source document:

- ❌ No statement that a **member** belongs to a branch
- ❌ No statement that **staff** belong to a branch
- ❌ No statement that **equipment** belongs to a branch
- ❌ No statement that **attendance** is recorded per branch
- ❌ No statement that **membership plans** are global or branch-specific
- ❌ No statement about **cross-branch access** for members
- ❌ No statement about **data isolation** between branches
- ❌ No branch **count**, member volume or concurrency figure (`INC-07`)

---

## 2. Classification of the current proposal

Current Phase 2 proposal: `Member → branchId`, `Staff → branchId`, `Equipment → branchId`,
`Attendance → branchId`, `MembershipPlan → global`.

| Question | Answer |
|---|---|
| 1. Explicitly required by the sources? | **NO** |
| 2. Implied by the sources? | **PARTIALLY** — only that `Branch` is an entity with add/update/disable |
| 3. An engineering enhancement? | Partly |
| 4. **An assumption?** | ✅ **YES — this is the correct classification** |

**The proposal is an ASSUMPTION.** It was recorded as `ASM-05`/ADR-014 and must never be cited
as a sourced requirement.

What *is* genuinely supported by source:

| Claim | Support |
|---|---|
| `Branch` is a first-class entity | **EXPLICIT** — `AC-12` "adds, updates, or disables a branch" |
| Branch has a lifecycle incl. **disabled** | **EXPLICIT** — `AC-12` |
| The system must handle **more than one** branch | **EXPLICIT** — `NFR-12` "multiple gym branches" |
| Branch data is **centrally visible** | **EXPLICIT** — `US-12` "monitored **from one system**" |
| Anything else about branch | **NOT PRESENT** |

> ⚠️ **`US-12` is evidence *against* tenant isolation.** "All locations can be monitored from
> one system" states the opposite of siloed data. Any architecture that hard-isolates branches
> would contradict the one explicit sentence the source provides.

---

## 3. Alternatives evaluated

### Alternative A — Branch as a display label only
`Branch` exists; nothing references it.

| Pros | Cons |
|---|---|
| Simplest possible schema | Makes `NFR-12` meaningless — nothing to scale |
| Zero migration risk | Cannot answer "which branch was this attendance at?" |
| | Equipment cannot be located, contradicting physical reality |

### Alternative B — Branch as a non-isolating scoping attribute *(recommended)*
Physically-located entities carry a required `branchId`; people carry an optional home branch;
plans stay global; **no row-level isolation**; all admin reporting is cross-branch by default.

| Pros | Cons |
|---|---|
| Honours `US-12` "monitored from one system" | Requires discipline: scoping is a query concern, not enforced by the DB |
| Makes `NFR-12` testable (10 branches × 1 000 members) | Nullable columns need care in reports |
| Matches physical reality — a treadmill is at one site | |
| Cheapest correct answer; nullable columns are low-risk to tighten later | |

### Alternative C — Full multi-tenant isolation
Every table carries `branchId`; row-level security; cross-branch access forbidden by default.

| Pros | Cons |
|---|---|
| Strong data isolation | **Directly contradicts `US-12`** — admin could not monitor all locations from one system |
| Familiar SaaS pattern | Massive complexity for zero sourced benefit |
| | Would require inventing a cross-branch admin exception the source never asks for |
| | Highest migration cost |

### Alternative D — Branch-scoped plans
As B, plus `MembershipPlan.branchId`.

| Pros | Cons |
|---|---|
| Supports per-site pricing | **Nothing in the source suggests it** |
| | `AC-16` already gives plans "access rules" — the natural home for branch access if ever needed |

---

## 4. Evaluation against the requested criteria

| Criterion | Finding |
|---|---|
| **Data isolation** | **Not required, and arguably counter-indicated.** `US-12` demands central visibility. |
| **Staff access** | No source restricts staff to a branch. `NFR-11` restricts by **role**, not location. |
| **Reporting** | `AC-14` reports "total visits and peak busy hours"; `AC-15` aggregates departments — **neither mentions branch**. Branch is a useful *filter*, not a partition. |
| **Member ownership** | Never stated. Real gyms usually have a home branch with multi-site access — best modelled as an optional attribute, not an ownership boundary. |
| **Equipment ownership** | Never stated, but **physically unavoidable** — a machine exists at one site. `AC-13`'s "In Maintenance" is meaningless without knowing where. |
| **Attendance** | `AC-14` says "check-in data is recorded **at the entrance**" — an entrance is at a location. Strongest implicit case for a required `branchId`. |
| **Future scalability** | `NFR-12` asks for efficiency across multiple branches — satisfied by indexing, not by isolation. |
| **Cross-branch administration** | **Explicitly required** by `US-12`. Must be the default, not an exception. |
| **Database complexity** | Alternative B adds 4 columns and 3 indexes. Alternative C would touch nearly every table. |

---

## 5. Decision

> ### ✅ **Alternative B — Branch is a non-isolating scoping attribute.**

| Entity | `branchId` | Nullability | Justification |
|---|---|---|---|
| `Equipment` | ✅ | **NOT NULL** | Physical reality; `AC-13` + `AC-12` |
| `AttendanceEvent` | ✅ | **NOT NULL** | `AC-14` "recorded at the entrance" |
| `AttendanceDaily` | ✅ | **NOT NULL** | Aggregate of the above; `NFR-14` |
| `Staff` | ✅ `homeBranchId` | **NULLABLE** | Assumption; null = org-wide (e.g. Administrator) |
| `Member` | ✅ `homeBranchId` | **NULLABLE** | Assumption; **does not restrict access** |
| `MembershipPlan` | ❌ | — | Global. `AC-16` "access rules" is the correct extension point |
| `Payment`, `Invoice`, `LedgerEntry`, `Membership` | ❌ | — | Reachable via `Member`; no source links them to a branch |

**Governing rules**
1. **No row-level tenant isolation.** Branch is a filter, never a wall.
2. **Admin reporting is cross-branch by default** — `US-12`, "monitored from one system".
3. `homeBranchId` on people is **descriptive, not restrictive**. A member is not barred from
   another branch, because **no source says they would be**.
4. Disabling a branch (`AC-12`) marks it disabled and blocks *new* assignment. Existing rows
   are retained — `INC-09` leaves the consequence undefined, and deletion would violate
   `NFR-13`.

### Confidence

**Medium-low, and deliberately so.** Only one entity assignment (`AttendanceEvent`) has a
genuine textual hook; `Equipment` rests on physical reality rather than text. The design is
chosen to be **cheap to tighten** — nullable columns can be made NOT NULL later, whereas
removing hard isolation is expensive. That asymmetry drove the choice.

---

## 6. Affected entities

| Entity | Change from Phase 2 proposal |
|---|---|
| `Member.branchId` | → **`homeBranchId`, nullable** (was NOT NULL) |
| `Staff.branchId` | → **`homeBranchId`, nullable** (was NOT NULL) |
| `Equipment.branchId` | unchanged, NOT NULL |
| `AttendanceEvent.branchId` | unchanged, NOT NULL |
| `AttendanceDaily.branchId` | unchanged, NOT NULL |
| `MembershipPlan` | unchanged — no branch column |

**Net change:** two columns become nullable and are renamed to express intent.

## 7. Affected APIs

| Endpoint | Effect |
|---|---|
| `GET /branches` | Unchanged |
| `POST /branches/:id/disable` | Blocks new assignment; retains rows |
| `GET /members?branchId=` | **Optional filter**, never mandatory |
| `GET /reports/attendance/daily?branchId=` | **Optional filter**; omitted ⇒ all branches (`US-12`) |
| `GET /dashboard/summary` | **Cross-branch by default** |
| `POST /attendance/check-in` | **Must supply `branchId`** |
| `POST /equipment` | **Must supply `branchId`** |

## 8. Affected permissions

**None.** No source ties a permission to a branch. `NFR-10`, `NFR-11` and `NFR-21` are all
role- or assignment-based. Adding branch-based permissions would be inventing a requirement.

## 9. Affected reports

| Report | Effect |
|---|---|
| Daily attendance (`AC-14`) | Gains an optional `branchId` filter; defaults to all |
| Department summary (`AC-15`) | Cross-branch; branch is not a dimension the source asks for |
| Revenue (`AC-23`) | **No branch dimension** — no source connects revenue to location |
| Overdue (`AC-25`) | No branch dimension |

## 10. Migration implications

Because Phase 3 has not started, **there is no migration** — this is a design change before
any schema exists. Recorded for the future:

| Change | Cost |
|---|---|
| Nullable → NOT NULL later | **Low** — backfill + constraint |
| Add `branchId` to a table later | **Medium** — backfill needed |
| Adding hard isolation later | **High** — touches every query and would contradict `US-12` |
| Removing branch entirely | **Low** — few dependents |

The design is deliberately positioned at the low-cost end of that table.

---

## 11. Honest summary

The source documents **do not determine** branch scoping. Four sentences exist; they establish
that branches are manageable entities, that there is more than one, and that they are centrally
monitored. Everything else is engineering judgement.

This decision therefore stands as an **assumption**, chosen to be minimal, reversible, and
consistent with the single explicit constraint the source does provide: *"all locations can be
monitored from one system."*

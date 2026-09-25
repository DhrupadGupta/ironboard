# Ironboard — Pre-Phase-3 Decision Register

**Date:** 2026-08-16 · **Purpose:** single gate check before database implementation
**Status:** Phase 3 **NOT started.** No schema, no migration, no application code.

---

## 1. Register

### `B-03` — Branch scoping

| Field | Value |
|---|---|
| **Status** | ✅ **RESOLVED** |
| **Source support** | **ASSUMPTION.** Four sentences total mention branches. `US-12`, `AC-12`, the Lab 2 FR label, `NFR-12`. **Nothing** links a member, staff member, equipment item or attendance record to a branch |
| **Decision** | Branch is a **non-isolating scoping attribute**. `Equipment` + attendance → NOT NULL `branchId`. `Member`/`Staff` → **nullable `homeBranchId`**. Plans global. **No row-level isolation**; admin reporting cross-branch by default |
| **Implementation impact** | 4 columns, 3 indexes. Two columns nullable rather than NOT NULL. `POST /attendance/check-in` and `POST /equipment` must supply `branchId`. No permission changes |
| **Blocks Phase 3?** | ❌ **No** |
| **Confidence** | Medium-low, deliberately. Chosen because nullable→NOT NULL is cheap later, while removing isolation is not |
| **Doc** | `docs/decisions/B-03_DECISION.md` |

### `B-04` — Blocked endpoints

| Field | Value |
|---|---|
| **Status** | ✅ **RESOLVED** |
| **Source support** | Strong. A `Given` clause is a **precondition**, not a system obligation |
| **Decision** | **None of the six was blocked. 6 → 0.** All were always MANDATORY. `ENH-05` (refund request workflow) **withdrawn** as over-engineered; `ENH-04` → IMPLIED-MANDATORY; `ENH-03` scope reduced to a field at registration |
| **Implementation impact** | 2 endpoints removed, minimal write paths added. No mandatory requirement now waits on an optional enhancement |
| **Blocks Phase 3?** | ❌ **No** |
| **Doc** | `docs/decisions/B-04_API_DECISIONS.md` |

### `B-05` — Membership state machine

| Field | Value |
|---|---|
| **Status** | ✅ **RESOLVED** |
| **Source support** | **Strong/explicit.** `"Active"`, `"Expired"` (`AC-20`) and `"Cancelled"` (`AC-17`, "set status to") are quoted status values. `"Expiring"` is **not** — `AC-19` describes a temporal condition |
| **Decision** | **THREE persisted states**: `ACTIVE`, `EXPIRED`, `CANCELLED`. `isExpiringSoon` is a **derived predicate**. 6 transitions, `CANCELLED` terminal |
| **Implementation impact** | CHECK constraint has 3 values; one scheduled job removed; `AC-20`'s two filters no longer hide rows; feeds `DIA-07`/`DIA-10` |
| **Blocks Phase 3?** | ❌ **No** |
| **Confidence** | High on states; low on renewal base date and the 7-day window (both examples or silent) |
| **Doc** | `docs/decisions/B-05_MEMBERSHIP_STATE_MACHINE.md` |

### `ENH-19` — Membership creation

| Field | Value |
|---|---|
| **Status** | ✅ **RESOLVED** |
| **Source support** | **None.** No story or criterion creates a membership, yet `US-17`, `US-18`, `US-19`, `US-20` presuppose one |
| **Decision** | **ENGINEERING ENHANCEMENT — REQUIRED FOR SYSTEM COMPLETENESS.** One endpoint `POST /members/:id/memberships`, owned by **Membership Manager** (`D04` owns every other membership operation). **No new user story.** `AC-01` left untouched so it stays testable as written |
| **Implementation impact** | 1 endpoint, 1 permission, 1 transaction (Membership + MembershipEvent T1 + AuditEvent). **No new tables.** Payment deliberately **not** required — no criterion gates creation on payment |
| **Blocks Phase 3?** | ❌ **No** |
| **Doc** | `docs/requirements/ENH-19_MEMBERSHIP_CREATION.md` |

### `ENH-20` — Trainer assignment

| Field | Value |
|---|---|
| **Status** | ✅ **RESOLVED** |
| **Source support** | **Partial/derived.** `AC-06` literally says "**link** the plan to the member's profile"; `AC-08` binds a trainer to a member for a session. The *table* is not in any source |
| **Decision** | `TrainerAssignment` written as a **side effect of `AC-06` and `AC-08`** — no new user-facing feature. Admin fallback endpoint only (assumption). Pure derivation from `WorkoutPlan` was **rejected**: `AC-10` requires the medical alert "**before workouts are set**", which a plan-derived rule cannot satisfy |
| **Implementation impact** | Existing entity + 2 fields (`source`, `revokedAt`); 2 side-effect writes; 1 admin-only endpoint pair; authorisation guard on medical reads |
| **Blocks Phase 3?** | ❌ **No** |
| **Doc** | `docs/requirements/ENH-20_TRAINER_ASSIGNMENT.md` |

### `AC-11` — "send login details"

| Field | Value |
|---|---|
| **Status** | ✅ **RESOLVED** |
| **Source support** | 🟩 Verbatim: "Then activate the account and **send login details**" |
| **Decision** | **ENGINEERING SECURITY IMPROVEMENT / IMPLEMENTATION INTERPRETATION.** Email carries genuine login details (sign-in URL, identifier, role) **plus a single-use link to set a password** — no password transmitted |
| **Requirement satisfied** | Intent **fully**; literal text **substantially**. Residual deviation is narrow: no password is sent |
| **Implementation impact** | Activation-token field on `Staff`; one email template. Reversible if a literal reading is required |
| **Traceability** | Original wording **preserved verbatim** in `LAB1_TRACEABILITY_MATRIX.md`, interpretation recorded alongside — never in place of it |
| **Blocks Phase 3?** | ❌ **No** |

### `NFR-10` — "authorized trainers"

| Field | Value |
|---|---|
| **Status** | ✅ **RESOLVED** |
| **Source support** | 🟩 Verbatim: "Medical information should only be accessible to **authorized trainers**." **Genuinely ambiguous** — `NFR-21`'s parallel "authorized **staff**" supports a role-based reading |
| **Decision** | **Per-member interpretation retained** |
| **Requirement satisfied** | ✅ **Under both readings.** Per-member is a strict subset of role-based, so it cannot fail either. Role-based would fail if per-member was intended |
| **Interpretation** | Recorded as an **IMPLEMENTATION INTERPRETATION**, not a rewrite. Both readings documented |
| **Implementation impact** | Requires `ENH-20`; service-layer guard; every medical read audited |
| **Blocks Phase 3?** | ❌ **No** |
| **Doc** | `docs/decisions/DEVIATIONS.md` |

### `ADR-012` — NFR thresholds

| Field | Value |
|---|---|
| **Status** | ✅ **RESOLVED / ACCEPTED** |
| **Source support** | 🟩 10 of 25 NFRs carry a source figure. 🟦 15 do not |
| **Decision** | Adopt engineering thresholds for the 15, under strict 🟩/🟦 labelling. Scaled to **student/college local project** — earlier production-shaped figures (10 branches × 1 000 members; uptime SLAs) **withdrawn**. Availability verified as bounded 30-min soak runs, not SLA percentages |
| **Implementation impact** | **Seed dataset (`ENH-16`) becomes a hard prerequisite.** `synchronous = FULL` required. Indexes on `AttendanceDaily` and `LedgerEntry` justified. Test harness needs p95 timing, soak, failure injection, restore drill |
| **Reporting rule** | 🟦 results report as **`PASS (ENGINEERING THRESHOLD)`**; `NFR-13`/`NFR-22`/`NFR-03`/`NFR-15` as **`PASS (PROXY)`**; `NFR-19` reports **dispatched**, never delivered |
| **Blocks Phase 3?** | ❌ **No** |
| **Docs** | `docs/architecture/ADR-012-NFR-THRESHOLDS.md`, `docs/requirements/NFR_VERIFICATION_THRESHOLDS.md` |

---

## 2. Remaining non-blockers — documented, deliberately not solved

### `B-06` — Experiment numbering

| Field | Value |
|---|---|
| **Status** | ⚠️ **OPEN — will remain open** |
| **Source support** | `CON-01`. The course-policy lab table and the handout filenames align **only at Experiment 1** |
| **Decision** | **Not resolvable by us.** Label every deliverable by **artefact name** (`use-case`, `dfd-l1`, `class`), never by bare experiment number. Both numbering claims recorded in each `NOTES.md` |
| **Why not solved** | Only the course faculty can say which scheme governs. Picking one silently would risk submitting against the wrong scheme |
| **Implementation impact** | **None on code.** Affects submission labelling only |
| **Blocks Phase 3?** | ❌ **No** |

### `ASM-09` — Pressman's three golden rules

| Field | Value |
|---|---|
| **Status** | ⚠️ **OPEN — assumption, clearly labelled** |
| **Source support** | **None.** Course Policy Lab 7 and Syllabus Unit 6 both require "three golden rules"; **no supplied document enumerates them** |
| **Assumption** | They are Pressman's (the prescribed textbook, 9th ed.): *place the user in control · reduce the user's memory load · make the interface consistent* |
| **Why not solved** | The textbook is not in `reference/`. Stating the rules as sourced would be fabricating a citation |
| **Implementation impact** | Affects `DIA-12` only. The assumption must be stated **on the deliverable itself** |
| **Blocks Phase 3?** | ❌ **No** — affects a Phase 2b diagram |

### `AMB-10` — Literature survey

| Field | Value |
|---|---|
| **Status** | ⚠️ **OPEN — cannot be resolved from source** |
| **Source support** | Course Policy Lab 1 requires shortlisting **at least five case studies** and selecting one. **No supplied document records which five were considered, or that the gym system was the selection.** Every handout reads `<case study name>` unfilled |
| **Decision** | ⛔ **DO NOT FABRICATE.** The five shortlisted case studies **will not be invented.** The deliverable will state plainly that the source material does not contain them, and that the gym management system is only *assumed* to be the selection (`ASM-08`) |
| **Why not solved** | The information does not exist in `reference/`. Any five case studies written now would be fiction presented as academic work |
| **Implementation impact** | **None on code.** Leaves Policy Lab 1 permanently `PARTIAL` in the submission audit — correctly |
| **Blocks Phase 3?** | ❌ **No** |

---

## 3. Summary

| ID | Status | Blocks Phase 3? |
|---|---|---|
| `B-03` | ✅ Resolved | ❌ No |
| `B-04` | ✅ Resolved | ❌ No |
| `B-05` | ✅ Resolved | ❌ No |
| `ENH-19` | ✅ Resolved | ❌ No |
| `ENH-20` | ✅ Resolved | ❌ No |
| `AC-11` | ✅ Resolved | ❌ No |
| `NFR-10` | ✅ Resolved | ❌ No |
| `ADR-012` | ✅ Resolved | ❌ No |
| `B-06` | ⚠️ Open (not resolvable) | ❌ No |
| `ASM-09` | ⚠️ Open (assumption) | ❌ No |
| `AMB-10` | ⚠️ Open (not in source) | ❌ No |

**8 resolved · 3 open, none blocking.**

---

## 4. Schema readiness

Every decision that shapes the schema is now settled:

| Schema question | Settled by |
|---|---|
| Which entities carry `branchId`, and nullability | `B-03` |
| `Membership.state` CHECK values | `B-05` — three |
| Whether `RefundRequest` exists | `B-04` — **withdrawn** |
| How a membership comes into existence | `ENH-19` |
| Whether `TrainerAssignment` is a table, and its fields | `ENH-20` |
| Whether `Staff` needs an activation token | `AC-11` |
| Which indexes the performance budgets justify | `ADR-012` |
| Whether a seed dataset is required | `ADR-012` — **yes, `ENH-16` is a prerequisite** |

### Residual assumptions carried into the schema

These are **recorded, not resolved** — they are engineering choices, and each is reversible at
low cost:

| Assumption | Reversal cost |
|---|---|
| `homeBranchId` nullable on `Member`/`Staff` | Low — backfill + constraint |
| `accessRules` as open JSON (`AC-16` never defines it) | Low — it is opaque to the schema |
| One `ACTIVE` membership per member at a time | Low — drop a unique partial index |
| `CANCELLED` is terminal | Low — a guard, not a column |
| Renewal extends from `max(expiresAt, now)` | Low — service logic |
| Every field type and length (`INC-04`, `INC-05`) | Medium — but unavoidable; no source provides them |

---

## 5. Final answer

> ### Is the database architecture now safe to implement?
>
> # ✅ **YES**

**Qualified as follows, honestly:**

1. **Safe** in that no *unresolved decision* would force a structural rewrite. The three
   decisions that could have (`B-03`, `B-05`, `B-04`) are settled, and the two newly-found gaps
   (`ENH-19`, `ENH-20`) are closed without new tables.
2. **Not "certain"** — the schema still rests on assumptions, because `INC-04` means **no source
   defines a data model at all**. Every one is logged and cheap to reverse (§4).
3. **`ENH-16` (seed data) is now a prerequisite**, not an optional extra — five performance NFRs
   cannot be verified without it.
4. The three open items (`B-06`, `ASM-09`, `AMB-10`) touch submission labelling and one
   Phase 2b diagram. **None touches the schema.**

**Phase 3 is not started.** Beginning it requires an explicit instruction.

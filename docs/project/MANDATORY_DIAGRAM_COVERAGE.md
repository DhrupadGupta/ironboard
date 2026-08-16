# Ironboard — Mandatory Diagram Coverage

**Date:** 2026-08-16 · **Status:** No diagram artefacts produced for the mandatory set.
**Authority:** `reference/course-policy/Software-engg-Course Policy_version1-26=27.pdf`
(lab table, pp.11–13) and `reference/experiments/*.docx` (stated **Output** lines).

---

## 1. How "mandatory" was determined

A diagram is **mandatory** only if a source document assigns it as a deliverable. Two sources
can do that:

1. **The Course Policy lab table** — "The following **10 programming exercises** will form the
   submission for laboratory coursework."
2. **An experiment handout's stated `Output:` line.**

The **syllabus** is *not* a source of deliverables. It lists taught content
(Units 1–7) and explicitly defers lab work to "8 to 10 programming exercises". Anything that
appears only in the syllabus is **taught, not assigned**.

### Derivation

| Source | Deliverable diagrams | Count |
|---|---|---|
| Policy Lab 3 | DFD level-0, level-1, level-2 | 3 |
| Policy Lab 4 | Use case diagram · Activity diagram | 2 diagrams |
| Policy Lab 4 | **Documentation of use cases** | **1 written artefact** |
| Policy Lab 5 | State chart diagram | 1 |
| Policy Lab 6 | Sequence diagram · Class diagram · State transition diagram | 3 |
| Policy Lab 7 | User interface diagram (three golden rules) | 1 |
| `EXP-7-COLLAB.docx` — "Output: A Collaboration diagram for the system." | Collaboration diagram | 1 |
| | **TOTAL MANDATORY DIAGRAMS** | **11** |
| | **TOTAL MANDATORY WRITTEN ARTEFACTS** | **1** |
| | **TOTAL MANDATORY DELIVERABLES** | **12** |

> ⚠️ **Counting rule — binding.** The mandatory set is **11 rendered diagrams + 1 written
> documentation artefact** = 12 deliverables. `DIA-05` (use case documentation) is prose: it has
> no `.puml` and no `.png` and is **not a diagram**.
> Report as *"Mandatory diagrams: n / 11"* plus the artefact separately.
> **Never** report *"n / 12 diagrams"* — that inflates diagram coverage by counting a document.

---

## 2. Mandatory deliverables — 11 diagrams + 1 written artefact

### `DIA-01` — DFD Level 0 (context)
| Field | Value |
|---|---|
| **Source** | `reference/course-policy/…` Lab 3; `reference/experiments/PRACTICAL 8-DFD.docx` Part B |
| **Reference** | "Design level-0 Data flow diagram"; "DEVELOP DFD LEVEL 0 AND LEVEL 1 FOR YOUR MINI PROJECT" |
| **Purpose** | Whole system as one process with external entities |
| **Inputs** | `ACT-01`–`ACT-05` + `Member`, `Entrance Check-in`; the 25 FRs as net flows |
| **Output** | `docs/diagrams/dfd/dfd-l0.puml` + `.png` |
| **Blocker** | **None** |
| **Status** | 🔴 Not started |

### `DIA-02` — DFD Level 1
| Field | Value |
|---|---|
| **Source** | Policy Lab 3; DFD handout Part B |
| **Reference** | "Design level-1 … Data flow diagram" |
| **Purpose** | Decompose into the five departments `1.0`–`5.0` with data stores |
| **Inputs** | `DIA-01`; `D01`–`D05`; entity list |
| **Output** | `docs/diagrams/dfd/dfd-l1.puml` + `.png` |
| **Blocker** | **None** — B-03 resolved (branch is not a partition) |
| **Status** | 🔴 Not started |

### `DIA-03` — DFD Level 2
| Field | Value |
|---|---|
| **Source** | Policy Lab 3 **only** |
| **Reference** | "Design level-1 **and Level-2** Data flow diagram" |
| **Purpose** | Decompose ≥1 Level-1 process into its five FRs |
| **Inputs** | `DIA-02`; Accounting `5.0` recommended (most sub-behaviours) |
| **Output** | `docs/diagrams/dfd/dfd-l2.puml` + `.png` |
| **Blocker** | **None**. ⚠️ `CON-02` — the DFD handout asks only for L0/L1; produce the superset |
| **Status** | 🔴 Not started |

### `DIA-04` — Use case diagram
| Field | Value |
|---|---|
| **Source** | Policy Lab 4; `reference/experiments/EXP-3-USE CASE.docx` |
| **Reference** | "Development of Use case diagram"; "Output: A Use case diagram for the System." |
| **Purpose** | 25 use cases, actors, associations, `<<include>>` for cross-department calls |
| **Inputs** | `US-01`–`US-25`, `FR-*` labels, `ACT-01`–`ACT-10` |
| **Output** | `docs/diagrams/use-case/use-case.puml` + `.png` |
| **Blocker** | **None** |
| **Status** | 🔴 Not started |

### `DIA-05` — Use case documentation *(written artefact)*
| Field | Value |
|---|---|
| **Source** | Policy Lab 4; `EXP-3-USE CASE.docx` |
| **Reference** | "**Documentation of use cases**"; "written first in narrative form and then mapped to a template" |
| **Purpose** | Per-use-case template: actors, preconditions, main flow, postconditions, exceptions |
| **Inputs** | `AC-01`–`AC-25` verbatim |
| **Output** | `docs/diagrams/use-case/USE_CASE_DOCUMENTATION.md` |
| **Blocker** | **None**. ⚠️ Exceptions section must record `INC-01` — Lab 1 has no rejection paths |
| **Status** | 🔴 Not started |

### `DIA-06` — Activity diagram
| Field | Value |
|---|---|
| **Source** | Policy Lab 4; `reference/experiments/EXP-4-ACTIVITY.docx` |
| **Reference** | "Activity Diagram"; "Output: A Activity diagram for the System." |
| **Purpose** | Cross-department member journey with swimlanes, fork/join, decisions |
| **Inputs** | `WF-01`; homepage workflow strip order |
| **Output** | `docs/diagrams/activity/activity-member-journey.puml` + `.png` |
| **Blocker** | **None** |
| **Status** | 🔴 Not started |

### `DIA-07` — State chart diagram
| Field | Value |
|---|---|
| **Source** | Policy Lab 5 |
| **Reference** | "Design State chart diagram using case study's Control specifications. **Make use of Star UML software**" |
| **Purpose** | Membership lifecycle |
| **Inputs** | **B-05 — RESOLVED**: 3 states (`ACTIVE`, `EXPIRED`, `CANCELLED`), 6 transitions |
| **Output** | `docs/diagrams/state/state-chart-membership.puml` + `.png` |
| **Blocker** | ✅ **CLEARED** (was `B-05`). ⚠️ Star UML unavailable — substitution must be recorded, never claimed |
| **Status** | 🔴 Not started — **now unblocked** |

### `DIA-08` — Sequence diagram
| Field | Value |
|---|---|
| **Source** | Policy Lab 6; `reference/experiments/LAB-6-Sequence diagram.docx` |
| **Reference** | "Design sequence diagram"; "Output: A Sequence diagram of the system." |
| **Purpose** | ≥2 flows with lifelines, activation boxes, sync/async |
| **Inputs** | `AC-01` registration; `AC-21`+`AC-04` payment→receipt |
| **Output** | `docs/diagrams/sequence/sequence-*.puml` + `.png` |
| **Blocker** | **None**. ⚠️ `AMB-09` — the handout's procedure text bleeds from `EXP-7`; follow its stated Output |
| **Status** | 🔴 Not started |

### `DIA-09` — Class diagram
| Field | Value |
|---|---|
| **Source** | Policy Lab 6; `reference/experiments/EXP-5-CLASS.docx` |
| **Reference** | "class diagram"; "Output: Class diagram for the system." |
| **Purpose** | Classes, attributes, operations, relationships, multiplicities |
| **Inputs** | **B-03 — RESOLVED**; `DIA-16` ER model; the six class-selection characteristics from the handout |
| **Output** | `docs/diagrams/class/class-diagram.puml` + `.png` |
| **Blocker** | ✅ **CLEARED** (was `B-03`). ⚠️ `INC-04` — every attribute is an assumption |
| **Status** | 🔴 Not started — **now unblocked** |

### `DIA-10` — State transition diagram
| Field | Value |
|---|---|
| **Source** | Policy Lab 6 |
| **Reference** | "state transition diagram for selected problem" |
| **Purpose** | Second entity's transitions, or the transition-table form of `DIA-07` |
| **Inputs** | **B-05 — RESOLVED**; candidate second entity: `Staff` account (`pending → active → disabled`) or `Equipment` |
| **Output** | `docs/diagrams/state/state-transition-*.puml` + `.png` |
| **Blocker** | ✅ **CLEARED** (was `B-05`). ⚠️ `AMB-08` — may be the same artefact as `DIA-07` |
| **Status** | 🔴 Not started — **now unblocked** |

### `DIA-11` — Collaboration / communication diagram
| Field | Value |
|---|---|
| **Source** | `reference/experiments/EXP-7-COLLAB.docx` |
| **Reference** | "Output: A Collaboration diagram for the system." |
| **Purpose** | Objects, links, **numbered** messages for one scenario |
| **Inputs** | Same flow as one `DIA-08` sequence, so the two cross-check |
| **Output** | `docs/diagrams/collaboration/collab-*.puml` + `.png` |
| **Blocker** | **None**. ⚠️ `CON-03` — has a handout and a syllabus entry but **no policy lab slot** |
| **Status** | 🔴 Not started |

### `DIA-12` — User interface design diagram
| Field | Value |
|---|---|
| **Source** | Policy Lab 7 |
| **Reference** | "Design the appropriate user interface diagram for your project using **three golden rules**" |
| **Purpose** | UI design mapped to the three golden rules |
| **Inputs** | `docs/ui/DESIGN_SYSTEM.md`; homepage as visual source of truth |
| **Output** | `docs/diagrams/ui/ui-design.puml` + `.png` + written analysis |
| **Blocker** | ⚠️ **`ASM-09`** — no supplied document enumerates the three golden rules; they come from the prescribed textbook (Pressman). Assumption must be stated |
| **Status** | 🔴 Not started |

---

## 3. Engineering enhancements — NOT mandatory

**These must never be counted toward the 12.**

| ID | Diagram | Why not mandatory | Status |
|---|---|---|---|
| `DIA-13` | Control Flow Model | Syllabus Unit 4 teaches it; **no lab assigns it** | 🚫 Not planned |
| `DIA-14` | Burndown chart | Policy Lab 8 Task 9, explicitly marked "**Proposed**" | 🔴 Optional |
| `DIA-15` | **Architecture diagram** | Syllabus Unit 5 teaches Architectural Design; **no lab assigns a diagram** | ✅ **Built** (Phase 2) |
| `DIA-16` | **ER / data model** | **No lab assigns it.** The policy lists "Knowledge of ER diagram" only as a *prerequisite* for Labs 4–5, never as an output | ✅ **Built** (Phase 2) |

> **`DIA-15` and `DIA-16` are complete but contribute 0 to mandatory coverage.** They were
> built because Phase 2 asked for them. The policy's phrase *"Knowledge of ER diagram"* sits in
> the **Prerequisite** column of the lab table — it is assumed background knowledge, not a
> deliverable. This was verified against the original table text.

---

## 4. Coverage summary

| Set | Complete | Total |
|---|---|---|
| **Mandatory rendered diagrams** | **0** | **11** |
| **Mandatory written artefact** (`DIA-05`) | **0** | **1** |
| Enhancement diagrams | 2 | 4 |

**Mandatory diagram coverage: 0 / 11.**  ·  **Use case documentation (`DIA-05`): not started.**

> Reported as 11 diagrams + 1 written artefact, never as "0 / 12 diagrams".

### Blocker status after this decision review

| Blocker | Was blocking | Now |
|---|---|---|
| `B-03` branch scoping | `DIA-09` | ✅ **CLEARED** |
| `B-05` membership states | `DIA-07`, `DIA-10` | ✅ **CLEARED** |
| `B-04` blocked endpoints | (none directly) | ✅ **CLEARED** |
| `ASM-09` three golden rules | `DIA-12` | ⚠️ **OPEN** — not in any source; must be stated as an assumption |
| `B-06` experiment numbering | Labelling only | ⚠️ **OPEN** — mitigated by labelling per artefact |

**11 of 12 are fully unblocked.** `DIA-12` can proceed under a stated assumption.

---

## 5. Recommended production order

Dependency-driven, not numeric:

1. `DIA-01` → `DIA-02` → `DIA-03` (DFD chain — establishes processes and data stores)
2. `DIA-04` → `DIA-05` (use cases, then their documentation)
3. `DIA-09` (class — consumes the resolved data model)
4. `DIA-07` → `DIA-10` (states — consumes B-05)
5. `DIA-08` → `DIA-11` (sequence, then the collaboration view of the same flow)
6. `DIA-06` (activity — cross-department journey)
7. `DIA-12` (UI — last; depends on the design system)

---

## 6. Related

`docs/decisions/B-03_DECISION.md` · `B-04_API_DECISIONS.md` · `B-05_MEMBERSHIP_STATE_MACHINE.md` ·
`.claude/skills/software-engineering-diagrams/SKILL.md` ·
`docs/project/REFERENCE_ANALYSIS.md` §10 · `docs/project/PHASE_STATUS.md`

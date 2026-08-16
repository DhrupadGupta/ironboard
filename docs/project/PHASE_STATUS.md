# Ironboard — Phase Status

**Updated:** 2026-08-16 · **Commit:** see git log · **Current phase:** **Phase 3 (database) COMPLETE** · Phase 4 NOT started

> Live status. Update on every phase transition and whenever a blocking decision is resolved.
> **No status may be marked ✅ without a checkable artefact path.**

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Complete, artefact exists and was verified |
| 🟡 | In progress / partial |
| 🔴 | Not started |
| ⛔ | Blocked — a `B-nn` decision is required |
| 🚫 | Not applicable / deliberately out of scope |

---

## Phase overview

| Phase | Name | Status | Gate |
|---|---|---|---|
| 0 | Analysis & skills | ✅ | — |
| **1** | **Master plan** | ✅ | — |
| 2 | Architecture ✅ / Requirements & design 🔴 | 🟡 | — (`B-03`,`B-04`,`B-05` ✅ resolved) |
| 3 | Foundation — **database** | ✅ | — |
| 4 | Department modules | 🔴 | Phase 3 |
| 5 | Frontend | 🔴 | Phase 3 primitives |
| 6 | Cross-cutting | 🔴 | Phase 4 |
| 7 | Verification | 🔴 | Phases 5–6 |
| 8 | Academic deliverables | 🔴 | Phase 7 |
| 9 | Audit & submission | 🔴 | All |

**Database layer exists** (`server/`). No service, API or UI code exists. Phases 4–9 have
produced nothing yet, by design.

---

## Phase 0 — Analysis & skills ✅

| Deliverable | Status | Artefact |
|---|---|---|
| Reference analysis | ✅ | `docs/project/REFERENCE_ANALYSIS.md` |
| Gap analysis | ✅ | `docs/project/REQUIREMENT_GAP_ANALYSIS.md` |
| Lab 1 traceability matrix | ✅ | `docs/requirements/LAB1_TRACEABILITY_MATRIX.md` |
| Lab 2 NFR traceability | ✅ | `docs/requirements/LAB2_NFR_TRACEABILITY.md` |
| Design system | ✅ | `docs/ui/DESIGN_SYSTEM.md` |
| Five project skills | ✅ | `.claude/skills/*/SKILL.md` |
| Project instructions | ✅ | `CLAUDE.md` |

---

## Phase 1 — Master plan ✅

| Deliverable | Status | Artefact |
|---|---|---|
| Master plan (29 sections) | ✅ | `docs/project/MASTER_PLAN.md` |
| Technology decisions | ✅ | `docs/architecture/TECHNOLOGY_DECISIONS.md` |
| Architectural decisions (15 ADRs) | ✅ | `docs/architecture/ARCHITECTURAL_DECISIONS.md` |
| Phase status | ✅ | This document |
| Requirements re-verified against `reference/` | ✅ | 25 AC triples, 25 story headings, 5 story-owning roles, 25 NFR labels |

### Decisions made in this phase

| ID | Decision | Effect |
|---|---|---|
| `B-01` | **Resolved** — members log in | `ACT-06` enabled as `ENH-01` |
| `B-02` | **Resolved** — six roles, deny-by-default RBAC | ADR-007 |
| ORM | **Prisma 6** | ADR-005 |
| Auth | Server-side sessions, not JWT | ADR-006 |
| Styling | Plain CSS tokens, no framework | ADR-009 |

### Corrections made in this phase

| Correction | Where |
|---|---|
| NFR category counts summed to 27, not 25 (Availability listed 6, Data Integrity 4) | `REFERENCE_ANALYSIS.md` §7.1, `LAB2_NFR_TRACEABILITY.md` §3.1 — both now 5 and 3 |

---

## Phase 2 — Architecture ✅ (partial: architecture only)

> **Phase numbering note.** The master plan's Phase 2 is "Requirements & design". The
> instruction that produced this work called it "Phase 2 — Architecture" and covered the
> architecture subset only. The requirements-phase documents, the **11 mandatory diagrams** and
> the written artefact `DIA-05` below all remain outstanding.

| Deliverable | Status | Artefact |
|---|---|---|
| System architecture | ✅ | `docs/architecture/SYSTEM_ARCHITECTURE.md` |
| Database design | ✅ | `docs/architecture/DATABASE_DESIGN.md` |
| API architecture (56 endpoints after B-04) | ✅ | `docs/architecture/API_ARCHITECTURE.md` |
| Security architecture | ✅ | `docs/architecture/SECURITY_ARCHITECTURE.md` |
| Architecture diagram | ✅ | `docs/diagrams/architecture/architecture.png` (`DIA-15`, ENH) |
| ER / data model diagram | ✅ | `docs/diagrams/er/er-model.png` (`DIA-16`, ENH) |

**Both diagrams are enhancements, not academic coverage.** Mandatory diagram count remains **0 / 11** (plus the written artefact `DIA-05`, not started).

⚠️ **Architecture was designed on unconfirmed assumptions.** `B-03`, `B-04` and `B-05` were not
answered before this phase. ADR-013 (states), ADR-014 (branch scoping) and `ENH-02`…`ENH-06`
(write paths) are baked into the database and API designs. `B-03` in particular touches nearly
every table.

---

## Phase 2b — Requirements & design diagrams 🔴

**Unblocked.** `B-03`, `B-04` and `B-05` are resolved. Of the **11 mandatory diagrams**, 10 have no
remaining blocker and `DIA-12` may proceed under the stated `ASM-09` assumption. The written
artefact `DIA-05` is unblocked.

### Requirements-phase documents (owner: `requirements-traceability`)

| Deliverable | Status | Target | Source |
|---|---|---|---|
| Problem statement | 🔴 | `docs/project/PROBLEM_STATEMENT.md` | Policy Lab 1, item 6 |
| Feasibility study | 🔴 | `docs/project/FEASIBILITY.md` | Policy Lab 1, item 4 |
| User vs system requirements | 🔴 | `docs/requirements/USER_VS_SYSTEM_REQUIREMENTS.md` | Policy Lab 1, item 7 |
| Development plan | 🔴 | `docs/project/DEVELOPMENT_PLAN.md` | Policy Lab 1, item 9 |
| Process model selection | 🔴 | `docs/project/PROCESS_MODEL.md` | Policy Lab 2 |
| Literature survey (5 → 1 case studies) | ⛔ | — | Policy Lab 1; **`AMB-10`** — no source records the selection |

### Diagrams (owner: `software-engineering-diagrams`)

| ID | Diagram | Status | Blocked by |
|---|---|---|---|
| `DIA-01` | DFD Level 0 | 🔴 | — |
| `DIA-02` | DFD Level 1 | 🔴 | — |
| `DIA-03` | DFD Level 2 | 🔴 | `CON-02` — produce anyway (superset) |
| `DIA-04` | Use case diagram | 🔴 | — |
| `DIA-05` | Use case documentation **(written artefact, not a diagram)** | 🔴 | — |
| `DIA-06` | Activity diagram | 🔴 | — |
| `DIA-07` | State chart (membership) | 🔴 | ✅ cleared — 3 states (`B-05`) |
| `DIA-08` | Sequence diagram | 🔴 | — |
| `DIA-09` | Class diagram | 🔴 | ✅ cleared (`B-03`) |
| `DIA-10` | State transition (2nd entity) | 🔴 | ✅ cleared (`B-05`); `AMB-08` noted |
| `DIA-11` | Collaboration diagram | 🔴 | `CON-03` — no policy lab slot |
| `DIA-12` | UI design (three golden rules) | 🔴 | `ASM-09` — rules not in any source |
| `DIA-13` | Control flow model | 🚫 | Taught only; no lab assigns it |
| `DIA-14` | Burndown chart | 🔴 | Policy Lab 8, *proposed* |
| `DIA-15` | Architecture diagram | ✅ built | ENHANCEMENT — counts 0 toward mandatory |
| `DIA-16` | ER / data model | ✅ built | ENHANCEMENT — counts 0 toward mandatory |

---

## Phases 3–9 — Not started 🔴

| Phase | Deliverables | Notes |
|---|---|---|
| 3 Foundation — DB ✅ | Workspace scaffold, Prisma schema (28 entities), migration, 36 CHECKs, 7 triggers, deterministic seed, reset, 63 tests | ✅ **COMPLETE** — evidence `docs/testing/evidence/phase3-db-20260816T140858Z.log` |
| 3b Foundation — rest | Auth, RBAC, API skeleton, design-system primitives | 🔴 Not started |
| 4 Modules | D01 → D04 → D02 → D05 → D03 (dependency order, not numeric) | ✅ six stories unblocked (`B-04`) |
| 5 Frontend | Module screens, mobile nav (`ENH-11`) | — |
| 6 Cross-cutting | Outbox, reporting, audit log, scheduler | — |
| 7 Verification | 25 AC suites, 25 NFR verifications, all test levels | ✅ ADR-012 accepted; `ENH-16` seed data is a prerequisite |
| 8 Academic | Nine-field test cases, bug reports, burndown, constraints, DoD | `CON-05` — 4 cases / 2 functionalities |
| 9 Audit | `academic-submission-audit` report | — |

---

## Requirement coverage

**Academic — the closed 25 + 25 set.** Nothing implemented; all zero by design.

| Layer | Covered | Total |
|---|---|---|
| User stories implemented | 0 | 25 |
| Acceptance criteria with a passing test | 0 | 25 |
| NFRs with an implementation | 0 | 25 |
| NFRs with a verification | 0 | 25 |
| Departments fully delivered | 0 | 5 |
| Mandatory diagrams delivered | 0 | 11 |
| **Database entities implemented** | **28** | **28** |
| **Database tests passing** | **63** | **63** |
| Use case documentation (`DIA-05`, written) | 0 | 1 |

**Enhancements — reported separately, never summed with the above.**

| Covered | Total |
|---|---|
| 0 | 19 (`ENH-01`…`ENH-20`, less withdrawn `ENH-05`) |

---

## Blocking decisions

**Resolved in the B-03/B-04/B-05 decision review** — see `docs/decisions/`.

| ID | Question | Status | Outcome |
|---|---|---|---|
| `B-01` | Do members log in? | ✅ Resolved | Yes — `ENH-01`, excluded from academic coverage |
| `B-02` | Authorisation model | ✅ Resolved | Six roles, deny-by-default |
| `B-03` | Branch a scoping boundary? | ✅ **RESOLVED** | Non-isolating attribute; classified an **ASSUMPTION** |
| `B-04` | Five missing write paths | ✅ **RESOLVED** | 6 blocked endpoints → **0**; all were always MANDATORY |
| `B-05` | Membership state set | ✅ **RESOLVED** | **3 states**, not 4 |
| `B-06` | Experiment numbering | ⚠️ **OPEN** | Labelling only; mitigated by naming per artefact |

### Blocked stories — cleared

The six previously-blocked stories (`US-05`, `US-10`, `US-11`, `US-13`, `US-14`, `US-24`) are
**no longer blocked**. Each needs a minimal write path, not the full enhancement originally
proposed. `ENH-05` was withdrawn entirely as over-engineered.

### New findings

| ID | Finding | Classification |
|---|---|---|
| `ENH-19` | No user story creates a membership — sixth missing write path | ✅ **RESOLVED** — 1 endpoint, Membership Manager, no new tables |
| `ENH-20` | `TrainerAssignment` needed for `NFR-10`'s per-member reading | ✅ **RESOLVED** — side effect of `AC-06`/`AC-08`, no new feature |

### Remaining open — none blocking

| ID | Status | Why not solved |
|---|---|---|
| `B-06` | ⚠️ Open | Only faculty can say which experiment numbering governs; mitigated by labelling per artefact |
| `ASM-09` | ⚠️ Open | Three golden rules are not in any supplied document; stated as an assumption on `DIA-12` |
| `AMB-10` | ⚠️ Open | The five shortlisted case studies **do not exist in source** and **will not be fabricated** |

**Gate check:** `docs/project/PRE_PHASE_3_DECISION_REGISTER.md` — database architecture safe to
implement: **YES**.

---

## Mandatory diagram coverage

**Diagrams 0 / 11** · **written artefact `DIA-05` not started.** See
`docs/project/MANDATORY_DIAGRAM_COVERAGE.md`. Never report this as "0 / 12 diagrams".

`DIA-15` and `DIA-16` are complete but are **enhancements** and contribute **0** to this count.
The course policy lists "Knowledge of ER diagram" only in the **Prerequisite** column, never as
an output — verified against the original table.

**11 of 12 are now fully unblocked** (`B-03` and `B-05` cleared `DIA-07`, `DIA-09`, `DIA-10`).
`DIA-12` may proceed under the stated `ASM-09` assumption, since no supplied document
enumerates the three golden rules.

---

## Provisional decisions to confirm

| ADR | Decision | Status |
|---|---|---|
| ADR-012 | Verification thresholds for 15 unquantified NFRs | ✅ **ACCEPTED** — `ADR-012-NFR-THRESHOLDS.md`; scaled to student project, 🟩/🟦 labelled |
| ADR-013 | ~~Four membership states~~ | ❌ **SUPERSEDED** by `B-05` — three states |
| ADR-014 | ~~Branch as a NOT NULL scoping column~~ | ❌ **SUPERSEDED** by `B-03` — nullable `homeBranchId` on people |

---

## Next actions

1. **Confirm `B-03`, `B-04`, `B-05`** — these gate Phase 2 and, through it, everything else.
2. Confirm or amend ADR-012's assumed thresholds.
3. On confirmation: produce the Phase 2 requirements documents and diagrams.
4. Only then begin Phase 3 — Course Policy Lab 9 requires coding to follow the designs.

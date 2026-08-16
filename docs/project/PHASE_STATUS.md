# Ironboard — Phase Status

**Updated:** 2026-08-16 · **Commit:** see git log · **Current phase:** 1 complete → 2 gated

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
| 2 | Requirements & design | ⛔ | **`B-03`, `B-04`, `B-05`** |
| 3 | Foundation | 🔴 | Phase 2 diagrams; **`B-03`** |
| 4 | Department modules | 🔴 | Phase 3 |
| 5 | Frontend | 🔴 | Phase 3 primitives |
| 6 | Cross-cutting | 🔴 | Phase 4 |
| 7 | Verification | 🔴 | Phases 5–6 |
| 8 | Academic deliverables | 🔴 | Phase 7 |
| 9 | Audit & submission | 🔴 | All |

**No application code exists.** Phases 3–9 have produced nothing yet, by design.

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

## Phase 2 — Requirements & design ⛔

**Blocked.** Three decisions must be made before the diagrams can be drawn correctly.

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
| `DIA-05` | Use case documentation | 🔴 | — |
| `DIA-06` | Activity diagram | 🔴 | — |
| `DIA-07` | State chart (membership) | ⛔ | **`B-05`** |
| `DIA-08` | Sequence diagram | 🔴 | — |
| `DIA-09` | Class diagram | ⛔ | **`B-03`** (branch scoping changes the model) |
| `DIA-10` | State transition (2nd entity) | ⛔ | **`B-05`**, `AMB-08` |
| `DIA-11` | Collaboration diagram | 🔴 | `CON-03` — no policy lab slot |
| `DIA-12` | UI design (three golden rules) | 🔴 | `ASM-09` — rules not in any source |
| `DIA-13` | Control flow model | 🚫 | Taught only; no lab assigns it |
| `DIA-14` | Burndown chart | 🔴 | Policy Lab 8, *proposed* |
| `DIA-15` | Architecture diagram | 🚫 | Taught only; no lab assigns it |
| `DIA-16` | ER / data model | ⛔ | **`B-03`** · `ENH-12`, not academic coverage |

---

## Phases 3–9 — Not started 🔴

| Phase | Deliverables | Notes |
|---|---|---|
| 3 Foundation | Scaffold, Prisma schema, migrations, auth, RBAC, API skeleton, design-system primitives | ⛔ on `B-03` |
| 4 Modules | D01 → D04 → D02 → D05 → D03 (dependency order, not numeric) | Six stories ⛔ on `B-04` |
| 5 Frontend | Module screens, mobile nav (`ENH-11`) | — |
| 6 Cross-cutting | Outbox, reporting, audit log, scheduler | — |
| 7 Verification | 25 AC suites, 25 NFR verifications, all test levels | 15 NFRs need ADR-012 confirmation |
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
| Diagrams delivered | 0 | 12 mandatory |

**Enhancements — reported separately, never summed with the above.**

| Covered | Total |
|---|---|
| 0 | 18 (`ENH-01`…`ENH-18`) |

---

## Blocking decisions

| ID | Question | Assumed | Blocks | Needed by |
|---|---|---|---|---|
| `B-03` | Is branch a data-scoping boundary? | `ASM-05` / ADR-014 — members + staff scoped, plans global | `DIA-09`, `DIA-16`, entire Phase 3 schema | **Phase 2** |
| `B-04` | Who creates the five missing record types? | `ENH-02`…`ENH-06` | `US-05`, `US-10`, `US-11`, `US-13`, `US-14`, `US-24` | **Phase 2** |
| `B-05` | Membership state set | `ASM-13` / ADR-013 — Active/Expiring/Expired/Cancelled | `DIA-07`, `DIA-10`, `NFR-17` | **Phase 2** |
| `B-06` | Which experiment numbering governs? | `ASM-16` — label by artefact | Phase 8 labelling | Phase 8 |

`B-01` and `B-02` were resolved in Phase 1.

### The five blocked stories

Six Lab 1 stories depend on data no story creates. Marked ⛔ until `B-04` is confirmed.

| Story | Blocked by | Enhancement that unblocks it |
|---|---|---|
| `US-05` Check attendance | `AC-14` check-in precondition | `ENH-02` |
| `US-14` Monitor attendance | `AC-14` check-in precondition | `ENH-02` |
| `US-10` Medical restrictions | `AC-10` "health condition logged" | `ENH-03` |
| `US-13` Equipment schedules | `AC-13` "machine needs service" | `ENH-04` |
| `US-24` Process refunds | `AC-24` "approved refund request" | `ENH-05` |
| `US-11` Approve staff accounts | `AC-11` "staff registers for access" | `ENH-06` |

---

## Provisional decisions to confirm

| ADR | Decision | Risk if wrong |
|---|---|---|
| ADR-012 | Assumed thresholds for 15 unquantified NFRs | Invented numbers reported as requirements |
| ADR-013 | Four membership states | State chart and `NFR-17` both wrong |
| ADR-014 | Branch as a scoping column | **Most expensive to retrofit — touches nearly every table** |

---

## Next actions

1. **Confirm `B-03`, `B-04`, `B-05`** — these gate Phase 2 and, through it, everything else.
2. Confirm or amend ADR-012's assumed thresholds.
3. On confirmation: produce the Phase 2 requirements documents and diagrams.
4. Only then begin Phase 3 — Course Policy Lab 9 requires coding to follow the designs.

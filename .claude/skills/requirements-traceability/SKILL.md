---
name: requirements-traceability
description: Maintain the Ironboard end-to-end traceability chain — Requirement → User Story → Acceptance Criteria → Design → UI → API → Backend → Database → Test → Documentation — for the 25 Lab 1 stories and 25 Lab 2 NFRs. Use when adding or changing any feature, when asked what implements or verifies a requirement, when checking coverage or finding orphaned code, before opening a PR that touches application code, or when a requirement ID needs creating or retiring.
---

# Ironboard — Requirements Traceability

Keeps every Lab 1 functional requirement and Lab 2 non-functional requirement connected to the
artefacts that realise and verify it. **Every Lab 1 requirement must eventually be implemented.
Every acceptance criterion must be testable. Every Lab 2 NFR must have both an implementation
and a verification.**

## Ground rules

1. **`reference/` is READ-ONLY.**
2. **Never invent a requirement.** The requirement set is closed: 25 FRs, 25 user stories,
   25 acceptance criteria, 25 NFRs, all from `reference/lab1/` and `reference/lab2/` Part B.
   New capability that no lab document states is an **enhancement** (`ENH-nn`), tracked
   separately and never counted toward academic coverage.
3. **Never silently reconcile a conflict.** Conflicts carry IDs (`CON-01`…`CON-11`); cite the ID.
4. **An assumption is not a requirement.** If implementation needs a fact the labs don't
   provide, record it as `ASM-nn` in `docs/project/REQUIREMENT_GAP_ANALYSIS.md` and cite it in
   the traceability row.

## 0. Requirements-phase documents this skill also owns

Four Course Policy deliverables belong to the requirements phase and have no other owner.
Produce them here; `academic-submission-audit` only grades them.

| Deliverable | Required by | Output |
|---|---|---|
| Final problem statement | Policy Lab 1, item 6 | `docs/project/PROBLEM_STATEMENT.md` |
| Feasibility study | Policy Lab 1, item 4 | `docs/project/FEASIBILITY.md` |
| User vs system requirements split | Policy Lab 1, item 7 | `docs/requirements/USER_VS_SYSTEM_REQUIREMENTS.md` |
| Development plan | Policy Lab 1, item 9 | `docs/project/DEVELOPMENT_PLAN.md` |
| Process model selection + justification | Policy Lab 2 | `docs/project/PROCESS_MODEL.md` |

Policy Lab 1 also requires a literature survey with five shortlisted case studies narrowed to
one (`DOC-09`, `AMB-10`). No source document records that selection — the gym system is only
*assumed* to be the choice (`ASM-08`). Record the assumption; do not fabricate a survey.

## 1. The ID system

Defined in `docs/project/REFERENCE_ANALYSIS.md`, detailed in
`docs/requirements/LAB1_TRACEABILITY_MATRIX.md` and `docs/requirements/LAB2_NFR_TRACEABILITY.md`.

| Prefix | Meaning | Count | Source |
|---|---|---|---|
| `D01`–`D05` | Department / module | 5 | Lab 1 headings; homepage cards |
| `ACT-01`–`ACT-05` | Primary actor (owns stories) | 5 | Lab 1 Part B |
| `ACT-06`–`ACT-10` | Secondary actor (referenced only) | 5 | Lab 1 acceptance criteria |
| `US-01`–`US-25` | User story | 25 | `reference/lab1/` p.5 |
| `AC-01`–`AC-25` | Acceptance criterion (Given/When/Then) | 25 | `reference/lab1/` pp.5–9 |
| `FR-REC/TRN/ADM/MEM/ACC-01..05` | Functional requirement | 25 | `reference/lab2/` FR column |
| `FR-SUB-01`–`FR-SUB-25` | Sub-behaviour stated inside an AC | 25 | Lab 1 ACs |
| `NFR-01`–`NFR-25` | Non-functional requirement | 25 | `reference/lab2/` NFR column |
| `WF-01`–`WF-07` | Workflow / lifecycle | 7 | Lab 1 + homepage workflow strip |
| `DIA-01`–`DIA-15` | Diagram / doc artefact | 15 | Course policy + handouts — **11 mandatory diagrams + `DIA-05` written artefact** |
| `DIA-16` | ER model — **enhancement**, outside the source registry | 1 | Diagrams skill |
| `ENH-nn` | Engineering enhancement — **not academic** | — | This project |

Fixed 1:1 mapping: `US-nn ↔ AC-nn ↔ FR-…-nn ↔ NFR-nn` for all 25. Never renumber.

> The FR↔NFR pairings were verified by PDF bounding-box coordinates (every pair shares a
> y-coordinate), not reading order. Treat them as exact. If you believe a pairing is wrong,
> re-verify against the PDF before changing anything.

## 2. The traceability chain

Every requirement must reach the end of this chain. A link that does not yet exist is `—`,
never a guess.

```
Requirement (FR-xxx-nn)
  └─ User Story (US-nn)
      └─ Acceptance Criteria (AC-nn)
          ├─ Design      diagram IDs in docs/diagrams/
          ├─ UI          route/component path
          ├─ API         METHOD /path
          ├─ Backend     service/handler path
          ├─ Database    table/entity name
          ├─ Test        test IDs, all levels
          └─ Documentation  doc path
                └─ NFR (NFR-nn) → implementation + verification
```

### Row format — `docs/requirements/TRACEABILITY.md`

```markdown
| FR | US | AC | Design | UI | API | Backend | DB | Test | Docs | NFR | Verify | Status |
|----|----|----|--------|----|-----|---------|----|------|------|-----|--------|--------|
| FR-REC-01 | US-01 | AC-01 | DIA-04, DIA-08 | `/reception/members/new` | `POST /api/members` | `services/member.register` | `members` | `T-U-001`,`T-I-004`,`T-A-001` | `USE_CASE_DOCUMENTATION.md#uc-01` | NFR-01 | `T-P-001` | 🟢 |
```

**Status:** 🟢 complete (all links + passing tests) · 🟡 partial · 🔴 not started ·
⛔ blocked (cite `B-nn`).

## 3. Decision status — check before starting work

**All six gating decisions are RESOLVED.** Full records in `docs/decisions/` and
`docs/project/PRE_PHASE_3_DECISION_REGISTER.md`. Do not re-open them by assumption.

| ID | Decision | Status | Outcome |
|---|---|---|---|
| `B-01` | Do members log in? | ✅ | Yes — `ENH-01`, excluded from academic coverage |
| `B-02` | Authorisation model | ✅ | Six roles, deny-by-default (ADR-007) |
| `B-03` | Is branch a scoping boundary? | ✅ | Non-isolating attribute; classified an **ASSUMPTION** |
| `B-04` | Five missing write paths | ✅ | **No endpoint was actually blocked**; `ENH-05` withdrawn |
| `B-05` | Membership state set | ✅ | **Three** states — `ACTIVE`, `EXPIRED`, `CANCELLED` |
| `B-06` | Experiment numbering | ⚠️ Open | Not resolvable by us; label per artefact, never by number |

### Write paths — resolved, no longer blocking ⚠️

Six acceptance criteria read data no user story creates. `B-04` established that a `Given`
clause is a **precondition, not a system obligation**, so none of the mandatory endpoints was
blocked — each needs only a minimal write path.

| Precondition (verbatim from Lab 1) | AC | Resolution |
|---|---|---|
| "check-in data is recorded at the entrance" | `AC-14` | `ENH-02` — unblocks `US-05` **and** `US-14` |
| "a member has a health condition logged" | `AC-10` | `ENH-03`, scope reduced to a field at registration |
| "a machine needs regular service" | `AC-13` | `ENH-04` — **IMPLIED-MANDATORY** |
| "an approved refund request" | `AC-24` | `ENH-05` **WITHDRAWN** — approval is external; capture `approvedBy` as data |
| "a new staff member registers for access" | `AC-11` | `ENH-06` — enhancement, recommended |
| *(none — no story creates a membership)* | — | **`ENH-19`** — sixth path, found in the `B-05` review |

Plus: **Prospect** (`AC-03`, `ENH-07`), **plan templates** (`AC-06`, `ENH-08`), and
**`TrainerAssignment`** (`NFR-10`, `ENH-20` — written as a side effect of `AC-06`/`AC-08`).

## 4. Making acceptance criteria testable

Every `AC-nn` is a Given/When/Then already — map it directly to an executable test.

```
Given <precondition>  → test fixture / seeded state
When  <action>        → the call under test
Then  <outcome>       → assertions, one per clause
```

`AC-01` has three "Then" clauses (create profile · generate Member ID · send welcome email)
→ **three assertions**, not one. Split multi-clause outcomes.

⚠️ **`INC-01` — Lab 1 supplies only one criterion per story.** Its heading reads
"Accepatnce 1:", implying a missing second set; the Experiment 1 handout models two (happy
path + rejection). **All 25 rejection paths are absent.**

When writing negative tests, label them `AC-nn-NEG` and mark them `ENHANCEMENT — not in
source`. Do **not** present them as satisfying an academic requirement, and do not count them
in academic coverage.

## 5. NFR traceability — implementation *and* verification

Each `NFR-nn` needs two columns, not one:

| Field | Meaning |
|---|---|
| **Implementation** | The code/config that makes it true (index, cache, auth guard, encryption, retry) |
| **Verification** | The test that proves it (see the `testing-and-quality` skill) |

**Only 10 of 25 NFRs are quantified.** The other 15 fail the Experiment 2 handout's own test:
*"If you cannot quantify the story in concrete terms, this should be a bad smell."*

Stated thresholds — use these verbatim, never round them:

| Threshold | NFRs | Operation |
|---|---|---|
| 2 s | `NFR-06`, `NFR-18` | Workout plan load; membership renewal |
| 3 s | `NFR-01` | Member registration |
| 5 s | `NFR-14`, `NFR-23` | Attendance reports; revenue reports |
| 99.9 % | `NFR-03`, `NFR-15` | Scheduling; monitoring dashboard |
| Binary | `NFR-10`, `NFR-11`, `NFR-21` | Access restrictions |

For the 15 unquantified NFRs the thresholds are **decided and accepted** — see
`docs/requirements/NFR_VERIFICATION_THRESHOLDS.md` and
`docs/architecture/ADR-012-NFR-THRESHOLDS.md`. Use those figures; do not re-invent them.
Mark the traceability row `ENGINEERING THRESHOLD` and report results as
**`PASS (ENGINEERING THRESHOLD)`**. Never present an invented number as a sourced requirement.

Known NFR conflicts to cite rather than fix: `N-1` (two different availability rules for
scheduling), `N-2` (renewal 2 s budget is tighter than registration 3 s despite requiring a
payment), `N-4` (`NFR-16` requires plan *modification*, which no story provides).

## 6. Procedures

### Before implementing a feature
1. Identify the `FR`/`US`/`AC` it serves. **No ID → stop.** Either find it in the matrix or
   log it as `ENH-nn`.
2. Check the row isn't ⛔ blocked (§3).
3. Read the verbatim AC in `docs/requirements/LAB1_TRACEABILITY_MATRIX.md` — including any
   `[sic]` defects; six stories carry source typos.
4. Note the bound `NFR-nn` — it constrains the design from the start.
5. Check the dependency column. Four requirements cross departments:
   `FR-REC-04 → FR-ACC-01` · `FR-MEM-03 → FR-ACC-01` · `FR-ADM-05 → all four` ·
   `FR-ACC-05 → FR-MEM-01`.

### After implementing
1. Fill every chain column for that row — UI, API, backend, DB, test, docs.
2. Fill the NFR implementation **and** verification columns.
3. Re-run the coverage report (§7).
4. Flag any diagram the change invalidates for the `software-engineering-diagrams` skill.

### When code has no requirement
Orphaned code is a defect in traceability, not automatically in the code. Either map it to an
existing ID, or record it as `ENH-nn` with a one-line rationale. Never leave it unmapped.

## 7. Coverage reporting

Produce `docs/requirements/COVERAGE.md` with these tables. Report real numbers — never
estimate, never round up.

```markdown
## Academic coverage (the closed 25+25 set)
| Layer | Covered | Total | % |
|---|---|---|---|
| User stories implemented | n | 25 | |
| Acceptance criteria with a passing test | n | 25 | |
| NFRs with an implementation | n | 25 | |
| NFRs with a verification | n | 25 | |
| Departments with all 5 stories done | n | 5 | |

## Blocked
| ID | Blocked by | Since |

## Enhancements (NOT academic coverage)
| ENH-nn | Description | Rationale |
```

Report academic and enhancement coverage **separately, never summed.** A row is only counted
when its test actually passes — see `testing-and-quality`; evidence is required.

## 8. Consistency checks

Run before any PR touching application code:

```bash
# Every requirement ID cited in code/tests exists in the matrix
grep -rhoE "(US|AC|NFR|FR-(REC|TRN|ADM|MEM|ACC)|FR-SUB|ENH)-[0-9]{2}" src tests docs \
  | sort -u > /tmp/used.txt
grep -rhoE "(US|AC|NFR|FR-(REC|TRN|ADM|MEM|ACC)|FR-SUB)-[0-9]{2}" docs/requirements/ \
  | sort -u > /tmp/defined.txt
comm -23 /tmp/used.txt /tmp/defined.txt   # cited but undefined → fix
comm -13 /tmp/used.txt /tmp/defined.txt   # defined but unused → not yet implemented
```

Also verify: exactly 25 of each of `US`/`AC`/`NFR`; each department has exactly 5 stories; no
duplicate IDs; every `⛔` row cites a `B-nn`.

## 9. Related skills

- `software-engineering-diagrams` — consumes these IDs; diagram elements must trace here.
- `testing-and-quality` — owns test IDs and the evidence rule for marking a row 🟢.
- `ironboard-ui-visual-qa` — owns the UI column's visual correctness.
- `academic-submission-audit` — reads this matrix; do not duplicate its PASS/FAIL grading here.

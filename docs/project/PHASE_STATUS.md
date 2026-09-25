# Ironboard — Phase Status

**Updated:** 2026-08-21 · **Commit:** see git log ·
**Current phase:** **Phase 4A (authentication foundation) COMPLETE — self-review PASSED** ·
Phase 4B NOT started

**Verified implementation state** (measured, not asserted — re-verified 2026-08-21):
**29 entities** · 36 CHECK constraints · 2 partial unique indexes · 7 triggers ·
**224/224 tests passing** (141 database + 83 authentication) · typecheck clean ·
**8 HTTP endpoints** · **6 project skills**.
Each phase is marked complete **because its suite passes**, not because code exists.

**Phase 4A added no schema change.** Authentication was built on the `Session`, `Staff`, `Role`,
`Permission` and `RolePermission` tables Phase 3 already shipped (ADR-017).

**Phase 3 self-review:** 12 checks, all answered against a live database rather than against
documentation. 3 defects were found and fixed (ER-diagram drift, no disabled branch in the seed,
partial CHECK-constraint coverage). Evidence:
`docs/testing/evidence/phase3-selfreview-20260816T145257Z.log` — typecheck clean, clean rebuild
from migrations verified.

**Phase 3 defect found in repository re-verification (2026-08-16), FIXED:** the suite was
**not** 136/136. On a cold cache it was **135/136** — `T-U-063` (seed determinism) failed
because `constraints.test.ts` and `membership.test.ts` leaked rows into the shared database, and
`T-U-063` compares the database either side of a truncating re-seed. Order-dependent, so it
passed or failed depending on Vitest's cached file sequencing. Fixed by a per-file isolation
contract plus a suite-level teardown guard; 3 tests added (`T-U-006` ×2 purge-list drift guard,
`T-U-064` isolation machinery), and two assertions previously weakened by the leak were
tightened. **139/139**, verified over 3 cold-cache runs, 2 warm-cache runs, 6 individual files,
11 shuffled file orderings and a negative control. Evidence:
`docs/testing/evidence/phase3-test-isolation-20260816T152251Z.log`.

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
| **3b/4A** | **Foundation — authentication** | ✅ | Phase 3 |
| 4B | Department modules (service + API) | 🔴 | Phase 4A |
| 5 | Frontend | 🔴 | Phase 3 primitives |
| 6 | Cross-cutting | 🔴 | Phase 4 |
| 7 | Verification | 🔴 | Phases 5–6 |
| 8 | Academic deliverables | 🔴 | Phase 7 |
| 9 | Audit & submission | 🔴 | All |

**Database layer and authentication foundation exist** (`server/`). **No department service, no
department API, no UI.** Of the ~56 designed endpoints, **8 exist** and all 8 are authentication.
**0 of the 25 functional requirements are delivered.** Phases 4B–9 have produced nothing yet.

---

## Phase 0 — Analysis & skills ✅

| Deliverable | Status | Artefact |
|---|---|---|
| Reference analysis | ✅ | `docs/project/REFERENCE_ANALYSIS.md` |
| Gap analysis | ✅ | `docs/project/REQUIREMENT_GAP_ANALYSIS.md` |
| Lab 1 traceability matrix | ✅ | `docs/requirements/LAB1_TRACEABILITY_MATRIX.md` |
| Lab 2 NFR traceability | ✅ | `docs/requirements/LAB2_NFR_TRACEABILITY.md` |
| Design system | ✅ | `docs/ui/DESIGN_SYSTEM.md` |
| **Six** project skills | ✅ | `.claude/skills/*/SKILL.md` — `software-engineering-diagrams`, `requirements-traceability`, `ironboard-ui-visual-qa`, `testing-and-quality`, `academic-submission-audit`, `software-engineering-documentation` |
| Project instructions | ✅ | `CLAUDE.md` |

---

## Phase 1 — Master plan ✅

| Deliverable | Status | Artefact |
|---|---|---|
| Master plan (29 sections) | ✅ | `docs/project/MASTER_PLAN.md` |
| Technology decisions | ✅ | `docs/architecture/TECHNOLOGY_DECISIONS.md` |
| Architectural decisions (**17** ADRs — 15 in Phase 1, ADR-016/017 added in Phase 4A) | ✅ | `docs/architecture/ARCHITECTURAL_DECISIONS.md` |
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

⚠️ **Architecture was designed on unconfirmed assumptions — since reconciled.** `B-03`, `B-04`
and `B-05` were not answered when this phase ran. They were answered afterwards, and **two of
the three assumptions turned out to be wrong**: ADR-013's four states became **three** (`B-05`)
and ADR-014's NOT NULL `branchId` on people became a **nullable, non-isolating**
`homeBranchId` (`B-03`). `ENH-05` was withdrawn (`B-04`). Both ADRs are now marked FINAL and
carry the implemented decision; the database was built to the resolved versions, not the
assumed ones. **No residual risk from this item.**

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
| 3 Foundation — DB ✅ | Workspace scaffold, Prisma schema (**29 entities**), migration, 36 CHECKs, 7 triggers, deterministic seed, reset, 141 tests | ✅ **COMPLETE** — evidence `docs/testing/evidence/phase3-db-20260816T140858Z.log`, `phase3-test-isolation-20260816T152251Z.log` |
| **4A Foundation — auth ✅** | Argon2id hashing · `AC-11` activation (single-use, time-limited) · login/logout for all 6 roles · sessions (idle + absolute expiry, revocation) · uniform failure taxonomy · Zod validation · rate limiting · CSRF · redacting logger · deny-by-default guard on the auth surface · **8 endpoints** · 83 tests | ✅ **COMPLETE** — evidence `docs/testing/evidence/phase4a-auth-*.log`. **No schema change** |
| 4A remainder → 4B | RBAC on the other ~48 endpoints, design-system primitives, member activation | 🔴 Not started |
| 4 Modules | D01 → D04 → D02 → D05 → D03 (dependency order, not numeric) | ✅ six stories unblocked (`B-04`) |
| 5 Frontend | Module screens, mobile nav (`ENH-11`) | — |
| 6 Cross-cutting | Outbox, reporting, audit log, scheduler | — |
| 7 Verification | 25 AC suites, 25 NFR verifications, all test levels | ✅ ADR-012 accepted; `ENH-16` seed data is a prerequisite |
| 8 Academic | Nine-field test cases, bug reports, burndown, constraints, DoD | `CON-05` — 4 cases / 2 functionalities |
| 9 Audit | `academic-submission-audit` report | — |

---

## Requirement coverage

**Academic — the closed 25 + 25 set.** Still all zero. **Authentication is 🟦 infrastructure and
counts for none of it** (`AMB-03`: no source defines authentication).

| Layer | Covered | Total |
|---|---|---|
| User stories implemented | 0 | 25 |
| Acceptance criteria with a passing test | 0 | 25 |
| NFRs with an implementation | 0 | 25 |
| NFRs with a verification | 0 | 25 |
| Departments fully delivered | 0 | 5 |
| Mandatory diagrams delivered | 0 | 11 |
| Use case documentation (`DIA-05`, written) | 0 | 1 |
| **Database entities implemented** | **29** | **29** |
| **Tests passing** | **224** | **224** |
| — of which database | 141 | — |
| — of which authentication (🟦, not academic coverage) | 83 | — |
| **HTTP endpoints implemented** | **8** (all auth) | ~56 designed |

⚠️ **`AC-11` is PARTIAL, not covered.** Its activation mechanism is implemented and tested, but the
criterion says "**send** login details" and no notification dispatcher exists. `NFR-11`'s guard is
exercised (`T-A-042`) but the requirement is verified only when `AC-11` has a passing acceptance
test. See `docs/security/AUTHENTICATION.md` §8.

**Enhancements — reported separately, never summed with the above.**

| Covered | Total |
|---|---|
| 0 | 19 (`ENH-01`…`ENH-20`, less withdrawn `ENH-05`) |

---

## Blocking decisions

**Resolved in the B-03/B-04/B-05 decision review** — see `docs/decisions/`.

| ID | Question | Status | Outcome |
|---|---|---|---|
| `B-01` | Do members log in? | ✅ **RESOLVED** (Phase 1) | **Yes.** Six roles including Member; tracked as `ENH-01` and excluded from academic coverage. Implemented in data: `Role` rows include `member`. **Not** an open blocker |
| `B-02` | Authorisation model | ✅ **RESOLVED** (Phase 1, ADR-007) | **Six roles, deny-by-default RBAC**; two checks are resource-level, not role-level (`NFR-10` via `TrainerAssignment`, `NFR-11` admin-only). Implemented in data: 6 roles, 36 permissions, 60 role-permission rows. ✅ **Guard code exists since Phase 4A** on the auth surface (`requirePermission`); the other ~48 endpoints are Phase 4B |
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

## Formerly-provisional ADRs — all now settled

**Nothing in this table awaits confirmation.** All three ADRs carry a final status, and both
superseded ADRs have been rewritten in `ARCHITECTURAL_DECISIONS.md` to state the decision as
implemented, with their original text retained under "Superseded text (retained for the
record)".

| ADR | Decision | Status |
|---|---|---|
| ADR-012 | Verification thresholds for 15 unquantified NFRs | ✅ **ACCEPTED** — `ADR-012-NFR-THRESHOLDS.md`; scaled to a student project, 🟩/🟦 labelled |
| ADR-013 | ~~Four membership states~~ | ❌ **SUPERSEDED** by `B-05` — **three** states; now marked FINAL |
| ADR-014 | ~~Branch as a NOT NULL scoping column~~ | ❌ **SUPERSEDED** by `B-03` — nullable `homeBranchId` on people; now marked FINAL |

---

## Next actions

> The previous version of this section instructed the next session to "confirm `B-03`, `B-04`,
> `B-05`" and to "only then begin Phase 3". **All three are resolved and Phase 3 has shipped.**
> That instruction is withdrawn.

> ✅ **Phase 4A (authentication) is complete**, so item 3 below is struck. Argon2id, sessions and
> the `AC-11` activation path exist and are tested.

1. **Phase 2b — produce the 11 mandatory diagrams + `DIA-05`.** Nothing blocks 10 of the 11;
   `DIA-12` proceeds under the stated `ASM-09`. **Course Policy Lab 9 requires coding to follow
   the designs**, which makes this the largest outstanding academic obligation and the
   academically safer thing to do before Phase 4B.
2. **Phase 2b — produce the outstanding requirements documents**: problem statement,
   feasibility, user-vs-system requirements, development plan, process model.
3. ~~Phase 3b — auth, RBAC, API skeleton~~ → ✅ **DONE in Phase 4A.** Argon2id hashing, sessions,
   activation, 8 endpoints, deny-by-default guard on the auth surface, 83 tests.
4. **Phase 4B — department modules**, in dependency order D01 → D04 → D02 → D05 → D03. Each new
   route **must** declare a permission (ADR-007); a route with no declaration is a bug.
5. **A decision is needed on member activation** — `Member` has no activation columns and no
   acceptance criterion describes a member obtaining a password. Not invented; see
   `docs/security/AUTHENTICATION.md` §1.
6. Escalate **`B-06`** (experiment numbering) — only faculty can answer it; it affects
   submission labelling, not code.

**Nothing in this list is gated on a `B-nn` decision except `B-06`, which gates labelling only.**
Item 5 needs a requirement-owner decision, not a `B-nn`.

### Phase 4A self-review — 12 checks against the running code

| # | Check | Result |
|---|---|---|
| 1 | Phase 3 suite still green | ✅ 141/141 |
| 2 | Full suite green from a destroyed database, cold cache | ✅ 224/224 |
| 3 | Order-independent (3 shuffled orderings) | ✅ 224/224 each |
| 4 | Test isolation contract still holds | ✅ 0 residue; totals match the seed baseline |
| 5 | Typecheck | ✅ clean |
| 6 | No schema change | ✅ `git diff` on `server/prisma/` is empty |
| 7 | Placeholder hashes gone | ✅ `DEV_SEED_NOT_A_REAL_HASH` count = 0; `T-U-062` rewritten |
| 8 | No password/hash in any API response | ✅ `T-A-041` |
| 9 | No password, token, hash or medical data in logs | ✅ `T-A-046` |
| 10 | Login failures indistinguishable (body, code, timing, cookies) | ✅ `T-A-040`, ADR-016 |
| 11 | `NFR-11` deny-by-default proven for all 5 non-admin roles | ✅ `T-A-042` |
| 12 | No requirement marked VERIFIED merely because auth exists | ✅ `AC-11`/`NFR-11` recorded **PARTIAL** |

**Defects found and fixed during Phase 4A** (both caught by the new tests, not by review):

| # | Defect | Fix |
|---|---|---|
| 1 | Throwing inside a Prisma interactive transaction **rolled back** the expired-activation-token cleanup, leaving a dead token probeable | The transaction now returns an outcome and the failure is raised outside it, so the cleanup commits (`T-A-023`) |
| 2 | `emailSchema` validated **before** trimming, so a pasted address with surrounding whitespace 400'd | Normalise then validate via `.pipe()` (`T-A-030`) |

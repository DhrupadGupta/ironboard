---
name: testing-and-quality
description: Design, run and evidence the Ironboard test suite — unit, integration, API, component, system, E2E, acceptance, security, performance, accessibility and reliability — plus verification of all 25 Lab 2 NFRs and the academic test cases in the Experiment 9 nine-field format. Use when writing or reviewing tests, verifying an acceptance criterion or NFR, producing lab test-case deliverables, or before claiming any requirement is done. Never mark PASS without attached evidence.
---

# Ironboard — Testing & Quality

Covers both obligations at once: the **academic** deliverable (Experiment 9 / Course Policy
Lab 10) and the **engineering** verification needed to prove 25 acceptance criteria and
25 NFRs.

## THE RULE: never mark PASS without evidence

A test result is a claim about reality. Every `PASS` must carry:

1. The **exact command** that was run
2. The **actual output** — not a summary, not a paraphrase
3. A **timestamp** and the commit SHA
4. For UI: the **screenshot path**; for performance: the **measured number**

**Forbidden:** "tests pass", "should work", "verified", "looks correct", "PASS ✅" with no
artefact. If a test was not executed, its status is `NOT RUN` — never `PASS`.
If it failed, say so and show the output. Reporting a failure accurately is a success.

## 1. Two distinct obligations — keep them separate

| | Academic | Engineering |
|---|---|---|
| **Required by** | `reference/experiments/EXP-9-TESTING.docx`; Course Policy Lab 10 | Verifying 25 ACs + 25 NFRs |
| **Scope** | "any **two functionalities**" (policy) / "**upto four test cases**" (handout) — `CON-05` | Whole system |
| **Format** | Nine-field table (§2) | Framework-native tests |
| **Output** | `docs/testing/ACADEMIC_TEST_CASES.md` | `tests/` + `docs/testing/TEST_REPORT.md` |

Satisfy `CON-05` by producing **four test cases covering two functionalities** — the superset
meets both readings (`ASM-18`). State this in the deliverable.

Never present engineering tests as the academic deliverable, or vice versa.

## 2. Academic test case format — mandatory nine fields

Verbatim from `reference/experiments/EXP-9-TESTING.docx`, "Fields in test cases".
All nine are required; omitting any fails the deliverable.

```markdown
| Field | Value |
|---|---|
| **Test case id** | TC-01 |
| **Unit to test** | What is to be verified |
| **Assumptions** | Preconditions; cite ASM-nn where relevant |
| **Test data** | Variables and their values |
| **Steps to be executed** | 1. … 2. … |
| **Expected result** | From the AC "Then" clause |
| **Actual result** | **What actually happened when run** |
| **Pass/Fail** | PASS / FAIL — evidence required |
| **Comments** | Defects, blockers, ASM/AMB references |
```

The handout's procedure also requires: identify modules testable stand-alone → identify module
groups testable together → perform unit testing. Document all three steps.

**Verification vs Validation** — the handout's table must be demonstrated, not just cited:
verification is static (reviews, walkthroughs, inspections; "are you building it right?"; done
by developers); validation is dynamic (executing against requirements; "are you building the
right thing?"; done by testers).

## 3. Test levels and IDs

| Level | ID | Scope | Ironboard example |
|---|---|---|---|
| Unit | `T-U-nnn` | One function/class | Membership expiry calculation |
| Integration | `T-I-nnn` | Modules together | Payment → receipt (`FR-ACC-01`→`FR-REC-04`) |
| API | `T-API-nnn` | HTTP contract | `POST /api/members` → 201 + Member ID |
| Component | `T-C-nnn` | One UI component | Department card renders 5 story bullets |
| System | `T-S-nnn` | Whole app, one department | All 5 Reception flows |
| E2E | `T-E2E-nnn` | Cross-department journey | `WF-01` walk-in → renewal |
| Acceptance | `T-A-nnn` | One `AC-nn`, Given/When/Then | `AC-01` registration |
| Security | `T-SEC-nnn` | `NFR-10`, `NFR-11`, `NFR-21` | Non-admin denied staff approval |
| Performance | `T-P-nnn` | The 5 timing NFRs | Registration p95 ≤ 3000 ms |
| Accessibility | `T-ACC-nnn` | Contrast, focus, reduced motion | AAA contrast on every pairing |
| Reliability | `T-R-nnn` | `NFR-07`, `NFR-13`, `NFR-19`, `NFR-22` | Progress survives crash/restart |

Every test names the requirement it verifies. A test with no `AC-nn`/`NFR-nn`/`ENH-nn` is
either mis-scoped or an enhancement — classify it.

## 4. Acceptance tests — mapping AC to assertions

Each `AC-nn` is already Given/When/Then; translate directly.

```
Given <precondition>  → fixture / seeded state
When  <action>        → the call under test
Then  <outcome>       → one assertion per clause
```

**Split multi-clause outcomes.** `AC-01` has three "Then" clauses — create the profile,
generate a Member ID, send a welcome email → **three assertions**.

Clause counts worth noting: `AC-05` (total visits + lapsed list), `AC-13` (reminders +
"In Maintenance" state), `AC-14` (total visits + peak hours), `AC-17` (status + stop access),
`AC-18` (extend expiry + restore access), `AC-21` (clear balance + issue receipt),
`AC-23` (income + refunds + pending), `AC-24` (send funds + log), `AC-25` (list + offer notices).

### ⚠️ No negative paths exist in the source (`INC-01`)
Lab 1 supplies one criterion per story ("Accepatnce 1:"), while the Experiment 1 handout models
two (happy path + rejection). **All 25 rejection paths are absent.**

Write negative tests — they are good engineering — but label them `T-A-nnn-NEG` and mark them
`ENHANCEMENT — not in source`. Never count them as academic acceptance coverage.

### ⚠️ Five acceptance criteria are untestable as written
These read data no user story creates (`B-04`, `AMB-15`). Mark dependent tests `BLOCKED`,
not `FAIL`:

| Precondition | AC | Blocks |
|---|---|---|
| "check-in data is recorded at the entrance" | `AC-14` | `AC-05` **and** `AC-14` |
| "a member has a health condition logged" | `AC-10` | `AC-10` |
| "a machine needs regular service" | `AC-13` | `AC-13` |
| "an approved refund request" | `AC-24` | `AC-24` |
| "a new staff member registers for access" | `AC-11` | `AC-11` |

## 5. NFR verification

Each of the 25 NFRs needs a **verification**, not just an implementation. Source and
per-NFR detail: `docs/requirements/LAB2_NFR_TRACEABILITY.md`.

### The 10 verifiable NFRs — assert these exact numbers

| NFR | Requirement | Threshold | Test |
|---|---|---|---|
| `NFR-01` | Member registration | ≤ **3 s** | `T-P-001` |
| `NFR-06` | Workout plan **load** | ≤ **2 s** | `T-P-002` |
| `NFR-14` | Attendance reports | ≤ **5 s** | `T-P-003` |
| `NFR-18` | Membership renewal | ≤ **2 s** | `T-P-004` |
| `NFR-23` | Revenue reports | ≤ **5 s** | `T-P-005` |
| `NFR-03` | Scheduling availability | **99.9 %** | `T-R-001` |
| `NFR-15` | Dashboard availability | **99.9 %** | `T-R-002` |
| `NFR-10` | Medical data — authorized trainers only | binary | `T-SEC-001` |
| `NFR-11` | Staff approval — administrators only | binary | `T-SEC-002` |
| `NFR-21` | Payment data encrypted + authorized staff only | binary | `T-SEC-003` |

Measure **p95, not mean**, and state the dataset size — a 3 s budget is meaningless without
knowing the row count (`INC-07`: no volume figures exist in any source).

### The 15 unquantified NFRs

`NFR-02, 04, 05, 07, 08, 09, 12, 13, 16, 17, 19, 20, 22, 24, 25` state no measurable target.
The Experiment 2 handout names this failure itself: *"If you cannot quantify the story in
concrete terms, this should be a bad smell."*

Procedure: propose a threshold, record it as `ASM-nn` in
`docs/project/REQUIREMENT_GAP_ANALYSIS.md`, then test against it and mark the result
**`PASS (ENGINEERING THRESHOLD)`** — never plain `PASS`. Do not present an invented number
as a sourced requirement.

Two are untestable in principle and must be reported as such, not quietly passed:
`NFR-13` "should **never** be lost" and `NFR-22` "accurately **every time**" are absolutes.
Test the realistic proxy (backup/restore succeeds; invoice generation is idempotent) and say
plainly that the absolute claim is unfalsifiable.

Known internal conflicts to cite, not fix: `N-1` (`NFR-03` 99.9 % vs `NFR-08` "always during
working hours" — and "working hours" is undefined, `AMB-04`), `N-2` (`NFR-18`'s 2 s budget is
tighter than `NFR-01`'s 3 s despite requiring a completed payment).

## 6. Security testing

Blocked on `B-02` (no authorisation model exists in any source — `AMB-03`). Until decided,
mark security tests `BLOCKED`.

When unblocked, verify per role — `Receptionist`, `Trainer`, `Administrator`,
`Membership Manager`, `Accounting Executive`:
- Medical data (`NFR-10`): every non-trainer role denied
- Staff approval (`NFR-11`): all four non-admin roles denied
- Payment data (`NFR-21`): encrypted at rest; unauthorised roles denied

> The Experiment 2 handout's constraints table (10-second inactivity logout, credit-card
> masking, `payment_preferences` audit log) is a **generic teaching example about a different
> system**. Do not test it as an Ironboard requirement. Implementing it is an `ENH`.

## 7. Accessibility testing

No accessibility NFR exists in Lab 2 — this is entirely `ENHANCEMENT` coverage. Classify it
honestly; do not count it toward academic NFR coverage.

Verify against the design source (`docs/ui/DESIGN_SYSTEM.md`): contrast ≥ 7:1 on every text
pairing · `:focus-visible` volt ring present and visible · `prefers-reduced-motion` fully
neutralises the reveal animation · decorative glyphs `aria-hidden` · skip link present ·
keyboard reachability at every breakpoint (including the added mobile nav, `INC-11`).

## 8. Running tests and capturing evidence

```bash
# Record command, output, timestamp and SHA together
{ echo "=== $(date -u +%FT%TZ) @ $(git rev-parse --short HEAD) ==="; \
  <test command> 2>&1; } | tee -a docs/testing/evidence/run-$(date -u +%Y%m%dT%H%M%SZ).log
```

**UI/E2E:** Chromium is pre-installed at `/opt/pw-browsers/chromium`;
`PLAYWRIGHT_BROWSERS_PATH` is set. **Do not run `playwright install`.** Screenshot every
assertion and **read the image back** — a screenshot nobody looked at is not evidence.

**Performance:** report p95 with the sample size and dataset size. Single-run timings are not
evidence.

Store artefacts under `docs/testing/evidence/`.

## 9. Reporting

`docs/testing/TEST_REPORT.md`:

```markdown
## Run: <ISO timestamp> @ <sha>
| Test | Verifies | Level | Status | Evidence |
|---|---|---|---|---|
| T-A-001 | AC-01 | Acceptance | PASS | evidence/run-….log:42 |
| T-P-001 | NFR-01 | Performance | FAIL — p95 3420 ms > 3000 ms | evidence/perf-….json |
| T-SEC-001 | NFR-10 | Security | BLOCKED (B-02) | — |
| T-A-014 | AC-14 | Acceptance | BLOCKED (B-04) | — |
| T-A-001-NEG | AC-01 rejection | Acceptance | PASS *(ENHANCEMENT)* | evidence/…:88 |

## Coverage — academic (closed 25+25 set)
| Metric | Covered | Total |
|---|---|---|
| ACs with a passing test | n | 25 |
| NFRs verified | n | 25 |

## Coverage — enhancement (reported separately, never summed)
```

**Status values:** `PASS` · `FAIL` · `BLOCKED` · `NOT RUN` · `PASS (ENGINEERING THRESHOLD)`.
Never invent others. Never report academic and enhancement coverage as one number.

## 10. Definition of Done and the constraints list

`reference/experiments/EXP-2-SE.docx` Step 2 requires NFR story tests to be added to a
**published constraints list** and to the **Definition of Done**. Lab 2 produced neither
(`INC-02`), and no other skill owns them — produce them here, since both are built from story
tests.

- `docs/testing/CONSTRAINTS.md` — system-wide rules every implemented story must satisfy,
  each derived from a quantified NFR and each stated as an executable story test.
- `docs/testing/DEFINITION_OF_DONE.md` — the checklist a story must clear to be called done.

⚠️ Build these from **Ironboard's own** NFRs. The handout's populated Constraints and DoD
tables (search response times, 10-second inactivity logout, `payment_preferences` log,
credit-card masking, peer review within 4 hours) are **generic teaching examples about a
different system** — never copy them in as Ironboard requirements.

## 11. Status vocabulary and how it maps to the audit

This skill grades **test results**; `academic-submission-audit` grades **deliverables**. The
two scales are different on purpose. Map between them as follows:

| Test result here | Audit grade there |
|---|---|
| `PASS` | contributes to `PASS` |
| `PASS (ENGINEERING THRESHOLD)` | contributes to `PARTIAL` — the target was not sourced |
| `FAIL` | `FAIL` |
| `BLOCKED (B-nn)` | `BLOCKED` |
| `NOT RUN` | `MISSING` — never `PASS` |

A deliverable is only `PASS` when **every** test under it is `PASS` with evidence.

## 12. Bug reporting (Course Policy Lab 8, Task 8 — *Proposed*)

"Create **3–5 sample bug reports** (severity, steps to reproduce, expected vs actual); assign
bugs and simulate the fixing lifecycle (**Open → In Progress → Resolved → Closed**)."
Tool named: Bugzilla or Mantis.

Record real defects found by this suite in `docs/testing/BUG_REPORTS.md` with severity, steps,
expected vs actual, assignee and lifecycle state. If no external tracker is available, state
that plainly rather than claiming a Bugzilla/Mantis instance was used.

## 13. Related skills

- `requirements-traceability` — owns the Test column; a row goes 🟢 only when its test passes
  **with evidence**.
- `ironboard-ui-visual-qa` — owns visual judgement; this skill owns test evidence.
- `academic-submission-audit` — grades the deliverable; do not self-grade here.

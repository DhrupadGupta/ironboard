---
name: academic-submission-audit
description: Audit the Ironboard project against every deliverable in reference/course-policy and reference/experiments, grading each PASS/FAIL/PARTIAL/MISSING with evidence. Use before a lab submission or milestone, when asked what is left or whether the project is complete, or for a status report. Read-only over other artefacts — it grades, it does not fix. Never hides or softens missing work.
---

# Ironboard — Academic Submission Audit

Produces an honest, evidence-backed status report against the actual course requirements in
`reference/course-policy/Software-engg-Course Policy_version1-26=27.pdf`,
`reference/experiments/*.docx` and `reference/syllabus/…Syllabus Compiled.pdf`.

## THE RULE: do not hide missing work

This skill exists to tell the truth about completion. It is worthless if it flatters.

- **Never** upgrade a grade to look better. Partial work is `PARTIAL`, not `PASS`.
- **Never** count planned, stubbed or scaffolded work as done.
- **Never** merge academic coverage with engineering enhancements into one number.
- **Never** mark `PASS` without a checkable artefact path.
- If a deliverable is `MISSING`, say `MISSING` — plainly, in the summary, not only in a table.
- Report the honest total even when it is low. A truthful 6/27 is useful; an inflated 20/27
  is actively harmful before a submission deadline.

This skill is **read-only** over other artefacts. It grades and reports; it does not create
diagrams, write tests, or fix gaps. Hand fixes to the owning skill.

## 1. Grading scale

| Grade | Meaning | Requires |
|---|---|---|
| `PASS` | Fully delivered and verified | Artefact path + verification evidence |
| `PARTIAL` | Exists but incomplete or unverified | Path + explicit list of what's missing |
| `FAIL` | Exists but wrong — incorrect notation, failing tests, contradicts the source | Path + defect description |
| `MISSING` | Not started; no artefact | — |
| `BLOCKED` | Cannot proceed until a decision is made | The `B-nn` blocking ID |

`BLOCKED` never substitutes for `MISSING`: use it only when a genuine decision gate
(`B-01`…`B-06` in `docs/project/REQUIREMENT_GAP_ANALYSIS.md`) prevents the work.

## 2. Scope — what is actually required

⚠️ **`CON-01`: the course policy and the handouts number experiments incompatibly** — they
align only at Experiment 1. Audit against **both schemes** and report each separately. Never
silently pick one.

### A. Course Policy lab table (pp.11–13) — "the following 10 programming exercises"

| Lab | Week | Deliverable | Owning skill |
|---|---|---|---|
| 1 | 1–2 | Literature survey; ≥5 case studies → 1; scope; **9 sub-items**: end user · FRs · NFRs · feasibility · finalise problem · problem statement · user+system requirements · **ambiguities/inconsistencies/incompleteness** · development plan | `requirements-traceability` |
| 2 | 3–4 | Select Generic / Evolutionary / Agile process model | — |
| 3 | 5 | DFD level-0, level-1 **and level-2** | `software-engineering-diagrams` |
| 4 | 6 | Use case diagram + **use case documentation** + activity diagram | `software-engineering-diagrams` |
| 5 | 7 | State chart diagram from control specifications (**Star UML named**) | `software-engineering-diagrams` |
| 6 | 8 | Sequence + class + state transition diagram | `software-engineering-diagrams` |
| 7 | 9–10 | UI design diagram using the **three golden rules** | `ironboard-ui-visual-qa` |
| 8 | 11–12 | *Proposed* — Task 8 bug reporting (Bugzilla/Mantis, 3–5 reports, Open→In Progress→Resolved→Closed); Task 9 sprint burndown (Jira, story points, deviation analysis) | `testing-and-quality` |
| 9 | 13 | **Coding** per the designs from "EXP.4,5" | — |
| 10 | 14 | Test cases for **any two functionalities** | `testing-and-quality` |

### B. Supplied handout outputs

| Handout | Stated Output |
|---|---|
| `SE_LAB_1_new.docx` | Part B: document the user stories |
| `EXP-2-SE.docx` | Part B: NFR document |
| `EXP-3-USE CASE.docx` | "A Use case diagram for the System" |
| `EXP-4-ACTIVITY.docx` | "A Activity diagram for the System" |
| `EXP-5-CLASS.docx` | "Class diagram for the system" |
| `LAB-6-Sequence diagram.docx` | "A Sequence diagram of the system" |
| `EXP-7-COLLAB.docx` | "A Collaboration diagram for the system" |
| `PRACTICAL 8-DFD.docx` | Part B: "DEVELOP DFD LEVEL 0 AND LEVEL 1" |
| `EXP-9-TESTING.docx` | "Development of **upto four test cases** and their applied results" |

### C. Conflicts to report, never resolve

| ID | Conflict |
|---|---|
| `CON-01` | Experiment numbering — policy vs handouts, aligned only at Exp 1 |
| `CON-02` | DFD depth — policy needs L2; handout says L0/L1 only |
| `CON-03` | Collaboration diagram has a handout and a syllabus entry but **no policy lab slot** |
| `CON-05` | Test quantity — "two functionalities" vs "upto four test cases" |
| `CON-09` | Policy says 10 exercises; syllabus says "8 to 10" |
| `AMB-08` | State chart (Lab 5) vs state transition (Lab 6) — same artefact or two? |

Also note in every report: **the Star UML instruction** (Lab 5) cannot be satisfied here — a
text-based tool was used instead. Never claim Star UML was used.

## 3. Audit procedure

1. **Re-read the source** — `reference/course-policy/` and the relevant `reference/experiments/`
   handout. Do not audit from memory or from a previous report.
2. **Locate the artefact** for each deliverable. Record its real path.
3. **Verify it, don't assume it:**
   - Diagrams → the `.png` renders **and** the `.puml` exists; **read the PNG**
   - Tests → evidence log with command, output, timestamp, SHA
   - Code → the referenced file actually contains the behaviour
   - Docs → the section exists and is filled in, not a heading with a TODO
4. **Grade** with the §1 scale.
5. **Cite evidence** — a path, and for `PASS` a verification artefact.
6. **List what's missing explicitly** for `PARTIAL`.
7. **Write the report** (§5). Never edit another skill's artefacts to make a grade improve.

## 4. Audit checklist

Grade each line. `—` is not a valid grade.

**Requirements** — user stories (25) · acceptance criteria (25) · NFRs (25) · problem statement ·
scope · feasibility · end-user identification · user vs system requirements ·
ambiguity/inconsistency/incompleteness analysis · development plan · process model selection ·
Definition of Done · constraints list · requirement versioning

**Diagrams** — DFD L0 · DFD L1 · DFD L2 · use case · use case documentation · activity ·
state chart · sequence · class · state transition · collaboration · UI design · burndown

**Implementation** — all 25 FRs · 5 departments · cross-department workflows (`WF-01`) ·
5 missing write paths (`B-04`)

**UI** — matches the design source · responsive at 900/860/760/640 · mobile nav added
(`INC-11`) · accessibility · visual QA report with screenshots

**Testing** — academic test cases in the nine-field format · unit · integration · API ·
component · system · E2E · acceptance (25 ACs) · security · performance · accessibility ·
reliability · NFR verification (25) · bug reports

**Documentation** — reference analysis · gap analysis · traceability matrices · design system ·
use case documentation · test report · README

## 5. Report format — `docs/audit/SUBMISSION_AUDIT.md`

```markdown
# Ironboard — Academic Submission Audit
**Date:** <ISO>  **Commit:** <sha>  **Auditor:** <session>

## Headline
**Academic deliverables complete: n / 27.**
Missing: <count>. Partial: <count>. Blocked: <count>.
<One honest paragraph. State the largest gap first.>

## Course Policy lab table
| Lab | Deliverable | Grade | Artefact | Evidence | Missing |
|---|---|---|---|---|---|
| 1 | Requirements + 9 sub-items | PARTIAL | docs/project/… | — | feasibility, dev plan, problem statement |
| 3 | DFD L0/L1/L2 | MISSING | — | — | all three |

## Handout outputs
| Handout | Output | Grade | Artefact |
|---|---|---|---|

## Detailed checklist
<every line from §4 with a grade>

## Conflicts affecting this audit
| ID | Conflict | Effect on grading |
|---|---|---|

## Blocked by pending decisions
| B-nn | Decision | Deliverables blocked |
|---|---|---|

## Engineering enhancements — NOT academic coverage
| ENH-nn | Description | Status |
|---|---|---|

## What to do next, in order
1. …
```

## 6. Counting rules

- **Academic coverage counts only the closed source set:** 25 user stories, 25 acceptance
  criteria, 25 NFRs, and the deliverables in §2A/§2B. Nothing else.
- **Enhancements are reported in their own table and never added to the academic total.**
  Negative-path tests (`INC-01`), accessibility work (no NFR requires it), the ER model,
  and the mobile navigation are all enhancements.
- A deliverable with sub-items (Lab 1 has nine) is `PASS` only when **all** sub-items pass.
- A diagram is `PASS` only with source **and** render **and** a recorded visual inspection.
- A test is `PASS` only with evidence — see `testing-and-quality`.
- If two sources disagree on what's required, grade against **both** and show both.

## 7. Known baseline (as of the reference analysis)

Delivered: the two lab submissions in `reference/` plus the analysis documents in `docs/`.
Lab 1 item 8 (ambiguities/inconsistencies/incompleteness) is satisfied by
`docs/project/REQUIREMENT_GAP_ANALYSIS.md`.

Everything else in §2A was `MISSING` at that point. **Re-verify rather than trusting this
paragraph** — it dates from before implementation began.

Known source-side gaps that no amount of implementation fixes, and which must appear in every
report: `INC-01` no rejection paths · `INC-02` no DoD or constraints list · `INC-03` NFRs not
written as user stories · `INC-04` no data model · `INC-10` nine Lab 1 sub-deliverables absent.

## 8. Related skills

- `requirements-traceability` — supplies coverage numbers; this skill grades them.
- `software-engineering-diagrams` — supplies diagrams; this skill verifies they render.
- `ironboard-ui-visual-qa` — supplies the visual QA report; this skill checks it exists.
- `testing-and-quality` — supplies test evidence; this skill checks evidence is attached.

Findings go to the owning skill for repair. **This skill never fixes what it grades.**

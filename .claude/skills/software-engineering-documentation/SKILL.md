---
name: software-engineering-documentation
description: Write and maintain every Software Engineering document for Ironboard — problem statement, requirements, user stories, acceptance criteria, ambiguity analysis, assumptions, development plan, process model, architecture, database, API, use case, UI and design system, testing strategy/plan/cases/results, quality and SQA, security, deployment, ADRs, traceability, and per-experiment submissions. Use when creating, updating, reviewing or completing any document under docs/, when preparing an experiment write-up, or when implementation changes make a document stale. Enforces source-versus-engineering labelling, forbids fabricated evidence, and requires EVIDENCE NOT AVAILABLE where evidence does not exist.
---

# Ironboard — Software Engineering Documentation

Governs **how** every document in `docs/` is written, labelled, evidenced and kept consistent
with the implementation.

## Scope boundary — read this before anything else

This skill owns **form, labelling, evidence rules and cross-document consistency**.
It does **not** take ownership away from the skills that own specific artefacts.

| Document | Content owner | This skill's role |
|---|---|---|
| Problem statement · feasibility · user-vs-system requirements · development plan · process model | `requirements-traceability` | Structure, labelling, evidence |
| Traceability matrices · coverage | `requirements-traceability` | Consistency check |
| Diagrams + `NOTES.md` · **use case documentation (`DIA-05`)** | `software-engineering-diagrams` | Prose quality, traceability of cited IDs |
| Design system · UI design (`DIA-12`) | `ironboard-ui-visual-qa` | Structure, evidence (screenshots) |
| Test plan · test cases · test results · constraints · Definition of Done | `testing-and-quality` | Evidence rules, nine-field format compliance |
| PASS/FAIL/PARTIAL/MISSING grading | `academic-submission-audit` | **Never duplicated here** |
| Architecture · database · API · security · ADRs | *this skill* | Full ownership |
| Experiment write-ups | *this skill* | Full ownership |

**If a rule here conflicts with an owning skill, the owning skill wins on content; this skill
still governs labelling and evidence.**

---

## 1. Hard rules

1. **`reference/` is READ-ONLY.** Never modify, rename or delete anything inside it.
2. **Never silently rewrite an academic requirement.** Source wording is reproduced **verbatim**,
   including defects, with `[sic]`. An interpretation is recorded *alongside* the original,
   never *in place of* it.
3. **Never fabricate.** Not test results, performance numbers, user research, literature-survey
   results, requirements, diagrams, screenshots or implementation evidence.
4. **Never invent a requirement.** The set is closed: 25 FRs, 25 stories, 25 acceptance
   criteria, 25 NFRs. Anything else is an **ENGINEERING ENHANCEMENT** (`ENH-nn`).
5. **Never merge academic coverage with enhancement coverage** into one number.
6. **Every claim carries a source** — a `reference/` path, a requirement ID, a file path, or an
   evidence artefact.

---

## 2. The six classification labels

Every substantive statement is one of these. Ambiguity between them is a defect.

| Label | Meaning | Test |
|---|---|---|
| **SOURCE REQUIREMENT** | Stated in `reference/`. Quote it verbatim with the file and page | Can you point at the sentence? |
| **ENGINEERING DECISION** | Chosen by this project; no source mandates it | Would a different team reasonably choose otherwise? |
| **ASSUMPTION** | A fact the work needs that no source provides. Carries an `ASM-nn` | Could it turn out to be wrong? |
| **ENGINEERING ENHANCEMENT** | Capability beyond the closed set. Carries an `ENH-nn`. **Never academic coverage** | Does any story or criterion require it? If no → enhancement |
| **IMPLEMENTATION DETAIL** | How the code does it — file paths, function names, schema columns | Would it change without any requirement changing? |
| **TEST EVIDENCE** | An observed result: command, output, timestamp, commit SHA, artefact path | Did someone actually run it? |

### Existing shorthand — already in use, still valid

| Shorthand | Canonical label | Where |
|---|---|---|
| `[REQ]` | SOURCE REQUIREMENT | `SYSTEM_ARCHITECTURE.md`, `API_ARCHITECTURE.md` |
| `[ENG]` | ENGINEERING DECISION | same |
| 🟩 | SOURCE REQUIREMENT | `NFR_VERIFICATION_THRESHOLDS.md` |
| 🟦 | ENGINEERING DECISION (verification threshold) | same |
| `ASM-nn` | ASSUMPTION | gap analysis |
| `ENH-nn` | ENGINEERING ENHANCEMENT | throughout |

**Do not churn existing documents to change notation.** Use the canonical words in new prose;
the shorthands remain valid where already established.

---

## 3. The evidence rule

> **If evidence does not exist, write `EVIDENCE NOT AVAILABLE`.**

Never substitute a plausible-looking number, screenshot description or result. Acceptable
forms:

```
Status: EVIDENCE NOT AVAILABLE — not yet implemented
Status: EVIDENCE NOT AVAILABLE — blocked by B-06
Status: EVIDENCE NOT AVAILABLE — source document does not contain this information (AMB-10)
```

**TEST EVIDENCE requires all four:** the exact command · the actual output (not a summary) ·
a timestamp · the commit SHA. Plus a screenshot path for UI and a measured number for
performance. See `testing-and-quality`.

### Known permanent gaps — state these, never fill them

| Gap | What must be written |
|---|---|
| `AMB-10` literature survey | The five shortlisted case studies **are not in the source**. Do **not** invent them |
| `ASM-09` three golden rules | Not enumerated in any supplied document; attributed to the prescribed textbook as an assumption |
| `INC-04` data model | No source defines one; every attribute is an ASSUMPTION |
| `INC-05` field rules | No source defines any; every validation rule is an ASSUMPTION |
| `INC-01` rejection paths | Lab 1 has one criterion per story; negative paths are `ENH-09` |
| `NFR-13`, `NFR-22` | Unfalsifiable absolutes; report the proxy and say so |
| `NFR-19` | Report **dispatched**, never **delivered** |
| `NFR-03`, `NFR-15` | 99.9 % is a SOURCE REQUIREMENT but is **not demonstrable at project scale**; report `PASS (PROXY)` |

---

## 4. Per-document procedures

Common to all: front-matter (title, date, status, authority, owning skill), a scope/caveat
section where the source is thin, requirement IDs throughout, and a completion checklist (§8).

### 4.1 Problem Statement — *owner: `requirements-traceability`*
Source: Course Policy Lab 1, item 6 "Frame the final problem statement."
Must state: domain, the five departments, the five actors, scope boundary, and explicitly that
**`AMB-10` means no source records the case-study selection** (`ASM-08`).
❌ Do not invent business context, market data or stakeholder interviews.

### 4.2 Functional Requirements
The 25 `FR-*` labels **verbatim** from `reference/lab2/` Part B. Bind each to `US-nn`, `AC-nn`,
`NFR-nn`, department, endpoint. Cite `CON-04` on `FR-ACC-03` (four conflicting verbs).
❌ Never add a 26th.

### 4.3 Non-Functional Requirements
The 25 NFRs verbatim. Show category, bound FR, and **🟩 source threshold vs 🟦 engineering
threshold** (`NFR_VERIFICATION_THRESHOLDS.md`). Record the internal conflicts `N-1`, `N-2`,
`N-4` rather than reconciling them.

### 4.4 User Stories
All 25 verbatim from `reference/lab1/` p.5, **including the six source typos, marked `[sic]`**
(`US-02`, `US-03`, `US-04`, `US-19`, `US-23`, `US-25`). Note that `US-23` omits its verb.
❌ Never silently correct the grammar of an academic requirement.

### 4.5 Acceptance Criteria
All 25 in Given/When/Then verbatim. Flag multi-clause Then-clauses (they need multiple
assertions). State `INC-01`: the heading reads "Accepatnce 1:" and **no rejection paths exist**.

### 4.6 Ambiguity / Inconsistency Analysis
Satisfies Course Policy Lab 1 item 8. Maintain the `CON-nn` / `AMB-nn` / `INC-nn` registers.
Record both positions of a conflict; **never reconcile silently**.

### 4.7 Assumptions
Every `ASM-nn`: what is assumed, what it resolves, risk if wrong, reversal cost. Cross-link to
the decision that adopted it.

### 4.8 Development Plan — *owner: `requirements-traceability`*
Course Policy Lab 1 item 9. Phases, dependencies, gates. Base it on real status from
`PHASE_STATUS.md`. ❌ No invented effort estimates or velocity figures.

### 4.9 Process Model — *owner: `requirements-traceability`*
Course Policy Lab 2: "Select appropriate Generic Process Model / Evolutionary process Model /
Agile Model". State the choice, justify against the syllabus Unit 2–3 model set, and record
alternatives rejected.

### 4.10 Architecture Documentation
Layers, modules, components, cross-cutting concerns. **Every element tagged [REQ] or [ENG].**
Keep consistent with `DIA-15`. State plainly that no source specifies any framework, layering
or middleware.

### 4.11 Database Documentation
Entities, fields, types, keys, indexes, constraints, transactions, migrations.
**Lead with the `INC-04` caveat.** Separate "fields closest to being sourced" from invented
ones. Keep consistent with `DIA-16` and, once it exists, `DIA-09`.

### 4.12 API Documentation
Per endpoint: method, path, permission, request/response schema, status codes, bound
`FR`/`AC`/`NFR`, and **academic vs enhancement**. Keep the endpoint count accurate and split
by category.

### 4.13 Use Case Documentation — *owner: `software-engineering-diagrams`*
`DIA-05`, Course Policy Lab 4 + `EXP-3`. Template per use case: ID, traces-to, primary and
secondary actors, preconditions (AC "Given"), main flow (AC "When"/"Then"), postconditions,
**exceptions — which must say `NOT IN SOURCE (INC-01)`**, source reference.

### 4.14 UI Design Documentation — *owner: `ironboard-ui-visual-qa`*
`DIA-12`, Course Policy Lab 7. Map each screen to the three golden rules, **citing `ASM-09`**
because no supplied document enumerates them. Screenshots are TEST EVIDENCE — real files or
`EVIDENCE NOT AVAILABLE`.

### 4.15 Design System Documentation — *owner: `ironboard-ui-visual-qa`*
Token-level, quoted from `reference/design/gym-management-homepage-2.html` with line numbers.
The HTML wins any disagreement.

### 4.16 Testing Strategy / Test Plan — *owner: `testing-and-quality`*
Levels, tooling, entry/exit criteria, environment. Distinguish the **academic** deliverable
(Experiment 9 nine-field cases, `CON-05`) from **engineering** test suites.

### 4.17 Test Cases — *owner: `testing-and-quality`*
Academic cases use the **nine fields verbatim** from `EXP-9-TESTING.docx`: Test case id · Unit
to test · Assumptions · Test data · Steps to be executed · Expected result · **Actual result** ·
Pass/Fail · Comments. Omitting any field fails the deliverable.

### 4.18 Test Results — *owner: `testing-and-quality`*
Only real runs. Status vocabulary: `PASS` · `FAIL` · `BLOCKED` · `NOT RUN` ·
`PASS (ENGINEERING THRESHOLD)` · `PASS (PROXY)`. Academic and enhancement coverage reported
**separately**.

### 4.19 Software Quality Documentation
Syllabus Unit 7 names McCall's factors, ISO 9126, process/project metrics, metrics for software
quality. **These are taught, not assigned** — mark them accordingly if written.
❌ Do not report a quality metric that was not measured.

### 4.20 SQA Documentation
Syllabus Unit 7 "SQA Activities" and CMMI; Course Policy Lab 8 Task 8 (*Proposed*) bug
reporting with lifecycle `Open → In Progress → Resolved → Closed`. Bug reports must be **real
defects found by the suite** — never illustrative examples presented as findings.

### 4.21 Security Documentation
⚠️ **Lab 2 contains exactly three security NFRs** (`NFR-10`, `NFR-11`, `NFR-21`). Everything
else — hashing, sessions, CSRF, headers, rate limiting — is **ENGINEERING DECISION**, not
academic coverage. The `EXP-2` sample constraints (credit-card masking, `payment_preferences`
log, 10-second logout) describe **a different system** and must never be cited as Ironboard
requirements.

### 4.22 Deployment Documentation
Build, runtime, database file, migrations, health checks, backup. All **ENGINEERING DECISION** —
no source specifies deployment. ❌ No uptime or capacity claims without measurement.

### 4.23 Architecture Decision Records
One decision per ADR: context, decision, alternatives considered, consequences (positive **and**
negative), and the requirement or `ASM`/`B` ID that drives it. Superseded ADRs are marked
**SUPERSEDED with a pointer**, never deleted or edited into agreement.

### 4.24 Requirement Traceability Documentation — *owner: `requirements-traceability`*
The full chain per requirement. A link that does not exist is `—`, never a guess.

---

## 5. Experiment documentation

The handouts share a consistent skeleton. **Preserve it.**

```
Experiment No. N
Topic:            (where the handout has one)
Aim:              verbatim from the handout
Prerequisite:     (where present)
Learning Outcome / Outcome:
Part A — Theory   ← handout content; do NOT rewrite or "improve" it
Procedure:        verbatim steps
Output:           what the handout says the output is
Part B —          THE STUDENT'S WORK — this is what we produce
```

`PRACTICAL 8-DFD.docx` also carries a `Name / Roll No / Batch / Date` block. Where a handout has
one, reproduce it. The identity block used by the existing submissions is:

```
Name: Dhrupad Gupta · Roll no: I025 · Class: MBA Tech IT · Batch: A1
Date of performance: <date> · Date of submission: <date>
```

### Procedure

1. **Read the original handout** in `reference/experiments/` — never work from memory.
2. **Preserve its structure**; identify each required section.
3. **Complete only what the source requires.** Do not add sections the handout does not ask for.
4. **Use real Ironboard evidence** — actual schema, endpoints, diagrams, test output.
5. **Link diagram IDs and test IDs**; do not paste images without their source `.puml`.
6. **State assumptions explicitly** with `ASM-nn`.
7. ❌ **Do not add invented academic requirements.**

### ⚠️ Numbering — `CON-01`

The Course Policy lab table and the handout filenames align **only at Experiment 1**. Title
every write-up by **artefact** (`use-case`, `dfd-l1`, `class`) and record **both** numbering
claims. `B-06` is open and only faculty can resolve it.

### ⚠️ Star UML — Course Policy Lab 5

Star UML is named but unavailable in this environment. Record that a text-based equivalent
(PlantUML) was used. **Never claim Star UML was used.**

---

## 6. Academic writing standard

**Use:** precise statements · tables over paragraphs · requirement IDs (`US-nn`, `AC-nn`,
`NFR-nn`, `FR-*`), diagram IDs (`DIA-nn`), test IDs (`T-*`), ADR IDs · explicit evidence
references · short sentences.

**Avoid:** verbosity and filler · unsupported claims ("robust", "scalable", "enterprise-grade")
· exaggerated production claims · fake citations · fake research · fake metrics · marketing
tone · hedging where a fact is known.

**Two worked contrasts:**

| ❌ Weak | ✅ Correct |
|---|---|
| "The system is highly secure and follows industry best practices." | "Three security NFRs are implemented (`NFR-10`, `NFR-11`, `NFR-21`) and verified by `T-SEC-001`–`003`. Other controls are ENGINEERING DECISIONs, not academic coverage." |
| "Performance testing showed excellent results." | "`NFR-01` registration p95 = EVIDENCE NOT AVAILABLE — not yet implemented. Threshold ≤ 3 000 ms (🟩 source)." |

---

## 7. Consistency and versioning

### 7.1 The chain

```
Requirements → Architecture → Database → API → Implementation → Tests → Diagrams
```

A document is consistent when its statements match every downstream artefact it names.

### 7.2 When documentation conflicts with implementation

> **Do not silently change the documentation to match the code.**

1. **Identify** the conflict precisely — document, statement, code location.
2. **Determine which is wrong:**
   - Documentation wrong → recommend the doc correction.
   - **Implementation wrong** → say so; the code must change, not the requirement.
   - **Requirement ambiguous** → raise it as an `AMB-nn`; do not resolve by editing either side.
3. **Recommend, then wait** where the correction is architecturally significant.
4. **Never** edit a requirement to match what was built.

### 7.3 Change propagation

When a major decision changes, update **only** the affected documents:

| Change | Typically affects |
|---|---|
| Requirement interpretation | traceability matrices, the deviation record |
| Schema change | `DATABASE_DESIGN`, `DIA-16`, `DIA-09`, ADRs |
| Endpoint change | `API_ARCHITECTURE`, traceability API column |
| New/withdrawn enhancement | `MASTER_PLAN` §27, `PHASE_STATUS`, coverage tables |
| Decision resolved | decision record, `PHASE_STATUS`, superseded ADR, affected architecture docs |
| Test result | test report, coverage, audit |

Superseded content is **marked superseded with a pointer**, never quietly deleted — the history
is part of the academic record.

---

## 8. Final document check

Run before marking any document complete.

- [ ] **Source compliance** — every SOURCE REQUIREMENT quoted verbatim with file + page; no wording rewritten
- [ ] **Factual accuracy** — every number, count and ID verified against the artefact, not memory
- [ ] **Implementation consistency** — schema, endpoints, file paths match what exists
- [ ] **Terminology consistency** — actor, department and FR names match the traceability matrix exactly
- [ ] **Requirement traceability** — every claim carries an ID or a source path
- [ ] **Diagram consistency** — cited `DIA-nn` exist, render, and agree with the prose
- [ ] **Test consistency** — cited test IDs exist; results match the evidence log
- [ ] **Evidence availability** — every result has evidence, or says `EVIDENCE NOT AVAILABLE`
- [ ] **Classification** — every substantive statement is one of the six labels (§2)
- [ ] **Coverage separation** — academic and enhancement never summed
- [ ] **No fabrication** — no invented results, metrics, research, screenshots or citations
- [ ] **`reference/` untouched** — `git status --porcelain reference/` is empty

### Quick verification commands

```bash
# reference/ must be unmodified
git status --porcelain reference/

# every requirement ID cited in docs is defined
grep -rhoE "(US|AC|NFR|FR-(REC|TRN|ADM|MEM|ACC)|FR-SUB|ENH|ASM|CON|AMB|INC|DIA)-[0-9]{2}" docs/ \
  | sort -u > /tmp/cited.txt

# cited diagrams actually exist
grep -rhoE "DIA-[0-9]{2}" docs/ | sort -u
ls docs/diagrams/*/*.png
```

---

## 9. Related skills

- `requirements-traceability` — owns the requirements-phase documents and the ID system
- `software-engineering-diagrams` — owns diagrams and use case documentation
- `ironboard-ui-visual-qa` — owns design system and UI design documentation
- `testing-and-quality` — owns test artefacts and the evidence rule this skill enforces
- `academic-submission-audit` — grades documents; **this skill never self-grades**

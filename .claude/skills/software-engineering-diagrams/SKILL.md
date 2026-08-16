---
name: software-engineering-diagrams
description: Author, render and verify the UML/DFD/ER diagrams required by the Ironboard Software Engineering labs — DFD L0/L1/L2, use case + use case documentation, activity, state chart, sequence, collaboration, class, state transition, ER/data model and architecture. Use when asked to create, update, render, fix or review any project diagram, when a lab experiment requires a diagram deliverable, or when code changes make an existing diagram stale. Enforces PlantUML source-of-truth, rendered PNG output, visual inspection, and consistency with docs/requirements IDs.
---

# Ironboard — Software Engineering Diagrams

Produces the diagram deliverables required by `reference/course-policy/` and
`reference/experiments/`. Every diagram must model **the Ironboard gym management system**
described in `reference/lab1/` and `reference/lab2/` — never a generic example.

## Ground rules

1. **`reference/` is READ-ONLY.** Never modify, rename or delete anything inside it.
2. **Do not invent requirements.** Every actor, use case, class, activity and data store must
   trace to an ID in `docs/requirements/LAB1_TRACEABILITY_MATRIX.md` or
   `docs/requirements/LAB2_NFR_TRACEABILITY.md`. If a diagram needs something absent from the
   labs, add it to the "Elements not in the source documents" section of the diagram's
   `NOTES.md` — do not silently promote it to a requirement.
3. **Separate academic requirement from engineering enhancement.** Every diagram file states
   which it is in its header comment (see §3).
4. **Label by artefact, never by bare experiment number.** `reference/` numbers experiments two
   incompatible ways (`CON-01` in `docs/project/REQUIREMENT_GAP_ANALYSIS.md`): the course
   policy lab table and the handout filenames align only at Experiment 1. Use
   `use-case`, `dfd-l1`, `class` etc. as the canonical name and record both numbering claims in
   `NOTES.md`.

## 1. Required diagrams

Sourced from `reference/course-policy/Software-engg-Course Policy_version1-26=27.pdf` (lab
table, pp.11–13), the `reference/experiments/*.docx` handouts, and
`reference/syllabus/…Syllabus Compiled.pdf`.

| ID | Artefact | Output path (no extension) | Required by | Tool |
|---|---|---|---|---|
| `DIA-01` | DFD Level 0 (context) | `docs/diagrams/dfd/dfd-l0` | Policy Lab 3; DFD handout Part B | PlantUML |
| `DIA-02` | DFD Level 1 | `docs/diagrams/dfd/dfd-l1` | Policy Lab 3; DFD handout Part B | PlantUML |
| `DIA-03` | DFD Level 2 | `docs/diagrams/dfd/dfd-l2` | Policy Lab 3 **only** (`CON-02`) | PlantUML |
| `DIA-04` | Use case diagram | `docs/diagrams/use-case/use-case` | Policy Lab 4; `EXP-3-USE CASE.docx` | PlantUML |
| `DIA-05` | Use case documentation | `docs/diagrams/use-case/USE_CASE_DOCUMENTATION.md` | Policy Lab 4; `EXP-3` | Markdown |
| `DIA-06` | Activity diagram | `docs/diagrams/activity/activity-<workflow>` | Policy Lab 4; `EXP-4-ACTIVITY.docx` | PlantUML |
| `DIA-07` | State chart diagram | `docs/diagrams/state/state-chart-membership` | Policy Lab 5 (**Star UML named**) | PlantUML |
| `DIA-08` | Sequence diagram | `docs/diagrams/sequence/sequence-<flow>` | Policy Lab 6; `LAB-6-Sequence diagram.docx` | PlantUML |
| `DIA-09` | Class diagram | `docs/diagrams/class/class-diagram` | Policy Lab 6; `EXP-5-CLASS.docx` | PlantUML |
| `DIA-10` | State transition diagram | `docs/diagrams/state/state-transition-<entity>` | Policy Lab 6 (`AMB-08`) | PlantUML |
| `DIA-11` | Collaboration / communication | `docs/diagrams/collaboration/collab-<flow>` | `EXP-7-COLLAB.docx`; Syllabus Unit 3 (`CON-03`) | PlantUML |
| `DIA-12` | UI design diagram | `docs/diagrams/ui/ui-design` | Policy Lab 7 — three golden rules | See `ironboard-ui-visual-qa` |
| `DIA-13` | Control Flow Model | `docs/diagrams/cfd/control-flow` | Syllabus Unit 4 — **taught only** | PlantUML |
| `DIA-14` | Burndown chart | `docs/diagrams/agile/burndown` | Policy Lab 8 Task 9 (*proposed*) | Mermaid/Python |
| `DIA-15` | Architecture diagram | `docs/diagrams/architecture/architecture` | Syllabus Unit 5 — **taught only** | PlantUML/Graphviz |
| `DIA-16` | ER / data model | `docs/diagrams/er/er-model` | **Enhancement** — supports `EXP-5` | PlantUML |

**Mandatory vs enhancement.** `DIA-01`…`DIA-12` are academic requirements. `DIA-13`, `DIA-15`
are taught in the syllabus but assigned by no lab — build only if asked, and mark them
`ENHANCEMENT`. `DIA-14` is marked *Proposed* in the course policy. `DIA-16` is an engineering
enhancement that makes `DIA-09` tractable.

### Two recorded conflicts to honour, not resolve

- **`CON-02` DFD depth** — Policy Lab 3 requires Level 0, 1 **and 2**; the DFD handout Part B
  says "DEVELOP DFD LEVEL 0 AND LEVEL 1". **Produce all three** (the superset satisfies both)
  and note the conflict in `docs/diagrams/dfd/NOTES.md`.
- **`AMB-08` state chart vs state transition** — Policy Lab 5 asks for a "State chart diagram",
  Lab 6 for a "state transition diagram". Produce `DIA-07` for **membership** (the richest
  lifecycle, `WF-02`) and `DIA-10` for a **second entity** (equipment or staff account), then
  record in `NOTES.md` that they may be intended as one artefact.

## 2. Canonical vocabulary — use these exact names

Diagrams that disagree with the traceability matrix fail review. Source:
`docs/requirements/LAB1_TRACEABILITY_MATRIX.md`.

**Actors** (`ACT-01`…`ACT-05` are primary; only these own use cases):
`Receptionist` · `Trainer` · `Administrator` · `Membership Manager` · `Accounting Executive`

**Secondary actors** (`ACT-06`…`ACT-10`, referenced in acceptance criteria only — draw as
secondary/right-hand actors, never as use case owners):
`Member` · `Prospect` · `Staff Applicant` · `System Scheduler` · `Entrance Check-in`

**Departments / subsystems** (`D01`…`D05`):
`Reception` · `Trainer Department` · `Administration` · `Membership Management` · `Accounting`

**Use case names** — use the 25 functional requirement labels verbatim from
`reference/lab2/` Part B (`FR-REC-01`…`FR-ACC-05`), e.g. `Register new members`,
`Verify member details`, `Schedule trial sessions`.

> `FR-ACC-03` has **four** conflicting verbs across sources (`CON-04`): the Lab 1 story omits
> the verb, its AC heading says "Generate", Lab 2 says "Review", the homepage says "Produce".
> Use **"Review revenue reports"** (the Lab 2 FR label) on diagrams and footnote the conflict.

## 3. Required file layout

Every diagram is three artefacts. A rendered PNG with no source, or source with no render,
is incomplete.

```
docs/diagrams/<category>/
├── <name>.puml        # editable source — the source of truth
├── <name>.png         # rendered output, committed
└── NOTES.md           # per-category: traceability, conflicts, assumptions
```

Every `.puml` opens with this header:

```
' ============================================================
' Ironboard — <Artefact name>
' Diagram ID   : DIA-nn
' Status       : ACADEMIC REQUIREMENT | ENHANCEMENT
' Required by  : <exact source document + page/section>
' Traces to    : US-nn, FR-xxx-nn, AC-nn, NFR-nn, WF-nn
' Assumptions  : ASM-nn (or: none)
' Last verified: <date> against docs/requirements/
' ============================================================
```

## 4. Rendering

Verified working in this environment. PlantUML needs Graphviz for class/state/activity layouts.

```bash
# One-time setup
apt-get install -y graphviz
curl -sSL -o /tmp/plantuml.jar \
  https://github.com/plantuml/plantuml/releases/download/v1.2024.7/plantuml-1.2024.7.jar

# Render one file, or a whole category
java -jar /tmp/plantuml.jar -tpng docs/diagrams/use-case/use-case.puml
java -jar /tmp/plantuml.jar -tpng "docs/diagrams/**/*.puml"

# Syntax check without rendering
java -jar /tmp/plantuml.jar -checkonly docs/diagrams/class/class-diagram.puml
```

**Tool choice:**
- **PlantUML** — all formal UML (use case, activity, state, sequence, collaboration, class, ER).
  Preferred: it is text-based, diffable and reviewable.
- **Graphviz `dot`** — DFDs and architecture, where precise node placement matters.
- **Mermaid** (`npx -p @mermaid-js/mermaid-cli mmdc`) — burndown and any diagram embedded in
  Markdown for reading. Never the sole source for a submitted UML diagram.

**On Star UML:** Policy Lab 5 says "Make use of Star UML software for design". Star UML is a
GUI tool unavailable here. Produce the PlantUML source and render, and record in
`docs/diagrams/state/NOTES.md` that Star UML was specified but a text-based equivalent was
used. **Do not claim Star UML was used.**

## 5. Per-diagram procedure

Each follows the procedure in its own handout. Read the handout before drawing.

### DFD Level 0 / 1 / 2 (`DIA-01`–`DIA-03`)
Source: `reference/experiments/PRACTICAL 8-DFD.docx`; Policy Lab 3.

1. **Level 0 (context):** exactly **one** process bubble — `0. Ironboard Gym Management
   System`. External entities are the five primary actors plus `Member` and
   `Entrance Check-in`. Show net data flows only. **No data stores at Level 0.**
2. **Level 1:** decompose into the five departments as processes `1.0`–`5.0`
   (`1.0 Reception` … `5.0 Accounting`). Add data stores: `D1 Members`, `D2 Plans`,
   `D3 Sessions`, `D4 Attendance`, `D5 Payments`, `D6 Equipment`, `D7 Staff`, `D8 Branches`.
3. **Level 2:** decompose **at least one** Level-1 process into its five FRs, numbered
   `n.1`–`n.5`. Accounting (`5.0` → `FR-ACC-01`…`05`) is the strongest candidate — it has the
   most sub-behaviours (`FR-SUB-20`…`25`).
4. **Balance the levels.** Every flow crossing the Level-0 boundary must appear at Level 1;
   every flow into `n.0` must appear at Level 2. Unbalanced DFDs fail review.

### Use case diagram (`DIA-04`)
Source: `reference/experiments/EXP-3-USE CASE.docx` — procedure: analyse functionalities →
list use cases and actors → draw associations.

- One `rectangle Ironboard { }` system boundary containing all 25 use cases.
- Primary actors left, secondary actors right.
- Group use cases by department with `package`.
- Model the four cross-department dependencies as `<<include>>`:
  `FR-REC-04 → FR-ACC-01`, `FR-MEM-03 → FR-ACC-01`, and `FR-ADM-05 → ` each department.
- Use `<<extend>>` only where a source document states optional behaviour (e.g. `FR-SUB-25`
  "offer an option to send payment notices" extends `FR-ACC-05`).
- The handout requires exception analysis: *"Is it possible that the actor will encounter an
  error condition?"* — since Lab 1 has **no** rejection paths (`INC-01`), list the exceptions
  you identify in `NOTES.md` rather than inventing use cases.

### Use case documentation (`DIA-05`)
Source: `EXP-3` — *"Use-cases are written first in narrative form and then mapped to a
template"*. One entry per use case:

```markdown
### UC-nn — <FR label>
| Field | Value |
|---|---|
| Use case ID | UC-nn |
| Traces to | US-nn / FR-xxx-nn / AC-nn / NFR-nn |
| Primary actor | ACT-nn |
| Secondary actors | … |
| Preconditions | from the AC "Given" clause |
| Main flow | numbered, from the AC "When"/"Then" |
| Postconditions | from the AC "Then" |
| Exceptions | **NOT IN SOURCE** — Lab 1 has no rejection paths (INC-01) |
| Source | reference/lab1/… p.n |
```

### Activity diagram (`DIA-06`)
Source: `reference/experiments/EXP-4-ACTIVITY.docx` — identify activities, association,
conditions, constraints; show *"parallel, branched and concurrent flow"*.

- Minimum: one for the cross-department member journey (`WF-01`, matching the homepage
  workflow strip: Reception → Membership → Trainer → Accounting → Admin).
- Use **swimlanes** (`|Receptionist|`) — the handout names swim-lane diagrams explicitly.
- Include at least one `fork`/`join` and one decision diamond; the handout requires them.
- Start `(*)`/`start` and `stop` nodes are mandatory.

### State chart (`DIA-07`) and state transition (`DIA-10`)
Source: Policy Labs 5 and 6.

Membership states — the union of all Lab 1 stories (`ASM-13`, still **unconfirmed**, `B-05`):
`Active` (AC-20) · `Expiring` (AC-19, 7-day threshold) · `Expired` (AC-20) ·
`Cancelled` (AC-17). Transitions from `AC-17`, `AC-18`, `AC-19`, `AC-20`.

Mark the state set as an assumption in `NOTES.md` — Lab 1 never defines it, and `AC-20`
filters on only two of the four.

### Sequence diagram (`DIA-08`)
Source: `reference/experiments/LAB-6-Sequence diagram.docx` — identify *"controller class,
objects, boundaries, messages"*; use lifelines, activation boxes, sync vs async.

- Use boundary/control/entity stereotypes, as the handout's procedure names them.
- Solid arrows `->` for synchronous, dashed `-->` for returns, `->>` for asynchronous.
- Minimum two flows: **member registration** (`AC-01`, incl. async welcome email) and
  **payment → receipt** (`AC-21` + `AC-04`, the cross-department dependency).
- Show `activate`/`deactivate` — the handout requires activation boxes.

> The `LAB-6` handout's procedure text also says "Draw the collaboration diagram and State
> chart diagram" — copy-paste bleed from `EXP-7` (`AMB-09`). Its stated **Output** is a
> sequence diagram. Follow the Output.

### Collaboration / communication (`DIA-11`)
Source: `reference/experiments/EXP-7-COLLAB.docx` — objects as rectangles named
`object : Class`, connected by links carrying **numbered** messages.

Model the same flow as one sequence diagram so the two can be cross-checked; numbering must
match the sequence order.

### Class diagram (`DIA-09`)
Source: `reference/experiments/EXP-5-CLASS.docx`. Apply the handout's **six class selection
characteristics** and justify each class against them in `NOTES.md`:
retained information · needed services · multiple attributes · common attributes ·
common operations · essential requirements.

Operations must fall in the handout's **four categories**: change state · compute · inquire ·
monitor for events.

⚠️ **Lab 1 and Lab 2 define no data model** (`INC-04`). Every attribute and type is an
assumption. List them all in `NOTES.md` under "Elements not in the source documents" and keep
them consistent with `DIA-16`.

### ER / data model (`DIA-16` — enhancement)
Not required by any lab. Build it first if `DIA-09` is blocked: it makes attributes explicit
and is the natural input to the database layer. Mark `Status: ENHANCEMENT`.

## 6. Verification — run before claiming a diagram is done

**Never mark a diagram complete without viewing the rendered PNG.**

1. **Render** — the PlantUML command must exit 0 and produce a PNG.
2. **Read the PNG with the Read tool.** This is mandatory, not optional. Text-valid PlantUML
   routinely renders unreadably.
3. **Layout inspection** — check for: overlapping labels · crossing lines that could be
   untangled · text clipped at edges · unreadable density · aspect ratio beyond ~2.5:1.
   Fix with `left to right direction`, `together { }`, explicit `-[hidden]->` ordering,
   `skinparam nodesep/ranksep`, or by splitting into multiple diagrams.
4. **Requirement consistency** — every element traces to an ID; every ID claimed in the header
   actually appears.
5. **Terminology consistency** — names match §2 exactly. Grep across diagrams:
   ```bash
   grep -rhoE "(Receptionist|Trainer|Administrator|Membership Manager|Accounting Executive)" docs/diagrams/ | sort | uniq -c
   ```
6. **Implementation consistency** — once code exists, class/ER names must match the real
   models, and sequence messages the real API calls. Diagrams that drift from code are defects.
7. **Notation correctness** — UML-correct arrowheads: inheritance `<|--`, composition `*--`,
   aggregation `o--`, dependency `..>`, realization `<|..`. Multiplicities on every association.
8. **Cross-diagram consistency:**
   - Use case actors == DFD Level-0 external entities
   - DFD Level-1 processes == the five departments
   - Sequence participants == class diagram classes
   - Collaboration message numbering == sequence order
   - State chart states == the status values used in the class/ER model

## 7. Maintenance

Diagrams are living artefacts. Re-verify and re-render when:
- a requirement ID changes in `docs/requirements/`
- a blocking decision (`B-01`…`B-06` in `docs/project/REQUIREMENT_GAP_ANALYSIS.md`) is resolved
- implementation introduces or renames an entity, endpoint or state

Record every re-verification date in the `.puml` header.

## 8. Related skills

- `requirements-traceability` — owns the ID set these diagrams cite; update it when a diagram
  reveals a missing requirement.
- `ironboard-ui-visual-qa` — owns `DIA-12` (UI design diagram, three golden rules).
- `academic-submission-audit` — audits diagram completeness; do not duplicate its checks here.

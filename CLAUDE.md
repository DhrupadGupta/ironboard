# Ironboard

Gym management system built for the **Software Engineering** course (NMIMS MPSTME,
AY 2026-27, course code `702IT0C041`). The project is simultaneously an academic submission
and a working application — both obligations are real, and they are tracked separately.

## Hard rules

1. **`reference/` is READ-ONLY.** Never modify, rename, delete or overwrite anything inside it.
   It holds the original academic source material. Extract to a scratch directory instead.
2. **Never invent a requirement.** The requirement set is closed: 25 functional requirements,
   25 user stories, 25 acceptance criteria, 25 NFRs — all from `reference/lab1/` and
   `reference/lab2/`. Anything else is an **enhancement** (`ENH-nn`), tracked separately and
   never counted toward academic coverage.
3. **Never silently reconcile conflicting sources.** Conflicts carry IDs (`CON-01`…`CON-11`).
   Cite the ID and record both positions.
4. **Never mark work PASS without evidence** — command, actual output, timestamp, commit SHA;
   screenshots for UI, measured numbers for performance.
5. **Do not redesign the homepage.** `reference/design/gym-management-homepage-2.html` is the
   visual source of truth.

## Where things live

| Path | Contents |
|---|---|
| `reference/` | **READ-ONLY** source material — labs, experiments, course policy, syllabus, design |
| `docs/project/REFERENCE_ANALYSIS.md` | Full extraction of every requirement, with sources |
| `docs/project/REQUIREMENT_GAP_ANALYSIS.md` | Conflicts, ambiguities, gaps, risks, blocking decisions |
| `docs/requirements/` | Lab 1 and Lab 2 traceability matrices |
| `docs/ui/DESIGN_SYSTEM.md` | Token-level extraction of the homepage |
| `.claude/skills/` | Project skills (below) |

## Skills

| Skill | Use for |
|---|---|
| `software-engineering-diagrams` | DFD, use case, activity, state, sequence, collaboration, class, ER, architecture |
| `requirements-traceability` | Requirement → story → AC → design → UI → API → backend → DB → test → docs |
| `ironboard-ui-visual-qa` | Visual identity enforcement and screenshot-based QA |
| `testing-and-quality` | All test levels, NFR verification, academic test cases |
| `academic-submission-audit` | PASS/FAIL/PARTIAL/MISSING grading before a submission |

## The requirement ID system

`D01`–`D05` departments · `ACT-01`–`ACT-10` actors · `US-01`–`US-25` stories ·
`AC-01`–`AC-25` acceptance criteria · `FR-{REC,TRN,ADM,MEM,ACC}-01..05` functional requirements ·
`NFR-01`–`NFR-25` non-functional · `WF-01`–`WF-07` workflows · `DIA-01`–`DIA-15` diagrams
(plus `DIA-16` ER model, an enhancement added by the diagrams skill) · `ENH-nn` enhancements.

`US-nn ↔ AC-nn ↔ FR-…-nn ↔ NFR-nn` is a fixed 1:1 mapping for all 25. Never renumber.

## Before implementing anything

Six decisions gate implementation (`docs/project/REQUIREMENT_GAP_ANALYSIS.md` §3) and are
**unresolved**. Do not resolve them by assumption — escalate to the user.

| ID | Decision |
|---|---|
| `B-01` | Do members log in, or is this staff-only? |
| `B-02` | What is the authorisation model? |
| `B-03` | Is branch a data-scoping boundary? |
| `B-04` | Who creates the five missing record types? |
| `B-05` | What is the membership state set? |
| `B-06` | Which experiment numbering governs? |

Five acceptance criteria read data that no user story creates — check-in events, medical
restrictions, equipment records, refund requests and staff self-registration. Work depending
on them is **blocked**, not merely unstarted.

## Environment

Java, Node 22 and Python 3.11 are pre-installed. **Graphviz is not** — install it with
`apt-get install -y graphviz` (PlantUML needs it for class, state and activity layouts).
PlantUML runs from a downloaded JAR
(see the diagrams skill). Chromium is pre-installed at `/opt/pw-browsers/chromium` with
`PLAYWRIGHT_BROWSERS_PATH` set — **never run `playwright install`**.

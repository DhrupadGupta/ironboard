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
| `software-engineering-documentation` | How every document under `docs/` is written, labelled and evidenced |

## The requirement ID system

`D01`–`D05` departments · `ACT-01`–`ACT-10` actors · `US-01`–`US-25` stories ·
`AC-01`–`AC-25` acceptance criteria · `FR-{REC,TRN,ADM,MEM,ACC}-01..05` functional requirements ·
`NFR-01`–`NFR-25` non-functional · `WF-01`–`WF-07` workflows · `DIA-01`–`DIA-15` diagrams
(plus `DIA-16` ER model, an enhancement added by the diagrams skill) · `ENH-nn` enhancements.

`US-nn ↔ AC-nn ↔ FR-…-nn ↔ NFR-nn` is a fixed 1:1 mapping for all 25. Never renumber.

## Blocking decisions — five of six are RESOLVED

`docs/project/REQUIREMENT_GAP_ANALYSIS.md` §3 poses six decisions. **Five are decided and
implemented. Do not reopen them.** Only `B-06` is open, and it gates labelling, not code.

| ID | Decision | Status | Outcome |
|---|---|---|---|
| `B-01` | Do members log in? | ✅ **RESOLVED** | **Yes** — six roles including Member, tracked as `ENH-01`, excluded from academic coverage |
| `B-02` | Authorisation model | ✅ **RESOLVED** | **Six roles, deny-by-default RBAC** (ADR-007); `NFR-10` and `NFR-11` are resource-level, not role-level |
| `B-03` | Is branch a data-scoping boundary? | ✅ **RESOLVED** | **No** — descriptive attribute. `Member`/`Staff.homeBranchId` **nullable**; `Equipment`/attendance `branchId` NOT NULL; plans global; **no row-level isolation, no branch filter anywhere** |
| `B-04` | Who creates the five missing record types? | ✅ **RESOLVED** | `ENH-02`/`03`/`04`/`06`/`07` implemented; **`ENH-05` (`RefundRequest`) WITHDRAWN** — approval is external, captured as data on `Refund` |
| `B-05` | Membership state set | ✅ **RESOLVED** | **Exactly three** — `ACTIVE`, `EXPIRED`, `CANCELLED`. `EXPIRING` is derived, never stored |
| `B-06` | Which experiment numbering governs? | ⚠️ **OPEN** | Escalate to the user/faculty. Affects submission labelling only — **mitigate by labelling per artefact, never by a bare number** |

Records: `docs/decisions/B-03_DECISION.md`, `B-04_API_DECISIONS.md`,
`B-05_MEMBERSHIP_STATE_MACHINE.md`; ADR-007, ADR-013, ADR-014.

The five acceptance criteria that read data no user story creates — check-in events, medical
restrictions, equipment records, refund approval and staff self-registration — are **no longer
blocked**. `B-04` resolved every one; the tables exist and are seeded. What remains is service,
API and UI work, and the unblocking entities are **enhancements** that never count toward
academic coverage.

## Implementation state — verify, never assume

Measured on 2026-08-16; re-measure rather than trusting this table.

| Fact | Value | How to check |
|---|---|---|
| Entities | **29** | `grep -c '^model ' server/prisma/schema.prisma` |
| Tests | **139 passing** | `cd server && npm test` |
| Skills | **6** | `ls .claude/skills` |
| Service / API / HTTP / frontend / auth code | **none** | `ls server/src` → only `db/` |
| Mandatory academic diagrams | **0 of 11** (+ 0 of 1 written artefact) | `ls docs/diagrams` — both existing diagrams are enhancements |

**Tests share one SQLite file.** A test that writes a row owns its removal: mint ids only via
`uid()`, add new tables to `PURGE_ORDER`, and never write to `LedgerEntry`/`AuditEvent` outside
a rolled-back transaction. The suite fails if anything leaks — see `tests/helpers.ts`.

## Environment

Java, Node 22 and Python 3.11 are pre-installed. **Graphviz is not** — install it with
`apt-get install -y graphviz` (PlantUML needs it for class, state and activity layouts).
PlantUML runs from a downloaded JAR
(see the diagrams skill). Chromium is pre-installed at `/opt/pw-browsers/chromium` with
`PLAYWRIGHT_BROWSERS_PATH` set — **never run `playwright install`**.

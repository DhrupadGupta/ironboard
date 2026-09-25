# Ironboard — Requirement Gap Analysis

**Status:** Analysis only. No application code has been written.
**Date:** 2026-08-16
**Companion to:** `docs/project/REFERENCE_ANALYSIS.md`

**Purpose.** This document satisfies `[POL]` Laboratory Exercise 1, item 8 —
*"Identify the ambiguities, inconsistencies, incompleteness from the requirements gathered."*
It consolidates every gap found across the 14 reference documents, ranks them by impact, and
names who must resolve each one.

> **Rule applied throughout:** conflicts are **recorded, not reconciled**. Where two source
> documents disagree, both positions are stated with their sources. Nothing absent from the
> sources is presented as a requirement.

---

## 1. Executive summary

| Dimension | Finding |
|---|---|
| Requirements extracted | 25 FR · 25 user stories · 25 acceptance criteria · 25 NFR · 25 sub-behaviours |
| Requirement quality | **Strong breadth, weak depth.** Coverage across 5 departments is complete and internally consistent; individual requirements lack the detail to implement |
| Traceability | **Excellent.** 25/25 stories trace to an FR, an NFR, and a homepage bullet — 100 % three-way coverage |
| Measurability | **Poor.** 15 of 25 NFRs (60 %) are unquantified and fail the `[EXP2]` handout's own test |
| Negative paths | **Absent.** 0 of 25 stories have a rejection/error criterion |
| Missing write paths | **5 critical** — acceptance criteria depend on data that no story creates |
| Conflicts | **11**, one of which (experiment numbering) affects every deliverable label |
| Ambiguities | **16**, three of them scope-defining |
| Incompleteness | **12** |
| Assumptions required to build | **20** |
| Blocking issues before coding | **6** (§3) |

**Bottom line.** The requirements are a sound *breadth-first* elicitation — every department,
actor and workflow is accounted for, and the homepage corroborates all 25 stories exactly.
They are **not yet buildable**: authentication, the data model, and five data-entry paths are
undefined, and 60 % of quality targets are untestable. None of this can be fixed by
interpretation — it requires decisions from the requirement owner.

---

## 2. Risk register

> ⚠️ **STATUS BANNER — added 2026-08-16.** This register is the **original assessment** and is
> kept verbatim. Live risk status is maintained in **`docs/project/MASTER_PLAN.md` §26**, where
> `R-01`–`R-05`, `R-08` and `R-20` are now **closed**. Do not read the severities below as
> current.

Ranked by impact on the ability to build. Probability = likelihood the gap causes rework if
unresolved before coding.

| # | Risk | Impact | Prob. | Severity | Refs |
|---|---|---|---|---|---|
| `R-01` | **No authentication or authorisation model.** Three security NFRs and the role-scoped feature promise are unsatisfiable | Blocks D02, D03, D05 | High | 🔴 **CRITICAL** | AMB-03, NFR-10/11/21, FEA-01 |
| `R-02` | **Member-facing scope undecided.** All 25 stories are staff-facing, yet criteria send members emails, invoices and calendar entries; homepage shows "Sign in" | Doubles or halves scope | High | 🔴 **CRITICAL** | AMB-02, AC-08, AC-22 |
| `R-03` | **Five missing write paths.** Check-ins, medical data, equipment, refund requests and staff self-registration are consumed but never created | 5 stories unbuildable as specified | High | 🔴 **CRITICAL** | AMB-15, §4 |
| `R-04` | **No data model.** No entities, attributes, keys or relationships anywhere | Blocks class diagram + all coding | High | 🔴 **CRITICAL** | INC-04, EXP5 |
| `R-05` | **Branch scoping undefined.** Unknown whether members/staff/equipment/plans are branch-scoped | Rework of every table if wrong | High | 🟠 **HIGH** | AMB-05, NFR-12 |
| `R-06` | **60 % of NFRs untestable.** Thresholds would have to be invented | Cannot verify; invented numbers presented as requirements | High | 🟠 **HIGH** | AMB-06, ASM-10 |
| `R-07` | **Experiment numbering irreconcilable** between `[POL]` and the handouts | Wrong deliverable submitted | Med | 🟠 **HIGH** | CON-01 |
| `R-08` | **Membership state set undefined.** Stories imply Active/Expiring/Expired/Cancelled; AC-20 filters on only two | Blocks required State Chart diagram | High | 🟠 **HIGH** | AMB-07, WF-02, DIA-07 |
| `R-09` | **Payment gateway unnamed** while "online" payment is required, under an encryption NFR with no scope | Security + integration risk | Med | 🟠 **HIGH** | AC-21, NFR-21 |
| `R-10` | **No negative paths.** Every one of 25 stories specifies only the happy path | Undefined failure behaviour throughout | High | 🟠 **HIGH** | INC-01, INC-09 |
| `R-11` | **No mobile navigation** in the source design below 860px | Three nav sections unreachable on mobile | Med | 🟡 **MEDIUM** | INC-11 |
| `R-12` | **No currency, tax or pricing model** despite plans, payments, invoices, refunds and revenue reports | Financial correctness | Med | 🟡 **MEDIUM** | INC-06 |
| `R-13` | **No volume or capacity figures.** Load and scalability targets unspecifiable | Perf NFRs unverifiable | Med | 🟡 **MEDIUM** | INC-07, NFR-12 |
| `R-14` | **Homepage exists in three accent colours** across the reference set | Visual inconsistency | Low | 🟡 **MEDIUM** | CON-06 |
| `R-15` | **Nine `[POL]` Lab 1 sub-deliverables missing** (survey, feasibility, problem statement, dev plan…) | Academic marks | Med | 🟡 **MEDIUM** | INC-10 |
| `R-16` | **Course policy contradicts itself on ICA marks** | Assessment ambiguity | Low | 🟢 **LOW** | CON-07 |
| `R-17` | **No Definition of Done or Constraints list** for the project | Process gap vs `[EXP2]` | Med | 🟢 **LOW** | INC-02 |
| `R-18` | **Notification channels/providers unspecified** across three notification types | Integration gap | Low | 🟢 **LOW** | AMB-12 |

---

## 3. Blocking issues — five of six RESOLVED

> ⚠️ **STATUS BANNER — added 2026-08-16. Read this before the table.**
>
> This section is the **original analysis**: it records the questions as they stood before any
> decision was taken, and the table below — including its "*(recommended)*" markers — is kept
> verbatim as a historical record. **It is not the current status, and three of its
> recommendations were overridden.**
>
> | ID | Status | Outcome | Recommendation here still valid? |
> |---|---|---|---|
> | `B-01` | ✅ RESOLVED | Members **do** log in — six roles, Member tracked as `ENH-01` | ❌ overridden — (a) "staff-only v1" was not chosen |
> | `B-02` | ✅ RESOLVED | **Six roles, deny-by-default RBAC** (ADR-007), with two resource-level checks | ❌ overridden — (a) "five flat roles" was not chosen; the outcome is nearest (b)+(c) |
> | `B-03` | ✅ RESOLVED | Branch is **non-isolating**; people carry a **nullable** `homeBranchId` | ❌ overridden — (a) "members + staff branch-scoped" was rejected; nearest to (c) |
> | `B-04` | ✅ RESOLVED | `ENH-02`/`03`/`04`/`06`/`07` implemented; **`ENH-05` withdrawn** | ✅ decided per record, per §4 |
> | `B-05` | ✅ RESOLVED | **Three** states — `ACTIVE`, `EXPIRED`, `CANCELLED`; `EXPIRING` derived | ❌ overridden — neither (a) four states nor (b) two |
> | `B-06` | ⚠️ **OPEN** | Escalate to faculty; affects submission labelling only | (c) "label by artefact" adopted as mitigation |
>
> Decision records: `docs/decisions/B-03_DECISION.md`, `B-04_API_DECISIONS.md`,
> `B-05_MEMBERSHIP_STATE_MACHINE.md`; ADR-007, ADR-013, ADR-014.
> **Do not reopen a resolved decision from this table.**

These six could not be resolved by reading the sources more carefully. **They required a
decision.** As posed at the time:

| # | Question | Why it blocks | Options |
|---|---|---|---|
| `B-01` | **Do members log in?** | Determines whether Ironboard is a 5-role staff tool or a 6-role platform with a member portal. Affects data model, auth, UI surface and roughly half the effort | (a) Staff-only v1 *(recommended — matches all 25 stories)* (b) Staff + read-only member portal (c) Full member self-service |
| `B-02` | **What is the authorisation model?** | `NFR-10`, `NFR-11`, `NFR-21` and `FEA-01` are all unsatisfiable without it | (a) Five flat roles, one per department *(recommended)* (b) Roles + per-member trainer assignment (`NFR-10` hints at this) (c) Full permission matrix |
| `B-03` | **Is branch a scoping boundary?** | Determines whether nearly every table carries a `branch_id`. Retrofitting is expensive | (a) Members + staff branch-scoped, plans global *(recommended)* (b) Everything branch-scoped (c) Branch is a label only |
| `B-04` | **Who creates the five missing record types?** | Five stories cannot be built as written | See §4 — needs a decision per record |
| `B-05` | **What are the membership states?** | Blocks the required State Chart diagram *and* `NFR-17` | (a) Active / Expiring / Expired / Cancelled *(recommended — union of all stories)* (b) Only Active / Expired per `AC-20` |
| `B-06` | **Which experiment numbering governs?** | Determines what to submit and when | (a) `[POL]` table governs; handouts are supporting theory *(recommended)* (b) Handouts govern (c) Label by artefact name, not number |

---

## 4. Missing write paths ⚠️

The single most actionable class of gap. Five acceptance criteria open with a precondition
that **no user story satisfies** — the system is required to read data it is never told how
to create.

| # | Precondition (verbatim) | AC | Blocks | Record needed | Plausible owner |
|---|---|---|---|---|---|
| 1 | "check-in data is recorded at the entrance" | AC-14 | **US-05 and US-14** | Attendance event | Reception action, turnstile, or card scan |
| 2 | "a member has a health condition logged" | AC-10 | US-10 | Medical restriction | Reception at registration, or Trainer |
| 3 | "a machine needs regular service" | AC-13 | US-13 | Equipment register | Administration |
| 4 | "an approved refund request" | AC-24 | US-24 | Refund request + approval | Member? Reception? Admin? |
| 5 | "a new staff member registers for access" | AC-11 | US-11 | Staff account (pending) | Staff self-registration |

Plus two records implied but unowned:

| Record | Implied by | Note |
|---|---|---|
| **Prospect** | AC-03 "a potential customer's details" | Prospects are not members; no story creates one |
| **Plan template library** | AC-06 "chooses or creates a workout plan" | "Chooses" implies pre-existing templates |

> Attendance (#1) is the highest-value fix: one missing write path blocks **two** stories
> across **two** departments.

---

## 5. Conflicts between source documents

Recorded verbatim from both sides. **Not reconciled.**

### `CON-01` — Experiment numbering 🔴

| Exp | `[POL]` lab table | Supplied handout |
|---|---|---|
| 1 | SDLC / literature survey / requirements | Agile user stories — functional ✅ |
| 2 | Select a process model | Agile user stories — non-functional ❌ |
| 3 | DFD levels 0, 1, 2 | Use case diagram ❌ |
| 4 | Use case + activity diagram | Activity diagram ⚠️ |
| 5 | State chart (Star UML) | Class diagram ❌ |
| 6 | Sequence + class + state transition | Sequence diagram ⚠️ |
| 7 | UI design, three golden rules | Collaboration diagram ❌ |
| 8 | Bug reporting + burndown *(proposed)* | DFD ❌ |
| 9 | Coding | Testing ❌ |
| 10 | Test case design | *(no handout)* |

Only Experiment 1 aligns. **Consequence:** `[POL]` Lab 9 says code "according to the designs
analyzed in **EXP.4,5**" — under `[POL]` that means Use Case + Activity and State Chart; under
the handouts it means Activity and Class. *The coding prerequisite is itself ambiguous.*

### `CON-02` — DFD depth
`[POL]` Lab 3: "Design level-0 …, Design level-1 **and Level-2**".
`[EXP8]` Part B: "DEVELOP DFD **LEVEL 0 AND LEVEL 1**".

### `CON-03` — Collaboration diagram has no lab slot
`[EXP7]` is a full handout and `[SYL]` Unit 3 names it, but the `[POL]` 10-lab table never
assigns it.

### `CON-04` — Revenue-report verb, four sources disagree
`[LAB1]` story: **verb missing entirely** · `[LAB1]` AC heading: "**Generate**" ·
`[LAB2]`: "**Review**" · `[HTML]`: "**Produce**". Read vs. create is a real behavioural difference.

### `CON-05` — Test case quantity
`[POL]` Lab 10: test cases for "any **two functionalities**".
`[EXP9]` Output: "**upto four test cases**".

### `CON-06` — Homepage accent colour, three variants
`[LAB2]` p.8 screenshot: **blue/indigo** (≈`#4a4ad4`) · `[LAB2]` pp.9–10 screenshots:
**red/crimson** (≈`#d94a4a`) · `[HTML]`: **volt green `#cbff3d`**.
Layout and copy are otherwise identical. The filename `…homepage-2.html` implies revision 2.
**Resolution:** volt green governs, per explicit instruction that the HTML is the visual
source of truth. Recorded because it was not reconciled by the sources themselves.

### `CON-07` — Course policy contradicts itself on ICA marks

| Component | `[POL]` §4 table | `[POL]` §4.1 prose |
|---|---|---|
| Lab Submissions | **10** | **"weightage of 20 marks"** |
| Assignments | **05** | **"weightage of 10 marks"** |
| Mini project | **10** | *not mentioned* |
| Class Participation | **05** | *not mentioned* |
| Challenging problems | *not in table* | **"5 marks"** |
| **Total** | **50** ✅ | ≠ 50 ❌ |

Only the table sums to the stated 50.

### `CON-08` — Programme / semester / prerequisite metadata
`[POL]`: "B Tech / MBA Tech – Computer science, IT, BTI, Computer Engineering, Cyber Security,
Data science"; prerequisite blank.
`[SYL]`: "B Tech (CSE-Cybersecurity, CSBS, Computer Science, CSEDS, AIML, AIDS)", Sem III/V;
prerequisite "Programming for Problem Solving".
`[LAB1]`: student is **"MBA tech IT"** — a programme `[SYL]` does not list for this code.

### `CON-09` — Lab exercise count
`[POL]`: "the following **10** programming exercises". `[SYL]`: "**8 to 10** programming
exercises (and a practicum)".

### `CON-10` — Academic year stamp
`[SYL]` page footers read "AY **2025-26** / Page 16"; header block stamped **2026-27**.

### `CON-11` — DFD handout self-contradiction
File `PRACTICAL 8-DFD.docx`; internal heading "**PRACTICAL 9**". `[EXP9]` is separately titled
"EXPERIMENT- 9" (Testing). Two documents claim position 9.

---

## 6. Ambiguities

| ID | Ambiguity | Impact | Resolve by |
|---|---|---|---|
| `AMB-01` | "Ironboard" appears only in `[HTML]`; neither lab names the product | Low | Confirm project name |
| `AMB-02` | **Is there a member-facing interface?** All stories are staff-facing, but members receive emails/invoices/calendar entries and `[HTML]` shows "Sign in" | 🔴 Scope-defining | `B-01` |
| `AMB-03` | **No auth/authz model** — no login, credentials, sessions, or permission matrix defined | 🔴 Blocks 3 NFRs | `B-02` |
| `AMB-04` | "working hours" (NFR-08) undefined — no hours, timezone, or holiday calendar | Med | Define operating window |
| `AMB-05` | **Branch scoping depth** — are members/staff/equipment/plans branch-scoped? | 🟠 Data model | `B-03` |
| `AMB-06` | **15 of 25 NFRs unquantified** — "easy", "never", "efficiently", "successfully", "whenever" | 🟠 Untestable | Set thresholds explicitly |
| `AMB-07` | "valid inactive memberships" (NFR-17) — "valid" undefined; grace period? | Med | `B-05` |
| `AMB-08` | State chart (`[POL]` Lab 5) vs state transition diagram (`[POL]` Lab 6) — same or distinct? | Med | Confirm with faculty |
| `AMB-09` | `[EXP6]` procedure says "draw the collaboration diagram and State chart diagram" but its Output is a sequence diagram — copy-paste bleed from `[EXP7]` | Low | Follow the stated Output |
| `AMB-10` | `[POL]` Lab 1 requires shortlisting 5 case studies and selecting 1; every handout reads `<case study name>` unfilled. No document records the selection | Med | Document the choice |
| `AMB-11` | `[POL]` credit block extracts as `L T / 0 2 / P C H / 4 3 2` — column order unresolvable; the "4" maps to nothing in `[SYL]` | Low | Use `[SYL]` figures |
| `AMB-12` | Notification channels — AC-19 says "email or SMS", AC-01/AC-22 say email, AC-06/AC-09 say only "notify". No provider or template | Med | Define channel policy |
| `AMB-13` | Homepage `Sign in`, `Get started`, `Request a demo`, `Talk to sales` all `href="#"` | Low | Define routes |
| `AMB-14` | Hero stat "01 shared source of truth" — architectural constraint or marketing copy? | Low | Treat as copy |
| `AMB-15` | **Attendance capture mechanism** — AC-14 asserts entrance check-in as a precondition; no story records it | 🔴 Blocks 2 stories | `B-04` |
| `AMB-16` | "Print" semantics (US-04/AC-04) — printer, PDF, or browser dialog? AC-22 says PDF for invoices; AC-04 says nothing | Med | Align with AC-22 |

---

## 7. Incompleteness

| ID | What is incomplete | Required by | Impact |
|---|---|---|---|
| `INC-01` | **Only one acceptance criterion per story.** Heading reads "Accepatnce **1**:" implying a missing set 2. `[EXP1]` models two (happy + rejection). **All 25 negative paths absent** | `[EXP1]` | 🟠 High |
| `INC-02` | **No project Constraints list and no Definition of Done.** `[EXP2]` Step 2 requires both, "published … highly visible" | `[EXP2]` | Med |
| `INC-03` | **NFRs not written as user stories** — `[EXP2]` LO 2 requires it; `[LAB2]` supplies a table only | `[EXP2]` | Med |
| `INC-04` | **No data model** — no entities, attributes, keys or relationships anywhere | `[EXP5]` | 🔴 Critical |
| `INC-05` | **No field-level validation rules** despite `NFR-02` requiring validation of "all member information" | `NFR-02` | 🟠 High |
| `INC-06` | **No currency, tax, discount or proration model** despite plans, payments, invoices, refunds and revenue reports | — | Med |
| `INC-07` | **No volume figures** — members, branches, concurrency, retention. `NFR-12` untestable | `NFR-12` | Med |
| `INC-08` | **Reporting periods undefined** — AC-23 says "date range" with no bounds, granularity or export format | `NFR-23` | Med |
| `INC-09` | **No error handling defined** — payment failure, bounced email, double-booking, disabling a branch with attached members | — | 🟠 High |
| `INC-10` | **Nine `[POL]` Lab 1 sub-deliverables missing** — literature survey, 5 shortlisted case studies, scope, feasibility, problem statement, user vs system requirements, development plan | `[POL]` Lab 1 | Med |
| `INC-11` | **No mobile navigation.** `[HTML]` hides all nav links ≤860px with no hamburger or drawer; Departments/Workflow/Features become unreachable | `[HTML]` | Med |
| `INC-12` | **Two CSS custom properties declared but unused** — `--ink-3` (0 uses), `--volt-dim` (0 uses). Intent unknown | `[HTML]` | Low |

---

## 8. Requirements *not* present — do not treat as mandatory

Recorded explicitly so that absence is never mistaken for obligation.

| Item | Status | Why it might be assumed present |
|---|---|---|
| Member self-service portal | **NOT PRESENT** | "Sign in" button in `[HTML]`; members receive notifications |
| Login / password / session management | **NOT PRESENT** | Implied by three security NFRs |
| Payment gateway integration | **NOT PRESENT** | AC-21 permits "online" payment |
| Data retention policy | **NOT PRESENT** | `[EXP2]` teaches it; `[LAB2]` omits it |
| Accessibility requirement | **NOT PRESENT** in `[LAB2]` | `[HTML]` already implements more than is asked |
| Compliance / regulatory requirement | **NOT PRESENT** | `[EXP2]` teaches HIPAA-style examples |
| Portability requirement | **NOT PRESENT** | `[EXP2]` example only |
| 10-second inactivity logout | **NOT PRESENT** | Appears in `[EXP2]`'s **sample** constraints table |
| Credit-card masking (last 4 digits) | **NOT PRESENT** | Appears in `[EXP2]`'s **sample** constraints table |
| `payment_preferences` audit log | **NOT PRESENT** | Appears in `[EXP2]`'s **sample** constraints table |
| Peer review within 4 hours of check-in | **NOT PRESENT** | Appears in `[EXP2]`'s **sample** DoD table |
| Architecture / component diagram | **NOT PRESENT** as a lab deliverable | `[SYL]` Unit 5 teaches it |
| Control Flow Model diagram | **NOT PRESENT** as a lab deliverable | `[SYL]` Unit 4 teaches it |
| Equipment CRUD, medical-data entry, refund request, staff self-registration, check-in capture | **NOT PRESENT** | Consumed by acceptance criteria (§4) |
| Plan modification | **NOT PRESENT** | `NFR-16` names "modify"; no story provides it |

> The four `[EXP2]` sample-table rows above are the highest-risk items on this list: they are
> concrete, plausible, and gym-adjacent enough to be mistaken for project requirements. They
> are **generic teaching examples about a different system.**

---

## 9. Assumptions required to proceed

> ⚠️ **STATUS BANNER — added 2026-08-16.** Four of these assumptions were **contradicted** by
> the decisions that followed and are **WITHDRAWN**. They are kept below as the historical
> record of what was assumed before the decisions were taken — **do not implement against
> them.**
>
> | ID | Original assumption | Status |
> |---|---|---|
> | `ASM-01` | Members have no login in v1 | ❌ **WITHDRAWN** — `B-01`: members **do** log in (`ENH-01`) |
> | `ASM-02` | Five flat roles | ❌ **WITHDRAWN** — `B-02`/ADR-007: **six** roles, deny-by-default, two resource-level checks |
> | `ASM-05` | Members branch-scoped | ❌ **WITHDRAWN** — `B-03`: branch is non-isolating; `homeBranchId` **nullable** |
> | `ASM-13` | Four states incl. `Expiring` | ❌ **WITHDRAWN** — `B-05`: **three** states; `EXPIRING` derived |
> | `ASM-09` | Three golden rules (`DIA-12`) | ⚠️ **STILL AN ASSUMPTION** — not in any source |
> | `ASM-10` | Unquantified NFRs adopt a numeric peer | ✅ **Superseded by ADR-012** — thresholds are explicit and 🟦-labelled |
> | `ASM-16` | Label by artefact, not number | ✅ **Adopted** as the `B-06` mitigation |

Full list in `REFERENCE_ANALYSIS.md` §17. The ten that carry material risk, **as assessed at
the time**:

| ID | Assumption | Resolves | Risk if wrong |
|---|---|---|---|
| `ASM-01` | Staff-facing web app; members have no login in v1 | AMB-02 | 🔴 Half the scope wrong |
| `ASM-02` | Five flat roles, one per department | AMB-03 | 🔴 Security model rework |
| `ASM-10` | Unquantified NFRs adopt the nearest stated numeric peer | AMB-06 | 🔴 Invented thresholds presented as requirements |
| `ASM-05` | Members branch-scoped; staff assignable to one or more branches | AMB-05 | 🟠 Schema rework |
| `ASM-13` | States are exactly Active / Expiring / Expired / Cancelled | AMB-07 | 🟠 State chart wrong |
| `ASM-16` | Deliverables labelled by artefact, not experiment number | CON-01 | 🟠 Wrong submission |
| `ASM-12` | Check-in recorded by receptionist action or stub endpoint | AMB-15 | 🟠 Two stories affected |
| `ASM-11` | Currency INR; no tax modelling in v1 | INC-06 | 🟡 Financial rework |
| `ASM-19` | Mobile nav must be **added**, extending tokens without altering the design | INC-11 | 🟡 Design drift |
| `ASM-03` | Email + password auth with server-side sessions | AMB-03 | 🟡 Auth rework |

> **`ASM-10` deserves particular care.** Adopting a threshold for the 15 unquantified NFRs is
> unavoidable, but every such number must be recorded as an assumption — never presented as a
> sourced requirement.

---

## 10. Deliverable gap — what exists vs. what is required

| Deliverable | Required by | Status |
|---|---|---|
| User stories (25) | `[EXP1]` | ✅ `[LAB1]` |
| Acceptance criteria (25) | `[EXP1]` | ⚠️ Partial — set 1 only (`INC-01`) |
| Definition of Done | `[EXP1]`, `[EXP2]` | ❌ |
| Versioned requirement documents | `[EXP1]` LO 3 | ❌ |
| NFR document (25) | `[EXP2]` | ✅ `[LAB2]` |
| NFRs as user stories | `[EXP2]` LO 2 | ❌ |
| Project constraints list | `[EXP2]` | ❌ |
| Literature survey, 5 case studies, scope | `[POL]` Lab 1 | ❌ |
| Feasibility study | `[POL]` Lab 1 | ❌ |
| Final problem statement | `[POL]` Lab 1 | ❌ |
| User + system requirements split | `[POL]` Lab 1 | ❌ |
| **Ambiguities / inconsistencies / incompleteness** | `[POL]` Lab 1 item 8 | ✅ **This document** |
| Development plan | `[POL]` Lab 1 item 9 | ❌ |
| Process model selection | `[POL]` Lab 2 | ❌ |
| DFD Level 0 / 1 / 2 | `[POL]` Lab 3; `[EXP8]` | ❌ |
| Use case diagram + documentation | `[POL]` Lab 4; `[EXP3]` | ❌ |
| Activity diagram | `[POL]` Lab 4; `[EXP4]` | ❌ |
| State chart diagram (Star UML) | `[POL]` Lab 5 | ❌ |
| Sequence diagram | `[POL]` Lab 6; `[EXP6]` | ❌ |
| Class diagram | `[POL]` Lab 6; `[EXP5]` | ❌ |
| State transition diagram | `[POL]` Lab 6 | ❌ (see `AMB-08`) |
| Collaboration diagram | `[EXP7]`; `[SYL]` Unit 3 | ❌ (see `CON-03`) |
| UI design, three golden rules | `[POL]` Lab 7 | ⚠️ Homepage exists; no golden-rules analysis |
| Bug reports (3–5, full lifecycle) | `[POL]` Lab 8 Task 8 *(proposed)* | ❌ |
| Sprint backlog + burndown | `[POL]` Lab 8 Task 9 *(proposed)* | ❌ |
| Application code | `[POL]` Lab 9 | ❌ |
| Test cases (9-field format) | `[POL]` Lab 10; `[EXP9]` | ❌ |

**Delivered: 3 of 27.** The two lab submissions plus this analysis.

---

## 11. Recommended resolution sequence

Ordered so each step unblocks the next. **No implementation is proposed here** — this is the
order in which the *gaps* should be closed.

**Phase 1 — Decisions (blocks everything)**
1. Resolve `B-01` member scope, `B-02` auth model, `B-03` branch scoping
2. Resolve `B-04` five missing write paths and `B-05` membership states
3. Resolve `B-06` experiment numbering with the faculty

**Phase 2 — Close requirement gaps**
4. Author the second acceptance criterion (rejection path) for all 25 stories → `INC-01`
5. Quantify the 15 vague NFRs, recording each threshold as an assumption → `AMB-06`
6. Define field-level validation rules → `INC-05`
7. Define currency/tax and due-date/grace-period models → `INC-06`
8. Write the project Constraints list and Definition of Done → `INC-02`

**Phase 3 — Missing Lab 1 artefacts**
9. Problem statement, scope, feasibility, development plan, process-model selection → `INC-10`

**Phase 4 — Modelling** (each now has sufficient input)
10. Data model → class diagram · membership state machine → state chart ·
    use cases → sequence & collaboration · DFD L0/L1/L2

**Phase 5 — Build and verify**
11. Implementation against the design system, then test cases in the `[EXP9]` 9-field format,
    then bug-tracking and sprint artefacts

---

## 12. What is *strong* in these requirements

Recorded for balance — the gaps above should not obscure genuine quality.

| Strength | Evidence |
|---|---|
| **Complete three-way traceability** | 25/25 stories map to an FR, an NFR **and** a homepage bullet — 100 %, verified by coordinate extraction, not inference |
| **Clean departmental symmetry** | Exactly 5 stories × 5 departments; every department carries an Availability NFR; the homepage's `05` / `25` / `5 stories` counters corroborate independently |
| **Correct agile form** | 24/25 stories follow the `[EXP1]` template; 25/25 criteria are well-formed Given/When/Then |
| **Genuine cross-department thinking** | Four criteria deliberately cross module boundaries (receipt↔payment, renewal↔payment, dashboard↔all, overdue↔plans) — a real workflow, not five silos |
| **Coherent NFR spread** | Eight quality attributes across five departments, with a discernible implicit budget (interactive 2–3 s, reports 5 s) |
| **A design that already exceeds its requirements** | `[HTML]` ships AAA contrast, `:focus-visible`, `prefers-reduced-motion` and `aria-hidden` decoration — none of which any NFR demanded |
| **A defined end-to-end workflow** | The homepage workflow strip supplies the one artefact the labs lack: a member journey across all five departments |

---

## 13. Cross-references

| Document | Contents |
|---|---|
| `docs/project/REFERENCE_ANALYSIS.md` | Full extraction — all 18 requested categories, with sources |
| `docs/requirements/LAB1_TRACEABILITY_MATRIX.md` | 25 stories → criteria → FRs → NFRs → homepage evidence |
| `docs/requirements/LAB2_NFR_TRACEABILITY.md` | 25 NFRs — category, measurability, verification method, blockers |
| `docs/ui/DESIGN_SYSTEM.md` | Token-level extraction of the homepage source of truth |

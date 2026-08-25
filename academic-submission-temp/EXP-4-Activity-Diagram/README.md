# EXPERIMENT 4 — Activity Diagram (IRONBOARD Gym Management System)

> **Temporary academic submission artifact.**
> This directory is a temporary academic submission artifact only. It is **NOT** part of the
> Ironboard production architecture, and it must **NOT** be treated as a source of truth for
> any future implementation, design decision, roadmap or development phase.

| Item | Value |
|---|---|
| Experiment number | **Experiment No. 4** |
| Experiment title | Activity Diagram |
| Case study | **IRONBOARD — Gym Management System** |
| Academic source document | `reference/experiments/EXP-4-ACTIVITY.docx` |
| Supporting reference documents | `reference/lab1/I025_Dhrupad Gupta_SE_LAB_1 (1).pdf` (functional user stories), `reference/lab2/I025_Dhrupad Gupta_SE_Lab2.pdf` (non-functional requirements), `reference/design/gym-management-homepage-2.html` (case-study framing, department names, member journey), `reference/experiments/EXP-3-USE CASE.docx` (scenario-based modeling / actors), `reference/course-policy/Software-engg-Course Policy_version1-26=27.pdf` (CO-3: apply UML concepts for modeling software functionality) |
| Date of generation | **25 August 2026** |
| Status | **Temporary — academic submission only** |

---

## 1. Required output, as stated by the academic source

`reference/experiments/EXP-4-ACTIVITY.docx` states verbatim:

- **Aim:** "To create Activity Diagram for `<case study name>`"
- **Outcome:** "Understand the various activities in the system to be developed." /
  "Identify the actors who would be performing these activities."
- **Procedure:**
  1. "Analyze the system to find out the various activities."
  2. "List down the set of activities and the various Actors in the system who would be performing those set of activities."
  3. "Draw a Activity diagram showing all the activities."
- **Output:** "A Activity diagram for the System."

The same document requires that, before drawing, four things are identified —
**Activities, Association, Conditions, Constraints** — and it states that an activity diagram
(unlike a flow chart) must show "different flow like parallel, branched, concurrent and single"
and may use "branching, parallel flow, swimlane". The worked example inside the document
(order management system) uses: filled start circle, rounded activity nodes, decision diamonds
with the condition written in square brackets, and encircled-dot termination nodes.

## 2. What this diagram represents

A single, system-level workflow of the Ironboard Gym Management System:
**"Member Enrolment, Training and Renewal"** — the end-to-end journey a walk-in prospect
follows through every department of the system, from enquiry through registration, plan
selection, payment, training and progress tracking, up to renewal or cancellation.

This workflow was chosen because `reference/design/gym-management-homepage-2.html`
("How it flows — From walk-in to renewal") documents exactly this journey as the case study's
own cross-department flow: *Reception → Membership → Trainer → Accounting → Admin*. Every
activity in the diagram is traceable to a user story in Lab 1.

### Actors (swimlanes)

Taken from the five departments in Lab 1 / the case-study material, plus the external actor:

| Swimlane (actor) | Source |
|---|---|
| Prospect / Member | Lab 1 — the person being registered, paying, training and renewing |
| Reception | Lab 1 §1 "Reception" (5 user stories) |
| Membership Management | Lab 1 §4 "Membership Management" (5 user stories) |
| Accounting | Lab 1 §5 "Accounting" (5 user stories) |
| Trainer | Lab 1 §2 "Trainer Department" (5 user stories) |
| Administration | Lab 1 §3 "Administration" (5 user stories) |

### Activities included (traceability to Lab 1 user stories)

| Activity in diagram | Lab 1 user story |
|---|---|
| Check open trial slots / Reserve trial session slot / Send trial confirmation | Reception — "schedule trial sessions" (Story 3) |
| Enter member details / Validate submitted member details / Create member profile and generate Member ID / Send welcome e-mail | Reception — "register new members" (Story 1) |
| Validate + re-verify member details loop | Reception — "verify member details" (Story 2) |
| Print payment receipt | Reception — "print payment receipts" (Story 4) |
| Record attendance at entrance / Monitor daily attendance and peak hours | Reception "check member attendance" (Story 5); Administration "monitor daily gym attendance" (Story 4) |
| Display published membership plans | Membership Mgmt — "create membership plans" (Story 1) |
| Create membership record / Activate membership and set expiry date | Membership Mgmt — Stories 1 & 3 |
| Track membership status | Membership Mgmt — "track membership status" (Story 5) |
| Queue renewal reminder / Send renewal reminder (e-mail / SMS) | Membership Mgmt — "send renewal reminders" (Story 4) |
| Extend expiry date and restore gym access | Membership Mgmt — "renew memberships" (Story 3) |
| Set membership status to Cancelled and stop access | Membership Mgmt — "cancel the inactive memberships" (Story 2) |
| Collect membership payment / Collect renewal payment and issue receipt / Clear the outstanding balance | Accounting — "collect membership payments" (Story 1) |
| Generate invoice (PDF) / E-mail invoice to the member | Accounting — "generate invoices" (Story 2) |
| Record balance in the overdue payments list / Send payment notice | Accounting — "track overdue payments" (Story 5) |
| Process refund and log the transaction | Accounting — "process refunds" (Story 4) |
| Include payment in / Reconcile closure in the revenue report | Accounting — "revenue reports" (Story 3) |
| Open the member profile / Display medical alert before workout is set | Trainer — "view member medical restrictions" (Story 5) |
| Assign workout plan and link it to the profile | Trainer — "assign workout plans" (Story 1) |
| Schedule personal training session | Trainer — "schedule personal training sessions" (Story 3) |
| Record member progress (weight, measurements) | Trainer — "record member progress" (Story 2) |
| Update exercise routine (sets, reps, exercises) | Trainer — "update exercise routines" (Story 4) |
| Log the transaction in / Update the department activity monitor | Administration — "monitor all department activities" (Story 5) |

### Conditions / guards (branching)

All guards are written in square brackets as in the source document's example:

- `[Trial session requested?]` — yes / no
- `[Trial slot available?]` — yes / no
- `[Details valid and complete?]` — yes / no (re-verify loop, from Reception Story 2)
- `[Payment successful?]` — yes / no (from Accounting Story 1 and Story 5)
- `[Medical restriction logged?]` — yes / no (from Trainer Story 5)
- `[Progress meets the target?]` — yes / no (from Trainer Stories 2 & 4)
- `[Membership expiring within 7 days?]` — yes / no, still active (from Membership Story 4: "expiring soon (e.g., in 7 days)")
- `[Renewal payment completed?]` — yes / no (from Membership Story 3 and Story 2)
- `[Approved refund request?]` — yes / no (from Accounting Story 4)

### Parallel / concurrent flow (fork and join)

1. **After payment is cleared** — four concurrent branches: invoice generation and e-mailing
   (Accounting), receipt printing (Reception), membership activation and reminder queueing
   (Membership Management), and transaction logging (Administration).
2. **After the member checks in** — two concurrent branches: attendance recording and
   monitoring (Administration) alongside progress recording and routine updating (Trainer).

### Constraints represented

Derived from Lab 2's non-functional requirements / constraints (kept as guards or activity
text rather than free notes): the 7-day renewal-reminder window, validation of member details
before saving (data integrity), and medical information being shown only to the trainer who
opens the member profile (security).

### UML elements used

Filled circle (start) · rounded rectangles (activities) · diamonds with bracketed guards
(decision / merge) · thick bars (fork / join for concurrent flow) · swimlanes (actors) ·
encircled dot (termination — three terminations: payment not completed, membership renewed,
membership closed) · one explanatory note on the concurrent region · notation legend.

## 3. Assumptions (reference material was silent on these)

1. **Choice of workflow.** `EXP-4-ACTIVITY.docx` writes the aim against
   `<case study name>` and does not name a workflow, so a coherent system-level workflow was
   chosen: the walk-in-to-renewal member journey documented in
   `reference/design/gym-management-homepage-2.html`.
2. **Single-diagram scope.** Two Ironboard workflows that are not part of the member journey —
   staff-account approval and gym-branch management (Administration Stories 1 & 2) and
   equipment maintenance scheduling (Administration Story 3) — are **not** drawn here, because
   the source asks for "a Activity diagram for the System" (one diagram) and including
   unrelated administrative flows would make it two disjoint graphs. Administration still
   appears as a swimlane through attendance monitoring and department-activity monitoring.
3. **Medical details captured at registration.** Lab 1 says a trainer views restrictions
   "given a member has a health condition logged" but never says who logs it; the diagram has
   Reception log declared medical restrictions during registration.
4. **Failed first payment terminates the enrolment run.** Lab 1 does not define a retry
   policy, so an unsuccessful payment holds the membership as *Pending*, records the overdue
   balance and sends a payment notice, and the flow terminates rather than looping.
5. **Notation.** UML 2.x activity-diagram notation as used by the example image inside
   `EXP-4-ACTIVITY.docx`. Swimlane colours are cosmetic only.

## 4. Files

| File | Description |
|---|---|
| `activity-diagram.puml` | PlantUML source (UML activity diagram with swimlanes) |
| `activity-diagram.png` | Rendered diagram, 3541 × 4100 px |
| `README.md` | This file |

### Re-rendering

```bash
java -DPLANTUML_LIMIT_SIZE=20000 -jar plantuml.jar -tpng activity-diagram.puml
```

Rendered with PlantUML 1.2025.4 and Graphviz 2.43.0. The PNG was visually inspected after
rendering for overlapping elements, clipped labels, unreadable text and broken flows.

---

**Temporary academic submission artifact — Experiment 4. Generated 25 August 2026.
Not production documentation. Not an implementation source of truth.**

# Ironboard — Reference Analysis

**Status:** Analysis only. No application code has been written.
**Date of analysis:** 2026-08-16
**Analyst:** Claude Code
**Scope:** Complete extraction of requirements from `reference/` (read-only), plus `CLAUDE.md` and `.claude/`.

---

## 0. How to read this document

### 0.1 Source document codes

Every extracted item carries a source code. Nothing in this document is asserted
without one.

| Code | Document | Path |
|---|---|---|
| `[LAB1]` | Student Lab 1 submission — *I025 Dhrupad Gupta, SE Lab 1* | `reference/lab1/I025_Dhrupad Gupta_SE_LAB_1 (1).pdf` |
| `[LAB2]` | Student Lab 2 submission — *I025 Dhrupad Gupta, SE Lab 2* | `reference/lab2/I025_Dhrupad Gupta_SE_Lab2.pdf` |
| `[EXP1]` | Experiment 1 handout — Agile Requirements (Functional) | `reference/experiments/SE_LAB_1_new.docx` |
| `[EXP2]` | Experiment 2 handout — Agile Requirements (Non-Functional) | `reference/experiments/EXP-2-SE.docx` |
| `[EXP3]` | Experiment 3 handout — Use Case Diagram | `reference/experiments/EXP-3-USE CASE.docx` |
| `[EXP4]` | Experiment 4 handout — Activity Diagram | `reference/experiments/EXP-4-ACTIVITY.docx` |
| `[EXP5]` | Experiment 5 handout — Class Diagram | `reference/experiments/EXP-5-CLASS.docx` |
| `[EXP6]` | Experiment 6 handout — Sequence Diagram | `reference/experiments/LAB-6-Sequence diagram.docx` |
| `[EXP7]` | Experiment 7 handout — Collaboration Diagram | `reference/experiments/EXP-7-COLLAB.docx` |
| `[EXP8]` | DFD handout (filename says 8, heading says "PRACTICAL 9") | `reference/experiments/PRACTICAL 8-DFD.docx` |
| `[EXP9]` | Experiment 9 handout — Testing | `reference/experiments/EXP-9-TESTING.docx` |
| `[POL]` | Software Engineering Course Policy v1, AY 2026-27 | `reference/course-policy/Software-engg-Course Policy_version1-26=27.pdf` |
| `[SYL]` | B Tech / MBA Tech IT Sem V AY 2026-27 Compiled Syllabus | `reference/syllabus/B Tech_MBA Tech IT Sem V AY 2026-27 Syllabus Compiled.pdf` |
| `[HTML]` | Supplied homepage — visual source of truth | `reference/design/gym-management-homepage-2.html` |

### 0.2 Critical distinction — handout theory vs. project requirements

The experiment handouts (`[EXP1]`–`[EXP9]`) are **generic course material**. They contain
worked examples about ATMs, e-commerce sites, credit cards, order management and payroll.
**Those examples are not Ironboard requirements.** They are recorded in this document only
where they define a *deliverable obligation* (e.g. "Output: A Use case diagram for the System").

Only `[LAB1]` Part B, `[LAB2]` Part B and `[HTML]` contain actual Ironboard product content.

### 0.3 Confidence markers

- **STATED** — written verbatim in a source document.
- **DERIVED** — a direct, mechanical consequence of stated text (e.g. counting stories).
- **IMPLIED** — strongly suggested but never stated; always cross-listed as an assumption.
- **NOT PRESENT** — explicitly absent; recorded so it is never mistaken for a requirement.

---

## 1. Project identity

| Attribute | Value | Source | Confidence |
|---|---|---|---|
| Product name | **IRONBOARD** | `[HTML]` `<title>`, `.logo`, footer | STATED |
| Product descriptor | "Gym Management System" | `[HTML]` `<title>`, footer `© 2026 Ironboard Gym Management System` | STATED |
| Positioning line | "Gym Operations Platform" | `[HTML]` `.eyebrow` | STATED |
| Domain | Gym / fitness centre operations | `[LAB1]`, `[LAB2]`, `[HTML]` | STATED |
| Student | Dhrupad Gupta, Roll I025, MBA Tech IT, Batch A1 | `[LAB1]` p.5 | STATED |
| Lab 1 performed / submitted | 21/07/26 (both dates identical) | `[LAB1]` p.5 | STATED |
| Course | Software Engineering | `[POL]`, `[SYL]` | STATED |
| Course code | `702IT0C041` | `[SYL]` | STATED |
| Faculty | Prof. Dharmesh Rathod | `[POL]` p.1 | STATED |

> **Note:** the name "Ironboard" appears **only** in `[HTML]`. Neither `[LAB1]` nor `[LAB2]`
> names the product in extractable text. See Ambiguity **AMB-01**.

---

## 2. Actors

### 2.1 Primary actors — story owners

These five are the actors that own user stories in `[LAB1]` Part B.

| ID | Actor | Department | Stories owned | Source |
|---|---|---|---|---|
| `ACT-01` | **Receptionist** | Reception | US-01 … US-05 | `[LAB1]` p.5 §1 — STATED |
| `ACT-02` | **Trainer** | Trainer Department | US-06 … US-10 | `[LAB1]` p.5 §2 — STATED |
| `ACT-03` | **Administrator** | Administration | US-11 … US-15 | `[LAB1]` p.5 §3 — STATED |
| `ACT-04` | **Membership Manager** | Membership Management | US-16 … US-20 | `[LAB1]` p.5 §4 — STATED |
| `ACT-05` | **Accounting Executive** | Accounting | US-21 … US-25 | `[LAB1]` p.5 §5 — STATED |

`[LAB2]` FR/NFR table adds a sixth phrasing — "authorized trainers", "authorized staff",
"administrators" — but introduces no new role. NFR-10 ("Only administrators should be able to
approve staff accounts") reconfirms `ACT-03`.

### 2.2 Secondary actors — referenced but own no stories

These appear inside acceptance criteria as recipients or triggers. **No source document
grants them a login, a screen, or a story.**

| ID | Actor | Where referenced | Source | Confidence |
|---|---|---|---|---|
| `ACT-06` | **Member** | Receives welcome email (AC-01), notified of plan (AC-06), notified of routine change (AC-09), added to calendar (AC-08), emailed invoice (AC-22), emailed/SMS reminder (AC-19), refunded (AC-24) | `[LAB1]` pp.6–9 | IMPLIED |
| `ACT-07` | **Prospect / potential customer** | "a potential customer's details", receives trial confirmation | `[LAB1]` AC-03 | IMPLIED |
| `ACT-08` | **Staff applicant** | "Given a new staff member registers for access" | `[LAB1]` AC-11 | IMPLIED |
| `ACT-09` | **System / automated scheduler** | "When the automated system checks expiring plans" | `[LAB1]` AC-19 | IMPLIED |
| `ACT-10` | **Entrance check-in device** | "Given check-in data is recorded at the entrance" | `[LAB1]` AC-14 | IMPLIED |

> **Critical:** whether `ACT-06` (Member) can *log in* is **NOT PRESENT** in any source.
> `[HTML]` shows a "Sign in" button but its `href` is `#`. See **AMB-02**.

---

## 3. Departments / modules

Five departments, confirmed consistently across three independent sources.

| ID | Department | `[LAB1]` heading | `[HTML]` card | `[HTML]` footer | Stories |
|---|---|---|---|---|---|
| `D01` | **Reception** | "1)Reception :" | `Dept / 01` — "Reception" | "Reception" | 5 |
| `D02` | **Trainer Department** | "2) Trainer Department" | `Dept / 02` — "Trainer Dept." | "Trainer" | 5 |
| `D03` | **Administration** | "3) Administration" | `Dept / 03` — "Administration" | "Administration" | 5 |
| `D04` | **Membership Management** | "4) Membership Management:" | `Dept / 04` — "Membership Mgmt." | "Membership" | 5 |
| `D05` | **Accounting** | "5) Accounting:" | `Dept / 05` — "Accounting" | "Accounting" | 5 |

Corroborating counts from `[HTML]`:
- Hero stat: `05` / "Core departments" — **STATED**
- Hero stat: `25` / "Tracked user stories" — **STATED**
- Hero stat: `01` / "Shared source of truth" — **STATED**
- Each `.card-count` badge reads `5 stories` — **STATED** (5 × 5 = 25 ✓)
- Footer: "Built on the reception, trainer, admin, membership & accounting modules" — **STATED**

The word **"modules"** for these five units is used only in the `[HTML]` footer.

---

## 4. Functional requirements

25 functional requirements. Derived by pairing `[LAB1]` user stories (the "what") with the
`[LAB2]` FR column (the canonical short-form label). The `[LAB2]` FR labels were verified
**by PDF text coordinates**, not reading order — every FR/NFR row shares an identical
y-coordinate, so the 25 pairings below are exact, not inferred.

| ID | Functional requirement (`[LAB2]` label, verbatim) | Dept | Actor | Story | NFR |
|---|---|---|---|---|---|
| `FR-REC-01` | Register new members | D01 | ACT-01 | US-01 | NFR-01 |
| `FR-REC-02` | Verify member details | D01 | ACT-01 | US-02 | NFR-02 |
| `FR-REC-03` | Schedule trial sessions | D01 | ACT-01 | US-03 | NFR-03 |
| `FR-REC-04` | Print payment receipts | D01 | ACT-01 | US-04 | NFR-04 |
| `FR-REC-05` | Check member attendance | D01 | ACT-01 | US-05 | NFR-05 |
| `FR-TRN-01` | Assign workout plans | D02 | ACT-02 | US-06 | NFR-06 |
| `FR-TRN-02` | Record member progress | D02 | ACT-02 | US-07 | NFR-07 |
| `FR-TRN-03` | Schedule personal training sessions | D02 | ACT-02 | US-08 | NFR-08 |
| `FR-TRN-04` | Update exercise routines | D02 | ACT-02 | US-09 | NFR-09 |
| `FR-TRN-05` | View member medical restrictions | D02 | ACT-02 | US-10 | NFR-10 |
| `FR-ADM-01` | Approve new staff accounts | D03 | ACT-03 | US-11 | NFR-11 |
| `FR-ADM-02` | Manage gym branches | D03 | ACT-03 | US-12 | NFR-12 |
| `FR-ADM-03` | Maintain equipment schedules | D03 | ACT-03 | US-13 | NFR-13 |
| `FR-ADM-04` | Monitor daily gym attendance | D03 | ACT-03 | US-14 | NFR-14 |
| `FR-ADM-05` | Monitor department activities | D03 | ACT-03 | US-15 | NFR-15 |
| `FR-MEM-01` | Create membership plans | D04 | ACT-04 | US-16 | NFR-16 |
| `FR-MEM-02` | Cancel inactive memberships | D04 | ACT-04 | US-17 | NFR-17 |
| `FR-MEM-03` | Renew memberships | D04 | ACT-04 | US-18 | NFR-18 |
| `FR-MEM-04` | Send renewal reminders | D04 | ACT-04 | US-19 | NFR-19 |
| `FR-MEM-05` | Track membership status | D04 | ACT-04 | US-20 | NFR-20 |
| `FR-ACC-01` | Collect membership payments | D05 | ACT-05 | US-21 | NFR-21 |
| `FR-ACC-02` | Generate invoices | D05 | ACT-05 | US-22 | NFR-22 |
| `FR-ACC-03` | Review revenue reports | D05 | ACT-05 | US-23 | NFR-23 |
| `FR-ACC-04` | Process refunds | D05 | ACT-05 | US-24 | NFR-24 |
| `FR-ACC-05` | Track overdue payments | D05 | ACT-05 | US-25 | NFR-25 |

**Source:** `[LAB2]` pp.6–7 (FR column) cross-referenced to `[LAB1]` pp.5–9.

> **Conflict CON-04:** `FR-ACC-03` is called **"Review revenue reports"** in `[LAB2]`,
> **"Generate Revenue Reports"** in `[LAB1]` AC-23, and **"Produce revenue reports"**
> in `[HTML]`. Three different verbs for one requirement. Not reconciled here.

### 4.1 Sub-behaviours stated inside acceptance criteria

These are additional functional obligations that appear only inside Given/When/Then text.
They are not listed as FRs in `[LAB2]` but are stated behaviour.

| ID | Behaviour | Source |
|---|---|---|
| `FR-SUB-01` | Generate a Member ID on registration | `[LAB1]` AC-01 |
| `FR-SUB-02` | Send a welcome email on registration | `[LAB1]` AC-01 |
| `FR-SUB-03` | Show a success message on member detail update | `[LAB1]` AC-02 |
| `FR-SUB-04` | Send trial-booking confirmation to the customer | `[LAB1]` AC-03 |
| `FR-SUB-05` | Filter attendance by date or by inactive members | `[LAB1]` AC-05 |
| `FR-SUB-06` | Show total visits + list of members who haven't visited recently | `[LAB1]` AC-05 |
| `FR-SUB-07` | Update a progress chart when measurements are logged | `[LAB1]` AC-07 |
| `FR-SUB-08` | Add booked PT session to **both** trainer and member calendars | `[LAB1]` AC-08 |
| `FR-SUB-09` | Display a medical alert *before* workouts are set | `[LAB1]` AC-10 |
| `FR-SUB-10` | Send login details on staff approval | `[LAB1]` AC-11 |
| `FR-SUB-11` | Add / update / **disable** a branch | `[LAB1]` AC-12 |
| `FR-SUB-12` | Recurring service schedule (example given: every 3 months) | `[LAB1]` AC-13 |
| `FR-SUB-13` | Mark machine "In Maintenance" during service | `[LAB1]` AC-13 |
| `FR-SUB-14` | Display peak busy hours | `[LAB1]` AC-14 |
| `FR-SUB-15` | Plan carries price, duration and access rules; publish action | `[LAB1]` AC-16 |
| `FR-SUB-16` | Cancellation sets status "Cancelled" **and stops gym access** | `[LAB1]` AC-17 |
| `FR-SUB-17` | Renewal extends expiry date **and restores gym access** | `[LAB1]` AC-18 |
| `FR-SUB-18` | Reminder sent by email **or SMS** (example threshold: 7 days) | `[LAB1]` AC-19 |
| `FR-SUB-19` | Filter member directory by "Active" / "Expired" | `[LAB1]` AC-20 |
| `FR-SUB-20` | Accept payment via **cash, card, or online** | `[LAB1]` AC-21 |
| `FR-SUB-21` | Create a **PDF** invoice and email it | `[LAB1]` AC-22 |
| `FR-SUB-22` | Billing triggers automatically **or** is run manually | `[LAB1]` AC-22 |
| `FR-SUB-23` | Revenue report by date range: total income, refunds, pending payments | `[LAB1]` AC-23 |
| `FR-SUB-24` | Refund requires prior approval; log the transaction | `[LAB1]` AC-24 |
| `FR-SUB-25` | Offer option to send payment notices on overdue accounts | `[LAB1]` AC-25 |

### 4.2 Feature statements from the homepage

`[HTML]` `#features` section names six platform features. These are **marketing copy**, not
a numbered requirement list, but they restate and in places extend the FRs.

| ID | Feature | Copy | Extends? |
|---|---|---|---|
| `FEA-01` | Member profiles | "One record per member — contact details, plan, attendance and medical notes, **visible to the right roles only**" | Adds role-based visibility (aligns NFR-10) |
| `FEA-02` | Session scheduling | "Trials and personal training sessions booked against **real-time slot availability**" | Adds real-time availability |
| `FEA-03` | Progress tracking | "Weight, measurements and workout history **charted automatically**" | Confirms FR-SUB-07 |
| `FEA-04` | Billing & invoicing | "Receipts, invoices, refunds and overdue balances handled without leaving the platform" | Confirms D05 |
| `FEA-05` | Branch oversight | "Attendance, equipment schedules and staff accounts monitored across every location" | Confirms D03 |
| `FEA-06` | Renewal alerts | "Expiring memberships flagged early, with reminders sent before members lapse" | Confirms FR-MEM-04 |

---

## 5. Lab 1 user stories (all 25, verbatim)

Full verbatim text with source typography preserved (`[sic]` marks defects that are
carried forward as ambiguities). **Source: `[LAB1]` p.5.**

### D01 — Reception
1. `US-01` — "As a receptionist, I want to register new members so they can access new gym services."
2. `US-02` — "As a receptionist, I want to verify member details so they can be accurate ." *(trailing space [sic])*
3. `US-03` — "As a receptionist, I want to schedule trials session so new potential customers can become members ." *("trials session" [sic])*
4. `US-04` — "As a receptionist, I want to print payment receipts so that members receive confirmation of they membership." *("of they membership" [sic])*
5. `US-05` — "As a receptionist, I want to check the members attendance so I can follow up to them."

### D02 — Trainer Department
6. `US-06` — "As a trainer, I want to assign workout plans so that members achieve their fitness goals."
7. `US-07` — "As a trainer, I want to record member progress so that improvements can be monitored."
8. `US-08` — "As a trainer, I want to schedule personal training sessions so that members receive guidance."
9. `US-09` — "As a trainer, I want to update exercise routines so that workouts remain effective."
10. `US-10` — "As a trainer, I want to view member medical restrictions so that training is safe."

### D03 — Administration
11. `US-11` — "As an administrator, I want to approve new staff accounts so that only authorized employees can access the system."
12. `US-12` — "As an administrator, I want to manage gym branches so that all locations can be monitored from one system."
13. `US-13` — "As an administrator, I want to maintain equipment maintenance schedules so that all machines remain operational."
14. `US-14` — "As an administrator, I want to monitor daily gym attendance so that I can analyze member activity."
15. `US-15` — "As an administrator, I want to monitor all department activities so that the gym operates efficiently."

### D04 — Membership Management
16. `US-16` — "As a membership manager, I want to create membership plans so that the customer can choose suitable packages."
17. `US-17` — "As a membership manager, I want to cancel the inactive memberships so the accounts are updated."
18. `US-18` — "As a membership manager, I want to renew memberships so that members can have uninterrupted access."
19. `US-19` — "As a membership manager, I want to sent renewal reminders so that the members renew on time." *("sent" [sic])*
20. `US-20` — "As a membership manager, I want to track membership status so that I know active and expired members."

### D05 — Accounting
21. `US-21` — "As an accounting executive, I want to collect membership payments so that accounts remain updated."
22. `US-22` — "As an accounting executive, I want to generate invoices so that members receive payment records."
23. `US-23` — "As an accounting executive, I want to revenue reports so that business performance can be analyzed.," *(**missing verb** [sic]; trailing ".," [sic])*
24. `US-24` — "As an accounting executive, I want to process refunds so that payment issues are resolved."
25. `US-25` — "As an accounting executive, I want to track overdue paymentsso that pending dues are collected." *("paymentsso" [sic])*

**Format compliance:** all 25 follow the `[EXP1]` template
*"As a &lt;type of user&gt;, I want &lt;to perform some task&gt; so that I can &lt;achieve some
goal/benefit/value&gt;"* except `US-23`, which omits the task verb.

---

## 6. Lab 1 acceptance criteria (all 25)

`[LAB1]` p.5 heading reads **"Accepatnce 1:"** `[sic]` — one criterion per story. All follow
Given / When / Then. **Source: `[LAB1]` pp.5–9.**

| AC | Given | When | Then |
|---|---|---|---|
| `AC-01` | valid member info (Name, Email, Phone) is entered | the receptionist submits the form | create the profile, generate a Member ID, and send a welcome email |
| `AC-02` | a member provides their Name or ID | the receptionist updates any outdated info and saves | update the profile instantly and show a success message |
| `AC-03` | an open time slot and a potential customer's details | the receptionist books the slot | reserve the trial session and send a confirmation to the customer |
| `AC-04` | a payment is successful | the receptionist clicks "Print Receipt" | print a receipt with the payment details |
| `AC-05` | the reception attendance page is open | filtering by date or inactive members | show total visits and a list of members who haven't visited recently |
| `AC-06` | a trainer selects a member's profile | the trainer chooses or creates a workout plan and saves | link the plan to the member's profile and notify them |
| `AC-07` | a member completes a progress test | the trainer logs weight or measurements | save the data and update the progress chart |
| `AC-08` | both trainer and member are free at a specific time | the trainer books the session date and time | reserve the slot and add it to both calendars |
| `AC-09` | a member already has a workout plan | the trainer changes any exercises, sets, or reps | update the plan and inform the member |
| `AC-10` | a member has a health condition logged | the trainer opens the member's profile | display a clear medical alert before workouts are set |
| `AC-11` | a new staff member registers for access | the admin reviews and clicks "Approve" | activate the account and send login details |
| `AC-12` | the admin is on the branch management page | the admin adds, updates, or disables a branch | update the system records for that location |
| `AC-13` | a machine needs regular service | the admin sets a recurring service schedule (e.g., every 3 months) | set reminders and mark the machine "In Maintenance" during service |
| `AC-14` | check-in data is recorded at the entrance | the admin views the daily attendance page | display total visits and peak busy hours |
| `AC-15` | the admin dashboard is open | the admin checks system activities | show summary updates from all departments |
| `AC-16` | price, duration, and access rules are entered | the manager saves and publishes the plan | show the plan as available for purchase |
| `AC-17` | a membership has expired or a cancellation request is made | the manager confirms cancellation | set status to "Cancelled" and stop gym access |
| `AC-18` | an expiring or expired profile | a renewal payment is completed | extend the expiry date and restore gym access |
| `AC-19` | a membership is expiring soon (e.g., in 7 days) | the automated system checks expiring plans | send a reminder email or SMS to the member |
| `AC-20` | the member directory list | filtering by "Active" or "Expired" | display the matching list of members |
| `AC-21` | a member has a balance due | payment is made via cash, card, or online | clear the balance and issue a receipt |
| `AC-22` | a payment or subscription charge | billing triggers or is run manually | create a PDF invoice and email it to the member |
| `AC-23` | system transaction logs | the accountant selects a date range | show total income, refunds, and pending payments |
| `AC-24` | an approved refund request | the accountant enters the refund details | send funds back to the member and log the transaction |
| `AC-25` | members with late payments | opening the overdue accounts page | list unpaid balances and offer an option to send payment notices |

> **INC-01 — Incompleteness:** the heading "Accepatnce 1:" implies an *"Acceptance 2"*
> set that does **not exist** in the document. `[EXP1]` models **two** criteria per story
> (the ATM example gives Criterion 1 = happy path, Criterion 2 = rejection path).
> **Every negative / rejection path is therefore missing from `[LAB1]`.**

---

## 7. Lab 2 non-functional requirements (all 25)

**Source: `[LAB2]` pp.6–7, Part B FR/NFR table.** Verified by y-coordinate pairing.

| ID | Category | Non-functional requirement (verbatim) | Bound to FR | Quantified? |
|---|---|---|---|---|
| `NFR-01` | Performance | "Member registration should be completed within 3 seconds." | FR-REC-01 | ✅ 3 s |
| `NFR-02` | Data Integrity | "The system should validate all member information before saving." | FR-REC-02 | ❌ |
| `NFR-03` | Availability | "The scheduling system should be available 99.9% of the time." | FR-REC-03 | ✅ 99.9 % |
| `NFR-04` | Reliability | "Payment receipts should be generated accurately without errors." | FR-REC-04 | ❌ |
| `NFR-05` | Usability | "Attendance records should be easy to access and understand." | FR-REC-05 | ❌ |
| `NFR-06` | Performance | "Workout plans should load within 2 seconds." | FR-TRN-01 | ✅ 2 s |
| `NFR-07` | Reliability | "Member progress should be saved accurately without data loss." | FR-TRN-02 | ❌ |
| `NFR-08` | Availability | "Training schedules should always be accessible during working hours." | FR-TRN-03 | ❌ ("working hours" undefined) |
| `NFR-09` | Maintainability | "Exercise routines should be easy to update without affecting existing data." | FR-TRN-04 | ❌ |
| `NFR-10` | Security | "Medical information should only be accessible to authorized trainers." | FR-TRN-05 | ✅ (binary) |
| `NFR-11` | Security | "Only administrators should be able to approve staff accounts." | FR-ADM-01 | ✅ (binary) |
| `NFR-12` | Scalability | "The system should support multiple gym branches efficiently." | FR-ADM-02 | ❌ (no branch count) |
| `NFR-13` | Reliability | "Equipment maintenance records should never be lost." | FR-ADM-03 | ❌ (absolute, untestable) |
| `NFR-14` | Performance | "Attendance reports should be generated within 5 seconds." | FR-ADM-04 | ✅ 5 s |
| `NFR-15` | Availability | "The monitoring dashboard should be available 99.9% of the time." | FR-ADM-05 | ✅ 99.9 % |
| `NFR-16` | Usability | "Membership plans should be easy to create and modify." | FR-MEM-01 | ❌ |
| `NFR-17` | Data Integrity | "Only valid inactive memberships should be cancelled." | FR-MEM-02 | ❌ ("valid" undefined) |
| `NFR-18` | Performance | "Membership renewal should be completed within 2 seconds." | FR-MEM-03 | ✅ 2 s |
| `NFR-19` | Reliability | "Renewal reminders should be delivered successfully." | FR-MEM-04 | ❌ (no rate) |
| `NFR-20` | Availability | "Membership status should be available whenever requested." | FR-MEM-05 | ❌ |
| `NFR-21` | Security | "Payment information should be encrypted and accessible only to authorized staff." | FR-ACC-01 | ✅ (binary) |
| `NFR-22` | Reliability | "Invoices should be generated accurately every time." | FR-ACC-02 | ❌ |
| `NFR-23` | Performance | "Revenue reports should be generated within 5 seconds." | FR-ACC-03 | ✅ 5 s |
| `NFR-24` | Data Integrity | "Refund transactions should maintain accurate financial records." | FR-ACC-04 | ❌ |
| `NFR-25` | Availability | "Overdue payment information should be available whenever required." | FR-ACC-05 | ❌ |

### 7.1 NFR category distribution (DERIVED)

| Category | Count | IDs |
|---|---|---|
| Performance | 5 | NFR-01, 06, 14, 18, 23 |
| Availability | 5 | NFR-03, 08, 15, 20, 25 |
| Reliability | 5 | NFR-04, 07, 13, 19, 22 |
| Security | 3 | NFR-10, 11, 21 |
| Data Integrity | 3 | NFR-02, 17, 24 |
| Usability | 2 | NFR-05, 16 |
| Maintainability | 1 | NFR-09 |
| Scalability | 1 | NFR-12 |

**Only 10 of 25 NFRs (40 %) are quantified.** `[EXP2]` states directly:
*"If you cannot quantify the story in concrete terms, this should be a bad smell that usually
indicates a requirement that is too vague to be implemented."* The remaining 15 fail the
handout's own test. See **AMB-06**.

### 7.2 NFR categories taught but NOT used by `[LAB2]`

`[EXP2]` lists 14 elicitation aspects. `[LAB2]` uses 8. **NOT PRESENT** in `[LAB2]`:
Data Retention, Stability, Compliance, Recoverability, Serviceability, Capacity,
Accessibility, Confidentiality, Efficiency, Portability, Reusability.

> These are **not** Ironboard requirements. They are recorded only as a gap against the
> `[EXP2]` learning outcomes. Notably **Accessibility** is absent from `[LAB2]` even though
> `[HTML]` implements `prefers-reduced-motion`, `:focus-visible` and `aria-hidden`.

### 7.3 Constraints and Definition of Done — status

`[EXP2]` contains a **Constraints** table and a **Definition of Done** table. Both are
**generic handout samples** referring to credit-card masking, a `payment_preferences` log,
a 10-second inactivity logout, a wiki, and a QA integration environment.

**These are NOT Ironboard requirements.** `[LAB2]` did not produce a project-specific
Constraints list or Definition of Done. See **INC-02**.

---

## 8. Required workflows

### 8.1 Primary cross-department workflow — "From walk-in to renewal"

**Source: `[HTML]` `#workflow` section — STATED.** This is the only end-to-end workflow
defined anywhere in the reference material.

| Step | Department | Copy (verbatim) |
|---|---|---|
| 1 | **Reception** | "Prospect walks in, trials a session, and reception registers them with a Member ID." |
| 2 | **Membership** | "A plan is chosen and activated, with renewal reminders queued automatically." |
| 3 | **Trainer** | "A workout plan is assigned and progress is logged against the member's profile." |
| 4 | **Accounting** | "Payments are collected, invoiced, and reconciled against membership status." |
| 5 | **Admin** | "Attendance, staff and equipment are monitored across every branch, always." |

Supporting statement — `[HTML]` hero sub: *"Ironboard connects reception, training,
administration, membership and accounting into a single board — so no member, session or
payment falls through the cracks."*

> **Note:** the workflow strip order (Reception → **Membership** → **Trainer** → Accounting →
> Admin) differs from the department card order (Reception → **Trainer** → Administration →
> **Membership** → Accounting). This is intentional — cards are by department number, the
> strip is by journey sequence. Recorded so it is not "fixed" by mistake.

### 8.2 Workflows derivable from acceptance criteria

Each of `AC-01`…`AC-25` defines a single-actor workflow (precondition → action → outcome).
These 25 are the unit-level workflows. See `docs/requirements/LAB1_TRACEABILITY_MATRIX.md`.

### 8.3 Multi-step lifecycles implied across stories

| ID | Lifecycle | Composed of | Source |
|---|---|---|---|
| `WF-01` | **Member lifecycle** | trial (US-03) → register (US-01) → plan chosen (US-16) → active (US-20) → renew (US-18) / cancel (US-17) → expired | `[LAB1]`, `[HTML]` workflow |
| `WF-02` | **Membership status machine** | Active → Expiring (7d, AC-19) → Expired → Renewed / Cancelled | `[LAB1]` AC-17, AC-18, AC-19, AC-20 |
| `WF-03` | **Payment lifecycle** | balance due → payment (cash/card/online) → receipt → invoice → *(refund)* / *(overdue → notice)* | `[LAB1]` AC-21, 22, 24, 25 |
| `WF-04` | **Staff onboarding** | applicant registers → admin reviews → approve → activate + send login | `[LAB1]` AC-11 |
| `WF-05` | **Equipment maintenance** | schedule set → reminder → "In Maintenance" → operational | `[LAB1]` AC-13 |
| `WF-06` | **Training lifecycle** | plan assigned (US-06) → routine updated (US-09) → progress logged (US-07) → charted | `[LAB1]` AC-06, 07, 09 |
| `WF-07` | **Attendance capture** | entrance check-in → daily totals → peak hours → inactive-member follow-up | `[LAB1]` AC-05, AC-14 |

`WF-02` is the direct input for the **State Chart / State Transition diagram** required by
`[POL]` Lab 5 and Lab 6.

---

## 9. Required Software Engineering experiment deliverables

### 9.1 As defined by the Course Policy lab table

**Source: `[POL]` pp.11–13, "Laboratory details".** `[POL]` states:
*"The following **10 programming exercises** will form the submission for laboratory
coursework. Each programming exercise will contain 3 to 5 programs."*

| # | Week | Unit | CO | Deliverable (verbatim) |
|---|---|---|---|---|
| 1 | 1–2 | Unit-1 | CO1 | Literature survey; shortlist ≥5 case studies, select 1; scope. Then: 1. identify end user; 2. identify FRs; 3. identify NFRs; 4. identify feasibility; 5. finalize one problem of five; 6. frame final problem statement; 7. list user + system requirements; 8. **identify ambiguities, inconsistencies, incompleteness**; 9. list development plan |
| 2 | 3–4 | Unit-1 | CO2 | "Select appropriate Generic Process Model / Evolutionary process Model / Agile Model for your project." |
| 3 | 5 | Unit-2 | CO2 | "Design level-0 Data flow diagram, Design level-1 **and Level-2** Data flow diagram" |
| 4 | 6 | Unit-3 | CO2 | "Development of Use case diagram, Documentation of use cases. Activity Diagram" |
| 5 | 7 | Unit-4 | CO2 | "Design State chart diagram using case study's Control specifications. **Make use of Star UML software** for design" |
| 6 | 8 | Unit-4 | CO3 | "Design sequence diagram, class diagram and state transition diagram for selected problem" |
| 7 | 9–10 | Unit-5 | CO3 | "Design the appropriate user interface diagram for your project using **three golden rules**" |
| 8 | 11–12 | — | — | *Proposed* — **Task 8:** Bug Reporting with Bugzilla or Mantis; **Task 9:** Agile Sprint Execution with Burndown Chart |
| 9 | 13 | Unit-6 | CO4 | "**coding for your project** according to the designs analyzed in EXP.4,5" |
| 10 | 14 | Unit-7 | CO4 | "To Design Test Cases for **any two functionalities** of your project. The test case has to be designed for the case study selected in experiment 1." |

**Lab 8 detail — `[POL]` p.12–13, marked "Proposed":**

*Task 8 — Bug Reporting with Bugzilla or Mantis.* Aim: simulate a software QA process using a
bug tracking tool. Instructions: set up or use an online Bugzilla/Mantis instance; create
**3–5 sample bug reports** (severity, steps to reproduce, expected vs actual); assign bugs and
simulate the fixing lifecycle (**Open → In Progress → Resolved → Closed**).

*Task 9 — Agile Sprint Execution with Burndown Chart.* Aim: track sprint performance using
burndown charts. Instructions: create a sprint backlog with estimated story points; **use Jira**
to track task status daily; generate a burndown chart at end of sprint; analyze deviations from
expected progress.

### 9.2 As defined by the supplied experiment handouts

| Handout | Aim | Stated Output |
|---|---|---|
| `[EXP1]` | Identify functional requirements | Part B: "Document the User Stories of selected application." |
| `[EXP2]` | Identify non-functional requirements | Part B: "Create Document of NFR for your selected Software application." |
| `[EXP3]` | User's view analysis: Use case diagram | "Output: A Use case diagram for the System." |
| `[EXP4]` | Create Activity Diagram | "Output: A Activity diagram for the System." |
| `[EXP5]` | Create a Class Diagram | "Output: Class diagram for the system." |
| `[EXP6]` | Behavioral view: Sequence diagram | "Output: A Sequence diagram of the system." |
| `[EXP7]` | Behavioral view: Collaboration diagram | "Output: A Collaboration diagram for the system." |
| `[EXP8]` | Data flow diagram | "example Output: A data flow diagram of the system. Level 0" … "Level 1". PART-B: "**DEVELOP DFD LEVEL 0 AND LEVEL 1 FOR YOUR MINI PROJECT**" |
| `[EXP9]` | Testing techniques using a testing tool | "Output: Development of **upto four test cases** and their applied results on the system designed" |

> **CON-01 — Numbering conflict.** The handout numbering and the `[POL]` lab numbering
> are **irreconcilable**. See §14.

### 9.3 Completion status of the two supplied submissions

| Experiment | Deliverable | Status |
|---|---|---|
| Exp 1 | User stories | ✅ Delivered — 25 stories, `[LAB1]` |
| Exp 1 | Acceptance criteria | ⚠️ Partial — 25 criteria, only "Acceptance 1" set (see INC-01) |
| Exp 1 | Definition of Done | ❌ **NOT PRESENT** (required by `[EXP1]` learning outcome) |
| Exp 1 | Requirement version management | ❌ **NOT PRESENT** (`[EXP1]`: "Maintain different versions of requirement documents") |
| Exp 2 | NFR document | ✅ Delivered — 25 NFRs, `[LAB2]` |
| Exp 2 | NFRs written as **user stories** | ❌ **NOT PRESENT** — delivered as a table only (required by `[EXP2]` learning outcome) |
| Exp 2 | Project Constraints list | ❌ **NOT PRESENT** (see INC-02) |
| Exp 2 | Project Definition of Done | ❌ **NOT PRESENT** |
| Exp 2 | Design decisions for quality | ⚠️ Partial — homepage layout screenshots only |
| Exp 3–9 | All diagrams and test cases | ❌ **NOT PRESENT** — no submissions supplied in `reference/` |

---

## 10. Required diagrams

Consolidated from `[POL]`, `[SYL]` and `[EXP3]`–`[EXP8]`.

| ID | Diagram | Required by | Notes |
|---|---|---|---|
| `DIA-01` | **DFD Level 0** (context) | `[POL]` Lab 3; `[EXP8]` Part B | |
| `DIA-02` | **DFD Level 1** | `[POL]` Lab 3; `[EXP8]` Part B | |
| `DIA-03` | **DFD Level 2** | `[POL]` Lab 3 **only** | ⚠️ **CON-02** — `[EXP8]` Part B asks for Level 0 and 1 only |
| `DIA-04` | **Use Case diagram** | `[POL]` Lab 4; `[EXP3]`; `[SYL]` Unit 3 | Must show associations between use cases |
| `DIA-05` | **Use case documentation** (narrative/template) | `[POL]` Lab 4; `[EXP3]` | Written form, not a drawing |
| `DIA-06` | **Activity diagram** | `[POL]` Lab 4; `[EXP4]`; `[SYL]` Unit 3 | Must handle branch / parallel / concurrent flow, fork & join |
| `DIA-07` | **State Chart diagram** | `[POL]` Lab 5; `[SYL]` Unit 3 | From "case study's Control specifications"; **Star UML mandated** |
| `DIA-08` | **Sequence diagram** | `[POL]` Lab 6; `[EXP6]`; `[SYL]` Unit 3 | Lifelines, activation boxes, sync/async messages |
| `DIA-09` | **Class diagram** | `[POL]` Lab 6; `[EXP5]`; `[SYL]` Unit 3 | Classes, attributes, operations, relationships |
| `DIA-10` | **State transition diagram** | `[POL]` Lab 6 | ⚠️ **AMB-08** — same as DIA-07 or distinct? |
| `DIA-11` | **Collaboration diagram** | `[EXP7]`; `[SYL]` Unit 3 | ⚠️ **CON-03** — has a handout but **no `[POL]` lab slot** |
| `DIA-12` | **User Interface design diagram** | `[POL]` Lab 7; `[SYL]` Unit 6 | Must apply the **three golden rules** |
| `DIA-13` | **Control Flow Model / diagram** | `[SYL]` Unit 4; `[POL]` lecture 19 | ⚠️ Taught, but **no lab deliverable assigns it** |
| `DIA-14` | **Burndown chart** | `[POL]` Lab 8 Task 9 (*Proposed*) | Via Jira |
| `DIA-15` | **Architecture / component diagram** | `[SYL]` Unit 5 | ⚠️ Taught, **no lab deliverable** — do not treat as mandatory |

> `[EXP6]` procedure text also instructs *"Draw the collaboration diagram and State chart
> diagram as per the guidelines"* — copy-paste bleed from `[EXP7]`, since its stated Output is
> a Sequence diagram only. Recorded as **AMB-09**.

### 10.1 The "three golden rules" — content NOT PRESENT

`[POL]` Lab 7 and `[SYL]` Unit 6 both require UI design using the "three golden rules", but
**no supplied document enumerates them.** They come from the prescribed textbook
(Pressman, 9th ed.): *Place the user in control; Reduce the user's memory load; Make the
interface consistent.* Using them requires **ASM-09**.

---

## 11. Required testing activities

**Sources: `[EXP9]`, `[POL]` Lab 10, `[SYL]` Unit 7.**

### 11.1 Mandatory deliverable

| ID | Activity | Source | Detail |
|---|---|---|---|
| `TST-01` | Design test cases for **any two functionalities** | `[POL]` Lab 10 | Must be for the case study selected in experiment 1 |
| `TST-02` | Develop **up to four test cases** + applied results | `[EXP9]` Output | ⚠️ **CON-05** — "two functionalities" vs "upto four test cases" |
| `TST-03` | Identify modules testable stand-alone | `[EXP9]` Procedure step 1 | |
| `TST-04` | Identify module groups testable together | `[EXP9]` Procedure step 2 | |
| `TST-05` | Perform unit testing of modules | `[EXP9]` Procedure step 3 | |
| `TST-06` | Bug reporting: 3–5 bug reports, full lifecycle | `[POL]` Lab 8 Task 8 (*Proposed*) | Bugzilla or Mantis |

### 11.2 Mandatory test case format

**Source: `[EXP9]`, "Fields in test cases".** Every test case must carry these nine fields:

1. **Test case id**
2. **Unit to test** — "What to be verified?"
3. **Assumptions**
4. **Test data** — "Variables and their values"
5. **Steps to be executed**
6. **Expected result**
7. **Actual result**
8. **Pass/Fail**
9. **Comments**

### 11.3 Testing types named in the sources

`[EXP9]` lists ten: Unit, Integration, Functional, System, Stress, Performance, Usability,
Acceptance, Regression, Beta.
`[SYL]` Unit 7 narrows the examinable set to: **Verification & Validation, Unit, Integration,
System.**

> `[EXP9]` lists all ten as *"There are many types of testing like…"* — a taxonomy, **not** an
> instruction to perform all ten. Only `TST-01`…`TST-06` are deliverables.

### 11.4 Verification vs Validation (must be demonstrated — `[EXP9]` table)

| # | Verification | Validation |
|---|---|---|
| 1 | Are you building it right? | Are you building the right thing? |
| 2 | Ensure the software system meets all the functionality | Ensure functionalities meet the intended behavior |
| 3 | Takes place first; checks documentation, code etc. | Occurs after verification; checks the overall product |
| 4 | Done by developers | Done by Testers |
| 5 | Static activities — reviews, walkthroughs, inspections | Dynamic activities — executing software against requirements |
| 6 | Objective process | Subjective process |

### 11.5 Quality models named (`[SYL]` Unit 7)

McCall's Software Quality Factors; ISO 9126 Quality Factors; Process & Project Metrics;
Metrics for Software Quality; SQA Activities; CMMI. **Taught, not assigned as lab work.**

---

## 12. Required documentation deliverables

| ID | Document | Source | Status |
|---|---|---|---|
| `DOC-01` | User story document (25 stories) | `[EXP1]` Part B | ✅ `[LAB1]` |
| `DOC-02` | Acceptance criteria document | `[EXP1]` learning outcome | ⚠️ Partial |
| `DOC-03` | **Definition of Done** | `[EXP1]`, `[EXP2]` Step 2 | ❌ NOT PRESENT |
| `DOC-04` | **Versioned requirement documents** | `[EXP1]` LO 3 — "Maintain different versions of requirement documents" | ❌ NOT PRESENT |
| `DOC-05` | NFR document | `[EXP2]` Part B | ✅ `[LAB2]` |
| `DOC-06` | **Constraints list** (published, highly visible) | `[EXP2]` Step 2 | ❌ NOT PRESENT for project |
| `DOC-07` | Use case documentation | `[POL]` Lab 4; `[EXP3]` | ❌ NOT PRESENT |
| `DOC-08` | **Problem statement** (final, framed) | `[POL]` Lab 1 item 6 | ❌ NOT PRESENT |
| `DOC-09` | **Literature survey**, ≥5 case studies shortlisted → 1 | `[POL]` Lab 1 | ❌ NOT PRESENT |
| `DOC-10` | **Scope** of selected problem | `[POL]` Lab 1 | ❌ NOT PRESENT |
| `DOC-11` | **End user identification** | `[POL]` Lab 1 item 1 | ⚠️ Partial — actors inferable from `[LAB1]`, never stated as an end-user list |
| `DOC-12` | **Feasibility study** | `[POL]` Lab 1 item 4 | ❌ NOT PRESENT |
| `DOC-13` | **User requirements + system requirements** list | `[POL]` Lab 1 item 7 | ❌ NOT PRESENT (as a distinct artefact) |
| `DOC-14` | **Ambiguities / inconsistencies / incompleteness** analysis | `[POL]` Lab 1 item 8 | ➡️ **This document + `REQUIREMENT_GAP_ANALYSIS.md` satisfy it** |
| `DOC-15` | **Development plan** | `[POL]` Lab 1 item 9 | ❌ NOT PRESENT |
| `DOC-16` | **Process model selection + justification** | `[POL]` Lab 2 | ❌ NOT PRESENT |
| `DOC-17` | Test case documents (9-field format) | `[EXP9]`; `[POL]` Lab 10 | ❌ NOT PRESENT |
| `DOC-18` | Bug reports (3–5, full lifecycle) | `[POL]` Lab 8 Task 8 | ❌ NOT PRESENT |
| `DOC-19` | Sprint backlog + burndown analysis | `[POL]` Lab 8 Task 9 | ❌ NOT PRESENT |

---

## 13. UI / design requirements

Full token-level extraction lives in **`docs/ui/DESIGN_SYSTEM.md`**. Summary of obligations:

| ID | Requirement | Source |
|---|---|---|
| `UI-01` | The supplied homepage is the **visual source of truth**; do not redesign | User instruction |
| `UI-02` | Dark "ink" base `#0c0c09` with volt-green `#cbff3d` accent | `[HTML]` `:root` |
| `UI-03` | Type system: **Anton** (display), **Oswald** (body), **JetBrains Mono** (labels) | `[HTML]` font link |
| `UI-04` | Signature "locker board" department grid with hairline dividers | `[HTML]` `.board` / `.card` |
| `UI-05` | Horizontal workflow strip, 5 steps, horizontally scrollable | `[HTML]` `.flow` |
| `UI-06` | Reveal-on-scroll animation via IntersectionObserver | `[HTML]` `<script>` |
| `UI-07` | `prefers-reduced-motion` must disable reveal + smooth scroll | `[HTML]` media query |
| `UI-08` | Volt focus ring, 2px, 3px offset, on `:focus-visible` | `[HTML]` |
| `UI-09` | Responsive breakpoints at **900 / 860 / 760 / 640 px** | `[HTML]` media queries |
| `UI-10` | UI design must apply the **three golden rules** | `[POL]` Lab 7; `[SYL]` Unit 6 |

### 13.1 Design conflict discovered in the source material

`[LAB2]` pages 8–10 embed screenshots captioned **"Website homepage layout"**. These were
extracted and inspected. They show **the same layout and the same copy** as `[HTML]`, but with
**different accent colours**:

| Artefact | Accent colour | Location |
|---|---|---|
| `[LAB2]` p.8 hero screenshot | **Blue / indigo** (≈ `#4a4ad4`) | `Image52.jpg` |
| `[LAB2]` p.9–10 screenshots | **Red / crimson** (≈ `#d94a4a`) | `Image55/56/59.bmp` |
| `[HTML]` (supplied file) | **Volt green `#cbff3d`** | `:root --volt` |

Three accent variants of one design exist in the reference set. The filename
`gym-management-homepage-2.html` suggests it is revision **2**. Recorded as **CON-06**.
Per the explicit instruction that the supplied HTML is the visual source of truth,
**`#cbff3d` governs** — but the conflict is recorded, not silently reconciled.

---

## 14. Conflicts between source documents

> Recorded, **not** reconciled.

### `CON-01` — Experiment numbering is irreconcilable ⚠️ **HIGH**

| Exp # | `[POL]` lab table says | Supplied handout says |
|---|---|---|
| 1 | SDLC / literature survey / requirements | Agile user stories — **functional** ✅ overlaps |
| 2 | Select a process model | Agile user stories — **non-functional** ❌ |
| 3 | DFD levels 0, 1, 2 | **Use case diagram** ❌ |
| 4 | Use case + activity diagram | **Activity diagram** ⚠️ partial |
| 5 | State chart diagram (Star UML) | **Class diagram** ❌ |
| 6 | Sequence + class + state transition | **Sequence diagram** ⚠️ partial |
| 7 | UI design, three golden rules | **Collaboration diagram** ❌ |
| 8 | Bug reporting + sprint burndown (*proposed*) | **DFD** (file "PRACTICAL 8", heading "PRACTICAL 9") ❌ |
| 9 | Coding | **Testing** ❌ |
| 10 | Test case design | *(no handout)* |

**Impact:** any "Experiment N" label is ambiguous without naming its scheme.
**Recommendation:** label deliverables by *artefact* (e.g. `EXP-USECASE`), never by bare number.

### `CON-02` — DFD depth
`[POL]` Lab 3: *"Design level-0 Data flow diagram, Design level-1 **and Level-2** Data flow diagram"*.
`[EXP8]` Part B: *"DEVELOP DFD **LEVEL 0 AND LEVEL 1**"*. Level-2 required by one, absent from the other.

### `CON-03` — Collaboration diagram has no lab slot
`[EXP7]` exists as a full handout and `[SYL]` Unit 3 names "Sequence and Collaboration Diagram",
but the `[POL]` 10-lab table never assigns a collaboration diagram.

### `CON-04` — Revenue-report verb
"**Review** revenue reports" `[LAB2]` vs "**Generate** Revenue Reports" `[LAB1]` AC-23 vs
"**Produce** revenue reports" `[HTML]`. Read vs. create is a real behavioural difference.

### `CON-05` — Test case quantity
`[POL]` Lab 10: test cases for *"any **two functionalities**"*.
`[EXP9]` Output: *"Development of **upto four test cases**"*. Two functionalities ≠ four test cases.

### `CON-06` — Homepage accent colour, three variants
See §13.1. Blue `[LAB2]` p.8 vs red `[LAB2]` pp.9–10 vs volt-green `[HTML]`.

### `CON-07` — ICA mark allocation contradicts itself inside `[POL]`

| Component | `[POL]` §4 **table** | `[POL]` §4.1 **prose** |
|---|---|---|
| Class Test 1 | 10 | 20 → scaled to 10 ✅ |
| Class Test 2 | 10 | 20 → scaled to 10 ✅ |
| Lab Submissions | **10** | **"weightage of 20 marks"** ❌ |
| Assignments | **05** | **"weightage of 10 marks"** ❌ |
| Mini project | **10** | *not mentioned* ❌ |
| Class Participation | **05** | *not mentioned* ❌ |
| Challenging problems | *not in table* | **"weightage of 5 marks"** ❌ |
| **Total** | **50** ✅ | ≠ 50 ❌ |

Only the table sums to the stated 50 marks.

### `CON-08` — Programme / semester / prerequisite metadata
`[POL]`: "B Tech / MBA Tech – Computer science, IT, BTI, Computer Engineering, Cyber Security, Data science"; prerequisite field **blank**.
`[SYL]`: "B Tech (CSE-Cybersecurity, CSBS, Computer Science, CSEDS, AIML, AIDS)", Semester **III, V**; prerequisite **"Programming for Problem Solving"**.
Student `[LAB1]` states **"MBA tech IT"** — a programme `[SYL]` does not list for this course code.

### `CON-09` — Lab exercise count
`[POL]`: *"The following **10** programming exercises will form the submission"*.
`[SYL]`: *"**8 to 10** programming exercises (and a practicum) based on the syllabus."*

### `CON-10` — Academic year stamp in `[SYL]`
Page footers read *"AY 2025-26 / Page 16"* while the header block is stamped **2026-27**.

### `CON-11` — DFD handout self-contradiction
Filename `PRACTICAL 8-DFD.docx`; internal heading **"PRACTICAL 9"**. Meanwhile `[EXP9]` is
separately titled "EXPERIMENT- 9" (Testing). Two documents claim position 9.

---

## 15. Ambiguities

### `AMB-01` — Product name provenance
"Ironboard" appears **only** in `[HTML]`. `[LAB1]`/`[LAB2]` never name the system in
extractable text. Whether "Ironboard" is the approved academic project name is unconfirmed.

### `AMB-02` — Is there a member-facing interface? ⚠️ **HIGH**
All 25 stories belong to **staff** actors. But members "receive a welcome email", are
"notified", get sessions "added to both calendars", receive "a PDF invoice", and view…
nothing. `[HTML]` shows a **"Sign in"** button with `href="#"`. **Unresolvable from sources.**
Materially changes system scope.

### `AMB-03` — Authentication and authorisation model
NFR-10, NFR-11, NFR-21 and `FEA-01` all require role-scoped access, but **no source defines**
login, credentials, sessions, password rules, or a permission matrix. `[EXP2]`'s sample
constraint mentions a 10-second inactivity logout — that is **handout example text, not an
Ironboard requirement**.

### `AMB-04` — "Working hours" (NFR-08)
Undefined. No opening hours, timezone, or holiday calendar anywhere in the sources.

### `AMB-05` — Multi-branch data model depth
US-12 / NFR-12 require multiple branches. Unspecified: are members branch-scoped or global?
Are staff? Is equipment? Do plans differ per branch? Is there cross-branch access?

### `AMB-06` — 15 of 25 NFRs are unquantified
"easy to access and understand" (NFR-05), "easy to create and modify" (NFR-16), "never be
lost" (NFR-13), "accurately without errors" (NFR-04), "efficiently" (NFR-12), "successfully"
(NFR-19), "whenever requested" (NFR-20/25). `[EXP2]` explicitly calls this a "bad smell".
No acceptance thresholds can be written without invention.

### `AMB-07` — "valid inactive memberships" (NFR-17)
"Valid" is undefined. Does an expired membership auto-become inactive? Is there a grace period?

### `AMB-08` — State chart vs. state transition diagram
`[POL]` Lab 5 requires a "State chart diagram"; `[POL]` Lab 6 requires a "state transition
diagram". Synonyms, or two distinct artefacts at different abstraction levels? Unclear.

### `AMB-09` — `[EXP6]` procedure contamination
`[EXP6]`'s procedure says *"Draw the collaboration diagram and State chart diagram"* while its
stated Output is *"A Sequence diagram of the system."* Appears to be copy-paste from `[EXP7]`.

### `AMB-10` — "Case study" identity
`[POL]` Lab 1 requires shortlisting five case studies and selecting one. Every handout says
`<case study name>` as an unfilled placeholder. The gym system is *assumed* to be the selection,
but no document records that decision.

### `AMB-11` — Credit / teaching scheme garbled
`[POL]` credit block extracts as `L T / 0 2 / P C H / 4 3 2` — column order unresolvable.
`[SYL]` gives Lecture 2/wk, Practical 2/wk, Tutorial 0, Credit 3. The `[POL]` figure "4" maps
to nothing in `[SYL]`.

### `AMB-12` — Notification channels
AC-19 says "email or SMS". AC-01/AC-22 say email. AC-06/AC-09 say "notify"/"inform" with no
channel. No provider, template, or delivery guarantee is specified.

### `AMB-13` — Homepage nav destinations
`Sign in`, `Get started`, `Request a demo`, `Talk to sales` all have `href="#"`. Whether these
map to real application routes is unspecified.

### `AMB-14` — "One shared source of truth" (hero stat `01`)
Marketing phrasing. Whether it constrains architecture (single database) or is copy only is unclear.

### `AMB-15` — Attendance capture mechanism
AC-14 says "check-in data is recorded at the entrance" — but no story covers *recording* a
check-in. Turnstile? Card scan? Manual? The write path is missing while two read paths
(AC-05, AC-14) exist.

### `AMB-16` — "Print" semantics (US-04 / AC-04)
"Print Receipt" — physical printer, PDF download, or browser print dialog? AC-22 explicitly
says PDF for invoices; AC-04 does not.

---

## 16. Incomplete requirements

### `INC-01` — Only one acceptance criterion per story
Heading reads "Accepatnce **1**:" implying a second set that does not exist. `[EXP1]` models
two criteria (happy path + rejection). **All 25 negative/error paths are missing.**

### `INC-02` — No project Constraints list and no Definition of Done
`[EXP2]` Step 2 requires both, "published somewhere highly visible". `[LAB2]` produced neither.

### `INC-03` — NFRs not expressed as user stories
`[EXP2]` learning outcome 2 requires NFRs written *as user stories*; `[LAB2]` supplies a
two-column table only.

### `INC-04` — No data model
No entities, attributes, keys, or relationships are defined anywhere. `[EXP5]` requires a class
diagram; nothing in `[LAB1]`/`[LAB2]` supplies the underlying data definitions.

### `INC-05` — No field-level validation rules
AC-01 names Name, Email, Phone. NFR-02 says "validate all member information before saving".
No formats, lengths, required-ness, or uniqueness rules are given.

### `INC-06` — No pricing / currency / tax model
Plans have "price" (AC-16); payments, invoices, refunds and revenue reports all exist. No
currency, tax, discount or proration rule is stated anywhere.

### `INC-07` — No capacity or volume figures
No member count, branch count, concurrent-user figure, or data-retention period. NFR-12
("multiple gym branches efficiently") cannot be load-tested.

### `INC-08` — Reporting periods undefined
AC-23 says "selects a date range". No default periods, granularity, or export format.

### `INC-09` — No error handling / failure behaviour
No source states what happens when payment fails, email bounces, a slot double-books, or a
branch is disabled while members are attached to it.

### `INC-10` — Nine `[POL]` Lab 1 sub-deliverables missing
Literature survey, five shortlisted case studies, scope, feasibility, final problem statement,
user vs. system requirements split, development plan — none present. (Item 8, the
ambiguity/inconsistency/incompleteness analysis, is satisfied by this document.)

### `INC-11` — No mobile navigation
`[HTML]` hides all nav links at ≤860px (`.navlinks a:not(.btn){display:none;}`) with **no
hamburger, drawer, or alternative**. Below 860px, `Departments`, `Workflow` and `Features`
become unreachable. This is a gap in the source design, not a licence to redesign it.

### `INC-12` — Two CSS custom properties declared but never used
`--ink-3: #1e1e18` (0 uses) and `--volt-dim: #a5d62f` (0 uses). Intent unknown — likely
reserved for a third elevation level and a hover/pressed accent state.

---

## 17. Assumptions that would be necessary

Every assumption below would be required to build. **None is stated in any source document.**
They are listed here to be confirmed *before* implementation, not adopted silently.

| ID | Assumption | Resolves | Risk |
|---|---|---|---|
| `ASM-01` | Ironboard is a **staff-facing web application**; members have no login in v1 | AMB-02 | **HIGH** — halves or doubles scope |
| `ASM-02` | The five departments map to five **role-based permission groups**, one per actor | AMB-03 | HIGH |
| `ASM-03` | Authentication is username/email + password with server-side sessions | AMB-03 | MED |
| `ASM-04` | A single shared datastore backs all five modules ("01 shared source of truth") | AMB-14 | MED |
| `ASM-05` | Members are **branch-scoped**; staff may be assigned to one or more branches | AMB-05 | MED |
| `ASM-06` | Notifications are email-first; SMS is stubbed/logged rather than delivered | AMB-12 | LOW |
| `ASM-07` | "Print receipt" means generate a printable PDF, consistent with AC-22 | AMB-16 | LOW |
| `ASM-08` | The selected case study is the gym management system; `<case study name>` = "Ironboard" | AMB-10 | LOW |
| `ASM-09` | The three golden rules are Pressman's (user in control / reduce memory load / consistency) | §10.1 | LOW |
| `ASM-10` | Unquantified NFRs adopt the nearest stated numeric peer (e.g. availability → 99.9 %) | AMB-06 | **HIGH** — invented thresholds |
| `ASM-11` | Currency is INR; no tax modelling in v1 | INC-06 | MED |
| `ASM-12` | Check-in is recorded by a receptionist action or a stub endpoint | AMB-15 | MED |
| `ASM-13` | Membership states are exactly: Active, Expiring, Expired, Cancelled | AMB-07, WF-02 | MED |
| `ASM-14` | "State chart" and "state transition diagram" are the same artefact, submitted once | AMB-08 | LOW |
| `ASM-15` | Volt green `#cbff3d` is the final accent, superseding the blue and red screenshots | CON-06 | LOW — user-directed |
| `ASM-16` | Deliverables are labelled by artefact name, not experiment number | CON-01 | MED |
| `ASM-17` | Level-2 DFD is produced (superset satisfies both `[POL]` and `[EXP8]`) | CON-02 | LOW |
| `ASM-18` | Four test cases covering two functionalities satisfies both `[POL]` and `[EXP9]` | CON-05 | LOW |
| `ASM-19` | A mobile navigation pattern must be **added**, extending the source design's tokens without altering them | INC-11 | MED |
| `ASM-20` | Revenue reports are **read/generated on demand** — reconciling all three verbs | CON-04 | LOW |

---

## 18. Potential engineering enhancements

Ideas only — **not requirements**, and not to be implemented without instruction.

### 18.1 Requirements & process
- **E-01** Add the missing second acceptance criterion (rejection path) to all 25 stories, closing INC-01.
- **E-02** Author a project Constraints list + Definition of Done, closing INC-02 and `DOC-03`/`DOC-06`.
- **E-03** Rewrite the 25 NFRs as user stories with story tests, closing INC-03.
- **E-04** Quantify the 15 vague NFRs with explicit, testable thresholds (AMB-06).
- **E-05** Version the requirement documents in Git with tags, satisfying `[EXP1]` LO 3 / `DOC-04`.

### 18.2 Architecture & data
- **E-06** Model membership state (WF-02) as an explicit state machine — it directly feeds `DIA-07`/`DIA-10`.
- **E-07** Introduce an audit log for payments, refunds and staff approvals (echoes the `[EXP2]` sample constraint pattern, and supports NFR-24).
- **E-08** Make branch a first-class tenant boundary to satisfy NFR-12 cleanly.
- **E-09** Extract notification dispatch behind an interface so email/SMS (AMB-12) is swappable.
- **E-10** Encrypt medical notes and payment data at rest, satisfying NFR-10 and NFR-21 verifiably.

### 18.3 Quality & verification
- **E-11** Attach an automated test to each acceptance criterion so `AC-nn` ↔ test ID traceability is mechanical.
- **E-12** Add performance budgets in CI for the five quantified timing NFRs (3 s, 2 s, 5 s, 2 s, 5 s).
- **E-13** Seed a demo dataset so the five quantified NFRs can actually be measured.

### 18.4 Design system
- **E-14** Promote the `[HTML]` `:root` block into shared design tokens; give `--ink-3` and `--volt-dim` defined roles (INC-12) rather than deleting them.
- **E-15** Add an accessible mobile nav using existing tokens, closing INC-11 without redesigning.
- **E-16** Add a skip-to-content link (currently absent).
- **E-17** Reuse the `.board` locker grid as the in-app department dashboard shell — it is the design's signature pattern and already scales via `auto-fit`.

---

## 19. Requirement dependency map

### 19.1 Build-order dependencies (derived from acceptance criteria)

```
                      ┌──────────────────────┐
                      │ Auth / Roles (ASM-02)│  ← not sourced; blocks NFR-10/11/21
                      └──────────┬───────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
│ FR-ADM-02      │      │ FR-ADM-01       │      │ FR-MEM-01       │
│ Branches       │      │ Staff approval  │      │ Membership plans│
└───────┬────────┘      └────────┬────────┘      └────────┬────────┘
        │                        │                        │
        └────────────┬───────────┘                        │
                     │                                    │
            ┌────────▼─────────┐                          │
            │ FR-REC-01        │◄─────────────────────────┘
            │ Register member  │   (plan must exist to be chosen)
            │ → Member ID      │
            └────────┬─────────┘
                     │  Member ID is the universal foreign key
   ┌─────────────────┼─────────────────┬──────────────────┐
   │                 │                 │                  │
┌──▼───────────┐ ┌───▼──────────┐ ┌────▼─────────┐ ┌──────▼────────┐
│ FR-REC-02/05 │ │ FR-TRN-01…05 │ │ FR-MEM-02…05 │ │ FR-ACC-01…05  │
│ verify, att. │ │ plans, prog. │ │ lifecycle    │ │ money         │
└──────────────┘ └───┬──────────┘ └────┬─────────┘ └──────┬────────┘
                     │                 │                  │
                     │            ┌────▼──────────────────▼────┐
                     │            │ FR-REC-04 Print receipt    │
                     │            │ (needs successful payment) │
                     │            └────────────────────────────┘
                     │
        ┌────────────▼─────────────────────────────────┐
        │ FR-ADM-04 / FR-ADM-05  Monitoring & rollups  │
        │ (consume every module's data — build last)   │
        └──────────────────────────────────────────────┘
```

### 19.2 Explicit hard dependencies

| Dependent | Requires | Evidence |
|---|---|---|
| Every member-scoped FR | `FR-REC-01` (Member ID) | AC-01 generates the ID; AC-02/05/06/07 all key off member identity |
| `FR-REC-04` Print receipt | `FR-ACC-01` Collect payment | AC-04: *"Given a payment is successful"* |
| `FR-MEM-03` Renew | `FR-ACC-01` Collect payment | AC-18: *"When a renewal payment is completed"* |
| `FR-MEM-04` Reminders | `FR-MEM-05` Track status + `ACT-09` scheduler | AC-19: *"the automated system checks expiring plans"* |
| `FR-TRN-04` Update routine | `FR-TRN-01` Assign plan | AC-09: *"Given a member already has a workout plan"* |
| `FR-TRN-02` Record progress | `FR-REC-01` | AC-07 keys to member |
| `FR-TRN-05` Medical alert | Member profile with health field | AC-10 |
| `FR-ADM-04` Daily attendance | Check-in capture (**AMB-15 — write path missing**) | AC-14 |
| `FR-ADM-05` Monitor all depts | **All 4 other modules** | AC-15: *"summary updates from all departments"* |
| `FR-ACC-03` Revenue reports | `FR-ACC-01`, `FR-ACC-02`, `FR-ACC-04` | AC-23: income, refunds, pending |
| `FR-ACC-04` Refunds | `FR-ACC-01` | AC-24: *"an approved refund request"* |
| `FR-ACC-05` Overdue | `FR-MEM-01` (dues arise from plans) | AC-25 |
| `FR-MEM-02` Cancel → stops access | Access-control mechanism | AC-17: *"stop gym access"* |
| `FR-MEM-03` Renew → restores access | Same mechanism | AC-18: *"restore gym access"* |
| `FR-REC-03` Trial sessions | Slot/availability model | AC-03: *"Given an open time slot"* |
| `FR-TRN-03` PT sessions | Slot model + **two** calendars | AC-08 |

### 19.3 Deliverable dependencies

```
LAB1 (user stories) ──┬─► Use case diagram (DIA-04) ──► Use case docs (DIA-05)
                      ├─► Activity diagram (DIA-06)
                      ├─► DFD L0/L1/L2 (DIA-01/02/03)
                      └─► Class diagram (DIA-09) ──┬─► Sequence diagram (DIA-08)
                                                   └─► Collaboration diagram (DIA-11)
LAB1 + LAB2 ──────────► State chart (DIA-07/10)  [via WF-02]
LAB2 (NFRs) ──────────► UI design (DIA-12) + Design system
DIA-04…DIA-09 ────────► Coding (POL Lab 9: "according to the designs analyzed in EXP.4,5")
Coding ───────────────► Test cases (TST-01/02) ──► Bug reports (TST-06)
```

**Critical path note:** `[POL]` Lab 9 states coding must follow *"the designs analyzed in
EXP.4,5"*. Under the `[POL]` scheme that means Use case + Activity (Lab 4) and State chart
(Lab 5). Under the handout scheme it means Activity (`[EXP4]`) and Class (`[EXP5]`).
**CON-01 makes the coding prerequisite itself ambiguous.**

---

## 20. Repository state at time of analysis

| Item | Finding |
|---|---|
| `CLAUDE.md` | **Does not exist** — verified at `/home/user/ironboard/CLAUDE.md` |
| `.claude/` | **Does not exist** — verified at `/home/user/ironboard/.claude` |
| Project skills | **None.** No project-scoped skills exist to apply |
| Tracked files | 14 — all under `reference/` |
| Application code | **None** |
| Git history | Single commit, `1825409 Initial commit` |
| Branch | `claude/analyze-repo-requirements-06itgc` |

`reference/` was treated as strictly read-only. No file inside it was modified, renamed,
deleted or overwritten. Text extraction was performed into a scratch directory outside
the repository.

---

## 21. Coverage summary

| Category | Count |
|---|---|
| Actors (primary / secondary) | 5 / 5 |
| Departments (modules) | 5 |
| Functional requirements | 25 |
| Sub-behaviours inside acceptance criteria | 25 |
| Homepage feature statements | 6 |
| Lab 1 user stories | 25 |
| Lab 1 acceptance criteria | 25 |
| Lab 2 non-functional requirements | 25 (10 quantified / 15 not) |
| Workflows (primary / lifecycle) | 1 / 7 |
| Experiment deliverables (`[POL]` labs) | 10 (11 tasks — Lab 8 has two) |
| Required diagrams | 15 (12 mandatory, 3 taught-only) |
| Testing activities | 6 + 9 mandatory test-case fields |
| Documentation deliverables | 19 |
| UI/design requirements | 10 (+ full token set) |
| **Conflicts** | **11** |
| **Ambiguities** | **16** |
| **Incomplete requirements** | **12** |
| **Assumptions required** | **20** |
| Enhancement candidates | 17 |

---

## 22. Companion documents

| Document | Contents |
|---|---|
| `docs/project/REQUIREMENT_GAP_ANALYSIS.md` | Gaps, conflicts, ambiguities, incompleteness, risks — with resolution owners |
| `docs/requirements/LAB1_TRACEABILITY_MATRIX.md` | US → AC → FR → NFR → department → homepage evidence, all 25 rows |
| `docs/requirements/LAB2_NFR_TRACEABILITY.md` | All 25 NFRs, category, measurability, verification method, bound FR |
| `docs/ui/DESIGN_SYSTEM.md` | Complete token-level extraction of the homepage source |

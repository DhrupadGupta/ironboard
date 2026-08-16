# Lab 1 — Requirements Traceability Matrix

**Primary source:** `reference/lab1/I025_Dhrupad Gupta_SE_LAB_1 (1).pdf` — Part B, pp.5–9
**Handout:** `reference/experiments/SE_LAB_1_new.docx` (Experiment 1)
**Cross-referenced:** `reference/lab2/I025_Dhrupad Gupta_SE_Lab2.pdf` (FR labels + NFRs),
`reference/design/gym-management-homepage-2.html` (department cards)

**Coverage:** 25 user stories · 25 acceptance criteria · 25 functional requirements ·
5 departments · 5 primary actors. Every row is traced to at least three independent sources.

**Status:** ⬜ Not implemented — no application code exists. Implementation and test columns
are placeholders to be filled as work proceeds.

---

## Legend

| Column | Meaning |
|---|---|
| **US** | User story ID (`[LAB1]` p.5, in document order) |
| **AC** | Acceptance criterion ID (`[LAB1]` pp.5–9, one per story) |
| **FR** | Functional requirement ID (label from `[LAB2]` FR column) |
| **NFR** | Bound non-functional requirement (`[LAB2]`, verified by y-coordinate pairing) |
| **HP** | Homepage evidence — the matching `.card li` bullet in `[HTML]` |
| **Impl** | Implementation status — ⬜ not started |
| **Test** | Verifying test — ⬜ not written |

Source page references are to the extracted PDF page numbering.

---

## D01 — Reception · Actor `ACT-01` Receptionist

Homepage: `Dept / 01` · "Reception" · badge `5 stories` ·
*"The first touchpoint — registration, verification and the daily front-desk rhythm."*

### US-01 · Register new members

| Field | Value |
|---|---|
| **User story** | "As a receptionist, I want to register new members so they can access new gym services." |
| **Source** | `[LAB1]` p.5, §1)Reception, story 1 |
| **FR** | `FR-REC-01` — "Register new members" (`[LAB2]` p.6) |
| **AC-01** | **Given** valid member info (Name, Email, Phone) is entered · **When** the receptionist submits the form · **Then** create the profile, generate a Member ID, and send a welcome email |
| **AC source** | `[LAB1]` p.6, "Story 1: Register New Members" |
| **NFR** | `NFR-01` Performance — "Member registration should be completed within 3 seconds." |
| **HP** | "Register new members &amp; issue Member IDs" (`[HTML]` line 328) |
| **Sub-behaviours** | `FR-SUB-01` generate Member ID · `FR-SUB-02` send welcome email |
| **Depends on** | — (root requirement; every member-scoped FR depends on this) |
| **Gaps** | `INC-05` no field validation rules despite `NFR-02`; `INC-01` no rejection path (duplicate email? invalid phone?) |
| **Impl / Test** | ⬜ / ⬜ |

### US-02 · Verify member details

| Field | Value |
|---|---|
| **User story** | "As a receptionist, I want to verify member details so they can be accurate ." *(trailing space [sic])* |
| **Source** | `[LAB1]` p.5, §1, story 2 |
| **FR** | `FR-REC-02` — "Verify member details" |
| **AC-02** | **Given** a member provides their Name or ID · **When** the receptionist updates any outdated info and saves · **Then** update the profile instantly and show a success message |
| **AC source** | `[LAB1]` p.6, "Story 2: Verify Member Details" |
| **NFR** | `NFR-02` Data Integrity — "The system should validate all member information before saving." |
| **HP** | "Verify and update member details" (line 329) |
| **Sub-behaviours** | `FR-SUB-03` success message |
| **Depends on** | `FR-REC-01` |
| **Gaps** | Story says *verify*, AC says *update* — scope drift. "instantly" is unquantified (`AMB-06`). Lookup by "Name or ID" implies member search, which no story defines |
| **Impl / Test** | ⬜ / ⬜ |

### US-03 · Schedule trial sessions

| Field | Value |
|---|---|
| **User story** | "As a receptionist, I want to schedule trials session so new potential customers can become members ." *("trials session" [sic])* |
| **Source** | `[LAB1]` p.5, §1, story 3 |
| **FR** | `FR-REC-03` — "Schedule trial sessions" |
| **AC-03** | **Given** an open time slot and a potential customer's details · **When** the receptionist books the slot · **Then** reserve the trial session and send a confirmation to the customer |
| **AC source** | `[LAB1]` p.6, "Story 3: Schedule Trial Sessions" |
| **NFR** | `NFR-03` Availability — "The scheduling system should be available 99.9% of the time." |
| **HP** | "Schedule trial sessions for prospects" (line 330) |
| **Sub-behaviours** | `FR-SUB-04` confirmation to customer |
| **Depends on** | Slot/availability model (**not defined in any source**); `ACT-07` prospect record |
| **Gaps** | Prospects are not members — no story creates a prospect record. `INC-09` no double-booking behaviour. `FEA-02` adds "real-time slot availability" not present in `[LAB1]` |
| **Impl / Test** | ⬜ / ⬜ |

### US-04 · Print payment receipts

| Field | Value |
|---|---|
| **User story** | "As a receptionist, I want to print payment receipts so that members receive confirmation of they membership." *("of they membership" [sic])* |
| **Source** | `[LAB1]` p.5, §1, story 4 |
| **FR** | `FR-REC-04` — "Print payment receipts" |
| **AC-04** | **Given** a payment is successful · **When** the receptionist clicks "Print Receipt" · **Then** print a receipt with the payment details |
| **AC source** | `[LAB1]` p.6, "Story 4: Print Payment Receipts" |
| **NFR** | `NFR-04` Reliability — "Payment receipts should be generated accurately without errors." |
| **HP** | "Print payment receipts" (line 331) |
| **Depends on** | **`FR-ACC-01`** (cross-department — receipt requires a successful payment) |
| **Gaps** | `AMB-16` "print" is undefined — printer / PDF / browser dialog? `AC-21` also issues a receipt from Accounting: **two paths to one artefact**, ownership unclear |
| **Impl / Test** | ⬜ / ⬜ |

### US-05 · Check member attendance

| Field | Value |
|---|---|
| **User story** | "As a receptionist, I want to check the members attendance so I can follow up to them." |
| **Source** | `[LAB1]` p.5, §1, story 5 |
| **FR** | `FR-REC-05` — "Check member attendance" |
| **AC-05** | **Given** the reception attendance page is open · **When** filtering by date or inactive members · **Then** show total visits and a list of members who haven't visited recently |
| **AC source** | `[LAB1]` p.6, "Story 5: Check Member Attendance" |
| **NFR** | `NFR-05` Usability — "Attendance records should be easy to access and understand." |
| **HP** | "Check daily member attendance" (line 332) |
| **Sub-behaviours** | `FR-SUB-05` filter by date / inactive · `FR-SUB-06` total visits + lapsed list |
| **Depends on** | Attendance capture — **`AMB-15`: no story writes check-in data** |
| **Gaps** | "recently" undefined. Overlaps `FR-ADM-04` (admin daily attendance) — two readers, no writer |
| **Impl / Test** | ⬜ / ⬜ |

---

## D02 — Trainer Department · Actor `ACT-02` Trainer

Homepage: `Dept / 02` · "Trainer Dept." · badge `5 stories` ·
*"Where fitness goals turn into plans, sessions and measurable progress."*

### US-06 · Assign workout plans

| Field | Value |
|---|---|
| **User story** | "As a trainer, I want to assign workout plans so that members achieve their fitness goals." |
| **Source** | `[LAB1]` p.5, §2) Trainer Department, story 1 |
| **FR** | `FR-TRN-01` — "Assign workout plans" |
| **AC-06** | **Given** a trainer selects a member's profile · **When** the trainer chooses or creates a workout plan and saves · **Then** link the plan to the member's profile and notify them |
| **AC source** | `[LAB1]` p.6, "Story 1: Assign Workout Plans" |
| **NFR** | `NFR-06` Performance — "Workout plans should load within 2 seconds." |
| **HP** | "Assign and link workout plans" (line 341) |
| **Depends on** | `FR-REC-01` (member profile) |
| **Side effect** | Creates a `TrainerAssignment` (`ENH-20`) — `AC-06` literally says "**link** the plan to the member's profile". This materialises `NFR-10`'s per-member authorisation without any new user-facing feature |
| **Gaps** | "chooses **or** creates" implies a plan template library that no story defines. `AMB-12` notify channel unspecified |
| **Impl / Test** | ⬜ / ⬜ |

### US-07 · Record member progress

| Field | Value |
|---|---|
| **User story** | "As a trainer, I want to record member progress so that improvements can be monitored." |
| **Source** | `[LAB1]` p.5, §2, story 2 |
| **FR** | `FR-TRN-02` — "Record member progress" |
| **AC-07** | **Given** a member completes a progress test · **When** the trainer logs weight or measurements · **Then** save the data and update the progress chart |
| **AC source** | `[LAB1]` p.6, "Story 2: Record Member Progress" |
| **NFR** | `NFR-07` Reliability — "Member progress should be saved accurately without data loss." |
| **HP** | "Record member progress &amp; measurements" (line 342) |
| **Sub-behaviours** | `FR-SUB-07` update progress chart |
| **Depends on** | `FR-REC-01` |
| **Gaps** | "measurements" unenumerated (`INC-04`). "progress test" is an undefined concept. `FEA-03` adds "workout history charted automatically" |
| **Impl / Test** | ⬜ / ⬜ |

### US-08 · Schedule personal training sessions

| Field | Value |
|---|---|
| **User story** | "As a trainer, I want to schedule personal training sessions so that members receive guidance." |
| **Source** | `[LAB1]` p.5, §2, story 3 |
| **FR** | `FR-TRN-03` — "Schedule personal training sessions" |
| **AC-08** | **Given** both trainer and member are free at a specific time · **When** the trainer books the session date and time · **Then** reserve the slot and add it to both calendars |
| **AC source** | `[LAB1]` pp.6–7, "Story 3: Schedule Personal Training Sessions" |
| **NFR** | `NFR-08` Availability — "Training schedules should always be accessible during working hours." |
| **HP** | "Schedule personal training sessions" (line 343) |
| **Sub-behaviours** | `FR-SUB-08` add to **both** calendars |
| **Depends on** | `FR-REC-01`; slot model; trainer availability model (**not defined**) |
| **Gaps** | "both calendars" implies a **member-visible calendar** → reinforces `AMB-02`. `NFR-08` "working hours" undefined (`AMB-04`). No trainer-availability story exists |
| **Impl / Test** | ⬜ / ⬜ |

### US-09 · Update exercise routines

| Field | Value |
|---|---|
| **User story** | "As a trainer, I want to update exercise routines so that workouts remain effective." |
| **Source** | `[LAB1]` p.5, §2, story 4 |
| **FR** | `FR-TRN-04` — "Update exercise routines" |
| **AC-09** | **Given** a member already has a workout plan · **When** the trainer changes any exercises, sets, or reps · **Then** update the plan and inform the member |
| **AC source** | `[LAB1]` p.7, "Story 4: Update Exercise Routines" |
| **NFR** | `NFR-09` Maintainability — "Exercise routines should be easy to update without affecting existing data." |
| **HP** | "Update exercise routines" (line 344) |
| **Depends on** | **`FR-TRN-01`** (explicit — "Given a member already has a workout plan") |
| **Gaps** | `NFR-09` is the only Maintainability NFR and reads as a *developer* concern misapplied to a *user* action. "without affecting existing data" implies plan versioning, which no story defines |
| **Impl / Test** | ⬜ / ⬜ |

### US-10 · View member medical restrictions

| Field | Value |
|---|---|
| **User story** | "As a trainer, I want to view member medical restrictions so that training is safe." |
| **Source** | `[LAB1]` p.5, §2, story 5 |
| **FR** | `FR-TRN-05` — "View member medical restrictions" |
| **AC-10** | **Given** a member has a health condition logged · **When** the trainer opens the member's profile · **Then** display a clear medical alert before workouts are set |
| **AC source** | `[LAB1]` p.7, "Story 5: View Member Medical Restrictions" |
| **NFR** | `NFR-10` Security — "Medical information should only be accessible to authorized trainers." |
| **HP** | "View member medical restrictions" (line 345) |
| **Sub-behaviours** | `FR-SUB-09` alert shown *before* workouts are set |
| **Depends on** | `FR-REC-01`; **role-based access control (`AMB-03` — not defined)** |
| **Gaps** | ⚠️ **No story captures medical data.** AC-10 says "Given a member has a health condition logged" — the write path is missing entirely. `NFR-10` says "authorized trainers", implying trainer-level scoping beyond a plain role check. `FEA-01` confirms "medical notes, visible to the right roles only" |
| **Impl / Test** | ⬜ / ⬜ |

---

## D03 — Administration · Actor `ACT-03` Administrator

Homepage: `Dept / 03` · "Administration" · badge `5 stories` ·
*"Oversight across staff, branches, equipment and daily operations."*

### US-11 · Approve new staff accounts

| Field | Value |
|---|---|
| **User story** | "As an administrator, I want to approve new staff accounts so that only authorized employees can access the system." |
| **Source** | `[LAB1]` p.5, §3) Administration, story 1 |
| **FR** | `FR-ADM-01` — "Approve new staff accounts" |
| **AC-11** | **Given** a new staff member registers for access · **When** the admin reviews and clicks "Approve" · **Then** activate the account and send login details |
| **AC source** | `[LAB1]` p.7, "Story 1: Approve New Staff Accounts" |
| **NFR** | `NFR-11` Security — "Only administrators should be able to approve staff accounts." |
| **HP** | "Approve new staff accounts" (line 354) |
| **Sub-behaviours** | `FR-SUB-10` send login details |
| **Implementation interpretation** | ⚠️ The requirement wording above is **preserved verbatim and is not rewritten**. Implementation sends the sign-in URL, the login identifier and the assigned role (genuine "login details") **plus a single-use link to set a password**, rather than emailing a password. Classified **ENGINEERING SECURITY IMPROVEMENT / IMPLEMENTATION INTERPRETATION** — see `docs/decisions/DEVIATIONS.md` §1. No NFR constrains credential transport. Reversible if a literal reading is required. |
| **Depends on** | Auth/identity system (`AMB-03`, `ASM-02`/`ASM-03`) |
| **Gaps** | ⚠️ **Foundational but underspecified.** Implies staff self-registration (`ACT-08`), an account lifecycle (pending → active), a **rejection** path (`INC-01`), and role assignment at approval — none stated. Sending login details implies credential generation/delivery, which raises a security concern not addressed by any NFR |
| **Impl / Test** | ⬜ / ⬜ |

### US-12 · Manage gym branches

| Field | Value |
|---|---|
| **User story** | "As an administrator, I want to manage gym branches so that all locations can be monitored from one system." |
| **Source** | `[LAB1]` p.5, §3, story 2 |
| **FR** | `FR-ADM-02` — "Manage gym branches" |
| **AC-12** | **Given** the admin is on the branch management page · **When** the admin adds, updates, or disables a branch · **Then** update the system records for that location |
| **AC source** | `[LAB1]` p.7, "Story 2: Manage Gym Branches" |
| **NFR** | `NFR-12` Scalability — "The system should support multiple gym branches efficiently." |
| **HP** | "Manage multiple gym branches" (line 355) |
| **Sub-behaviours** | `FR-SUB-11` add / update / **disable** |
| **Depends on** | — (structural root, alongside `FR-ADM-01`) |
| **Gaps** | ⚠️ **`AMB-05` — highest-impact data-model ambiguity.** Are members, staff, equipment, plans and payments branch-scoped or global? `INC-09` — what happens to members attached to a disabled branch? `NFR-12` gives no branch count, so "efficiently" is untestable (`INC-07`) |
| **Impl / Test** | ⬜ / ⬜ |

### US-13 · Maintain equipment maintenance schedules

| Field | Value |
|---|---|
| **User story** | "As an administrator, I want to maintain equipment maintenance schedules so that all machines remain operational." |
| **Source** | `[LAB1]` p.5, §3, story 3 |
| **FR** | `FR-ADM-03` — "Maintain equipment schedules" |
| **AC-13** | **Given** a machine needs regular service · **When** the admin sets a recurring service schedule (e.g., every 3 months) · **Then** set reminders and mark the machine "In Maintenance" during service |
| **AC source** | `[LAB1]` p.7, "Story 3: Maintain Equipment Maintenance Schedules" |
| **NFR** | `NFR-13` Reliability — "Equipment maintenance records should never be lost." |
| **HP** | "Maintain equipment maintenance schedules" (line 356) |
| **Sub-behaviours** | `FR-SUB-12` recurring schedule · `FR-SUB-13` "In Maintenance" state |
| **Depends on** | Equipment register (**no story creates equipment records**); `ACT-09` scheduler |
| **Gaps** | ⚠️ Equipment CRUD missing — same write-path gap as medical data and check-ins. "every 3 months" is an example, not a rule. `NFR-13` "never be lost" is absolute and untestable (`AMB-06`). Equipment implies a second state machine, undocumented |
| **Impl / Test** | ⬜ / ⬜ |

### US-14 · Monitor daily gym attendance

| Field | Value |
|---|---|
| **User story** | "As an administrator, I want to monitor daily gym attendance so that I can analyze member activity." |
| **Source** | `[LAB1]` p.5, §3, story 4 |
| **FR** | `FR-ADM-04` — "Monitor daily gym attendance" |
| **AC-14** | **Given** check-in data is recorded at the entrance · **When** the admin views the daily attendance page · **Then** display total visits and peak busy hours |
| **AC source** | `[LAB1]` p.7, "Story 4: Monitor Daily Gym Attendance" |
| **NFR** | `NFR-14` Performance — "Attendance reports should be generated within 5 seconds." |
| **HP** | "Monitor daily gym attendance" (line 357) |
| **Sub-behaviours** | `FR-SUB-14` peak busy hours |
| **Depends on** | **Check-in capture — `AMB-15`, the single largest missing write path** |
| **Gaps** | ⚠️ "check-in data is recorded at the entrance" is stated as a *precondition*, never as a requirement. Turnstile? Card scan? Reception action? Overlaps `FR-REC-05` |
| **Impl / Test** | ⬜ / ⬜ |

### US-15 · Monitor all department activities

| Field | Value |
|---|---|
| **User story** | "As an administrator, I want to monitor all department activities so that the gym operates efficiently." |
| **Source** | `[LAB1]` p.5, §3, story 5 |
| **FR** | `FR-ADM-05` — "Monitor department activities" |
| **AC-15** | **Given** the admin dashboard is open · **When** the admin checks system activities · **Then** show summary updates from all departments |
| **AC source** | `[LAB1]` pp.7–8, "Story 5: Monitor All Department Activities" |
| **NFR** | `NFR-15` Availability — "The monitoring dashboard should be available 99.9% of the time." |
| **HP** | "Monitor all department activity" (line 358) |
| **Depends on** | ⚠️ **All four other modules** — the terminal node of the dependency graph |
| **Gaps** | The vaguest story in `[LAB1]`. "summary updates" is undefined — activity feed? metric tiles? counts? Must be built **last** |
| **Impl / Test** | ⬜ / ⬜ |

---

## D04 — Membership Management · Actor `ACT-04` Membership Manager

Homepage: `Dept / 04` · "Membership Mgmt." · badge `5 stories` ·
*"The lifecycle of a membership, from sign-up to renewal or lapse."*

> `[LAB1]` numbers this department's stories `1.`–`5.` (unlike §1–§3 which are unnumbered).

### US-16 · Create membership plans

| Field | Value |
|---|---|
| **User story** | "As a membership manager, I want to create membership plans so that the customer can choose suitable packages." |
| **Source** | `[LAB1]` p.5, §4) Membership Management, item 1 |
| **FR** | `FR-MEM-01` — "Create membership plans" |
| **AC-16** | **Given** price, duration, and access rules are entered · **When** the manager saves and publishes the plan · **Then** show the plan as available for purchase |
| **AC source** | `[LAB1]` p.8, "Story 1: Create Membership Plans" |
| **NFR** | `NFR-16` Usability — "Membership plans should be easy to create and modify." |
| **HP** | "Create membership plans &amp; packages" (line 367) |
| **Sub-behaviours** | `FR-SUB-15` price + duration + access rules; draft → published |
| **Depends on** | — (root; `FR-REC-01` and all of D05 depend on plans existing) |
| **Gaps** | ⚠️ **"access rules" is undefined and load-bearing** — it is the mechanism behind "stop gym access" (AC-17) and "restore gym access" (AC-18). `INC-06` no currency/tax/discount model. "available for purchase" implies a purchase surface → `AMB-02`. `NFR-16` names *modify* but no story covers plan modification |
| **Impl / Test** | ⬜ / ⬜ |

### US-17 · Cancel inactive memberships

| Field | Value |
|---|---|
| **User story** | "As a membership manager, I want to cancel the inactive memberships so the accounts are updated." |
| **Source** | `[LAB1]` p.5, §4, item 2 |
| **FR** | `FR-MEM-02` — "Cancel inactive memberships" |
| **AC-17** | **Given** a membership has expired or a cancellation request is made · **When** the manager confirms cancellation · **Then** set status to "Cancelled" and stop gym access |
| **AC source** | `[LAB1]` p.8, "Story 2: Cancel Inactive Memberships" |
| **NFR** | `NFR-17` Data Integrity — "Only valid inactive memberships should be cancelled." |
| **HP** | "Cancel inactive memberships" (line 368) |
| **Sub-behaviours** | `FR-SUB-16` status "Cancelled" + stop access |
| **Depends on** | `FR-MEM-05`; access-control mechanism (from AC-16 "access rules") |
| **Gaps** | `AMB-07` "valid" undefined. Story says *inactive*, AC says *expired **or** cancellation request* — two different triggers. No story creates a cancellation request. Is "Cancelled" reversible? (`WF-02`, `ASM-13`) |
| **Impl / Test** | ⬜ / ⬜ |

### US-18 · Renew memberships

| Field | Value |
|---|---|
| **User story** | "As a membership manager, I want to renew memberships so that members can have uninterrupted access." |
| **Source** | `[LAB1]` p.5, §4, item 3 |
| **FR** | `FR-MEM-03` — "Renew memberships" |
| **AC-18** | **Given** an expiring or expired profile · **When** a renewal payment is completed · **Then** extend the expiry date and restore gym access |
| **AC source** | `[LAB1]` p.8, "Story 3: Renew Memberships" |
| **NFR** | `NFR-18` Performance — "Membership renewal should be completed within 2 seconds." |
| **HP** | "Renew memberships for continuity" (line 369) |
| **Sub-behaviours** | `FR-SUB-17` extend expiry + restore access |
| **Depends on** | **`FR-ACC-01`** (cross-department — "When a renewal payment is completed") |
| **Gaps** | Extend from *expiry date* or from *today*? Materially different for lapsed members. `NFR-18` 2 s conflicts with a synchronous payment step. Can a **Cancelled** membership be renewed, or only Expired? |
| **Impl / Test** | ⬜ / ⬜ |

### US-19 · Send renewal reminders

| Field | Value |
|---|---|
| **User story** | "As a membership manager, I want to sent renewal reminders so that the members renew on time." *("sent" [sic])* |
| **Source** | `[LAB1]` p.5, §4, item 4 |
| **FR** | `FR-MEM-04` — "Send renewal reminders" |
| **AC-19** | **Given** a membership is expiring soon (e.g., in 7 days) · **When** the automated system checks expiring plans · **Then** send a reminder email or SMS to the member |
| **AC source** | `[LAB1]` p.8, "Story 4: Send Renewal Reminders" |
| **NFR** | `NFR-19` Reliability — "Renewal reminders should be delivered successfully." |
| **HP** | "Send renewal reminders" (line 370) |
| **Sub-behaviours** | `FR-SUB-18` email **or** SMS; 7-day threshold |
| **Depends on** | `FR-MEM-05`; **`ACT-09` automated scheduler** |
| **Gaps** | ⚠️ **The only story whose actor is the system, not the named human** — the manager does not perform it. `AMB-12` no provider/template. "e.g., 7 days" is an example, not a rule. `NFR-19` gives no delivery rate. `FEA-06` restates it as "flagged early" |
| **Impl / Test** | ⬜ / ⬜ |

### US-20 · Track membership status

| Field | Value |
|---|---|
| **User story** | "As a membership manager, I want to track membership status so that I know active and expired members." |
| **Source** | `[LAB1]` p.5, §4, item 5 |
| **FR** | `FR-MEM-05` — "Track membership status" |
| **AC-20** | **Given** the member directory list · **When** filtering by "Active" or "Expired" · **Then** display the matching list of members |
| **AC source** | `[LAB1]` p.8, "Story 5: Track Membership Status" |
| **NFR** | `NFR-20` Availability — "Membership status should be available whenever requested." |
| **HP** | "Track active vs. expired status" (line 371) |
| **Sub-behaviours** | `FR-SUB-19` filter Active / Expired |
| **Depends on** | `FR-REC-01`, `FR-MEM-01` |
| **Gaps** | ⚠️ **State-set conflict.** AC-20 filters on **two** states (Active, Expired) but AC-17 introduces **"Cancelled"** and AC-19 implies **"Expiring"**. `[LAB1]` never defines the full state set — this is the direct input to the required State Chart diagram (`DIA-07`). See `WF-02`, `ASM-13` |
| **Impl / Test** | ⬜ / ⬜ |

---

## D05 — Accounting · Actor `ACT-05` Accounting Executive

Homepage: `Dept / 05` · "Accounting" · badge `5 stories` ·
*"Every payment, invoice and overdue balance, reconciled in one place."*

### US-21 · Collect membership payments

| Field | Value |
|---|---|
| **User story** | "As an accounting executive, I want to collect membership payments so that accounts remain updated." |
| **Source** | `[LAB1]` p.5, §5) Accounting, item 1 |
| **FR** | `FR-ACC-01` — "Collect membership payments" |
| **AC-21** | **Given** a member has a balance due · **When** payment is made via cash, card, or online · **Then** clear the balance and issue a receipt |
| **AC source** | `[LAB1]` p.8, "Story 1: Collect Membership Payments" |
| **NFR** | `NFR-21` Security — "Payment information should be encrypted and accessible only to authorized staff." |
| **HP** | "Collect membership payments" (line 380) |
| **Sub-behaviours** | `FR-SUB-20` cash / card / online |
| **Depends on** | `FR-REC-01`, `FR-MEM-01` |
| **Blocks** | `FR-REC-04` (receipt), `FR-MEM-03` (renewal), `FR-ACC-03` (revenue) |
| **Gaps** | ⚠️ **Highest-risk requirement.** Three payment channels, one of them "online" — implies a payment gateway that no source names. `NFR-21` mandates encryption with no algorithm/scope. `INC-06` no currency. `INC-09` no failure path. Overlaps `FR-REC-04` on receipt issuance |
| **Impl / Test** | ⬜ / ⬜ |

### US-22 · Generate invoices

| Field | Value |
|---|---|
| **User story** | "As an accounting executive, I want to generate invoices so that members receive payment records." |
| **Source** | `[LAB1]` p.5, §5, item 2 |
| **FR** | `FR-ACC-02` — "Generate invoices" |
| **AC-22** | **Given** a payment or subscription charge · **When** billing triggers or is run manually · **Then** create a PDF invoice and email it to the member |
| **AC source** | `[LAB1]` p.8, "Story 2: Generate Invoices" |
| **NFR** | `NFR-22` Reliability — "Invoices should be generated accurately every time." |
| **HP** | "Generate invoices for members" (line 381) |
| **Sub-behaviours** | `FR-SUB-21` PDF + email · `FR-SUB-22` automatic **or** manual trigger |
| **Depends on** | `FR-ACC-01` |
| **Gaps** | "subscription charge" implies recurring billing — **no story defines a subscription**. PDF is the only explicitly stated document format in `[LAB1]` (contrast `AMB-16` for receipts). `INC-06` no tax/numbering scheme, though invoices legally require sequential numbering |
| **Impl / Test** | ⬜ / ⬜ |

### US-23 · Revenue reports

| Field | Value |
|---|---|
| **User story** | "As an accounting executive, I want to revenue reports so that business performance can be analyzed.," *(**missing verb**; trailing ".," [sic])* |
| **Source** | `[LAB1]` p.5, §5, item 3 |
| **FR** | `FR-ACC-03` — "Review revenue reports" (`[LAB2]`) |
| **AC-23** | **Given** system transaction logs · **When** the accountant selects a date range · **Then** show total income, refunds, and pending payments |
| **AC source** | `[LAB1]` p.8, "Story 3: Generate Revenue Reports" |
| **NFR** | `NFR-23` Performance — "Revenue reports should be generated within 5 seconds." |
| **HP** | "Produce revenue reports" (line 382) |
| **Sub-behaviours** | `FR-SUB-23` date range → income, refunds, pending |
| **Depends on** | `FR-ACC-01`, `FR-ACC-02`, `FR-ACC-04` |
| **Gaps** | ⚠️ **`CON-04` — four different verbs across four sources:** story omits the verb entirely; AC heading says **"Generate"**; `[LAB2]` says **"Review"**; `[HTML]` says **"Produce"**. *Read* vs *create* is a genuine behavioural difference. Also `INC-08` no periods/granularity/export format; "system transaction logs" implies an audit log no story defines |
| **Impl / Test** | ⬜ / ⬜ |

### US-24 · Process refunds

| Field | Value |
|---|---|
| **User story** | "As an accounting executive, I want to process refunds so that payment issues are resolved." |
| **Source** | `[LAB1]` p.5, §5, item 4 |
| **FR** | `FR-ACC-04` — "Process refunds" |
| **AC-24** | **Given** an approved refund request · **When** the accountant enters the refund details · **Then** send funds back to the member and log the transaction |
| **AC source** | `[LAB1]` p.8, "Story 4: Process Refunds" |
| **NFR** | `NFR-24` Data Integrity — "Refund transactions should maintain accurate financial records." |
| **HP** | "Process refunds" (line 383) |
| **Sub-behaviours** | `FR-SUB-24` requires prior approval; log transaction |
| **Depends on** | `FR-ACC-01` |
| **Gaps** | ⚠️ **"an approved refund request" — no story creates or approves a refund request.** Who requests? Who approves? Same missing-write-path pattern as medical data, equipment and check-ins. Partial refunds? Refund → membership status effect? Unstated |
| **Impl / Test** | ⬜ / ⬜ |

### US-25 · Track overdue payments

| Field | Value |
|---|---|
| **User story** | "As an accounting executive, I want to track overdue paymentsso that pending dues are collected." *("paymentsso" [sic])* |
| **Source** | `[LAB1]` p.5, §5, item 5 |
| **FR** | `FR-ACC-05` — "Track overdue payments" |
| **AC-25** | **Given** members with late payments · **When** opening the overdue accounts page · **Then** list unpaid balances and offer an option to send payment notices |
| **AC source** | `[LAB1]` pp.8–9, "Story 5: Track Overdue Payments" |
| **NFR** | `NFR-25` Availability — "Overdue payment information should be available whenever required." |
| **HP** | "Track overdue payments" (line 384) |
| **Sub-behaviours** | `FR-SUB-25` send payment notices |
| **Depends on** | `FR-ACC-01`, `FR-MEM-01` |
| **Gaps** | "late" undefined — no due date or grace period model (`INC-06`). "payment notices" is a **third** notification type after welcome emails and renewal reminders, with no channel stated (`AMB-12`) |
| **Impl / Test** | ⬜ / ⬜ |

---

## Summary matrix — all 25 rows

| US | FR | Dept | Actor | AC | NFR | NFR category | Quantified | HP ✓ | Depends on |
|---|---|---|---|---|---|---|---|---|---|
| US-01 | FR-REC-01 | D01 | Receptionist | AC-01 | NFR-01 | Performance | ✅ 3 s | ✅ | — |
| US-02 | FR-REC-02 | D01 | Receptionist | AC-02 | NFR-02 | Data Integrity | ❌ | ✅ | FR-REC-01 |
| US-03 | FR-REC-03 | D01 | Receptionist | AC-03 | NFR-03 | Availability | ✅ 99.9 % | ✅ | slot model |
| US-04 | FR-REC-04 | D01 | Receptionist | AC-04 | NFR-04 | Reliability | ❌ | ✅ | **FR-ACC-01** |
| US-05 | FR-REC-05 | D01 | Receptionist | AC-05 | NFR-05 | Usability | ❌ | ✅ | check-in (missing) |
| US-06 | FR-TRN-01 | D02 | Trainer | AC-06 | NFR-06 | Performance | ✅ 2 s | ✅ | FR-REC-01 |
| US-07 | FR-TRN-02 | D02 | Trainer | AC-07 | NFR-07 | Reliability | ❌ | ✅ | FR-REC-01 |
| US-08 | FR-TRN-03 | D02 | Trainer | AC-08 | NFR-08 | Availability | ❌ | ✅ | slot model |
| US-09 | FR-TRN-04 | D02 | Trainer | AC-09 | NFR-09 | Maintainability | ❌ | ✅ | **FR-TRN-01** |
| US-10 | FR-TRN-05 | D02 | Trainer | AC-10 | NFR-10 | Security | ✅ binary | ✅ | RBAC (missing) |
| US-11 | FR-ADM-01 | D03 | Administrator | AC-11 | NFR-11 | Security | ✅ binary | ✅ | auth (missing) |
| US-12 | FR-ADM-02 | D03 | Administrator | AC-12 | NFR-12 | Scalability | ❌ | ✅ | — |
| US-13 | FR-ADM-03 | D03 | Administrator | AC-13 | NFR-13 | Reliability | ❌ | ✅ | equipment (missing) |
| US-14 | FR-ADM-04 | D03 | Administrator | AC-14 | NFR-14 | Performance | ✅ 5 s | ✅ | check-in (missing) |
| US-15 | FR-ADM-05 | D03 | Administrator | AC-15 | NFR-15 | Availability | ✅ 99.9 % | ✅ | **all modules** |
| US-16 | FR-MEM-01 | D04 | Membership Mgr | AC-16 | NFR-16 | Usability | ❌ | ✅ | — |
| US-17 | FR-MEM-02 | D04 | Membership Mgr | AC-17 | NFR-17 | Data Integrity | ❌ | ✅ | FR-MEM-05 |
| US-18 | FR-MEM-03 | D04 | Membership Mgr | AC-18 | NFR-18 | Performance | ✅ 2 s | ✅ | **FR-ACC-01** |
| US-19 | FR-MEM-04 | D04 | *system* | AC-19 | NFR-19 | Reliability | ❌ | ✅ | FR-MEM-05, scheduler |
| US-20 | FR-MEM-05 | D04 | Membership Mgr | AC-20 | NFR-20 | Availability | ❌ | ✅ | FR-REC-01, FR-MEM-01 |
| US-21 | FR-ACC-01 | D05 | Accounting Exec | AC-21 | NFR-21 | Security | ✅ binary | ✅ | FR-MEM-01 |
| US-22 | FR-ACC-02 | D05 | Accounting Exec | AC-22 | NFR-22 | Reliability | ❌ | ✅ | FR-ACC-01 |
| US-23 | FR-ACC-03 | D05 | Accounting Exec | AC-23 | NFR-23 | Performance | ✅ 5 s | ✅ | FR-ACC-01/02/04 |
| US-24 | FR-ACC-04 | D05 | Accounting Exec | AC-24 | NFR-24 | Data Integrity | ❌ | ✅ | FR-ACC-01 |
| US-25 | FR-ACC-05 | D05 | Accounting Exec | AC-25 | NFR-25 | Availability | ❌ | ✅ | FR-ACC-01, FR-MEM-01 |

**Homepage coverage: 25 / 25 (100 %).** Every user story has a matching bullet in the
`[HTML]` department cards, and every bullet maps back to exactly one story.

---

## Cross-department dependencies

These four break the department boundary and must be sequenced across teams:

| Dependent | Requires | Evidence |
|---|---|---|
| `FR-REC-04` Print receipt (D01) | `FR-ACC-01` Collect payment (D05) | AC-04: "Given a payment is successful" |
| `FR-MEM-03` Renew (D04) | `FR-ACC-01` Collect payment (D05) | AC-18: "When a renewal payment is completed" |
| `FR-ADM-05` Monitor all (D03) | D01, D02, D04, D05 | AC-15: "summary updates from all departments" |
| `FR-ACC-05` Overdue (D05) | `FR-MEM-01` Plans (D04) | AC-25: dues arise from plan pricing |

---

## Membership creation — `ENH-19` ⚠️

`US-17`, `US-18`, `US-19` and `US-20` all presuppose a membership exists, but **no user story
or acceptance criterion creates one.** Verified against the original: `AC-01` creates a
*person*, `AC-16` creates a *plan*, and `AC-21` presupposes a *balance due*.

Resolved as **`ENH-19` — ENGINEERING ENHANCEMENT, REQUIRED FOR SYSTEM COMPLETENESS**:
one endpoint (`POST /members/:id/memberships`), owned by the Membership Manager because `D04`
owns every other membership operation. **No new user story was created**, and `AC-01` is left
untouched so it remains testable exactly as written.

Detail: `docs/requirements/ENH-19_MEMBERSHIP_CREATION.md`.

---

## Missing write paths ⚠️

Five acceptance criteria state a precondition that **no user story satisfies**. These are the
most actionable gaps in Lab 1.

| # | Precondition (verbatim) | AC | Data required | Who writes it? |
|---|---|---|---|---|
| 1 | "check-in data is recorded at the entrance" | AC-14 | Attendance events | **Undefined** — blocks US-05 *and* US-14 |
| 2 | "a member has a health condition logged" | AC-10 | Medical restrictions | **Undefined** — blocks US-10 |
| 3 | "a machine needs regular service" | AC-13 | Equipment register | **Undefined** — blocks US-13 |
| 4 | "an approved refund request" | AC-24 | Refund requests + approval | **Undefined** — blocks US-24 |
| 5 | "a new staff member registers for access" | AC-11 | Staff self-registration | **Undefined** — blocks US-11 |

Plus two implied-but-unowned records: **prospect** (AC-03) and **plan template library**
(AC-06, "chooses or creates").

---

## Format compliance against the Experiment 1 handout

`[EXP1]` template: *"As a &lt;type of user&gt;, I want &lt;to perform some task&gt; so that I
can &lt;achieve some goal/benefit/value&gt;"*

| Check | Result |
|---|---|
| Stories in "As a … I want … so that …" form | **24 / 25** — `US-23` omits the task verb |
| Stories with an acceptance criterion | **25 / 25** |
| Criteria in Given / When / Then form | **25 / 25** |
| Stories with a **second** criterion (rejection path) | **0 / 25** — `INC-01`, heading reads "Accepatnce 1:" |
| Definition of Done supplied | **❌** — required by `[EXP1]` learning outcome 2 |
| Requirement document versioning | **❌** — required by `[EXP1]` learning outcome 3 |
| Textual defects carried from source | 6 — US-02, US-03, US-04, US-19, US-23, US-25 (all marked `[sic]`) |

---

## Verification note

The FR ↔ NFR pairings in this matrix were **not** inferred from PDF reading order. Each row of
the `[LAB2]` Part B table was extracted with per-line bounding-box coordinates; every FR cell
and its NFR cell share an identical y-coordinate (left column x ≈ 83.3, right column x ≈ 255.8).
All 25 pairings are therefore exact, not reconstructed.

# Lab 2 — Non-Functional Requirements Traceability

**Primary source:** `reference/lab2/I025_Dhrupad Gupta_SE_Lab2.pdf` — Part B, pp.6–7
**Handout:** `reference/experiments/EXP-2-SE.docx` (Experiment 2)
**Cross-referenced:** `reference/lab1/I025_Dhrupad Gupta_SE_LAB_1 (1).pdf`,
`reference/design/gym-management-homepage-2.html`

**Coverage:** 25 non-functional requirements, each bound 1:1 to a functional requirement.

**Status:** 🟡 **Phase 3 — database layer only.**

⚠️ **0 of 25 NFRs are VERIFIED.** Phase 3 delivered database *support*; verification requires
the service, API and measurement layers. Per the testing skill, an unexecuted test is
`NOT RUN`, never `PASS`.

| Metric | Phase 3 |
|---|---|
| NFRs with database support | 12 of 25 |
| NFRs with an implementation (full stack) | **0** |
| NFRs **verified** | **0 / 25** |

Database support delivered: `NFR-01` outbox (email off the critical path) · `NFR-02` CHECK
constraints + uniqueness · `NFR-07`/`NFR-13` WAL + `synchronous = FULL` + no hard-delete path ·
`NFR-09` plan versioning · `NFR-10` `TrainerAssignment` + index · `NFR-12` branch scoping
without isolation · `NFR-14` `AttendanceDaily` pre-aggregate · `NFR-17` transition trigger ·
`NFR-19` outbox with attempt counter · `NFR-22` idempotency keys · `NFR-23` ledger index ·
`NFR-24` integer minor units, append-only ledger, over-refund trigger.

---

## Extraction integrity

The `[LAB2]` Part B table is a two-column FR/NFR layout. Linear PDF text extraction returns
the two columns as separate blobs, which would make the pairings guesswork. Instead, every
text line was extracted **with bounding-box coordinates**:

- Functional-requirement cells: `x ≈ 83.3`
- Non-functional-requirement cells: `x ≈ 255.8`
- **Every FR/NFR pair shares an identical `y` value** (e.g. `y = 268.7` → "Register new
  members" ‖ "Performance: Member registration should be completed within 3 seconds.")

All 25 pairings below are therefore **exact**, not reconstructed from reading order.

---

## Legend

| Marker | Meaning |
|---|---|
| ✅ | Quantified — a concrete, testable threshold is stated |
| ⚠️ | Partially quantified — binary or conditional, but decidable |
| ❌ | **Not quantified** — fails the `[EXP2]` "bad smell" test (see §4) |
| ⬜ | Not implemented / not verified |

---

## 1. The 25 NFRs

### NFR-01 — Performance

| Field | Value |
|---|---|
| **Requirement** | "Member registration should be completed within 3 seconds." |
| **Source** | `[LAB2]` p.6, row 1 (`y=268.7`) |
| **Bound FR** | `FR-REC-01` Register new members · `US-01` / `AC-01` · D01 Reception |
| **Quantified** | ✅ **3 s** |
| **Verification** | Performance test — measure form submit → profile created + Member ID returned |
| **Threshold** | p95 ≤ 3000 ms |
| **Risk** | AC-01 also sends a welcome email. If sent synchronously the email provider's latency is inside the budget → **dispatch asynchronously** |
| **Status** | ⬜ |

### NFR-02 — Data Integrity

| Field | Value |
|---|---|
| **Requirement** | "The system should validate all member information before saving." |
| **Source** | `[LAB2]` p.6, row 2 (`y=240.7`) |
| **Bound FR** | `FR-REC-02` Verify member details · `US-02` / `AC-02` · D01 |
| **Quantified** | ❌ — "all member information" is unenumerated |
| **Verification** | Unit + integration tests per field rule |
| **Blocker** | `INC-05` — **no field rules exist anywhere.** AC-01 names only Name, Email, Phone; no formats, lengths, required-ness or uniqueness constraints are stated |
| **Assumption needed** | Email RFC-conformant + unique; phone digits/length per locale; name non-empty |
| **Status** | ⬜ |

### NFR-03 — Availability

| Field | Value |
|---|---|
| **Requirement** | "The scheduling system should be available 99.9% of the time." |
| **Source** | `[LAB2]` p.6, row 3 (`y=212.5`) |
| **Bound FR** | `FR-REC-03` Schedule trial sessions · `US-03` / `AC-03` · D01 |
| **Quantified** | ✅ **99.9 %** (≈ 43m 50s downtime/month) |
| **Verification** | Uptime monitoring against the scheduling endpoints |
| **Note** | Scopes "the scheduling system" — presumably shared with `NFR-08` (`FR-TRN-03`), but `NFR-08` states a *different* availability rule for the same subsystem. See **§5 Conflict N-1** |
| **Status** | ⬜ |

### NFR-04 — Reliability

| Field | Value |
|---|---|
| **Requirement** | "Payment receipts should be generated accurately without errors." |
| **Source** | `[LAB2]` p.6, row 4 (`y=184.5`) |
| **Bound FR** | `FR-REC-04` Print payment receipts · `US-04` / `AC-04` · D01 |
| **Quantified** | ❌ — "without errors" states no rate or tolerance |
| **Verification** | Golden-file tests: receipt content matches the payment record exactly |
| **Ambiguity** | `AMB-16` — "print" undefined (printer / PDF / browser dialog). Contrast `AC-22`, which explicitly says PDF for invoices |
| **Status** | ⬜ |

### NFR-05 — Usability

| Field | Value |
|---|---|
| **Requirement** | "Attendance records should be easy to access and understand." |
| **Source** | `[LAB2]` p.6, row 5 (`y=156.5`) |
| **Bound FR** | `FR-REC-05` Check member attendance · `US-05` / `AC-05` · D01 |
| **Quantified** | ❌ — "easy" is not measurable as written |
| **Verification** | Usability testing (task success rate / time on task) — `[EXP9]` lists "Usability Testing" as a type |
| **Note** | Could be operationalised as: reachable in ≤ N clicks; totals and lapsed list visible without scrolling at 1180px |
| **Status** | ⬜ |

### NFR-06 — Performance

| Field | Value |
|---|---|
| **Requirement** | "Workout plans should load within 2 seconds." |
| **Source** | `[LAB2]` p.6, row 6 (`y=128.2`) |
| **Bound FR** | `FR-TRN-01` Assign workout plans · `US-06` / `AC-06` · D02 Trainer |
| **Quantified** | ✅ **2 s** |
| **Verification** | Performance test on plan load |
| **Note** | Says *load*, not *assign* — this is a **read** budget, while `NFR-01`/`NFR-18` are **write** budgets |
| **Status** | ⬜ |

### NFR-07 — Reliability

| Field | Value |
|---|---|
| **Requirement** | "Member progress should be saved accurately without data loss." |
| **Source** | `[LAB2]` p.6, row 7 (`y=100.2`) |
| **Bound FR** | `FR-TRN-02` Record member progress · `US-07` / `AC-07` · D02 |
| **Quantified** | ❌ — "without data loss" states no durability target |
| **Verification** | Transactional integrity tests; crash-recovery test |
| **Note** | Implies durable writes (committed transactions, backups). Overlaps `NFR-13`, which makes the same absolute claim for equipment records |
| **Status** | ⬜ |

### NFR-08 — Availability

| Field | Value |
|---|---|
| **Requirement** | "Training schedules should always be accessible during working hours." |
| **Source** | `[LAB2]` p.7, row 8 (`y=767.1`) |
| **Bound FR** | `FR-TRN-03` Schedule personal training sessions · `US-08` / `AC-08` · D02 |
| **Quantified** | ❌ — **`AMB-04`: "working hours" is undefined.** No opening hours, timezone, or holiday calendar exists in any source |
| **Verification** | Uptime monitoring — **cannot be scoped until "working hours" is defined** |
| **Conflict** | See **§5 Conflict N-1** — 100 % during working hours vs `NFR-03`'s 99.9 % always, for the same scheduling subsystem |
| **Status** | ⬜ |

### NFR-09 — Maintainability

| Field | Value |
|---|---|
| **Requirement** | "Exercise routines should be easy to update without affecting existing data." |
| **Source** | `[LAB2]` p.7, row 9 (`y=739.1`) |
| **Bound FR** | `FR-TRN-04` Update exercise routines · `US-09` / `AC-09` · D02 |
| **Quantified** | ❌ |
| **Verification** | Regression tests proving historical progress records survive a routine edit |
| **Note** | ⚠️ The **only** Maintainability NFR. Per `[EXP2]`, maintainability is "the ease with which you can **change the software**" — a developer property. Here it is applied to a *user action*, so it reads as a mis-categorised **Data Integrity** requirement. "without affecting existing data" implies **plan versioning**, which no story defines |
| **Status** | ⬜ |

### NFR-10 — Security

| Field | Value |
|---|---|
| **Requirement** | "Medical information should only be accessible to authorized trainers." |
| **Source** | `[LAB2]` p.7, row 10 (`y=710.9`) |
| **Bound FR** | `FR-TRN-05` View member medical restrictions · `US-10` / `AC-10` · D02 |
| **Quantified** | ⚠️ Binary — decidable, but "authorized" is undefined |
| **Verification** | Access-control tests: every non-trainer role receives 403 on medical fields |
| **Blocker** | `AMB-03` — **no authentication or authorisation model exists in any source** |
| **Note** | Says "**authorized** trainers", not "trainers". Requirement wording preserved verbatim above. |
| **Interpretation (B-05 review)** | ⚠️ **Genuinely ambiguous — the source does not decide it.** *Reading A (role-based):* any user with the Trainer role, by parallel construction with `NFR-21` "authorized **staff**". *Reading B (per-member):* only trainers assigned to that member — supported because "authorized" would be redundant under Reading A. **Reading B is chosen** because it is a strict subset of A: implementing B satisfies the requirement under **both** readings, whereas implementing A fails if B was intended. See `docs/decisions/DEVIATIONS.md` §2. |
| **Consequence** | Reading B needs a `TrainerAssignment` record that **no user story creates**. Minimum implementation: create it as a side effect of `AC-06` (a trainer assigning a workout plan is authorised for that member). Tracked as `ENH-20`, **IMPLIED-MANDATORY**. |
| **Status** | ⬜ |

### NFR-11 — Security

| Field | Value |
|---|---|
| **Requirement** | "Only administrators should be able to approve staff accounts." |
| **Source** | `[LAB2]` p.7, row 11 (`y=682.9`) |
| **Bound FR** | `FR-ADM-01` Approve new staff accounts · `US-11` / `AC-11` · D03 Administration |
| **Quantified** | ⚠️ Binary — decidable |
| **Verification** | Access-control test: all four non-admin roles are denied the approve action |
| **Blocker** | `AMB-03` |
| **Note** | The clearest, most directly testable NFR in `[LAB2]` — restates `US-11`'s own "so that" clause |
| **Status** | ⬜ |

### NFR-12 — Scalability

| Field | Value |
|---|---|
| **Requirement** | "The system should support multiple gym branches efficiently." |
| **Source** | `[LAB2]` p.7, row 12 (`y=654.6`) |
| **Bound FR** | `FR-ADM-02` Manage gym branches · `US-12` / `AC-12` · D03 |
| **Quantified** | ❌ — **no branch count, no member count, no concurrency figure** (`INC-07`) |
| **Verification** | Load test — **impossible to specify without a target volume** |
| **Blocker** | ⚠️ `AMB-05` — the branch data model is undefined (are members/staff/equipment/plans branch-scoped or global?). This NFR cannot be designed for, let alone tested |
| **Note** | The **only** Scalability NFR, and the least actionable in the set |
| **Status** | ⬜ |

### NFR-13 — Reliability

| Field | Value |
|---|---|
| **Requirement** | "Equipment maintenance records should never be lost." |
| **Source** | `[LAB2]` p.7, row 13 (`y=626.6`) |
| **Bound FR** | `FR-ADM-03` Maintain equipment schedules · `US-13` / `AC-13` · D03 |
| **Quantified** | ❌ — **"never" is an absolute; strictly untestable** |
| **Verification** | Backup/restore test; soft-delete + audit-trail verification |
| **Note** | Exactly the "bad smell" `[EXP2]` warns about — one cannot answer *"How will I know when this story is correctly done?"* Realistically: soft deletes, retained history, tested restores |
| **Status** | ⬜ |

### NFR-14 — Performance

| Field | Value |
|---|---|
| **Requirement** | "Attendance reports should be generated within 5 seconds." |
| **Source** | `[LAB2]` p.7, row 14 (`y=598.6`) |
| **Bound FR** | `FR-ADM-04` Monitor daily gym attendance · `US-14` / `AC-14` · D03 |
| **Quantified** | ✅ **5 s** |
| **Verification** | Performance test on report generation incl. peak-hours aggregation |
| **Blocker** | `AMB-15` — **no story records check-in data**; there is nothing to report on |
| **Note** | 5 s is the report budget, matching `NFR-23`; interactive reads get 2–3 s |
| **Status** | ⬜ |

### NFR-15 — Availability

| Field | Value |
|---|---|
| **Requirement** | "The monitoring dashboard should be available 99.9% of the time." |
| **Source** | `[LAB2]` p.7, row 15 (`y=570.3`) |
| **Bound FR** | `FR-ADM-05` Monitor department activities · `US-15` / `AC-15` · D03 |
| **Quantified** | ✅ **99.9 %** |
| **Verification** | Uptime monitoring on the dashboard endpoint |
| **Note** | ⚠️ Hardest availability target to hold: `AC-15` aggregates **all five modules**, so the dashboard's effective availability is the product of its dependencies unless it degrades gracefully. **Design implication: per-module failure isolation** |
| **Status** | ⬜ |

### NFR-16 — Usability

| Field | Value |
|---|---|
| **Requirement** | "Membership plans should be easy to create and modify." |
| **Source** | `[LAB2]` p.7, row 16 (`y=542.3`) |
| **Bound FR** | `FR-MEM-01` Create membership plans · `US-16` / `AC-16` · D04 Membership |
| **Quantified** | ❌ |
| **Verification** | Usability testing |
| **Gap** | ⚠️ This NFR names **"modify"**, but **no user story covers plan modification** — `US-16` is create-only. The NFR asserts a capability that the FR set does not contain |
| **Status** | ⬜ |

### NFR-17 — Data Integrity

| Field | Value |
|---|---|
| **Requirement** | "Only valid inactive memberships should be cancelled." |
| **Source** | `[LAB2]` p.7, row 17 (`y=514.1`) |
| **Bound FR** | `FR-MEM-02` Cancel inactive memberships · `US-17` / `AC-17` · D04 |
| **Quantified** | ❌ — `AMB-07`: **"valid" is undefined** |
| **Verification** | State-machine tests: only permitted source states may transition to Cancelled |
| **Blocker** | The membership state set is never defined (`AMB-07`, `ASM-13`). `AC-17` allows *expired* **or** *cancellation requested* — two different triggers, and "inactive" matches neither exactly |
| **Status** | ⬜ |

### NFR-18 — Performance

| Field | Value |
|---|---|
| **Requirement** | "Membership renewal should be completed within 2 seconds." |
| **Source** | `[LAB2]` p.7, row 18 (`y=486.1`) |
| **Bound FR** | `FR-MEM-03` Renew memberships · `US-18` / `AC-18` · D04 |
| **Quantified** | ✅ **2 s** |
| **Verification** | Performance test on the renewal transaction |
| **Risk** | ⚠️ **`AC-18` makes renewal depend on a completed payment.** A 2 s budget cannot absorb a third-party gateway round-trip. Either the budget excludes payment settlement, or renewal must be asynchronous. Compare `NFR-01`, which allows 3 s for a *simpler* operation. See **§5 Conflict N-2** |
| **Status** | ⬜ |

### NFR-19 — Reliability

| Field | Value |
|---|---|
| **Requirement** | "Renewal reminders should be delivered successfully." |
| **Source** | `[LAB2]` p.7, row 19 (`y=458.0`) |
| **Bound FR** | `FR-MEM-04` Send renewal reminders · `US-19` / `AC-19` · D04 |
| **Quantified** | ❌ — no delivery rate; "successfully" undefined (sent? accepted? opened?) |
| **Verification** | Delivery-rate monitoring; retry-on-failure tests |
| **Note** | ⚠️ Delivery depends on third-party email/SMS providers **outside system control** — a reliability target the system cannot unilaterally meet. Realistically: *dispatched* with retry, not *delivered*. `AMB-12` — no provider or channel policy stated |
| **Status** | ⬜ |

### NFR-20 — Availability

| Field | Value |
|---|---|
| **Requirement** | "Membership status should be available whenever requested." |
| **Source** | `[LAB2]` p.7, row 20 (`y=429.8`) |
| **Bound FR** | `FR-MEM-05` Track membership status · `US-20` / `AC-20` · D04 |
| **Quantified** | ❌ — "whenever requested" implies 100 % uptime, which is unachievable |
| **Verification** | Uptime monitoring |
| **Note** | Reads as an informal restatement of `NFR-03`/`NFR-15`'s 99.9 %. Taken literally it is stricter than every other availability NFR in the document |
| **Status** | ⬜ |

### NFR-21 — Security

| Field | Value |
|---|---|
| **Requirement** | "Payment information should be encrypted and accessible only to authorized staff." |
| **Source** | `[LAB2]` p.7, row 21 (`y=401.8`) |
| **Bound FR** | `FR-ACC-01` Collect membership payments · `US-21` / `AC-21` · D05 Accounting |
| **Quantified** | ⚠️ Binary on access; ❌ on encryption (no algorithm, key management, or scope) |
| **Verification** | Encryption-at-rest verification; access-control tests per role |
| **Blocker** | `AMB-03`. Also: `AC-21` accepts **online** payment, implying a gateway that no source names |
| **Note** | ⚠️ **Highest-risk NFR.** The `[EXP2]` handout's sample constraints demonstrate the expected pattern here (mask all but the last 4 digits of a card; log every payment-information change with IP, old/new value, timestamp) — but those are **handout examples, not Ironboard requirements**. `[LAB2]` produced no project-specific constraints (`INC-02`) |
| **Status** | ⬜ |

### NFR-22 — Reliability

| Field | Value |
|---|---|
| **Requirement** | "Invoices should be generated accurately every time." |
| **Source** | `[LAB2]` p.7, row 22 (`y=373.8`) |
| **Bound FR** | `FR-ACC-02` Generate invoices · `US-22` / `AC-22` · D05 |
| **Quantified** | ❌ — "every time" is absolute; "accurately" undefined |
| **Verification** | Golden-file tests on PDF content; idempotency tests on the billing trigger |
| **Note** | `AC-22` allows automatic **or** manual triggering → **duplicate-invoice risk**. Invoices normally require gapless sequential numbering, which no source specifies (`INC-06`) |
| **Status** | ⬜ |

### NFR-23 — Performance

| Field | Value |
|---|---|
| **Requirement** | "Revenue reports should be generated within 5 seconds." |
| **Source** | `[LAB2]` p.7, row 23 (`y=345.5`) |
| **Bound FR** | `FR-ACC-03` Review revenue reports · `US-23` / `AC-23` · D05 |
| **Quantified** | ✅ **5 s** |
| **Verification** | Performance test across representative date ranges |
| **Blocker** | `INC-08` — no date-range bounds are specified. A 5 s budget for "one day" and for "five years" are different engineering problems. `INC-07` — no data volume given |
| **Note** | `CON-04` — the bound FR is variously "Review" `[LAB2]` / "Generate" `[LAB1]` / "Produce" `[HTML]`. This NFR says "**generated**", siding with `[LAB1]` |
| **Status** | ⬜ |

### NFR-24 — Data Integrity

| Field | Value |
|---|---|
| **Requirement** | "Refund transactions should maintain accurate financial records." |
| **Source** | `[LAB2]` p.7, row 24 (`y=317.5`) |
| **Bound FR** | `FR-ACC-04` Process refunds · `US-24` / `AC-24` · D05 |
| **Quantified** | ❌ |
| **Verification** | Ledger-balance invariant tests; double-entry reconciliation |
| **Note** | The strongest case for an **append-only audit log**: `AC-24` requires "log the transaction", `AC-23` reads from "system transaction logs", and `NFR-24` requires accuracy — three requirements pointing at one ledger that no story defines |
| **Status** | ⬜ |

### NFR-25 — Availability

| Field | Value |
|---|---|
| **Requirement** | "Overdue payment information should be available whenever required." |
| **Source** | `[LAB2]` p.7, row 25 (`y=289.2`) |
| **Bound FR** | `FR-ACC-05` Track overdue payments · `US-25` / `AC-25` · D05 |
| **Quantified** | ❌ — same unbounded phrasing as `NFR-20` |
| **Verification** | Uptime monitoring |
| **Note** | "Overdue" cannot be computed without a due-date and grace-period model, which no source provides (`INC-06`) |
| **Status** | ⬜ |

---

## 2. Summary matrix — all 25 NFRs

| NFR | Category | Bound FR | US | Dept | Quantified | Threshold | Verification | Status |
|---|---|---|---|---|---|---|---|---|
| NFR-01 | Performance | FR-REC-01 | US-01 | D01 | ✅ | 3 s | Perf test | ⬜ |
| NFR-02 | Data Integrity | FR-REC-02 | US-02 | D01 | ❌ | — | Unit/integration | ⬜ |
| NFR-03 | Availability | FR-REC-03 | US-03 | D01 | ✅ | 99.9 % | Uptime monitor | ⬜ |
| NFR-04 | Reliability | FR-REC-04 | US-04 | D01 | ❌ | — | Golden-file | ⬜ |
| NFR-05 | Usability | FR-REC-05 | US-05 | D01 | ❌ | — | Usability test | ⬜ |
| NFR-06 | Performance | FR-TRN-01 | US-06 | D02 | ✅ | 2 s | Perf test | ⬜ |
| NFR-07 | Reliability | FR-TRN-02 | US-07 | D02 | ❌ | — | Transactional | ⬜ |
| NFR-08 | Availability | FR-TRN-03 | US-08 | D02 | ❌ | "working hours" | Uptime monitor | ⬜ |
| NFR-09 | Maintainability | FR-TRN-04 | US-09 | D02 | ❌ | — | Regression | ⬜ |
| NFR-10 | Security | FR-TRN-05 | US-10 | D02 | ⚠️ | binary | Access control | ⬜ |
| NFR-11 | Security | FR-ADM-01 | US-11 | D03 | ⚠️ | binary | Access control | ⬜ |
| NFR-12 | Scalability | FR-ADM-02 | US-12 | D03 | ❌ | — | Load test | ⬜ |
| NFR-13 | Reliability | FR-ADM-03 | US-13 | D03 | ❌ | "never" | Backup/restore | ⬜ |
| NFR-14 | Performance | FR-ADM-04 | US-14 | D03 | ✅ | 5 s | Perf test | ⬜ |
| NFR-15 | Availability | FR-ADM-05 | US-15 | D03 | ✅ | 99.9 % | Uptime monitor | ⬜ |
| NFR-16 | Usability | FR-MEM-01 | US-16 | D04 | ❌ | — | Usability test | ⬜ |
| NFR-17 | Data Integrity | FR-MEM-02 | US-17 | D04 | ❌ | "valid" | State machine | ⬜ |
| NFR-18 | Performance | FR-MEM-03 | US-18 | D04 | ✅ | 2 s | Perf test | ⬜ |
| NFR-19 | Reliability | FR-MEM-04 | US-19 | D04 | ❌ | — | Delivery rate | ⬜ |
| NFR-20 | Availability | FR-MEM-05 | US-20 | D04 | ❌ | — | Uptime monitor | ⬜ |
| NFR-21 | Security | FR-ACC-01 | US-21 | D05 | ⚠️ | binary | Access + crypto | ⬜ |
| NFR-22 | Reliability | FR-ACC-02 | US-22 | D05 | ❌ | "every time" | Golden-file | ⬜ |
| NFR-23 | Performance | FR-ACC-03 | US-23 | D05 | ✅ | 5 s | Perf test | ⬜ |
| NFR-24 | Data Integrity | FR-ACC-04 | US-24 | D05 | ❌ | — | Ledger invariant | ⬜ |
| NFR-25 | Availability | FR-ACC-05 | US-25 | D05 | ❌ | — | Uptime monitor | ⬜ |

---

## 3. Distribution

### 3.1 By category

| Category | Count | % | NFR IDs |
|---|---|---|---|
| Availability | 5 | 20 % | 03, 08, 15, 20, 25 |
| Performance | 5 | 20 % | 01, 06, 14, 18, 23 |
| Reliability | 5 | 20 % | 04, 07, 13, 19, 22 |
| Data Integrity | 3 | 12 % | 02, 17, 24 |
| Security | 3 | 12 % | 10, 11, 21 |
| Usability | 2 | 8 % | 05, 16 |
| Maintainability | 1 | 4 % | 09 |
| Scalability | 1 | 4 % | 12 |

### 3.2 By department

| Dept | NFRs | Categories represented |
|---|---|---|
| D01 Reception | 5 | Performance, Data Integrity, Availability, Reliability, Usability |
| D02 Trainer | 5 | Performance, Reliability, Availability, Maintainability, Security |
| D03 Administration | 5 | Security, Scalability, Reliability, Performance, Availability |
| D04 Membership | 5 | Usability, Data Integrity, Performance, Reliability, Availability |
| D05 Accounting | 5 | Security, Reliability, Performance, Data Integrity, Availability |

Even distribution — 5 per department, and every department carries an Availability NFR.

### 3.3 Quantified thresholds actually stated

| Threshold | NFRs | Operations |
|---|---|---|
| **2 s** | NFR-06, NFR-18 | Workout plan load; membership renewal |
| **3 s** | NFR-01 | Member registration |
| **5 s** | NFR-14, NFR-23 | Attendance reports; revenue reports |
| **99.9 %** | NFR-03, NFR-15 | Scheduling system; monitoring dashboard |
| **Binary** | NFR-10, NFR-11, NFR-21 | Access restrictions |

An implicit performance budget is discernible: **interactive writes 2–3 s, reports 5 s.**

---

## 3.4 Verification thresholds — ADR-012 resolved

All 25 NFRs now have a threshold. **Source-provided figures (🟩) and project-chosen figures
(🟦) are strictly separated** in `docs/requirements/NFR_VERIFICATION_THRESHOLDS.md`.

| Category | Count | Reported as |
|---|---|---|
| 🟩 Source thresholds | 10 | `PASS` / `FAIL` |
| 🟩 …proxy-verified only (`NFR-03`, `NFR-15` — 99.9 % not demonstrable at project scale) | 2 | `PASS (PROXY)` |
| 🟦 Engineering verification thresholds | 15 | **`PASS (ENGINEERING THRESHOLD)`** |
| 🟦 …proxies for unfalsifiable absolutes (`NFR-13`, `NFR-22`) | 2 | `PASS (PROXY)` |

⚠️ **No 🟦 figure may be cited as an academic requirement.** Thresholds are scaled for a
student/college local project — no production SLA is claimed anywhere.

---

## 4. Measurability assessment

| Result | Count | % |
|---|---|---|
| ✅ Quantified | 7 | 28 % |
| ⚠️ Binary / decidable | 3 | 12 % |
| ❌ Not quantified | 15 | **60 %** |

`[EXP2]` states the test these 15 fail, in its own words:

> *"If you cannot quantify the story in concrete terms, this should be a bad smell that usually
> indicates a requirement that is too vague to be implemented. Vague NRF's have the same
> problems that vague functional requirements do: It is hard to answer the question 'How will I
> know when this story is correctly done?'"*

### The 15 unquantified NFRs

| NFR | Vague phrase | What is missing |
|---|---|---|
| NFR-02 | "validate all member information" | Field-level rules (`INC-05`) |
| NFR-04 | "accurately without errors" | Error rate / tolerance |
| NFR-05 | "easy to access and understand" | Usability metric |
| NFR-07 | "without data loss" | Durability target (RPO) |
| NFR-08 | "always … during working hours" | Definition of working hours (`AMB-04`) |
| NFR-09 | "easy to update without affecting existing data" | Versioning semantics |
| NFR-12 | "multiple … efficiently" | Branch/member/concurrency counts (`INC-07`) |
| NFR-13 | "never be lost" | Retention & recovery policy |
| NFR-16 | "easy to create and modify" | Usability metric |
| NFR-17 | "only valid inactive" | Definition of "valid" (`AMB-07`) |
| NFR-19 | "delivered successfully" | Delivery rate; definition of success |
| NFR-20 | "whenever requested" | Availability % |
| NFR-22 | "accurately every time" | Accuracy criteria |
| NFR-24 | "maintain accurate financial records" | Reconciliation rules |
| NFR-25 | "whenever required" | Availability % |

> **Do not silently invent thresholds for these.** Any numeric target adopted during
> implementation must be recorded as an explicit assumption (`ASM-10`), not presented as a
> sourced requirement.

---

## 5. Internal conflicts among the NFRs

### `N-1` — Two different availability rules for the same subsystem
`NFR-03` (trial scheduling): **"available 99.9% of the time"**
`NFR-08` (training scheduling): **"always accessible during working hours"**
Both govern scheduling. One states a global percentage; the other states an absolute
guarantee over an undefined window. Not reconcilable as written.

### `N-2` — Renewal budget is tighter than registration, despite being heavier
`NFR-01` allows **3 s** for member registration.
`NFR-18` allows **2 s** for membership renewal — but `AC-18` requires a **completed payment**
first. The more expensive operation has the smaller budget.

### `N-3` — Availability phrasing is inconsistent across the set
`NFR-03`/`NFR-15` state **99.9 %**. `NFR-20`/`NFR-25` say "whenever requested"/"whenever
required" (literally 100 %). `NFR-08` says "always … during working hours". Three different
formulations of one quality attribute.

### `N-4` — `NFR-16` requires a capability no FR provides
"Membership plans should be easy to create **and modify**" — but `US-16` is create-only and
no story covers plan modification.

### `N-5` — Absolute reliability claims cannot be verified
`NFR-13` "never be lost" and `NFR-22` "accurately every time" are unfalsifiable as stated.

---

## 6. NFR categories taught but not applied

`[EXP2]` lists 14 elicitation aspects plus 5 quality attributes. `[LAB2]` used 8.
**Absent from `[LAB2]`:** Data Retention · Stability · Compliance · Recoverability ·
Serviceability · Capacity · Accessibility · Confidentiality · Efficiency · Portability ·
Reusability.

> These are **not** Ironboard requirements and must not be treated as mandatory. They are
> recorded only as a gap against the `[EXP2]` learning outcomes.

Two are worth flagging as risks rather than requirements:

- **Accessibility** — absent from `[LAB2]`, yet `[HTML]` already implements
  `prefers-reduced-motion`, `:focus-visible` focus rings, `aria-hidden` on decorative
  elements, and AAA-level contrast throughout. The design is *more* accessible than the
  requirements ask for.
- **Confidentiality** — absent, although `NFR-10` (medical data) and `NFR-21` (payment data)
  both handle sensitive information. `[EXP2]`'s sample constraint (mask all but the last 4
  digits of a card number) illustrates exactly the pattern that is missing here.

---

## 7. Constraints and Definition of Done — status

`[EXP2]` Step 2 requires that NFR story tests be added to a **published Constraints list** and
to the **Definition of Done**.

| Artefact | `[EXP2]` requirement | `[LAB2]` delivered | Status |
|---|---|---|---|
| Story tests per NFR | Required | None | ❌ `INC-03` |
| Project Constraints list | Required, "published … highly visible" | None | ❌ `INC-02` |
| Definition of Done | Required | None | ❌ `INC-02` |
| NFRs written as **user stories** | Required by LO 2 | Table only | ❌ `INC-03` |

### ⚠️ The `[EXP2]` Constraints and DoD tables are handout samples

`[EXP2]` contains populated Constraints and Definition-of-Done tables. Their contents refer to
search/non-search response times, a 10-second inactivity logout, a `payment_preferences` log,
credit-card masking, a wiki, peer review within 4 hours of check-in, and a QA integration
environment.

**These are generic teaching examples. They are NOT Ironboard requirements** and must never be
cited as such. They are reproduced nowhere in this document as project obligations — only
referenced under `NFR-21` as an illustration of the *pattern* `[LAB2]` was expected to follow.

---

## 8. Design implications carried by the NFR set

Derived from the requirements above; each is a consequence, not a new requirement.

| # | Implication | Driven by |
|---|---|---|
| 1 | **Role-based access control is foundational** — three NFRs are unsatisfiable without it | NFR-10, 11, 21 |
| 2 | **Encryption at rest** for payment and medical data | NFR-21, NFR-10 |
| 3 | **Asynchronous notification dispatch** — email/SMS must sit outside request budgets | NFR-01 vs AC-01; NFR-19 |
| 4 | **Append-only audit log** for payments, refunds and approvals | NFR-24, NFR-21, AC-23 |
| 5 | **Explicit membership state machine** — feeds the required State Chart diagram | NFR-17, WF-02 |
| 6 | **Branch as a first-class scoping boundary** | NFR-12, AMB-05 |
| 7 | **Report query optimisation / pre-aggregation** to hold the 5 s budgets | NFR-14, NFR-23 |
| 8 | **Graceful degradation on the admin dashboard** — it aggregates all five modules | NFR-15 |
| 9 | **Durable, transactional writes with tested restores** | NFR-07, NFR-13 |
| 10 | **Field-level validation layer** shared across entry points | NFR-02 |
| 11 | **Idempotent invoice generation** — two trigger paths, one artefact | NFR-22, AC-22 |
| 12 | **Performance budgets in CI** for the five quantified timing NFRs | NFR-01, 06, 14, 18, 23 |

---

## 9. Verification plan skeleton

Not yet executable — recorded so testing work has a defined starting point.

| Verification type | NFRs covered | Tooling | Blocked by |
|---|---|---|---|
| Performance test | 01, 06, 14, 18, 23 | Load/latency harness in CI | `INC-07` no data volumes |
| Uptime monitoring | 03, 08, 15, 20, 25 | Availability probes | `AMB-04` "working hours"; 3 unquantified |
| Access-control test | 10, 11, 21 | Integration tests per role | `AMB-03` no auth model |
| Data-integrity test | 02, 17, 24 | Unit + state-machine tests | `INC-05`, `AMB-07` |
| Durability test | 07, 13 | Crash-recovery, backup/restore | No RPO/RTO stated |
| Golden-file test | 04, 22 | Snapshot comparison | `AMB-16` receipt format |
| Regression test | 09 | Historical-data preservation | No versioning model |
| Usability test | 05, 16 | Task success / time on task | No usability metric |
| Load test | 12 | Scaled branch fixtures | `AMB-05`, `INC-07` |
| Delivery monitoring | 19 | Provider webhooks + retry | `AMB-12` no provider |

**8 of the 10 verification types are currently blocked by an unresolved ambiguity or
incompleteness.** Resolving `AMB-03` (auth model), `AMB-05` (branch scoping) and `INC-07`
(volumes) unblocks the majority.

---

## 10. Cross-references

| Document | Relationship |
|---|---|
| `docs/project/REFERENCE_ANALYSIS.md` | Full source extraction; §7 covers these NFRs, §14–17 the conflicts, ambiguities and assumptions |
| `docs/project/REQUIREMENT_GAP_ANALYSIS.md` | Risk-ranked gaps and resolution owners |
| `docs/requirements/LAB1_TRACEABILITY_MATRIX.md` | The 25 bound functional requirements, stories and acceptance criteria |
| `docs/ui/DESIGN_SYSTEM.md` | Accessibility and interaction behaviour already present in the homepage source |

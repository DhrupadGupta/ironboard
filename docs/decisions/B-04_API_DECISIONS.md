# B-04 — Blocked Endpoints: Decision Record

**Status:** ✅ **RESOLVED** · **Date:** 2026-08-16
**Authority:** original `reference/lab1/` and `reference/lab2/`
**Supersedes:** `API_ARCHITECTURE.md` §12 (six endpoints marked BLOCKED)

---

## Headline finding

> **None of the six mandatory endpoints is genuinely blocked.**
>
> Phase 2 mislabelled them. Each was marked BLOCKED because a *proposed enhancement*
> (`ENH-02`…`ENH-06`) did not exist yet — which inverted the correct priority. **A mandatory
> academic requirement was being held hostage by an optional engineering enhancement.**
>
> In two cases the proposed enhancement is also **over-engineered**: the acceptance criterion
> describes the precondition as *external to the system*, so building an in-system workflow to
> satisfy it invents a requirement.

---

## Governing principle

Each blocked endpoint failed for the same structural reason: the acceptance criterion opens
with a **Given** clause describing a precondition, and no user story creates that data
(`AMB-15`, `INC-01`).

A `Given` clause is a **precondition**, not a system obligation. It states the world the
system finds itself in. Some preconditions are genuinely satisfied outside the software
(a manager approves a refund in a meeting); others clearly need an in-system write path
(equipment must exist as a record).

The correct test is therefore: **what is the minimum that makes the mandatory endpoint
correct?** — not "what is the most complete workflow we could build?"

---

## Endpoint 1 — `GET /attendance/members` (`AC-05`)

| Question | Answer |
|---|---|
| 1. What requirement caused it? | `US-05` "As a receptionist, I want to check the members attendance so I can follow up to them." |
| 2. Mandatory or enhancement? | **MANDATORY** |
| 3. Lab 1 story | `US-05` |
| 4. Acceptance criterion | `AC-05` — filter by date or inactive; show total visits + lapsed list |
| 5. NFR | `NFR-05` Usability (unquantified) |
| 6. Why blocked? | `AC-14` states "check-in data is recorded at the entrance"; **no story writes attendance** |
| 7. Is `ENH-02` necessary? | **YES** — attendance rows must reach the database somehow |
| 8. Implementable without it? | **The read endpoint: yes.** It is implementable and testable against seeded data today |
| 9. Minimum correct implementation | `AttendanceEvent` table + **one** write path. Cheapest legitimate owner: a Reception check-in action (Reception owns the front desk, `D01`) |

**Verdict: MANDATORY — NOT BLOCKED.** `ENH-02` is required for production usefulness but does
not gate building or testing the endpoint.

---

## Endpoint 2 — `GET /reports/attendance/daily` (`AC-14`)

| Question | Answer |
|---|---|
| 1. Requirement | `US-14` "monitor daily gym attendance so that I can analyze member activity" |
| 2. Classification | **MANDATORY** |
| 3. Story | `US-14` |
| 4. Criterion | `AC-14` — display total visits and peak busy hours |
| 5. NFR | **`NFR-14` ≤ 5 s** (quantified) |
| 6. Why blocked | Same missing write path as endpoint 1 |
| 7. `ENH-02` necessary? | **YES**, shared with endpoint 1 |
| 8. Without it? | **Yes** — read + aggregation implementable against seeded data |
| 9. Minimum | Shares `ENH-02`. Plus `AttendanceDaily` pre-aggregate for the 5 s budget |

**Verdict: MANDATORY — NOT BLOCKED.**

> `ENH-02` is the highest-value single item in the project: **one write path unblocks two
> mandatory stories across two departments.**

---

## Endpoint 3 — `GET /members/:id/medical` (`AC-10`)

| Question | Answer |
|---|---|
| 1. Requirement | `US-10` "view member medical restrictions so that training is safe" |
| 2. Classification | **MANDATORY** |
| 3. Story | `US-10` |
| 4. Criterion | `AC-10` — display a clear medical alert **before workouts are set** |
| 5. NFR | **`NFR-10` Security** — "accessible to authorized trainers" |
| 6. Why blocked | `AC-10` says "Given a member has a health condition logged"; **no story logs it** |
| 7. `ENH-03` necessary? | **YES** — a read-only medical feature with no capture path is inert |
| 8. Without it? | **Yes** — read endpoint implementable against seeded data |
| 9. Minimum | `MedicalRestriction` table + capture at member registration (`AC-01` already collects member info at Reception) or by a Trainer |

**Verdict: MANDATORY — NOT BLOCKED.**
`ENH-03` scope note: the minimum is **a field captured during registration**, not a separate
medical-records subsystem.

---

## Endpoint 4 — `POST /equipment/:id/maintenance-schedule` (`AC-13`)

| Question | Answer |
|---|---|
| 1. Requirement | `US-13` "maintain equipment maintenance schedules so that all machines remain operational" |
| 2. Classification | **MANDATORY** |
| 3. Story | `US-13` |
| 4. Criterion | `AC-13` — recurring schedule; set reminders; mark "In Maintenance" |
| 5. NFR | `NFR-13` Reliability — "never be lost" (unfalsifiable, ADR-012) |
| 6. Why blocked | `AC-13` says "Given a machine needs regular service"; no story registers equipment |
| 7. `ENH-04` necessary? | **YES — and it is arguably IMPLIED, not merely an enhancement.** You cannot "maintain equipment maintenance schedules" for machines the system does not know about. `US-13` assigns the Administrator responsibility for equipment upkeep, and `US-12` already gives the Administrator estate management |
| 8. Without it? | **No, not meaningfully.** The endpoint takes an `:id` that must exist |
| 9. Minimum | `Equipment` table + admin create/list. **Not** a full asset-management module |

**Verdict: MANDATORY — NOT BLOCKED.**
**Reclassification:** the equipment register moves from *pure enhancement* to
**IMPLIED-MANDATORY** — the minimum necessary for `AC-13` to be satisfiable at all.

---

## Endpoint 5 — `POST /refunds` (`AC-24`)

| Question | Answer |
|---|---|
| 1. Requirement | `US-24` "process refunds so that payment issues are resolved" |
| 2. Classification | **MANDATORY** |
| 3. Story | `US-24` |
| 4. Criterion | `AC-24` — "**Given an approved refund request**, When the accountant enters the refund details, Then send funds back to the member and log the transaction" |
| 5. NFR | `NFR-24` Data Integrity |
| 6. Why blocked | No story creates or approves a refund request |
| 7. `ENH-05` necessary? | ❌ **NO — this was over-engineered.** |
| 8. Without it? | ✅ **YES** |
| 9. Minimum | `Refund` record capturing **who approved and when**, as data fields |

### Why `ENH-05` is not required

Read `AC-24` precisely. The actor is the **accountant**, and the action is *"enters the refund
details"*. The approval is stated as a **precondition already satisfied** — the criterion does
**not** say the system manages a request-and-approval workflow.

Building `RefundRequest` + `POST /refund-requests` + `POST /refund-requests/:id/approve`
**invents a requirement**. A gym approving a refund in person, by email, or by manager sign-off
satisfies `AC-24`'s Given exactly as written.

**Minimum correct implementation:**
```
POST /refunds
  { paymentId, amountMinor, approvedBy, approvedAt, approvalReference }
```
Guarded by: `amountMinor ≤ payment.amountMinor` (`NFR-24`), one refund per payment, and an
atomic write of `Refund` + `LedgerEntry` + `AuditEvent`.

**Verdict: MANDATORY — NOT BLOCKED. `ENH-05` downgraded to NOT REQUIRED** (retained as an
optional future workflow only).

---

## Endpoint 6 — `POST /staff/:id/approve` (`AC-11`)

| Question | Answer |
|---|---|
| 1. Requirement | `US-11` "approve new staff accounts so that only authorized employees can access the system" |
| 2. Classification | **MANDATORY** |
| 3. Story | `US-11` |
| 4. Criterion | `AC-11` — "**Given a new staff member registers for access**, When the admin reviews and clicks 'Approve', Then activate the account and send login details" |
| 5. NFR | **`NFR-11` Security** — "Only administrators should be able to approve staff accounts" |
| 6. Why blocked | No story describes staff self-registration |
| 7. `ENH-06` necessary? | **Partially.** `AC-11`'s Given says the staff member "**registers for access**" — self-registration is the literal reading. But the *approve* endpoint only needs a `Staff` row in `pending` state to exist |
| 8. Without it? | ✅ **YES** — an Administrator could create accounts directly in `pending`, or they can be seeded |
| 9. Minimum | `Staff.status ∈ {pending, active, disabled}` + one path to `pending`. Self-registration (`ENH-06`) is the **faithful** reading and is recommended, but is not a blocker |

**Verdict: MANDATORY — NOT BLOCKED.** `ENH-06` remains an **ENHANCEMENT**, recommended for
fidelity to the Given clause.

---

## Summary

| # | Endpoint | AC | Classification | Blocked? | Enhancement verdict |
|---|---|---|---|---|---|
| 1 | `GET /attendance/members` | `AC-05` | **MANDATORY** | ❌ No | `ENH-02` **required** for usefulness |
| 2 | `GET /reports/attendance/daily` | `AC-14` | **MANDATORY** | ❌ No | `ENH-02` (shared) |
| 3 | `GET /members/:id/medical` | `AC-10` | **MANDATORY** | ❌ No | `ENH-03` **required**, scope reduced |
| 4 | `POST /equipment/:id/maintenance-schedule` | `AC-13` | **MANDATORY** | ❌ No | `ENH-04` → **IMPLIED-MANDATORY** |
| 5 | `POST /refunds` | `AC-24` | **MANDATORY** | ❌ No | `ENH-05` → **NOT REQUIRED** |
| 6 | `POST /staff/:id/approve` | `AC-11` | **MANDATORY** | ❌ No | `ENH-06` **ENHANCEMENT**, recommended |

**Blocked count: 6 → 0.**

### Enhancement status changes

| ID | Was | Now | Reason |
|---|---|---|---|
| `ENH-02` Check-in capture | Critical enhancement | **Required support** — unblocks `US-05` + `US-14` | Two mandatory stories depend on it |
| `ENH-03` Medical entry | Critical enhancement | **Required support, reduced scope** | A field at registration, not a subsystem |
| `ENH-04` Equipment register | Critical enhancement | **IMPLIED-MANDATORY** | `AC-13` is unsatisfiable without it |
| `ENH-05` Refund request workflow | Critical enhancement | **NOT REQUIRED** | `AC-24` treats approval as external |
| `ENH-06` Staff self-registration | Critical enhancement | **ENHANCEMENT** (recommended) | Literal reading of the Given; not a blocker |

### Endpoints removed from the API surface

`POST /refund-requests` and `POST /refund-requests/:id/approve` are **withdrawn** — they
implemented a requirement no source states.

**Revised endpoint count: 57 → 55** (40 academic, 15 enhancement).

---

## Academic coverage note

This review does **not** change academic coverage. All six endpoints were always mandatory;
they were merely mislabelled as blocked. Coverage remains 0/25 implemented — correctly, since
no code exists.

What changed is that **no mandatory requirement is now waiting on an optional enhancement.**

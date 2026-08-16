# Ironboard — NFR Verification Thresholds

**Date:** 2026-08-16 · **Authority:** `reference/lab2/` Part B (verbatim)
**Companion ADR:** `docs/architecture/ADR-012-NFR-THRESHOLDS.md`

---

## ⚠️ 0. The labelling rule — read this first

Two kinds of number appear in this document and they must **never** be confused:

| Label | Meaning |
|---|---|
| 🟩 **SOURCE REQUIREMENT** | The figure is stated verbatim in `reference/lab2/`. Cite it as a requirement. |
| 🟦 **ENGINEERING VERIFICATION THRESHOLD** | The figure was **chosen by this project**. It is *not* in any source. **Never present it as an academic requirement.** |

Any test result derived from a 🟦 threshold must be reported as
**`PASS (ENGINEERING THRESHOLD)`**, never plain `PASS`.

### Test environment — applies to all 🟦 thresholds

| Property | Value |
|---|---|
| Scale | **Student / college local project.** Not production |
| Host | Single developer machine or CI container |
| Runtime | Node 22, single process |
| Database | SQLite (WAL, `synchronous = FULL`), local file |
| Dataset | Seed (`ENH-16`): **3 branches · 1 000 members · 5 plans · 90 days attendance** |
| Load | **≤ 10 concurrent requests** — a realistic classroom demo, not a load test |
| Metric | **p95** over ≥ 30 samples unless stated |

> **No production-scale SLA is claimed anywhere in this project.** Availability figures that do
> appear (`NFR-03`, `NFR-15`) are 🟩 source requirements and are verified by proxy only — see §2.

---

## 1. The 10 NFRs with source-provided thresholds — 🟩

Used verbatim; never rounded, never renegotiated.

| NFR | 🟩 Source wording | Threshold | Test method |
|---|---|---|---|
| `NFR-01` | "Member registration should be completed **within 3 seconds**" | ≤ **3 000 ms** p95 | API timing, seeded DB, email dispatched async |
| `NFR-06` | "Workout plans should load **within 2 seconds**" | ≤ **2 000 ms** p95 | API timing on plan read |
| `NFR-14` | "Attendance reports should be generated **within 5 seconds**" | ≤ **5 000 ms** p95 | Report over 90 days seeded attendance |
| `NFR-18` | "Membership renewal should be completed **within 2 seconds**" | ≤ **2 000 ms** p95 | Excludes external settlement (see `N-2`) |
| `NFR-23` | "Revenue reports should be generated **within 5 seconds**" | ≤ **5 000 ms** p95 | Max range **12 months** 🟦 (`INC-08` — no bound in source) |
| `NFR-03` | "The scheduling system should be available **99.9%** of the time" | 99.9 % | ⚠️ See §2 — proxy only |
| `NFR-15` | "The monitoring dashboard should be available **99.9%** of the time" | 99.9 % | ⚠️ See §2 — proxy only |
| `NFR-10` | "accessible only to **authorized trainers**" | Binary | Per-role + per-assignment access tests |
| `NFR-11` | "**Only** administrators…" | Binary | Five non-admin roles denied |
| `NFR-21` | "encrypted and accessible only to authorized staff" | Binary | Ciphertext at rest + per-role denial |

### §2 — Honest note on the two 99.9 % figures 🟩

99.9 % availability is a **source requirement** and is recorded unchanged. But it means ≈ 43
minutes of downtime per month and **cannot be demonstrated on a student project** — proving it
would need a month of production telemetry.

**Verification is by proxy, and the report must say so:**

| Proxy | Threshold |
|---|---|
| Sustained local run, 30 min @ ~1 req/s | **0 unhandled 5xx**, 100 % success |
| `/healthz`, `/readyz` present and correct | ✅ |
| Dashboard degrades per-panel when one module fails (`NFR-15`) | ✅ |

Reported as: **`PASS (PROXY — 99.9 % not demonstrable at project scale)`**. Claiming a measured
99.9 % would be false.

---

## 2. The 15 NFRs with no source threshold

For each: **A** exact source wording · **B** does the source give a measurable threshold ·
**C/D** the threshold used.

---

### `NFR-02` — Data Integrity
**A.** 🟩 "The system should validate all member information before saving."
**B.** ❌ No threshold. `INC-05` — no field rules exist in any source.
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | Invalid payloads rejected / total invalid payloads |
| **Threshold** | **100 %** of the defined invalid-input table rejected with `422`; **0** invalid rows persisted |
| **Test method** | Table-driven API tests + unit tests on the Zod schema |
| **Conditions** | Local, test DB; invalid set covers each field's format, required-ness, length, uniqueness |
| **Rationale** | "Validate all" is only testable against an explicit rule set; the rule set is invented, so the *coverage* is what is measured |
| **Mandatory?** | 🟦 Engineering verification choice |

---

### `NFR-04` — Reliability
**A.** 🟩 "Payment receipts should be generated accurately without errors."
**B.** ❌ No error rate stated.
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | Receipt fields matching the source `Payment` record |
| **Threshold** | **100 % field match** across **50** seeded payments; **0** generation errors |
| **Test method** | Golden-file/snapshot comparison |
| **Conditions** | Local; covers cash, card and online (`AC-21`) |
| **Rationale** | "Without errors" is only checkable as exact correspondence to the payment record |
| **Mandatory?** | 🟦 |

---

### `NFR-05` — Usability
**A.** 🟩 "Attendance records should be easy to access and understand."
**B.** ❌ Not measurable as written.
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | Navigation depth; information visible without scrolling |
| **Threshold** | **≤ 3 clicks** from dashboard; total visits **and** the lapsed list both visible without scrolling at **1280 × 800** |
| **Test method** | Playwright script counting navigations + screenshot read back |
| **Conditions** | Desktop viewport; seeded attendance |
| **Rationale** | A proxy. Real usability needs human testers, which this project does not have |
| **Mandatory?** | 🟦 — and explicitly a **proxy**, reported as such |

---

### `NFR-07` — Reliability
**A.** 🟩 "Member progress should be saved accurately without data loss."
**B.** ❌ No durability target.
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | Committed rows surviving abrupt process termination |
| **Threshold** | **RPO = 0 for committed transactions** — 100 % of acknowledged writes present after restart |
| **Test method** | Write N=100 entries, `SIGKILL` the process, restart, count |
| **Conditions** | SQLite WAL with `synchronous = FULL` |
| **Rationale** | "Without data loss" is meaningful only for *acknowledged* writes |
| **Mandatory?** | 🟦 |

---

### `NFR-08` — Availability
**A.** 🟩 "Training schedules should always be accessible during working hours."
**B.** ❌ "Working hours" is undefined — `AMB-04`.
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | Successful responses during a defined window |
| **Threshold** | **100 % success, 0 unhandled 5xx** over a **30-minute** local run at ~1 req/s |
| **Conditions** | 🟦 "Working hours" **assumed 06:00–22:00 local** — an assumption, not a requirement |
| **Rationale** | "Always" cannot be proven; a bounded soak is what a student project can evidence |
| **Mandatory?** | 🟦 |
| ⚠️ Conflict | `N-1` — this and `NFR-03` state different availability rules for the same subsystem. Cited, not reconciled |

---

### `NFR-09` — Maintainability
**A.** 🟩 "Exercise routines should be easy to update without affecting existing data."
**B.** ❌
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | Historical rows mutated by a routine edit |
| **Threshold** | **0** `ProgressEntry` rows altered; prior `WorkoutPlan` version still retrievable |
| **Test method** | Regression test — snapshot before/after a `PATCH` |
| **Rationale** | "Without affecting existing data" is a data-preservation claim, so preservation is what is measured |
| **Mandatory?** | 🟦 |

---

### `NFR-12` — Scalability
**A.** 🟩 "The system should support multiple gym branches efficiently."
**B.** ❌ No branch count, member count or concurrency figure (`INC-07`).
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | p95 latency of list and report endpoints under the seed dataset |
| **Threshold** | **3 branches × 1 000 members total**; all list/report endpoints **p95 ≤ 2 000 ms**; **≤ 10 concurrent requests** |
| **Test method** | Seeded dataset + local load script |
| **Rationale** | **Deliberately student-scale.** An earlier draft proposed 10 branches × 1 000 members; that is a production-shaped claim this project cannot substantiate |
| **Mandatory?** | 🟦 |

---

### `NFR-13` — Reliability
**A.** 🟩 "Equipment maintenance records should **never** be lost."
**B.** ❌ **Absolute — unfalsifiable as written.**
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD (proxy)**

| | |
|---|---|
| **Metric** | Hard deletes reachable via API; restore fidelity |
| **Threshold** | **0** hard-delete paths exposed; backup → restore recovers **100 %** of rows; `PRAGMA integrity_check` = `ok` |
| **Test method** | API surface audit + scripted backup/restore drill |
| **Rationale** | "Never" cannot be proven. The proxy tests what *can* be: no destructive path, and a **tested** restore |
| **Mandatory?** | 🟦 — reported as **`PASS (PROXY — absolute claim unfalsifiable)`** |

---

### `NFR-16` — Usability
**A.** 🟩 "Membership plans should be easy to create and modify."
**B.** ❌
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | Navigation depth for create and for modify |
| **Threshold** | **≤ 3 clicks** to reach each form; both complete in a single form submission |
| **Rationale** | Proxy, as `NFR-05` |
| **Mandatory?** | 🟦 |
| ⚠️ Gap | `N-4` — this NFR names "**modify**", but **no user story provides plan modification**. Covered by `ENH-14`; the NFR cannot be fully verified against academic scope alone |

---

### `NFR-17` — Data Integrity
**A.** 🟩 "Only valid inactive memberships should be cancelled."
**B.** ❌ "Valid" undefined — `AMB-07`.
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | Invalid state transitions rejected |
| **Threshold** | **100 %** — only `ACTIVE → CANCELLED` and `EXPIRED → CANCELLED` permitted; all others `422` |
| **Test method** | Full transition-matrix test — **11 cases** from `B-05` §3 |
| **Conditions** | Three states per `B-05`; `CANCELLED` terminal |
| **Rationale** | Operationalises "valid" as the guard set decided in `B-05` |
| **Mandatory?** | 🟦 — the *guard set* is an assumption; the 100 % enforcement is the measurable part |

---

### `NFR-19` — Reliability
**A.** 🟩 "Renewal reminders should be delivered successfully."
**B.** ❌ No rate; "successfully" undefined.
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | **Dispatch**, explicitly **not delivery** |
| **Threshold** | **100 %** of due reminders enqueued to the outbox; **≥ 3** retries on transient failure; **0** outbox rows lost |
| **Test method** | Scheduler run against seeded expiring memberships + failure injection on the transport |
| **Rationale** | ⚠️ **Delivery depends on third-party providers outside system control.** The system can only guarantee dispatch with retry |
| **Mandatory?** | 🟦 — reports must say **dispatched**, never **delivered** |

---

### `NFR-20` — Availability
**A.** 🟩 "Membership status should be available whenever requested."
**B.** ❌ "Whenever" implies 100 %, which is unachievable.
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | Success rate and latency of the status query |
| **Threshold** | **100 % success, 0 unhandled 5xx** over a 30-minute local run; **p95 ≤ 1 000 ms** |
| **Rationale** | A bounded soak is the honest student-scale analogue. **No SLA percentage is claimed** |
| **Mandatory?** | 🟦 |

---

### `NFR-22` — Reliability
**A.** 🟩 "Invoices should be generated accurately **every time**."
**B.** ❌ **Absolute — unfalsifiable as written.**
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD (proxy)**

| | |
|---|---|
| **Metric** | Duplicate invoices; field accuracy |
| **Threshold** | **0 duplicates** across 100 repeated calls with the same `Idempotency-Key`; **100 % field match** vs golden file; invoice numbers **gapless and unique** |
| **Test method** | Idempotency test + snapshot comparison |
| **Rationale** | `AC-22` allows **both** automatic and manual triggering — a real duplicate risk. "Every time" is tested as idempotence plus accuracy |
| **Mandatory?** | 🟦 — reported as **`PASS (PROXY)`** |

---

### `NFR-24` — Data Integrity
**A.** 🟩 "Refund transactions should maintain accurate financial records."
**B.** ❌
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | Ledger balance invariant |
| **Threshold** | `Σ(payments) − Σ(refunds) = outstanding balance` holds after **every** operation in a randomised **200-operation** sequence; **0** refunds exceeding their payment |
| **Test method** | Property-style test over a randomised operation sequence |
| **Conditions** | Append-only `LedgerEntry`; integer minor units |
| **Rationale** | "Accurate financial records" is exactly a balance invariant |
| **Mandatory?** | 🟦 |

---

### `NFR-25` — Availability
**A.** 🟩 "Overdue payment information should be available whenever required."
**B.** ❌ Same unbounded phrasing as `NFR-20`.
**D.** 🟦 **ENGINEERING VERIFICATION THRESHOLD**

| | |
|---|---|
| **Metric** | Success rate and latency of the overdue query |
| **Threshold** | **100 % success, 0 unhandled 5xx** over a 30-minute local run; **p95 ≤ 2 000 ms** |
| **Rationale** | As `NFR-20`. Report queries get a looser budget than status lookups |
| **Mandatory?** | 🟦 |

---

## 3. Summary

| Category | Count | Reporting |
|---|---|---|
| 🟩 Source-provided thresholds | **10** | `PASS` / `FAIL` |
| 🟩 Source thresholds verified by proxy only (`NFR-03`, `NFR-15`) | 2 of the 10 | `PASS (PROXY)` |
| 🟦 Engineering verification thresholds | **15** | `PASS (ENGINEERING THRESHOLD)` |
| 🟦 …of which are proxies for unfalsifiable absolutes (`NFR-13`, `NFR-22`) | 2 | `PASS (PROXY)` |

**Nothing in this document may be cited as an academic requirement unless it carries 🟩.**

---

## 4. Related

`docs/architecture/ADR-012-NFR-THRESHOLDS.md` ·
`docs/requirements/LAB2_NFR_TRACEABILITY.md` ·
`.claude/skills/testing-and-quality/SKILL.md` (evidence rules)

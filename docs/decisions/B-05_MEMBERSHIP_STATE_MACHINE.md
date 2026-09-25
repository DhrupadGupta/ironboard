# B-05 — Membership State Machine: Decision Record

**Status:** ✅ **RESOLVED** · **Date:** 2026-08-16
**Authority:** original `reference/lab1/` pp.5–9, re-extracted for this review
**Supersedes:** ADR-013 (provisional four-state proposal)

---

## Headline finding

> **The proposed four-state machine was wrong. The source supports THREE persisted states.**
>
> `Active`, `Expired` and `Cancelled` appear in the source as **quoted status values**.
> `Expiring` does not — `AC-19` says a membership "is **expiring soon** (e.g., in 7 days)",
> which is a **predicate over `expiresAt`**, not a stored status. Phase 2 promoted a query
> condition into a persisted state.

---

## 1. Source evidence — verbatim

| Term | Source | Verbatim | Is it a status value? |
|---|---|---|---|
| **"Active"** | `AC-20` | "When filtering by **\"Active\"** or \"Expired\"" | ✅ **YES** — quoted, capitalised, a filter value |
| **"Expired"** | `AC-20` | "When filtering by \"Active\" or **\"Expired\"**" | ✅ **YES** — quoted, capitalised |
| **"Cancelled"** | `AC-17` | "Then **set status to \"Cancelled\"**" | ✅ **YES** — explicitly *"set status to"* |
| "expiring soon" | `AC-19` | "Given a membership **is expiring soon (e.g., in 7 days)**" | ❌ **NO** — a temporal condition, never quoted, never "set status to" |
| "expired or a cancellation request" | `AC-17` | "Given a membership **has expired** or a cancellation request is made" | condition referencing `Expired` |
| "expiring or expired profile" | `AC-18` | "Given an **expiring or expired** profile" | condition, not status |
| "active and expired members" | `US-20` | "so that I know **active and expired** members" | reinforces the two filter values |

### Supporting evidence

| Source | Verbatim | Bearing |
|---|---|---|
| `AC-17` | "set status to \"Cancelled\" **and stop gym access**" | Cancellation revokes access |
| `AC-18` | "When a **renewal payment is completed**, Then **extend the expiry date** and **restore gym access**" | Renewal is payment-gated; extends rather than recreates |
| `AC-16` | "price, **duration**, and access rules" | Duration drives `expiresAt` |
| `AC-19` | "the **automated system** checks expiring plans" | `ACT-09` scheduler, not a human transition |

---

## 2. Classification

| Element | Explicitly required | Implied | Engineering decision |
|---|---|---|---|
| `Active` | ✅ `AC-20` | | |
| `Expired` | ✅ `AC-20` | | |
| `Cancelled` | ✅ `AC-17` | | |
| ~~`Expiring`~~ | ❌ | ❌ | ⚠️ **was an engineering decision, now rejected** |
| "Expiring soon" as a **derived predicate** | | ✅ `AC-19` | Implementation is a decision |
| Transition triggers | | ✅ from `AC-17`, `AC-18`, `AC-19` | |
| Guards (e.g. valid source states) | | partially — `NFR-17` "only **valid** inactive" | ✅ mostly a decision (`AMB-07`) |
| The 7-day threshold | ❌ — `AC-19` says "**e.g.**, in 7 days" | | ✅ configurable decision |
| `MembershipEvent` history table | ❌ | ❌ | ✅ engineering decision |

**Verdict: three states are EXPLICITLY REQUIRED. Everything else is implied or decided.**

---

## 3. Decision — the state machine

> ### ✅ **Three persisted states. "Expiring" is a derived view, never stored.**

### 3.1 States

| State | Persisted | Source | Meaning |
|---|---|---|---|
| `ACTIVE` | ✅ | `AC-20` | Membership is current; gym access permitted |
| `EXPIRED` | ✅ | `AC-20` | `expiresAt` passed without renewal; access withdrawn |
| `CANCELLED` | ✅ | `AC-17` | Terminated deliberately; access stopped |

### 3.2 Derived predicate — not a state

```
isExpiringSoon(m) ≡ m.state = ACTIVE ∧ (m.expiresAt − now) ≤ reminderWindow
reminderWindow default = 7 days   -- AC-19 "e.g., in 7 days" — an EXAMPLE, configurable
```

**Why derived rather than stored:**

1. **Source fidelity** — `AC-19` never says "set status to Expiring". It describes a query the
   scheduler runs.
2. **`AC-20` names exactly two filters.** A stored `Expiring` state would make memberships
   vanish from the "Active" filter, *contradicting `AC-20`*.
3. **No flip job required** — a stored state needs a scheduled sweep purely to maintain itself.
4. **Threshold changes are free** — "e.g., 7 days" is explicitly an example; changing it must
   not require a data migration.

### 3.3 Transitions

| # | From | To | Trigger | Guard | Source |
|---|---|---|---|---|---|
| T1 | *(none)* | `ACTIVE` | Membership created for a member on a published plan | Plan published (`AC-16`); payment settled | ⚠️ **no story creates a membership** — see §7 |
| T2 | `ACTIVE` | `EXPIRED` | Scheduler: `expiresAt ≤ now` | — | `AC-20`, `AC-18` |
| T3 | `ACTIVE` | `CANCELLED` | Manager confirms cancellation | Cancellation request exists (`AC-17`) | `AC-17` |
| T4 | `EXPIRED` | `CANCELLED` | Manager confirms cancellation | `AC-17` "has expired **or** a cancellation request" | `AC-17` |
| T5 | `EXPIRED` | `ACTIVE` | **Renewal payment completed** | Payment settled; extends `expiresAt` | `AC-18` |
| T6 | `ACTIVE` | `ACTIVE` | Renewal while still active ("expiring profile") | Payment settled; extends `expiresAt` | `AC-18` "an **expiring** or expired profile" |

**T6 is a self-transition, not a no-op** — it extends `expiresAt` and emits a `MembershipEvent`.
`AC-18` explicitly permits renewing an *expiring* (still-active) membership.

### 3.4 Invalid transitions — rejected with `422 DomainRuleError`

| Rejected | Reason |
|---|---|
| `CANCELLED` → any | **Terminal.** ⚠️ No source states reversibility. Assumed terminal; a new membership must be created instead |
| `EXPIRED` → `EXPIRED` | No-op |
| `ACTIVE` → `ACTIVE` without payment | `AC-18` requires "a renewal payment is **completed**" |
| any → `ACTIVE` without settled payment | `AC-18` |
| `CANCELLED` → `ACTIVE` via renewal | Cancellation "stop[s] gym access" (`AC-17`); nothing permits resurrection |

### 3.5 Diagram

```
                 T1 create (⚠ no story — see §7)
                          │
                          ▼
   T6 renew ┌────────► ┌───────────┐
   (extend) └───────── │  ACTIVE   │ ──── T3 cancel confirmed ────┐
                       └─────┬─────┘                              │
                             │ T2  expiresAt ≤ now                │
                             │     (scheduler)                    │
                             ▼                                    ▼
                       ┌───────────┐  T4 cancel confirmed  ┌─────────────┐
                       │  EXPIRED  │ ────────────────────► │  CANCELLED  │
                       └─────┬─────┘                       │  (terminal) │
                             │                             └─────────────┘
                             │ T5 renewal payment completed
                             └──────────────► ACTIVE

   Derived (NOT a state):
     isExpiringSoon  ≡  state = ACTIVE ∧ expiresAt − now ≤ 7d   [AC-19]
```

---

## 4. Relationships

### 4.1 Payment
`AC-18`: "When a renewal payment is **completed**". Payment is a **guard**, not a state.
T5 and T6 fire only on a settled payment. **No `PENDING_PAYMENT` state** — no source describes
an unpaid membership awaiting activation, and inventing one would exceed the requirements.

⚠️ `NFR-18` allows renewal **2 s**, tighter than `NFR-01`'s 3 s for the simpler registration
(`N-2`). The budget is asserted **excluding** external settlement.

### 4.2 Expiry
`expiresAt` derives from `MembershipPlan.durationDays` (`AC-16` "duration"). T2 is driven by a
scheduled sweep; `EXPIRED` is a persisted fact so that `AC-20`'s filter is a simple indexed
query within the `NFR-20` budget.

### 4.3 Cancellation
`AC-17` gives **two** triggers — "has expired" **or** "a cancellation request is made" — which
is why both T3 and T4 exist. Cancellation must also "stop gym access": the service revokes
access as part of the same transaction.

⚠️ No story creates a cancellation request; per B-04's reasoning it is treated as an
**external precondition**, captured as data on the cancellation, not as a workflow.

### 4.4 Renewal
`AC-18`: "extend the expiry date and restore gym access". **Extend** — so `expiresAt` moves
forward rather than a new membership being created.

⚠️ **Genuinely ambiguous:** extend from the *old `expiresAt`* or from *today*? For a membership
expired six months ago these differ materially. **Assumed:** extend from `max(expiresAt, now)`
so a lapsed member does not pay for elapsed time. Recorded as an assumption — no source decides it.

### 4.5 `NFR-17` — "only valid inactive memberships should be cancelled"
"Valid" is undefined (`AMB-07`). Operationalised as: **only `ACTIVE` and `EXPIRED` may
transition to `CANCELLED`**. A `CANCELLED` membership cannot be cancelled again.

---

## 5. Suitability for downstream artefacts

| Consumer | How this serves it |
|---|---|
| **Database constraints** | `CHECK (state IN ('ACTIVE','EXPIRED','CANCELLED'))`; index `(state, expiresAt)` for T2 sweep and `AC-19` query |
| **Backend logic** | One transition function with an explicit guard table; every transition writes `MembershipEvent` + `AuditEvent` in the same transaction |
| **API** | `GET /memberships?state=ACTIVE\|EXPIRED\|CANCELLED` plus `?expiringWithinDays=` for the derived predicate. `POST .../cancel`, `POST .../renew` |
| **UI** | `AC-20`'s two filters map to two states; the third is available; "expiring soon" is a **badge on Active rows**, not a filter tab |
| **State Chart (`DIA-07`)** | 3 states, 6 transitions, guards on T3–T6 — small enough to render legibly |
| **State Transition (`DIA-10`)** | Same machine as a transition table |
| **Testing** | 6 valid transitions + 5 invalid = 11 test cases, each mapping to `AC-17`/`AC-18`/`AC-19`/`AC-20` |

### Transition table (for `DIA-10` and tests)

| From \ Event | `renewalPaid` | `expiryReached` | `cancelConfirmed` |
|---|---|---|---|
| `ACTIVE` | `ACTIVE` (T6, extend) | `EXPIRED` (T2) | `CANCELLED` (T3) |
| `EXPIRED` | `ACTIVE` (T5, extend) | — | `CANCELLED` (T4) |
| `CANCELLED` | ✗ reject | ✗ reject | ✗ reject |

---

## 6. Impact of the correction

| Artefact | Change |
|---|---|
| `Membership.state` | 4 values → **3** |
| DB CHECK constraint | Drops `Expiring` |
| Scheduler | **One job removed** — no "flip to Expiring" sweep |
| `AC-20` filter | Now consistent — no state hidden from the two named filters |
| `AC-19` reminder | Becomes an indexed query, not a state read |
| `DIA-07` / `DIA-10` | Simpler and better justified |
| ADR-013 | **Superseded** |

**This correction removes invented scope**: one state, one constraint value and one scheduled
job that no source ever asked for.

---

## 7. ⚠️ New finding — no story creates a membership

Transition **T1** has no source. Reviewing all 25 stories:

- `US-01` registers a **member** (a person, not a membership)
- `US-16` creates a **plan** (a product, not a subscription)
- `US-17` cancels, `US-18` renews, `US-20` tracks — all presuppose a membership **already exists**
- `AC-16` says "show the plan as **available for purchase**" — purchase is implied, never described
- `AC-21` says "Given a member has a **balance due**" — presupposes a charge

**No user story or acceptance criterion describes assigning a plan to a member.**

This is a **sixth missing write path**, structurally identical to the five already recorded
under `AMB-15`, and it was not previously identified. Recorded as **`ENH-19`**.

The homepage workflow strip does say *"A plan is chosen and activated"* — but that is
`reference/design/`, not a Lab 1 requirement, and cannot be cited as one.

**Minimum correct implementation:** `POST /members/:id/memberships { planId }`, guarded by a
settled payment, creating the membership in `ACTIVE`. Classified as **IMPLIED-MANDATORY** by
the same reasoning as `ENH-04`: without it, `US-17`, `US-18`, `US-19` and `US-20` — four
mandatory stories — have nothing to operate on.

---

## 8. Confidence

**High** for the three states — they are quoted verbatim in the source as status values.
**High** for rejecting `Expiring` — `AC-19`'s phrasing and `AC-20`'s two-filter list agree.
**Medium** for the guards and terminality of `CANCELLED` — reasonable but not stated.
**Low** for the renewal base date (§4.4) and the 7-day window — both explicitly examples or
silent in the source.

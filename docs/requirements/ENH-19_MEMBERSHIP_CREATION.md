# ENH-19 — Membership Creation

> ## ENGINEERING ENHANCEMENT — REQUIRED FOR SYSTEM COMPLETENESS

**Status:** ✅ Resolved · **Date:** 2026-08-16 · **Authority:** original `reference/lab1/`
**Classification:** Not a Lab 1 requirement. **No new user story is created.**

---

## 1. The finding

`US-17`, `US-18`, `US-19` and `US-20` — four mandatory stories — all presuppose that a
membership exists. **No user story or acceptance criterion creates one.**

Verified against the original:

| Story | What it actually creates | Creates a membership? |
|---|---|---|
| `US-01` / `AC-01` | "create the profile, generate a Member ID, and send a welcome email" | ❌ A **person**, not a subscription |
| `US-16` / `AC-16` | "show the plan as available for purchase" | ❌ A **product**, not a subscription |
| `US-17` / `AC-17` | "set status to \"Cancelled\"" | ❌ Presupposes one |
| `US-18` / `AC-18` | "extend the expiry date" | ❌ Presupposes one — *extends*, never creates |
| `US-20` / `AC-20` | "filtering by \"Active\" or \"Expired\"" | ❌ Presupposes one |
| `US-21` / `AC-21` | "Given a member has a **balance due**" | ❌ Presupposes a charge already exists |

The closest the source comes is `AC-16`'s "available for **purchase**" — purchase is implied
to happen, but **no criterion describes it**.

> ⚠️ `reference/design/gym-management-homepage-2.html` does say *"A plan is chosen and
> activated"*. That is the design artefact, **not Lab 1**, and cannot be cited as a requirement.

---

## 2. Who creates/activates the initial membership

**Decision: the Membership Manager (`ACT-04`, `D04`).**

Rationale — chosen because it invents the least:

- **All five** membership operations in Lab 1 belong to the Membership Manager
  (`US-16`…`US-20`). Placing creation anywhere else would split one lifecycle across two roles
  with no source support.
- `D04` already owns `MembershipPlan`, `Membership` and `MembershipEvent`.
- The Receptionist was considered and **rejected**: `AC-01`'s Then-clause is exactly three
  outcomes, and adding membership creation to it would **modify a mandatory acceptance
  criterion**. `AC-01` must remain testable exactly as written.

| Question | Answer |
|---|---|
| **Who** | Membership Manager (`ACT-04`) |
| **When** | After the member exists (`AC-01`) and a **published** plan exists (`AC-16`) |
| **Which existing workflow owns it** | `D04` membership lifecycle — the natural home, though **no story explicitly grants it** |
| **New user story?** | ❌ **No.** The source does not support one and none is invented |

---

## 3. Minimum implementation

Deliberately one endpoint, one insert. No plan-catalogue browsing, no shopping cart, no
checkout flow, no self-service purchase.

### 3.1 API

```
POST /api/v1/members/:memberId/memberships
  body: { planId, startsAt?, paymentId? }
  201 → { id, memberId, planId, state: "ACTIVE", startsAt, expiresAt }
```

| Aspect | Value |
|---|---|
| Permission | `membership:create` |
| Roles | **Membership Manager only** |
| Idempotency | Not required — a member may legitimately hold successive memberships |

### 3.2 Database operation

One transaction:

1. `INSERT Membership` — `state = 'ACTIVE'`, `startsAt = now` (or supplied),
   `expiresAt = startsAt + plan.durationDays` *(derived from `AC-16`'s "duration")*
2. `INSERT MembershipEvent` — `fromState = NULL`, `toState = 'ACTIVE'` (transition **T1**)
3. `INSERT AuditEvent`

No new tables. No schema change beyond what `B-05` already defines.

### 3.3 Permissions

| Permission | Receptionist | Trainer | Admin | **Membership Mgr** | Accounting | Member |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| `membership:create` | — | — | — | **✅** | — | — |

Deny-by-default; the other five roles must be provably denied.

### 3.4 Validation

| Rule | Basis |
|---|---|
| Member exists and is not deleted | Referential |
| Plan exists **and is published** | `AC-16` "show the plan as **available for purchase**" — an unpublished plan is not purchasable |
| Member has no membership already in `ACTIVE` | **Assumption** — no source forbids concurrent memberships. Chosen to keep `AC-20`'s filter unambiguous |
| `startsAt` not in the past beyond a tolerance | **Assumption** |
| `expiresAt = startsAt + plan.durationDays` | Derived from `AC-16` |

⚠️ Every rule above is an **engineering decision** — `INC-05` means no field rules exist in any
source.

### 3.5 Payment relationship

⚠️ **Deliberately decoupled.** `AC-18` gates *renewal* on "a renewal payment is completed", but
**no criterion gates initial creation on payment**. Requiring payment here would invent a rule
stricter than the source.

`paymentId` is therefore **optional**, and `AC-21`'s "balance due" remains representable: a
membership may exist with an outstanding invoice. Recorded as an assumption.

### 3.6 Tests

| Test | Asserts | Level |
|---|---|---|
| `T-A-019-01` | Creates `ACTIVE` membership with `expiresAt = startsAt + durationDays` | Acceptance |
| `T-A-019-02` | Emits `MembershipEvent` T1 (`NULL → ACTIVE`) | Integration |
| `T-A-019-03` | Rejects an **unpublished** plan → 422 | Integration |
| `T-A-019-04` | Rejects a second concurrent `ACTIVE` membership → 409 | Integration |
| `T-SEC-019` | All five non-Membership-Manager roles denied → 403 | Security |
| `T-I-019` | Enables `AC-17`, `AC-18`, `AC-20` fixtures to be built through the API rather than seeded | Integration |

**These tests are enhancement coverage. They do not count toward the 25 acceptance criteria.**

---

## 4. Traceability

| Field | Value |
|---|---|
| ID | `ENH-19` |
| Classification | **ENGINEERING ENHANCEMENT — REQUIRED FOR SYSTEM COMPLETENESS** |
| User story | **None.** No Lab 1 story creates a membership |
| Acceptance criterion | **None.** Referenced indirectly by `AC-17`, `AC-18`, `AC-20`, `AC-21` |
| NFR | None directly; enables `NFR-17`, `NFR-18`, `NFR-20` to be exercised |
| Enables | `US-17`, `US-18`, `US-19`, `US-20` — **four mandatory stories** |
| State machine | Transition **T1** in `docs/decisions/B-05_MEMBERSHIP_STATE_MACHINE.md` |
| Academic coverage | **0** — never counted |

---

## 5. Honest summary

The source has a genuine hole: it manages a membership lifecycle it never starts. This is
resolved with **one endpoint and one insert**, placed with the role that owns every other
membership operation.

It is labelled an enhancement because **no source text assigns it**, and it is required
because four mandatory stories are inert without it.

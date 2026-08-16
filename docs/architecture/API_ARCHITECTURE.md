# Ironboard — API Architecture

**Phase:** 2 — Architecture · **Date:** 2026-08-16 · **Status:** Design only, **no endpoints implemented**
**Style:** REST, `/api/v1`, JSON — ADR-003

Every endpoint traces to a functional requirement. Endpoints marked **`ENH`** serve an
enhancement and **do not count toward academic coverage**.

---

## 1. Conventions

| Concern | Decision | Basis |
|---|---|---|
| Base path | `/api/v1` | **[ENG]** |
| Resources | Plural nouns | **[ENG]** |
| Errors | RFC 9457 Problem Details | **[ENG]** |
| Validation | Zod at the boundary, schemas shared with the client | **[REQ]** `NFR-02` |
| Auth | Session cookie (`httpOnly`, `Secure`, `SameSite=Strict`) | **[ENG]** ADR-006 |
| CSRF | Token header on every mutation | **[ENG]** |
| Authorisation | Per-route permission, **deny-by-default** | **[REQ]** `NFR-10`, `NFR-11`, `NFR-21` |
| Pagination | Cursor — `?cursor=&limit=` | **[ENG]** |
| Idempotency | `Idempotency-Key` on payment + invoice creation | **[REQ]** `NFR-22` |
| Timestamps | ISO 8601 UTC | **[ENG]** |
| Money | Integer minor units | **[REQ]** `NFR-24` |

### Status codes

`200` ok · `201` created · `204` no content · `400` malformed · `401` no/expired session ·
`403` permission denied · `404` not found · `409` conflict · `422` validation or domain-rule
failure · `429` rate limited · `500` internal.

---

## 2. Route declaration shape

Permission is declared **on the route**, not inside the handler. A route without a declaration
**fails closed**. **[REQ]** ADR-007.

```ts
// Shape only — not an implementation.
router.post('/members',
  authorize('member:create'),        // 1. deny-by-default  (NFR-11 pattern)
  validate(registerMemberSchema),    // 2. Zod              (NFR-02)
  receptionController.registerMember // 3. HTTP only        (ADR-002)
);
```

`authorize` runs **before** `validate` deliberately — an unauthorised caller must not learn
whether their payload was well-formed.

---

## 3. Authentication endpoints

**[ENG]** — ⚠️ no source document defines authentication at all (`AMB-03`).

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `POST` | `/auth/login` | Staff or member login | Rate limited; Argon2id |
| `POST` | `/auth/logout` | Revoke current session | `ENH-15` |
| `GET` | `/auth/me` | Current actor + permissions | Drives UI role gating |
| `POST` | `/auth/staff/register` | Staff self-registration → `pending` | **`ENH-06`** — unblocks `AC-11` |
| `GET` | `/auth/csrf` | Issue CSRF token | |

---

## 4. D01 — Reception

| FR | Method | Path | Permission | AC | NFR |
|---|---|---|---|---|---|
| `FR-REC-01` | `POST` | `/members` | `member:create` | `AC-01` | `NFR-01` ≤ 3 s |
| `FR-REC-02` | `GET` | `/members?q=` | `member:read` | `AC-02` | — |
| `FR-REC-02` | `GET` | `/members/:id` | `member:read` | `AC-02` | — |
| `FR-REC-02` | `PATCH` | `/members/:id` | `member:update` | `AC-02` | `NFR-02` |
| `FR-REC-03` | `GET` | `/sessions/slots?date=&kind=trial` | `session:read` | `AC-03` | `NFR-03` |
| `FR-REC-03` | `POST` | `/sessions/trials` | `session:create` | `AC-03` | `NFR-03` |
| `FR-REC-04` | `POST` | `/payments/:id/receipt` | `receipt:create` | `AC-04` | `NFR-04` |
| `FR-REC-04` | `GET` | `/receipts/:id.pdf` | `receipt:read` | `AC-04` | `NFR-04` |
| `FR-REC-05` | `GET` | `/attendance/members?from=&to=&inactive=` | `attendance:read` | `AC-05` | `NFR-05` |

**Notes**
- `POST /members` returns the generated `memberCode` (`AC-01`) and enqueues the welcome email
  asynchronously so `NFR-01`'s 3 s budget excludes provider latency.
- `AC-02` is reached via search *then* update — Lab 1 provides no search story, so
  `GET /members?q=` is an **[ENG]** consequence of `AC-02`'s "provides their Name or ID".
- ⚠️ `FR-REC-04` depends on `FR-ACC-01` (`AC-04` "Given a payment is successful") —
  cross-module, mediated by a service interface.
- ⚠️ `FR-REC-05` is **blocked**: `AC-05` reads attendance no story writes (`B-04`).

---

## 5. D02 — Trainer

| FR | Method | Path | Permission | AC | NFR |
|---|---|---|---|---|---|
| `FR-TRN-01` | `GET` | `/workout-plans/templates` | `plan:read` | `AC-06` | `NFR-06` ≤ 2 s |
| `FR-TRN-01` | `POST` | `/members/:id/workout-plans` | `plan:create` | `AC-06` | `NFR-06` |
| `FR-TRN-02` | `POST` | `/members/:id/progress` | `progress:create` | `AC-07` | `NFR-07` |
| `FR-TRN-02` | `GET` | `/members/:id/progress` | `progress:read` | `AC-07` | `NFR-07` |
| `FR-TRN-03` | `GET` | `/trainers/:id/availability?date=` | `session:read` | `AC-08` | `NFR-08` |
| `FR-TRN-03` | `POST` | `/sessions/personal-training` | `session:create` | `AC-08` | `NFR-08` |
| `FR-TRN-04` | `PATCH` | `/workout-plans/:id` | `plan:update` | `AC-09` | `NFR-09` |
| `FR-TRN-05` | `GET` | `/members/:id/medical` | `medical:read` | `AC-10` | **`NFR-10`** |
| — | `POST` | `/members/:id/medical` | `medical:create` | — | **`ENH-03`** |

**Notes**
- `GET /members/:id/medical` is the **strictest endpoint in the API**: `NFR-10` says
  "authorized **trainers**", so the guard checks `TrainerAssignment`, not merely the Trainer
  role. Every access is audited.
- `POST .../medical` exists only because `AC-10` reads data no story writes (`ENH-03`).
- `PATCH /workout-plans/:id` creates a new **version** rather than mutating in place
  (`NFR-09` "without affecting existing data").
- ⚠️ `NFR-08` "during working hours" is undefined (`AMB-04`).

---

## 6. D03 — Administration

| FR | Method | Path | Permission | AC | NFR |
|---|---|---|---|---|---|
| `FR-ADM-01` | `GET` | `/staff?status=pending` | `staff:read` | `AC-11` | `NFR-11` |
| `FR-ADM-01` | `POST` | `/staff/:id/approve` | `staff:approve` | `AC-11` | **`NFR-11`** |
| `FR-ADM-02` | `GET` | `/branches` | `branch:read` | `AC-12` | `NFR-12` |
| `FR-ADM-02` | `POST` | `/branches` | `branch:create` | `AC-12` | `NFR-12` |
| `FR-ADM-02` | `PATCH` | `/branches/:id` | `branch:update` | `AC-12` | `NFR-12` |
| `FR-ADM-02` | `POST` | `/branches/:id/disable` | `branch:disable` | `AC-12` | `NFR-12` |
| `FR-ADM-03` | `GET` | `/equipment` | `equipment:read` | `AC-13` | `NFR-13` |
| `FR-ADM-03` | `POST` | `/equipment` | `equipment:create` | — | **`ENH-04`** |
| `FR-ADM-03` | `POST` | `/equipment/:id/maintenance-schedule` | `equipment:update` | `AC-13` | `NFR-13` |
| `FR-ADM-04` | `GET` | `/reports/attendance/daily?date=&branchId=` | `report:attendance` | `AC-14` | `NFR-14` ≤ 5 s |
| `FR-ADM-05` | `GET` | `/dashboard/summary` | `dashboard:read` | `AC-15` | `NFR-15` 99.9 % |
| — | `POST` | `/attendance/check-in` | `attendance:create` | — | **`ENH-02`** |

**Notes**
- `POST /staff/:id/approve` is restricted to Administrator alone. `NFR-11` says "**Only**
  administrators", so the test asserts the other **five** roles are denied.
- `GET /dashboard/summary` aggregates all five modules (`AC-15`) while carrying a 99.9 % target
  (`NFR-15`). Each panel resolves **independently** and returns a per-panel failure state — one
  failing module must not take the dashboard down.
- `POST /attendance/check-in` (`ENH-02`) is the **highest-value missing write path**: it
  unblocks `US-05` *and* `US-14`.

---

## 7. D04 — Membership

| FR | Method | Path | Permission | AC | NFR |
|---|---|---|---|---|---|
| `FR-MEM-01` | `POST` | `/plans` | `plan:create` | `AC-16` | `NFR-16` |
| `FR-MEM-01` | `POST` | `/plans/:id/publish` | `plan:publish` | `AC-16` | `NFR-16` |
| `FR-MEM-01` | `PATCH` | `/plans/:id` | `plan:update` | — | **`ENH-14`** |
| `FR-MEM-02` | `POST` | `/memberships/:id/cancel` | `membership:cancel` | `AC-17` | `NFR-17` |
| `FR-MEM-03` | `POST` | `/memberships/:id/renew` | `membership:renew` | `AC-18` | `NFR-18` ≤ 2 s |
| `FR-MEM-04` | `POST` | `/memberships/reminders/run` | `membership:remind` | `AC-19` | `NFR-19` |
| `FR-MEM-05` | `GET` | `/memberships?state=` | `membership:read` | `AC-20` | `NFR-20` |

**Notes**
- ⚠️ `PATCH /plans/:id` exists because **`NFR-16` names "modify" but no story provides it**
  (`N-4`) — tracked as `ENH-14`.
- ⚠️ `POST /memberships/:id/renew` depends on `FR-ACC-01`. `NFR-18` gives **2 s**, tighter than
  `NFR-01`'s 3 s despite requiring a completed payment (`N-2`). The budget is asserted
  **excluding** external settlement; the assumption is recorded.
- `POST .../reminders/run` is the manual trigger; the scheduled path is `ACT-09`
  (`AC-19` "the automated system checks expiring plans").
- ⚠️ `GET /memberships?state=` must accept **all four** states even though `AC-20` names only
  Active and Expired (ADR-013, `B-05`).

---

## 8. D05 — Accounting

| FR | Method | Path | Permission | AC | NFR |
|---|---|---|---|---|---|
| `FR-ACC-01` | `POST` | `/payments` | `payment:create` | `AC-21` | **`NFR-21`** |
| `FR-ACC-02` | `POST` | `/invoices` | `invoice:create` | `AC-22` | `NFR-22` |
| `FR-ACC-02` | `GET` | `/invoices/:id.pdf` | `invoice:read` | `AC-22` | `NFR-22` |
| `FR-ACC-03` | `GET` | `/reports/revenue?from=&to=` | `report:revenue` | `AC-23` | `NFR-23` ≤ 5 s |
| `FR-ACC-04` | `POST` | `/refund-requests` | `refund:request` | — | **`ENH-05`** |
| `FR-ACC-04` | `POST` | `/refund-requests/:id/approve` | `refund:approve` | — | **`ENH-05`** |
| `FR-ACC-04` | `POST` | `/refunds` | `refund:create` | `AC-24` | `NFR-24` |
| `FR-ACC-05` | `GET` | `/invoices?status=overdue` | `invoice:read` | `AC-25` | `NFR-25` |
| `FR-ACC-05` | `POST` | `/invoices/:id/notice` | `invoice:notify` | `AC-25` | `NFR-25` |

**Notes**
- `POST /payments` requires `Idempotency-Key`. It writes `Payment` + `Receipt` +
  `LedgerEntry` + `AuditEvent` in **one transaction** (`NFR-24`).
- `POST /invoices` also requires `Idempotency-Key` — `AC-22` allows **both** automatic and
  manual triggering, a genuine duplicate risk (`NFR-22`).
- ⚠️ `AC-24` says "Given an **approved** refund request", but **no story creates or approves
  one** — hence the two `ENH-05` endpoints.
- ⚠️ `GET /reports/revenue` has **no stated range bounds** (`INC-08`); a maximum range is
  assumed or the 5 s budget is meaningless.
- `CON-04`: `FR-ACC-03` is variously "Review"/"Generate"/"Produce" across sources. The endpoint
  is a `GET` (read), matching the Lab 2 label "Review revenue reports".

---

## 9. Member portal — `ENH-01`

⚠️ **No Lab 1 story is owned by a member.** These endpoints serve the Member role added in
Phase 1 and are **excluded from academic coverage** (ADR-015).

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/me/profile` | Own record |
| `GET` | `/me/membership` | Own membership + state |
| `GET` | `/me/sessions` | Own bookings (`AC-08` "both calendars") |
| `GET` | `/me/workout-plan` | Own plan (`AC-06` "notify them") |
| `GET` | `/me/progress` | Own chart |
| `GET` | `/me/invoices` | Own invoices (`AC-22`) |

All are scoped to the authenticated member — never accept an id from the caller.

---

## 10. Endpoint summary

| Group | Endpoints | Academic | Enhancement |
|---|---|---|---|
| Auth | 5 | 0 | 5 |
| D01 Reception | 9 | 9 | 0 |
| D02 Trainer | 9 | 8 | 1 |
| D03 Administration | 12 | 10 | 2 |
| D04 Membership | 7 | 6 | 1 |
| D05 Accounting | 9 | 7 | 2 |
| Member portal | 6 | 0 | 6 |
| **Total** | **57** | **40** | **17** |

All 25 functional requirements are covered by at least one endpoint.

---

## 11. Error contract

```json
{
  "type": "https://ironboard.local/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "detail": "email must be a valid address",
  "instance": "/api/v1/members",
  "requestId": "01JD…",
  "errors": [{ "path": "email", "code": "invalid_string" }]
}
```

`errors[]` appears only for `422` from Zod. `403` never reveals whether the resource exists.
`500` carries `requestId` and nothing else.

---

## 12. Blocked endpoints — ✅ RESOLVED, none remain

**`B-04` is resolved. The blocked count is 6 → 0.** See `docs/decisions/B-04_API_DECISIONS.md`.

All six endpoints were always **MANDATORY**; Phase 2 mislabelled them as blocked because a
proposed *enhancement* did not yet exist — inverting the correct priority. A `Given` clause is
a **precondition**, not a system obligation.

| Endpoint | AC | Verdict | Enhancement status |
|---|---|---|---|
| `GET /attendance/members` | `AC-05` | **MANDATORY, not blocked** | `ENH-02` required for production use |
| `GET /reports/attendance/daily` | `AC-14` | **MANDATORY, not blocked** | `ENH-02` (shared) |
| `GET /members/:id/medical` | `AC-10` | **MANDATORY, not blocked** | `ENH-03` required, **scope reduced** to a field at registration |
| `POST /equipment/:id/maintenance-schedule` | `AC-13` | **MANDATORY, not blocked** | `ENH-04` → **IMPLIED-MANDATORY** |
| `POST /refunds` | `AC-24` | **MANDATORY, not blocked** | `ENH-05` → **NOT REQUIRED** (over-engineered) |
| `POST /staff/:id/approve` | `AC-11` | **MANDATORY, not blocked** | `ENH-06` **ENHANCEMENT**, recommended |

### Endpoints withdrawn

`POST /refund-requests` and `POST /refund-requests/:id/approve` are **removed**. `AC-24` reads
"Given an **approved** refund request … the accountant **enters the refund details**" — the
approval is an *external precondition*, not a workflow the system must own. Building it would
invent a requirement. The `Refund` record instead captures `approvedBy`, `approvedAt` and
`approvalReference` as data.

### Endpoint added

`POST /members/:id/memberships` — **IMPLIED-MANDATORY (`ENH-19`)**. `B-05` §7 found that **no
story creates a membership**, yet `US-17`, `US-18`, `US-19` and `US-20` all presuppose one.

**Revised count: 57 → 56** (41 academic, 15 enhancement).

### Superseded — the original blocked table

| Blocked | Blocked by | Unblocked by |
|---|---|---|
| `GET /attendance/members` (`AC-05`) | no check-in write path | `POST /attendance/check-in` (`ENH-02`) |
| `GET /reports/attendance/daily` (`AC-14`) | same | same |
| `GET /members/:id/medical` (`AC-10`) | no medical write path | `POST /members/:id/medical` (`ENH-03`) |
| `POST /equipment/:id/maintenance-schedule` (`AC-13`) | no equipment register | `POST /equipment` (`ENH-04`) |
| `POST /refunds` (`AC-24`) | no refund request | `ENH-05` endpoints |
| `POST /staff/:id/approve` (`AC-11`) | no staff registration | `POST /auth/staff/register` (`ENH-06`) |

---

## 13. Related

`SYSTEM_ARCHITECTURE.md` · `SECURITY_ARCHITECTURE.md` · `DATABASE_DESIGN.md` ·
`ARCHITECTURAL_DECISIONS.md` (ADR-003, 004, 007) ·
`docs/requirements/LAB1_TRACEABILITY_MATRIX.md`

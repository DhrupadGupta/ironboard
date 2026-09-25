# Ironboard — API Contracts (as implemented)

**Phase:** 4A · **Date:** 2026-08-21
**Scope:** the **authentication surface only**. Eight endpoints exist. Everything else in
`docs/architecture/API_ARCHITECTURE.md` is still a *design*.

> **This document describes what the running server actually does.** `API_ARCHITECTURE.md` is the
> plan for ~56 endpoints; this is the contract for the 8 that exist. Where the two differ, this
> one governs, because it is derived from the code and its tests.

## Label key

🟩 SOURCE REQUIREMENT · 🟦 ENGINEERING DECISION · ⬛ IMPLEMENTATION DETAIL

🟦 The entire API surface is an engineering decision — `AMB-03`: no source document defines an API,
an endpoint, a status code or a payload.

---

## 1. Conventions

| Concern | Contract |
|---|---|
| Base path | `/api/v1` |
| Content type | `application/json`; body cap **64 KB** |
| Auth | Session cookie `ironboard_session` — `httpOnly`, `SameSite=Strict`, `Secure` in production |
| CSRF | Mutations require header `x-csrf-token` matching cookie `ironboard_csrf` |
| Authorisation | Deny-by-default per route (ADR-007) |
| Error shape | `{ "error": { "code": "...", "message": "...", "details"?: [...] } }` — **always**, for every status |
| Errors never contain | stack traces, Prisma messages, password hashes, tokens, hash internals |

### Status codes actually emitted

| Code | Meaning |
|---|---|
| `200` | OK |
| `202` | Accepted (self-registration — approval is asynchronous and human) |
| `204` | No content (logout) |
| `400` | Validation failure, CSRF failure, activation failure |
| `401` | No/invalid/expired session, **or any credential failure** |
| `403` | Authenticated but lacking the permission |
| `404` | Unknown endpoint |
| `429` | Rate limited (with `Retry-After`) |
| `500` | Unexpected — flat body, no detail |

### Error codes

| Code | Status | Notes |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | **One code for every credential failure.** See ADR-016 |
| `SESSION_INVALID` | 401 | Missing, unknown, expired and revoked are indistinguishable |
| `FORBIDDEN` | 403 | Includes the fact that a permission was required, never which resource exists |
| `ACTIVATION_INVALID` | 400 | Unknown, expired and already-used are indistinguishable |
| `VALIDATION_FAILED` | 400 | Carries `details[]` of `{path,message}`. **Never echoes a password** |
| `RATE_LIMITED` | 429 | |
| `NOT_FOUND` | 404 | |
| `INTERNAL` | 500 | |

---

## 2. Endpoints

### `GET /healthz`

🟦 Liveness probe (supports the `NFR-03`/`NFR-15` availability story; **not** a verification of it).

`200 → { "status": "ok" }` · No auth.

---

### `GET /api/v1/auth/csrf`

Issues a CSRF token and sets the `ironboard_csrf` cookie (not `httpOnly` — the client must echo it).

`200 → { "csrfToken": "<43-char base64url>" }` · No auth.

---

### `POST /api/v1/auth/login`

🟦 `AMB-03`. One flow for all six roles; the subject type is resolved from the data, **not** from
anything the caller sends.

**Request** `{ "email": string, "password": string }`
Email is trimmed and lower-cased before lookup. Password is never trimmed or transformed.

**`200`**
```json
{
  "actor": {
    "id": "stf_…", "subjectType": "staff", "fullName": "…",
    "email": "…", "role": "administrator", "permissions": ["branch:read", "…"]
  },
  "session": { "expiresAt": "2026-08-21T09:30:00.000Z" }
}
```
Sets `ironboard_session` and rotates `ironboard_csrf`.

⬛ **`actor` is built from a `PublicActor` type, never from a Prisma row** — so `passwordHash`
cannot leak by someone forgetting to strip a field. `session` contains **only** `expiresAt`: no
session id, no token, no `subjectId`.

**`401`** — identical body for unknown email, wrong password, no password set, pending account and
disabled account:
```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password." } }
```
**`400`** validation · **`429`** rate limited (10/IP, 5/identifier per 15 min).

Tests: `T-A-030`…`T-A-036`, `T-A-040`, `T-A-041`, `T-A-044`, `T-A-045`.

---

### `POST /api/v1/auth/logout`

`ENH-15`. No body. **`204`** always — including with no cookie, an expired token or a
already-revoked session. Idempotent by design; whether the token was live is not the caller's
business. Clears the cookie **and** revokes server-side, so a captured token cannot be replayed.

Tests: `T-A-037`.

---

### `GET /api/v1/auth/me`

Requires a valid session. Drives UI role gating.

**`200`** → `{ "actor": { …as above… } }` — permissions re-read from the database on every call.
**`401`** → `SESSION_INVALID`, including when the session is valid but the subject has since been
disabled or deleted (`T-A-035`).

---

### `POST /api/v1/auth/staff/register`

🟦 `ENH-06` — unblocks 🟩 `AC-11`, whose "Given a new staff member registers for access" no user
story provides.

**Request** `{ "email": string, "fullName": string, "roleKey": "receptionist"|"trainer"|"administrator"|"membership_manager"|"accounting_executive" }`

⬛ `member` is **not** an accepted `roleKey` — a member is not a `Staff` row.

**`202`** → `{ "status": "pending_approval" }` — **the same response whether or not the address is
already taken**, and an existing account is never modified. Otherwise this endpoint would be a
staff-directory oracle for an unauthenticated caller.

Creates `status: "pending"`, `passwordHash: null`. **A self-service endpoint can never mint a
usable account.**

**`400`** unknown role or malformed body · **`429`** rate limited.

Tests: `T-A-047`.

---

### `POST /api/v1/staff/:id/approve`

🟩 `AC-11` "activate the account and send login details" · 🟩 `NFR-11` "**Only** administrators".

Requires: valid session **+** `staff:approve` **+** CSRF header.

**`200`**
```json
{
  "staffId": "stf_…",
  "loginDetails": {
    "signInUrl": "http://localhost:5173/sign-in",
    "identifier": "trainer17@ironboard.dev.invalid",
    "role": "Trainer",
    "homeBranch": "Ironboard Andheri",
    "activationExpiresAt": "2026-08-22T08:00:00.000Z"
  }
}
```

⬛ **The activation token and `activationUrl` are deliberately absent from this response.** They
exist only in the queued `NotificationOutbox` row, so an administrator never handles the staff
member's secret. `T-A-041` asserts it.

**`400`** `ACTIVATION_INVALID` — target unknown, or not `pending`
**`401`** no session · **`403`** not an administrator · **`400`** CSRF missing/mismatched

⚠️ Status stays `pending` until the link is used. Approval grants the *right* to set a password.
⚠️ **`AC-11` is NOT verified** — the outbox row is written but no dispatcher exists, so nothing is
actually sent.

Tests: `T-A-020`, `T-A-041`, `T-A-042`, `T-A-043`, `T-A-049`.

---

### `POST /api/v1/auth/activate`

🟩 `AC-11` set-password path. Unauthenticated **by necessity** — the holder has no session yet and
the single-use token *is* the proof.

**Request** `{ "token": string, "password": string }` — password 12–128 characters.

**`200`** → `{ "staffId": "stf_…", "status": "active" }`
Sets the Argon2id hash, flips `status` to `active`, **clears the token**, and **revokes every
existing session** for that subject.

**`400`** `ACTIVATION_INVALID` — unknown, expired, or already used (indistinguishable)
**`400`** `VALIDATION_FAILED` — password too short; **the token is not consumed**, so a typo does
not burn the link
**`429`** rate limited, so the token space cannot be probed

Tests: `T-A-021`…`T-A-025`, `T-A-049`.

---

## 3. Not implemented

| Group | Endpoints | Status |
|---|---|---|
| D01 Reception · D02 Trainer · D03 Admin · D04 Membership · D05 Accounting | ~48 | 🔴 **Phase 4B.** Absent, not unguarded |
| Member portal (`/me/*`) | 5 | 🔴 Phase 4B (`ENH-01`) |
| Member set-password | — | 🔴 **No schema support and no source requirement.** See `AUTHENTICATION.md` §1 |
| Notification dispatch | — | 🔴 Outbox rows accumulate; nothing sends them |

**Every one of the 25 functional requirements is still 0 % delivered at the API level.** The eight
endpoints above are foundation, not features.

# Ironboard — Authentication

**Phase:** 4A — Authentication Foundation · **Date:** 2026-08-21
**Status:** ✅ **IMPLEMENTED AND TESTED.** 83 authentication tests passing; 224/224 suite-wide.
**Evidence:** `docs/testing/evidence/phase4a-auth-*.log`

> **This document describes the implementation, not a plan.** Every mechanism below exists in
> `server/src/` and is exercised by a named test. Where something is *not* implemented, it says so
> in those words.

## Label key — used throughout, never mixed

| Label | Meaning |
|---|---|
| 🟩 **SOURCE REQUIREMENT** | Comes from `reference/`. Wording preserved verbatim, never rewritten |
| 🟦 **ENGINEERING DECISION** | Chosen by us and justified. **Never academic coverage** |
| ⬛ **IMPLEMENTATION DETAIL** | How the decision is realised in code. Changeable without changing the decision |

> ⚠️ **The whole of authentication is 🟦.** `AMB-03` records that **no supplied document defines
> authentication at all** — no login, no credentials, no sessions, no permission matrix. Only two
> things here are 🟩-driven: `AC-11`'s account activation, and the *need* for immediate revocation
> that `AC-11` and `AC-17` create. Nothing in this document may be counted toward the 25 academic
> requirements.

---

## 1. What was built

| Capability | Status | Where | Tests |
|---|---|---|---|
| Password hashing (Argon2id) | ✅ | `platform/auth/password.ts` | `T-A-001`…`T-A-006` |
| Account activation (`AC-11`) | ✅ staff | `platform/auth/activation.service.ts` | `T-A-020`…`T-A-026` |
| Login (all six roles) | ✅ | `platform/auth/auth.service.ts` | `T-A-030`, `T-A-032`…`T-A-036` |
| Logout | ✅ | same | `T-A-037` |
| Session creation | ✅ | `platform/auth/session.service.ts` | `T-A-010` |
| Session validation | ✅ | same | `T-A-011`, `T-A-012` |
| Session expiration (idle + absolute) | ✅ | same | `T-A-013`, `T-A-014` |
| Invalid credential handling | ✅ | `platform/auth/errors.ts` | `T-A-032`, `T-A-040` |
| Disabled account handling | ✅ staff | `auth.service.ts` | `T-A-035` |
| Pending account handling | ✅ staff | `auth.service.ts` | `T-A-034` |
| Secure password storage | ✅ | `password.ts`, seed | `T-A-001`, `T-U-062` |
| Secure session handling | ✅ | `session.service.ts`, `http/middleware.ts` | `T-A-017`, `T-A-031` |
| Deny-by-default authorisation | ✅ (auth surface only) | `http/middleware.ts`, `platform/rbac/` | `T-A-042` |
| Input validation | ✅ | `http/schemas.ts` | `T-A-045` |
| Rate limiting | ✅ | `http/middleware.ts` | `T-A-044` |
| CSRF | ✅ | `http/middleware.ts` | `T-A-043` |
| Security-conscious logging | ✅ | `platform/logging/logger.ts` | `T-A-046` |

### Not built — stated plainly

| Gap | Why not |
|---|---|
| **Member activation / set-password** | ⚠️ `Member` has `passwordHash` but **no** `activationTokenHash`, `activationExpiresAt` or `status` columns. No acceptance criterion describes a member obtaining a password — `AC-11` is about *staff*, and the member portal is `ENH-01`. Building it would mean inventing a requirement **and** migrating the schema. A member **can** log in (implemented, tested); there is **no route by which a member gets a password**. One documented demo member is seeded so the path is exercisable. **Needs a decision from the requirement owner.** |
| **Disabled *member* accounts** | `Member` has no `status` column. `AC-17`'s "stop gym access" is membership state (`B-05`), not account status. Not invented. |
| **Notification dispatch** | ADR-008's outbox row is written; **no dispatcher exists**, so nothing is actually emailed. `AC-11` is therefore **not** VERIFIED. |
| **Field encryption** | `NFR-21`/`NFR-10` need it. `conditionCipher` still holds placeholders. Phase 4B+. |
| **The other ~50 endpoints** | Phase 4B. Absent rather than unguarded. |

---

## 2. Password hashing

🟦 **Argon2id** (ADR-006, SECURITY_ARCHITECTURE §2), via `@node-rs/argon2` — prebuilt binaries, so
no native toolchain is required.

⬛ Parameters, stated explicitly rather than left implicit:

| Parameter | Value | Source |
|---|---|---|
| Algorithm | Argon2id | ADR-006 |
| Memory cost | 19 456 KiB (19 MiB) | OWASP second-recommended configuration |
| Time cost | 2 | same |
| Parallelism | 1 | same |
| Salt | 16 bytes, random **per hash** | library default; `T-A-002` proves hashes differ |
| Encoding | PHC string (`$argon2id$v=19$m=…`) | parameters travel with the hash, so cost can be raised later without invalidating stored hashes |

All four are overridable by environment variable (`ARGON2_*`) — see `src/config.ts`.

**Rules the code enforces, not merely documents:**

1. A plaintext password never leaves `password.ts` and is **never stored**.
2. A hash is never compared with `===`; only `verify()` decides.
3. A missing, empty or corrupt stored hash returns `false` — never an exception. A 500 would tell
   an attacker the record is unusual (`T-A-004`).
4. Length bounds 12–128. **No composition rules** — they push users toward predictable
   substitutions, and no source asks for them. The upper bound exists because an unbounded input
   to a memory-hard hash is a DoS vector (`T-A-005`).

### Development credentials

🟦 The seed uses **one** documented development password:

```
DEV_PASSWORD = IronboardDev!2026      (server/src/db/dev-credentials.ts)
```

It is committed **deliberately** — a development database nobody can sign into is useless — and it
is safe to commit because it authenticates only fabricated accounts on RFC 2606 `.invalid` domains
in a local SQLite file. **It is not a real personal credential and must never protect anything
real.**

| Account | Email pattern | Password |
|---|---|---|
| Administrator | `administrator1@ironboard.dev.invalid` | `IronboardDev!2026` |
| Other active staff (17) | `<role><n>@ironboard.dev.invalid` | `IronboardDev!2026` |
| Pending staff (1) | `trainer17@ironboard.dev.invalid` | **none** — cannot log in |
| Demo member (1) | `member1@example.invalid` | `IronboardDev!2026` |
| Other members (999) | `member<n>@example.invalid` | **none** — cannot log in |

The Phase 3 placeholder `DEV_SEED_NOT_A_REAL_HASH` is **gone**. `T-U-062` now asserts the stored
value is an Argon2id hash, that the plaintext appears in no column, and that pending accounts have
a null hash.

⚠️ **Seed determinism, honestly stated:** Argon2id embeds a random salt, so `passwordHash` differs
between seed runs **by design**. The seed remains deterministic in every other column, and
`T-U-063` fingerprints counts and totals rather than hashes, so the determinism guarantee is
unchanged where it is asserted.

---

## 3. Account activation — the `AC-11` write path

### 🟩 The requirement, verbatim and unaltered

> "Given a new staff member registers for access, When the admin reviews and clicks \"Approve\",
> Then activate the account and **send login details**." — `AC-11`
>
> "Only administrators should be able to approve staff accounts." — `NFR-11`

### 🟦 The finalized interpretation

Recorded in `docs/decisions/DEVIATIONS.md` §1 and implemented exactly as recorded. "Login details"
legitimately means *where* and *who*, not only a secret, so the approval notification carries:

| Component | Implemented as | Satisfies |
|---|---|---|
| Sign-in URL | `config.signInUrl` | "login details" |
| Login identifier | the account's email | "login details" |
| Assigned role | role display name | "login details" |
| Home branch | branch name or `null` (`B-03` nullable) | "login details" |
| **Set-password link** | single-use, time-limited activation URL | "activate the account" |

**A password is never generated, never transmitted and never stored in plaintext.** The residual
deviation is narrow — a password is not included — and it is recorded, not hidden.

### ⬛ Token properties, and where each is enforced

| Property | Mechanism | Test |
|---|---|---|
| Securely generated | `randomBytes(32)` → base64url (256 bits) | `T-A-020` |
| Stored safely | only `sha256(token)` reaches `Staff.activationTokenHash` (unique) | `T-A-020` |
| Time-limited | `activationExpiresAt`, default 24 h, checked against the **injected** clock | `T-A-023` |
| Single-use | consumed inside a transaction that nulls the hash | `T-A-022` |
| Invalidated after use | same transaction; a replay finds no row | `T-A-022` |
| Race-safe | two concurrent uses → exactly one succeeds | `T-A-022` |
| Not probeable when expired | an expired token is **cleared** on the failed attempt | `T-A-023` |
| Not burned by a typo | a rejected weak password leaves the token intact | `T-A-025` |

### The flow

```
staff self-registers (ENH-06)          POST /api/v1/auth/staff/register  → status=pending, hash=null
        │
admin approves (AC-11, NFR-11)         POST /api/v1/staff/:id/approve    → token issued, outbox row queued
        │                                                                   status STAYS pending
staff opens the link and sets a password
        │                              POST /api/v1/auth/activate        → hash set, status=active,
        │                                                                   token cleared, sessions revoked
staff signs in                         POST /api/v1/auth/login
```

Approval alone does **not** produce a usable login, because a usable login would need a password
the administrator does not have. That is what "activate the account" means once credential
transmission is off the table.

⚠️ **`AC-11` is NOT verified.** The outbox row is written but **no dispatcher exists**, so nothing
is sent. The mechanism is tested; the criterion is not satisfied.

---

## 4. Sessions

🟦 ADR-006: opaque server-side sessions, **not JWT**. 🟩-adjacent justification: `AC-11` activates
an account and `AC-17` "stops gym access", and both must take effect **immediately** — which a
stateless token cannot do without a denylist, i.e. a session table with extra moving parts.

Implemented on the `Session` table Phase 3 already shipped. **No migration was required.**

| Concern | Implementation | Test |
|---|---|---|
| Token | 32 random bytes, base64url, opaque — carries no information to leak | `T-A-010` |
| Storage | only `sha256(token)`; a database dump yields no usable cookie | `T-A-010` |
| Creation | `Session` row with `subjectType` ∈ {`staff`,`member`} + `subjectId` | `T-A-010` |
| Lookup | by `tokenHash` (unique index) | `T-A-011` |
| Idle expiry | `expiresAt` **slides** forward on each validation (30 min default) | `T-A-013` |
| Absolute expiry | `createdAt + 12 h`, which sliding can never exceed | `T-A-014` |
| Revocation | `revokedAt` set — immediate | `T-A-015` |
| Logout | revoke by token; idempotent | `T-A-037` |
| Bulk revocation | every live session for a subject, on disable or password change | `T-A-015`, `T-A-026` |
| Expired rows | **revoked in place, not deleted** — the audit trail keeps the evidence | `T-A-013` |

### ⬛ How both expiry limits fit columns that lack a `lastSeenAt`

SECURITY_ARCHITECTURE §2 requires "absolute + idle, both stored server-side". `Session` has
`createdAt` and `expiresAt` but no `lastSeenAt`. Both limits are enforced exactly, with no schema
change:

```
expiresAt = min(now + idleTtl, createdAt + absoluteTtl)
```

A session dies when left alone for `idleTtl`, and dies at the absolute cap however busy it is. See
**ADR-017**. `expiresAt` is written only when the value actually moves, so a burst of requests in
one millisecond is not a burst of writes on a single-writer database.

### What the frontend receives

**Nothing internal.** `publicSessionView()` returns exactly `{ expiresAt }` — no session id, no
`tokenHash`, no `subjectId`. `T-A-017` asserts the key set is exactly `['expiresAt']`.

### Cookie

| Flag | Value | Why |
|---|---|---|
| `httpOnly` | ✅ always | XSS cannot read it |
| `SameSite` | `Strict` | a cross-site form cannot ride it |
| `Secure` | **production only** | localhost has no TLS; the cookie would never be set and the app would be untestable. Asserted in both modes by `T-A-031` |
| `Path` | `/` | |
| `Expires` | session expiry | |

⚠️ Both TTLs are `ASM` values. **Neither is sourced.** The `[EXP2]` handout's 10-second inactivity
logout is a **sample about a different system** (`INC-02`) and is not an Ironboard requirement.

---

## 5. Error handling — the security-critical design

🟦 **Every credential failure returns the identical response.** Internally the service
distinguishes five reasons; externally there is one.

| Internal reason | Response |
|---|---|
| `UNKNOWN_SUBJECT` | `401 { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } }` |
| `WRONG_PASSWORD` | *identical* |
| `NO_PASSWORD_SET` | *identical* |
| `ACCOUNT_PENDING` | *identical* |
| `ACCOUNT_DISABLED` | *identical* |

`T-A-040` asserts all four reachable cases return a **byte-identical body** and that no response
contains the words `pending`, `disabled`, `unknown`, `not found`, `approval` or `exist`. The reason
survives in the server log (`T-A-040`), not in the response.

SECURITY_ARCHITECTURE §6 requires an "identical response for unknown user vs wrong password". This
implementation extends that to pending and disabled: telling a caller "awaiting approval" confirms
the address belongs to a real employee, which is exactly the enumeration the rule exists to stop.
See **ADR-016**.

### Two further leak channels closed

1. **Timing.** An unknown email would otherwise return in ~0 ms and a wrong password in ~50 ms,
   enumerating accounts by stopwatch whatever the body says. `verifyDummy()` spends the same
   Argon2id work on a nonexistent account (`T-A-006`). The password is also verified **before**
   account state is judged, so pending/disabled cost the same as active.
2. **Self-registration.** `POST /auth/staff/register` returns the same `202
   {status:"pending_approval"}` whether or not the address is taken, and never modifies an existing
   account (`T-A-047`).

### Status codes

| Code | When | Note |
|---|---|---|
| 400 | validation, CSRF, activation failure | activation failures are uniform |
| 401 | no/invalid/expired session; any credential failure | one body for all |
| 403 | authenticated but lacking the permission | 403-vs-401 is not a secret — the caller already proved who they are |
| 429 | rate limited | with `Retry-After` |
| 500 | unexpected | flat body, **no stack, no Prisma message** |

---

## 6. Other controls

| Control | Implementation | Test |
|---|---|---|
| Input validation | Zod at the boundary; normalise-then-validate for emails | `T-A-045` |
| Rate limiting | fixed window, **two** independent limits: 10/IP and 5/identifier per 15 min | `T-A-044` |
| CSRF | double-submit cookie + `x-csrf-token` header on mutations; constant-time compare | `T-A-043` |
| Body size | 64 KB JSON cap | `T-A-045` |
| Headers | `helmet()` — CSP, `nosniff`, no `X-Powered-By` | `T-A-048` |
| Proxy | `trust proxy = false` — `X-Forwarded-For` is not honoured, so the IP limit cannot be spoofed | — |
| 404 | flat body, no stack | `T-A-048` |

⚠️ **Rate-limiter limitation, recorded not glossed:** the counter is **in-process memory**. That is
sufficient because ADR-001 is a single-process monolith over an embedded single-writer database —
there is no second instance to share state with. **A multi-instance deployment would need a shared
store.** Expired buckets are swept on each call so the maps cannot grow without bound.

### Logging

🟦 Two rules enforced in `logger.ts` rather than left to caller discipline:

1. **No secret is logged** — passwords, tokens, hashes, cookie headers → `[REDACTED]`.
2. **No medical data is logged.** 🟩 `NFR-10` restricts medical information to authorised trainers;
   a log file is not an authorised trainer. Medical keys are **dropped entirely**, not redacted, so
   their presence cannot be inferred from the log shape.

Emails are written only as a one-way `fp_…` fingerprint, so a leaked log cannot be mined for a
member or staff directory. `T-A-046` asserts all of it.

---

## 7. Threat notes

| Threat | Mitigation | Residual |
|---|---|---|
| Credential stuffing | Argon2id + per-identifier and per-IP limits | No breach-corpus check |
| Account enumeration | uniform bodies, uniform timing, uniform registration response | — |
| Session theft (XSS) | `httpOnly` | XSS could still act *as* the user; CSP reduces the surface |
| Session theft (network) | `Secure` in production | dev is plain HTTP by design |
| CSRF | `SameSite=Strict` + double-submit | — |
| Session fixation | CSRF token rotated on login; session created fresh | — |
| Token theft from a DB dump | only hashes stored | — |
| Activation-link interception | single-use, 24 h, cleared on use | email transport is out of our control |
| Brute-forcing activation tokens | 256-bit tokens + rate limiting | — |
| Privilege escalation | deny-by-default; permissions read from the DB per request | Phase 4B must declare a permission on every new route |
| Stale privilege | `/auth/me` and `authenticate` re-read the subject each request, so a disabled account dies on its next call | — |

---

## 8. Traceability

| ID | Relationship | Status |
|---|---|---|
| 🟩 `AC-11` | Activation mechanism implemented | **PARTIAL** — no dispatcher, so nothing is "sent" |
| 🟩 `NFR-11` | `staff:approve` permission; all four non-admin staff roles and members denied | **PARTIAL** — guard tested (`T-A-042`); `AC-11`'s own suite absent |
| 🟩 `NFR-10` | Medical data excluded from logs | **NOT VERIFIED** — the resource-level `TrainerAssignment` guard is Phase 4B |
| 🟩 `NFR-21` | — | **NOT VERIFIED** — payment endpoints and field encryption are Phase 4B |
| 🟩 `AC-17` | Bulk revocation makes "stop gym access" immediate | **NOT VERIFIED** — membership cancellation is Phase 4B |
| 🟦 `ENH-01` | Member role authenticates through the same flow | Login ✅; activation ❌ (§1) |
| 🟦 `ENH-06` | Staff self-registration | ✅ implemented |
| 🟦 `ENH-15` | Session revocation / logout | ✅ implemented |
| 🟦 ADR-006 | Argon2id + server-side sessions | ✅ implemented as recorded |
| 🟦 ADR-007 | Deny-by-default RBAC | ✅ on the auth surface; the rest is Phase 4B |
| 🟦 ADR-016 | Uniform authentication failure response | **new in this phase** |
| 🟦 ADR-017 | Sliding-window session expiry on the existing columns | **new in this phase** |

> **No requirement is marked VERIFIED because authentication exists.** A requirement is VERIFIED
> only when its own acceptance criterion has a passing test. None does yet.

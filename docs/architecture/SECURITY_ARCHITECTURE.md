# Ironboard — Security Architecture

**Phase:** 2 — Architecture · **Date:** 2026-08-16 · **Status:** Design only, **nothing implemented**

---

## 0. What the source documents actually require

This section exists to prevent security work being over-claimed as academic coverage.

**Lab 2 contains exactly three security NFRs:**

| NFR | Verbatim | Bound FR |
|---|---|---|
| `NFR-10` | "Medical information should only be accessible to authorized trainers." | `FR-TRN-05` |
| `NFR-11` | "Only administrators should be able to approve staff accounts." | `FR-ADM-01` |
| `NFR-21` | "Payment information should be encrypted and accessible only to authorized staff." | `FR-ACC-01` |

**That is the entire sourced security requirement set.** Everything else in this document —
password hashing, sessions, CSRF, rate limiting, security headers, secret management — is
**[ENG] engineering baseline**, not academic coverage.

⚠️ **No source document defines authentication at all** (`AMB-03`). There is no requirement for
login, credentials, sessions, password rules or a permission matrix. The entire authentication
design is `ASM-03`.

### Not requirements — do not implement as such

The Experiment 2 handout contains a populated **Constraints** table used as a teaching example:
a 10-second inactivity logout, credit-card masking to the last 4 digits, a
`payment_preferences` audit log, peer review within 4 hours of check-in. **These describe a
different system.** They are not Ironboard requirements and must never be cited as such.

If any of them is implemented, it is an `ENH`.

---

## 1. Threat model

**[ENG]** — no source performs threat modelling.

| Asset | Threat | Control | Driver |
|---|---|---|---|
| Medical restrictions | Unauthorised staff reads a member's condition | Resource-level RBAC + encryption + audit | **`NFR-10`** |
| Payment data | Unauthorised read; tampering | Encryption at rest + RBAC + append-only ledger | **`NFR-21`**, `NFR-24` |
| Staff approval | Privilege escalation via self-approval | Admin-only guard, server-enforced | **`NFR-11`** |
| Member PII | Bulk exfiltration | RBAC, pagination caps, audit | **[ENG]** |
| Sessions | Theft, fixation, replay | `httpOnly`+`Secure`+`SameSite`, rotation, revocation | **[ENG]** |
| Financial records | Silent mutation | Append-only, compensating entries | `NFR-24` |
| Credentials | Offline cracking | Argon2id | **[ENG]** |
| Availability | Auth brute force / DoS | Rate limiting | `NFR-03`, `NFR-15` |

**Out of scope:** payment card data (no gateway integrated — `AC-21`'s "online" is a recorded
method only) · network-level attacks · physical security · insider threat beyond audit.

---

## 2. Authentication

**[ENG]** — ADR-006. Six roles authenticate through one flow.

| Control | Choice | Rationale |
|---|---|---|
| Hashing | **Argon2id** (`@node-rs/argon2`) | Memory-hard; current default |
| Session | **Opaque token, server-side row** | **Revocation is a functional need** |
| Cookie | `httpOnly`, `Secure`, `SameSite=Strict`, `Path=/` | XSS/CSRF mitigation |
| Rotation | New token on privilege change | Fixation |
| Expiry | Absolute + idle, both stored server-side | |
| Revocation | `revokedAt` — immediate | **`AC-11`**, **`AC-17`** |

**Why sessions, not JWT.** Two acceptance criteria demand immediate access changes:
`AC-11` activates a staff account on approval, and `AC-17` sets status "Cancelled" **and stops
gym access**. A stateless JWT cannot be revoked before expiry without a denylist — which is a
session table with extra moving parts.

⚠️ Idle-timeout duration is **not sourced**. The handout's 10-second logout is a sample about a
different system. Any value chosen is an `ASM`.

### Staff account lifecycle (`AC-11`)

```
register (ENH-06) ──► pending ──► [Administrator approves] ──► active ──► disabled
                                   NFR-11: admin only          login    revoke sessions
                                                               allowed
```

⚠️ `AC-11` says approval must "send login details". Emailing a credential is weak practice; the
design sends a **single-use activation link** instead and records the deviation as an
engineering decision, since no NFR constrains the mechanism.

---

## 3. Authorisation / RBAC

**[REQ]** `NFR-10`, `NFR-11`, `NFR-21`. ADR-007. `B-02` resolved by the six-role list.

**Deny-by-default.** Every route declares a permission; a route without one **fails closed**.
Checks happen in middleware *and* are re-verified in services for resource-level rules.
Client-side gating is UX only and is never trusted.

### Permission matrix

| Permission | Recep | Trainer | Admin | Member Mgr | Acct | Member |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| `member:create` / `update` | ✅ | — | — | — | — | — |
| `member:read` | ✅ | ✅ | ✅ | ✅ | ✅ | own |
| **`medical:read`** | — | **assigned only** | — | — | — | own |
| `medical:create` | ✅ | ✅ | — | — | — | — |
| `session:create` / `read` | ✅ | ✅ | ✅ | — | — | own |
| `plan:create` / `update` (workout) | — | ✅ | — | — | — | — |
| `progress:create` | — | ✅ | — | — | — | — |
| **`staff:approve`** | — | — | **✅ only** | — | — | — |
| `branch:*` | — | — | ✅ | — | — | — |
| `equipment:*` | — | — | ✅ | — | — | — |
| `report:attendance` | ✅ read | — | ✅ | — | — | — |
| `dashboard:read` | — | — | ✅ | — | — | — |
| `plan:create/publish` (membership) | — | — | — | ✅ | — | — |
| `membership:cancel` / `renew` | — | — | — | ✅ | — | — |
| `membership:read` | ✅ | ✅ | ✅ | ✅ | ✅ | own |
| **`payment:create`** | — | — | — | — | **✅** | — |
| `invoice:create` / `read` | — | — | — | — | ✅ | own |
| `refund:approve` / `create` | — | — | — | — | ✅ | — |
| `report:revenue` | — | — | ✅ read | — | ✅ | — |

### Two rules stricter than a role check

**`NFR-10` — "authorized trainers"**, not "trainers". A blanket Trainer grant would not satisfy
the requirement as written. Enforced via `TrainerAssignment`:

```
allow(medical:read) ⟺ actor.role = Trainer
                    ∧ ∃ TrainerAssignment(trainerId = actor.id, memberId = target)
```

**`NFR-11` — "Only administrators"**. The test asserts the other **five** roles are denied,
not merely that admins are allowed.

**Member scope** (`ENH-01`): every `/me/*` route derives the subject from the session and never
accepts an id from the caller.

---

## 4. Encryption

**[REQ]** `NFR-21` "Payment information should be **encrypted**"; **[ENG]** extension to medical
data, since `NFR-10` requires restricted access but not encryption.

| Data | At rest | Basis |
|---|---|---|
| `Payment` sensitive fields | AES-256-GCM, application-layer | **`NFR-21`** |
| `MedicalRestriction.condition` | AES-256-GCM | **[ENG]** — defence in depth for `NFR-10` |
| Passwords | Argon2id (hash, not encryption) | **[ENG]** |
| Session tokens | SHA-256 hash stored; plaintext only in the cookie | **[ENG]** |
| Database file | Filesystem/volume encryption | **[ENG]** — deployment concern |

⚠️ `NFR-21` names **no algorithm, key length, key management or rotation policy**. All are
assumptions. Keys come from environment configuration and are never committed.

**In transit:** TLS terminated at the reverse proxy; HSTS enabled. **[ENG]** — no NFR requires it.

---

## 5. Input validation

**[REQ]** `NFR-02`. ⚠️ **No field rules exist in any source** (`INC-05`).

| Layer | Enforces |
|---|---|
| Zod at the HTTP boundary | Types, formats, ranges, required-ness, max lengths |
| Prisma generated types | Structural correctness at compile time |
| Database CHECK constraints | Enum values, non-negative amounts |
| Service invariants | State transitions (`NFR-17`), refund ≤ payment (`NFR-24`) |

**Rules:** parse, never trust · reject unknown keys (`.strict()`) · cap body size and page size ·
parameterised queries only, via Prisma.

---

## 6. Session and request protection

**[ENG]** — none of this is required by any source.

| Control | Detail |
|---|---|
| CSRF | Double-submit token required on all mutations |
| CORS | Strict origin allow-list; credentials enabled |
| Helmet | CSP, `X-Content-Type-Options`, `Referrer-Policy`, HSTS, frame denial |
| Rate limiting | Strict on `/auth/*`; general cap elsewhere |
| Body limits | JSON size cap |
| Timing | Constant-time credential comparison; identical response for unknown user vs wrong password |

---

## 7. Audit trail

**[REQ]-adjacent — `ENH-13`.** Driven by `NFR-24`, `AC-23` "system transaction logs" and
`AC-24` "log the transaction". ADR-011.

| Event | Driver |
|---|---|
| Login success / failure, logout | **[ENG]** |
| Staff approval | `AC-11`, `NFR-11` |
| **Medical data access** | **`NFR-10`** — read events are audited, not just writes |
| Payment, refund, invoice | `AC-21`, `AC-22`, `AC-24`, `NFR-24` |
| Membership state transition | `AC-17`, `AC-18` |
| Branch disable | `AC-12` |
| Permission denied (403) | **[ENG]** — detects probing |

Records actor, action, entity, before/after, timestamp, IP. **Append-only, never updated or
deleted**, written **in the same transaction** as the business change.

---

## 8. Logging hygiene

**Redaction is mandatory**, or encryption is defeated by the log file:
`password`, `passwordHash`, `token`, `tokenHash`, `condition` (medical, `NFR-10`), and all
`Payment` sensitive fields (`NFR-21`).

Logs are operational and rotatable; the audit trail is durable. They are **not** the same thing.

---

## 9. Secrets and configuration

**[ENG]** — no secret is ever committed. Configuration is parsed and validated at boot with
fail-fast behaviour: session secret, encryption key, database URL, mail transport. Absence of a
required secret must crash the process, not silently disable a control.

---

## 10. Security testing

Owned by `testing-and-quality`. **No PASS without evidence.**

| Test | Asserts | Status |
|---|---|---|
| `T-SEC-001` | `NFR-10` — non-assigned trainers and all other roles denied medical data | ⛔ `B-02` resolved, awaits implementation |
| `T-SEC-002` | `NFR-11` — five non-admin roles denied staff approval | ⛔ |
| `T-SEC-003` | `NFR-21` — payment fields encrypted at rest; unauthorised roles denied | ⛔ |
| `T-SEC-004` | Deny-by-default — a route with no permission declaration fails | **[ENG]** |
| `T-SEC-005` | Session revocation is immediate (`AC-11`, `AC-17`) | **[ENG]** |
| `T-SEC-006` | CSRF rejected without token | **[ENG]** |
| `T-SEC-007` | Rate limiting on `/auth/login` | **[ENG]** |

Only `T-SEC-001`…`003` count toward academic NFR coverage. The rest are enhancement.

---

## 11. Honest limitations

Stated plainly rather than papered over:

1. **No source requires authentication.** The entire design is an assumption (`ASM-03`).
2. **`NFR-21` specifies "encrypted" and nothing else** — no algorithm, key size, or rotation.
3. **"Authorized trainers" is interpreted** as per-member assignment. A weaker reading is
   possible; the stricter one was chosen deliberately (ADR-007).
4. **No payment gateway** — card data never enters the system, so PCI scope is avoided rather
   than addressed.
5. **Session timeout values are invented.**
6. **`AC-11`'s "send login details"** is implemented as an activation link, deviating from a
   literal reading on security grounds.
7. **No accessibility, compliance or data-retention NFR exists** — nothing here claims coverage
   of them.

---

## 12. Related

`SYSTEM_ARCHITECTURE.md` · `API_ARCHITECTURE.md` · `DATABASE_DESIGN.md` ·
`ARCHITECTURAL_DECISIONS.md` (ADR-006, 007, 011) ·
`docs/requirements/LAB2_NFR_TRACEABILITY.md`

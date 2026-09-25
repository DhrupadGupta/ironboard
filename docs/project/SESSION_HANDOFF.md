# Ironboard — Session Handoff

**Rewritten:** 2026-08-16 · **Updated for Phase 4A:** 2026-08-21, from the live repository.
**Branch:** `claude/ironboard-handoff-review-0o2pag` ·
**HEAD at time of writing:** `3292c8c` (this document is committed on top of it — run
`git log -1` for the current SHA) ·
**PRs:** [#2](https://github.com/DhrupadGupta/ironboard/pull/2) (this branch → PR #1's branch)
stacked on [#1](https://github.com/DhrupadGupta/ironboard/pull/1) (→ `main`)

> **`reference/` is the authority and is READ-ONLY.** Every requirement claim here must be
> re-verified against `reference/lab1/`, `reference/lab2/`, `reference/course-policy/` and
> `reference/experiments/`. Nothing in `reference/` may be modified, renamed or deleted.
>
> **This document describes implementation state. Verify it, do not trust it.** Every number
> below was measured on 2026-08-21 with the command shown.

---

## 1. Verified implementation state

| Fact | Value | Command |
|---|---|---|
| Entities | **29** | `grep -c '^model ' server/prisma/schema.prisma` · 29 `CREATE TABLE` in the migration · `T-U-001` asserts the set exactly |
| CHECK constraints | **36** | `T-U-030`/`T-U-032` — one case per constraint, plus a drift guard |
| Partial unique indexes | **2** | `Membership_one_active_per_member`, `TrainerAssignment_one_live_per_pair` |
| Triggers | **7** | 3 append-only, 1 transition guard, 1 over-refund guard |
| Tests | **224 passing** (141 database + 83 authentication) | `cd server && npm test` |
| Typecheck | clean | `cd server && npm run typecheck` |
| Project skills | **6** | `ls .claude/skills` |
| HTTP endpoints | **8**, all authentication | `docs/architecture/API_CONTRACTS.md` |
| Department service / API / frontend code | **none** | `ls server/src` → `db/`, `http/`, `platform/` only |
| Mandatory academic diagrams | **0 of 11** (+ 0 of 1 written artefact) | `ls docs/diagrams` — both diagrams present are enhancements |

⚠️ **Numbers this document previously got wrong**, corrected: "28 entities" (it is 29) and
"136/136 tests" (it was 135/136 cold-cache before the isolation fix). Phase 4A then took the
total to **224**.

---

## 2. Where the project actually is

| Field | Value |
|---|---|
| **Current phase** | **Phase 4A — Authentication Foundation: COMPLETE.** 12-point self-review passed; 224/224 tests green. |
| **Completed** | Phase 0 (analysis + 6 skills) · Phase 1 (master plan + 17 ADRs) · Phase 2 **architecture subset** · Phase 3 **database** · Phase 4A **authentication** |
| **Not started** | Phase 2b (requirements docs + **all 11 mandatory diagrams + `DIA-05`**) · Phase 4B (department modules, RBAC on the rest, design-system primitives) · Phases 5–9 |
| **Overall** | 🟡 **Foundation only.** Database + authentication exist and are well tested. **No department service, no department API, no frontend, no UI.** **0 of 25** functional requirements delivered. **0 of 25** NFRs verified. **0 of 11** mandatory diagrams and **0 of 1** mandatory written artefact. |

| Phase | Name | Status |
|---|---|---|
| 0 | Analysis & skills | ✅ |
| 1 | Master plan | ✅ |
| 2 | Architecture ✅ / requirements & design diagrams 🔴 | 🟡 |
| 2b | Requirements docs + 11 diagrams + `DIA-05` | 🔴 **unblocked** |
| 3 | Foundation — database | ✅ |
| 4A | Foundation — **authentication** | ✅ |
| 4B | Department modules (service + API), RBAC on the rest, design-system primitives | 🔴 **unblocked** |
| 5 | Frontend | 🔴 |
| 6 | Cross-cutting | 🔴 |
| 7 | Verification | 🔴 |
| 8 | Academic deliverables | 🔴 |
| 9 | Audit & submission | 🔴 |

---

## 3. What exists on disk

### Database

SQLite (WAL, `synchronous = FULL`, `foreign_keys = ON`) via Prisma 6 + `better-sqlite3`
(ADR-005). Integrity is enforced **by the database**, because outside authentication there is
still no application code to enforce it: 36 CHECK constraints, 2 partial unique indexes, 7 triggers, FK actions declared per
relation (`Cascade` / `Restrict` / `SetNull`). Money is `INTEGER` minor units everywhere
(`NFR-24`) — **no floats**. CHECK constraints are hand-injected into the migration because
Prisma cannot express them; `T-U-032` guards against drift.

```
server/
├── prisma/schema.prisma                  29 models
├── prisma/migrations/20260816135841_init/migration.sql
├── src/db/{client,ids,seed,reset,dev-credentials}.ts
├── src/config.ts
├── src/platform/auth/{password,tokens,errors,deps,session.service,activation.service,auth.service}.ts
├── src/platform/{rbac/permissions,logging/logger}.ts
├── src/http/{app,middleware,schemas}.ts
├── tests/{schema,checks,constraints,membership,relationships,seed}.test.ts + helpers, global-setup
└── tests/auth/{password,session,activation,login.api,security.api}.test.ts + helpers
```

**Deterministic seed** (`ENH-16`, mulberry32, `SEED_EPOCH = 2026-08-16T00:00:00Z`): 4 branches
(3 active + 1 **disabled**, so `AC-12` has a fixture) · 6 roles · 36 permissions ·
60 role-permissions · 18 staff (1 **pending**, so `AC-11` has a subject) · 1 000 members ·
5 plans · 1 000 memberships (`ACTIVE=725 EXPIRED=175 CANCELLED=100`) · 11 792 attendance events ·
952 payments/receipts/invoices · 37 refunds · 989 ledger entries · 101 audit events ·
100 outbox rows · 40 medical restrictions · 36 equipment · 350 trainer assignments ·
250 workout plans · **0 sessions** · 44 members with `NULL homeBranchId`. Runs in ~1.3 s.
Contains **no real personal data** (`.invalid` domains, `DEV_SEED_PLACEHOLDER:` medical
strings). Since Phase 4A `passwordHash` holds a **real Argon2id hash** of one documented
development password — see `docs/security/AUTHENTICATION.md` §2. `T-U-062` asserts the
placeholder is gone, the stored value is a hash, and the plaintext appears in no column.

### Everything else

| Layer | State |
|---|---|
| Frontend | **Does not exist.** No `client/`, no React, no Vite. React+TS+Vite is a *decision*, not code |
| Service / API | **Authentication only.** **8 of ~56** designed endpoints exist, all of them auth (`docs/architecture/API_CONTRACTS.md`). **Zero department endpoints** — `API_ARCHITECTURE.md` remains a design for those |
| Authentication | ✅ **IMPLEMENTED (Phase 4A).** Argon2id hashing, opaque server-side sessions with idle + absolute expiry and immediate revocation, `AC-11` single-use activation, login/logout for all six roles, uniform failure taxonomy (ADR-016), rate limiting, CSRF, redacting logger. 83 tests. **No schema change** (ADR-017). ⚠️ **Member activation is NOT implemented** — no schema support, no source requirement |
| Authorization | 🟡 **Partial.** Deny-by-default `requirePermission()` exists and is wired to the auth surface — `staff:approve` proven to deny all five non-admin roles (`T-A-042`). The other ~48 endpoints and `NFR-10`'s per-member `TrainerAssignment` gate are **Phase 4B** |
| Integrations | **None.** `NotificationOutbox` is the data shape only — no dispatcher, no email, no SMS (SMS is an explicit stub, `AMB-12`) |
| Diagrams | Architecture + ER (`DIA-16`) exist — **both enhancements, both count 0** toward academic coverage |

---

## 4. Decisions — five of six resolved. Do not reopen.

| ID | Question | Status | Outcome as implemented |
|---|---|---|---|
| `B-01` | Do members log in? | ✅ **RESOLVED** | **Yes.** Six roles including Member, tracked as `ENH-01`, **excluded from academic coverage** — zero of the 25 Lab 1 stories is owned by a member |
| `B-02` | Authorisation model | ✅ **RESOLVED** (ADR-007) | **Six roles, deny-by-default.** Every endpoint must declare a permission; undeclared fails closed. Two checks are **resource-level**: `NFR-10` (assigned trainers only) and `NFR-11` (admins only) |
| `B-03` | Is branch a data-scoping boundary? | ✅ **RESOLVED** | **No.** Descriptive attribute. `Member`/`Staff.homeBranchId` **nullable**; `Equipment`/`AttendanceEvent`/`AttendanceDaily.branchId` NOT NULL; `MembershipPlan` has **no** branch column. **No row-level isolation; no query path filters by branch.** Supersedes ADR-014 and withdraws `ASM-05` |
| `B-04` | Who creates the five missing record types? | ✅ **RESOLVED** | `ENH-02` check-ins · `ENH-03` medical · `ENH-04` equipment · `ENH-06` staff self-registration · `ENH-07` prospects — all implemented. **`ENH-05` (`RefundRequest`) WITHDRAWN** — `AC-24`'s approval is an *external* precondition, captured as data on `Refund` |
| `B-05` | Membership state set | ✅ **RESOLVED** | **Exactly three:** `ACTIVE`, `EXPIRED`, `CANCELLED`. `EXPIRING` is a **derived predicate**, never stored. `CANCELLED` is terminal. Enforced three ways: CHECK, transition trigger, partial unique index. Supersedes ADR-013 and withdraws `ASM-13` |
| `B-06` | Which experiment numbering governs? | ⚠️ **OPEN** | Only faculty can answer. Affects **submission labelling only, not code**. Mitigated by labelling per artefact (`ASM-16`) |

Records: `docs/decisions/B-03_DECISION.md`, `B-04_API_DECISIONS.md`,
`B-05_MEMBERSHIP_STATE_MACHINE.md`, `DEVIATIONS.md`; ADR-007, ADR-013, ADR-014.

### Other decisions that shape the code

| ID | Decision |
|---|---|
| ADR-005 | SQLite + Prisma + `better-sqlite3` |
| ADR-006 | Revocable server-side sessions, **not JWT** — `AC-11` and `AC-17` both need immediate effect |
| ADR-008 | Transactional outbox — keeps provider latency outside `NFR-01`'s 3 s budget |
| ADR-011 | Append-only ledger; corrections are compensating entries, never edits |
| ADR-012 | 🟦 **Engineering** verification thresholds for a student project — **never** a source requirement, never a production SLA |
| `ENH-19` | Membership creation is separate from member registration, so `AC-01`'s wording is never rewritten |
| `ENH-20` | `TrainerAssignment` records *why* a trainer may see a member (`NFR-10`'s "**authorized** trainers") |
| `AC-11` deviation | Activation link, **no password ever transmitted** — recorded in `DEVIATIONS.md` |
| `NFR-10` deviation | Reading B (per-member), a strict subset of Reading A — recorded in `DEVIATIONS.md` |

---

## 5. Remaining blockers

| ID | Blocker | Blocks what |
|---|---|---|
| `B-06` | Which experiment numbering governs | **Labelling only** — no code. Escalate to the user/faculty |
| `AMB-10` | The source does **not** provide the five shortlisted literature-survey case studies | The literature survey. Recorded **EVIDENCE NOT AVAILABLE**. **Must not be fabricated** |
| `ASM-09` | The "three golden rules" appear in no supplied document | `DIA-12` proceeds under the stated assumption, clearly labelled |

**Nothing else is blocked.** `B-01`–`B-05` are resolved; the six previously-blocked stories
(`US-05`, `US-10`, `US-11`, `US-13`, `US-14`, `US-24`) have database support and need service,
API and UI work — not another decision.

---

## 6. Technical debt and warnings

| # | Item |
|---|---|
| 1 | ~~No password hashing~~ ✅ **CLOSED in Phase 4A** — Argon2id (ADR-006), documented dev credential, placeholder eliminated |
| 2 | **No field encryption.** `MedicalRestriction.conditionCipher` holds placeholders, **not ciphertext**. `NFR-21`/`NFR-10` need real encryption |
| 3 | **Seed is anchored to a fixed epoch (2026-08-16).** Determinism was chosen over relevance, so "expiring soon" fixtures drift as wall-clock time advances. ✅ **Partly addressed:** Phase 4A injects the clock through `AuthDeps.now` (`deps.ts`) rather than calling `new Date()`, and every expiry test moves that clock instead of sleeping. Phase 4B report code must do the same |
| 4 | **Prisma discards SQLite trigger messages** — `SQLITE_CONSTRAINT_TRIGGER` (1811) → generic P2003 "Foreign key constraint violated". **The service layer must never branch on Prisma message text** for trigger-enforced rules. Tests assert both layers |
| 5 | `MembershipPlan.accessRules` shape is undecided, and two acceptance criteria depend on it |
| 6 | ER diagram aspect ratio 2.56 exceeds the 2.5 guideline — accepted deviation, recorded |
| 7 | `prisma migrate reset` refuses to run under an AI agent; `npm run db:reset` uses `src/db/reset.ts` instead. **This guard was not bypassed** |
| 8 | **No NFR is VERIFIED.** Database support must never be reported as NFR coverage |
| 9 | **Neither existing diagram counts toward academic coverage** |

### Test isolation — a standing rule

The suite shares **one** SQLite file. A cold-cache run once failed 135/136 because two files
leaked rows and `T-U-063` compares the database either side of a truncating re-seed. Fixed by a
per-file contract (`expectPristine` on entry, `purgeTestRows` + `expectPristine` on exit) plus a
suite-teardown guard. **A test that writes a row owns its removal:** mint ids only via `uid()`,
register new tables in `PURGE_ORDER` (`T-U-006` fails if you forget), and never write to
`LedgerEntry`/`AuditEvent` outside a rolled-back transaction — their append-only DELETE triggers
make cleanup impossible. Detail: `DATABASE_DESIGN.md` §"Test isolation".

---

## 7. Requirement coverage

**Academic — the closed 25/25/25/25 set. Nothing is delivered.**

| Layer | Covered | Total |
|---|---|---|
| User stories implemented | 0 | 25 |
| Acceptance criteria with a passing test | 0 | 25 |
| NFRs implemented (full stack) | 0 | 25 |
| NFRs **verified** | 0 | 25 |
| Mandatory diagrams | 0 | 11 |
| Use case documentation (`DIA-05`, **written artefact**) | 0 | 1 |
| Database entities | **29** | **29** |
| Database tests passing | **139** | **139** |

⚠️ **Do not report the diagram set as "12 diagrams."** It is **11 diagrams + 1 written
artefact**. `DIA-15` and `DIA-16` are enhancements and count **0**.

Database support exists (support, **not** verification) for `NFR-01`, `NFR-02`, `NFR-07`,
`NFR-09`, `NFR-10`, `NFR-12`, `NFR-13`, `NFR-14`, `NFR-17`, `NFR-19`, `NFR-22`, `NFR-23`,
`NFR-24`. No database support yet for `NFR-21` (field encryption) or any NFR whose subject is
the UI or API surface.

**Enhancements are reported separately and never summed with the above:** `ENH-01`…`ENH-20`
less withdrawn `ENH-05` = 19.

---

## 8. Next exact action

> **Produce `DIA-01` (DFD level-0) with the `software-engineering-diagrams` skill, then work
> through the remaining 10 mandatory diagrams and the `DIA-05` written artefact.**

Why this and not Phase 4: **Course Policy Lab 9 requires coding to follow the designs**, the
mandatory diagram set is **0 of 12 delivered** and is the largest outstanding academic
obligation, and nothing blocks it. `B-01`–`B-05` are resolved, so the diagrams can be drawn
against the decisions the schema already implements.

**If the user prioritises the working application instead,** the next action is **Phase 4B —
department modules** in dependency order **D01 → D04 → D02 → D05 → D03**, starting with member
registration (`US-01`/`AC-01`/`FR-REC-01`) plus its `ENH-19` membership-creation path. The
authenticated subject every service test needs now exists (Phase 4A), so nothing blocks this.
**Every new route must declare a permission** (ADR-007) — a route with no declaration is a bug.

**One decision is owed by the requirement owner:** member activation. `Member` has no activation
columns and no acceptance criterion describes a member obtaining a password, so it was **not**
invented. See `docs/security/AUTHENTICATION.md` §1.

**This is the user's call, not an assumption to make.** What must *not* happen is re-litigating
`B-01`/`B-02` — they are decided, and the database and auth layer are built on them.

---

## 9. Files to read first

| # | File | Why |
|---|---|---|
| 1 | `CLAUDE.md` | Hard rules, ID system, decision status, verified implementation state |
| 2 | `docs/project/PHASE_STATUS.md` | Live phase state and next actions |
| 3 | `docs/decisions/*` | `B-03`, `B-04`, `B-05` as implemented, plus `DEVIATIONS.md` |
| 4 | `server/prisma/schema.prisma` | **The single source of truth for the data model** |
| 5 | `server/prisma/migrations/20260816135841_init/migration.sql` | CHECKs, partial indexes and triggers Prisma cannot express |
| 6 | `docs/architecture/DATABASE_DESIGN.md` | What the database does and does **not** guarantee; the test-isolation contract |
| 7 | `docs/requirements/LAB1_TRACEABILITY_MATRIX.md` + `LAB2_NFR_TRACEABILITY.md` | Requirement coverage |
| 8 | `docs/project/MANDATORY_DIAGRAM_COVERAGE.md` | **11 diagrams + 1 written artefact** — do not miscount |
| 9 | `docs/security/AUTHENTICATION.md` + `ROLE_PERMISSION_MATRIX.md` + `docs/architecture/API_CONTRACTS.md` | **What Phase 4A actually built**, and the 8 endpoints that exist |
| 10 | `docs/architecture/API_ARCHITECTURE.md` + `SECURITY_ARCHITECTURE.md` | The design Phase 4B implements against |
| 11 | `.claude/skills/*/SKILL.md` | The six skills governing how work is done |
| 12 | `reference/` | **The authority.** Re-verify every requirement claim. READ-ONLY |

`docs/project/REQUIREMENT_GAP_ANALYSIS.md` and `REFERENCE_ANALYSIS.md` remain valuable as the
**original** analysis, but §2, §3 and §9 of the gap analysis carry status banners: several of
their risks, recommendations and assumptions have since been decided against.

---

## 10. Git and PR state

| Field | Value |
|---|---|
| Branch | `claude/ironboard-handoff-review-0o2pag` |
| PR | **[#2](https://github.com/DhrupadGupta/ironboard/pull/2)** — base is **`claude/analyze-repo-requirements-06itgc`**, not `main` |
| Stacked on | **[#1](https://github.com/DhrupadGupta/ironboard/pull/1)** — `claude/analyze-repo-requirements-06itgc` → `main` |
| Merge order | PR #1 → `main` first, then PR #2 (or PR #2 into PR #1's branch, then #1 into `main`). Retargeting #2 at `main` requires a rebase |
| Not tracked, by design | `server/.env` · `server/prisma/*.db*` · `node_modules/` |

---

## Standing rules the next session must not break

1. **`reference/` is READ-ONLY.** Extract to a scratch directory instead.
2. **Never invent a requirement.** The set is closed at 25/25/25/25. Anything else is `ENH-nn`.
3. **Never silently reconcile conflicting sources.** Cite the `CON-nn` ID, record both positions.
4. **Never mark work PASS without evidence** — command, actual output, timestamp, commit SHA;
   screenshots for UI, measured numbers for performance.
5. **Do not redesign the homepage.**
6. **Never fabricate** test results, performance numbers, user research, literature-survey
   results, requirements, diagrams, screenshots or implementation evidence. If evidence does not
   exist, write **EVIDENCE NOT AVAILABLE**.
7. **Never present an engineering threshold (🟦) as if it came from the academic source (🟩).**
8. **Do not mark a requirement VERIFIED merely because database support exists.**
9. **`B-06` must be escalated to the user, not assumed.** `B-01`–`B-05` are **resolved** —
   do not reopen them.
10. **A test that writes a row owns its removal.** See §6.
11. **Verify counts before quoting them.** This document has twice carried a wrong entity count
    and a wrong test count. Run the command.

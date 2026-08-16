# Ironboard — System Architecture

**Phase:** 2 — Architecture · **Date:** 2026-08-16 · **Status:** Design only, **no code written**
**Diagram:** `docs/diagrams/architecture/architecture.png` (`DIA-15`, ENHANCEMENT)

Every element below is marked either **[REQ]** — traceable to a source requirement — or
**[ENG]** — an engineering decision no source document mandates.

> **No reference document specifies any of the following:** framework, layering, middleware,
> module structure, session model, ORM, logger or adapter boundary. The architecture is
> therefore overwhelmingly **[ENG]**, constrained by the 25 NFRs it must satisfy.

---

## 1. Architectural style

**Modular monolith** — a single deployable Node process containing five department modules
over a shared platform kernel. **[ENG]** — ADR-001.

| Driver | Source |
|---|---|
| Five modules, one per department | **[REQ]** `D01`–`D05`, Lab 1 headings + homepage cards |
| Module boundaries map 1:1 to DFD Level-1 processes | **[REQ]** Course Policy Lab 3 → `DIA-02` |
| Single process | **[ENG]** SQLite is single-writer and embedded; distribution is incoherent |
| Deny-by-default kernel | **[REQ]** `NFR-10`, `NFR-11`, `NFR-21` |

---

## 2. Layers

Seven layers, strictly downward-calling. A layer may call the layer below it and the platform
kernel; nothing calls upward.

| # | Layer | Responsibility | Rule |
|---|---|---|---|
| 1 | Presentation | React SPA | Role gating here is **UX only, never security** |
| 2 | HTTP | Express, middleware, routing, validation | No business logic |
| 3 | Application | Controllers | HTTP only — **never touch Prisma** |
| 4 | Domain | Services | Business rules, **own transactions** — never see `req`/`res` |
| 5 | Platform | Auth, RBAC, audit, notifications, reporting, scheduler, logging | Cross-cutting |
| 6 | Persistence | Repositories → Prisma | **The only Prisma consumers** |
| 7 | External | Email, SMS, PDF adapters | Behind interfaces |

**Why this split [ENG]:** services that never see `req`/`res` are unit-testable without HTTP,
which is what makes 25 acceptance-criteria suites affordable (ADR-002, ADR-010).

---

## 3. Frontend structure

```
client/src/
├── app/
│   ├── router.tsx            role-gated route tree            [ENG]
│   ├── providers.tsx         QueryClient, auth context        [ENG]
│   └── error-boundary.tsx                                     [ENG]
├── design-system/
│   ├── tokens.css            :root copied verbatim from the source  [REQ] UI-02
│   ├── Button.tsx            solid | ghost, no radius         [REQ] UI-01
│   ├── Card.tsx  Board.tsx   locker board P-01                [REQ] UI-04
│   ├── Tag.tsx   Chip.tsx    mono label voice P-04, volt chip P-05  [REQ]
│   ├── StatRail.tsx          P-09                             [REQ]
│   └── FlowStrip.tsx         P-10                             [REQ] UI-05
├── modules/
│   ├── reception/            D01 · FR-REC-01..05              [REQ]
│   ├── trainer/              D02 · FR-TRN-01..05              [REQ]
│   ├── administration/       D03 · FR-ADM-01..05              [REQ]
│   ├── membership/           D04 · FR-MEM-01..05              [REQ]
│   ├── accounting/           D05 · FR-ACC-01..05              [REQ]
│   └── member-portal/        ENH-01 — NOT academic coverage   [ENG]
├── shared/                   auth hooks, layout, formatting   [ENG]
└── types/                    types inferred from shared Zod schemas [ENG]
```

Each `modules/<dept>/` contains `pages/`, `components/`, `api/`, `hooks/`.

**Rules**
- Module folders mirror `D01`–`D05` exactly, so UI, API and DFD processes share one decomposition. **[ENG]**
- **No component may introduce a colour, radius or shadow outside the token set.** **[REQ]** `UI-02`, enforced by `ironboard-ui-visual-qa`.
- Server state via TanStack Query; **no global client store** — this app is almost entirely server state. **[ENG]** serves `NFR-20`, `NFR-25`.
- Mobile navigation must be **added** (`ENH-11`) — the source design hides nav below 860px with no replacement (`INC-11`). Desktop design unchanged.

---

## 4. Backend structure

```
server/src/
├── http/
│   ├── app.ts                middleware chain assembly        [ENG]
│   ├── middleware/           requestId, logging, helmet, cors,
│   │                         rateLimit, session, csrf, validate, authorize
│   └── errors/               AppError hierarchy → RFC 9457    [ENG]
├── modules/<dept>/
│   ├── routes.ts             path + permission declaration    [REQ] NFR-10/11/21
│   ├── controller.ts         HTTP only                        [ENG] ADR-002
│   ├── service.ts            business rules, transactions     [REQ] the 25 FRs
│   ├── repository.ts         Prisma access                    [ENG]
│   └── schema.ts             Zod, shared with client          [REQ] NFR-02
├── platform/
│   ├── auth/                 sessions, argon2id, guards       [ENG] ADR-006
│   ├── rbac/                 permission matrix, middleware    [REQ] NFR-10/11/21
│   ├── audit/                append-only event writer         [REQ] NFR-24
│   ├── notifications/        outbox writer + worker + adapters [REQ] NFR-01/19
│   ├── reporting/            aggregation queries              [REQ] NFR-14/23
│   ├── scheduler/            ACT-09 jobs                      [REQ] AC-19, AC-13
│   ├── logging/              pino + redaction                 [ENG]
│   └── config/               env parsing, fail-fast           [ENG]
├── db/
│   ├── schema.prisma         the data model                   [ENG] ADR-005, INC-04
│   ├── migrations/           versioned                        [ENG]
│   └── seed.ts               demo dataset                     [ENG] ENH-16
└── index.ts
```

---

## 5. Modules

| Module | Stories | Depends on | Build order |
|---|---|---|---|
| `reception` (D01) | `US-01`…`US-05` | — (Member ID is the universal key) | **1st** |
| `membership` (D04) | `US-16`…`US-20` | reception | **2nd** |
| `trainer` (D02) | `US-06`…`US-10` | reception | **3rd** |
| `accounting` (D05) | `US-21`…`US-25` | reception, membership | **4th** |
| `administration` (D03) | `US-11`…`US-15` | **all four** (`AC-15`) | **5th** |

Build order is by **dependency, not department number**. **[REQ]** — derived from the
acceptance criteria.

### Cross-module calls

Four calls cross a module boundary. They go through **service interfaces**, never direct
repository access, or the boundary erodes (ADR-001).

| Call | Evidence |
|---|---|
| `FR-REC-04` → `FR-ACC-01` | `AC-04` "Given a payment is successful" |
| `FR-MEM-03` → `FR-ACC-01` | `AC-18` "When a renewal payment is completed" |
| `FR-ADM-05` → all four | `AC-15` "summary updates from all departments" |
| `FR-ACC-05` → `FR-MEM-01` | `AC-25` dues arise from plan pricing |

---

## 6. Controllers

**Responsibility:** translate HTTP to a service call and back. Nothing else. **[ENG]** ADR-002.

```ts
// Shape only — not an implementation.
export const registerMember = async (req: Request, res: Response) => {
  const input = req.validated.body;              // already Zod-parsed by middleware
  const result = await receptionService.registerMember(input, req.actor);
  res.status(201).json(result);
};
```

**Forbidden in a controller:** Prisma calls · business branching · transaction management ·
permission decisions beyond the declared route guard.

One controller per module, one exported handler per `FR`.

---

## 7. Services

**Responsibility:** business rules, invariants, transaction boundaries, audit and notification
emission. **[REQ]** — services *are* the 25 functional requirements.

```ts
// Shape only.
async registerMember(input: RegisterMemberInput, actor: Actor) {
  return this.db.$transaction(async (tx) => {
    const member = await this.members.create(tx, { ...input, memberCode: generate() });
    await this.audit.record(tx, { actorId: actor.id, action: 'member.register', ... });
    await this.outbox.enqueue(tx, { channel: 'email', template: 'welcome', ... });
    return member;
  });
}
```

Three things happen in **one transaction**: the business change, the audit event, the outbox
row. That is what makes `NFR-24` ("maintain accurate financial records") verifiable and keeps
`NFR-01`'s 3-second budget free of email latency (ADR-008).

**Method naming:** one public method per `FR`, named for the FR label —
`registerMember`, `verifyMemberDetails`, `scheduleTrialSession`, …

---

## 8. Repositories

**Responsibility:** the only code that imports Prisma. Accept an optional transaction client so
services control atomicity. **[ENG]**

```ts
// Shape only.
create(tx: Tx, data: MemberCreate): Promise<Member>
findByCode(tx: Tx, code: string): Promise<Member | null>
```

No business logic, no validation, no authorisation. Report aggregations that need raw SQL for
the `NFR-14`/`NFR-23` budgets live here, not in services.

---

## 9. Middleware

Order matters. **[ENG]** — no source specifies any of this.

| # | Middleware | Purpose | Driver |
|---|---|---|---|
| 1 | `requestId` | correlation id | **[ENG]** |
| 2 | `pino-http` | structured request log | **[ENG]** |
| 3 | `helmet` | security headers | **[ENG]** |
| 4 | `cors` | strict allow-list | **[ENG]** |
| 5 | `express.json({ limit })` | body parsing + size cap | **[ENG]** |
| 6 | `cookieParser` | session cookie | **[ENG]** ADR-006 |
| 7 | `rateLimit` | auth endpoints only | **[ENG]** |
| 8 | `session` | load + validate session, attach `req.actor` | **[REQ]** `AC-11`, `AC-17` |
| 9 | `csrf` | verify token on mutations | **[ENG]** |
| 10 | `authorize(permission)` | **per-route, deny-by-default** | **[REQ]** `NFR-10/11/21` |
| 11 | `validate(schema)` | Zod parse params/query/body | **[REQ]** `NFR-02` |
| 12 | *route handler* | | |
| 13 | `notFound` | 404 → Problem Details | **[ENG]** |
| 14 | `errorHandler` | terminal, RFC 9457 | **[ENG]** |

`authorize` runs **before** `validate` deliberately: an unauthorised caller should not learn
whether their payload was well-formed.

---

## 10. Validation

**[REQ]** `NFR-02` — "The system should validate all member information before saving."

⚠️ **No field rules exist in any source document** (`INC-05`). Every rule is an assumption and
must be logged as an `ASM-nn`.

Two complementary layers (ADR-004, ADR-005):

| Layer | Catches |
|---|---|
| **Zod** at the HTTP boundary, schemas shared with the client | value-level — formats, ranges, required-ness |
| **Prisma generated types** at compile time | structural — wrong field, wrong type |

One schema per resource, imported by both the React form and the Express route, so client and
server cannot disagree about validity.

---

## 11. Error handling

**[ENG]** — no source specifies error behaviour. `INC-09`: no source states what happens when
payment fails, email bounces, or a slot double-books.

```
AppError (abstract)
├── ValidationError    422   from Zod
├── AuthnError         401   no/expired session
├── AuthzError         403   permission denied
├── NotFoundError      404
├── ConflictError      409   duplicate email, double-booked slot
├── DomainRuleError    422   invalid state transition (NFR-17)
└── InternalError      500
```

Every response uses RFC 9457 Problem Details:

```json
{ "type": "https://ironboard/errors/conflict", "title": "Slot already booked",
  "status": 409, "detail": "...", "instance": "/api/v1/sessions", "requestId": "..." }
```

**Rules:** stack traces never leave the server · 500 responses carry a `requestId` and nothing
more · `AuthzError` never reveals whether the resource exists.

---

## 12. Logging

**[ENG]** — pino, structured JSON, one line per request plus domain events.

| Field | Purpose |
|---|---|
| `requestId` | correlates HTTP, service and audit records |
| `actorId`, `actorRole` | who |
| `module`, `operation` | which `FR` |
| `durationMs` | feeds the five timing NFRs |

**Redaction is mandatory:** `password`, `passwordHash`, `token`, `tokenHash`, `condition`
(medical, `NFR-10`), payment fields (`NFR-21`). A leak into logs defeats the encryption those
NFRs require.

**Logs are not the audit trail.** Logs are operational and may be rotated; the audit log is
durable and append-only (§13).

---

## 13. Audit logging

**[REQ]-adjacent / `ENH-13`.** No story defines an audit log, but three requirements point
straight at one: `AC-24` "log the transaction", `AC-23` "system transaction logs",
`NFR-24` "maintain accurate financial records". ADR-011.

Two append-only tables:

| Table | Contents | Driver |
|---|---|---|
| `LedgerEntry` | financial movements — payments, refunds, charges | `AC-23`, `NFR-24` |
| `AuditEvent` | actor, action, entity, before/after, timestamp, IP | `NFR-24`, `ENH-13` |

**Audited events:** authentication · staff approval (`AC-11`) · payment, refund, invoice ·
membership state transitions (`AC-17`, `AC-18`) · **medical data access** (`NFR-10`) ·
branch disable (`AC-12`).

**Never updated, never deleted.** Corrections are compensating entries. Written **inside the
same transaction** as the business change — an audit row that can be lost independently is
worthless.

> The Experiment 2 handout's `payment_preferences` log is a **sample about a different
> system**, not an Ironboard requirement. This design is driven by `NFR-24`, not by that table.

---

## 14. Reporting

**[REQ]** `AC-05`, `AC-14`, `AC-23`, `AC-25`; budgets from `NFR-14` and `NFR-23` (both 5 s).

| Report | Source | Strategy |
|---|---|---|
| Daily attendance (`AC-14`) | `AttendanceDaily` pre-aggregate | Nightly + on-write rollup; peak-hour bucketing |
| Member attendance (`AC-05`) | `AttendanceEvent` | Indexed by `memberId`, `checkedInAt` |
| Revenue (`AC-23`) | `LedgerEntry` | Indexed date-range scan; income, refunds, pending in one pass |
| Overdue (`AC-25`) | `Invoice` | Indexed by `status`, `dueAt` |
| Department summary (`AC-15`) | all modules | Per-module queries, **independently degradable** |

**`AC-15` is the hard one:** it aggregates all five modules while `NFR-15` demands 99.9 %
availability. A single failing module must not take the dashboard down — each panel resolves
independently and renders a failure state on its own.

⚠️ `AC-23`'s date range has **no stated bounds** (`INC-08`) and no volume figures exist
(`INC-07`). A maximum range is an assumption; without it the 5 s budget is meaningless.

---

## 15. Integrations

**[ENG]** — `AMB-12`: no source names a provider for anything.

| Integration | Design | Status |
|---|---|---|
| Email | `EmailTransport` interface; dev sink writes to disk | Interface real, provider not configured |
| SMS | `SmsTransport` interface; **stub logs and discards** | **Never claim a message was sent** |
| PDF | In-process generator for receipts (`AC-04`) and invoices (`AC-22`) | Real |
| Payment gateway | **Not integrated.** `AC-21`'s "online" is a recorded `method` value only | Out of scope |

All are behind interfaces so a real provider can be substituted without touching a service.

---

## 16. Notification services

**[REQ]** `AC-01`, `AC-06`, `AC-09`, `AC-19`, `AC-22`, `AC-25`; **[ENG]** the outbox pattern
(ADR-008).

```
service ──(same transaction)──► NotificationOutbox row
                                        │
                            worker polls pending
                                        │
                        ┌───────────────┴───────────────┐
                   EmailTransport                  SmsTransport (stub)
                        │                                │
                  mark sent / retry              log only, never sent
```

**Why asynchronous:** `NFR-01` gives registration **3 seconds** and `AC-01` requires a welcome
email. Sending inline puts a third party's latency inside a measured budget.

| Notification | Trigger | Channel |
|---|---|---|
| Welcome | `AC-01` | email |
| Plan assigned / routine changed | `AC-06`, `AC-09` | **channel unspecified in source** (`AMB-12`) |
| Trial confirmation | `AC-03` | email |
| Renewal reminder | `AC-19`, 7-day threshold, `ACT-09` | email **or SMS** |
| Invoice | `AC-22` | email, PDF attached |
| Payment notice | `AC-25` | email |

⚠️ **`NFR-19` says reminders are "delivered successfully"** — delivery depends on providers
outside system control. The system guarantees **dispatch with retry**. Reports must say
exactly that and never claim delivery.

---

## 17. Scheduler

**[REQ]** `ACT-09` — `AC-19` "the automated system checks expiring plans" is the only Lab 1
behaviour with a non-human actor.

| Job | Cadence | Requirement |
|---|---|---|
| Expiring-membership sweep | daily | `AC-19` — 7-day threshold |
| Membership state transition | daily | `AC-17`, `AC-18`, ADR-013 |
| Equipment maintenance reminder | daily | `AC-13` |
| Attendance rollup | hourly | `NFR-14` |
| Outbox dispatch | continuous | ADR-008 |

In-process (`node-cron`); no external scheduler. Jobs are idempotent and safe to re-run.

---

## 18. Deployment view

One Node process serves the built React bundle as static assets and the API under `/api/v1`.
SQLite file on a mounted volume in WAL mode. `prisma migrate deploy` on boot.
`/healthz` and `/readyz` back the `NFR-03` and `NFR-15` availability targets. **[ENG]**

---

## 19. Open decisions this architecture assumes

| ID | Assumed | Impact if wrong |
|---|---|---|
| `B-03` | `Member`, `Staff`, `Equipment`, attendance carry `branchId`; plans global (ADR-014) | **Touches nearly every table** |
| `B-04` | `ENH-02`…`ENH-06` supply the five missing write paths | Six mandatory stories stay non-functional |
| `B-05` | Four membership states (ADR-013) | State chart and `NFR-17` both wrong |
| ADR-012 | Thresholds for the 15 unquantified NFRs | Invented numbers reported as requirements |

---

## 20. Related

`docs/architecture/DATABASE_DESIGN.md` · `API_ARCHITECTURE.md` · `SECURITY_ARCHITECTURE.md` ·
`ARCHITECTURAL_DECISIONS.md` · `TECHNOLOGY_DECISIONS.md` ·
`docs/project/MASTER_PLAN.md` · `docs/diagrams/architecture/` · `docs/diagrams/er/`

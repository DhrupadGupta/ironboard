# Ironboard — Technology Decisions

**Phase:** 1 — Master Plan
**Date:** 2026-08-16
**Status:** Decided. **Nothing implemented.**

Records what was chosen, what was rejected, and why. Where a choice was **set by instruction**
rather than selected here, that is stated plainly — the justification then explains how the
project works within it, not why it was picked.

---

## 1. Summary

| Layer | Choice | Origin |
|---|---|---|
| Frontend framework | React 19 + TypeScript | **Set by instruction** |
| Build tool | Vite 6 | **Set by instruction** |
| Backend runtime | Node.js 22 (pre-installed) | **Set by instruction** |
| Backend framework | Express 5 + TypeScript | **Set by instruction** |
| Database | SQLite (WAL) | **Set by instruction** |
| **ORM** | **Prisma 6** | **Chosen here — §3** |
| SQLite driver | `better-sqlite3` | Chosen here |
| Validation | Zod | Chosen here |
| Password hashing | Argon2id (`@node-rs/argon2`) | Chosen here |
| Routing (client) | React Router 7 | Chosen here |
| Server state | TanStack Query 5 | Chosen here |
| Styling | Plain CSS + custom properties | Chosen here |
| Unit / integration tests | Vitest | Chosen here |
| API tests | Supertest | Chosen here |
| Component tests | Testing Library | Chosen here |
| E2E / visual QA | Playwright (Chromium pre-installed) | Chosen here |
| Accessibility tests | axe-core | Chosen here |
| Diagrams | PlantUML + Graphviz | Chosen here |

---

## 2. Constraints that shaped every choice

1. **SQLite is single-writer and embedded.** This rules out horizontal scaling, connection
   pooling strategies and distributed architectures. `NFR-12` ("support multiple gym branches
   efficiently") is therefore a **data-scoping** requirement, not a clustering one.
2. **NFR budgets are loose** — 2 s, 3 s, 5 s (`NFR-01`, `06`, `14`, `18`, `23`). This is
   generous for any modern stack, so raw throughput is *not* a differentiator between
   candidates. Correctness, type safety and traceability matter more.
3. **The project is graded on traceability.** Design artefacts must map to code mechanically.
   This is a real selection criterion here, and it is what decided the ORM.
4. **No data model exists in any source document** (`INC-04`). Whatever is chosen must make an
   invented schema explicit and reviewable, not buried.
5. **Offline-friendly environment.** Java, Node 22 and Python 3.11 are pre-installed;
   **Graphviz is not** and must be installed.

---

## 3. ORM selection — Prisma ✅

The one substantive technology choice delegated to this plan.

### Candidates

| Candidate | Type safety | Migrations | SQLite | Schema artefact | Verdict |
|---|---|---|---|---|---|
| **Prisma 6** | Generated types, excellent | `prisma migrate`, versioned | First-class | **Single declarative `schema.prisma`** | ✅ **Chosen** |
| Drizzle ORM | Excellent inference | `drizzle-kit`, versioned | First-class | TS files | Runner-up |
| TypeORM | Weak — decorator/runtime | Mature but clunky | Good | Decorated classes | Rejected |
| Sequelize | Poor TS support | Umzug, manual | Good | Model definitions | Rejected |
| Kysely | Excellent | None (query builder only) | Good | None | Rejected |
| Raw `better-sqlite3` | None | Hand-rolled | Native | None | Rejected |

### Why Prisma

**1. The schema file is the data model deliverable.**
Course Policy Lab 6 requires a class diagram; `EXP-5-CLASS.docx` requires classes, attributes
and relationships. `schema.prisma` is a single declarative file expressing exactly that —
entities, fields, types, relations, cardinality. It maps 1:1 to `DIA-09` (class) and `DIA-16`
(ER). Since **no source document supplies a data model** (`INC-04`), having the invented model
in one reviewable file — rather than scattered across decorated classes or migration SQL — is
worth real weight on a project graded on traceability.

**2. Generated types enforce `NFR-02` at compile time.**
`NFR-02` requires validating "all member information before saving", and no field rules exist
anywhere (`INC-05`). Prisma's generated types make structural violations a build error, with
Zod handling value-level rules at the boundary. Two complementary layers.

**3. Versioned, reviewable migrations.**
`prisma migrate` produces timestamped SQL committed to the repository. This supports
reproducible academic demonstration and gives `NFR-13`/`NFR-07` (durability) a tested path.

**4. Relation ergonomics suit this domain.**
The model is relation-heavy — member → membership → plan → payment → invoice → refund →
ledger. Prisma's nested reads and `$transaction` express `AC-21` (clear balance **and** issue
receipt) and `AC-24` (refund **and** log) as single atomic operations, which is precisely what
`NFR-24` demands.

### What Prisma costs, honestly

| Cost | Assessment |
|---|---|
| Codegen step (`prisma generate`) | Real friction; mitigated by a `postinstall` hook |
| Heavier runtime than Drizzle | Irrelevant at 2–5 s budgets |
| Less control over emitted SQL | Acceptable; raw queries available where reports need them |
| Extra dependency weight | Backend-only; does not touch the client bundle |

**Drizzle would have been the better pick** on bundle size and SQL transparency, and if this
were a latency-critical service it would win. It loses here only on the schema-as-deliverable
argument — its schema is TypeScript code, less directly readable as an academic data-model
artefact. That is a project-specific tiebreak, not a general claim that Prisma is superior.

**Rejected outright:** TypeORM (runtime-heavy decorators, weaker type safety), Sequelize (poor
TypeScript), Kysely (no migrations — a query builder, not an ORM), raw driver (no migrations,
no generated types; `INC-05` makes hand-rolled validation a liability).

---

## 4. Frontend

### React 19 + TypeScript + Vite — set by instruction
Vite is a natural fit: fast HMR, native TS, and its config is shared by Vitest, so unit and
component tests need no second toolchain.

### React Router 7 ✅
Standard, unopinionated about data fetching, and supports the role-gated route layout in
§12 of the master plan. *Rejected:* TanStack Router (excellent typing, unnecessary novelty
here); Next.js (contradicts the instructed Vite SPA).

### TanStack Query 5 ✅
This application is **almost entirely server state** — members, memberships, payments,
sessions. TanStack Query handles caching, invalidation and refetching, which directly serves
`NFR-20` and `NFR-25` ("available whenever requested").

*Rejected:* Redux Toolkit — there is very little genuine client state; a global store would be
ceremony. *Rejected:* raw `useEffect` fetching — no caching, and it would make the 2 s
`NFR-06` budget harder than necessary.

### Zod ✅ — shared client and server
One schema validates the form and the API boundary. Directly serves `NFR-02` and removes the
class of bug where client and server disagree about validity.

### Styling: plain CSS + custom properties ✅
**Deliberate and important.** The visual source of truth is a hand-written CSS file built on
`:root` custom properties. Copying those tokens verbatim into a plain CSS layer preserves them
exactly.

*Rejected: Tailwind* — its default palette, spacing scale and `rounded-*`/`shadow-*` utilities
actively pull toward the generic SaaS look the `ironboard-ui-visual-qa` skill exists to
prevent. The design uses `border-radius: 0`, no shadows, and a non-8pt spacing scale; fighting
Tailwind's defaults would cost more than it saves.
*Rejected:* CSS-in-JS (runtime cost, no benefit here); *Rejected:* Material UI / shadcn /
Bootstrap — each imposes a design language that would **overwrite the source of truth**.

---

## 5. Backend

### Express 5 + TypeScript — set by instruction
Express 5 (stable since 2024) handles async errors natively, which removes the
`express-async-handler` boilerplate Express 4 required.

### `better-sqlite3` ✅
Synchronous, fastest SQLite binding for Node, and its synchronous transactions are the
simplest correct way to express the atomic operations `NFR-24` needs. Node's threading model
makes synchronous local-file I/O acceptable at this scale.

### Argon2id via `@node-rs/argon2` ✅
Memory-hard, the current recommended default. Rust-backed binding, faster than the pure-JS
alternative. *Rejected:* bcrypt (no memory hardness); plain scrypt (workable, less ergonomic).

### Sessions over JWT ✅
See ADR-006. Short version: `AC-11` activates accounts and `AC-17` must "stop gym access" —
both require **immediate revocation**, which stateless JWTs cannot provide without a denylist
that is a session table by another name.

### Pino ✅ for logging
Structured JSON, low overhead. Feeds the audit trail (`ENH-13`) and the availability
monitoring behind `NFR-03`/`NFR-15`.

---

## 6. Testing

| Tool | Role | Why |
|---|---|---|
| **Vitest** | Unit, integration, acceptance | Shares Vite config — one toolchain, no duplicate setup |
| **Supertest** | API contract and authz | Drives Express directly, no network |
| **Testing Library** | Component | Tests behaviour, not implementation |
| **Playwright** | E2E, system, visual QA | **Chromium pre-installed** at `/opt/pw-browsers/chromium`; never run `playwright install` |
| **axe-core** | Accessibility (`ENH-10`) | Standard engine, integrates with Playwright |
| **Autocannon** | Performance (the 5 timing NFRs) | Reports p95, which is what must be asserted |

*Rejected:* Jest (slower here, needs separate config from Vite); Cypress (Playwright is already
provisioned and handles multi-viewport visual QA better).

---

## 7. Diagrams

**PlantUML** (JAR, verified rendering in this environment) + **Graphviz** for class, state and
activity layouts. Mermaid for Markdown-embedded charts only.

⚠️ **Graphviz is not pre-installed** — `apt-get install -y graphviz`.
⚠️ Course Policy Lab 5 names **Star UML**, a GUI tool unavailable here. PlantUML is used and
the substitution is recorded. **Never claim Star UML was used.**

---

## 8. What is deliberately absent

| Not used | Why |
|---|---|
| Docker | Single Node process; adds no value at this scale |
| Redis | SQLite holds sessions; no cache pressure at these budgets |
| Message queue | The outbox table plus a worker is sufficient |
| GraphQL | REST matches the resource-shaped domain; simpler to trace to `FR` IDs |
| Monorepo tooling (Nx/Turbo) | Two packages; npm workspaces suffice |
| Payment gateway SDK | Not integrated — `AC-21` records "online" as a method only |
| CSS framework | Would overwrite the visual source of truth |
| State management library | Server state dominates |

---

## 9. Versions

Pinned at planning time; confirm at scaffold.

| Package | Version |
|---|---|
| node | 22.x (pre-installed 22.22.2) |
| react / react-dom | 19.x |
| vite | 6.x |
| typescript | 5.7+ |
| express | 5.x |
| prisma / @prisma/client | 6.x |
| better-sqlite3 | 11.x |
| zod | 3.x |
| @tanstack/react-query | 5.x |
| react-router | 7.x |
| vitest | 3.x |
| @playwright/test | 1.5x |
| pino | 9.x |

---

## 10. Related

`docs/architecture/ARCHITECTURAL_DECISIONS.md` — numbered ADRs, including ADR-005 (ORM) and
ADR-006 (sessions) in full · `docs/project/MASTER_PLAN.md` §7–13 · `docs/ui/DESIGN_SYSTEM.md`.

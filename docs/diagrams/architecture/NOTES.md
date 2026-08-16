# Architecture diagrams — notes

## Contents

| File | ID | Status |
|---|---|---|
| `architecture.puml` / `.png` | `DIA-15` | **ENHANCEMENT** — not academic coverage |

## Status and provenance

`DIA-15` is **not** an academic requirement. `reference/syllabus/…` Unit 5 teaches
Architectural Design (Software Architecture, Data Design, Architectural Styles, Mapping Data
Flow into a Software Architecture), but **no Course Policy lab assigns an architecture
diagram**. It exists because Phase 2 asked for it explicitly.

Do not count it toward the 12 mandatory diagrams (`DIA-01`…`DIA-12`).

## Traceability

| Element | Traces to |
|---|---|
| Six actors | `ACT-01`…`ACT-06` (`ACT-06` = `ENH-01`, owns no Lab 1 story) |
| Five domain modules | `D01`–`D05`, `FR-REC/TRN/ADM/MEM/ACC-01..05` |
| Module boundaries | Map 1:1 to DFD Level-1 processes (`DIA-02`) — ADR-001 |
| Cross-module edges | `AC-04`, `AC-15`, `AC-18`, `AC-25` |
| Zod validation | `NFR-02` |
| RBAC | `NFR-10`, `NFR-11`, `NFR-21` |
| Notifications outbox | `NFR-01`, `NFR-19` — ADR-008 |
| Reporting | `NFR-14`, `NFR-23` |
| Audit | `NFR-24` — `ENH-13` |
| TanStack Query cache | `NFR-20`, `NFR-25` |
| SQLite single writer | `NFR-12` — ADR-014 |

## Elements not in the source documents

Everything in layers 2, 5, 6 and 7 is an **engineering decision**, not a sourced requirement.
No reference document specifies a framework, a layering scheme, middleware, a session model,
an ORM, a logger or an adapter boundary.

| Element | Basis |
|---|---|
| Middleware chain | Engineering decision |
| Platform kernel (7 components) | Engineering decision; each traced to an NFR it serves |
| Prisma / repositories | ADR-005 |
| Sessions | ADR-006 — no source defines authentication at all (`AMB-03`) |
| Email / SMS / PDF adapters | `AMB-12` — no provider named anywhere |

## Layout decisions

- **`skinparam linetype ortho` is deliberately not used.** Combined with the `[hidden]`
  ordering edges it makes Graphviz 2.43 throw `UnparsableGraphvizException`. Bisected: either
  removing `ortho` or removing the hidden edges fixes it. The hidden edges carry meaning
  (module dependency order `D01 → D04 → D02 → D05 → D03`), so `ortho` was dropped instead.
- Domain modules are ordered by **dependency**, not department number. `D03` is last because
  `AC-15` requires it to aggregate all four others.
- Edges are drawn **package-to-package**, not component-to-component. An earlier version drew
  every service→platform edge and produced an unreadable tangle.

## Verification

| Check | Result |
|---|---|
| Renders without exception | ✅ 0 exceptions |
| PNG read and inspected | ✅ 2982 × 1556, ratio 1.92 (within 2.5) |
| Note contrast | ✅ fixed — first render had pale-on-pale, unreadable |
| Terminology matches the matrix | ✅ five primary actor names verbatim |
| Every claimed ID appears | ✅ |

## Open decisions reflected in this diagram

`B-03` branch scoping (ADR-014 assumed) · `B-04` five missing write paths (`ENH-02`…`ENH-06`) ·
`B-05` membership states (ADR-013 assumed). All three are **unconfirmed** and are annotated on
the diagram rather than silently resolved.

## Numbering conflict

`CON-01`: the course policy lab table and the handout filenames number experiments
incompatibly. This artefact is labelled **`architecture`**, never "Experiment N".

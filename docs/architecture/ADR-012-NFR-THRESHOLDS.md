# ADR-012 — Verification thresholds for the 15 unquantified NFRs

**Status:** ✅ **ACCEPTED** (supersedes the provisional ADR-012 in `ARCHITECTURAL_DECISIONS.md`)
**Date:** 2026-08-16
**Detail:** `docs/requirements/NFR_VERIFICATION_THRESHOLDS.md`

---

## Context

`reference/lab2/` Part B contains 25 NFRs. **Ten carry a measurable figure; fifteen do not.**

The Experiment 2 handout names this failure in its own words:

> "If you cannot quantify the story in concrete terms, this should be a bad smell that usually
> indicates a requirement that is too vague to be implemented. Vague NRF's have the same
> problems that vague functional requirements do: It is hard to answer the question 'How will I
> know when this story is correctly done?'"

Two of the fifteen are worse than vague — they are **absolutes**: `NFR-13` "should **never** be
lost" and `NFR-22` "accurately **every time**". Neither is falsifiable, so neither can be
honestly passed.

Without thresholds, 15 of 25 NFRs are unverifiable and the project cannot report NFR coverage.

---

## Decision

**Adopt an engineering verification threshold for each of the 15**, under four binding rules.

### Rule 1 — Strict labelling

| Label | Meaning |
|---|---|
| 🟩 **SOURCE REQUIREMENT** | Stated verbatim in `reference/lab2/` |
| 🟦 **ENGINEERING VERIFICATION THRESHOLD** | Chosen by this project. **Not in any source** |

A 🟦 result is reported as **`PASS (ENGINEERING THRESHOLD)`** — never plain `PASS`.
**No 🟦 figure may ever be cited as an academic requirement.**

### Rule 2 — Student scale, not production scale

Thresholds target a **single-machine, single-process, college project** with a seeded dataset
of 3 branches / 1 000 members and **≤ 10 concurrent requests**.

An earlier draft proposed *10 branches × 1 000 members* for `NFR-12` and framed availability as
uptime percentages. Both were **production-shaped claims this project cannot substantiate** and
have been scaled down. Availability NFRs are now verified as **bounded soak runs** (30 minutes,
0 unhandled 5xx), not as SLA percentages.

### Rule 3 — Absolutes get proxies, and the proxy is disclosed

`NFR-13` and `NFR-22` cannot be proven. Each gets a measurable proxy — no destructive path plus
a tested restore; idempotence plus golden-file accuracy — and is reported as
**`PASS (PROXY — absolute claim unfalsifiable)`**.

### Rule 4 — Out-of-scope dependencies are stated, not absorbed

`NFR-19` ("reminders **delivered** successfully") depends on third-party providers outside
system control. The threshold measures **dispatch with retry**, and every report must say
**dispatched**, never **delivered**.

The same honesty applies to the two 🟩 99.9 % figures (`NFR-03`, `NFR-15`): they remain source
requirements, but demonstrating 99.9 % needs a month of production telemetry. They are verified
by proxy and reported as **`PASS (PROXY — 99.9 % not demonstrable at project scale)`**.

---

## Alternatives considered

| Alternative | Rejected because |
|---|---|
| Leave all 15 unverified | 15 of 25 NFRs would be permanently `NOT RUN`; `MASTER_PLAN` commits every NFR to be verified |
| Adopt production-grade SLAs (99.9 %, 10k users) | Would be **fabricating capability**. Nothing at this scale could substantiate it |
| Quietly treat the invented numbers as requirements | **Directly violates** the project's core rule against presenting assumptions as sourced requirements |
| Ask the course to clarify | Not available; and the vagueness is itself a finding worth recording (`AMB-06`) |

---

## Consequences

**Positive**
- All 25 NFRs become verifiable, so NFR coverage can be reported truthfully.
- The 🟩/🟦 split makes it impossible to confuse an invented figure with a requirement.
- Student-scale thresholds are actually achievable on the target hardware.
- The two unfalsifiable NFRs are handled openly rather than quietly passed.

**Negative / accepted costs**
- 15 NFRs can only ever reach `PASS (ENGINEERING THRESHOLD)` — never an unqualified pass. This
  is correct, not a defect.
- `NFR-16` cannot be fully verified within academic scope: it names "modify", which **no user
  story provides** (`N-4`, covered by `ENH-14`).
- `NFR-08` retains conflict `N-1` with `NFR-03` — two different availability rules for the same
  subsystem. Cited, not reconciled.
- A seed dataset (`ENH-16`) becomes a **prerequisite** for performance verification.

---

## Impact on Phase 3

| Area | Impact |
|---|---|
| Schema | None — thresholds are a verification concern |
| Seed data | **Required** — `ENH-16` is now a hard prerequisite for `NFR-01/06/12/14/23` |
| Indexes | `AttendanceDaily` and `LedgerEntry(occurredAt, kind)` justified by the 5 s budgets |
| Config | `synchronous = FULL` required by the `NFR-07` threshold |
| Test harness | Needs p95 timing, a soak runner, failure injection and a restore drill |

**This ADR does not block Phase 3.**

---

## Related

`docs/requirements/NFR_VERIFICATION_THRESHOLDS.md` — the 25 thresholds in full ·
`docs/requirements/LAB2_NFR_TRACEABILITY.md` ·
`docs/architecture/ARCHITECTURAL_DECISIONS.md` (ADR-012 stub, now superseded) ·
`.claude/skills/testing-and-quality/SKILL.md`

# Ironboard — Deliberate Deviations Review

**Date:** 2026-08-16 · **Authority:** original `reference/lab1/` and `reference/lab2/`

Reviews two Phase 2 design decisions that depart from a literal reading of the source.
**The original requirement wording is preserved verbatim throughout and is never rewritten.**

---

## Deviation 1 — `AC-11` "send login details"

### 1.1 Original source wording (verbatim, unaltered)

> **`reference/lab1/I025_Dhrupad Gupta_SE_LAB_1 (1).pdf`, p.7, "Story 1: Approve New Staff Accounts":**
>
> "Given a new staff member registers for access, When the admin reviews and clicks
> \"Approve\", Then activate the account and **send login details**."

Related: `US-11` — "As an administrator, I want to approve new staff accounts so that only
authorized employees can access the system."
Bound NFR: `NFR-11` — "Only administrators should be able to approve staff accounts."

### 1.2 Phase 2 design

A single-use activation link, instead of emailing credentials.

### 1.3 Assessment

| Question | Finding |
|---|---|
| Does it satisfy the requirement? | **Partially.** It satisfies the *intent* — the staff member can now log in — but "details" is not literally sent |
| Is it a deviation? | ✅ **Yes**, from a literal reading |
| Is it an improvement? | ✅ **Yes.** Emailing a password transmits a reusable secret over an unencrypted-at-rest channel and encourages password reuse |
| Does documentation need updating? | ✅ **Yes** — the traceability matrix must carry the original wording plus this interpretation |

### 1.4 Revised design — deviation substantially closed

The original design over-corrected. `AC-11` says "send login **details**", and login details
legitimately include *where* and *who* — not only a secret. The revised approval email contains:

| Content | Satisfies |
|---|---|
| The sign-in URL | "login details" |
| The account's login identifier (their email) | "login details" |
| Their assigned role and branch | "login details" |
| A **single-use, time-limited link to set a password** | "activate the account"; replaces transmitting a secret |

This sends genuine login details while never transmitting a password. **The residual deviation
is narrow**: a password is not included.

### 1.5 Classification

> **ENGINEERING SECURITY IMPROVEMENT / IMPLEMENTATION INTERPRETATION**

- The requirement wording is **preserved unchanged** in
  `docs/requirements/LAB1_TRACEABILITY_MATRIX.md`.
- The interpretation is recorded alongside it, never in place of it.
- No NFR constrains the delivery mechanism — Lab 2 has three security NFRs and none covers
  credential transport, so this is a free engineering choice, not a requirement conflict.
- **Reversible.** If a literal reading is required for assessment, emailing a generated
  password is a small change. Recorded so the option stays visible.

---

## Deviation 2 — `NFR-10` "authorized trainers"

### 2.1 Original source wording (verbatim, unaltered)

> **`reference/lab2/I025_Dhrupad Gupta_SE_Lab2.pdf`, p.7, NFR column:**
>
> "Security: **Medical information should only be accessible to authorized trainers.**"

Bound FR: `FR-TRN-05` "View member medical restrictions"
Bound AC: `AC-10` — "Given a member has a health condition logged, When the trainer opens the
member's profile, Then display a clear medical alert before workouts are set."

### 2.2 The two readings

| Reading | "authorized trainers" means | Effect |
|---|---|---|
| **A — role-based** | Any authenticated user holding the Trainer role | Every trainer sees every member's medical data |
| **B — per-member** | Only trainers authorised *for that member* | A trainer sees medical data only for assigned members |

### 2.3 Textual arguments — both directions, honestly

**For B (per-member):**
- The word "authorized" would be **redundant** under Reading A. "Accessible to trainers" would
  say the same thing. Its presence implies a subset of trainers.

**For A (role-based):**
- ⚠️ **`NFR-21` uses parallel construction**: "Payment information should be encrypted and
  accessible only to **authorized staff**." There, "authorized staff" almost certainly means
  *staff with the appropriate role*, not per-payment authorisation. By the same construction,
  "authorized trainers" may simply mean *users holding the Trainer role*.

This is a genuine ambiguity. **The source does not decide it.**

### 2.4 Decision and its justification

> ### ✅ **Reading B — per-member trainer assignment — is retained.**

The deciding argument is not textual but **logical**:

- Reading B is a **strict subset** of Reading A.
- If the intended meaning was A and B is implemented, the system is **stricter than required** —
  which cannot fail the requirement.
- If the intended meaning was B and A is implemented, the system **fails** the requirement.

**Therefore B is the only choice that satisfies the requirement under either reading.** For
medical data, failing safe is also the correct default independent of the wording.

### 2.5 Assessment

| Question | Finding |
|---|---|
| Does it satisfy the requirement? | ✅ **Yes, under both readings** |
| Is it a deviation? | ❌ **No — it is an interpretation**, and the conservative one |
| Is it an improvement? | ✅ Yes, on a strict reading of `AC-10`'s clinical-safety intent |
| Does documentation need updating? | ✅ **Yes** — `LAB2_NFR_TRACEABILITY.md` must carry both readings and this justification |

### 2.6 Consequence — a cost that must be stated

Reading B requires a `TrainerAssignment` record, and **no user story creates one.** This is
structurally the same gap as the five under `AMB-15` and the sixth found in `B-05` §7.

Minimum correct implementation: assignment is created implicitly when a trainer assigns a
workout plan (`AC-06`, `FR-TRN-01`) — the trainer who owns a member's plan is, by any reasonable
reading, authorised for that member. **This requires no new user-facing feature**, only a row
written as a side effect of an existing mandatory story.

Recorded as **`ENH-20`**, classified **IMPLIED-MANDATORY**: without it, `NFR-10` under Reading B
is unenforceable.

---

## Summary

| Deviation | Classification | Requirement satisfied? | Wording preserved? |
|---|---|---|---|
| `AC-11` activation link | **ENGINEERING SECURITY IMPROVEMENT / IMPLEMENTATION INTERPRETATION** | Yes — intent fully; literal text substantially, after the §1.4 revision | ✅ verbatim in the matrix |
| `NFR-10` per-member authorisation | **IMPLEMENTATION INTERPRETATION** (conservative reading) | ✅ Yes, under **both** readings | ✅ verbatim in the matrix |

**Neither requirement has been rewritten.** Both original sentences remain verbatim in the
traceability matrices, with the interpretation recorded as a separate annotation.

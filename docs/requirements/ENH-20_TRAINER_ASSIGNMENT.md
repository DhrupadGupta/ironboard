# ENH-20 — Trainer Assignment

> ## ENGINEERING ENHANCEMENT — REQUIRED FOR SYSTEM COMPLETENESS
> **Derived from existing mandatory workflows. No new user-facing feature.**

**Status:** ✅ Resolved · **Date:** 2026-08-16 · **Authority:** original `reference/lab1/`, `reference/lab2/`

---

## 1. Why the assignment exists

**Source requirement (verbatim, `reference/lab2/` p.7):**

> "Security: Medical information should only be accessible to **authorized trainers**."

`NFR-10` was interpreted per-member rather than role-wide (`docs/decisions/DEVIATIONS.md` §2),
because that reading is a **strict subset** of the role-based reading and therefore satisfies
the requirement under *either* interpretation.

Enforcing "authorized **for this member**" requires knowing which trainers are authorised for
which members. **No user story creates that link explicitly** — hence this enhancement.

---

## 2. Which existing workflow creates it

The source already creates trainer↔member relationships **twice**, inside mandatory stories.
Both are verbatim:

| Source | Verbatim | Creates a link? |
|---|---|---|
| `AC-06` (`US-06`, `FR-TRN-01`) | "When the trainer chooses or creates a workout plan and saves, Then **link the plan to the member's profile** and notify them." | ✅ **Explicitly uses the word "link"** |
| `AC-08` (`US-08`, `FR-TRN-03`) | "When the trainer books the session date and time, Then **reserve the slot and add it to both calendars**." | ✅ A booked session binds one trainer to one member |

**Decision: `TrainerAssignment` is written as a side effect of `AC-06` and `AC-08`.**
No new screen, no new endpoint, no new user story.

### 2.1 Why derivation from `WorkoutPlan` alone is insufficient ⚠️

The obvious minimal design — derive authorisation from `WorkoutPlan(memberId, trainerId)` and
add no table at all — **fails a source requirement**:

> `AC-10`: "Then display a clear medical alert **before workouts are set**."

If authorisation required an existing workout plan, the trainer could not see the medical alert
*before* setting workouts — contradicting `AC-10` directly.

**`AC-08` resolves this.** Booking a personal-training session precedes plan assignment and
requires no medical access, so the natural sequence satisfies both criteria:

```
AC-08  book PT session ──► assignment created
                                  │
AC-10  open profile ──► medical alert shown   ← "before workouts are set" ✅
                                  │
AC-06  set workout plan ──► assignment reaffirmed
```

This is why a materialised `TrainerAssignment` is retained rather than deriving purely from
plans.

---

## 3. Who can create or change it

| Action | Who | Mechanism |
|---|---|---|
| **Create** | Trainer (`ACT-02`) | **Implicit** — side effect of `AC-06` or `AC-08` |
| **Create** | Administrator (`ACT-03`) | Fallback only, for the bootstrap case |
| **Revoke** | Administrator | Administrative correction |
| Create | any other role | ❌ Denied |

⚠️ **The administrator fallback is an assumption.** No source describes assigning a trainer to a
member administratively. It exists so a member with no bookings and no plan is reachable at all.
It is deliberately *not* exposed as a member-facing or trainer-facing feature.

**Trainers cannot self-assign to arbitrary members** — assignment only arises from performing a
mandatory workflow that already required legitimate access to that member.

---

## 4. How authorisation works

```
allow(medical:read, member M) ⟺
      actor.role = Trainer
    ∧ ∃ TrainerAssignment(trainerId = actor.id, memberId = M, revokedAt IS NULL)
```

| Property | Value |
|---|---|
| Enforcement point | **Service layer**, re-checked after the route guard (ADR-007) |
| Default | **Deny** |
| Audited | ✅ Every medical read, granted or denied (`ENH-13`) |
| Non-trainer roles | Denied regardless of assignment |

Under the role-based reading of `NFR-10` this is stricter than necessary; under the per-member
reading it is exactly right. **It cannot fail either reading.**

---

## 5. Database relationship

```
Staff (Trainer) ──1:N──► TrainerAssignment ◄──N:1── Member
```

| Field | Type | Notes |
|---|---|---|
| `trainerId` | `TEXT` FK → `Staff.id` | |
| `memberId` | `TEXT` FK → `Member.id` | |
| `source` | `TEXT` | `workout_plan` \| `pt_session` \| `admin` — provenance |
| `createdAt` | `DATETIME` | |
| `revokedAt` | `DATETIME` NULL | Soft revoke; never hard-deleted (`NFR-13` pattern) |

**Constraints:** `UNIQUE (trainerId, memberId)` where `revokedAt IS NULL` ·
index `(trainerId, memberId)` for the authorisation check on every medical read.

**No schema growth beyond the entity already present in `DIA-16`.** Only `source` and
`revokedAt` are added.

---

## 6. API implications

| Endpoint | Change |
|---|---|
| `POST /members/:id/workout-plans` (`AC-06`) | **Side effect:** upsert `TrainerAssignment(source='workout_plan')` in the same transaction |
| `POST /sessions/personal-training` (`AC-08`) | **Side effect:** upsert `TrainerAssignment(source='pt_session')` in the same transaction |
| `GET /members/:id/medical` (`AC-10`) | **Guard:** requires an active assignment |
| `POST /members/:id/medical` (`ENH-03`) | Same guard |

**New endpoints: 1 (admin fallback only).**

```
POST   /api/v1/members/:memberId/trainer-assignments   → admin only
DELETE /api/v1/members/:memberId/trainer-assignments/:trainerId → admin only
```

⚠️ **No trainer-facing endpoint.** Adding one would create a user-facing feature the source does
not support.

**Revised endpoint count: 56 → 58** (41 academic, 17 enhancement).

---

## 7. Testing implications

| Test | Asserts | Level |
|---|---|---|
| `T-SEC-001a` | Assigned trainer **can** read medical data | Security |
| `T-SEC-001b` | **Unassigned trainer denied** → 403 | Security |
| `T-SEC-001c` | All four non-trainer staff roles denied → 403 | Security |
| `T-SEC-001d` | Member cannot read another member's medical data | Security |
| `T-I-020-01` | `AC-06` plan assignment creates the assignment | Integration |
| `T-I-020-02` | `AC-08` PT booking creates the assignment | Integration |
| `T-I-020-03` | **`AC-10` sequence**: book → medical visible **before** plan is set | Integration |
| `T-I-020-04` | Revoked assignment immediately denies access | Integration |
| `T-A-010` | `AC-10` alert displays for an assigned trainer | **Acceptance — academic** |

`T-A-010` is the only one counting toward academic coverage; it verifies `AC-10` itself.
`T-SEC-001a–d` verify `NFR-10` and count toward **NFR** coverage.

---

## 8. Traceability

| Field | Value |
|---|---|
| ID | `ENH-20` |
| Classification | **ENGINEERING ENHANCEMENT — REQUIRED FOR SYSTEM COMPLETENESS** |
| Exists because | `NFR-10` "authorized trainers", per-member interpretation |
| User story | **None** — derived from `US-06` and `US-08` |
| Acceptance criteria | Written by `AC-06`, `AC-08`; consumed by `AC-10` |
| NFR | **`NFR-10`** — enforcement mechanism |
| Academic coverage | **0** — the mechanism is enhancement; `AC-10` and `NFR-10` remain academic |

---

## 9. Honest summary

The assignment is not invented from nothing — `AC-06` literally says "**link** the plan to the
member's profile", and `AC-08` binds a trainer to a member for a session. This enhancement
**materialises a link the source already describes**, so `NFR-10` can be enforced per member.

Two things are genuinely assumed: the **administrator fallback** (no source describes it) and
the choice to keep a table rather than derive purely from plans — the latter forced by `AC-10`'s
"before workouts are set".

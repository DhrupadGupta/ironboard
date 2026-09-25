# Ironboard — Role / Permission Matrix

**Phase:** 4A · **Date:** 2026-08-21 · **Authority:** ADR-007, `B-02`
**Status:** ⚠️ **Matrix seeded and readable; enforcement wired to the authentication surface ONLY.**

> **This table was dumped from the live database, not written by hand.** Six roles, 36 permissions,
> 60 role→permission grants. Re-generate rather than trust it:
> `SELECT r.key, p.key FROM RolePermission rp JOIN Role r … JOIN Permission p …`

## Label key

| Label | Meaning |
|---|---|
| 🟩 **SOURCE REQUIREMENT** | From `reference/`. Three NFRs make access control mandatory |
| 🟦 **ENGINEERING DECISION** | The model, the role list and every individual grant |
| ⬛ **IMPLEMENTATION DETAIL** | Middleware, table shape |

🟩 **What the source actually requires** — only these three sentences, verbatim:

> `NFR-10` "Medical information should only be accessible to authorized trainers."
> `NFR-11` "Only administrators should be able to approve staff accounts."
> `NFR-21` "Payment information should be encrypted and accessible only to authorized staff."

🟦 **Everything else on this page is ours.** No source document contains a permission list, a role
list, or a matrix (`AMB-03`). The six-role set is the `B-01`/`B-02` resolution; `member` is
`ENH-01` and **never counts toward academic coverage**.

---

## 1. The model — ADR-007

**Role → permission set, deny-by-default.** Every endpoint declares the permission it requires; an
endpoint that declares none grants nothing, because the check is the only thing that grants.

Two rules are **stricter than a role check** and are therefore *not* expressible in the matrix
below:

| Rule | Why a role grant is insufficient | Status |
|---|---|---|
| 🟩 `NFR-10` | Says "**authorized** trainers", not "trainers". A blanket `medical:read` grant to the Trainer role would not satisfy the requirement as written — access must be gated on a live `TrainerAssignment` for **that member** | ⚠️ **NOT IMPLEMENTED** — Phase 4B. `medical:read` appears below as the role-level half only |
| 🟦 `ENH-01` | A member may read **only their own** records. Route handlers must take the subject id from the session, never from the caller | ⚠️ **NOT IMPLEMENTED** — Phase 4B |

---

## 2. The live matrix — 6 roles × 36 permissions

`Y` = granted. Dumped from the seeded database on 2026-08-21.

| Permission | Admin | Reception | Trainer | Membership | Accounting | Member |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| `attendance:create` | Y | Y | · | · | · | · |
| `attendance:read` | Y | Y | · | · | · | · |
| `branch:create` | Y | · | · | · | · | · |
| `branch:disable` | Y | · | · | · | · | · |
| `branch:read` | Y | · | · | · | · | · |
| `branch:update` | Y | · | · | · | · | · |
| `dashboard:read` | Y | · | · | · | · | · |
| `equipment:create` | Y | · | · | · | · | · |
| `equipment:read` | Y | · | · | · | · | · |
| `equipment:update` | Y | · | · | · | · | · |
| `invoice:create` | · | · | · | · | Y | · |
| `invoice:notify` | · | · | · | · | Y | · |
| `invoice:read` | · | · | · | · | Y | Y |
| `medical:create` | · | Y | Y | · | · | · |
| `medical:read` | · | · | Y | · | · | · |
| `member:create` | · | Y | · | · | · | · |
| `member:read` | Y | Y | Y | Y | Y | · |
| `member:update` | · | Y | · | · | · | · |
| `membership:cancel` | · | · | · | Y | · | · |
| `membership:create` | · | · | · | Y | · | · |
| `membership:read` | Y | Y | Y | Y | Y | Y |
| `membership:renew` | · | · | · | Y | · | · |
| `payment:create` | · | · | · | · | Y | · |
| `plan:create` | · | · | Y | Y | · | · |
| `plan:publish` | · | · | · | Y | · | · |
| `plan:read` | · | · | Y | Y | · | Y |
| `plan:update` | · | · | Y | Y | · | · |
| `progress:create` | · | · | Y | · | · | · |
| `progress:read` | · | · | Y | · | · | Y |
| `refund:create` | · | · | · | · | Y | · |
| `report:attendance` | Y | Y | · | · | · | · |
| `report:revenue` | Y | · | · | · | Y | · |
| `session:create` | · | Y | Y | · | · | · |
| `session:read` | Y | Y | Y | · | · | Y |
| `staff:approve` | **Y** | · | · | · | · | · |
| `staff:read` | Y | · | · | · | · | · |
| **Total** | **17** | **10** | **11** | **9** | **8** | **5** |

### Notes on specific grants

| Grant | Rationale |
|---|---|
| `staff:approve` → **Administrator only** | 🟩 `NFR-11` verbatim: "**Only** administrators". `T-A-042` proves the other four staff roles and Member all receive **403** |
| `medical:create` → Reception **and** Trainer | `AC-10` presupposes a logged condition; `ENH-03` gives it a writer. Reception captures it at registration, a trainer during training |
| `medical:read` → Trainer only | 🟩 `NFR-10`. ⚠️ Role-level half only — the per-member `TrainerAssignment` gate is Phase 4B |
| `plan:create/update` → Trainer **and** Membership Manager | Two different "plans": `WorkoutPlan` (`AC-06`, trainer) and `MembershipPlan` (`AC-16`, manager). ⚠️ **The permission key does not distinguish them.** Phase 4B must split these or scope them per resource — recorded as a known imprecision, not a hidden one |
| Administrator has **no** write permission outside D03 | `US-15` is "monitor"; `AC-15` is "show summary". Read-only across the other departments is deliberate |
| Member has 5 read-only grants | `ENH-01`. Scoping to *own* records is Phase 4B |

---

## 3. What is enforced today

| Endpoint | Permission | Enforced | Test |
|---|---|---|---|
| `POST /api/v1/staff/:id/approve` | `staff:approve` | ✅ | `T-A-042` |
| `GET /api/v1/auth/me` | *(authenticated, no permission)* | ✅ | `T-A-038` |
| everything else in API_ARCHITECTURE | various | ❌ **route does not exist** | — |

⬛ `requirePermission()` in `src/http/middleware.ts` runs **before** body validation
(API_ARCHITECTURE §2), so an unauthorised caller never learns the shape of a payload they may not
send. Permissions are re-read from the database on every request via `permissionsForStaff()` /
`permissionsForMember()`, so a grant change takes effect on the next call — no cache to invalidate.

⚠️ **`NFR-10`, `NFR-11` and `NFR-21` are NOT VERIFIED.** `NFR-11`'s guard is exercised, but the
requirement is verified only when `AC-11` has a passing acceptance test. `NFR-10` needs the
resource-level gate; `NFR-21` needs the payment endpoints and field encryption. Both are Phase 4B+.

---

## 4. Adding a route in Phase 4B — the rule

1. Declare a permission with `requirePermission('x:y')`. **A route with no declaration is a bug**,
   not a public endpoint.
2. If the rule is resource-level (`NFR-10`, member scope), the check belongs in the **service**,
   not the controller — ADR-007: "controllers alone cannot be trusted for authz".
3. Never accept a subject id from the caller for a member-scoped read. Take it from the session.
4. Add the permission to `PERMISSIONS` and `ROLE_PERMISSIONS` in `src/db/seed.ts`, and re-dump this
   table rather than editing it by hand.

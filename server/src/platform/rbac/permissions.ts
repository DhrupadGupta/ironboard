/**
 * Permission resolution — ADR-007, deny-by-default.
 *
 * 🟩 The *need* is requirement-driven: `NFR-10` ("Medical information should
 * only be accessible to authorized trainers"), `NFR-11` ("**Only**
 * administrators should be able to approve staff accounts") and `NFR-21`
 * ("Payment information should be … accessible only to authorized staff") are
 * unsatisfiable without it.
 * 🟦 The *model* — role → permission set, with two resource-level exceptions —
 * is our decision (`B-02`, ADR-007).
 *
 * Phase 4A wires this to the authentication surface only. `NFR-11`'s guard is
 * live because `AC-11` needs it (`staff:approve`); the remaining ~50 endpoints
 * are Phase 4B, and `NFR-10`'s resource-level `TrainerAssignment` check belongs
 * with the medical endpoints, so **no NFR is claimed verified here**.
 */
import type { PrismaClient } from '@prisma/client';

/** The six roles (`B-01`, `B-02`). `member` is `ENH-01` — never academic coverage. */
export type RoleKey =
  | 'administrator' | 'receptionist' | 'trainer'
  | 'membership_manager' | 'accounting_executive' | 'member';

export const MEMBER_ROLE_KEY: RoleKey = 'member';

/**
 * Staff permissions come from `RolePermission`. A member is not a `Staff` row
 * and so has no `roleId`; its permissions are read from the seeded `member`
 * role, which keeps one source of truth for all six roles.
 */
export async function permissionsForStaff(db: PrismaClient, staffId: string): Promise<string[]> {
  const staff = await db.staff.findUnique({
    where: { id: staffId },
    select: { role: { select: { key: true, permissions: { select: { permission: { select: { key: true } } } } } } },
  });
  if (staff === null) return []; // deny-by-default: unknown subject gets nothing
  return staff.role.permissions.map((rp) => rp.permission.key).sort();
}

export async function permissionsForMember(db: PrismaClient): Promise<string[]> {
  const role = await db.role.findUnique({
    where: { key: MEMBER_ROLE_KEY },
    select: { permissions: { select: { permission: { select: { key: true } } } } },
  });
  return (role?.permissions ?? []).map((rp) => rp.permission.key).sort();
}

/**
 * A member's grants are scoped to their **own** records (ADR-007). Route
 * handlers must therefore never accept a subject id from the caller — the id
 * comes from the session. Phase 4B enforces this per endpoint; recorded here so
 * the rule is stated where the permissions are resolved.
 */
export const MEMBER_SCOPE_RULE = 'own-records-only' as const;

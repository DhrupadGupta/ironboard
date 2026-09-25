/**
 * Login, logout and current-actor resolution.
 *
 * 🟦 ENGINEERING DECISION (`AMB-03`). Six roles authenticate through **one**
 * flow — MASTER_PLAN §11 — with the subject type resolved from the data, not
 * from a caller-supplied hint. A caller cannot ask to be treated as staff.
 *
 * The account-state rules this implements:
 *
 * | State                          | Result | Why                                    |
 * |--------------------------------|--------|----------------------------------------|
 * | staff `active` + right password| ✅ session | normal case                        |
 * | staff `pending`                | ❌ 401 | never activated — no password exists    |
 * | staff `disabled`               | ❌ 401 | `AC-11`/`AC-17` "immediately"           |
 * | staff `active`, no password    | ❌ 401 | approved but link never used            |
 * | member with a password         | ✅ session | `ENH-01`                            |
 * | member without a password      | ❌ 401 | not activated (see activation service)  |
 * | unknown email                  | ❌ 401 | identical response + identical cost     |
 *
 * Every ❌ row produces the **same** status, code, message and body shape.
 */
import type { AuthDeps } from './deps.js';
import { AuthenticationError, type AuthFailureReason } from './errors.js';
import { verifyDummy, verifyPassword } from './password.js';
import { createSession, revokeByToken, type IssuedSession, type SubjectType } from './session.service.js';
import { permissionsForMember, permissionsForStaff } from '../rbac/permissions.js';

/**
 * The actor as the frontend is allowed to see it. Note what is absent:
 * **no `passwordHash`, no `activationTokenHash`, no session internals.** This
 * type is the enforcement point — API responses are built from it, never from a
 * Prisma row, so a hash cannot leak by someone forgetting to strip a field.
 */
export interface PublicActor {
  id: string;
  subjectType: SubjectType;
  fullName: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface LoginResult {
  actor: PublicActor;
  session: IssuedSession;
}

const fail = (deps: AuthDeps, reason: AuthFailureReason, email: string): never => {
  // The reason lives in the log, never in the response (errors.ts explains why).
  deps.log.warn('auth.login_failed', { reason, email });
  throw new AuthenticationError(reason);
};

/**
 * Authenticate by email + password.
 *
 * Ordering note: the password is verified **before** account state is judged, so
 * that a pending or disabled account costs the same as an active one. Judging
 * state first would let an attacker separate "disabled account" from "wrong
 * password" by response time even though the bodies match.
 */
export async function login(deps: AuthDeps, emailRaw: string, password: string): Promise<LoginResult> {
  const email = emailRaw.trim().toLowerCase();

  const staff = await deps.db.staff.findUnique({ where: { email }, include: { role: true } });
  if (staff !== null) {
    const ok = await verifyPassword(staff.passwordHash, password);
    if (!ok) fail(deps, staff.passwordHash === null ? 'NO_PASSWORD_SET' : 'WRONG_PASSWORD', email);
    if (staff.status === 'pending') fail(deps, 'ACCOUNT_PENDING', email);
    if (staff.status === 'disabled') fail(deps, 'ACCOUNT_DISABLED', email);

    const session = await createSession(deps, 'staff', staff.id);
    deps.log.info('auth.login_succeeded', { subjectType: 'staff', subjectId: staff.id, email });
    return {
      actor: {
        id: staff.id,
        subjectType: 'staff',
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role.key,
        permissions: await permissionsForStaff(deps.db, staff.id),
      },
      session,
    };
  }

  const member = await deps.db.member.findUnique({ where: { email } });
  if (member !== null) {
    const ok = await verifyPassword(member.passwordHash, password);
    if (!ok) fail(deps, member.passwordHash === null ? 'NO_PASSWORD_SET' : 'WRONG_PASSWORD', email);

    const session = await createSession(deps, 'member', member.id);
    deps.log.info('auth.login_succeeded', { subjectType: 'member', subjectId: member.id, email });
    return {
      actor: {
        id: member.id,
        subjectType: 'member',
        fullName: member.fullName,
        email: member.email,
        role: 'member',
        permissions: await permissionsForMember(deps.db),
      },
      session,
    };
  }

  // Unknown address: spend the same CPU a real Argon2id verify would, so the
  // absence of an account is not detectable with a stopwatch.
  await verifyDummy(password);
  return fail(deps, 'UNKNOWN_SUBJECT', email);
}

/** Idempotent by design — logging out twice, or with a dead token, is success. */
export async function logout(deps: AuthDeps, token: string | undefined): Promise<void> {
  await revokeByToken(deps, token);
}

/**
 * Resolve the actor behind a validated session. Returns `null` when the subject
 * row has vanished or has since been disabled, so a live session cannot outlive
 * the account it belongs to even between revocation sweeps.
 */
export async function currentActor(
  deps: AuthDeps,
  subjectType: SubjectType,
  subjectId: string,
): Promise<PublicActor | null> {
  if (subjectType === 'staff') {
    const staff = await deps.db.staff.findUnique({ where: { id: subjectId }, include: { role: true } });
    if (staff === null || staff.status !== 'active') return null;
    return {
      id: staff.id,
      subjectType: 'staff',
      fullName: staff.fullName,
      email: staff.email,
      role: staff.role.key,
      permissions: await permissionsForStaff(deps.db, staff.id),
    };
  }

  const member = await deps.db.member.findUnique({ where: { id: subjectId } });
  if (member === null) return null;
  return {
    id: member.id,
    subjectType: 'member',
    fullName: member.fullName,
    email: member.email,
    role: 'member',
    permissions: await permissionsForMember(deps.db),
  };
}

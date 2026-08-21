/**
 * Staff account activation — the `AC-11` write path.
 *
 * ── The requirement, verbatim and unaltered (🟩 SOURCE REQUIREMENT) ─────────
 *   `AC-11`: "Given a new staff member registers for access, When the admin
 *   reviews and clicks \"Approve\", Then activate the account and **send login
 *   details**."
 *   `NFR-11`: "Only administrators should be able to approve staff accounts."
 *
 * ── The finalized interpretation (🟦 ENGINEERING SECURITY IMPROVEMENT) ──────
 * Recorded in `docs/decisions/DEVIATIONS.md` §1. "Login details" legitimately
 * means *where* and *who*, not only a secret, so the approval notification
 * carries all four of:
 *
 *   1. the sign-in URL          2. the login identifier (their email)
 *   3. the assigned role        4. a single-use, time-limited set-password link
 *
 * **A password is never generated, never transmitted and never stored in
 * plaintext.** The residual deviation is narrow and recorded; it is not hidden.
 *
 * ── Token properties the brief requires, and where each is enforced ─────────
 *   securely generated  → `mintToken()`, 256 random bits
 *   stored safely       → only `sha256(token)` reaches the database
 *   time-limited        → `activationExpiresAt`, checked against the injected clock
 *   single-use          → consumed inside a transaction that nulls the hash
 *   invalidated on use  → same transaction; a replay finds no row
 */
import { config } from '../../config.js';
import type { AuthDeps } from './deps.js';
import { ActivationError } from './errors.js';
import { hashPassword } from './password.js';
import { revokeAllForSubject } from './session.service.js';
import { hashToken, mintToken } from './tokens.js';

/**
 * Everything `AC-11` calls "login details", assembled for the notification.
 * `activationToken` is the only secret and appears **once**, in the outbox row
 * that the (not yet built) dispatcher will send. It is never returned to a
 * browser and never logged.
 */
export interface LoginDetails {
  signInUrl: string;
  identifier: string;
  role: string;
  homeBranch: string | null;
  activationUrl: string;
  activationExpiresAt: Date;
}

export interface ApprovalResult {
  staffId: string;
  loginDetails: LoginDetails;
  /** Raw token, for tests and for the dispatcher. Excluded from all API output. */
  activationToken: string;
}

/**
 * Approve a pending staff account and issue its activation link.
 *
 * The status stays `pending` until the link is used. Approval grants the *right*
 * to set a password; it does not by itself produce a usable login, because a
 * usable login would require a password the admin does not have. This is what
 * "activate the account" means once credential transmission is off the table.
 */
export async function approveStaff(
  deps: AuthDeps,
  staffId: string,
  approvedByStaffId: string,
): Promise<ApprovalResult> {
  const now = deps.now();
  const staff = await deps.db.staff.findUnique({
    where: { id: staffId },
    include: { role: true, homeBranch: true },
  });

  // A missing id and a non-pending account are both "not approvable". Unlike the
  // login path there is no enumeration concern here — the caller is already an
  // authenticated administrator — but the states are still reported uniformly
  // because an admin has no action to take that differs between them.
  if (staff === null || staff.status !== 'pending') throw new ActivationError('NOT_PENDING');

  const token = mintToken();
  const expiresAt = new Date(now.getTime() + config.activation.ttlMs);

  await deps.db.staff.update({
    where: { id: staffId },
    data: {
      activationTokenHash: hashToken(token),
      activationExpiresAt: expiresAt,
      approvedByStaffId,
      approvedAt: now,
    },
  });

  const loginDetails: LoginDetails = {
    signInUrl: config.signInUrl,
    identifier: staff.email,
    role: staff.role.name,
    homeBranch: staff.homeBranch?.name ?? null,
    activationUrl: `${config.signInUrl}/activate?token=${token}`,
    activationExpiresAt: expiresAt,
  };

  // ADR-008: queued, not sent inline. Keeps provider latency out of the request
  // and means an approval is never lost because an SMTP host was down.
  // The token lives in this row and nowhere else that is readable.
  await deps.db.notificationOutbox.create({
    data: {
      id: deps.newId('nof'),
      channel: 'email',
      recipient: staff.email,
      template: 'staff_approved_activation',
      payloadJson: JSON.stringify(loginDetails),
      status: 'pending',
      createdAt: now,
    },
  });

  deps.log.info('staff.approved', { staffId, approvedByStaffId, email: staff.email });
  return { staffId, loginDetails, activationToken: token };
}

/**
 * Consume an activation token and set the password. Single-use is guaranteed by
 * doing the check and the clear in **one transaction**: two concurrent requests
 * with the same token cannot both find it unconsumed.
 */
export async function activateStaff(
  deps: AuthDeps,
  token: string,
  newPassword: string,
): Promise<{ staffId: string }> {
  const now = deps.now();
  // Hashing outside the transaction on purpose — Argon2id is deliberately slow
  // and must not hold a write transaction open on a single-writer database.
  const passwordHash = await hashPassword(newPassword);
  const tokenHash = hashToken(token);

  /**
   * The transaction **returns** an outcome instead of throwing.
   *
   * Throwing inside a Prisma interactive transaction rolls it back — which
   * silently undid the expired-token cleanup below until `T-A-023` caught it.
   * Failures are therefore decided inside the transaction and raised outside it,
   * so any write that must survive a failure actually commits.
   */
  type Outcome =
    | { kind: 'unknown' }
    | { kind: 'expired'; staffId: string }
    | { kind: 'activated'; staffId: string };

  const outcome = await deps.db.$transaction(async (tx): Promise<Outcome> => {
    const staff = await tx.staff.findUnique({ where: { activationTokenHash: tokenHash } });

    // No row means: never existed, already consumed, or belongs to a different
    // token. All three are indistinguishable to the caller — intentionally.
    if (staff === null) return { kind: 'unknown' };
    if (staff.activationExpiresAt === null || staff.activationExpiresAt <= now) {
      return { kind: 'expired', staffId: staff.id };
    }

    await tx.staff.update({
      where: { id: staff.id },
      data: {
        passwordHash,
        status: 'active',
        activationTokenHash: null, // single-use: the token dies here
        activationExpiresAt: null,
      },
    });
    return { kind: 'activated', staffId: staff.id };
  });

  if (outcome.kind === 'unknown') throw new ActivationError('UNKNOWN');
  if (outcome.kind === 'expired') {
    // Committed on its own, outside the rolled-back path: a captured expired
    // link must not remain probeable.
    await deps.db.staff.update({
      where: { id: outcome.staffId },
      data: { activationTokenHash: null, activationExpiresAt: null },
    });
    deps.log.warn('staff.activation_expired', { staffId: outcome.staffId });
    throw new ActivationError('EXPIRED');
  }
  const staffId = outcome.staffId;

  // Any session that somehow predates the password is not allowed to survive it.
  await revokeAllForSubject(deps, 'staff', staffId, 'password_set');
  deps.log.info('staff.activated', { staffId });
  return { staffId };
}

/**
 * ⚠️ **ENH-01 GAP — deliberately not implemented in Phase 4A.**
 *
 * `Member` has `passwordHash` but **no** `activationTokenHash` /
 * `activationExpiresAt` / `status` columns, because no acceptance criterion
 * describes a member obtaining a password: `AC-11` is about *staff* accounts,
 * and the member portal is `ENH-01`. Building a member activation flow would
 * mean inventing a requirement **and** migrating the schema, so neither was
 * done.
 *
 * Consequence, stated plainly: a member can **log in** (that path is
 * implemented and tested) but there is no HTTP route by which a member obtains
 * a password. The seed contains one documented demo member with a password so
 * the login path is exercised end to end. Closing this gap needs a decision
 * from the requirement owner, not a guess from us.
 */
export const MEMBER_ACTIVATION_NOT_IMPLEMENTED = true;

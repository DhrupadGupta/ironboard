/**
 * Session lifecycle — ADR-006, implemented on the `Session` table that Phase 3
 * already shipped. No schema change was required.
 *
 * 🟦 ENGINEERING DECISION (`AMB-03` — no source defines authentication).
 * The *need* for revocation, however, is 🟩 requirement-driven: `AC-11`
 * activates an account and `AC-17` "stops gym access", and both must take
 * effect immediately. That is precisely what a stateless token cannot do, and
 * it is why this table exists.
 *
 * ── How absolute + idle expiry fit the existing columns ────────────────────
 * SECURITY_ARCHITECTURE §2 requires "absolute + idle, both stored server-side",
 * and `Session` has `createdAt` and `expiresAt` but no `lastSeenAt`. Both
 * limits are still enforced exactly, with no migration:
 *
 *   idle     → `expiresAt` slides forward on each successful validation
 *   absolute → `createdAt + absoluteTtl`, which sliding can never exceed
 *
 * so `expiresAt = min(now + idleTtl, createdAt + absoluteTtl)`. A session dies
 * when left alone for `idleTtl`, and dies at the absolute cap however busy it is.
 */
import type { Session } from '@prisma/client';
import { config } from '../../config.js';
import type { AuthDeps } from './deps.js';
import { SessionInvalidError } from './errors.js';
import { hashToken, mintToken } from './tokens.js';

export type SubjectType = 'staff' | 'member';

export interface IssuedSession {
  /** The raw token. Returned **once**, to be put in the cookie. Never stored. */
  token: string;
  sessionId: string;
  expiresAt: Date;
}

export interface ActiveSession {
  sessionId: string;
  subjectType: SubjectType;
  subjectId: string;
  expiresAt: Date;
}

/** Absolute deadline for a session, independent of how often it is used. */
const absoluteDeadline = (createdAt: Date): Date =>
  new Date(createdAt.getTime() + config.session.absoluteTtlMs);

/** The value `expiresAt` should hold after activity at time `now`. */
const slidingExpiry = (now: Date, createdAt: Date): Date => {
  const idle = new Date(now.getTime() + config.session.idleTtlMs);
  const absolute = absoluteDeadline(createdAt);
  return idle < absolute ? idle : absolute;
};

export async function createSession(
  deps: AuthDeps,
  subjectType: SubjectType,
  subjectId: string,
): Promise<IssuedSession> {
  const now = deps.now();
  const token = mintToken();
  const session = await deps.db.session.create({
    data: {
      id: deps.newId('ses'),
      tokenHash: hashToken(token),
      subjectType,
      subjectId,
      // A brand-new session's idle window is always inside its absolute cap.
      expiresAt: new Date(now.getTime() + config.session.idleTtlMs),
      createdAt: now,
    },
  });
  deps.log.info('session.created', { sessionId: session.id, subjectType, subjectId });
  return { token, sessionId: session.id, expiresAt: session.expiresAt };
}

/**
 * Validates a raw token and slides the idle window.
 *
 * Throws `SessionInvalidError` for missing, unknown, revoked and expired alike —
 * the caller cannot tell which, by design. Expired rows are **revoked in place**
 * rather than deleted, so the audit trail keeps the evidence (`ENH-13`).
 */
export async function validateSession(deps: AuthDeps, token: string | undefined): Promise<ActiveSession> {
  if (token === undefined || token === '') throw new SessionInvalidError('MISSING');

  const now = deps.now();
  const row = await deps.db.session.findUnique({ where: { tokenHash: hashToken(token) } });
  if (row === null) throw new SessionInvalidError('UNKNOWN');
  if (row.revokedAt !== null) throw new SessionInvalidError('REVOKED');

  if (row.expiresAt <= now || absoluteDeadline(row.createdAt) <= now) {
    await revokeById(deps, row.id, 'expired');
    throw new SessionInvalidError('EXPIRED');
  }

  const next = slidingExpiry(now, row.createdAt);
  // Only write when the value actually moves, so a burst of requests inside the
  // same millisecond does not become a burst of writes on a single-writer DB.
  if (next.getTime() !== row.expiresAt.getTime()) {
    await deps.db.session.update({ where: { id: row.id }, data: { expiresAt: next } });
  }

  return {
    sessionId: row.id,
    subjectType: row.subjectType as SubjectType,
    subjectId: row.subjectId,
    expiresAt: next,
  };
}

/** Idempotent: revoking an already-revoked or unknown session is a no-op. */
export async function revokeById(deps: AuthDeps, sessionId: string, reason: string): Promise<void> {
  const { count } = await deps.db.session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: deps.now() },
  });
  if (count > 0) deps.log.info('session.revoked', { sessionId, reason });
}

/** Logout. Tolerates an already-invalid token — logging out is always safe. */
export async function revokeByToken(deps: AuthDeps, token: string | undefined): Promise<void> {
  if (token === undefined || token === '') return;
  const row = await deps.db.session.findUnique({ where: { tokenHash: hashToken(token) } });
  if (row !== null) await revokeById(deps, row.id, 'logout');
}

/**
 * Revokes every live session for a subject.
 *
 * This is the mechanism behind `AC-11` and `AC-17` "immediately": disabling a
 * staff account or stopping gym access must not wait for a token to expire.
 * Also used on password change, so a set-password link cannot be a way to keep
 * an older stolen session alive.
 */
export async function revokeAllForSubject(
  deps: AuthDeps,
  subjectType: SubjectType,
  subjectId: string,
  reason: string,
): Promise<number> {
  const { count } = await deps.db.session.updateMany({
    where: { subjectType, subjectId, revokedAt: null },
    data: { revokedAt: deps.now() },
  });
  if (count > 0) deps.log.info('session.revoked_all', { subjectType, subjectId, reason, count });
  return count;
}

/**
 * The only shape a session may take when it leaves the server.
 * `tokenHash`, `subjectId` and the row id are deliberately absent — the
 * frontend has no use for session internals and must not be handed them.
 */
export function publicSessionView(session: ActiveSession): { expiresAt: string } {
  return { expiresAt: session.expiresAt.toISOString() };
}

export type { Session };

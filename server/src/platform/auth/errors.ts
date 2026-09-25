/**
 * The authentication error taxonomy.
 *
 * 🟦 ENGINEERING DECISION, and the most security-sensitive design choice in the
 * auth layer.
 *
 * Internally the service distinguishes every failure reason, because the
 * activation flow, the audit trail and the tests all need to tell them apart.
 * **Externally, every credential failure collapses to one response.**
 *
 * SECURITY_ARCHITECTURE §6 requires an "identical response for unknown user vs
 * wrong password". This module extends that to the pending and disabled cases:
 * telling a caller "this account is awaiting approval" confirms the address
 * belongs to a real employee, which is exactly the enumeration the rule exists
 * to prevent. The distinction survives in the server log, not in the response.
 */

/** Internal reason. Never serialised to a client. */
export type AuthFailureReason =
  | 'UNKNOWN_SUBJECT'
  | 'WRONG_PASSWORD'
  | 'NO_PASSWORD_SET'
  | 'ACCOUNT_PENDING'
  | 'ACCOUNT_DISABLED';

/**
 * The single public message for every reason above. One string, one status,
 * one shape — so a caller cannot distinguish the cases by body, code or length.
 */
export const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

export class AuthenticationError extends Error {
  override readonly name = 'AuthenticationError';
  readonly status = 401;
  /** Stable machine code for the client. Identical for every reason. */
  readonly publicCode = 'INVALID_CREDENTIALS';

  constructor(readonly reason: AuthFailureReason) {
    super(INVALID_CREDENTIALS_MESSAGE);
  }
}

/** No session, expired session, revoked session, or unknown token. */
export class SessionInvalidError extends Error {
  override readonly name = 'SessionInvalidError';
  readonly status = 401;
  readonly publicCode = 'SESSION_INVALID';

  constructor(readonly reason: 'MISSING' | 'UNKNOWN' | 'EXPIRED' | 'REVOKED') {
    // Deliberately uniform: an expired session and a forged one look the same.
    super('Your session is not valid. Please sign in again.');
  }
}

/**
 * Authenticated but not permitted (ADR-007 deny-by-default). Separate from
 * `SessionInvalidError` because 403-vs-401 is not a secret — the caller already
 * proved who they are.
 */
export class AuthorizationError extends Error {
  override readonly name = 'AuthorizationError';
  readonly status = 403;
  readonly publicCode = 'FORBIDDEN';

  constructor(readonly requiredPermission: string) {
    super('You do not have permission to perform this action.');
  }
}

/** Activation link unusable: wrong, expired, or already consumed. */
export class ActivationError extends Error {
  override readonly name = 'ActivationError';
  readonly status = 400;
  readonly publicCode = 'ACTIVATION_INVALID';

  constructor(readonly reason: 'UNKNOWN' | 'EXPIRED' | 'ALREADY_USED' | 'NOT_PENDING') {
    // Uniform for the same reason as above: an attacker holding a guessed token
    // must not learn whether it once existed.
    super('This activation link is invalid or has expired.');
  }
}

export class ValidationError extends Error {
  override readonly name = 'ValidationError';
  readonly status = 400;
  readonly publicCode = 'VALIDATION_FAILED';

  constructor(message: string, readonly details: readonly { path: string; message: string }[] = []) {
    super(message);
  }
}

export class RateLimitedError extends Error {
  override readonly name = 'RateLimitedError';
  readonly status = 429;
  readonly publicCode = 'RATE_LIMITED';

  constructor(readonly retryAfterSeconds: number) {
    super('Too many attempts. Please try again later.');
  }
}

interface HttpShapedError {
  status: number;
  publicCode: string;
  message: string;
}

export function isHttpShapedError(e: unknown): e is Error & HttpShapedError {
  return (
    e instanceof Error &&
    typeof (e as Partial<HttpShapedError>).status === 'number' &&
    typeof (e as Partial<HttpShapedError>).publicCode === 'string'
  );
}

/**
 * HTTP middleware for the authentication surface.
 *
 * 🟦 ENGINEERING DECISION throughout — SECURITY_ARCHITECTURE §6 records that
 * "none of this is required by any source". It is baseline hardening and must
 * never be presented as academic coverage.
 */
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { config, secureCookies } from '../config.js';
import type { AuthDeps } from '../platform/auth/deps.js';
import {
  AuthorizationError, RateLimitedError, SessionInvalidError, ValidationError, isHttpShapedError,
} from '../platform/auth/errors.js';
import { validateSession } from '../platform/auth/session.service.js';
import { currentActor, type PublicActor } from '../platform/auth/auth.service.js';
import { mintToken, safeEqual } from '../platform/auth/tokens.js';

/** What authentication attaches to the request. Nothing secret is included. */
export interface RequestActor { actor: PublicActor; sessionId: string }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { auth?: RequestActor }
  }
}

/* ── Cookies ─────────────────────────────────────────────────────────────── */

/**
 * `httpOnly` so XSS cannot read it, `SameSite=Strict` so a cross-site form
 * cannot ride it, `Secure` in production so it never crosses plain HTTP
 * (ADR-006). `Secure` is off in dev because localhost has no TLS and the cookie
 * would simply never be set — an untestable app is its own security problem.
 */
export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(config.session.cookieName, token, {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(config.session.cookieName, {
    httpOnly: true, secure: secureCookies(), sameSite: 'strict', path: '/',
  });
}

/**
 * CSRF double-submit: the token is readable by JS (that is the point — the app
 * must echo it in a header) but a cross-origin attacker can neither read the
 * cookie nor set the header.
 */
export function issueCsrfCookie(res: Response): string {
  const token = mintToken();
  res.cookie(config.csrf.cookieName, token, {
    httpOnly: false, secure: secureCookies(), sameSite: 'strict', path: '/',
  });
  return token;
}

/* ── Validation ──────────────────────────────────────────────────────────── */

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(new ValidationError(
        'The request body is invalid.',
        parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      ));
      return;
    }
    req.body = parsed.data;
    next();
  };
}

/* ── Authentication ──────────────────────────────────────────────────────── */

/**
 * Validates the session cookie and attaches the actor.
 *
 * Two rejections, both 401 and indistinguishable: an invalid session, and a
 * valid session whose subject is gone or no longer active. The second case is
 * what makes "stop access immediately" true even for a session issued a second
 * before an account was disabled.
 */
export function authenticate(deps: AuthDeps) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = (req.cookies as Record<string, string> | undefined)?.[config.session.cookieName];
      const session = await validateSession(deps, token);
      const actor = await currentActor(deps, session.subjectType, session.subjectId);
      if (actor === null) {
        deps.log.warn('auth.session_subject_unavailable', { sessionId: session.sessionId });
        throw new SessionInvalidError('REVOKED');
      }
      req.auth = { actor, sessionId: session.sessionId };
      next();
    } catch (e) { next(e); }
  };
}

/**
 * Deny-by-default authorisation (ADR-007). A route with no
 * `requirePermission(...)` grants nothing, because the permission is checked
 * here and nowhere else grants it.
 *
 * Runs **before** body validation on purpose (API_ARCHITECTURE §2): an
 * unauthorised caller must not learn the shape of a payload they may not send.
 */
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const actor = req.auth?.actor;
    if (actor === undefined) { next(new SessionInvalidError('MISSING')); return; }
    if (!actor.permissions.includes(permission)) { next(new AuthorizationError(permission)); return; }
    next();
  };
}

export function requireCsrf() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const cookie = (req.cookies as Record<string, string> | undefined)?.[config.csrf.cookieName];
    const header = req.get(config.csrf.headerName);
    if (typeof cookie !== 'string' || typeof header !== 'string' || !safeEqual(cookie, header)) {
      next(new ValidationError('Missing or invalid CSRF token.'));
      return;
    }
    next();
  };
}

/* ── Rate limiting ───────────────────────────────────────────────────────── */

interface Bucket { count: number; resetAt: number }

/**
 * Fixed-window counter, in memory.
 *
 * Deliberately simple and honestly bounded: **single-process only**. That is
 * sufficient here because ADR-001 is a single-process modular monolith over an
 * embedded single-writer database — there is no second instance to share state
 * with. If the deployment ever becomes multi-instance this must move to a shared
 * store, and that limitation is recorded rather than glossed.
 *
 * Two independent limits: per IP (one host hammering the endpoint) and per
 * identifier (one account attacked from many hosts). Either can trip.
 */
export function createRateLimiter(deps: AuthDeps) {
  const byIp = new Map<string, Bucket>();
  const byIdentifier = new Map<string, Bucket>();

  const hit = (store: Map<string, Bucket>, key: string, max: number, nowMs: number): boolean => {
    const bucket = store.get(key);
    if (bucket === undefined || bucket.resetAt <= nowMs) {
      store.set(key, { count: 1, resetAt: nowMs + config.rateLimit.windowMs });
      return true;
    }
    bucket.count += 1;
    return bucket.count <= max;
  };

  // Unbounded maps are a memory-exhaustion vector, so expired buckets are swept
  // opportunistically on each call rather than left to accumulate.
  const sweep = (nowMs: number): void => {
    for (const store of [byIp, byIdentifier]) {
      for (const [k, b] of store) if (b.resetAt <= nowMs) store.delete(k);
    }
  };

  const middleware = (req: Request, _res: Response, next: NextFunction): void => {
    const nowMs = deps.now().getTime();
    sweep(nowMs);
    const ip = req.ip ?? 'unknown';
    const body = req.body as { email?: unknown } | undefined;
    const identifier = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : null;

    const ipOk = hit(byIp, ip, config.rateLimit.maxPerIp, nowMs);
    const idOk = identifier === null
      ? true
      : hit(byIdentifier, identifier, config.rateLimit.maxPerIdentifier, nowMs);

    if (!ipOk || !idOk) {
      deps.log.warn('auth.rate_limited', { ip, email: identifier ?? undefined });
      next(new RateLimitedError(Math.ceil(config.rateLimit.windowMs / 1000)));
      return;
    }
    next();
  };

  /** Test seam: the limiter is process state, so a suite must be able to reset it. */
  const reset = (): void => { byIp.clear(); byIdentifier.clear(); };

  return { middleware, reset };
}

/* ── Errors ──────────────────────────────────────────────────────────────── */

/**
 * The single exit point for every error, so no handler can accidentally return
 * a stack trace, a Prisma message or a hash. Anything unrecognised becomes a
 * flat 500 with no detail.
 */
export function errorHandler(deps: AuthDeps) {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof RateLimitedError) res.setHeader('Retry-After', String(err.retryAfterSeconds));

    if (isHttpShapedError(err)) {
      const body: Record<string, unknown> = { error: { code: err.publicCode, message: err.message } };
      if (err instanceof ValidationError && err.details.length > 0) {
        (body.error as Record<string, unknown>).details = err.details;
      }
      res.status(err.status).json(body);
      return;
    }

    deps.log.error('http.unhandled_error', {
      message: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong.' } });
  };
}

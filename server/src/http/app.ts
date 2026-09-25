/**
 * The Express application — Phase 4A exposes the **authentication surface only**.
 *
 * 🟦 ENGINEERING DECISION. Endpoints match `docs/architecture/API_ARCHITECTURE.md`
 * §3 exactly; nothing was renamed or invented.
 *
 * | Method | Path                       | Auth | Permission      | Requirement |
 * |--------|----------------------------|------|-----------------|-------------|
 * | GET    | /api/v1/auth/csrf          | —    | —               | 🟦 baseline |
 * | POST   | /api/v1/auth/login         | —    | —               | 🟦 `AMB-03` |
 * | POST   | /api/v1/auth/logout        | —    | —               | `ENH-15`    |
 * | GET    | /api/v1/auth/me            | ✅   | —               | drives UI role gating |
 * | POST   | /api/v1/auth/staff/register| —    | —               | `ENH-06` (unblocks `AC-11`) |
 * | POST   | /api/v1/staff/:id/approve  | ✅   | `staff:approve` | 🟩 `AC-11`, `NFR-11` |
 * | POST   | /api/v1/auth/activate      | —    | — (token is the proof) | 🟩 `AC-11` |
 * | GET    | /healthz                   | —    | —               | 🟦 `NFR-03`/`NFR-15` probe |
 *
 * The other ~50 endpoints in API_ARCHITECTURE are Phase 4B and are absent —
 * deliberately, since a route with no permission declaration would fail closed
 * but a route that does not exist cannot be called at all.
 */
import express, { type Express, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { config } from '../config.js';
import type { AuthDeps } from '../platform/auth/deps.js';
import { activateStaff, approveStaff } from '../platform/auth/activation.service.js';
import { currentActor, login, logout } from '../platform/auth/auth.service.js';
import { publicSessionView, validateSession } from '../platform/auth/session.service.js';
import { activateBody, approveStaffParams, loginBody } from './schemas.js';
import {
  authenticate, clearSessionCookie, createRateLimiter, errorHandler, issueCsrfCookie,
  requireCsrf, requirePermission, setSessionCookie, validateBody,
} from './middleware.js';
import { ValidationError } from '../platform/auth/errors.js';
import { z } from 'zod';
import { hashPassword } from '../platform/auth/password.js';

const staffRegisterBody = z.object({
  email: z.string().email().max(254).transform((v) => v.trim().toLowerCase()),
  fullName: z.string().min(1).max(120),
  roleKey: z.enum(['receptionist', 'trainer', 'administrator', 'membership_manager', 'accounting_executive']),
});

export interface App { express: Express; resetRateLimiter: () => void }

export function createApp(deps: AuthDeps): App {
  const app = express();
  const limiter = createRateLimiter(deps);

  app.set('trust proxy', false); // no proxy in front; do not honour X-Forwarded-For
  app.use(helmet());
  app.use(express.json({ limit: '64kb' })); // body-size cap (SECURITY_ARCHITECTURE §6)
  app.use(cookieParser());

  app.get('/healthz', (_req, res) => { res.json({ status: 'ok' }); });

  const api = express.Router();

  api.get('/auth/csrf', (_req, res) => { res.json({ csrfToken: issueCsrfCookie(res) }); });

  /**
   * `AC-11`-adjacent (`ENH-06`): staff self-registration, which no user story
   * provides but `AC-11`'s "Given a new staff member registers for access"
   * presupposes. Always lands in `pending` with **no password** — a self-service
   * endpoint may never mint a usable account.
   */
  api.post('/auth/staff/register', limiter.middleware, validateBody(staffRegisterBody),
    async (req, res, next) => {
      try {
        const body = req.body as z.infer<typeof staffRegisterBody>;
        const role = await deps.db.role.findUnique({ where: { key: body.roleKey } });
        if (role === null) throw new ValidationError('Unknown role.');

        const existing = await deps.db.staff.findUnique({ where: { email: body.email } });
        // Identical 202 whether or not the address is taken — otherwise this
        // endpoint becomes a staff-directory oracle for an unauthenticated caller.
        if (existing === null) {
          await deps.db.staff.create({
            data: {
              id: deps.newId('stf'), email: body.email, fullName: body.fullName,
              roleId: role.id, status: 'pending', passwordHash: null,
            },
          });
          deps.log.info('staff.self_registered', { email: body.email, roleKey: body.roleKey });
        } else {
          deps.log.warn('staff.self_register_duplicate', { email: body.email });
        }
        res.status(202).json({ status: 'pending_approval' });
      } catch (e) { next(e); }
    });

  api.post('/auth/login', limiter.middleware, validateBody(loginBody), async (req, res, next) => {
    try {
      const { email, password } = req.body as z.infer<typeof loginBody>;
      const { actor, session } = await login(deps, email, password);
      setSessionCookie(res, session.token, session.expiresAt);
      issueCsrfCookie(res); // rotate on privilege change (SECURITY_ARCHITECTURE §2)
      // `actor` is a PublicActor — no hash, no session id, no token.
      res.status(200).json({ actor, session: publicSessionView({ ...session, subjectType: actor.subjectType, subjectId: actor.id }) });
    } catch (e) { next(e); }
  });

  api.post('/auth/logout', async (req, res, next) => {
    try {
      const token = (req.cookies as Record<string, string> | undefined)?.[config.session.cookieName];
      await logout(deps, token);
      clearSessionCookie(res);
      // 204 regardless: whether the token was live is not the caller's business.
      res.status(204).send();
    } catch (e) { next(e); }
  });

  api.get('/auth/me', authenticate(deps), (req, res) => {
    res.json({ actor: req.auth!.actor });
  });

  /** 🟩 `AC-11` + `NFR-11` — "**Only** administrators", enforced by permission. */
  api.post('/staff/:id/approve', authenticate(deps), requirePermission('staff:approve'), requireCsrf(),
    async (req, res, next) => {
      try {
        const { id } = approveStaffParams.parse(req.params);
        const result = await approveStaff(deps, id, req.auth!.actor.id);
        // The activation token is NOT in this response — it exists only in the
        // queued notification. An admin never handles the staff member's secret.
        res.status(200).json({
          staffId: result.staffId,
          loginDetails: {
            signInUrl: result.loginDetails.signInUrl,
            identifier: result.loginDetails.identifier,
            role: result.loginDetails.role,
            homeBranch: result.loginDetails.homeBranch,
            activationExpiresAt: result.loginDetails.activationExpiresAt.toISOString(),
          },
        });
      } catch (e) { next(e); }
    });

  /**
   * Set-password / activation. Unauthenticated by necessity — the holder has no
   * session yet; the single-use token *is* the proof. Rate limited so the token
   * space cannot be probed.
   */
  api.post('/auth/activate', limiter.middleware, validateBody(activateBody), async (req, res, next) => {
    try {
      const { token, password } = req.body as z.infer<typeof activateBody>;
      const { staffId } = await activateStaff(deps, token, password);
      res.status(200).json({ staffId, status: 'active' });
    } catch (e) { next(e); }
  });

  app.use('/api/v1', api);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No such endpoint.' } });
  });
  app.use(errorHandler(deps));

  return { express: app, resetRateLimiter: limiter.reset };
}

/** Exported for tests and for the seed's demo-member password. */
export { hashPassword, validateSession };

/**
 * Runtime configuration.
 *
 * 🟦 ENGINEERING DECISION throughout. **No source document defines
 * authentication at all** (`AMB-03`), so every value here is a project choice,
 * not a requirement. The `[ENG]` markers are deliberate: nothing in this file
 * may be cited as academic coverage.
 *
 * Secrets are read from the environment and never committed. `.env` is
 * gitignored; `.env.example` documents the names only.
 */

const int = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} must be a positive number`);
  return n;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

export const config = {
  /** `production` disables dev-only affordances and requires a real cookie secret. */
  env: process.env.NODE_ENV ?? 'development',

  /**
   * Session lifetimes — SECURITY_ARCHITECTURE §2 requires "absolute + idle,
   * both stored server-side".
   *
   * ⚠️ Neither duration is sourced. The `[EXP2]` handout's 10-second inactivity
   * logout is a **sample about a different system** and is explicitly NOT an
   * Ironboard requirement (`INC-02`). These are `ASM` values.
   */
  session: {
    /** Idle timeout: a session unused for this long is dead. */
    idleTtlMs: int('SESSION_IDLE_TTL_MS', 30 * MINUTE),
    /** Absolute cap: a session is dead this long after creation regardless of use. */
    absoluteTtlMs: int('SESSION_ABSOLUTE_TTL_MS', 12 * HOUR),
    cookieName: 'ironboard_session',
  },

  /** Activation links (`AC-11`) — single-use and time-limited. */
  activation: {
    ttlMs: int('ACTIVATION_TTL_MS', 24 * HOUR),
  },

  /**
   * Argon2id parameters. Defaults follow the OWASP "second recommended"
   * configuration (19 MiB, t=2, p=1), which `@node-rs/argon2` also defaults to.
   * Stated explicitly so a reviewer can see the cost, not infer it.
   */
  password: {
    memoryCost: int('ARGON2_MEMORY_COST_KIB', 19_456),
    timeCost: int('ARGON2_TIME_COST', 2),
    parallelism: int('ARGON2_PARALLELISM', 1),
    /** Rejecting absurd input protects the hasher from being a DoS vector. */
    minLength: 12,
    maxLength: 128,
  },

  /** Rate limiting — SECURITY_ARCHITECTURE §6 "strict on `/auth/*`". */
  rateLimit: {
    windowMs: int('AUTH_RATE_WINDOW_MS', 15 * MINUTE),
    maxPerIp: int('AUTH_RATE_MAX_PER_IP', 10),
    maxPerIdentifier: int('AUTH_RATE_MAX_PER_IDENTIFIER', 5),
  },

  csrf: { cookieName: 'ironboard_csrf', headerName: 'x-csrf-token' },

  /** Where activation links point. Part of `AC-11`'s "login details". */
  signInUrl: process.env.SIGN_IN_URL ?? 'http://localhost:5173/sign-in',
} as const;

/** `Secure` cookies require HTTPS, which a local dev server does not have. */
export const secureCookies = (): boolean => config.env === 'production';

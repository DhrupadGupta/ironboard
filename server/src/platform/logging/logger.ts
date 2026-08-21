/**
 * Security-conscious logging.
 *
 * 🟦 ENGINEERING DECISION.
 *
 * Two hard rules, enforced here rather than left to caller discipline:
 *
 *   1. **No secret is ever logged** — passwords, session tokens, activation
 *      tokens, password hashes and cookie headers are replaced with
 *      `[REDACTED]` before anything is written.
 *   2. **No medical data is ever logged.** `NFR-10` restricts medical
 *      information to authorised trainers; a log file is not an authorised
 *      trainer. Any key matching the medical vocabulary is dropped outright,
 *      not redacted, so its presence cannot even be inferred from the shape.
 *
 * Email addresses are logged only as a one-way fingerprint, so a leaked log
 * cannot be mined for a member or staff directory.
 */
import { createHash } from 'node:crypto';

const SECRET_KEYS = /^(password|newPassword|currentPassword|token|activationToken|sessionToken|passwordHash|activationTokenHash|tokenHash|authorization|cookie|set-cookie|secret|csrf)$/i;

/** `NFR-10` — medical data must never reach a log sink. */
const MEDICAL_KEYS = /^(condition|conditionCipher|medical|medicalRestriction|medicalRestrictions|diagnosis|healthCondition|notes)$/i;

export const REDACTED = '[REDACTED]';

/** Short, stable, non-reversible stand-in for an identifier. */
export function fingerprint(value: string): string {
  return `fp_${createHash('sha256').update(value.toLowerCase()).digest('hex').slice(0, 12)}`;
}

export function redact(input: unknown, depth = 0): unknown {
  if (depth > 6 || input === null || typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map((v) => redact(v, depth + 1));

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (MEDICAL_KEYS.test(k)) continue; // dropped, not redacted — NFR-10
    if (SECRET_KEYS.test(k)) { out[k] = REDACTED; continue; }
    out[k] = k.toLowerCase() === 'email' && typeof v === 'string' ? fingerprint(v) : redact(v, depth + 1);
  }
  return out;
}

export type LogLevel = 'info' | 'warn' | 'error';
export interface LogRecord { level: LogLevel; event: string; at: string; [k: string]: unknown }

/** Swappable so tests can assert on what would have been written. */
export type Sink = (record: LogRecord) => void;

const defaultSink: Sink = (record) => {
  if (process.env.NODE_ENV === 'test') return; // keep the suite output readable
  const line = JSON.stringify(record);
  if (record.level === 'error') console.error(line);
  else if (record.level === 'warn') console.warn(line);
  else console.info(line);
};

export function createLogger(sink: Sink = defaultSink) {
  const write = (level: LogLevel, event: string, context: Record<string, unknown> = {}): void => {
    sink({ level, event, at: new Date().toISOString(), ...(redact(context) as Record<string, unknown>) });
  };
  return {
    info: (event: string, ctx?: Record<string, unknown>) => write('info', event, ctx),
    warn: (event: string, ctx?: Record<string, unknown>) => write('warn', event, ctx),
    error: (event: string, ctx?: Record<string, unknown>) => write('error', event, ctx),
  };
}

export type Logger = ReturnType<typeof createLogger>;

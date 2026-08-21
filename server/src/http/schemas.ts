/**
 * Request validation — Zod at the boundary (ADR-004, `NFR-02`).
 *
 * 🟩 `NFR-02` ("The system should validate all member information before
 * saving") drives *that* validation exists.
 * 🟦 Every specific rule is ours: `INC-05` records that **no source states any
 * field rule, format or length** anywhere.
 *
 * Passwords are validated for length only, and the schema never `.trim()`s or
 * transforms a password — silently altering a secret makes it unreproducible.
 */
import { z } from 'zod';
import { config } from '../config.js';

/**
 * Emails are lower-cased for lookup; the stored value keeps its own casing.
 *
 * Normalise **then** validate, in that order: a pasted address routinely
 * arrives with surrounding whitespace, and rejecting `" a@b.invalid "` as
 * malformed is a bug, not strictness. `.pipe()` is what makes the ordering
 * explicit — validating first would see the untrimmed string.
 */
export const emailSchema = z
  .string()
  .min(3)
  .max(254)
  .transform((v) => v.trim().toLowerCase())
  .pipe(z.string().email().max(254));

export const passwordSchema = z
  .string()
  .min(config.password.minLength, `Password must be at least ${config.password.minLength} characters.`)
  .max(config.password.maxLength, `Password must be at most ${config.password.maxLength} characters.`);

export const loginBody = z.object({
  email: emailSchema,
  // NOT `passwordSchema`: the login form must not reveal the password policy,
  // and a short input is a failed login, not a validation error that would
  // distinguish "too short to be one of ours" from "wrong".
  password: z.string().min(1).max(config.password.maxLength),
});

export const activateBody = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
});

export const approveStaffParams = z.object({ id: z.string().min(1).max(64) });

export type LoginBody = z.infer<typeof loginBody>;
export type ActivateBody = z.infer<typeof activateBody>;

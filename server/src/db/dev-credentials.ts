/**
 * The single development credential used by DEVELOPMENT SEED DATA (`ENH-16`).
 *
 * 🟦 ENGINEERING DECISION. Kept in its own module because `seed.ts` executes
 * `main()` on import — anything that merely needs the constant (tests, tooling)
 * must be able to read it without re-seeding the database.
 *
 * ⚠️ **This is not a secret and must never protect anything real.**
 *   - It authenticates only fabricated accounts on `.invalid` domains in a local
 *     SQLite file, so committing it leaks nothing.
 *   - Production accounts are created `pending` with a **null** hash and set
 *     their own password through the single-use activation link (`AC-11`).
 *   - `T-U-062` asserts the database stores an Argon2id hash and that this
 *     plaintext appears in no column.
 *
 * Documented in `docs/security/AUTHENTICATION.md`.
 */
export const DEV_PASSWORD = 'IronboardDev!2026';

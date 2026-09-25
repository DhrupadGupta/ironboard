/**
 * Database initialisation / reset mechanism (Phase 3, item 10).
 *
 * Drops the SQLite file, re-applies every migration from scratch, then reseeds.
 * This is the mechanism the "clean migration" and "migration from scratch"
 * tests exercise.
 *
 *   npm run db:reset                 # dev database
 *   DATABASE_URL=file:./test.db tsx src/db/reset.ts
 *
 * ⚠️ DESTRUCTIVE. Refuses to run when NODE_ENV=production.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const serverRoot = resolve(here, '../..');

export function resolveDbPath(url = process.env.DATABASE_URL ?? 'file:./ironboard.db'): string {
  const file = url.replace(/^file:/, '');
  return resolve(serverRoot, 'prisma', file);
}

export function resetDatabase(opts: { seed?: boolean } = {}): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('resetDatabase() refuses to run with NODE_ENV=production');
  }
  const dbPath = resolveDbPath();
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const p = `${dbPath}${suffix}`;
    if (existsSync(p)) rmSync(p);
  }
  const env = { ...process.env };
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], { cwd: serverRoot, env, stdio: 'pipe' });
  if (opts.seed !== false) {
    execFileSync('npx', ['tsx', 'src/db/seed.ts'], { cwd: serverRoot, env, stdio: 'pipe' });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const seed = !process.argv.includes('--no-seed');
  resetDatabase({ seed });
  console.log(`✔ database reset${seed ? ' and seeded' : ' (no seed)'}: ${resolveDbPath()}`);
}

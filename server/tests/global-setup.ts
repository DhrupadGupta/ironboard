/**
 * Builds a FRESH test database from migrations + seed before the suite runs.
 * This is itself the "clean migration from scratch" check — if it fails, the
 * whole suite fails loudly rather than testing a stale database.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const serverRoot = resolve(import.meta.dirname, '..');
const TEST_DB_URL = 'file:./test.db';

export default async function setup(): Promise<void> {
  const dbPath = resolve(serverRoot, 'prisma', 'test.db');
  for (const s of ['', '-journal', '-wal', '-shm']) {
    if (existsSync(`${dbPath}${s}`)) rmSync(`${dbPath}${s}`);
  }
  const env = { ...process.env, DATABASE_URL: TEST_DB_URL };
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], { cwd: serverRoot, env, stdio: 'pipe' });
  execFileSync('npx', ['tsx', 'src/db/seed.ts'], { cwd: serverRoot, env, stdio: 'pipe' });
  process.env.DATABASE_URL = TEST_DB_URL;
}

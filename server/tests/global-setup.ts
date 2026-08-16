/**
 * Builds a FRESH test database from migrations + seed before the suite runs.
 * This is itself the "clean migration from scratch" check — if it fails, the
 * whole suite fails loudly rather than testing a stale database.
 *
 * The returned teardown is the suite-level isolation boundary: it fails the run
 * if any test row survived the suite, even when every individual assertion
 * passed. Per-file hooks prove file-to-file cleanliness; this proves the suite
 * as a whole leaves the database exactly as the seed built it.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { findTestRows } from './helpers.js';

const serverRoot = resolve(import.meta.dirname, '..');
const TEST_DB_URL = 'file:./test.db';

export default async function setup(): Promise<() => Promise<void>> {
  const dbPath = resolve(serverRoot, 'prisma', 'test.db');
  for (const s of ['', '-journal', '-wal', '-shm']) {
    if (existsSync(`${dbPath}${s}`)) rmSync(`${dbPath}${s}`);
  }
  const env = { ...process.env, DATABASE_URL: TEST_DB_URL };
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], { cwd: serverRoot, env, stdio: 'pipe' });
  execFileSync('npx', ['tsx', 'src/db/seed.ts'], { cwd: serverRoot, env, stdio: 'pipe' });
  process.env.DATABASE_URL = TEST_DB_URL;

  return async function teardown(): Promise<void> {
    const db = new PrismaClient({ datasources: { db: { url: TEST_DB_URL } } });
    try {
      const residue = await findTestRows(db);
      const offenders = Object.entries(residue);
      if (offenders.length > 0) {
        throw new Error(
          'TEST ISOLATION VIOLATION at suite teardown: test rows survived the run. ' +
          `Leaked rows: ${offenders.map(([t, n]) => `${t}=${n}`).join(', ')}. ` +
          'Every test file must call purgeTestRows() in afterAll — see tests/helpers.ts.',
        );
      }
    } finally {
      await db.$disconnect();
    }
  };
}

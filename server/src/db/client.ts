import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton.
 *
 * PRAGMAs are applied on first connect:
 *  - foreign_keys = ON   → FK enforcement (SQLite defaults to OFF)
 *  - journal_mode = WAL  → concurrent readers (ADR-005)
 *  - synchronous = FULL  → required by the NFR-07 durability threshold
 *                          (ENGINEERING VERIFICATION THRESHOLD, ADR-012)
 */
export const prisma = new PrismaClient();

let pragmasApplied = false;

export async function applyPragmas(client: PrismaClient = prisma): Promise<void> {
  if (pragmasApplied) return;
  // foreign_keys / synchronous return no rows -> $executeRaw.
  await client.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
  await client.$executeRawUnsafe('PRAGMA synchronous = FULL;');
  // journal_mode RETURNS A ROW ("wal"), so it must use $queryRaw. Using
  // $executeRaw here fails with "Execute returned results, which is not
  // allowed in SQLite."
  await client.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
  pragmasApplied = true;
}

/** Read back the pragmas actually in force — used by the integrity tests. */
export async function readPragmas(
  client: PrismaClient = prisma,
): Promise<{ foreignKeys: number; journalMode: string; synchronous: number }> {
  const [fk] = await client.$queryRawUnsafe<{ foreign_keys: number }[]>('PRAGMA foreign_keys;');
  const [jm] = await client.$queryRawUnsafe<{ journal_mode: string }[]>('PRAGMA journal_mode;');
  const [sy] = await client.$queryRawUnsafe<{ synchronous: number }[]>('PRAGMA synchronous;');
  return {
    foreignKeys: Number(fk?.foreign_keys ?? 0),
    journalMode: String(jm?.journal_mode ?? ''),
    synchronous: Number(sy?.synchronous ?? 0),
  };
}

export async function disconnect(client: PrismaClient = prisma): Promise<void> {
  await client.$disconnect();
}

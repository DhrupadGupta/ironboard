import { PrismaClient } from '@prisma/client';

export const testDb = (): PrismaClient =>
  new PrismaClient({ datasources: { db: { url: 'file:./test.db' } } });

/** Assert that a promise rejects with a message matching `pattern`. */
export async function expectRejection(p: Promise<unknown>, pattern: RegExp): Promise<string> {
  try {
    await p;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!pattern.test(msg)) throw new Error(`rejected, but not matching ${pattern}:\n${msg}`);
    return msg;
  }
  throw new Error(`expected rejection matching ${pattern}, but the promise resolved`);
}

export const uid = (p: string): string => `${p}_test_${Math.random().toString(36).slice(2, 10)}`;

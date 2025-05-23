import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

const globalForDrizzle = globalThis as unknown as {
  dbClient: PostgresJsDatabase<typeof schema> | undefined;
};

const sql = neon(process.env.DATABASE_URL!);

export const dbClient =
  globalForDrizzle.dbClient ??
  drizzle(sql, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });

if (process.env.NODE_ENV !== 'production') globalForDrizzle.dbClient = dbClient; 
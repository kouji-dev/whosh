import * as schema from '../db/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDrizzle = globalThis as unknown as {
  dbClient: NodePgDatabase<typeof schema> | undefined;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const dbClient =
  globalForDrizzle.dbClient ??
  drizzle(pool, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });

if (process.env.NODE_ENV !== 'production') globalForDrizzle.dbClient = dbClient; 
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as dotenv from 'dotenv';
import { logger } from '../infra/logger/pino-logger';

dotenv.config();

const runMigration = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle({ client: pool });

  logger.info('Running migrations...');
  
  await migrate(db, { migrationsFolder: 'drizzle' });
  
  logger.info('Migrations completed!');
};

runMigration().catch((err) => {
  logger.error('Migration failed!');
  logger.error(err);
  process.exit(1);
}); 
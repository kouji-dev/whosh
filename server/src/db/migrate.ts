import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle({ client: pool });

  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: 'drizzle' });
  
  console.log('Migrations completed!');
};

runMigration().catch((err) => {
  console.error('Migration failed!');
  console.error(err);
  process.exit(1);
}); 
/**
 * Database migration runner.
 * Initializes the DataSource and runs synchronize() to create/update tables from entities.
 * In production, run via: npm run migrate (uses compiled dist/database/migrations/run.js)
 */
import 'dotenv/config';
import { AppDataSource } from '../connection';

async function run(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
    await AppDataSource.synchronize();
    console.log('Migration complete');
    console.log('Tables created/updated successfully');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();

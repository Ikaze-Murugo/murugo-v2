/**
 * Standalone database migration script.
 * This file should ONLY be run via: npm run migrate
 * It is completely isolated from the main server application.
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../../models/User.model';
import { Profile } from '../../models/Profile.model';
import { Property } from '../../models/Property.model';
import { PropertyMedia } from '../../models/PropertyMedia.model';
import { UserPreference } from '../../models/UserPreference.model';
import { Message } from '../../models/Message.model';
import { Favorite } from '../../models/Favorite.model';
import { Review } from '../../models/Review.model';
import { PropertyView } from '../../models/PropertyView.model';
import { Notification } from '../../models/Notification.model';

console.log('==========================================');
console.log('Rwanda Real Estate - Database Migration');
console.log('==========================================');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database Host:', process.env.DB_HOST);
console.log('Database Name:', process.env.DB_NAME);
console.log('==========================================');

const MigrationDataSource = new DataSource({
  name: 'migration',
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'rwanda_real_estate',
  synchronize: false,
  logging: true,
  entities: [
    User,
    Profile,
    Property,
    PropertyMedia,
    UserPreference,
    Message,
    Favorite,
    Review,
    PropertyView,
    Notification,
  ],
  subscribers: [],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function runMigration(): Promise<void> {
  try {
    console.log('\nConnecting to database...');
    await MigrationDataSource.initialize();
    console.log('✅ Database connection established');

    console.log('\nRunning schema synchronization...');
    await MigrationDataSource.synchronize();
    console.log('✅ Schema synchronized successfully');

    console.log('\nChecking tables...');
    const queryRunner = MigrationDataSource.createQueryRunner();
    const tables = await queryRunner.getTables();
    console.log(`✅ Found ${tables.length} tables:`, tables.map(t => t.name).join(', '));
    await queryRunner.release();

    console.log('\n==========================================');
    console.log('Migration completed successfully!');
    console.log('==========================================\n');

    await MigrationDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();

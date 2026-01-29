/**
 * Database migration runner.
 * Uses a named DataSource so it does not conflict with the app's default connection.
 * In production, run via: npm run migrate (uses compiled dist/database/migrations/run.js)
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

const MigrationDataSource = new DataSource({
  name: 'migration',
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'rwanda_real_estate',
  synchronize: false,
  logging: false,
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

async function run(): Promise<void> {
  try {
    await MigrationDataSource.initialize();
    console.log('Database connection established');
    await MigrationDataSource.synchronize();
    console.log('Migration complete');
    console.log('Tables created/updated successfully');
    await MigrationDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();

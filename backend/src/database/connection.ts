import { DataSource } from 'typeorm';
import { User } from '../models/User.model';
import { Profile } from '../models/Profile.model';
import { Property } from '../models/Property.model';
import { PropertyMedia } from '../models/PropertyMedia.model';
import { UserPreference } from '../models/UserPreference.model';
import { Message } from '../models/Message.model';
import { Favorite } from '../models/Favorite.model';
import { Review } from '../models/Review.model';
import { PropertyView } from '../models/PropertyView.model';
import { Notification } from '../models/Notification.model';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'rwanda_real_estate',
  synchronize: false, // NEVER auto-sync in production - use migrations instead
  logging: process.env.NODE_ENV === 'development',
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
  migrations: process.env.NODE_ENV === 'production' 
    ? ['dist/database/migrations/*.js']
    : ['src/database/migrations/*.ts'],
  subscribers: [],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

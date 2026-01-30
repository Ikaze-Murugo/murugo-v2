import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger.util';

const hasRedisConfig = !!process.env.REDIS_HOST;

const redisClient: RedisClientType | null = hasRedisConfig
  ? createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    })
  : null;

if (redisClient) {
  redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });
  redisClient.on('connect', () => {
    logger.info('Redis Client Connected');
  });
}

export const connectRedis = async (): Promise<void> => {
  if (!redisClient) {
    console.log('⚠️  Redis skipped (REDIS_HOST not set)');
    logger.info('Redis skipped (REDIS_HOST not set)');
    return;
  }
  try {
    console.log('🔌 Connecting to Redis...');
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
    logger.info('Redis connected successfully');
  } catch (error) {
    console.error('⚠️  Failed to connect to Redis (non-fatal):', error);
    logger.error('Failed to connect to Redis (non-fatal):', error);
    // Don't throw - Redis is optional, server can run without it
  }
};

/** Use for caching/sessions; null when Redis is disabled (e.g. on Vercel). */
export default redisClient;

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
    logger.info('Redis skipped (REDIS_HOST not set)');
    return;
  }
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

/** Use for caching/sessions; null when Redis is disabled (e.g. on Vercel). */
export default redisClient;

import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app';
import { connectDatabase } from './database/connection';
import { connectRedis } from './config/redis';
import { initializeSocket } from './socket';
import logger from './utils/logger.util';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server
async function startServer() {
  try {
    console.log('\n🚀 Starting server initialization...');
    
    // Connect to database
    console.log('📊 Connecting to database...');
    await connectDatabase();
    console.log('✅ Database connected successfully');
    logger.info('✅ Database connected successfully');

    // Connect to Redis (optional; skipped when REDIS_HOST not set, e.g. Vercel)
    console.log('🔄 Connecting to Redis...');
    await connectRedis();
    console.log('✅ Redis connection attempt completed');

    // Start listening
    console.log(`🌐 Starting HTTP server on port ${PORT}...`);
    server.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 API URL: ${process.env.API_URL || 'http://localhost:' + PORT}`);
      console.log(`========================================\n`);
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌐 API URL: ${process.env.API_URL}`);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error);
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

startServer();

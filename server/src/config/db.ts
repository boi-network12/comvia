// server/src/config/db.ts
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Global cache for serverless environment
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: CachedConnection = {
  conn: null,
  promise: null,
};

async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://comvia_db:KAMDILIc1@cluster0.tezqkas.mongodb.net/comvia?appName=Cluster0";

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  // If we have a connection and it's ready, use it
  if (cached.conn && mongoose.connection.readyState === 1) {
    logger.info('Using existing database connection');
    return cached.conn;
  }

  // If we're already connecting, wait for the promise
  if (cached.promise) {
    logger.info('Waiting for existing connection promise');
    await cached.promise;
    return cached.conn!;
  }

  // Connection options optimized for serverless
  const options = {
    maxPoolSize: 10,
    minPoolSize: 1,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    retryWrites: true,
    retryReads: true,
    heartbeatFrequencyMS: 10000,
  };

  logger.info('🔄 Connecting to MongoDB...');

  try {
    cached.promise = mongoose.connect(MONGODB_URI, options);
    cached.conn = await cached.promise;
    cached.promise = null;

    logger.info(`✅ MongoDB connected successfully`);
    logger.info(`📍 Host: ${mongoose.connection.host}`);
    logger.info(`📍 Database: ${mongoose.connection.name}`);

    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      cached.conn = null;
      cached.promise = null;
    });

    // Graceful shutdown for serverless
    const gracefulShutdown = async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed gracefully');
      }
    };

    // Handle serverless function termination
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    logger.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

// Helper to ensure connection before operations
export async function ensureDBConnection(): Promise<typeof mongoose> {
  try {
    return await connectDB();
  } catch (error) {
    logger.error('Failed to ensure DB connection:', error);
    throw new Error('Database connection unavailable. Please try again.');
  }
}

// Check if DB is connected
export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// Get connection status
export function getDBStatus(): { readyState: number; host: string; name: string } {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'N/A',
    name: mongoose.connection.name || 'N/A',
  };
}

export default connectDB;
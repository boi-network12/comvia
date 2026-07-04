// server/src/config/db.ts
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    // ✅ Don't exit on success
  } catch (error) {
    // ✅ LOG the error but DON'T exit the process
    logger.error(`❌ MongoDB Connection Error: ${(error as Error).message}`);
    // ❌ REMOVE: process.exit(1);
    
    // ✅ In serverless, we want to retry or handle gracefully
    throw error; // Re-throw so the caller can handle it
  }
};

export default connectDB;
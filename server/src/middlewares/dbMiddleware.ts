// server/src/middlewares/dbMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { ensureDBConnection } from '../config/db';
import { logger } from '../utils/logger';

export async function ensureDatabaseConnection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Check if connection exists, if not, reconnect
    await ensureDBConnection();
    next();
  } catch (error) {
    logger.error('Database connection failed in middleware:', error);
    res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again.',
    });
  }
}

// Apply to routes that need DB access
export const withDB = ensureDatabaseConnection;
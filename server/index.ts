// server/index.js or server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from './src/config/db';
import errorHandler from './src/middlewares/errorHandler';
import { getCorsOptions } from './src/config/corsConfig';
import routes from './src/routes';
import { logger, logRequest } from './src/utils/logger';
import { corsDebug } from './src/middlewares/corsDebug';

const app = express();

// Middleware
app.use(helmet());
app.use(cors(getCorsOptions()));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logRequest);
app.use(corsDebug);

// Routes
app.use('/api', routes);

// Health check
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbHost = 'N/A';
  
  try {
    const conn = await import('mongoose');
    if (conn.default.connection.readyState === 1) {
      dbStatus = 'connected';
      dbHost = conn.default.connection.host;
    }
  } catch (error) {
    // DB not connected
  }

  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL === '1' ? 'yes' : 'no',
    database: {
      status: dbStatus,
      host: dbHost,
    },
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
    }
  });
});

// Root
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Comvia API Server',
    version: '1.0.0',
    status: 'running',
  });
});

// Error handling middleware
app.use(errorHandler);

// ✅ Connect to DB WITHOUT blocking the export
// Don't await here - let it connect in background
connectDB()
  .then(() => {
    logger.info('✅ Database connected successfully');
  })
  .catch((err) => {
    // ✅ Log but don't crash in serverless
    logger.error('⚠️ Database connection failed:', err.message);
    logger.error('⚠️ API will continue to run but DB operations will fail');
  });

// ✅ EXPORT the app for Vercel (DO NOT listen)
export default app;

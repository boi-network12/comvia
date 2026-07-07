// server/index.js or server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB, { getDBStatus } from './src/config/db';
import errorHandler from './src/middlewares/errorHandler';
import { getCorsOptions } from './src/config/corsConfig';
import routes from './src/routes';
import { logger, logRequest } from './src/utils/logger';
import { corsDebug } from './src/middlewares/corsDebug';

const app = express();
const PORT = process.env.PORT || 8080;

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
// app.get('/health', async (req, res) => {
//   let dbStatus = 'disconnected';
//   let dbHost = 'N/A';
  
//   try {
//     const conn = await import('mongoose');
//     if (conn.default.connection.readyState === 1) {
//       dbStatus = 'connected';
//       dbHost = conn.default.connection.host;
//     }
//   } catch (error) {
//     // DB not connected
//   }

//   res.status(200).json({
//     status: 'ok',
//     message: 'Server is running',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development',
//     vercel: process.env.VERCEL === '1' ? 'yes' : 'no',
//     database: {
//       status: dbStatus,
//       host: dbHost,
//     },
//     uptime: Math.floor(process.uptime()),
//     memory: {
//       used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
//       total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
//     }
//   });
// });
app.get('/health', async (req, res) => {
  const dbStatus = getDBStatus();
  
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL === '1' ? 'yes' : 'no',
    database: {
      status: dbStatus.readyState === 1 ? 'connected' : 
              dbStatus.readyState === 2 ? 'connecting' : 
              dbStatus.readyState === 3 ? 'disconnecting' : 'disconnected',
      host: dbStatus.host,
      name: dbStatus.name,
      readyState: dbStatus.readyState,
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
    version: '1.1.0',
    status: 'running',
  });
});

// Error handling middleware
app.use(errorHandler);

// ✅ Connect to DB WITHOUT blocking the export
// Don't await here - let it connect in background
const connectWithRetry = async (retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await connectDB();
      logger.info('✅ Database connected successfully');
      return;
    } catch (error: unknown) {
      const err = error as Error; 
      logger.error(`⚠️ Database connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        logger.info(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  logger.error('❌ All database connection attempts failed');
};

// Non-blocking connection
connectWithRetry();


// =============== LOCAL SERVER ===============
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📍 Health check: http://localhost:${PORT}/health`);
  });
}

// ✅ EXPORT the app for Vercel (DO NOT listen)
export default app;

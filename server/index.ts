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
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
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

// connect to Db and start the server
connectDB()
  .then(async () => {
    logger.info('✅ Connected to the database');

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}/api/auth`);
    });
  })
  .catch((err) => {
    logger.error('❌ Failed to connect to the database', err);
    process.exit(1);
  });

export default app;
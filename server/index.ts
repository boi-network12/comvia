import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from './src/config/db';
import errorHandler from './src/middlewares/errorHandler';
// for importing api router


const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes

// Error handling middleware
app.use(errorHandler);

// connect to Db and start the server
connectDB()
   .then(async () => {
        console.log('Connected to the database');

        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
   })
   .catch((err) => {
        console.error('Failed to connect to the database', err);
        process.exit(1);
   });

export default app;
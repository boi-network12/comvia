// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from 'path';

// Import your routers and handlers
// import healthRouter from './routes/health.js';
// import { setupChatHandlers } from './handlers/chat.js';
// etc.

const app = express();
const server = http.createServer(app);

// ======================
// Middleware
// ======================
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));

app.use(express.json());

// ======================
// Routes
// ======================
app.use('/health', (req, res) => {
  res.status(200).json({ message: 'Health check passed' });
});

// Root
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Socket.IO server is running',
    service: 'comvia-socket',
    version: '1.0.0',           // good to add
    uptime: process.uptime(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    url: req.originalUrl 
  });
});

// ======================
// Socket.IO Setup
// ======================
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        credentials: true,
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true
    }
});

// Socket auth + handlers
io.use((socket, next) => {
    // your auth logic
    next();
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // handleConnection(socket, activeUsers);
    // setupChatHandlers(socket, io);
    // setupPresenceHandlers(socket, activeUsers);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`🌐 WebSocket: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  io.close(() => {
    console.log('Socket.IO server closed');
    process.exit(0);
  });
});

// Export for testing / deployment platforms
export { app, server, io };   // Named exports are cleaner
// export default { app, server, io }; // if you really need default
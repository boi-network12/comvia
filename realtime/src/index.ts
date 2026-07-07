// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSocketHandlers } from './handlers/socketHandlers';
import { authenticateSocket } from './middleware/auth';
import { setupPresence } from './handlers/presence';
import { setupMessageHandlers } from './handlers/messageHandlers';

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: [
        'https://comvia-widget.vercel.app',
        'https://comvia-backend-endpoint.vercel.app',
        'https://comvia.vercel.app',
        'http://localhost:5173', 
        'http://localhost:3000',
        'https://comvia-realtime.fly.dev'
    ],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    transports: ['websocket', 'polling']
};

// ======================
// Middleware
// ======================
app.use(cors(corsOptions));

app.use(express.json());

// ======================
// Routes
// ======================
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Socket.IO server is running',
    service: 'comvia-socket',
    version: '1.0.0',
    uptime: process.uptime(),
    connections: io?.engine?.clientsCount || 0
  });
});

// 404 handler
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
    cors: corsOptions,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true
    }
});

// ======================
// Socket Middleware
// ======================
io.use(authenticateSocket);

// ======================
// Socket Handlers
// ======================
const activeUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    
    // Setup all handlers
    setupSocketHandlers(socket, io, activeUsers, userSockets);
    setupPresence(socket, io, activeUsers);
    setupMessageHandlers(socket, io);
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
        
        // Remove user from active users
        const userId = userSockets.get(socket.id);
        if (userId) {
            activeUsers.delete(userId);
            userSockets.delete(socket.id);
            
            // Broadcast user offline
            io.emit('user_offline', { userId });
        }
    });
});

// ======================
// Start Server
// ======================
// Ensure PORT is a number so the overload for server.listen(number, hostname, callback) is used
const PORT: number = Number(process.env.PORT) || 8080;

// ✅ Use PORT from environment exactly as Fly.io provides
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`🌐 WebSocket: ws://0.0.0.0:${PORT}`);
});

// // ✅ Add health check endpoint that Fly.io expects
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'ok',
//     uptime: process.uptime(),
//     connections: io?.engine?.clientsCount || 0
//   });
// });


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  io.close(() => {
    console.log('Socket.IO server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  io.close(() => {
    console.log('Socket.IO server closed');
    process.exit(0);
  });
});

export { app, server, io };
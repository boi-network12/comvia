// realtime/src/handlers/presence.ts
import { Server, Socket } from 'socket.io';

interface PresenceData {
  userId: string;
  name?: string;
  status: 'online' | 'away' | 'offline' | 'typing';
  lastSeen: Date;
  deviceInfo?: string;
  conversationId?: string;
}

export function setupPresence(socket: Socket, io: Server, activeUsers: Map<string, string>) {
  const userId = socket.data.userId || socket.data.user?.id;
  const userName = socket.data.user?.name || 'Visitor';
  
  if (userId) {
    activeUsers.set(userId, socket.id);
    
    // Broadcast user online
    const presenceData: PresenceData = {
      userId,
      name: userName,
      status: 'online',
      lastSeen: new Date(),
      deviceInfo: socket.handshake.headers['user-agent'],
    };

    io.emit('user_online', presenceData);
    console.log(`🟢 User ${userName} (${userId}) is now online`);
  }

  // Handle typing indicator
  socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
    const userId = socket.data.userId || socket.id;
    const userName = socket.data.user?.name || 'Visitor';
    
    socket.to(data.conversationId).emit('user_typing', {
      userId,
      name: userName,
      isTyping: data.isTyping,
      conversationId: data.conversationId,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle presence update
  socket.on('presence_update', (data: { status: 'online' | 'away' }) => {
    try {
      const userId = socket.data.userId || socket.data.user?.id;
      if (!userId) return;

      const presenceData: PresenceData = {
        userId,
        name: socket.data.user?.name || 'Visitor',
        status: data.status,
        lastSeen: new Date(),
        deviceInfo: socket.handshake.headers['user-agent'],
      };

      io.emit('presence_changed', presenceData);
      console.log(`🟡 User ${userId} is now ${data.status}`);
    } catch (error) {
      console.error('❌ Presence update error:', error);
    }
  });

  // Handle getting all online users
  socket.on('get_online_users', (callback?: (users: any[]) => void) => {
    try {
      const onlineUsers: any[] = [];
      
      for (const [userId, socketId] of activeUsers) {
        const sock = io.sockets.sockets.get(socketId);
        if (sock) {
          onlineUsers.push({
            userId,
            name: sock.data.user?.name || 'Anonymous',
            role: sock.data.user?.role || 'visitor',
            socketId: socketId,
            isVisitor: sock.data.isVisitor || false,
          });
        }
      }

      if (callback) {
        callback(onlineUsers);
      }
    } catch (error) {
      console.error('❌ Get online users error:', error);
      if (callback) {
        callback([]);
      }
    }
  });

  // Handle heartbeat
  socket.on('heartbeat', (callback?: () => void) => {
    if (callback) {
      callback();
    }
  });
}
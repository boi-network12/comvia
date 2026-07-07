// realtime/src/handlers/socketHandlers.ts
import { Server, Socket } from 'socket.io';
// import axios from 'axios';
import { trackVisitor } from '../middleware/visitorTracking';

// Add this interface
interface AgentJoinData {
  userId: string;
  name: string;
  role: 'admin' | 'agent';
}

export function setupSocketHandlers(
  socket: Socket,
  io: Server,
  activeUsers: Map<string, string>,
  userSockets: Map<string, string>
) {
  const userId = socket.data.userId || socket.data.user?.id;
  
  // if (userId) {
  //   userSockets.set(socket.id, userId);
  //   activeUsers.set(userId, socket.id);
  // }
  if (userId && !socket.data.isVisitor) {
    userSockets.set(socket.id, userId);
    activeUsers.set(userId, socket.id);
    console.log(`✅ [SOCKET] User ${socket.data.user?.name || userId} added to active users`);
  }

  // ✅ NEW: Handle agents joining the agents room
  // socket.on('join_agents', () => {
  //   // Check if user is an agent or admin
  //   const role = socket.data.user?.role;
  //   if (role === 'admin' || role === 'agent') {
  //     socket.join('agents');
  //     console.log(`👤 Agent joined agents room: ${socket.data.user?.name || socket.id}`);
      
  //     // Notify other agents
  //     socket.to('agents').emit('agent_joined', {
  //       userId: socket.data.user?.id || socket.id,
  //       name: socket.data.user?.name || 'Agent',
  //       timestamp: new Date().toISOString()
  //     });
  //   } else {
  //     console.log(`⚠️ Non-agent tried to join agents room: ${socket.id}`);
  //   }
  // });

  socket.on('join_agents', () => {
    console.log(`👤 [SOCKET] join_agents called by ${socket.id}`);
    console.log(`👤 [SOCKET] isVisitor: ${socket.data.isVisitor}`);
    console.log(`👤 [SOCKET] user:`, socket.data.user);
    
    // ✅ Check if user is authenticated
    const isAgent = socket.data.user && 
                    (socket.data.user.role === 'admin' || socket.data.user.role === 'agent');
    
    if (isAgent) {
      socket.join('agents');
      console.log(`👤 [SOCKET] Agent joined agents room: ${socket.data.user?.name || socket.id}`);
      
      // Notify other agents
      socket.to('agents').emit('agent_joined', {
        userId: socket.data.user?._id || socket.id,
        name: socket.data.user?.name || 'Agent',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`⚠️ [SOCKET] Non-agent tried to join agents room: ${socket.id}`);
      // Send a message back to let them know
      socket.emit('error', { message: 'Only agents can join the agents room' });
    }
  });


  // Handle joining conversation
  socket.on('join_conversation', (conversationId: string) => {
    if (socket.rooms.has(conversationId)) {
      console.log(`📌 Socket ${socket.id} already in conversation ${conversationId}`);
      return;
    }

    socket.join(conversationId);
    console.log(`📌 Socket ${socket.id} joined conversation ${conversationId}`);
    
    // Notify others in the conversation
    socket.to(conversationId).emit('user_joined', {
      userId: socket.data.userId || socket.id,
      userName: socket.data.user?.name || 'Visitor',
      conversationId,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle leaving conversation
  socket.on('leave_conversation', (conversationId: string) => {
    // Check if in room
    if (!socket.rooms.has(conversationId)) {
      console.log(`📌 Socket ${socket.id} not in conversation ${conversationId}`);
      return;
    }
    
    socket.leave(conversationId);
    console.log(`📌 Socket ${socket.id} left conversation ${conversationId}`);
    
    socket.to(conversationId).emit('user_left', {
      userId: socket.data.userId || socket.id,
      conversationId,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle visitor tracking
  socket.on('track_visitor', async (data: any) => {
    const visitorData = {
      visitorId: socket.data.userId || `visitor_${Date.now()}`,
      name: data.name,
      email: data.email,
      page: data.page,
      referrer: data.referrer,
      userAgent: socket.handshake.headers['user-agent'],
      ip: socket.handshake.address,
    };

    const result = await trackVisitor(socket, visitorData);
    
    if (result) {
      socket.emit('visitor_tracked', {
        success: true,
        visitorId: visitorData.visitorId,
      });

      // Notify agents/admins about new visitor
      io.to('agents').emit('new_visitor', {
        visitorId: visitorData.visitorId,
        name: visitorData.name,
        page: visitorData.page,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle agent joining (for agents/admins)
  if (socket.data.user?.role === 'admin' || socket.data.user?.role === 'agent') {
    socket.join('agents');
    console.log(`👤 Agent/Admin joined: ${socket.data.user.name}`);
    
    // Broadcast agent online status
    io.emit('agent_status', {
      agentId: socket.data.user.id,
      name: socket.data.user.name,
      status: 'online',
      timestamp: new Date().toISOString(),
    });
  }

  // Welcome message
  socket.emit('connected', {
    message: 'Connected to Comvia socket server',
    socketId: socket.id,
    userId: userId,
    isVisitor: socket.data.isVisitor || false,
    role: socket.data.user?.role || 'visitor',
    timestamp: new Date().toISOString()
  });

  console.log(`✅ Socket handlers initialized for ${socket.id}${socket.data.isVisitor ? ' (visitor)' : ` (${socket.data.user?.name})`}`);
}
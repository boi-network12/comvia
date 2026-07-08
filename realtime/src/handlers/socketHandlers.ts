// realtime/src/handlers/socketHandlers.ts
import { Server, Socket } from 'socket.io';
import axios from 'axios';
import { trackVisitor } from '../middleware/visitorTracking';


const API_URL = process.env.API_URL || 'https://comvia-backend-endpoint.vercel.app/api';


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

    socket.on('identify_visitor', (data: { visitorId: string; companyId: string; userAgent?: string; url?: string }) => {
    console.log(`👤 [SOCKET] Visitor identified: ${data.visitorId}`);
    
    // Store visitor info on socket
    socket.data.visitorId = data.visitorId;
    socket.data.companyId = data.companyId;
    socket.data.isVisitor = true;
    
    // Join a room for this visitor
    socket.join(`visitor_${data.visitorId}`);
    
    // Also join company room to receive agent messages
    if (data.companyId) {
      socket.join(`company_${data.companyId}`);
    }
    
    // Notify agents
    io.to('agents').emit('visitor_online', {
      visitorId: data.visitorId,
      companyId: data.companyId,
      userAgent: data.userAgent,
      url: data.url,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('send_message', async (data: { 
    conversationId: string; 
    content: string; 
    sender: string; 
    visitorId?: string;
    timestamp?: string;
  }) => {
    console.log(`📨 [SOCKET] Message from visitor:`, data);

    const isVisitor = socket.data.isVisitor || data.sender === 'visitor';
    
    // If visitor is sending, broadcast to agents
    if (isVisitor) {
      // ==================== VISITOR MESSAGE ====================
    console.log(`👤 Visitor message: ${data.content}`);

     try {
        await axios.post(`${API_URL}/widget/visitor/message`, {
          content: data.content,
          sender: 'visitor',
          userId: data.visitorId || socket.data.visitorId,
          timestamp: data.timestamp || new Date().toISOString(),
          companyId: socket.data.companyId
        });
        console.log('✅ Visitor message saved to DB');
      } catch (error) {
        console.error('❌ Failed to save visitor message:', error);
      }
    
      io.to('agents').emit('visitor_message', {
        conversationId: data.conversationId,
        message: {
          _id: `msg_${Date.now()}`,
          content: data.content,
          senderId: data.visitorId || socket.data.visitorId,
          senderType: 'visitor',
          createdAt: data.timestamp || new Date().toISOString(),
          status: 'sent'
        },
        visitorId: data.visitorId || socket.data.visitorId,
        conversation: {
          _id: data.conversationId,
          status: 'open'
        }
      });
      
      // Also send as new_visitor_message
      io.to('agents').emit('new_visitor_message', {
        conversationId: data.conversationId,
        message: {
          _id: `msg_${Date.now()}`,
          content: data.content,
          senderId: data.visitorId || socket.data.visitorId,
          senderType: 'visitor',
          createdAt: data.timestamp || new Date().toISOString(),
          status: 'sent'
        },
        visitorId: data.visitorId || socket.data.visitorId,
        conversation: {
          _id: data.conversationId,
          status: 'open'
        }
      });
      
      // Send confirmation back to visitor
      socket.emit('message_sent', {
        messageId: `msg_${Date.now()}`,
        status: 'sent'
      });
    } 
    else if (socket.data.user && !socket.data.isVisitor) {
      // ==================== AGENT / ADMIN MESSAGE ====================
    console.log(`👤 Agent message from ${socket.data.user.name}: ${data.content}`);

     // ✅ FIRST: Save to database via API
    try {
      await axios.post(`${API_URL}/messages`, {
        conversationId: data.conversationId,
        content: data.content,
        type: 'text'
      }, {
        headers: {
          'Authorization': `Bearer ${socket.handshake.auth.token}`
        }
      });
      console.log('✅ Agent message saved to DB');
    } catch (error) {
      console.error('❌ Failed to save agent message:', error);
    }

     const agentMessage = {
      _id: `msg_${Date.now()}`,
        conversationId: data.conversationId,
        content: data.content,
        senderId: socket.data.userId || socket.data.user._id,
        senderType: 'agent',
        senderName: socket.data.user.name || 'Agent',
        createdAt: new Date().toISOString(),
        status: 'sent'
      };

      // Broadcast to everyone in the conversation room (including other agents)
      io.to(data.conversationId).emit('new_message', agentMessage);
      io.to(data.conversationId).emit('agent_message', {
        content: data.content,
        conversationId: data.conversationId,
        senderId: socket.data.userId || socket.data.user._id,
        senderName: socket.data.user.name || 'Agent'
      });

      // ✅ Also broadcast to agents room
      io.to('agents').emit('new_message', agentMessage);

       // ✅ CRITICAL: Find and send to visitor's personal room
      const visitorId = data.visitorId || socket.data.visitorId;
      if (visitorId) {
        io.to(`visitor_${visitorId}`).emit('new_message', agentMessage);
        io.to(`visitor_${visitorId}`).emit('agent_message', {
          content: data.content,
          conversationId: data.conversationId,
          senderId: socket.data.userId || socket.data.user._id,
          senderName: socket.data.user.name || 'Agent'
        });
        console.log(`✅ Agent message sent to visitor room: visitor_${visitorId}`);
      }

      // Also send confirmation back to the sender
      socket.emit('message_sent', agentMessage);

      console.log(`✅ Agent message broadcasted to room: ${data.conversationId}`);
    } else {
      console.warn(`⚠️ Unknown sender type for message`);
      socket.emit('error', { message: 'Could not process message' });
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
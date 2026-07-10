// realtime/src/handlers/socketHandlers.ts
import { Server, Socket } from 'socket.io';
import axios from 'axios';
import { trackVisitor } from '../middleware/visitorTracking';
import { API_URL } from '../config/baseApi';


export function setupSocketHandlers(
  socket: Socket,
  io: Server,
  activeUsers: Map<string, string>,
  userSockets: Map<string, string>
) {
  const userId = socket.data.userId || socket.data.user?.id;
  const visitorConnections = new Map<string, string>(); 
  
  // Track authenticated users (not visitors)
  if (userId && !socket.data.isVisitor) {
    userSockets.set(socket.id, userId);
    activeUsers.set(userId, socket.id);
    console.log(`✅ [SOCKET] User ${socket.data.user?.name || userId} added to active users`);
  }

  // ============================================================
  // 1. AGENTS ROOM - Join to receive visitor messages
  // ============================================================
  socket.on('join_agents', () => {
    console.log(`👤 [SOCKET] join_agents called by ${socket.id}`);
    
    const isAgent = socket.data.user && 
                    (socket.data.user.role === 'admin' || socket.data.user.role === 'agent');
    
    if (isAgent) {
      socket.join('agents');
      console.log(`👤 [SOCKET] Agent joined agents room: ${socket.data.user?.name || socket.id}`);
      
      socket.to('agents').emit('agent_joined', {
        userId: socket.data.user?._id || socket.id,
        name: socket.data.user?.name || 'Agent',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`⚠️ [SOCKET] Non-agent tried to join agents room: ${socket.id}`);
      socket.emit('error', { message: 'Only agents can join the agents room' });
    }
  });

  // ============================================================
  // 2. VISITOR IDENTIFICATION
  // ============================================================
  socket.on('identify_visitor', (data: { 
    visitorId: string; 
    companyId: string; 
    userAgent?: string; 
    url?: string ,
    conversationId?: string,
      location?: {
      countryCode?: string;
      flag?: string;
      country?: string;
    }
  }) => {
    console.log(`👤 [SOCKET] Visitor identified: ${data.visitorId}`);

     // ✅ Check if this visitor already has an active connection
    const existingSocketId = visitorConnections.get(data.visitorId);
    if (existingSocketId && existingSocketId !== socket.id) {
      console.log(`⚠️ [SOCKET] Visitor ${data.visitorId} already has active connection: ${existingSocketId}`);
      
      // ✅ Disconnect the old socket
      const oldSocket = io.sockets.sockets.get(existingSocketId);
      if (oldSocket) {
        console.log(`🔌 [SOCKET] Disconnecting old visitor socket: ${existingSocketId}`);
        oldSocket.emit('duplicate_connection', { 
          message: 'Another connection was opened for this visitor' 
        });
        oldSocket.disconnect(true);
      }
      visitorConnections.delete(data.visitorId);
    }

    // ✅ Store location data on socket
    if (data.location) {
      socket.data.visitorCountryCode = data.location.countryCode || '';
      socket.data.visitorFlag = data.location.flag || '🌍';
      socket.data.visitorCountry = data.location.country || '';
    }
    
    // ✅ Store this connection
    visitorConnections.set(data.visitorId, socket.id);
    
    socket.data.visitorId = data.visitorId;
    socket.data.companyId = data.companyId;
    socket.data.isVisitor = true;
    
    socket.join(`visitor_${data.visitorId}`);
    console.log(`📌 [SOCKET] Visitor joined room: ${data.visitorId}`);
    
    if (data.companyId) {
      socket.join(`company_${data.companyId}`);
    }

    // Also join the conversation room if we have one
    if (data.conversationId) {
      socket.join(data.conversationId);
      console.log(`📌 [SOCKET] Visitor joined conversation: ${data.conversationId}`);
    }
    
    io.to('agents').emit('visitor_online', {
      visitorId: data.visitorId,
      companyId: data.companyId,
      userAgent: data.userAgent,
      url: data.url,
      location: {
        countryCode: socket.data.visitorCountryCode,
        flag: socket.data.visitorFlag,
        country: socket.data.visitorCountry,
      },
      timestamp: new Date().toISOString()
    });
  });

  // ============================================================
  // 3. CONVERSATION ROOMS - Join/Leave
  // ============================================================
  socket.on('join_conversation', (conversationId: string) => {
    if (!conversationId) {
      console.log(`⚠️ [SOCKET] join_conversation called without ID`);
      return;
    }
    
    if (socket.rooms.has(conversationId)) {
      console.log(`📌 Socket ${socket.id} already in conversation ${conversationId}`);
      return;
    }

    socket.join(conversationId);
    console.log(`📌 Socket ${socket.id} joined conversation ${conversationId}`);
    
    socket.to(conversationId).emit('user_joined', {
      userId: socket.data.userId || socket.id,
      userName: socket.data.user?.name || 'Visitor',
      conversationId,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('leave_conversation', (conversationId: string) => {
    if (!conversationId || !socket.rooms.has(conversationId)) {
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

  // ============================================================
  // 4. SEND MESSAGE - The MAIN handler
  // ============================================================
  socket.on('send_message', async (data: { 
    conversationId: string; 
    content: string; 
    sender: string; 
    visitorId?: string;
    timestamp?: string;
    location?: {  // ✅ Add location to the data
      countryCode?: string;
      countryFlag?: string;
    }
  }) => {

    console.log(`📨 [SOCKET] Message from:`, data);

    if (!data.conversationId) {
      socket.emit('error', { message: 'Missing conversation ID' });
      return;
    }

    if (!data.content || data.content.trim() === '') {
      socket.emit('error', { message: 'Empty message' });
      return;
    }

    const isVisitor = socket.data.isVisitor || data.sender === 'visitor';

    // ==================== VISITOR MESSAGE ====================
    if (isVisitor) {
      console.log(`👤 Visitor message: ${data.content}`);

      try {
        const response = await axios.post(`${API_URL}/widget/visitor/message`, {
          content: data.content,
          sender: 'visitor',
          userId: data.visitorId || socket.data.visitorId,
          timestamp: data.timestamp || new Date().toISOString(),
          companyId: socket.data.companyId,
          location: {
          countryCode: socket.data.visitorCountryCode || data.location?.countryCode || '',
          countryFlag: socket.data.visitorFlag || data.location?.countryFlag || '🌍',
        }
        });

        console.log('✅ Visitor message saved to DB with location:', {
          countryCode: socket.data.visitorCountryCode,
          countryFlag: socket.data.visitorFlag,
          countryName: socket.data.visitorCountry,
        });

        const realConversationId = response.data.data?.conversationId || data.conversationId;
        const realMessageId = response.data.data?.messageId || `msg_${Date.now()}`;

        const messagePayload = {
          conversationId: realConversationId,
          message: {
            _id: realMessageId,
            content: data.content,
            senderId: data.visitorId || socket.data.visitorId,
            senderType: 'visitor' as const,
            createdAt: new Date().toISOString(),
            status: 'sent' as const
          },
          visitorId: data.visitorId || socket.data.visitorId,
          conversation: { _id: realConversationId, status: 'open' }
        };

        io.to('agents').emit('visitor_message', messagePayload);
        io.to('agents').emit('new_visitor_message', messagePayload);

        socket.emit('message_sent', {
          messageId: realMessageId,
          status: 'sent',
          conversationId: realConversationId
        });
      } catch (error) {
        console.error('❌ Failed to save visitor message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
      return;
    } 

  // ==================== AGENT / ADMIN MESSAGE ====================
  else if (socket.data.user && !socket.data.isVisitor) {
    
    let token = socket.data.authToken 
          || socket.handshake.auth.token 
          || socket.handshake.headers.authorization 
          || socket.handshake.headers.Authorization;
    
    if (token && typeof token === 'string') {
      token = token.replace('Bearer ', '').trim();
    }
    
    console.log("🔑 Token extracted (length):", token ? token.length : 0);
    console.log("📡 API_URL:", API_URL);

    if (!token) {
      console.error("❌ NO TOKEN");
      socket.emit('error', { message: 'No token' });
      return;
    }

    const conversationId = data.conversationId;

    console.log("🔥🔥🔥 AGENT SENDING MESSAGE 🔥🔥🔥");
    console.log("Token exists:", !!token);
    console.log("ConversationId:", conversationId);
    console.log("Content:", data.content);

    let savedMessage = null;

    try {
      console.log(`📤 Sending to: ${API_URL}/messages`);
      
      const response = await axios.post(
        `${API_URL}/messages`,
        {
          conversationId,
          content: data.content,
          type: 'text'
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      console.log("✅ API SUCCESS:", response.status);

      if (response.data?.success) {
        savedMessage = response.data.data;
        console.log('✅ Agent message SAVED to DB:', savedMessage._id);
      }
    } catch (err: any) {
      console.error("❌ API FAILED:", err.message);
      // Continue - we still want to broadcast
    }

    // ✅ BUILD MESSAGE
    const agentMessage = {
      _id: savedMessage?._id || `msg_${Date.now()}`,
      conversationId,
      content: data.content,
      senderId: socket.data.userId || socket.data.user._id,
      senderType: 'agent',
      senderName: socket.data.user.name || 'Agent',
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    // ✅ BROADCAST TO EVERYONE

    // 1. Conversation room (for agents in same room)
    io.to(conversationId).emit('new_message', agentMessage);
    io.to(conversationId).emit('agent_message', {
      content: data.content,
      conversationId: conversationId,
      senderId: socket.data.userId,
      senderName: socket.data.user.name || 'Agent'
    });
    console.log(`📤 Sent to conversation room: ${conversationId}`);

    // 2. Agents room (all agents)
    io.to('agents').emit('new_message', agentMessage);
    io.to('agents').emit('agent_message', {
      content: data.content,
      conversationId: conversationId,
      senderId: socket.data.userId,
      senderName: socket.data.user.name || 'Agent'
    });
    console.log(`📤 Sent to agents room`);

    // 3. 🔥🔥🔥 VISITOR'S PERSONAL ROOM - THIS IS THE FIX!
    const visitorId = data.visitorId || socket.data.visitorId;
    if (visitorId) {
      const visitorRoom = visitorId;
      console.log(`📤 Broadcasting to visitor room: ${visitorRoom}`);
      
      // Send both event types to ensure widget receives it
      io.to(visitorRoom).emit('new_message', agentMessage);
      io.to(visitorRoom).emit('agent_message', {
        content: data.content,
        conversationId: conversationId,
        senderId: socket.data.userId,
        senderName: socket.data.user.name || 'Agent'
      });
    } else {
      console.log(`⚠️ No visitorId found - trying to find from socket rooms`);
      // Check if socket is in any visitor room
      const rooms = Array.from(socket.rooms);
      const visitorRoom = rooms.find(r => r.startsWith('visitor_'));
      if (visitorRoom) {
        console.log(`📤 Found visitor room from socket: ${visitorRoom}`);
        io.to(visitorRoom).emit('new_message', agentMessage);
        io.to(visitorRoom).emit('agent_message', {
          content: data.content,
          conversationId: conversationId,
          senderId: socket.data.userId,
          senderName: socket.data.user.name || 'Agent'
        });
      }
    }

    // 4. Send confirmation back to sender
    socket.emit('message_sent', agentMessage);
    console.log(`✅ Message broadcasted successfully`);
  }
    else {
      console.warn(`⚠️ Unknown sender type for message`);
      socket.emit('error', { message: 'Could not process message' });
    }
  });

  // ============================================================
  // 5. VISITOR TRACKING
  // ============================================================
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

      io.to('agents').emit('new_visitor', {
        visitorId: visitorData.visitorId,
        name: visitorData.name,
        page: visitorData.page,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // ============================================================
  // 6. AUTO-JOIN AGENTS ROOM (for authenticated agents)
  // ============================================================
  if (socket.data.user?.role === 'admin' || socket.data.user?.role === 'agent') {
    socket.join('agents');
    console.log(`👤 Agent/Admin auto-joined: ${socket.data.user.name}`);
    
    io.emit('agent_status', {
      agentId: socket.data.user._id || socket.id,
      name: socket.data.user.name,
      status: 'online',
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================================
  // 7. WELCOME MESSAGE
  // ============================================================
  socket.emit('connected', {
    message: 'Connected to Comvia socket server',
    socketId: socket.id,
    userId: userId,
    isVisitor: socket.data.isVisitor || false,
    role: socket.data.user?.role || 'visitor',
    timestamp: new Date().toISOString()
  });

  // In the disconnect handler, clean up the visitor connection
  socket.on('disconnect', () => {
    const visitorId = socket.data.visitorId;
    if (visitorId && visitorConnections.get(visitorId) === socket.id) {
      visitorConnections.delete(visitorId);
      console.log(`🧹 [SOCKET] Removed visitor connection: ${visitorId}`);
    }
  });

  console.log(`✅ Socket handlers initialized for ${socket.id}${socket.data.isVisitor ? ' (visitor)' : ` (${socket.data.user?.name})`}`);
}
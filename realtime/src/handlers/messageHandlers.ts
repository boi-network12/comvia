// realtime/src/handlers/messageHandlers.ts
import { Server, Socket } from 'socket.io';
import axios from 'axios';
import { API_URL } from '../config/baseApi';

interface MessageData {
  content: string;
  sender: 'user' | 'agent' | 'visitor';
  conversationId?: string;
  recipientId?: string;
  timestamp?: string;
  type?: 'text' | 'image' | 'file' | 'system';
}

interface SendMessageResponse {
  success: boolean;
  data?: {
    id: string;
    content: string;
    sender: string;
    conversationId: string;
    createdAt: string;
  };
  message?: string;
}

export function setupMessageHandlers(socket: Socket, io: Server) {
  // Handle sending messages
  socket.on('send_message', async (data: MessageData, callback?: (response: SendMessageResponse) => void) => {
    try {
      console.log(`📨 Message from ${socket.id}:`, data);

      const userId = socket.data.userId || socket.data.user?.id;
      const isVisitor = socket.data.isVisitor;

      // For visitors, we need to track them differently
      if (isVisitor) {
  // ✅ REJECT if no conversation ID
  if (!data.conversationId) {
    if (callback) {
      callback({
        success: false,
        message: 'Missing conversation ID'
      });
    }
    return;
  }

  try {
    // ✅ SAVE TO DATABASE FIRST
    const response = await axios.post(
      `${API_URL}/widget/visitor/message`,
      {
        content: data.content,
        sender: 'visitor',
        userId: socket.data.userId,
        conversationId: data.conversationId,
        companyId: socket.data.companyId
      }
    );
    
    if (response.data?.success) {
      // ✅ USE THE REAL DATA FROM THE API
      const savedMessage = {
        id: response.data.data.messageId,
        content: data.content,
        sender: 'visitor',
        conversationId: response.data.data.conversationId,
        visitorId: socket.data.userId,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      io.to('agents').emit('visitor_message', savedMessage);
      
      if (callback) {
        callback({
          success: true,
          data: savedMessage
        });
      }
    }
  } catch (error) {
    console.error('❌ Failed to save message:', error);
    if (callback) {
      callback({
        success: false,
        message: 'Failed to save message'
      });
    }
  }
  return;
}

      // For authenticated users, save to database via API
      const conversationId = data.conversationId;
      if (!conversationId) {
        throw new Error('Missing conversation ID');
      }

      try {
        // ✅ CORRECT: POST /api/messages
        const response = await axios.post(
          `${API_URL}/messages`,
          {
            conversationId: conversationId,
            content: data.content,
            type: data.type || 'text'
          },
          {
            headers: {
              'Authorization': `Bearer ${socket.handshake.auth.token}`
            },
            timeout: 5000
          }
        );

        if (response.data?.success) {
          const savedMessage = response.data.data;

          // Broadcast to others in the conversation
          socket.broadcast.to(conversationId).emit('new_message', savedMessage);
          
          // Emit back to sender
          socket.emit('message_sent', savedMessage);

          if (callback) {
            callback({
              success: true,
              data: savedMessage
            });
          }
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (apiError: any) {
        console.error('❌ Failed to save message:', apiError.message);
        
        // Final fallback: store in memory
        const fallbackMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          content: data.content,
          sender: data.sender || 'user',
          conversationId: data.conversationId || 'temp',
          createdAt: new Date().toISOString()
        };

        socket.emit('message_sent', fallbackMessage);

        if (callback) {
          callback({
            success: true,
            data: fallbackMessage,
            message: 'Message saved locally (API unavailable)'
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Message handler error:', error.message);
      
      if (callback) {
        callback({
          success: false,
          message: error.message || 'Failed to send message'
        });
      }
    }
  });

  // Handle typing indicator
  socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
    try {
      socket.broadcast.to(data.conversationId).emit('user_typing', {
        userId: socket.data.userId || socket.id,
        isTyping: data.isTyping
      });
    } catch (error) {
      console.error('❌ Typing handler error:', error);
    }
  });

  // Handle message read receipt
  socket.on('mark_read', async (data: { conversationId: string; messageId: string }) => {
    try {
      const userId = socket.data.userId || socket.data.user?.id;
      
      if (!userId) return;

      // ✅ CORRECT: POST /api/conversations/:id/read
      try {
        await axios.post(
          `${API_URL}/conversations/${data.conversationId}/read`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${socket.handshake.auth.token}`
            }
          }
        );
      } catch (error) {
        console.log('Failed to mark message as read:', error);
      }

      socket.broadcast.to(data.conversationId).emit('message_read', {
        conversationId: data.conversationId,
        messageId: data.messageId,
        readBy: userId
      });
    } catch (error) {
      console.error('❌ Mark read handler error:', error);
    }
  });

  // ✅ FIXED: Handle getting chat history
  socket.on('get_history', async (data: { conversationId: string; limit?: number }, callback?: (response: any) => void) => {
    try {
      const userId = socket.data.userId || socket.data.user?.id;
      
      if (!userId) {
        if (callback) {
          callback({ success: false, message: 'User not authenticated' });
        }
        return;
      }

      // ✅ CORRECT: GET /api/messages/:conversationId
      const response = await axios.get(
        `${API_URL}/messages/${data.conversationId}`,
        {
          params: { limit: data.limit || 50 },
          headers: {
            'Authorization': `Bearer ${socket.handshake.auth.token}`
          }
        }
      );

      if (callback) {
        callback({
          success: true,
          data: response.data.data || []
        });
      }
    } catch (error: any) {
      console.error('❌ Get history error:', error.message);
      
      if (callback) {
        callback({
          success: false,
          message: error.message || 'Failed to get chat history'
        });
      }
    }
  });

  // Join conversation room
  socket.on('join_conversation', (conversationId: string) => {
    try {
      if (socket.rooms.has(conversationId)) {
        console.log(`📌 Socket ${socket.id} already in conversation ${conversationId}`);
        return;
      }
      
      socket.join(conversationId);
      console.log(`📌 Socket ${socket.id} joined conversation ${conversationId}`);
      
      socket.to(conversationId).emit('user_joined', {
        userId: socket.data.userId || socket.id,
        conversationId
      });
    } catch (error) {
      console.error('❌ Join conversation error:', error);
    }
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId: string) => {
    try {
      if (!socket.rooms.has(conversationId)) {
        console.log(`📌 Socket ${socket.id} not in conversation ${conversationId}`);
        return;
      }
      
      socket.leave(conversationId);
      console.log(`📌 Socket ${socket.id} left conversation ${conversationId}`);
      
      socket.to(conversationId).emit('user_left', {
        userId: socket.data.userId || socket.id,
        conversationId
      });
    } catch (error) {
      console.error('❌ Leave conversation error:', error);
    }
  });
}
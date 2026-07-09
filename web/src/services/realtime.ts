// web/services/realtime.ts
import { io, Socket } from "socket.io-client";
import { Message } from "./conversations";


interface VisitorMessageData {
  conversationId: string;
  message: Message;
  visitorId: string;
  conversation: {
    _id: string;
    status: string;
  };
}

// type MessageHandler = (message: Message) => void;
type VisitorMessageHandler = (data: VisitorMessageData) => void;
// type ConnectionCallback = (connected: boolean) => void;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://comvia-realtime.fly.dev';

class RealtimeService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];
  private visitorMessageHandlers: VisitorMessageHandler[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): Socket | null {
    if (this.socket?.connected) {
      // console.log('🟢 Already connected to realtime');
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // console.log('🔄 Connecting to realtime server...');

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      // console.log('🟢 Realtime connected');
      this.reconnectAttempts = 0;
      this.notifyConnectionCallbacks(true);

      // 🔥 Join agents room to receive visitor messages
      this.socket?.emit('join_agents');
    });

    // 2. When reconnected after disconnect - join agents again
    this.socket.on('reconnect', (attemptNumber) => {
      // console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.socket?.emit('join_agents');
    });

    this.socket.on('disconnect', (reason) => {
      // console.log('🔴 Realtime disconnected:', reason);
      this.notifyConnectionCallbacks(false);

      // If server kicked us, try to reconnect
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Realtime connection error:', error.message);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        // console.log('⚠️ Max reconnect attempts reached');
      }
    });

    // this.socket.on('visitor_message', (data: Message) => {
    //   // console.log('📨 Visitor message received:', data);
    //   this.messageHandlers.forEach(handler => handler(data));
    // });
     // 🔥 Listen for visitor messages
    this.socket.on('visitor_message', (data: VisitorMessageData) => {
      // console.log('📨 [WEB] Visitor message received:', data);
      this.visitorMessageHandlers.forEach(handler => handler(data));
      
      if (data.message) {
        this.messageHandlers.forEach(handler => handler(data.message));
      }
    });

     // 🔥 Listen for new visitor message event
    this.socket.on('new_visitor_message', (data: VisitorMessageData) => {
      // console.log('📨 [WEB] New visitor message event:', data);
      this.visitorMessageHandlers.forEach(handler => handler(data));
    });

    this.socket.on('new_message', (data: Message) => {
      // console.log('📨 New message received:', data);
      this.messageHandlers.forEach(handler => handler(data));
    });

    this.socket.on('message_sent', (data: Message) => {
      // console.log('✅ Message sent confirmation:', data);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.messageHandlers = [];
      this.visitorMessageHandlers = [];
      this.connectionCallbacks = [];
      // console.log('🔌 Realtime disconnected manually');
    }
  }

  onMessage(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  // 🔥 NEW: Register visitor message handler
  onVisitorMessage(handler: VisitorMessageHandler): () => void {
    this.visitorMessageHandlers.push(handler);
    return () => {
      this.visitorMessageHandlers = this.visitorMessageHandlers.filter(h => h !== handler);
    };
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(cb => cb(connected));
  }

  sendMessage(conversationId: string, content: string, visitorId?: string) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot send message: socket not connected');
      return false;
    }
    this.socket.emit('send_message', { 
      conversationId, 
      content, 
      sender: 'agent',
      timestamp: new Date().toISOString(),
      visitorId: visitorId
    });
    return true;
  }

  joinConversation(conversationId: string) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot join conversation: socket not connected');
      return;
    }
    this.socket.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string) {
    if (!this.socket?.connected) {
      return;
    }
    this.socket.emit('leave_conversation', conversationId);
  }

  sendTyping(conversationId: string, isTyping: boolean) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing', { conversationId, isTyping });
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const realtimeService = new RealtimeService();
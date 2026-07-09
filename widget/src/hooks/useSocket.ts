
// widget/src/hooks/useSocket.ts

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

// ============================================================
// TYPES
// ============================================================

interface UseSocketOptions {
  socketUrl?: string;
  visitorId?: string;
  companyId?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: Message) => void;
  onAgentMessage?: (data: { content: string; conversationId: string; senderId: string }) => void;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (conversationId: string, content: string) => boolean;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  reconnectAttempts: number;
}

const getSocketUrl = () => {
  const windowConfig = (window as any).comviaSettings || {};
  return windowConfig.socketUrl || import.meta.env.VITE_SOCKET_URL || 'https://comvia-realtime.fly.dev';
};

// ✅ SINGLE GLOBAL SOCKET INSTANCE
let globalSocket: Socket | null = null;
let globalSocketConnected = false;
let globalListenerRegistered = false;
let globalVisitorId: string | null = null;

// ✅ Store callbacks globally
let globalCallbacks: {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: Message) => void;
  onAgentMessage?: (data: { content: string; conversationId: string; senderId: string }) => void;
} = {};

// ============================================================
// HOOK
// ============================================================

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(globalSocketConnected);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const visitorIdRef = useRef<string>(
    options.visitorId || localStorage.getItem('comvia_visitor_id') || ''
  );
  
  const socketRef = useRef<Socket | null>(globalSocket);
  const isConnectingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  // ✅ Update global callbacks when options change
  useEffect(() => {
    globalCallbacks = {
      onConnect: options.onConnect,
      onDisconnect: options.onDisconnect,
      onMessage: options.onMessage,
      onAgentMessage: options.onAgentMessage,
    };
  }, [options.onConnect, options.onDisconnect, options.onMessage, options.onAgentMessage]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      // Don't disconnect - let the global socket live
    };
  }, []);

  const disconnect = useCallback(() => {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
      globalSocketConnected = false;
      globalVisitorId = null;
      globalListenerRegistered = false;
    }
    socketRef.current = null;
    setIsConnected(false);
    isConnectingRef.current = false;
    console.log('🔌 [Widget] Disconnected');
  }, []);

  const connect = useCallback(() => {
    // ✅ If already connected globally, just update state
    if (globalSocketConnected && globalSocket) {
      console.log('🟢 [Widget] Already connected globally');
      setIsConnected(true);
      socketRef.current = globalSocket;
      return;
    }

    // If connection is in progress, return
    if (isConnectingRef.current) {
      console.log('⏳ [Widget] Connection already in progress');
      return;
    }

    const visitorId = visitorIdRef.current;
    if (!visitorId) {
      console.error('❌ [Widget] Cannot connect: No visitor ID');
      setError('No visitor ID');
      return;
    }

    // ✅ If same visitor ID, reuse existing socket
    if (globalVisitorId === visitorId && globalSocket) {
      console.log(`♻️ [Widget] Reusing existing socket for ${visitorId}`);
      socketRef.current = globalSocket;
      setIsConnected(globalSocketConnected);
      return;
    }

    // Clean up existing socket if different visitor
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
      globalSocketConnected = false;
      globalListenerRegistered = false;
    }

    const socketUrl = options.socketUrl || getSocketUrl();
    const companyId = options.companyId || (window as any).comviaSettings?.companyId;

    console.log(`🔌 [Widget] Creating new socket connection for ${visitorId}`);
    isConnectingRef.current = true;
    globalVisitorId = visitorId;

    // Create socket
    const socket = io(socketUrl, {
      query: {
        visitorId: visitorId,
        companyId: companyId || '',
        type: 'visitor'
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    globalSocket = socket;
    socketRef.current = socket;

    // ✅ Set up event listeners ONCE globally
    if (!globalListenerRegistered) {
      globalListenerRegistered = true;

      // Connection events
      socket.on('connect', () => {
        console.log('🟢 [Widget] Socket connected!');
        globalSocketConnected = true;
        setIsConnected(true);
        isConnectingRef.current = false;
        setError(null);
        setReconnectAttempts(0);
        
        // Identify as visitor
        socket.emit('identify_visitor', {
          visitorId: visitorId,
          companyId: companyId,
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
        
        // Join conversation if we have one
        const conversationId = localStorage.getItem('comvia_conversation_id');
        if (conversationId) {
          socket.emit('join_conversation', conversationId);
          console.log(`📌 [Widget] Joined conversation: ${conversationId}`);
        }
        
        if (globalCallbacks.onConnect) globalCallbacks.onConnect();
      });

      socket.on('connect_error', (err: Error) => {
        console.error('❌ [Widget] Connection error:', err.message);
        setError(err.message);
        isConnectingRef.current = false;
        setReconnectAttempts(prev => prev + 1);
      });

      socket.on('disconnect', (reason: string) => {
        console.log(`🔴 [Widget] Disconnected: ${reason}`);
        globalSocketConnected = false;
        setIsConnected(false);
        isConnectingRef.current = false;
        
        if (globalCallbacks.onDisconnect) globalCallbacks.onDisconnect();
      });

      // ✅ Message handlers
      socket.on('agent_message', (data: { content: string; conversationId: string; senderId: string }) => {
        console.log('📨 [Widget] Agent message:', data);
        if (globalCallbacks.onAgentMessage) {
          globalCallbacks.onAgentMessage(data);
        }
      });

      socket.on('new_message', (message: any) => {
        console.log('📨 [Widget] New message:', message);
        
        // ✅ Skip if this is from the visitor themselves
        if (message.senderId === visitorId) {
          console.log('⏭️ [Widget] Skipping own message');
          return;
        }
        
        const isAgent = message.senderType === 'agent' || 
                      message.senderType === 'admin' ||
                      message.sender === 'agent' || 
                      message.sender === 'admin';
        
        const isSystem = message.senderType === 'system' || message.sender === 'system';
        
        // ✅ Trigger agent message callback if from agent
        if (isAgent && globalCallbacks.onAgentMessage) {
          globalCallbacks.onAgentMessage({
            content: message.content,
            conversationId: message.conversationId || message.id,
            senderId: message.senderId || message._id || 'agent'
          });
        }
        
        // ✅ Trigger general message callback
        if (globalCallbacks.onMessage) {
          globalCallbacks.onMessage({
            id: message._id || message.id || Date.now().toString(),
            content: message.content || message.message || '',
            sender: isAgent ? 'agent' : 
                    isSystem ? 'bot' : 
                    message.senderType === 'visitor' ? 'user' : 
                    message.sender || 'bot',
            timestamp: new Date(message.createdAt || message.timestamp || Date.now()),
            status: message.status || 'delivered'
          });
        }
      });

      socket.on('message_sent', (data: { messageId: string; status: string }) => {
        console.log('✅ [Widget] Message sent:', data);
      });

      socket.on('reconnect', () => {
        console.log('🔄 [Widget] Reconnected');
        globalSocketConnected = true;
        setIsConnected(true);
        setError(null);
        isConnectingRef.current = false;
        
        // Re-identify
        socket.emit('identify_visitor', {
          visitorId: visitorId,
          companyId: companyId,
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
        
        const conversationId = localStorage.getItem('comvia_conversation_id');
        if (conversationId) {
          socket.emit('join_conversation', conversationId);
        }
      });
    }

    // Connection timeout
    const timeoutId = setTimeout(() => {
      if (isConnectingRef.current && mountedRef.current) {
        console.log('⏰ [Widget] Connection timeout');
        isConnectingRef.current = false;
        setError('Connection timeout');
        socket.disconnect();
      }
    }, 15000);

    // Clean up timeout on connect
    socket.once('connect', () => {
      clearTimeout(timeoutId);
    });

  }, []);

  const sendMessage = useCallback((conversationId: string, content: string): boolean => {
    if (!globalSocket?.connected) {
      console.warn('⚠️ [Widget] Cannot send message: not connected');
      return false;
    }
    
    globalSocket.emit('send_message', {
      conversationId,
      content,
      sender: 'visitor',
      visitorId: visitorIdRef.current,
      timestamp: new Date().toISOString(),
    });
    
    return true;
  }, []);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!globalSocket?.connected) return;
    globalSocket.emit('typing', {
      conversationId,
      isTyping,
      sender: 'visitor',
    });
  }, []);

  // Auto-connect once on mount
  useEffect(() => {
    if (visitorIdRef.current) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          connect();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [connect]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    reconnectAttempts,
  };
}
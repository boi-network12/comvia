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
  onAgentMessage?: (data: { content: string; conversationId: string }) => void;
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

// ============================================================
// HOOK
// ============================================================

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const visitorIdRef = useRef<string>(
    options.visitorId || localStorage.getItem('comvia_visitor_id')
  );
  
  const socketRef = useRef<Socket | null>(null);
  // const isMounted = useRef<boolean>(true);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxReconnectAttempts = 10;
  const isConnectingRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (!visitorIdRef.current) {
      console.error('❌ [Widget] No visitor ID available! Make sure widget.tsx initializes it.');
    }
  }, []);

  const connect = useCallback(() => {
    // ✅ PREVENT multiple connections
    if (isConnectingRef.current) {
      console.log('⏳ [Widget] Connection already in progress, skipping...');
      return;
    }


    // If already connected or connecting, return
    if (socketRef.current?.connected) {
      console.log('🟢 [Widget] Already connected to socket');
      return;
    }

     isConnectingRef.current = true;

    // Clean up existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socketUrl = options.socketUrl || getSocketUrl();
    const visitorId = visitorIdRef.current;

    const companyId = options.companyId || (window as any).comviaSettings?.companyId;

    console.log(`🔌 [Widget] Connecting to socket: ${socketUrl}`);
    console.log(`👤 [Widget] Visitor ID: ${visitorId}, Company: ${companyId}`);

    // ✅ Create socket connection for visitor
    const socket = io(socketUrl, {
      query: {
        visitorId: visitorId,
        companyId: companyId || '',
        type: 'visitor'
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    // ✅ Connection events
    socket.on('connect', () => {
      console.log('🟢 [Widget] Socket connected successfully!');
      setIsConnected(true);
      isConnectingRef.current = false; 
      setError(null);
      setReconnectAttempts(0);
      
      // ✅ Identify as visitor
      socket.emit('identify_visitor', {
        visitorId: visitorId,
        companyId: companyId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      // Callback
      if (options.onConnect) options.onConnect();
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔴 [Widget] Socket disconnected: ${reason}`);
      setIsConnected(false);
      
      if (options.onDisconnect) options.onDisconnect();
    });

    socket.on('connect_error', (err) => {
      console.error('❌ [Widget] Socket connection error:', err.message);
      setError(err.message);
      isConnectingRef.current = false; 
      setReconnectAttempts(prev => prev + 1);
    });

    // ✅ Listen for agent replies
    socket.on('agent_message', (data: { content: string; conversationId: string; senderId: string }) => {
      console.log('📨 [Widget] Agent message received:', data);
      
      if (options.onAgentMessage) {
        options.onAgentMessage(data);
      }
    });

    // ✅ Listen for new messages (from agents or system)
    socket.on('new_message', (message: Message) => {
      console.log('📨 [Widget] New message received:', message);
      
      if (options.onMessage) {
        options.onMessage(message);
      }
    });

    // ✅ Listen for visitor message confirmation
    socket.on('message_sent', (data: { messageId: string; status: string }) => {
      console.log('✅ [Widget] Message sent confirmation:', data);
    });

    // ✅ Listen for typing indicator
    socket.on('agent_typing', (data: { conversationId: string; isTyping: boolean }) => {
      // You can use this to show typing indicator
      console.log('✏️ [Widget] Agent typing:', data);
    });

    socket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
    // You can use this to show typing indicator
    console.log('✏️ [Widget] User typing:', data);
    // If you want to show typing indicator in UI, you can add it here
  });

    // Error handling
    socket.on('error', (err) => {
      console.error('❌ [Widget] Socket error:', err);
      setError(typeof err === 'string' ? err : err.message || 'Socket error');
    });

  }, [options]);

  const disconnect = useCallback(() => {
    // Clear reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (!socketRef.current) {
      return;
    }

    const socket = socketRef.current;

    // ✅ Check if the underlying transport exists and its readyState
    const transport = (socket as any)?.io?.engine?.transport;
    const isConnecting = transport?.readyState === 'connecting' || 
                          transport?.readyState === 0 ||
                          !transport;
    
    // ✅ FIX: Check the readyState before trying to close
    // 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED
    if (isConnecting) {
      // Socket is still connecting - wait for it to open then close
      console.log('⏳ [Widget] Socket is connecting, waiting to close...');
      
      // Remove existing listeners to prevent duplicates
      socket.off('connect');
      socket.off('disconnect');
      
      // When it connects, immediately disconnect
      socket.once('connect', () => {
        console.log('🔌 [Widget] Socket connected, now disconnecting...');
        socket.disconnect();
      });
      
      // If it fails to connect, clean up
      socket.once('connect_error', () => {
        console.log('❌ [Widget] Socket connection failed, cleaning up...');
        socket.disconnect();
      });
      
      // Set a timeout to force disconnect if connection takes too long
      setTimeout(() => {
        if (socket.connected === false) {
          console.log('⏰ [Widget] Connection timeout, forcing disconnect...');
          socket.disconnect();
        }
      }, 5000);
      
    } else if (socket.connected) {
      // Socket is open - disconnect normally
      console.log('🔌 [Widget] Disconnecting open socket...');
      socket.disconnect();
    } else {
      // Socket is already closing or closed
      console.log('ℹ️ [Widget] Socket already closed or closing');
    }
    
    socketRef.current = null;
    setIsConnected(false);
    isConnectingRef.current = false;
    
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string): boolean => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ [Widget] Cannot send message: socket not connected');
      return false;
    }

    const visitorId = visitorIdRef.current;
    
    socketRef.current.emit('send_message', {
      conversationId,
      content,
      sender: 'visitor',
      visitorId: visitorId,
      timestamp: new Date().toISOString(),
    });
    
    console.log(`📤 [Widget] Message sent via socket: "${content}"`);
    return true;
  }, [options.visitorId]);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('typing', {
      conversationId,
      isTyping,
      sender: 'visitor',
    });
  }, []);

  // Auto-connect on mount
  // Auto-connect on mount - ONLY ONCE
  useEffect(() => {
    let mounted = true;
    
    // Only connect if not already connected and no connection in progress
    if (!socketRef.current && !isConnectingRef.current) {
      isConnectingRef.current = true;
      console.log('🔌 [Widget] Initial connection attempt...');
      
      // Small delay to ensure everything is initialized
      const timer = setTimeout(() => {
        if (mounted) {
          connect();
          isConnectingRef.current = false;
        }
      }, 500);

      return () => {
        mounted = false;
        clearTimeout(timer);
        isConnectingRef.current = false;
      };
    }
    
    return () => {
      mounted = false;
    };
  }, []); 

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
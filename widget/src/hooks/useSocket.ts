// widget/src/hooks/useSocket.ts

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWidgetStore } from '../store/widgetStore';
import type { Message } from '../types';
import { WIDGET_CONFIG } from '../config';

interface UseSocketOptions {
  socketUrl?: string;
  userId?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: Message) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);

  const { addMessage, setConnected } = useWidgetStore();

  const connect = () => {
    if (socketRef.current?.connected) return;

    const socketUrl = options.socketUrl || 
                      import.meta.env.VITE_SOCKET_URL || 
                      WIDGET_CONFIG.SOCKET_URL;
    const userId = options.userId || 
                   localStorage.getItem(WIDGET_CONFIG.STORAGE_KEYS.USER_ID) || 
                   `visitor_${Date.now()}`;
    

    // Store user ID
    localStorage.setItem(WIDGET_CONFIG.STORAGE_KEYS.USER_ID, userId);

    console.log('🔌 Connecting to socket server:', socketUrl);

    socketRef.current = io(socketUrl, {
      transports: WIDGET_CONFIG.SOCKET.transports as any,
      reconnection: WIDGET_CONFIG.SOCKET.reconnection,
      reconnectionAttempts: WIDGET_CONFIG.SOCKET.reconnectionAttempts,
      reconnectionDelay: WIDGET_CONFIG.SOCKET.reconnectionDelay,
      reconnectionDelayMax: WIDGET_CONFIG.SOCKET.reconnectionDelayMax,
      timeout: WIDGET_CONFIG.TIMEOUTS.socket,
      query: {
        userId,
        type: 'visitor',
      },
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      // Track visitor
      socketRef.current?.emit('track_visitor', {
        name: 'Visitor',
        page: window.location.pathname,
        referrer: document.referrer,
      });
    });

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current?.id);
      setIsConnected(true);
      setConnected(true);
      reconnectAttempts.current = 0;
      options.onConnect?.();
      
      socketRef.current?.emit('join', { userId, type: 'visitor' });
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
      setConnected(false);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      setConnected(false);
      options.onDisconnect?.();
    });

    socketRef.current.on('reconnect_attempt', (attempt) => {
      reconnectAttempts.current = attempt;
      console.log(`🔄 Reconnection attempt ${attempt}/${WIDGET_CONFIG.SOCKET.reconnectionAttempts}`);
    });

    socketRef.current.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after maximum attempts');
      setError('Failed to connect to chat server');
    });

    // Message events
    socketRef.current.on('message', (data: any) => {
      console.log('📨 Received message:', data);
      
      const message: Message = {
        id: data.id || Date.now().toString(),
        content: data.content || data.message || 'No message content',
        sender: data.sender || 'bot',
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        status: data.status || 'delivered',
      };

      addMessage(message);
      options.onMessage?.(message);
    });

    // Typing events
    socketRef.current.on('typing', (data: any) => {
      const { setTyping } = useWidgetStore.getState();
      setTyping(data.isTyping || false);
    });

    socketRef.current.on('system', (data: any) => {
      console.log('📢 System message:', data.message);
      if (data.message) {
        const message: Message = {
          id: `system_${Date.now()}`,
          content: data.message,
          sender: 'bot',
          timestamp: new Date(),
          status: 'delivered',
        };
        addMessage(message);
      }
    });

    socketRef.current.on('error', (data: any) => {
      console.error('❌ Socket error:', data);
      setError(data.message || 'Socket error occurred');
    });
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setConnected(false);
    }
  };

  const sendMessage = (content: string, sender: 'user' | 'agent' = 'user') => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Cannot send message: socket not connected');
      return false;
    }

    const message = {
      content,
      sender,
      timestamp: new Date().toISOString(),
      type: 'message',
    };

    socketRef.current.emit('message', message);
    return true;
  };

  const sendTyping = (isTyping: boolean) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('typing', { isTyping });
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    reconnectAttempts: reconnectAttempts.current,
  };
}
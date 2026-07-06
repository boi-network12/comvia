// web/hooks/useRealtime.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/services/conversations'; // Adjust path if needed

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function useRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback((token: string) => {
    if (socketRef.current?.connected) {
      console.log('Already connected');
      return;
    }

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('🟢 Dashboard connected to realtime');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔴 Dashboard disconnected from realtime');
    });

    socketRef.current.on('visitor_message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    socketRef.current.on('new_message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    socketRef.current.on('new_visitor', (data) => {
      console.log('👤 New visitor:', data);
    });
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string): boolean => {
    if (!socketRef.current?.connected) return false;

    socketRef.current.emit('send_message', {
      conversationId,
      content,
      sender: 'agent',
    });
    return true;
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('join_conversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('leave_conversation', conversationId);
  }, []);

  // Optional: expose socket safely via getter function
  const getSocket = useCallback(() => socketRef.current, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    messages,
    connect,
    disconnect,
    sendMessage,
    joinConversation,
    leaveConversation,
    getSocket,  
    // socket: socketRef.current,  ← Removed (this caused the error)
  };
}
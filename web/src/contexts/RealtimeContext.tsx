// web/contexts/RealtimeContext.tsx - NEW FILE
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useRealtime } from '@/hooks/useRealtime';
import { Message } from '@/services/conversations';
import { realtimeService } from '@/services/realtime';

// ======================
// TYPES
// ======================

interface VisitorMessageData {
  conversationId: string;
  message: Message;
  visitorId: string;
  conversation: {
    _id: string;
    status: string;
  };
}

interface RealtimeContextType {
  isConnected: boolean;
  messages: Message[];
  visitorMessages: VisitorMessageData[];
  sendMessage: (conversationId: string, content: string) => boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  connect: (token: string) => void;
  disconnect: () => void;
  onNewMessage: (callback: (message: Message, conversationId: string) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
   const [isConnected, setIsConnected] = useState<boolean>(false);
  const [visitorMessages, setVisitorMessages] = useState<VisitorMessageData[]>([]);
  const realtime = useRealtime();
  const joinedConversationsRef = useRef<Set<string>>(new Set());
  const messageCallbacksRef = useRef<((message: Message, conversationId: string) => void)[]>([]);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        realtime.connect(token);
      }
    }
    return () => {
      realtime.disconnect();
    };
  }, [isAuthenticated, user]);

   // Listen for connection changes
  useEffect(() => {
    const unsubscribe = realtimeService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 🔥 Listen for visitor messages
  useEffect(() => {
    const unsubscribe = realtimeService.onVisitorMessage((data) => {
      console.log('📨 [CONTEXT] New visitor message:', data);
      setVisitorMessages(prev => [...prev, data]);
      
      if (data.message) {
        setMessages(prev => [...prev, data.message]);

        messageCallbacksRef.current.forEach(callback => {
          callback(data.message, data.conversationId);
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

   useEffect(() => {
    const unsubscribe = realtimeService.onMessage((message) => {
      console.log('📨 [CONTEXT] New message:', message);
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
      
      // Notify all registered callbacks
      if (message.conversationId) {
        messageCallbacksRef.current.forEach(callback => {
          callback(message, message.conversationId);
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

    const connect = useCallback((token: string) => {
      realtimeService.connect(token);
    }, []);

    const disconnect = useCallback(() => {
      realtimeService.disconnect();
    }, []);

    const sendMessage = useCallback((conversationId: string, content: string) => {
      return realtimeService.sendMessage(conversationId, content);
    }, []);

    const joinConversation = useCallback((conversationId: string) => {
      if (!conversationId) return;
      if (joinedConversationsRef.current.has(conversationId)) {
        console.log(`Already joined conversation ${conversationId}`);
        return;
      }
      joinedConversationsRef.current.add(conversationId);
      realtimeService.joinConversation(conversationId);
    }, []);

  
// Wrap joinConversation to track joined rooms
  // const joinConversation = useCallback((conversationId: string) => {
  //   if (!conversationId) return;
  //   if (joinedConversationsRef.current.has(conversationId)) {
  //     console.log(`Already joined conversation ${conversationId}`);
  //     return;
  //   }
  //   joinedConversationsRef.current.add(conversationId);
  //   realtime.joinConversation(conversationId);
  // }, [realtime]);

  // Wrap leaveConversation to remove from tracked rooms
  // const leaveConversation = useCallback((conversationId: string) => {
  //   if (!conversationId) return;
  //   if (!joinedConversationsRef.current.has(conversationId)) {
  //     return;
  //   }
  //   joinedConversationsRef.current.delete(conversationId);
  //   realtime.leaveConversation(conversationId);
  // }, [realtime]);
  const leaveConversation = useCallback((conversationId: string) => {
    if (!conversationId) return;
    if (!joinedConversationsRef.current.has(conversationId)) {
      return;
    }
    joinedConversationsRef.current.delete(conversationId);
    realtimeService.leaveConversation(conversationId);
  }, []);

  // 🔥 Register a callback for new messages
  const onNewMessage = useCallback((callback: (message: Message, conversationId: string) => void) => {
    messageCallbacksRef.current.push(callback);
    return () => {
      messageCallbacksRef.current = messageCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  // Clear all joined rooms on disconnect
  // useEffect(() => {
  //   if (!realtime.isConnected) {
  //     joinedConversationsRef.current.clear();
  //   }
  // }, [realtime.isConnected]);
  
  useEffect(() => {
    if (!realtimeService.isConnected) {
      joinedConversationsRef.current.clear();
    }
  }, []);

  return (
    <RealtimeContext.Provider value={{
      ...realtime,
      isConnected,
      messages,
      visitorMessages,
      sendMessage,
      joinConversation,
      leaveConversation,
      connect,
      disconnect,
      onNewMessage
      }}>
      {children}
    </RealtimeContext.Provider>
  );
}


export function useRealtimeContext() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  return context;
}
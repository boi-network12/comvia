// web/contexts/RealtimeContext.tsx - NEW FILE
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useRealtime } from '@/hooks/useRealtime';
import { Message } from '@/services/conversations';

interface RealtimeContextType {
  isConnected: boolean;
  messages: Message[];
  sendMessage: (conversationId: string, content: string) => boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  connect: (token: string) => void;
  disconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const realtime = useRealtime();
  const joinedConversationsRef = useRef<Set<string>>(new Set());

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
  
// Wrap joinConversation to track joined rooms
  const joinConversation = useCallback((conversationId: string) => {
    if (!conversationId) return;
    if (joinedConversationsRef.current.has(conversationId)) {
      console.log(`Already joined conversation ${conversationId}`);
      return;
    }
    joinedConversationsRef.current.add(conversationId);
    realtime.joinConversation(conversationId);
  }, [realtime]);

  // Wrap leaveConversation to remove from tracked rooms
  const leaveConversation = useCallback((conversationId: string) => {
    if (!conversationId) return;
    if (!joinedConversationsRef.current.has(conversationId)) {
      return;
    }
    joinedConversationsRef.current.delete(conversationId);
    realtime.leaveConversation(conversationId);
  }, [realtime]);

  // Clear all joined rooms on disconnect
  useEffect(() => {
    if (!realtime.isConnected) {
      joinedConversationsRef.current.clear();
    }
  }, [realtime.isConnected]);

  return (
    <RealtimeContext.Provider value={{
      ...realtime,
      joinConversation,
      leaveConversation,
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
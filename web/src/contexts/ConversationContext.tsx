"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { conversationAPI, Conversation, Message, ConversationStats, GetConversationsParams, CreateConversationData, UpdateConversationData } from '@/services/conversations';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useErrorHandler } from '@/utils/error-handler';

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  stats: ConversationStats | null;
  isLoading: boolean;
  isFetchingMore: boolean;
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loadConversations: (params?: GetConversationsParams) => Promise<void>;
  loadMoreConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  loadStats: () => Promise<void>;
  createConversation: (data: CreateConversationData) => Promise<Conversation>;
  updateConversation: (id: string, data: UpdateConversationData) => Promise<Conversation>;
  sendMessage: (conversationId: string, content: string) => Promise<Message>;
  addInternalNote: (conversationId: string, content: string) => Promise<void>;
  assignConversation: (id: string, userId: string) => Promise<Conversation>;
  resolveConversation: (id: string) => Promise<Conversation>;
  escalateConversation: (id: string) => Promise<Conversation>;
  rateConversation: (id: string, rating: number, comment?: string) => Promise<Conversation>;
  markAsRead: (conversationId: string) => Promise<void>;
  clearCurrentConversation: () => void;
  refreshConversations: () => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const { handleError } = useErrorHandler();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
   const [filters, setFilters] = useState<GetConversationsParams>({});
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load conversations
  const loadConversations = useCallback(async (params?: GetConversationsParams) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await conversationAPI.getConversations(params || {});
      const { conversations: convs, pagination: pag, unreadCount: unread } = response.data;
      
      setConversations(convs);
      setPagination(pag);
      setUnreadCount(unread);
      if (params) setFilters(params);
    } catch (error) {
      handleError(error, 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [user, handleError]);

  // Load more conversations (pagination)
  const loadMoreConversations = useCallback(async () => {
    if (isFetchingMore || pagination.page >= pagination.pages) return;
    
    setIsFetchingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const response = await conversationAPI.getConversations({
        ...filters,
        page: nextPage,
        limit: pagination.limit,
      });
      
      setConversations(prev => [...prev, ...response.data.conversations]);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load more conversations:', error);
      handleError(error, 'Failed to load more conversations');
    } finally {
      setIsFetchingMore(false);
    }
  }, [pagination, filters, isFetchingMore, handleError]);

  // Load single conversation with messages
  const loadConversation = useCallback(async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await conversationAPI.getConversation(id);
      const { conversation, messages: msgs } = response.data;
      
      setCurrentConversation(conversation);
      setMessages(msgs);
      
      // Mark as read
      await conversationAPI.markAsRead(id);
      
      // Update unread count in list
      setConversations(prev =>
        prev.map(c => c._id === id ? { ...c, unreadCount: 0 } : c)
      );
      setUnreadCount(prev => Math.max(0, prev - conversation.unreadCount));
    } catch (error) {
      console.error('Failed to load conversation:', error);
      handleError(error, 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [user, handleError]);

  // Load stats
  const loadStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await conversationAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [user]);

  // Create conversation
  const createConversation = useCallback(async (data: CreateConversationData): Promise<Conversation> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await conversationAPI.createConversation(data);
      const newConversation = response.data;
      
      setConversations(prev => [newConversation, ...prev]);
      showSuccess('Conversation created successfully');
      
      return newConversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      handleError(error, 'Failed to create conversation');
      throw error;
    }
  }, [user, showSuccess, handleError]);

  // Update conversation
  const updateConversation = useCallback(async (id: string, data: UpdateConversationData): Promise<Conversation> => {
    try {
      const response = await conversationAPI.updateConversation(id, data);
      const updated = response.data;
      
      setConversations(prev =>
        prev.map(c => c._id === id ? updated : c)
      );
      
      if (currentConversation?._id === id) {
        setCurrentConversation(updated);
      }
      
      return updated;
    } catch (error) {
      console.error('Failed to update conversation:', error);
      handleError(error, 'Failed to update conversation');
      throw error;
    }
  }, [currentConversation, handleError]);

  // Send message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    try {
      const response = await conversationAPI.sendMessage(conversationId, content);
      const newMessage = response.data;
      
      setMessages(prev => [...prev, newMessage]);
      
      // Update last message preview in conversations list
      setConversations(prev =>
        prev.map(c =>
          c._id === conversationId
            ? { ...c, lastMessagePreview: content, lastMessageAt: newMessage.createdAt }
            : c
        )
      );
      
      return newMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      handleError(error, 'Failed to send message');
      throw error;
    }
  }, [handleError]);

  // Add internal note
  const addInternalNote = useCallback(async (conversationId: string, content: string) => {
    try {
      await conversationAPI.addInternalNote(conversationId, content);
      showSuccess('Note added successfully');
      
      // Refresh conversation
      await loadConversation(conversationId);
    } catch (error) {
      console.error('Failed to add note:', error);
      handleError(error, 'Failed to add note');
      throw error;
    }
  }, [loadConversation, showSuccess, handleError]);

  // Assign conversation
  const assignConversation = useCallback(async (id: string, userId: string) => {
    const updated = await updateConversation(id, { assignedTo: userId });
    showSuccess('Conversation assigned successfully');
    return updated;
  }, [updateConversation, showSuccess]);

  // Resolve conversation
  const resolveConversation = useCallback(async (id: string) => {
    const updated = await updateConversation(id, { status: 'resolved' });
    showSuccess('Conversation resolved! 🎉');
    return updated;
  }, [updateConversation, showSuccess]);

  // Escalate conversation
  const escalateConversation = useCallback(async (id: string) => {
    const updated = await updateConversation(id, { status: 'escalated' });
    showSuccess('Conversation escalated');
    return updated;
  }, [updateConversation, showSuccess]);

  // Rate conversation
  const rateConversation = useCallback(async (id: string, rating: number, comment?: string) => {
    const updated = await updateConversation(id, { rating, ratingComment: comment });
    showSuccess('Thank you for your feedback! ⭐');
    return updated;
  }, [updateConversation, showSuccess]);

  // Mark as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await conversationAPI.markAsRead(conversationId);
      
      setConversations(prev =>
        prev.map(c => c._id === conversationId ? { ...c, unreadCount: 0 } : c)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  // Clear current conversation
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
  }, []);

  // Refresh all data
  const refreshConversations = useCallback(async () => {
    await loadConversations(filters);
    await loadStats();
  }, [loadConversations, loadStats, filters]);

  // Load initial data
  useEffect(() => {
    if (user) {
        // eslint-disable-next-line
      loadConversations();
      loadStats();
      setHasInitialized(true);
    }
  }, [user, loadConversations, loadStats]);

  useEffect(() => {
    if (user && hasInitialized) {
      // eslint-disable-next-line
      refreshConversations();
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    conversations,
    currentConversation,
    messages,
    stats,
    isLoading,
    isFetchingMore,
    unreadCount,
    pagination,
    loadConversations,
    loadMoreConversations,
    loadConversation,
    loadStats,
    createConversation,
    updateConversation,
    sendMessage,
    addInternalNote,
    assignConversation,
    resolveConversation,
    escalateConversation,
    rateConversation,
    markAsRead,
    clearCurrentConversation,
    refreshConversations,
  }), [
    conversations,
    currentConversation,
    messages,
    stats,
    isLoading,
    isFetchingMore,
    unreadCount,
    pagination,
    loadConversations,
    loadMoreConversations,
    loadConversation,
    loadStats,
    createConversation,
    updateConversation,
    sendMessage,
    addInternalNote,
    assignConversation,
    resolveConversation,
    escalateConversation,
    rateConversation,
    markAsRead,
    clearCurrentConversation,
    refreshConversations,
  ]);

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}
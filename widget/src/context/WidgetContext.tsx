
// // widget/src/context/WidgetContext.tsx

// widget/src/context/WidgetContext.tsx

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from 'react';
import { useWidgetStore } from '../store/widgetStore';
import { useSocket } from '../hooks/useSocket';
import { widgetAPI } from '../utils/api';
import type { WidgetConfig, WidgetSettings, Message } from '../types';

interface WidgetContextType {
  isOpen: boolean;
  isMinimized: boolean;
  messages: Message[];
  isTyping: boolean;
  unreadCount: number;
  settings: WidgetSettings | null;
  user: any;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  config: WidgetConfig | null;
  companyId: string | null;
  
  toggleWidget: () => void;
  openWidget: () => void;
  closeWidget: () => void;
  minimizeWidget: () => void;
  maximizeWidget: () => void;
  sendMessage: (content: string, sender?: 'user' | 'agent') => void;
  sendTyping: (isTyping: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  clearUnread: () => void;
  loadChatHistory: () => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const {
    isOpen,
    isMinimized,
    messages,
    isTyping,
    unreadCount,
    settings,
    user,
    toggleWidget,
    openWidget,
    closeWidget,
    minimizeWidget,
    maximizeWidget,
    addMessage,
    setMessages,
    setTyping,
    setSettings,
    setConnected,
    clearUnread,
  } = useWidgetStore();

  const [config] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // ✅ Use ref to track if socket connection has been initiated
  const connectionInitiatedRef = useRef(false);
  const processedMessagesRef = useRef<Set<string>>(new Set());

  // ✅ Memoize the message handlers
  const handleMessage = useCallback((message: Message) => {
    console.log('📨 [WIDGET] New message from socket:', message);

    const messageKey = `${message.content}_${message.sender}_${message.timestamp?.getTime() || Date.now()}`;
    if (processedMessagesRef.current.has(messageKey)) {
      console.log('⏭️ [WIDGET] Skipping duplicate message:', messageKey);
      return;
    }
    processedMessagesRef.current.add(messageKey);

    const isAgent = message.senderType === 'agent' || 
                    message.senderType === 'admin' ||
                    message.sender === 'agent' || 
                    message.sender === 'admin';
    
    const isSystem = message.senderType === 'system';

    if (isAgent) {
      addMessage({
        content: message.content,
        sender: 'agent',
      });
    } else if (isSystem) {
      addMessage({
        content: message.content,
        sender: 'bot',
      });
    } else {
      addMessage({
        content: message.content,
        sender: 'bot',
      });
    }
  }, [addMessage]);

  const handleAgentMessage = useCallback((data: { content: string; conversationId: string; senderId: string }) => {
    console.log('📨 [WIDGET] Agent message from socket:', data);
    
    const key = `agent_${data.conversationId}_${data.content}_${data.senderId}`;
    if (processedMessagesRef.current.has(key)) {
      console.log('⏭️ [WIDGET] Skipping duplicate agent message:', key);
      return;
    }
    processedMessagesRef.current.add(key);
    
    addMessage({
      content: data.content,
      sender: 'agent',
    });
  }, [addMessage]);

  // ✅ Get socket with handlers
  const {
    isConnected: socketConnected,
    error: socketError,
    sendMessage: socketSendMessage,
    sendTyping: sendSocketTyping,
    connect: connectSocket,
    disconnect: disconnectSocket,
  } = useSocket({
    visitorId: localStorage.getItem('comvia_visitor_id') || undefined,
    companyId: companyId || undefined,
    onMessage: handleMessage,
    onAgentMessage: handleAgentMessage,
  });

  // Load config
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      
      const windowConfig = (window as any).comviaSettings || {};
      const companyId = windowConfig.companyId;
      
      console.log('🔍 [WIDGET] Company ID:', companyId);
      
      if (companyId) {
        setCompanyId(companyId);
        try {
          const response = await widgetAPI.getCompanySettings(companyId);
          console.log('📥 [WIDGET] Company settings from API:', response);
          
          if (response.success && response.data) {
            const data = response.data;
            
            const widgetSettings: WidgetSettings = {
              position: data.widgetSettings?.position || 'bottom-right',
              color: data.widgetSettings?.color || '#F97316',
              icon: data.widgetSettings?.icon || 'chat',
              font: data.widgetSettings?.font || 'inter',
              welcomeMessage: data.widgetSettings?.welcomeMessage || 'Hi there! 👋 How can I help you today?',
              quickReplies: data.widgetSettings?.quickReplies || ['Pricing', 'Features', 'Support', 'Demo'],
              companyName: data.companyName || 'Comvia',
              companyLogo: data.companyLogo || '',
            };
            
            setSettings(widgetSettings);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('❌ Failed to fetch company settings:', error);
        }
      }
      
      const fallbackSettings: WidgetSettings = {
        position: 'bottom-right',
        color: '#F97316',
        icon: 'chat',
        font: 'inter',
        welcomeMessage: 'Hi there! 👋 How can I help you today?',
        quickReplies: ['Pricing', 'Features', 'Support', 'Demo'],
        companyName: 'Comvia',
        companyLogo: '',
      };
      setSettings(fallbackSettings);
      setIsLoading(false);
    };

    loadConfig();
  }, [setSettings]);

  // ✅ Only connect ONCE when the component mounts AND we have a companyId
  useEffect(() => {
    if (!connectionInitiatedRef.current && !socketConnected && companyId && !isLoading) {
      connectionInitiatedRef.current = true;
      console.log('🔌 [WIDGET] Initiating socket connection...');
      connectSocket();
    }
  }, [companyId, isLoading, socketConnected, connectSocket]);

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const response = await widgetAPI.getHistory(user?.id || '');
      if (response.success && response.data) {
        const historyMessages = response.data.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          content: msg.content || msg.message || 'No content',
          sender: msg.sender || 'bot',
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          status: msg.status || 'delivered',
        }));
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  // Send message with Socket + REST Fallback
  const sendMessage = (content: string, sender: 'user' | 'agent' = 'user') => {
    if (!content || !content.trim()) return;
    
    console.log(`📤 [WIDGET] Sending message: "${content}" from ${sender}`);
    
    // Add user message immediately (optimistic)
    addMessage({ content, sender });
    
    const userId = user?.id || localStorage.getItem('comvia_visitor_id') || `visitor_${Date.now()}`;
    const windowConfig = (window as any).comviaSettings || {};
    const companyId = windowConfig.companyId || windowConfig.company_id;
    
    console.log(`📤 [WIDGET] User ID: ${userId}, Company ID: ${companyId}`);

    const conversationId = localStorage.getItem('comvia_conversation_id');

    if (socketConnected && conversationId && socketSendMessage) {
      const sent = socketSendMessage(conversationId, content);
      if (sent) {
        console.log('✅ Message sent via socket');
        return;
      }
    }
    
    // FALLBACK: Send via REST API
    widgetAPI.sendMessage({
      content,
      sender,
      userId: userId,
      timestamp: new Date().toISOString(),
      companyId: companyId 
    }).then(response => {
      console.log('📥 [WIDGET] Message response:', response);
      
      if (response.success && response.data) {
        if (response.data.reply) {
          addMessage({
            content: response.data.reply,
            sender: 'bot',
          });
        }
        if (response.data.conversationId) {
          localStorage.setItem('comvia_conversation_id', response.data.conversationId);
        }
      } else {
        addMessage({
          content: '⚠️ Sorry, I couldn\'t process your message. Please try again.',
          sender: 'bot',
        });
      }
    }).catch(err => {
      console.error('❌ [WIDGET] Error sending message:', err);
      addMessage({
        content: '⚠️ Connection error. Please try again later.',
        sender: 'bot',
      });
    });
  };

  const sendTyping = useCallback((isTyping: boolean) => {
    setTyping(isTyping);
    if (socketConnected) {
      const conversationId = localStorage.getItem('comvia_conversation_id');
      if (conversationId) {
        sendSocketTyping(conversationId, isTyping);
      }
    }
  }, [setTyping, socketConnected, sendSocketTyping]);

  const value: WidgetContextType = {
    isOpen,
    isMinimized,
    messages,
    isTyping,
    unreadCount,
    settings,
    user,
    isConnected: socketConnected,
    isLoading,
    error: error || socketError,
    config,
    companyId,
    toggleWidget,
    openWidget,
    closeWidget,
    minimizeWidget,
    maximizeWidget,
    sendMessage,
    sendTyping,
    setConnected,
    clearUnread,
    loadChatHistory,
    connectSocket,
    disconnectSocket,
  };

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidgetContext() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidgetContext must be used within a WidgetProvider');
  }
  return context;
}
// widget/src/context/WidgetContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useWidgetStore } from '../store/widgetStore';
import { useSocket } from '../hooks/useSocket';
import { widgetAPI } from '../utils/api';
// import { WIDGET_CONFIG } from '../config';
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
  companyId: string | null; // ✅ Added companyId
  
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
    // setUser,
    setConnected,
    clearUnread,
  } = useWidgetStore();

  const [config] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null); // ✅ Added companyId state

  // Socket connection
  const {
    isConnected: socketConnected,
    error: socketError,
    // sendMessage: sendSocketMessage,
    sendTyping: sendSocketTyping,
    connect: connectSocket,
    disconnect: disconnectSocket,
  } = useSocket();


useEffect(() => {
  const loadConfig = async () => {
    setIsLoading(true);
    
    // ✅ Get companyId from window config
    const windowConfig = (window as any).comviaSettings || {};
    const companyId = windowConfig.companyId;
    
    console.log('🔍 [WIDGET] Company ID:', companyId);
    
    // ✅ If we have a companyId, fetch ALL settings from API
    if (companyId) {
      setCompanyId(companyId);
      try {
        const response = await widgetAPI.getCompanySettings(companyId);
        console.log('📥 [WIDGET] Company settings from API:', response);
        
        if (response.success && response.data) {
          const data = response.data;
          
          // ✅ Use ALL settings from the API
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
    
    // Fallback settings (should rarely be used)
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
}, []);

  // Load chat history from server
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

  // Send message

  const sendMessage = (content: string, sender: 'user' | 'agent' = 'user') => {
  // Don't send empty messages
  if (!content || !content.trim()) return;
  
  
  console.log(`📤 [WIDGET] Sending message: "${content}" from ${sender}`);
  
  // Add user message immediately
  addMessage({ content, sender });
  
  // Get user ID
  const userId = user?.id || localStorage.getItem('comvia_user_id') || `visitor_${Date.now()}`;
  
  // ✅ Get companyId from global config
  const windowConfig = (window as any).comviaSettings || {};
  const companyId = windowConfig.companyId || windowConfig.company_id;
  
  console.log(`📤 [WIDGET] User ID: ${userId}, Company ID: ${companyId}`);
  
  // ✅ Send via REST API
  widgetAPI.sendMessage({
    content,
    sender,
    userId: userId,
    timestamp: new Date().toISOString(),
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


  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
  setTyping(isTyping);
  if (socketConnected) {
    const conversationId = localStorage.getItem('comvia_conversation_id');
    if (conversationId) {
      // ✅ Pass both arguments
      sendSocketTyping(conversationId, isTyping);
    }
  }
}, [setTyping, socketConnected, sendSocketTyping]);

  
  // ✅ Instead, only connect when widget mounts:
  useEffect(() => {
    // Only connect if not already connected and not loading
    if (!socketConnected && !isLoading) {
      // Small delay to prevent race conditions
      const timer = setTimeout(() => {
        connectSocket();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []);

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
    companyId, // ✅ Added companyId
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
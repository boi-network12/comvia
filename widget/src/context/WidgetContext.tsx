// widget/src/context/WidgetContext.tsx

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useWidgetStore } from '../store/widgetStore';
import { useSocket } from '../hooks/useSocket';
import { widgetAPI } from '../utils/api';
import { WIDGET_CONFIG } from '../config';
import type { WidgetConfig, WidgetSettings, Message } from '../types';

interface WidgetContextType {
  // State
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
  
  // Actions
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
    isConnected,
    toggleWidget,
    openWidget,
    closeWidget,
    minimizeWidget,
    maximizeWidget,
    addMessage,
    setMessages,
    setTyping,
    setSettings,
    setUser,
    setConnected,
    clearUnread,
  } = useWidgetStore();

  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Socket connection
  const {
    isConnected: socketConnected,
    error: socketError,
    sendMessage: sendSocketMessage,
    sendTyping: sendSocketTyping,
    connect: connectSocket,
    disconnect: disconnectSocket,
  } = useSocket({
    userId: user?.id,
    onConnect: () => {
      console.log('🟢 Socket connected');
      setConnected(true);
      loadChatHistory();
    },
    onDisconnect: () => {
      console.log('🔴 Socket disconnected');
      setConnected(false);
    },
    onMessage: (message: Message) => {
      // Message already added by socket hook
      if (message.sender === 'bot' || message.sender === 'agent') {
        // Additional processing if needed
      }
    },
  });

  // Load config from script tag or window
  useEffect(() => {
    const loadConfig = () => {
      // Check for window.comviaSettings
      const windowConfig = (window as any).comviaSettings || {};
      
      // Check for data attributes on script tag
      const script = document.querySelector('script[data-comvia]');
      const dataConfig = script ? (script as HTMLElement).dataset : {};

      const config: WidgetConfig = {
        position: windowConfig.position || dataConfig.position || WIDGET_CONFIG.DEFAULTS.position,
        color: windowConfig.color || dataConfig.color || WIDGET_CONFIG.DEFAULTS.color,
        icon: windowConfig.icon || dataConfig.icon || WIDGET_CONFIG.DEFAULTS.icon,
        companyName: windowConfig.companyName || dataConfig.companyName || 'Comvia',
        companyLogo: windowConfig.companyLogo || dataConfig.companyLogo,
        apiUrl: windowConfig.apiUrl || dataConfig.apiUrl || WIDGET_CONFIG.API_URL,
        socketUrl: windowConfig.socketUrl || dataConfig.socketUrl || WIDGET_CONFIG.SOCKET_URL,
      };

      setConfig(config);

      // Set settings in store
      const settings: WidgetSettings = {
        position: config.position as WidgetSettings['position'],
        color: config.color!,
        icon: config.icon!,
        font: 'inter',
        welcomeMessage: WIDGET_CONFIG.DEFAULTS.welcomeMessage,
        quickReplies: WIDGET_CONFIG.DEFAULTS.quickReplies as any,
        companyName: config.companyName,
        companyLogo: config.companyLogo,
      };
      setSettings(settings);

      // Set default user if not exists
      if (!user) {
        const savedUserId = localStorage.getItem(WIDGET_CONFIG.STORAGE_KEYS.USER_ID);
        setUser({
          id: savedUserId || `visitor_${Date.now()}`,
          name: 'Visitor',
        });
      }

      setIsLoading(false);
    };

    loadConfig();
  }, [setSettings, setUser, user]);

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
    // Add to local store
    addMessage({ content, sender });
    
    // Send via socket
    if (socketConnected) {
      sendSocketMessage(content, sender);
    } else {
      // Fallback to REST API
      widgetAPI.sendMessage({
        content,
        sender,
        userId: user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
      }).then(response => {
        if (response.success && response.data) {
          // Bot response
          addMessage({
            content: response.data.reply || 'Thanks for your message!',
            sender: 'bot',
          });
        }
      }).catch(err => {
        console.error('Failed to send message:', err);
        addMessage({
          content: '⚠️ Failed to send message. Please try again.',
          sender: 'bot',
        });
      });
    }
  };

  // Send typing indicator
  const sendTyping = (isTyping: boolean) => {
    setTyping(isTyping);
    if (socketConnected) {
      sendSocketTyping(isTyping);
    }
  };

  // Connect socket when widget opens
  useEffect(() => {
    if (isOpen && !socketConnected) {
      connectSocket();
    }
  }, [isOpen, socketConnected, connectSocket]);

  const value: WidgetContextType = {
    // State
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
    
    // Actions
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
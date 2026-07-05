// src/hooks/useWidget.ts

import { useEffect, useState, useCallback } from 'react';
import { useWidgetStore } from '../store/widgetStore';
import { useSocket } from './useSocket';
import type { WidgetConfig, WidgetSettings, Message } from '../types';
import { widgetAPI } from '../utils/api';

export function useWidget() {
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
      // Load chat history
      loadChatHistory();
    },
    onDisconnect: () => {
      console.log('🔴 Socket disconnected');
      setConnected(false);
    },
    onMessage: (message: Message) => {
      // Message already added by socket hook
      // But we can do additional processing here
      if (message.sender === 'bot' || message.sender === 'agent') {
        // Play notification sound or show notification
        if (!isOpen) {
          // Increment unread count (already handled by store)
        }
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
        position: windowConfig.position || dataConfig.position || 'bottom-right',
        color: windowConfig.color || dataConfig.color || '#F97316',
        icon: windowConfig.icon || dataConfig.icon || 'chat',
        companyName: windowConfig.companyName || dataConfig.companyName || 'Comvia',
        companyLogo: windowConfig.companyLogo || dataConfig.companyLogo,
        apiUrl: windowConfig.apiUrl || dataConfig.apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
        socketUrl: windowConfig.socketUrl || dataConfig.socketUrl || import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
      };

      setConfig(config);

      // Set settings in store
      const settings: WidgetSettings = {
        position: config.position as WidgetSettings['position'],
        color: config.color!,
        icon: config.icon!,
        font: 'inter',
        welcomeMessage: 'Hi there! 👋 How can I help you today?',
        quickReplies: ['Pricing', 'Features', 'Support', 'Demo'],
        companyName: config.companyName,
        companyLogo: config.companyLogo,
      };
      setSettings(settings);

      // Set default user if not exists
      if (!user) {
        const savedUserId = localStorage.getItem('comvia_user_id');
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
  const sendMessage = useCallback((content: string, sender: 'user' | 'agent' = 'user') => {
    // Add to local store
    const newMessage = addMessage({ content, sender });
    
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
        // Show error in chat
        addMessage({
          content: '⚠️ Failed to send message. Please try again.',
          sender: 'bot',
        });
      });
    }
  }, [addMessage, socketConnected, sendSocketMessage, user]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
    setTyping(isTyping);
    if (socketConnected) {
      sendSocketTyping(isTyping);
    }
  }, [setTyping, socketConnected, sendSocketTyping]);

  // Connect socket when widget opens
  useEffect(() => {
    if (isOpen && !socketConnected) {
      connectSocket();
    }
  }, [isOpen, socketConnected, connectSocket]);

  return {
    // State
    isOpen,
    isMinimized,
    messages,
    isTyping,
    unreadCount,
    settings,
    user,
    isConnected: socketConnected,
    config,
    isLoading,
    error: error || socketError,
    
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
}
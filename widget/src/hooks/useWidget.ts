// widget/src/hooks/useWidget.ts
import { useEffect, useState, useCallback } from 'react';
import { useWidgetStore } from '../store/widgetStore';
import { useSocket } from './useSocket';
import type { WidgetConfig, WidgetSettings, Message } from '../types';
import { widgetAPI } from '../utils/api';
import { WIDGET_CONFIG } from '../config';

export function useWidget() {
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
    setUser,
    setConnected,
    clearUnread,
  } = useWidgetStore();

  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Socket connection
  const {
    isConnected: socketConnected,
    error: socketError,
    sendMessage: sendSocketMessage,
    sendTyping: sendSocketTyping,
    connect: connectSocket,
    disconnect: disconnectSocket,
  } = useSocket({
    userId: user?.id || localStorage.getItem('comvia_user_id') || `visitor_${Date.now()}`,
    
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
      if (message.sender === 'bot' || message.sender === 'agent') {
        if (!isOpen) {
          // Increment unread count (already handled by store)
        }
      }
    },
  });

  // Load config from script tag or window
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      
      // Check for window.comviaSettings
      const windowConfig = (window as any).comviaSettings || {};
      const companyIdFromConfig = windowConfig.companyId;
      
      // Check for data attributes on script tag
      const script = document.querySelector('script[data-comvia]');
      const dataConfig = script ? (script as HTMLElement).dataset : {};

      // Build base config
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

      // ✅ If there's a companyId, fetch settings from API
      if (companyIdFromConfig) {
        setCompanyId(companyIdFromConfig);
        try {
          const response = await widgetAPI.getCompanySettings(companyIdFromConfig);
          if (response.success && response.data) {
            const settingsData = response.data;
            const widgetSettings: WidgetSettings = {
              position: settingsData.widgetSettings?.position || config.position || 'bottom-right',
              color: settingsData.widgetSettings?.color || config.color || '#F97316',
              icon: settingsData.widgetSettings?.icon || config.icon || 'chat',
              font: settingsData.widgetSettings?.font || 'inter',
              welcomeMessage: settingsData.widgetSettings?.welcomeMessage || 'Hi there! 👋 How can I help you today?',
              quickReplies: settingsData.widgetSettings?.quickReplies || [],
              companyName: settingsData.companyName || config.companyName || 'Comvia',
              companyLogo: settingsData.companyLogo || config.companyLogo,
            };
            setSettings(widgetSettings);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('❌ Failed to fetch company settings:', error);
        }
      }

      // Fallback: Use local config
      const fallbackSettings: WidgetSettings = {
        position: config.position as WidgetSettings['position'],
        color: config.color!,
        icon: config.icon!,
        font: 'inter',
        welcomeMessage: 'Hi there! 👋 How can I help you today?',
        quickReplies: [],
        companyName: config.companyName,
        companyLogo: config.companyLogo,
      };
      setSettings(fallbackSettings);

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
    // const newMessage = addMessage({ content, sender });
    
    if (socketConnected) {
      sendSocketMessage(content, sender);
    } else {
      widgetAPI.sendMessage({
        content,
        sender,
        userId: user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
      }).then(response => {
        if (response.success && response.data) {
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
}
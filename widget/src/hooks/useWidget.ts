
// widget/src/hooks/useWidget.ts

import { useEffect, useState, useCallback } from 'react';
import { useWidgetStore } from '../store/widgetStore';
import { useWidgetContext } from '../context/WidgetContext';
import type { WidgetConfig, WidgetSettings } from '../types';
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

  // ✅ Get the context for socket operations
  const context = useWidgetContext();
  
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // ✅ Get or create persistent visitor ID
  const getOrCreateVisitorId = useCallback((): string => {
    let visitorId = localStorage.getItem('comvia_visitor_id');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('comvia_visitor_id', visitorId);
      // console.log('🆕 [WIDGET] Created new visitor ID:', visitorId);
    } else {
      // console.log('♻️ [WIDGET] Using existing visitor ID:', visitorId);
    }
    return visitorId;
  }, []);

  const visitorId = getOrCreateVisitorId();

  // ✅ Load config
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      
      const windowConfig = (window as any).comviaSettings || {};
      const companyIdFromConfig = windowConfig.companyId;
      
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

      // Fallback settings
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

      if (!user) {
        setUser({
          id: visitorId,
          name: 'Visitor',
        });
      }

      setIsLoading(false);
    };

    loadConfig();
  }, [setSettings, setUser, user, visitorId]);

  // ✅ Use context's socket connection status
  const socketConnected = context.isConnected;

  // ✅ Send message using context's sendMessage
  const sendMessage = useCallback((content: string, sender: 'user' | 'agent' = 'user') => {
    if (!content || !content.trim()) return;
    
    // console.log(`📤 [WIDGET] Sending message: "${content}" from ${sender}`);
    
    // Add user message immediately (optimistic)
    addMessage({ content, sender });
    
    // ✅ Use context's sendMessage which handles socket + REST
    context.sendMessage(content, sender);
    
  }, [addMessage, context]);

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    try {
      const response = await widgetAPI.getHistory(visitorId);
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
  }, [visitorId, setMessages]);

  // Send typing indicator using context
  const sendTyping = useCallback((isTyping: boolean) => {
    setTyping(isTyping);
    context.sendTyping(isTyping);
  }, [setTyping, context]);

  // Connect socket using context
  const connectSocket = useCallback(() => {
    context.connectSocket();
  }, [context]);

  const disconnectSocket = useCallback(() => {
    context.disconnectSocket();
  }, [context]);

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
    error: error || context.error,
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
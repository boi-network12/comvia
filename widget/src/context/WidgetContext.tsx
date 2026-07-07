// widget/src/context/WidgetContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useWidgetStore } from '../store/widgetStore';
import { useSocket } from '../hooks/useSocket';
import { widgetAPI } from '../utils/api';
import { WIDGET_CONFIG } from '../config';
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
    setUser,
    setConnected,
    clearUnread,
  } = useWidgetStore();

  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null); // ✅ Added companyId state

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
      if (message.sender === 'bot' || message.sender === 'agent') {
        // Additional processing if needed
      }
    },
  });

  // Load config from script tag or window
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

      // ✅ If companyId exists, fetch settings from API
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
              welcomeMessage: settingsData.widgetSettings?.welcomeMessage || 'Hi there! 👋',
              quickReplies: settingsData.widgetSettings?.quickReplies || ['Pricing', 'Features', 'Support', 'Demo'],
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
        welcomeMessage: WIDGET_CONFIG.DEFAULTS.welcomeMessage,
        quickReplies: WIDGET_CONFIG.DEFAULTS.quickReplies as any,
        companyName: config.companyName,
        companyLogo: config.companyLogo,
      };
      setSettings(fallbackSettings);

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
  // const sendMessage = (content: string, sender: 'user' | 'agent' = 'user') => {
  //   addMessage({ content, sender });
    
  //   // if (socketConnected) {
  //   //   sendSocketMessage(content, sender);
  //   // } else {
  //   //   widgetAPI.sendMessage({
  //   //     content,
  //   //     sender,
  //   //     userId: user?.id || 'anonymous',
  //   //     timestamp: new Date().toISOString(),
  //   //   }).then(response => {
  //   //     if (response.success && response.data) {
  //   //       addMessage({
  //   //         content: response.data.reply || 'Thanks for your message!',
  //   //         sender: 'bot',
  //   //       });
  //   //     }
  //   //   }).catch(err => {
  //   //     console.error('Failed to send message:', err);
  //   //     addMessage({
  //   //       content: '⚠️ Failed to send message. Please try again.',
  //   //       sender: 'bot',
  //   //     });
  //   //   });
  //   // }
  //   // Try socket first if connected
  //   if (socketConnected) {
  //     sendSocketMessage(content, sender);
  //     return;
  //   }
  // };

  const sendMessage = (content: string, sender: 'user' | 'agent' = 'user') => {
    // Add user message immediately
    addMessage({ content, sender });
    
    // Try socket first if connected
    if (socketConnected) {
      sendSocketMessage(content, sender);
      return;
    }
    
    // Fallback to REST API
    widgetAPI.sendMessage({
      content,
      sender,
      userId: user?.id || localStorage.getItem('comvia_user_id') || `visitor_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }).then(response => {
      if (response.success && response.data) {
        // Add bot reply
        addMessage({
          content: response.data.reply || 'Thanks for your message!',
          sender: 'bot',
        });
      } else {
        // Show error
        addMessage({
          content: '⚠️ Sorry, I couldn\'t process your message. Please try again.',
          sender: 'bot',
        });
      }
    }).catch(err => {
      console.error('Failed to send message:', err);
      addMessage({
        content: '⚠️ Connection error. Please try again later.',
        sender: 'bot',
      });
    });
  };

  // Send typing indicator
  const sendTyping = (isTyping: boolean) => {
    setTyping(isTyping);
    if (socketConnected) {
      sendSocketTyping(isTyping);
    }
  };

  // // Connect socket when widget opens
  // useEffect(() => {
  //   if (isOpen && !socketConnected) {
  //     connectSocket();
  //   }
  // }, [isOpen, socketConnected, connectSocket]);
  
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
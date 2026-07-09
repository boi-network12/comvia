// // widget/src/hooks/useWidget.ts

// import { useEffect, useState, useCallback, useMemo } from 'react';
// import { useWidgetStore } from '../store/widgetStore';
// import { useSocket } from './useSocket';
// import type { SocketMessage, WidgetConfig, WidgetSettings } from '../types';
// import { widgetAPI } from '../utils/api';
// import { WIDGET_CONFIG } from '../config';

// export function useWidget() {
//   const {
//     isOpen,
//     isMinimized,
//     messages,
//     isTyping,
//     unreadCount,
//     settings,
//     user,
//     toggleWidget,
//     openWidget,
//     closeWidget,
//     minimizeWidget,
//     maximizeWidget,
//     addMessage,
//     setMessages,
//     setTyping,
//     setSettings,
//     setUser,
//     setConnected,
//     clearUnread,
//   } = useWidgetStore();

//   const [config, setConfig] = useState<WidgetConfig | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error] = useState<string | null>(null);
//   const [companyId, setCompanyId] = useState<string | null>(null);
  
//   // ✅ Get or create persistent visitor ID
//   const getOrCreateVisitorId = useCallback((): string => {
//     let visitorId = localStorage.getItem('comvia_visitor_id');
//     if (!visitorId) {
//       visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//       localStorage.setItem('comvia_visitor_id', visitorId);
//       console.log('🆕 [WIDGET] Created new visitor ID:', visitorId);
//     } else {
//       console.log('♻️ [WIDGET] Using existing visitor ID:', visitorId);
//     }
//     return visitorId;
//   }, []);

//   const visitorId = getOrCreateVisitorId();

//   const socketOptions = useMemo(() => ({
//     visitorId: visitorId,
//     companyId: (window as any).comviaSettings?.companyId,
//     onAgentMessage: (data: { content: string; conversationId: string, senderId: string }) => {
//       console.log('📨 [Widget] Agent reply via socket:', data);
//       addMessage({
//         content: data.content,
//         sender: 'agent',
//       });
//     },
//     onMessage: (message: SocketMessage) => {
//       console.log('📨 [Widget] New message via socket:', message);

//       const content = message.content || message.message || '';
//       if (!content) return;

//       // ✅ Check senderType (database format) OR sender (widget format)
//     const isAgent = message.senderType === 'agent' || 
//                     message.senderType === 'admin' ||
//                     message.sender === 'agent' || 
//                     message.sender === 'admin';
    
//     const isSystem = message.senderType === 'system' || message.sender === 'system';
//     const isVisitor = message.senderType === 'visitor' || message.sender === 'visitor';

//       let sender: 'user' | 'bot' | 'agent' = 'bot';

//       if (isAgent) {
//         sender = 'agent';
//       } else if (isSystem) {
//         sender = 'bot';
//       } else if (isVisitor) {
//         sender = 'user';
//       } else {
//         sender = 'bot';
//       }

//       addMessage({
//         content,
//         sender,
//         // Let addMessage / store handle id and timestamp if needed
//       });
//     },
//   }), [visitorId, addMessage]);

//   // ✅ Socket connection for real-time replies
//   const {
//     isConnected: socketConnected,
//     error: socketError,
//     connect: connectSocket,
//     disconnect: disconnectSocket,
//     sendMessage: sendSocketMessage,
//     sendTyping: sendSocketTyping,
//   } = useSocket(socketOptions);

//   // Update connection status
//   useEffect(() => {
//     setConnected(socketConnected);
//   }, [socketConnected, setConnected]);

//   // Load config
//   useEffect(() => {
//     const loadConfig = async () => {
//       setIsLoading(true);
      
//       const windowConfig = (window as any).comviaSettings || {};
//       const companyIdFromConfig = windowConfig.companyId;
      
//       const script = document.querySelector('script[data-comvia]');
//       const dataConfig = script ? (script as HTMLElement).dataset : {};

//       const config: WidgetConfig = {
//         position: windowConfig.position || dataConfig.position || WIDGET_CONFIG.DEFAULTS.position,
//         color: windowConfig.color || dataConfig.color || WIDGET_CONFIG.DEFAULTS.color,
//         icon: windowConfig.icon || dataConfig.icon || WIDGET_CONFIG.DEFAULTS.icon,
//         companyName: windowConfig.companyName || dataConfig.companyName || 'Comvia',
//         companyLogo: windowConfig.companyLogo || dataConfig.companyLogo,
//         apiUrl: windowConfig.apiUrl || dataConfig.apiUrl || WIDGET_CONFIG.API_URL,
//         socketUrl: windowConfig.socketUrl || dataConfig.socketUrl || WIDGET_CONFIG.SOCKET_URL,
//       };

//       setConfig(config);

//       if (companyIdFromConfig) {
//         setCompanyId(companyIdFromConfig);
//         try {
//           const response = await widgetAPI.getCompanySettings(companyIdFromConfig);
//           if (response.success && response.data) {
//             const settingsData = response.data;
//             const widgetSettings: WidgetSettings = {
//               position: settingsData.widgetSettings?.position || config.position || 'bottom-right',
//               color: settingsData.widgetSettings?.color || config.color || '#F97316',
//               icon: settingsData.widgetSettings?.icon || config.icon || 'chat',
//               font: settingsData.widgetSettings?.font || 'inter',
//               welcomeMessage: settingsData.widgetSettings?.welcomeMessage || 'Hi there! 👋 How can I help you today?',
//               quickReplies: settingsData.widgetSettings?.quickReplies || [],
//               companyName: settingsData.companyName || config.companyName || 'Comvia',
//               companyLogo: settingsData.companyLogo || config.companyLogo,
//             };
//             setSettings(widgetSettings);
//             setIsLoading(false);
//             return;
//           }
//         } catch (error) {
//           console.error('❌ Failed to fetch company settings:', error);
//         }
//       }

//       // Fallback settings
//       const fallbackSettings: WidgetSettings = {
//         position: config.position as WidgetSettings['position'],
//         color: config.color!,
//         icon: config.icon!,
//         font: 'inter',
//         welcomeMessage: 'Hi there! 👋 How can I help you today?',
//         quickReplies: [],
//         companyName: config.companyName,
//         companyLogo: config.companyLogo,
//       };
//       setSettings(fallbackSettings);

//       if (!user) {
//         setUser({
//           id: visitorId,
//           name: 'Visitor',
//         });
//       }

//       setIsLoading(false);
//     };

//     loadConfig();
//   }, [setSettings, setUser, user, visitorId]);

//   // ✅ Send message (with socket fallback)
//   const sendMessage = useCallback((content: string, sender: 'user' | 'agent' = 'user') => {
//     if (!content || !content.trim()) return;
    
//     console.log(`📤 [WIDGET] Sending message: "${content}" from ${sender}`);
    
//     // Add user message immediately
//     addMessage({ content, sender });
    
//     const userId = visitorId;
//     // const windowConfig = (window as any).comviaSettings || {};
//     // const companyId = windowConfig.companyId || windowConfig.company_id;
    
//     // ✅ Try WebSocket first for real-time
//     if (socketConnected) {
//       // We need to get the conversation ID - try from localStorage
//       const conversationId = localStorage.getItem('comvia_conversation_id');
//       if (conversationId) {
//         const sent = sendSocketMessage(conversationId, content);
//         if (sent) {
//           console.log('✅ [WIDGET] Message sent via WebSocket');
//           return;
//         }
//       }
//     }
    
//     // ✅ Fallback to REST API
//     console.log('📤 [WIDGET] Falling back to REST API');
//     widgetAPI.sendMessage({
//       content,
//       sender,
//       userId: userId,
//       timestamp: new Date().toISOString(),
//       // ✅ companyId is handled inside widgetAPI.sendMessage
//     }).then(response => {
//       console.log('📥 [WIDGET] Message response:', response);
      
//       if (response.success && response.data) {
//         if (response.data.reply) {
//           addMessage({
//             content: response.data.reply,
//             sender: 'bot',
//           });
//         }
//         if (response.data.conversationId) {
//           localStorage.setItem('comvia_conversation_id', response.data.conversationId);
//           // ✅ Join the conversation room
//           if (socketConnected) {
//             // You'll need access to the socket from useSocket
//             // Add a joinConversation method or use the socket directly
//           }
//         }
//       } else {
//         addMessage({
//           content: '⚠️ Sorry, I couldn\'t process your message. Please try again.',
//           sender: 'bot',
//         });
//       }
//     }).catch(err => {
//       console.error('❌ [WIDGET] Error sending message:', err);
//       addMessage({
//         content: '⚠️ Connection error. Please try again later.',
//         sender: 'bot',
//       });
//     });
//   }, [addMessage, visitorId, socketConnected, sendSocketMessage]);

//   // Load chat history
//   const loadChatHistory = useCallback(async () => {
//     try {
//       const response = await widgetAPI.getHistory(visitorId);
//       if (response.success && response.data) {
//         const historyMessages = response.data.map((msg: any) => ({
//           id: msg.id || Date.now().toString(),
//           content: msg.content || msg.message || 'No content',
//           sender: msg.sender || 'bot',
//           timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
//           status: msg.status || 'delivered',
//         }));
//         setMessages(historyMessages);
//       }
//     } catch (error) {
//       console.error('Failed to load chat history:', error);
//     }
//   }, [visitorId, setMessages]);

//   // Send typing indicator
//   const sendTyping = useCallback((isTyping: boolean) => {
//     setTyping(isTyping);
//     if (socketConnected) {
//       const conversationId = localStorage.getItem('comvia_conversation_id');
//       if (conversationId) {
//         sendSocketTyping(conversationId, isTyping);
//       }
//     }
//   }, [setTyping, socketConnected, sendSocketTyping]);

//   // Connect socket when widget opens
//   useEffect(() => {
//     if (isOpen && !socketConnected) {
//       connectSocket();
//     }
//   }, [isOpen, socketConnected, connectSocket]);

//   return {
//     isOpen,
//     isMinimized,
//     messages,
//     isTyping,
//     unreadCount,
//     settings,
//     user,
//     isConnected: socketConnected,
//     config,
//     isLoading,
//     error: error || socketError,
//     companyId,
//     toggleWidget,
//     openWidget,
//     closeWidget,
//     minimizeWidget,
//     maximizeWidget,
//     sendMessage,
//     sendTyping,
//     setConnected,
//     clearUnread,
//     loadChatHistory,
//     connectSocket,
//     disconnectSocket,
//   };
// }
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
      console.log('🆕 [WIDGET] Created new visitor ID:', visitorId);
    } else {
      console.log('♻️ [WIDGET] Using existing visitor ID:', visitorId);
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
    
    console.log(`📤 [WIDGET] Sending message: "${content}" from ${sender}`);
    
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
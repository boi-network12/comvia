// // widget/src/hooks/useSocket

// import { useEffect, useState, useRef, useCallback } from 'react';
// import { io, Socket } from 'socket.io-client';
// import type { Message } from '../types';

// // ============================================================
// // TYPES
// // ============================================================

// interface UseSocketOptions {
//   socketUrl?: string;
//   visitorId?: string;
//   companyId?: string;
//   onConnect?: () => void;
//   onDisconnect?: () => void;
//   onMessage?: (message: Message) => void;
//   onAgentMessage?: (data: { content: string; conversationId: string; senderId: string }) => void;
// }

// interface UseSocketReturn {
//   socket: Socket | null;
//   isConnected: boolean;
//   error: string | null;
//   connect: () => void;
//   disconnect: () => void;
//   sendMessage: (conversationId: string, content: string) => boolean;
//   sendTyping: (conversationId: string, isTyping: boolean) => void;
//   reconnectAttempts: number;
// }

// const getSocketUrl = () => {
//   const windowConfig = (window as any).comviaSettings || {};
//   return windowConfig.socketUrl || import.meta.env.VITE_SOCKET_URL || 'https://comvia-realtime.fly.dev';
// };

// // ============================================================
// // HOOK
// // ============================================================

// export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
//   const [isConnected, setIsConnected] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
//   const visitorIdRef = useRef<string>(
//     options.visitorId || localStorage.getItem('comvia_visitor_id') || ''
//   );
  
//   const socketRef = useRef<Socket | null>(null);
//   const isConnectingRef = useRef<boolean>(false);
//   const connectionAttemptedRef = useRef<boolean>(false);
//   const mountedRef = useRef<boolean>(true);
//   const cleanupRef = useRef<(() => void) | null>(null);

//   // Cleanup on unmount
//   useEffect(() => {
//     mountedRef.current = true;
    
//     return () => {
//       mountedRef.current = false;
//       if (cleanupRef.current) {
//         cleanupRef.current();
//       }
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//       isConnectingRef.current = false;
//     };
//   }, []);

//   // Validate visitor ID
//   useEffect(() => {
//     if (!visitorIdRef.current) {
//       console.error('❌ [Widget] No visitor ID available!');
//     }
//   }, []);

//   const disconnect = useCallback(() => {
//     if (cleanupRef.current) {
//       cleanupRef.current();
//       cleanupRef.current = null;
//     }
    
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }
    
//     setIsConnected(false);
//     isConnectingRef.current = false;
//     console.log('🔌 [Widget] Disconnected');
//   }, []);

//   const connect = useCallback(() => {
//     // If already connected, return
//     if (socketRef.current?.connected) {
//       console.log('🟢 [Widget] Already connected');
//       return;
//     }

//     // If connection is in progress, return
//     if (isConnectingRef.current) {
//       console.log('⏳ [Widget] Connection already in progress');
//       return;
//     }

//     // Clean up any existing socket
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }

//     // Clean up any existing listeners
//     if (cleanupRef.current) {
//       cleanupRef.current();
//       cleanupRef.current = null;
//     }

//     const visitorId = visitorIdRef.current;
//     if (!visitorId) {
//       console.error('❌ [Widget] Cannot connect: No visitor ID');
//       setError('No visitor ID');
//       return;
//     }

//     const socketUrl = options.socketUrl || getSocketUrl();
//     const companyId = options.companyId || (window as any).comviaSettings?.companyId;

//     console.log(`🔌 [Widget] Connecting to ${socketUrl} as ${visitorId}`);
//     isConnectingRef.current = true;

//     // Create socket
//     const socket = io(socketUrl, {
//       query: {
//         visitorId: visitorId,
//         companyId: companyId || '',
//         type: 'visitor'
//       },
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       timeout: 10000,
//     });

//     socketRef.current = socket;

//     // Set up event listeners
//     const onConnect = () => {
//       if (!mountedRef.current) return;
      
//       console.log('🟢 [Widget] Socket connected!');
//       setIsConnected(true);
//       isConnectingRef.current = false;
//       setError(null);
//       setReconnectAttempts(0);
      
//       // Identify as visitor
//       socket.emit('identify_visitor', {
//         visitorId: visitorId,
//         companyId: companyId,
//         userAgent: navigator.userAgent,
//         url: window.location.href,
//       });
      
//       // Join conversation if we have one
//       const conversationId = localStorage.getItem('comvia_conversation_id');
//       if (conversationId) {
//         socket.emit('join_conversation', conversationId);
//         console.log(`📌 [Widget] Joined conversation: ${conversationId}`);
//       }
      
//       if (options.onConnect) options.onConnect();
//     };

//     const onConnectError = (err: Error) => {
//       if (!mountedRef.current) return;
      
//       console.error('❌ [Widget] Connection error:', err.message);
//       setError(err.message);
//       isConnectingRef.current = false;
//       setReconnectAttempts(prev => prev + 1);
//     };

//     const onDisconnect = (reason: string) => {
//       if (!mountedRef.current) return;
      
//       console.log(`🔴 [Widget] Disconnected: ${reason}`);
//       setIsConnected(false);
//       isConnectingRef.current = false;
      
//       if (options.onDisconnect) options.onDisconnect();
//     };

//     const onAgentMessage = (data: { content: string; conversationId: string; senderId: string }) => {
//       if (!mountedRef.current) return;
//       console.log('📨 [Widget] Agent message:', data);
//       if (options.onAgentMessage) options.onAgentMessage(data);
//     };

//     const onNewMessage = (message: any) => {
//       if (!mountedRef.current) return;
//       console.log('📨 [Widget] New message:', message);
      
//       const isAgent = message.senderType === 'agent' || 
//                     message.senderType === 'admin' ||
//                     message.sender === 'agent' || 
//                     message.sender === 'admin';
      
//       const isSystem = message.senderType === 'system' || message.sender === 'system';
      
//       if (isAgent && options.onAgentMessage) {
//         options.onAgentMessage({
//           content: message.content,
//           conversationId: message.conversationId || message.id,
//           senderId: message.senderId || message._id || 'agent'
//         });
//       }
      
//       if (options.onMessage) {
//         options.onMessage({
//           id: message._id || message.id || Date.now().toString(),
//           content: message.content || message.message || '',
//           sender: isAgent ? 'agent' : 
//                   isSystem ? 'bot' : 
//                   message.senderType === 'visitor' ? 'user' : 
//                   message.sender || 'bot',
//           timestamp: new Date(message.createdAt || message.timestamp || Date.now()),
//           status: message.status || 'delivered'
//         });
//       }
//     };

//     const onMessageSent = (data: { messageId: string; status: string }) => {
//       if (!mountedRef.current) return;
//       console.log('✅ [Widget] Message sent:', data);
//     };

//     const onReconnect = () => {
//       if (!mountedRef.current) return;
//       console.log('🔄 [Widget] Reconnected');
//       setIsConnected(true);
//       setError(null);
//       isConnectingRef.current = false;
      
//       // Re-identify
//       socket.emit('identify_visitor', {
//         visitorId: visitorId,
//         companyId: companyId,
//         userAgent: navigator.userAgent,
//         url: window.location.href,
//       });
      
//       const conversationId = localStorage.getItem('comvia_conversation_id');
//       if (conversationId) {
//         socket.emit('join_conversation', conversationId);
//       }
//     };

//     // Register all listeners
//     socket.on('connect', onConnect);
//     socket.on('connect_error', onConnectError);
//     socket.on('disconnect', onDisconnect);
//     socket.on('agent_message', onAgentMessage);
//     socket.on('new_message', onNewMessage);
//     socket.on('message_sent', onMessageSent);
//     socket.on('reconnect', onReconnect);

//     // Store cleanup function
//     cleanupRef.current = () => {
//       socket.off('connect', onConnect);
//       socket.off('connect_error', onConnectError);
//       socket.off('disconnect', onDisconnect);
//       socket.off('agent_message', onAgentMessage);
//       socket.off('new_message', onNewMessage);
//       socket.off('message_sent', onMessageSent);
//       socket.off('reconnect', onReconnect);
//     };

//     // Connection timeout
//     const timeoutId = setTimeout(() => {
//       if (isConnectingRef.current && mountedRef.current) {
//         console.log('⏰ [Widget] Connection timeout');
//         isConnectingRef.current = false;
//         setError('Connection timeout');
//         socket.disconnect();
//       }
//     }, 15000);

//     // Clean up timeout on connect
//     socket.once('connect', () => {
//       clearTimeout(timeoutId);
//     });

//   }, [options]);

//   const sendMessage = useCallback((conversationId: string, content: string): boolean => {
//     if (!socketRef.current?.connected) {
//       console.warn('⚠️ [Widget] Cannot send message: not connected');
//       return false;
//     }
    
//     socketRef.current.emit('send_message', {
//       conversationId,
//       content,
//       sender: 'visitor',
//       visitorId: visitorIdRef.current,
//       timestamp: new Date().toISOString(),
//     });
    
//     return true;
//   }, []);

//   const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
//     if (!socketRef.current?.connected) return;
//     socketRef.current.emit('typing', {
//       conversationId,
//       isTyping,
//       sender: 'visitor',
//     });
//   }, []);

//   // Auto-connect once on mount
//   useEffect(() => {
//     if (!connectionAttemptedRef.current && visitorIdRef.current) {
//       connectionAttemptedRef.current = true;
      
//       // Small delay to ensure everything is ready
//       const timer = setTimeout(() => {
//         if (mountedRef.current) {
//           connect();
//         }
//       }, 500);
      
//       return () => clearTimeout(timer);
//     }
//   }, [connect]);

//   return {
//     socket: socketRef.current,
//     isConnected,
//     error,
//     connect,
//     disconnect,
//     sendMessage,
//     sendTyping,
//     reconnectAttempts,
//   };
// }
// widget/src/hooks/useSocket.ts

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

// ============================================================
// TYPES
// ============================================================

interface UseSocketOptions {
  socketUrl?: string;
  visitorId?: string;
  companyId?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: Message) => void;
  onAgentMessage?: (data: { content: string; conversationId: string; senderId: string }) => void;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (conversationId: string, content: string) => boolean;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  reconnectAttempts: number;
}

const getSocketUrl = () => {
  const windowConfig = (window as any).comviaSettings || {};
  return windowConfig.socketUrl || import.meta.env.VITE_SOCKET_URL || 'https://comvia-realtime.fly.dev';
};

// ============================================================
// HOOK
// ============================================================

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const messageCacheRef = useRef<Set<string>>(new Set());
  
  const visitorIdRef = useRef<string>(
    options.visitorId || localStorage.getItem('comvia_visitor_id') || ''
  );
  
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const connectionAttemptedRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  // ✅ ADD: Message cache to prevent duplicates
  const processedMessagesRef = useRef<Set<string>>(new Set());

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      isConnectingRef.current = false;
      // Clear message cache on unmount
      processedMessagesRef.current.clear();
    };
  }, []);

  // Validate visitor ID
  useEffect(() => {
    if (!visitorIdRef.current) {
      console.error('❌ [Widget] No visitor ID available!');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    isConnectingRef.current = false;
    console.log('🔌 [Widget] Disconnected');
  }, []);

  const connect = useCallback(() => {
    // If already connected, return
    if (socketRef.current?.connected) {
      console.log('🟢 [Widget] Already connected');
      return;
    }

    // If connection is in progress, return
    if (isConnectingRef.current) {
      console.log('⏳ [Widget] Connection already in progress');
      return;
    }

    // Clean up any existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Clean up any existing listeners
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // ✅ Clear message cache on new connection
    processedMessagesRef.current.clear();

    const visitorId = visitorIdRef.current;
    if (!visitorId) {
      console.error('❌ [Widget] Cannot connect: No visitor ID');
      setError('No visitor ID');
      return;
    }

    const socketUrl = options.socketUrl || getSocketUrl();
    const companyId = options.companyId || (window as any).comviaSettings?.companyId;

    console.log(`🔌 [Widget] Connecting to ${socketUrl} as ${visitorId}`);
    isConnectingRef.current = true;

    // Create socket
    const socket = io(socketUrl, {
      query: {
        visitorId: visitorId,
        companyId: companyId || '',
        type: 'visitor'
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socketRef.current = socket;

    // ✅ Helper to process message with deduplication
    // const processMessage = (message: any) => {
    //   const messageId = message._id || message.id;
      
    //   // ✅ Skip if already processed
    //   if (messageId && processedMessagesRef.current.has(messageId)) {
    //     console.log(`⏭️ [Widget] Skipping duplicate message: ${messageId}`);
    //     return false;
    //   }
      
    //   // ✅ Add to processed set
    //   if (messageId) {
    //     processedMessagesRef.current.add(messageId);
    //   }
      
    //   return true;
    // };

    // Set up event listeners
    const onConnect = () => {
      if (!mountedRef.current) return;
      
      console.log('🟢 [Widget] Socket connected!');
      setIsConnected(true);
      isConnectingRef.current = false;
      setError(null);
      setReconnectAttempts(0);
      
      // Identify as visitor
      socket.emit('identify_visitor', {
        visitorId: visitorId,
        companyId: companyId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      
      // Join conversation if we have one
      const conversationId = localStorage.getItem('comvia_conversation_id');
      if (conversationId) {
        socket.emit('join_conversation', conversationId);
        console.log(`📌 [Widget] Joined conversation: ${conversationId}`);
      }
      
      if (options.onConnect) options.onConnect();
    };

    const onConnectError = (err: Error) => {
      if (!mountedRef.current) return;
      
      console.error('❌ [Widget] Connection error:', err.message);
      setError(err.message);
      isConnectingRef.current = false;
      setReconnectAttempts(prev => prev + 1);
    };

    const onDisconnect = (reason: string) => {
      if (!mountedRef.current) return;
      
      console.log(`🔴 [Widget] Disconnected: ${reason}`);
      setIsConnected(false);
      isConnectingRef.current = false;
      
      if (options.onDisconnect) options.onDisconnect();
    };

    const onAgentMessage = (data: { content: string; conversationId: string; senderId: string }) => {
      if (!mountedRef.current) return;
      
      // ✅ Use a composite key for agent messages (content + conversationId)
      const key = `agent_${data.conversationId}_${data.content}_${data.senderId}`;
      if (processedMessagesRef.current.has(key)) {
        console.log(`⏭️ [Widget] Skipping duplicate agent message: ${key}`);
        return;
      }
      processedMessagesRef.current.add(key);
      
      console.log('📨 [Widget] Agent message:', data);
      if (options.onAgentMessage) options.onAgentMessage(data);
    };

    const onNewMessage = (message: any) => {
      if (!mountedRef.current) return;

      // ✅ Create a unique key for this message
      const messageKey = `${message._id || message.id || ''}_${message.content}_${message.createdAt || message.timestamp || ''}`;
      
      // ✅ Skip if already processed
      if (messageKey && messageCacheRef.current.has(messageKey)) {
        console.log(`⏭️ [Widget] Skipping duplicate message (cache): ${messageKey}`);
        return;
      }
      
      // ✅ Add to cache
      if (messageKey) {
        messageCacheRef.current.add(messageKey);
      }
      
      console.log('📨 [Widget] New message:', message);
      
      const isAgent = message.senderType === 'agent' || 
                    message.senderType === 'admin' ||
                    message.sender === 'agent' || 
                    message.sender === 'admin';
      
      const isSystem = message.senderType === 'system' || message.sender === 'system';
      
      // ✅ Only trigger agent message if it's actually from an agent
      if (isAgent && options.onAgentMessage) {
        options.onAgentMessage({
          content: message.content,
          conversationId: message.conversationId || message.id,
          senderId: message.senderId || message._id || 'agent'
        });
      }
      
      if (options.onMessage) {
        options.onMessage({
          id: message._id || message.id || Date.now().toString(),
          content: message.content || message.message || '',
          sender: isAgent ? 'agent' : 
                  isSystem ? 'bot' : 
                  message.senderType === 'visitor' ? 'user' : 
                  message.sender || 'bot',
          timestamp: new Date(message.createdAt || message.timestamp || Date.now()),
          status: message.status || 'delivered'
        });
      }
    };

    const onMessageSent = (data: { messageId: string; status: string }) => {
      if (!mountedRef.current) return;
      console.log('✅ [Widget] Message sent:', data);
    };

    const onReconnect = () => {
      if (!mountedRef.current) return;
      console.log('🔄 [Widget] Reconnected');
      setIsConnected(true);
      setError(null);
      isConnectingRef.current = false;
      
      // Re-identify
      socket.emit('identify_visitor', {
        visitorId: visitorId,
        companyId: companyId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      
      const conversationId = localStorage.getItem('comvia_conversation_id');
      if (conversationId) {
        socket.emit('join_conversation', conversationId);
      }
    };

    // Register all listeners
    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);
    socket.on('agent_message', onAgentMessage);
    socket.on('new_message', onNewMessage);
    socket.on('message_sent', onMessageSent);
    socket.on('reconnect', onReconnect);

    // Store cleanup function
    cleanupRef.current = () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
      socket.off('agent_message', onAgentMessage);
      socket.off('new_message', onNewMessage);
      socket.off('message_sent', onMessageSent);
      socket.off('reconnect', onReconnect);
    };

    // Connection timeout
    const timeoutId = setTimeout(() => {
      if (isConnectingRef.current && mountedRef.current) {
        console.log('⏰ [Widget] Connection timeout');
        isConnectingRef.current = false;
        setError('Connection timeout');
        socket.disconnect();
      }
    }, 15000);

    // Clean up timeout on connect
    socket.once('connect', () => {
      clearTimeout(timeoutId);
    });

  }, [options]);

  const sendMessage = useCallback((conversationId: string, content: string): boolean => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ [Widget] Cannot send message: not connected');
      return false;
    }
    
    socketRef.current.emit('send_message', {
      conversationId,
      content,
      sender: 'visitor',
      visitorId: visitorIdRef.current,
      timestamp: new Date().toISOString(),
    });
    
    return true;
  }, []);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('typing', {
      conversationId,
      isTyping,
      sender: 'visitor',
    });
  }, []);

  // Auto-connect once on mount
  useEffect(() => {
    if (!connectionAttemptedRef.current && visitorIdRef.current) {
      connectionAttemptedRef.current = true;
      
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          connect();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [connect]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    reconnectAttempts,
  };
}
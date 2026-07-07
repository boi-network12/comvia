// // widget/src/hooks/useSocket.ts

// import { useEffect, useRef, useState } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useWidgetStore } from '../store/widgetStore';
// import type { Message } from '../types';
// import { WIDGET_CONFIG } from '../config';

// interface UseSocketOptions {
//   socketUrl?: string;
//   userId?: string;
//   onConnect?: () => void;
//   onDisconnect?: () => void;
//   onMessage?: (message: Message) => void;
// }

// export function useSocket(options: UseSocketOptions = {}) {
//   const [isConnected, setIsConnected] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const socketRef = useRef<Socket | null>(null);
//   const reconnectAttempts = useRef(0);
//   const isConnecting = useRef(false); 
//   const isMounted = useRef(true);
//   const userIdRef = useRef<string | null>(null);

//   const { addMessage, setConnected } = useWidgetStore();

//    // Clean up function
//   const cleanupSocket = () => {
//     if (socketRef.current) {
//       // Remove all listeners before disconnecting
//       socketRef.current.removeAllListeners();
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }
//     isConnecting.current = false;
//     setIsConnected(false);
//     setConnected(false);
//   };

//   const connect = () => {
//      // ✅ Prevent connection if component is unmounted
//     if (!isMounted.current) {
//       console.log('⏳ Component unmounted, skipping connection');
//       return;
//     }
    
//     // ✅ Prevent multiple connection attempts
//     if (isConnecting.current) {
//       console.log('⏳ Connection already in progress, skipping...');
//       return;
//     }

//     if (socketRef.current?.connected) {
//       console.log('✅ Already connected');
//       return;
//     }

//     // ✅ Clean up existing socket
//     cleanupSocket();
    
//     // Get or create userId
//     let userId = options.userId || localStorage.getItem(WIDGET_CONFIG.STORAGE_KEYS.USER_ID);

//     if (!userId) {
//       // Generate a consistent visitor ID
//       const timestamp = Date.now();
//       const random = Math.random().toString(36).substring(2, 8);
//       userId = `visitor-${timestamp}-${random}`;
//       localStorage.setItem(WIDGET_CONFIG.STORAGE_KEYS.USER_ID, userId);
//     }

//     userIdRef.current = userId;

//     // ✅ Clean up existing socket before creating new one
//     // if (socketRef.current) {
//     //   socketRef.current.disconnect();
//     //   socketRef.current = null;
//     // }

//     // isConnecting.current = true;

//     const socketUrl = options.socketUrl || 
//                       import.meta.env.VITE_SOCKET_URL || 
//                       WIDGET_CONFIG.SOCKET_URL;
//     // const userId = options.userId || 
//     //                localStorage.getItem(WIDGET_CONFIG.STORAGE_KEYS.USER_ID) || 
//     //                `visitor_${Date.now()}`;
    

//     isConnecting.current = true;

//     // Store user ID
//     localStorage.setItem(WIDGET_CONFIG.STORAGE_KEYS.USER_ID, userId);

//     console.log('🔌 Connecting to socket server:', socketUrl);

//     // socketRef.current = io(socketUrl, {
//     //   transports: WIDGET_CONFIG.SOCKET.transports as any,
//     //   reconnection: WIDGET_CONFIG.SOCKET.reconnection,
//     //   reconnectionAttempts: WIDGET_CONFIG.SOCKET.reconnectionAttempts,
//     //   reconnectionDelay: WIDGET_CONFIG.SOCKET.reconnectionDelay,
//     //   reconnectionDelayMax: WIDGET_CONFIG.SOCKET.reconnectionDelayMax,
//     //   timeout: WIDGET_CONFIG.TIMEOUTS.socket,
//     //   query: {
//     //     userId,
//     //     type: 'visitor',
//     //   },
//     //   withCredentials: true,
//     //   path: '/socket.io/',
//     //   // ✅ Force websocket transport
//     //   upgrade: true,
//     //   rememberUpgrade: true,
//     // });

//     socketRef.current = io(socketUrl, {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       timeout: 10000,
//       query: {
//         userId,
//         type: 'visitor',
//       },
//       withCredentials: true,
//       path: '/socket.io/',
//     });

//     socketRef.current.on('connect', () => {
//       console.log('✅ Socket connected:', socketRef.current?.id);
//       setIsConnected(true);
//       setConnected(true);
//       reconnectAttempts.current = 0;
//       isConnecting.current = false;
      
//       socketRef.current?.emit('join', { userId, type: 'visitor' });
//       options.onConnect?.();
//     });

//     socketRef.current.on('connect', () => {
//       // Track visitor
//       socketRef.current?.emit('track_visitor', {
//         name: 'Visitor',
//         page: window.location.pathname,
//         referrer: document.referrer,
//       });
//     });

//     // Connection events
//     // socketRef.current.on('connect', () => {
//     //   console.log('✅ Socket connected:', socketRef.current?.id);
//     //   setIsConnected(true);
//     //   setConnected(true);
//     //   reconnectAttempts.current = 0;
//     //   options.onConnect?.();
      
//     //   socketRef.current?.emit('join', { userId, type: 'visitor' });
//     // });

//     socketRef.current.on('connect_error', (err) => {
//       console.error('❌ Socket connection error:', err.message);
//       setError(err.message);
//       setIsConnected(false);
//       setConnected(false);
//       isConnecting.current = false;
//     });

//     socketRef.current.on('disconnect', (reason) => {
//       console.log('🔌 Socket disconnected:', reason);
//       setIsConnected(false);
//       setConnected(false);
//       isConnecting.current = false;
//       options.onDisconnect?.();
//     });

//     socketRef.current.on('reconnect_attempt', (attempt) => {
//       reconnectAttempts.current = attempt;
//       console.log(`🔄 Reconnection attempt ${attempt}/${WIDGET_CONFIG.SOCKET.reconnectionAttempts}`);
//     });

//     socketRef.current.on('reconnect_failed', () => {
//       console.error('❌ Failed to reconnect after maximum attempts');
//       setError('Failed to connect to chat server');
//     });

//     // Message events
//     socketRef.current.on('message', (data: any) => {
//       console.log('📨 Received message:', data);
      
//       const message: Message = {
//         id: data.id || Date.now().toString(),
//         content: data.content || data.message || 'No message content',
//         sender: data.sender || 'bot',
//         timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
//         status: data.status || 'delivered',
//       };

//       addMessage(message);
//       options.onMessage?.(message);
//     });

//     // Typing events
//     socketRef.current.on('typing', (data: any) => {
//       const { setTyping } = useWidgetStore.getState();
//       setTyping(data.isTyping || false);
//     });

//     socketRef.current.on('system', (data: any) => {
//       console.log('📢 System message:', data.message);
//       if (data.message) {
//         const message: Message = {
//           id: `system_${Date.now()}`,
//           content: data.message,
//           sender: 'bot',
//           timestamp: new Date(),
//           status: 'delivered',
//         };
//         addMessage(message);
//       }
//     });

//     socketRef.current.on('error', (data: any) => {
//       console.error('❌ Socket error:', data);
//       setError(data.message || 'Socket error occurred');
//     });
//   };

//   const disconnect = () => {
//     isConnecting.current = false;
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//       socketRef.current = null;
//       setIsConnected(false);
//       setConnected(false);
//     }
//   };

//   const sendMessage = (content: string, sender: 'user' | 'agent' = 'user') => {
//     if (!socketRef.current?.connected) {
//       console.warn('⚠️ Cannot send message: socket not connected');
//       return false;
//     }

//     const message = {
//       content,
//       sender,
//       timestamp: new Date().toISOString(),
//       type: 'message',
//     };

//     socketRef.current.emit('message', message);
//     return true;
//   };

//   const sendTyping = (isTyping: boolean) => {
//     if (!socketRef.current?.connected) return;
//     socketRef.current.emit('typing', { isTyping });
//   };

//   useEffect(() => {
//     connect();
//     return () => disconnect();
//   }, []);

//   return {
//     socket: socketRef.current,
//     isConnected,
//     error,
//     connect,
//     disconnect,
//     sendMessage,
//     sendTyping,
//     reconnectAttempts: reconnectAttempts.current,
//   };
// }

// widget/src/hooks/useSocket.ts

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWidgetStore } from '../store/widgetStore';
import type { Message } from '../types';
import { WIDGET_CONFIG } from '../config';

interface UseSocketOptions {
  socketUrl?: string;
  userId?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: Message) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const isConnecting = useRef(false);
  const isMounted = useRef(true);
  const userIdRef = useRef<string | null>(null);

  const { addMessage, setConnected } = useWidgetStore();

  // Clean up function
  const cleanupSocket = () => {
    if (socketRef.current) {
      // Remove all listeners before disconnecting
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    isConnecting.current = false;
    setIsConnected(false);
    setConnected(false);
  };

  const connect = () => {
    // ✅ Prevent connection if component is unmounted
    if (!isMounted.current) {
      console.log('⏳ Component unmounted, skipping connection');
      return;
    }

    // ✅ Prevent multiple connection attempts
    if (isConnecting.current) {
      console.log('⏳ Connection already in progress, skipping...');
      return;
    }

    // ✅ Check if already connected
    if (socketRef.current?.connected) {
      console.log('✅ Already connected');
      return;
    }

    // ✅ Clean up existing socket
    cleanupSocket();

    // Get or create userId
    let userId = options.userId || localStorage.getItem(WIDGET_CONFIG.STORAGE_KEYS.USER_ID);
    
    if (!userId) {
      // Generate a consistent visitor ID
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      userId = `visitor-${timestamp}-${random}`;
      localStorage.setItem(WIDGET_CONFIG.STORAGE_KEYS.USER_ID, userId);
    }
    
    userIdRef.current = userId;

    const socketUrl = options.socketUrl || 
                      import.meta.env.VITE_SOCKET_URL || 
                      WIDGET_CONFIG.SOCKET_URL;

    console.log('🔌 Connecting to socket server:', socketUrl);
    console.log('👤 User ID:', userId);

    isConnecting.current = true;

    try {
      // Create socket connection with proper configuration
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        query: {
          userId: userId,
          type: 'visitor',
        },
        withCredentials: true,
        path: '/socket.io/',
        forceNew: true, // Force new connection
      });

      // Connection event handlers
      socketRef.current.on('connect', () => {
        if (!isMounted.current) return;
        
        console.log('✅ Socket connected:', socketRef.current?.id);
        setIsConnected(true);
        setConnected(true);
        reconnectAttempts.current = 0;
        isConnecting.current = false;
        
        // Join room
        socketRef.current?.emit('join', { 
          userId: userId, 
          type: 'visitor' 
        });

        // Track visitor
        socketRef.current?.emit('track_visitor', {
          name: 'Visitor',
          page: window.location.pathname,
          referrer: document.referrer,
        });

        options.onConnect?.();
      });

      socketRef.current.on('connect_error', (err) => {
        if (!isMounted.current) return;
        
        console.error('❌ Socket connection error:', err.message);
        setError(err.message);
        setIsConnected(false);
        setConnected(false);
        isConnecting.current = false;
      });

      socketRef.current.on('disconnect', (reason) => {
        if (!isMounted.current) return;
        
        console.log('🔌 Socket disconnected:', reason);
        setIsConnected(false);
        setConnected(false);
        isConnecting.current = false;
        options.onDisconnect?.();
      });

      socketRef.current.on('reconnect_attempt', (attempt) => {
        if (!isMounted.current) return;
        
        reconnectAttempts.current = attempt;
        console.log(`🔄 Reconnection attempt ${attempt}/5`);
      });

      socketRef.current.on('reconnect_failed', () => {
        if (!isMounted.current) return;
        
        console.error('❌ Failed to reconnect after maximum attempts');
        setError('Failed to connect to chat server');
        setIsConnected(false);
        setConnected(false);
        isConnecting.current = false;
      });

      // Message events
      socketRef.current.on('message', (data: any) => {
        if (!isMounted.current) return;
        
        console.log('📨 Received message:', data);
        
        const message: Message = {
          id: data.id || Date.now().toString(),
          content: data.content || data.message || 'No message content',
          sender: data.sender || 'bot',
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          status: data.status || 'delivered',
        };

        addMessage(message);
        options.onMessage?.(message);
      });

      // Typing events
      socketRef.current.on('typing', (data: any) => {
        if (!isMounted.current) return;
        
        const { setTyping } = useWidgetStore.getState();
        setTyping(data.isTyping || false);
      });

      socketRef.current.on('system', (data: any) => {
        if (!isMounted.current) return;
        
        console.log('📢 System message:', data.message);
        if (data.message) {
          const message: Message = {
            id: `system_${Date.now()}`,
            content: data.message,
            sender: 'bot',
            timestamp: new Date(),
            status: 'delivered',
          };
          addMessage(message);
        }
      });

      socketRef.current.on('error', (data: any) => {
        if (!isMounted.current) return;
        
        console.error('❌ Socket error:', data);
        setError(data.message || 'Socket error occurred');
      });

    } catch (err) {
      console.log('⚠️ Socket connection unavailable, using REST fallback');
      setIsConnected(false);
      setConnected(false);
      isConnecting.current = false;
    }
  };

  const disconnect = () => {
    console.log('🔌 Disconnecting socket...');
    cleanupSocket();
  };

  const sendMessage = (content: string, sender: 'user' | 'agent' = 'user') => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Cannot send message: socket not connected');
      return false;
    }

    try {
      const message = {
        content,
        sender,
        userId: userIdRef.current,
        timestamp: new Date().toISOString(),
        type: 'message',
      };

      socketRef.current.emit('message', message);
      return true;
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      return false;
    }
  };

  const sendTyping = (isTyping: boolean) => {
    if (!socketRef.current?.connected) return;
    
    try {
      socketRef.current.emit('typing', { 
        isTyping,
        userId: userIdRef.current 
      });
    } catch (err) {
      console.error('❌ Failed to send typing indicator:', err);
    }
  };

  // Effect for connection management
  useEffect(() => {
    isMounted.current = true;
    
    // Connect on mount with small delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        connect();
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
      
      // Clean up socket
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      isConnecting.current = false;
    };
  }, []); // Empty dependency array - only run once

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    reconnectAttempts: reconnectAttempts.current,
  };
}
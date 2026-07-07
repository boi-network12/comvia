// widget/src/config/index.ts

export const WIDGET_CONFIG = {
  // API Endpoints
  API_URL: import.meta.env.VITE_API_URL || 'https://comvia-backend-endpoint.vercel.app/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'https://comvia-realtime.fly.dev',
  
  
  // Widget Defaults
  DEFAULTS: {
    position: 'bottom-right' as const,
    color: '#F97316',
    icon: 'chat',
    font: 'inter',
    welcomeMessage: 'Hi there! 👋 How can I help you today?',
    quickReplies: [],
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    USER_ID: 'comvia_user_id',
    TOKEN: 'comvia_token',
    SETTINGS: 'comvia_settings',
  },
  
  // Socket Configuration
  SOCKET: {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  },
  
  // API Timeouts
  TIMEOUTS: {
    api: 10000,
    socket: 20000,
  },
  
  // Widget Limits
  LIMITS: {
    maxQuickReplies: 6,
    maxMessageLength: 1000,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
} as const;

export type WidgetConfig = typeof WIDGET_CONFIG;
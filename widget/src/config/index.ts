// widget/src/config/index.ts


// ✅ Get the correct API URL
const getApiUrl = () => {
  // Check window config first
  if (typeof window !== 'undefined' && (window as any).comviaSettings?.apiUrl) {
    return (window as any).comviaSettings.apiUrl;
  }
  // Check Vite env
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Production fallback
  return 'https://comvia-backend-endpoint.vercel.app/api';
};

const getSocketUrl = () => {
  if (typeof window !== 'undefined' && (window as any).comviaSettings?.socketUrl) {
    return (window as any).comviaSettings.socketUrl;
  }
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  return 'https://comvia-realtime.fly.dev';
};


export const WIDGET_CONFIG = {
  // API Endpoints
  API_URL: getApiUrl(),
  SOCKET_URL: getSocketUrl(),
  
  
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


export interface WidgetConfig {
  API_URL: string;
  SOCKET_URL: string;
  DEFAULTS: {
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    color: string;
    icon: string;
    font: string;
    welcomeMessage: string;
    quickReplies: string[];
  };
  STORAGE_KEYS: {
    USER_ID: string;
    TOKEN: string;
    SETTINGS: string;
  };
  SOCKET: {
    transports: string[];
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    reconnectionDelayMax: number;
    timeout: number;
  };
  TIMEOUTS: {
    api: number;
    socket: number;
  };
  LIMITS: {
    maxQuickReplies: number;
    maxMessageLength: number;
    maxFileSize: number;
  };
}
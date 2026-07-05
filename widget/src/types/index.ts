// src/types/index.ts

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface WidgetSettings {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color: string;
  icon: string;
  font: string;
  welcomeMessage: string;
  quickReplies: string[];
  companyName?: string;
  companyLogo?: string;
}

export interface WidgetState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: Message[];
  isTyping: boolean;
  unreadCount: number;
  settings: WidgetSettings | null;
  user: User | null;
  isConnected: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Widget configuration from script tag
export interface WidgetConfig {
  position?: WidgetSettings['position'];
  color?: string;
  icon?: string;
  companyName?: string;
  companyLogo?: string;
  apiUrl?: string;
  socketUrl?: string;
}
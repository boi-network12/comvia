// src/types/index.ts

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'agent' | 'admin';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  senderType?: 'system' | 'agent' | 'admin' | 'visitor' | 'user';
  senderId?: string;
  conversationId?: string;
  createdAt?: string;
}

export interface DBMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: 'system' | 'agent' | 'admin' | 'visitor' | 'user';  
  senderName?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  readBy: string[];
  deliveredTo: string[];
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface SocketMessage {
  id?: string;
  _id?: string; 
  content: string;
  senderType?: 'agent' | 'user' | 'bot' | 'system' | 'admin' | 'visitor';  
  sender?: 'agent' | 'user' | 'bot' | string;  // ← For compatibility
  senderId?: string;      // ← Database uses senderId
  message?: string;
  timestamp?: string | Date;
  createdAt?: string;     // ← Database uses createdAt
  conversationId?: string;
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
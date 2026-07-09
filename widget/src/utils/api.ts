// widget/src/utils/api.ts
import axios from 'axios';
import type { ApiResponse, Message } from '../types';
import { WIDGET_CONFIG } from '../config';

// ✅ Get API URL from multiple sources
const getApiUrl = () => {
  // 1. Check window.comviaSettings (set by widget initialization)
  const windowConfig = (window as any).comviaSettings || {};
  if (windowConfig.apiUrl) {
    return windowConfig.apiUrl.replace(/\/$/, '');
  }
  
  // 2. Check Vite environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  
  // 3. Fallback to config
  return WIDGET_CONFIG.API_URL.replace(/\/$/, '');
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: WIDGET_CONFIG.TIMEOUTS.api || 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(WIDGET_CONFIG.STORAGE_KEYS?.TOKEN || 'comvia_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(WIDGET_CONFIG.STORAGE_KEYS?.TOKEN || 'comvia_token');
    }
    return Promise.reject(error);
  }
);

export const widgetAPI = {
  // Get chat history
  getHistory: async (userId: string): Promise<ApiResponse<Message[]>> => {
    try {
      const response = await api.get(`/widget/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return { success: false, message: 'Failed to load chat history' };
    }
  },

  // ✅ CRITICAL: Send message with companyId
  sendMessage: async (data: {
    content: string;
    sender: string;
    userId: string;
    timestamp: string;
    companyId?: string; 
  }): Promise<ApiResponse<{ reply?: string; messageId?: string; conversationId?: string }>> => {
    try {
      // ✅ Get companyId from window.comviaSettings
      const windowConfig = (window as any).comviaSettings || {};
      const companyId = windowConfig.companyId || windowConfig.company_id;

      // ✅ Ensure userId is never empty
      let userId = data.userId;
      if (!userId || userId === 'anonymous') {
        userId = localStorage.getItem('comvia_visitor_id') || `visitor_${Date.now()}`;
        localStorage.setItem('comvia_visitor_id', userId);
      }
      
      // console.log('📤 [WIDGET] Sending message:', {
      //   content: data.content,
      //   userId: data.userId,
      //   companyId: companyId
      // });

      // Use the visitor message endpoint
      const response = await api.post('/widget/visitor/message', {
        content: data.content,
        sender: data.sender,
        userId: userId,
        timestamp: data.timestamp,
        companyId: companyId // ✅ Include companyId
      });
      
      // console.log('📥 [WIDGET] Message response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [WIDGET] Failed to send message:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      return { 
        success: false, 
        message: 'Failed to send message',
        data: {
          reply: '⚠️ Sorry, I\'m having trouble connecting. Please try again.'
        }
      };
    }
  },

  // Get widget settings
  getSettings: async (widgetId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/widget/settings/${widgetId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get widget settings:', error);
      return { success: false, message: 'Failed to load settings' };
    }
  },

  // Update widget settings
  updateSettings: async (widgetId: string, settings: any): Promise<ApiResponse> => {
    try {
      const response = await api.put(`/widget/settings/${widgetId}`, settings);
      return response.data;
    } catch (error) {
      console.error('Failed to update widget settings:', error);
      return { success: false, message: 'Failed to update settings' };
    }
  },

  // ✅ Get company settings by company ID
  getCompanySettings: async (companyId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/company/${companyId}/widget`);
      // console.log('📥 [WIDGET] Company settings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get company settings:', error);
      return { success: false, message: 'Failed to load company settings' };
    }
  },

  // Track visitor
  trackVisitor: async (data: {
    visitorId: string;
    name?: string;
    email?: string;
    page?: string;
    referrer?: string;
  }) => {
    const response = await api.post('/widget/track', data);
    return response.data;
  },

  // Get conversation history
  getConversationHistory: async (conversationId: string, limit?: number) => {
    const response = await api.get(`/messages/${conversationId}`, {
      params: { limit: limit || 50 }
    });
    return response.data;
  },
  
  // Send message via REST fallback
  sendMessageRest: async (data: {
    conversationId: string;
    content: string;
    type?: string;
  }) => {
    const response = await api.post('/messages', data);
    return response.data;
  },
};

export default api;
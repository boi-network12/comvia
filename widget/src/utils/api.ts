// widget/src/utils/api.ts
import axios from 'axios';
import type { ApiResponse, Message } from '../types';
import { WIDGET_CONFIG } from '../config';

const getApiUrl = () => {
  return (window as any).comviaSettings?.apiUrl || 
         import.meta.env.VITE_API_URL || 
         WIDGET_CONFIG.API_URL;
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: WIDGET_CONFIG.TIMEOUTS.api,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(WIDGET_CONFIG.STORAGE_KEYS.TOKEN);
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
      localStorage.removeItem(WIDGET_CONFIG.STORAGE_KEYS.TOKEN);
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

  // Send message (fallback when socket is not available)
  sendMessage: async (data: {
    content: string;
    sender: string;
    userId: string;
    timestamp: string;
  }): Promise<ApiResponse<{ reply?: string }>> => {
    try {
      const response = await api.post('/widget/message', data);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, message: 'Failed to send message' };
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

  // ✅ NEW: Get company settings by company ID
  getCompanySettings: async (companyId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/company/${companyId}/widget`);
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
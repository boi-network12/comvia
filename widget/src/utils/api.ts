// src/utils/api.ts

import axios from 'axios';
import type { ApiResponse, Message } from '../types';

const getApiUrl = () => {
  return (window as any).comviaSettings?.apiUrl || 
         import.meta.env.VITE_API_URL || 
         'http://localhost:8080/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('comvia_token');
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
      // Handle unauthorized
      localStorage.removeItem('comvia_token');
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

  // Track visitor
  trackVisitor: async (data: {
    widgetId: string;
    visitorId: string;
    page: string;
    referrer?: string;
  }): Promise<ApiResponse> => {
    try {
      const response = await api.post('/widget/track', data);
      return response.data;
    } catch (error) {
      console.error('Failed to track visitor:', error);
      return { success: false, message: 'Failed to track visitor' };
    }
  },
};

export default api;
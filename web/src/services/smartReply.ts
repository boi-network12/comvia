// web/services/smartReply.ts

import { API_ENDPOINT } from '@/config/base_url';
import axios, { AxiosInstance } from 'axios';

// ============================================================
// TYPES
// ============================================================

export interface CustomReply {
  intent: 'pricing' | 'features' | 'support' | 'demo' | 'sales' | 'technical' | 'billing' | 'urgent' | 'human' | 'general';
  reply: string;
  enabled: boolean;
}

export interface WorkingHours {
  enabled: boolean;
  timezone: string;
  hours: {
    start: string; // "09:00"
    end: string;   // "17:00"
  };
  days: number[]; // 0=Sunday, 1=Monday, etc.
}

export interface AutoReplySettings {
  enabled: boolean;
  mode: 'smart' | 'always' | 'never' | 'agent-offline-only';
  cooldownMinutes: number;
  maxRepliesPerConversation: number;
  customReplies: CustomReply[];
  fallbackReply: string;
  agentOnlineMessage: string;
  agentOfflineMessage: string;
  workingHours: WorkingHours;
}

export interface AgentDetectionSettings {
  method: 'socket' | 'lastActivity' | 'both';
  inactivityTimeoutMinutes: number;
  checkIntervalSeconds: number;
}

export interface OnlineAgent {
  id: string;
  name: string;
  lastActivity: string;
}

export interface OnlineAgentsStatus {
  online: boolean;
  active: boolean;
  count: number;
  agents: OnlineAgent[];
}

export interface CompanySettings {
  companyId: string;
  autoReply: AutoReplySettings;
  agentDetection: AgentDetectionSettings;
  updatedAt: string;
  createdAt: string;
}

export interface UpdateAutoReplyData {
  enabled?: boolean;
  mode?: AutoReplySettings['mode'];
  cooldownMinutes?: number;
  maxRepliesPerConversation?: number;
  customReplies?: CustomReply[];
  fallbackReply?: string;
  agentOnlineMessage?: string;
  agentOfflineMessage?: string;
  workingHours?: Partial<WorkingHours>;
}

export interface UpdateAgentDetectionData {
  method?: AgentDetectionSettings['method'];
  inactivityTimeoutMinutes?: number;
  checkIntervalSeconds?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ============================================================
// SERVICE
// ============================================================

class SmartReplyService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_ENDPOINT}/company`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const response = await axios.post(`${API_ENDPOINT}/auth/refresh`, {}, {
              withCredentials: true,
            });
            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Get all company settings
  async getSettings(): Promise<ApiResponse<CompanySettings>> {
    const response = await this.api.get<ApiResponse<CompanySettings>>('/settings');
    return response.data;
  }

  // Get auto-reply settings only
  async getAutoReplySettings(): Promise<ApiResponse<AutoReplySettings>> {
    const response = await this.api.get<ApiResponse<{ autoReply: AutoReplySettings }>>('/settings/auto-reply');
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data.autoReply,
    };
  }

  // Update auto-reply settings
  async updateAutoReply(data: UpdateAutoReplyData): Promise<ApiResponse<AutoReplySettings>> {
    const response = await this.api.put<ApiResponse<{ autoReply: AutoReplySettings }>>('/settings/auto-reply', data);
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data.autoReply,
    };
  }

  // Update agent detection settings
  async updateAgentDetection(data: UpdateAgentDetectionData): Promise<ApiResponse<AgentDetectionSettings>> {
    const response = await this.api.put<ApiResponse<{ agentDetection: AgentDetectionSettings }>>('/settings/agent-detection', data);
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data.agentDetection,
    };
  }

  // Reset auto-reply to defaults
  async resetAutoReply(): Promise<ApiResponse<AutoReplySettings>> {
    const response = await this.api.post<ApiResponse<{ autoReply: AutoReplySettings }>>('/settings/auto-reply/reset');
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data.autoReply,
    };
  }

  // Test a custom reply
  async testReply(message: string): Promise<ApiResponse<{ reply: string; intent: string; confidence: number }>> {
    const response = await this.api.post<ApiResponse<{ reply: string; intent: string; confidence: number }>>('/settings/test-reply', { message });
    return response.data;
  }

  // Get online agents status
  async getOnlineAgents(): Promise<ApiResponse<{ online: boolean; active: boolean; count: number; agents: Array<{ id: string; name: string; lastActivity: string }> }>> {
    const response = await this.api.get<ApiResponse<{ online: boolean; active: boolean; count: number; agents: OnlineAgent[] }>>('/settings/agents/online');
    return response.data;
  }
}

export const smartReplyAPI = new SmartReplyService();
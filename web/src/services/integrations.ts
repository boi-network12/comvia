// web/services/integrations.ts

import { API_ENDPOINT } from '@/config/base_url';
import axios, { AxiosInstance } from 'axios';

// ============================================
// Types
// ============================================

export interface SlackIntegration {
  webhookUrl: string;
  channel: string;
  enabled: boolean;
}

export interface FacebookIntegration {
  pageId: string;
  accessToken: string;
  enabled: boolean;
  pageName?: string;
}

export interface InstagramIntegration {
  businessId: string;
  accessToken: string;
  enabled: boolean;
  username?: string;
}

export interface TwitterIntegration {
  userId: string;
  accessToken: string;
  accessTokenSecret: string;
  enabled: boolean;
  username?: string;
}

export interface GitHubIntegration {
  accessToken: string;
  repo: string;
  owner: string;
  enabled: boolean;
  syncIssues: boolean;
}

export interface ZoomIntegration {
  accountId: string;
  clientId: string;
  clientSecret: string;
  enabled: boolean;
  userId?: string;
}

export interface ZapierIntegration {
  webhookUrl: string;
  enabled: boolean;
  triggers: string[];
}

export interface EmailIntegration {
  enabled: boolean;
  notifications: {
    newMessage: boolean;
    newTicket: boolean;
    teamInvite: boolean;
  };
}

// ✅ Define a type for disabled state
export type DisabledIntegration = { enabled: false };

// ✅ Update the IntegrationStatus type to use the DisabledIntegration type
export type IntegrationStatus = {
  slack: SlackIntegration | DisabledIntegration;
  facebook: FacebookIntegration | DisabledIntegration;
  instagram: InstagramIntegration | DisabledIntegration;
  twitter: TwitterIntegration | DisabledIntegration;
  github: GitHubIntegration | DisabledIntegration;
  zoom: ZoomIntegration | DisabledIntegration;
  zapier: ZapierIntegration | DisabledIntegration;
  email: EmailIntegration;
};

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface SlackStatusResponse {
  slack: SlackIntegration | DisabledIntegration;
}

export interface FacebookStatusResponse {
  facebook: FacebookIntegration | DisabledIntegration;
}

export interface GitHubStatusResponse {
  github: GitHubIntegration | DisabledIntegration;
}

export interface ZapierStatusResponse {
  zapier: ZapierIntegration | DisabledIntegration;
}

export interface EmailSettingsResponse {
  email: EmailIntegration;
}

// ============================================
// Service Class
// ============================================

class IntegrationService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_ENDPOINT}/integrations`,
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

  // ============================================
  // Slack Integration
  // ============================================

  async connectSlack(webhookUrl: string, channel: string): Promise<ApiResponse<{ slack: SlackIntegration }>> {
    const response = await this.api.post<ApiResponse<{ slack: SlackIntegration }>>('/slack/connect', { webhookUrl, channel });
    return response.data;
  }

  async disconnectSlack(): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>('/slack/disconnect');
    return response.data;
  }

  async getSlackStatus(): Promise<ApiResponse<SlackStatusResponse>> {
    const response = await this.api.get<ApiResponse<SlackStatusResponse>>('/slack/status');
    return response.data;
  }

  // ============================================
  // Facebook Integration
  // ============================================

  async connectFacebook(pageId: string, accessToken: string, pageName?: string): Promise<ApiResponse<{ facebook: FacebookIntegration }>> {
    const response = await this.api.post<ApiResponse<{ facebook: FacebookIntegration }>>('/facebook/connect', { pageId, accessToken, pageName });
    return response.data;
  }

  async disconnectFacebook(): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>('/facebook/disconnect');
    return response.data;
  }

  async getFacebookStatus(): Promise<ApiResponse<FacebookStatusResponse>> {
    const response = await this.api.get<ApiResponse<FacebookStatusResponse>>('/facebook/status');
    return response.data;
  }

  // ============================================
  // GitHub Integration
  // ============================================

  async connectGitHub(accessToken: string, repo: string, owner?: string, syncIssues?: boolean): Promise<ApiResponse<{ github: GitHubIntegration }>> {
    const response = await this.api.post<ApiResponse<{ github: GitHubIntegration }>>('/github/connect', { accessToken, repo, owner, syncIssues });
    return response.data;
  }

  async disconnectGitHub(): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>('/github/disconnect');
    return response.data;
  }

  async getGitHubStatus(): Promise<ApiResponse<GitHubStatusResponse>> {
    const response = await this.api.get<ApiResponse<GitHubStatusResponse>>('/github/status');
    return response.data;
  }

  // ============================================
  // Zapier Integration
  // ============================================

  async connectZapier(webhookUrl: string, triggers?: string[]): Promise<ApiResponse<{ zapier: ZapierIntegration }>> {
    const response = await this.api.post<ApiResponse<{ zapier: ZapierIntegration }>>('/zapier/connect', { webhookUrl, triggers });
    return response.data;
  }

  async disconnectZapier(): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>('/zapier/disconnect');
    return response.data;
  }

  async getZapierStatus(): Promise<ApiResponse<ZapierStatusResponse>> {
    const response = await this.api.get<ApiResponse<ZapierStatusResponse>>('/zapier/status');
    return response.data;
  }

  // ============================================
  // Email Integration
  // ============================================

  async updateEmailSettings(enabled: boolean, notifications?: {
    newMessage?: boolean;
    newTicket?: boolean;
    teamInvite?: boolean;
  }): Promise<ApiResponse<{ email: EmailIntegration }>> {
    const response = await this.api.put<ApiResponse<{ email: EmailIntegration }>>('/email/update', { enabled, notifications });
    return response.data;
  }

  async getEmailSettings(): Promise<ApiResponse<EmailSettingsResponse>> {
    const response = await this.api.get<ApiResponse<EmailSettingsResponse>>('/email/settings');
    return response.data;
  }

  // ============================================
  // Bulk Operations
  // ============================================

  async getAllIntegrationStatus(): Promise<IntegrationStatus> {
    try {
      const [slack, facebook, github, zapier, email] = await Promise.all([
        this.getSlackStatus().catch(() => ({ 
          success: false, 
          data: { slack: { enabled: false } as DisabledIntegration } 
        })),
        this.getFacebookStatus().catch(() => ({ 
          success: false, 
          data: { facebook: { enabled: false } as DisabledIntegration } 
        })),
        this.getGitHubStatus().catch(() => ({ 
          success: false, 
          data: { github: { enabled: false } as DisabledIntegration } 
        })),
        this.getZapierStatus().catch(() => ({ 
          success: false, 
          data: { zapier: { enabled: false } as DisabledIntegration } 
        })),
        this.getEmailSettings().catch(() => ({ 
          success: false, 
          data: { 
            email: { 
              enabled: true, 
              notifications: { 
                newMessage: true, 
                newTicket: true, 
                teamInvite: true 
              } 
            } 
          } 
        })),
      ]);

      return {
        slack: slack.success ? slack.data.slack : { enabled: false },
        facebook: facebook.success ? facebook.data.facebook : { enabled: false },
        instagram: { enabled: false },
        twitter: { enabled: false },
        github: github.success ? github.data.github : { enabled: false },
        zoom: { enabled: false },
        zapier: zapier.success ? zapier.data.zapier : { enabled: false },
        email: email.success ? email.data.email : {
          enabled: true,
          notifications: {
            newMessage: true,
            newTicket: true,
            teamInvite: true,
          },
        },
      };
    } catch (error) {
      console.error('Failed to get integration status:', error);
      // Return default empty state
      return {
        slack: { enabled: false },
        facebook: { enabled: false },
        instagram: { enabled: false },
        twitter: { enabled: false },
        github: { enabled: false },
        zoom: { enabled: false },
        zapier: { enabled: false },
        email: {
          enabled: true,
          notifications: {
            newMessage: true,
            newTicket: true,
            teamInvite: true,
          },
        },
      };
    }
  }
}

// ============================================
// Export
// ============================================

export const integrationAPI = new IntegrationService();
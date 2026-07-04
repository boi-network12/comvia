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

export type IntegrationStatus = {
  slack: SlackIntegration | { enabled: false };
  facebook: FacebookIntegration | { enabled: false };
  instagram: InstagramIntegration | { enabled: false };
  twitter: TwitterIntegration | { enabled: false };
  github: GitHubIntegration | { enabled: false };
  zoom: ZoomIntegration | { enabled: false };
  zapier: ZapierIntegration | { enabled: false };
  email: EmailIntegration;
};

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface SlackStatusResponse {
  slack: SlackIntegration | { enabled: false };
}

export interface FacebookStatusResponse {
  facebook: FacebookIntegration | { enabled: false };
}

export interface InstagramStatusResponse {
  instagram: InstagramIntegration | { enabled: false };
}

export interface TwitterStatusResponse {
  twitter: TwitterIntegration | { enabled: false };
}

export interface GitHubStatusResponse {
  github: GitHubIntegration | { enabled: false };
}

export interface ZoomStatusResponse {
  zoom: ZoomIntegration | { enabled: false };
}

export interface ZapierStatusResponse {
  zapier: ZapierIntegration | { enabled: false };
}

export interface EmailSettingsResponse {
  email: EmailIntegration;
}

export interface WebhookResponse {
  webhookUrl: string;
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
            const { authAPI } = await import('./auth');
            await authAPI.refreshToken();
            const token = localStorage.getItem('accessToken');
            originalRequest.headers.Authorization = `Bearer ${token}`;
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
  // Instagram Integration
  // ============================================

  async connectInstagram(businessId: string, accessToken: string, username?: string): Promise<ApiResponse<{ instagram: InstagramIntegration }>> {
    const response = await this.api.post<ApiResponse<{ instagram: InstagramIntegration }>>('/instagram/connect', { businessId, accessToken, username });
    return response.data;
  }

  async disconnectInstagram(): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>('/instagram/disconnect');
    return response.data;
  }

  async getInstagramStatus(): Promise<ApiResponse<InstagramStatusResponse>> {
    const response = await this.api.get<ApiResponse<InstagramStatusResponse>>('/instagram/status');
    return response.data;
  }

  // ============================================
  // Twitter Integration
  // ============================================

  async connectTwitter(
    userId: string,
    accessToken: string,
    accessTokenSecret: string,
    username?: string
  ): Promise<ApiResponse<{ twitter: TwitterIntegration }>> {
    const response = await this.api.post<ApiResponse<{ twitter: TwitterIntegration }>>('/twitter/connect', { userId, accessToken, accessTokenSecret, username });
    return response.data;
  }

  async disconnectTwitter(): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>('/twitter/disconnect');
    return response.data;
  }

  async getTwitterStatus(): Promise<ApiResponse<TwitterStatusResponse>> {
    const response = await this.api.get<ApiResponse<TwitterStatusResponse>>('/twitter/status');
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
  // Zoom Integration
  // ============================================

  async connectZoom(accountId: string, clientId: string, clientSecret: string): Promise<ApiResponse<{ zoom: ZoomIntegration }>> {
    const response = await this.api.post<ApiResponse<{ zoom: ZoomIntegration }>>('/zoom/connect', { accountId, clientId, clientSecret });
    return response.data;
  }

  async disconnectZoom(): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>('/zoom/disconnect');
    return response.data;
  }

  async getZoomStatus(): Promise<ApiResponse<ZoomStatusResponse>> {
    const response = await this.api.get<ApiResponse<ZoomStatusResponse>>('/zoom/status');
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
    const [slack, facebook, instagram, twitter, github, zoom, zapier, email] =
      await Promise.all([
        this.getSlackStatus(),
        this.getFacebookStatus(),
        this.getInstagramStatus(),
        this.getTwitterStatus(),
        this.getGitHubStatus(),
        this.getZoomStatus(),
        this.getZapierStatus(),
        this.getEmailSettings(),
      ]);

    return {
      slack: slack.data.slack,
      facebook: facebook.data.facebook,
      instagram: instagram.data.instagram,
      twitter: twitter.data.twitter,
      github: github.data.github,
      zoom: zoom.data.zoom,
      zapier: zapier.data.zapier,
      email: email.data.email,
    };
  }

  // ============================================
  // Webhook Helpers (for Zapier)
  // ============================================

  async getWebhookUrl(integration: 'slack' | 'zapier' | 'github'): Promise<ApiResponse<WebhookResponse>> {
    const response = await this.api.get<ApiResponse<WebhookResponse>>(`/${integration}/webhook`);
    return response.data;
  }

  async testWebhook(integration: 'slack' | 'zapier', webhookUrl: string): Promise<ApiResponse> {
    const response = await this.api.post<ApiResponse>('/test-webhook', { integration, webhookUrl });
    return response.data;
  }
}

// ============================================
// Export
// ============================================

export const integrationAPI = new IntegrationService();
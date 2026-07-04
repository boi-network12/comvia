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

export interface IntegrationStatus {
  slack: SlackIntegration | { enabled: false };
  facebook: FacebookIntegration | { enabled: false };
  instagram: InstagramIntegration | { enabled: false };
  twitter: TwitterIntegration | { enabled: false };
  github: GitHubIntegration | { enabled: false };
  zoom: ZoomIntegration | { enabled: false };
  zapier: ZapierIntegration | { enabled: false };
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
            // Import authAPI dynamically to avoid circular dependency
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

  async connectSlack(webhookUrl: string, channel: string) {
    const response = await this.api.post<{
      success: boolean;
      message: string;
      data: { slack: SlackIntegration };
    }>('/slack/connect', { webhookUrl, channel });
    return response.data;
  }

  async disconnectSlack() {
    const response = await this.api.delete<{
      success: boolean;
      message: string;
    }>('/slack/disconnect');
    return response.data;
  }

  async getSlackStatus() {
    const response = await this.api.get<{
      success: boolean;
      data: { slack: SlackIntegration | { enabled: false } };
    }>('/slack/status');
    return response.data;
  }

  // ============================================
  // Facebook Integration
  // ============================================

  async connectFacebook(pageId: string, accessToken: string, pageName?: string) {
    const response = await this.api.post<{
      success: boolean;
      message: string;
      data: { facebook: FacebookIntegration };
    }>('/facebook/connect', { pageId, accessToken, pageName });
    return response.data;
  }

  async disconnectFacebook() {
    const response = await this.api.delete<{
      success: boolean;
      message: string;
    }>('/facebook/disconnect');
    return response.data;
  }

  async getFacebookStatus() {
    const response = await this.api.get<{
      success: boolean;
      data: { facebook: FacebookIntegration | { enabled: false } };
    }>('/facebook/status');
    return response.data;
  }

  // ============================================
  // Instagram Integration
  // ============================================

  async connectInstagram(businessId: string, accessToken: string, username?: string) {
    const response = await this.api.post<{
      success: boolean;
      message: string;
      data: { instagram: InstagramIntegration };
    }>('/instagram/connect', { businessId, accessToken, username });
    return response.data;
  }

  async disconnectInstagram() {
    const response = await this.api.delete<{
      success: boolean;
      message: string;
    }>('/instagram/disconnect');
    return response.data;
  }

  async getInstagramStatus() {
    const response = await this.api.get<{
      success: boolean;
      data: { instagram: InstagramIntegration | { enabled: false } };
    }>('/instagram/status');
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
  ) {
    const response = await this.api.post<{
      success: boolean;
      message: string;
      data: { twitter: TwitterIntegration };
    }>('/twitter/connect', { userId, accessToken, accessTokenSecret, username });
    return response.data;
  }

  async disconnectTwitter() {
    const response = await this.api.delete<{
      success: boolean;
      message: string;
    }>('/twitter/disconnect');
    return response.data;
  }

  async getTwitterStatus() {
    const response = await this.api.get<{
      success: boolean;
      data: { twitter: TwitterIntegration | { enabled: false } };
    }>('/twitter/status');
    return response.data;
  }

  // ============================================
  // GitHub Integration
  // ============================================

  async connectGitHub(accessToken: string, repo: string, owner?: string, syncIssues?: boolean) {
    const response = await this.api.post<{
      success: boolean;
      message: string;
      data: { github: GitHubIntegration };
    }>('/github/connect', { accessToken, repo, owner, syncIssues });
    return response.data;
  }

  async disconnectGitHub() {
    const response = await this.api.delete<{
      success: boolean;
      message: string;
    }>('/github/disconnect');
    return response.data;
  }

  async getGitHubStatus() {
    const response = await this.api.get<{
      success: boolean;
      data: { github: GitHubIntegration | { enabled: false } };
    }>('/github/status');
    return response.data;
  }

  // ============================================
  // Zoom Integration
  // ============================================

  async connectZoom(accountId: string, clientId: string, clientSecret: string) {
    const response = await this.api.post<{
      success: boolean;
      message: string;
      data: { zoom: ZoomIntegration };
    }>('/zoom/connect', { accountId, clientId, clientSecret });
    return response.data;
  }

  async disconnectZoom() {
    const response = await this.api.delete<{
      success: boolean;
      message: string;
    }>('/zoom/disconnect');
    return response.data;
  }

  async getZoomStatus() {
    const response = await this.api.get<{
      success: boolean;
      data: { zoom: ZoomIntegration | { enabled: false } };
    }>('/zoom/status');
    return response.data;
  }

  // ============================================
  // Zapier Integration
  // ============================================

  async connectZapier(webhookUrl: string, triggers?: string[]) {
    const response = await this.api.post<{
      success: boolean;
      message: string;
      data: { zapier: ZapierIntegration };
    }>('/zapier/connect', { webhookUrl, triggers });
    return response.data;
  }

  async disconnectZapier() {
    const response = await this.api.delete<{
      success: boolean;
      message: string;
    }>('/zapier/disconnect');
    return response.data;
  }

  async getZapierStatus() {
    const response = await this.api.get<{
      success: boolean;
      data: { zapier: ZapierIntegration | { enabled: false } };
    }>('/zapier/status');
    return response.data;
  }

  // ============================================
  // Email Integration
  // ============================================

  async updateEmailSettings(enabled: boolean, notifications?: {
    newMessage?: boolean;
    newTicket?: boolean;
    teamInvite?: boolean;
  }) {
    const response = await this.api.put<{
      success: boolean;
      message: string;
      data: { email: EmailIntegration };
    }>('/email/update', { enabled, notifications });
    return response.data;
  }

  async getEmailSettings() {
    const response = await this.api.get<{
      success: boolean;
      data: { email: EmailIntegration };
    }>('/email/settings');
    return response.data;
  }

  // ============================================
  // Bulk Operations
  // ============================================

  async getAllIntegrationStatus() {
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

  async getWebhookUrl(integration: 'slack' | 'zapier' | 'github') {
    const response = await this.api.get<{
      success: boolean;
      data: { webhookUrl: string };
    }>(`/${integration}/webhook`);
    return response.data;
  }

  async testWebhook(integration: 'slack' | 'zapier', webhookUrl: string) {
    const response = await this.api.post<{
      success: boolean;
      message: string;
    }>('/test-webhook', { integration, webhookUrl });
    return response.data;
  }
}

// ============================================
// Export
// ============================================

export const integrationAPI = new IntegrationService();
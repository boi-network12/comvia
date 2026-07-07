// web/services/auth.ts
import { API_ENDPOINT } from '@/config/base_url';
import axios, { AxiosInstance } from 'axios';

// Define Integration types first
export interface SlackIntegration {
  webhookUrl?: string;
  channel?: string;
  enabled: boolean;
}

export interface EmailIntegration {
  enabled: boolean;
  notifications: {
    newMessage: boolean;
    newTicket: boolean;
    teamInvite: boolean;
  };
}

export interface FacebookIntegration {
  pageId?: string;
  accessToken?: string;
  enabled: boolean;
  pageName?: string;
}

export interface InstagramIntegration {
  businessId?: string;
  accessToken?: string;
  enabled: boolean;
  username?: string;
}

export interface TwitterIntegration {
  userId?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  enabled: boolean;
  username?: string;
}

export interface GitHubIntegration {
  accessToken?: string;
  repo?: string;
  owner?: string;
  enabled: boolean;
  syncIssues: boolean;
}

export interface ZoomIntegration {
  accountId?: string;
  clientId?: string;
  clientSecret?: string;
  enabled: boolean;
  userId?: string;
}

export interface ZapierIntegration {
  webhookUrl?: string;
  enabled: boolean;
  triggers: string[];
}

export interface Integrations {
  slack?: SlackIntegration;
  email?: EmailIntegration;
  facebook?: FacebookIntegration;
  instagram?: InstagramIntegration;
  twitter?: TwitterIntegration;
  github?: GitHubIntegration;
  zoom?: ZoomIntegration;
  zapier?: ZapierIntegration;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  isEmailVerified: boolean;
  avatar?: string;
  companyName?: string;
  companyLogo?: string;
  setupCompleted: boolean;
  integrations?: Integrations; 
  companyId?: string;
  widgetSettings: {
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    color: string;
    icon: string;
    font: string;
    welcomeMessage: string;
    quickReplies: string[];
  };
  products: string[];
  teamMembers: Array<{
    email: string;
    role: 'admin' | 'agent';
    invitedAt: string;
    acceptedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

// Setup response types
export interface SetupProductResponse {
  success: boolean;
  message: string;
  data: {
    products: string[];
    setupProgress?: {
      currentStep: string;
      completed: string[];
    };
  };
}

export interface SetupWidgetResponse {
  success: boolean;
  message: string;
  data: {
    widgetSettings: User['widgetSettings'];
  };
}

export interface SetupBrandingResponse {
  success: boolean;
  message: string;
  data: {
    companyName: string;
    companyLogo?: string; 
    widgetSettings: User['widgetSettings'];
  };
}

export interface SetupTeamResponse {
  success: boolean;
  message: string;
  data: {
    teamMembers: User['teamMembers'];
  };
}

export interface SetupIntegrationsResponse {
  success: boolean;
  message: string;
  data: {
    user?: User;
    integrations: {
      slack?: { enabled: boolean };
      email?: { enabled: boolean; notifications?: {
        newMessage?: boolean;
        newTicket?: boolean;
        teamInvite?: boolean;
      } };
      facebook?: { enabled: boolean };
      instagram?: { enabled: boolean };
      twitter?: { enabled: boolean };
      github?: { enabled: boolean; syncIssues?: boolean };
      zoom?: { enabled: boolean };
      zapier?: { enabled: boolean; triggers?: string[] };
    };
  };
}

export interface CompleteSetupResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    setupCompleted: boolean;
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  data: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_ENDPOINT}/auth`,
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
            await this.refreshToken();
            const token = localStorage.getItem('accessToken');
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async register(name: string, email: string, password: string, captchaToken?: string) {
    const response = await this.api.post<AuthResponse>('/register', {
      name,
      email,
      password,
      captchaToken,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post<AuthResponse>('/login', {
      email,
      password,
    });
    return response.data;
  }

  async logout() {
    await this.api.post('/logout');
  }

  async getMe() {
    const response = await this.api.get<{ success: boolean; data: User }>('/me');
    return response.data;
  }

  async verifyEmail(token: string) {
    const response = await this.api.post<{ success: boolean; message: string }>('/verify-email', {
      token,
    });
    return response.data;
  }

  async resendVerification(email: string) {
    const response = await this.api.post<{ success: boolean; message: string }>('/resend-verification', {
      email,
    });
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.api.post<{ success: boolean; message: string }>('/forgot-password', {
      email,
    });
    return response.data;
  }

  async resetPassword(token: string, password: string) {
    const response = await this.api.post<{ success: boolean; message: string }>('/reset-password', {
      token,
      password,
      confirmPassword: password,
    });
    return response.data;
  }

  async refreshToken() {
    const response = await this.api.post<{ success: boolean; data: { accessToken: string } }>('/refresh');
    const { accessToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    return response.data;
  }

  async updateProfile(data: Partial<User> & { avatar?: File | string }) {
  const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === 'avatar' && value instanceof File) {
        formData.append('avatar', value);           // ← Real file
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    });

    const response = await this.api.put<{ success: boolean; data: User }>(
      '/profile', 
      formData, 
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  // Setup methods
  async setupProduct(productId: string): Promise<SetupProductResponse> {
    const response = await this.api.post<SetupProductResponse>('/setup/product', { productId });
    return response.data;
  }


  async setupWidget(settings: {
    position: string;
    color: string;
    icon: string;
  }): Promise<SetupWidgetResponse> {
    const response = await this.api.post<SetupWidgetResponse>('/setup/widget', settings);
    return response.data;
  }

  async setupBranding(settings: {
    companyName: string;
    brandColor: string;
    font: string;
    welcomeMessage: string;
    quickReplies: string[];
    logo?: File | string; // Add optional logo
  }): Promise<SetupBrandingResponse> {
    const formData = new FormData();
    
    // Add all text fields
    formData.append('companyName', settings.companyName);
    formData.append('brandColor', settings.brandColor);
    formData.append('font', settings.font);
    formData.append('welcomeMessage', settings.welcomeMessage);
    formData.append('quickReplies', JSON.stringify(settings.quickReplies));
    
    // Add logo if it's a File object
    if (settings.logo instanceof File) {
      formData.append('logo', settings.logo);
    } else if (typeof settings.logo === 'string' && settings.logo.startsWith('data:image')) {
      // If it's a base64 string, send it as JSON
      // But better to convert to File or send as base64 in the body
      formData.append('logo', settings.logo);
    }

    const response = await this.api.post<SetupBrandingResponse>('/setup/branding', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }


  async setupTeam(members: Array<{ name: string; email: string; role: 'admin' | 'agent' }>): Promise<SetupTeamResponse> {
    const response = await this.api.post<SetupTeamResponse>('/setup/team', { members });
    return response.data;
  }

  async setupIntegrations(integrations: string[]): Promise<SetupIntegrationsResponse> {
    const response = await this.api.post<SetupIntegrationsResponse>('/setup/integrations', { integrations });
    return response.data;
  }

  async completeSetup(): Promise<CompleteSetupResponse> {
    const response = await this.api.post<CompleteSetupResponse>('/setup/complete');
    return response.data;
  }
}

export const authAPI = new AuthService();
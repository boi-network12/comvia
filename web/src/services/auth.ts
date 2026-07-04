// web/services/auth.ts
import { API_ENDPOINT } from '@/config/base_url';
import axios, { AxiosInstance } from 'axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  isEmailVerified: boolean;
  avatar?: string;
  companyName?: string;
  companyLogo?: string;
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

  async updateProfile(data: Partial<User>) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await this.api.put<{ success: boolean; data: User }>('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Setup methods
  async setupProduct(productId: string) {
    const response = await this.api.post('/setup/product', { productId });
    return response.data;
  }

  async setupWidget(settings: {
    position: string;
    color: string;
    icon: string;
  }) {
    const response = await this.api.post('/setup/widget', settings);
    return response.data;
  }

  async setupBranding(settings: {
    companyName: string;
    brandColor: string;
    font: string;
    welcomeMessage: string;
    quickReplies: string[];
  }) {
    const response = await this.api.post('/setup/branding', settings);
    return response.data;
  }

  async setupTeam(members: Array<{ name: string; email: string; role: 'admin' | 'agent' }>) {
    const response = await this.api.post('/setup/team', { members });
    return response.data;
  }

  async setupIntegrations(integrations: string[]) {
    const response = await this.api.post('/setup/integrations', { integrations });
    return response.data;
  }

  async completeSetup() {
    const response = await this.api.post('/setup/complete');
    return response.data;
  }
}

export const authAPI = new AuthService();
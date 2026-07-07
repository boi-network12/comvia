import { API_ENDPOINT } from '@/config/base_url';
import axios, { AxiosInstance } from 'axios';

// Types
export interface WidgetSettings {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color: string;
  icon: string;
  font: string;
  welcomeMessage: string;
  quickReplies: string[];
}

export interface WidgetAppearanceData {
  position?: WidgetSettings['position'];
  color?: string;
  icon?: string;
  font?: string;
}

export interface WidgetContentData {
  welcomeMessage?: string;
  quickReplies?: string[];
}

export interface WidgetSettingsResponse {
  widgetSettings: WidgetSettings;
  companyName: string;
  companyLogo?: string;
}

export interface EmbedScriptResponse {
  script: string;
  vanillaScript: string;
  scriptUrl: string;
}

export interface WidgetPreviewResponse {
  settings: WidgetSettings;
  companyName: string;
  companyLogo?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class WidgetService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_ENDPOINT}/widget`,
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

  async getSettings(): Promise<ApiResponse<WidgetSettingsResponse>> {
    const response = await this.api.get<ApiResponse<WidgetSettingsResponse>>('/settings');
    return response.data;
  }

  async updateAppearance(data: WidgetAppearanceData): Promise<ApiResponse<WidgetSettings>> {
    const response = await this.api.put<ApiResponse<WidgetSettings>>('/appearance', data);
    return response.data;
  }

  async updateContent(data: WidgetContentData): Promise<ApiResponse<WidgetSettings>> {
    const response = await this.api.put<ApiResponse<WidgetSettings>>('/content', data);
    return response.data;
  }

  async getEmbedScript(): Promise<ApiResponse<EmbedScriptResponse>> {
    const response = await this.api.get<ApiResponse<EmbedScriptResponse>>('/embed');
    return response.data;
  }

  async getPreview(): Promise<ApiResponse<WidgetPreviewResponse>> {
    const response = await this.api.get<ApiResponse<WidgetPreviewResponse>>('/preview');
    return response.data;
  }

  async resetToDefaults(): Promise<ApiResponse<WidgetSettings>> {
    const response = await this.api.post<ApiResponse<WidgetSettings>>('/reset');
    return response.data;
  }
}

export const widgetAPI = new WidgetService();
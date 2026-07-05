import { API_ENDPOINT } from '@/config/base_url';
import axios, { AxiosInstance } from 'axios';

// Types
export interface AnalyticsOverview {
  overview: {
    total: number;
    resolved: number;
    open: number;
    escalated: number;
    resolutionRate: number;
    avgResponseTime: number;
    avgRating: number;
  };
  timeSeries: Array<{
    date: string;
    conversations: number;
    resolved: number;
  }>;
  teamPerformance: Array<{
    name: string;
    role: string;
    conversations: number;
    resolved: number;
    rating: number;
  }>;
  channelDistribution: Record<string, number>;
  period: string;
}

export interface ConversationMetric {
  date: string;
  open: number;
  resolved: number;
  escalated: number;
}

export interface TeamPerformance {
  name: string;
  role: string;
  conversations: number;
  resolved: number;
  rating: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export type AnalyticsPeriod = 'today' | 'week' | 'month';

class AnalyticsService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_ENDPOINT}/analytics`,
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

  async getAnalytics(period: AnalyticsPeriod = 'week'): Promise<ApiResponse<AnalyticsOverview>> {
    const response = await this.api.get<ApiResponse<AnalyticsOverview>>('/', {
      params: { period },
    });
    return response.data;
  }

  async getConversationMetrics(period: AnalyticsPeriod = 'week'): Promise<ApiResponse<ConversationMetric[]>> {
    const response = await this.api.get<ApiResponse<ConversationMetric[]>>('/conversations', {
      params: { period },
    });
    return response.data;
  }

  async getTeamPerformance(period: AnalyticsPeriod = 'week'): Promise<ApiResponse<TeamPerformance[]>> {
    const response = await this.api.get<ApiResponse<TeamPerformance[]>>('/team', {
      params: { period },
    });
    return response.data;
  }

  async getSatisfactionRating(period: AnalyticsPeriod = 'week'): Promise<ApiResponse<{ average: number; total: number; distribution: Record<number, number> }>> {
    const response = await this.api.get('/satisfaction', {
      params: { period },
    });
    return response.data;
  }

  async getResponseTimeMetrics(period: AnalyticsPeriod = 'week'): Promise<ApiResponse<{ average: number; min: number; max: number; distribution: Record<string, number> }>> {
    const response = await this.api.get('/response-time', {
      params: { period },
    });
    return response.data;
  }
}

export const analyticsAPI = new AnalyticsService();
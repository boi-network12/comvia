import { API_ENDPOINT } from '@/config/base_url';
import axios, { AxiosInstance } from 'axios';

// Types
export interface TeamMember {
  email: string;
  role: 'admin' | 'agent';
  invitedAt: string;
  acceptedAt?: string;
  name?: string;
  avatar?: string;
  isEmailVerified?: boolean;
  lastLogin?: string;
  isOnline?: boolean;
}

export interface TeamMemberDetail extends TeamMember {
  name: string;
  avatar?: string;
  isEmailVerified: boolean;
  lastLogin?: string;
  isOnline: boolean;
}

export interface InviteTeamMemberData {
  email: string;
  name: string;
  role: 'admin' | 'agent';
}

export interface UpdateTeamMemberData {
  role: 'admin' | 'agent';
}

export interface OnlineTeamMembers {
  online: string[];
  offline: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class TeamService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_ENDPOINT}/team`,
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

  async getTeamMembers(): Promise<ApiResponse<TeamMemberDetail[]>> {
    const response = await this.api.get<ApiResponse<TeamMemberDetail[]>>('/');
    return response.data;
  }

  async inviteTeamMember(data: InviteTeamMemberData): Promise<ApiResponse<TeamMember>> {
    const response = await this.api.post<ApiResponse<TeamMember>>('/invite', data);
    return response.data;
  }

  async updateTeamMember(email: string, data: UpdateTeamMemberData): Promise<ApiResponse<TeamMember>> {
    const response = await this.api.put<ApiResponse<TeamMember>>(`/${email}`, data);
    return response.data;
  }

  async removeTeamMember(email: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/${email}`);
    return response.data;
  }

  async getOnlineMembers(): Promise<ApiResponse<OnlineTeamMembers>> {
    const response = await this.api.get<ApiResponse<OnlineTeamMembers>>('/online');
    return response.data;
  }

  async resendInvitation(email: string): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>(`/invite/resend/${email}`);
    return response.data;
  }
}

export const teamAPI = new TeamService();
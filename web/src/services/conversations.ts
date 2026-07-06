import { API_ENDPOINT } from '@/config/base_url';
import axios, { AxiosInstance } from 'axios';

// Types
export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'system' | 'visitor';
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  readBy: string[];
  createdAt: string;
  status: 'sending' | "sent" | "delivered" | "read" | "failed" | null; 
  updatedAt: string;
}

// In your services file, add these types:
export interface ConversationMetadata {
  visitorName?: string;
  visitorEmail?: string;
  page?: string;
  browser?: string;
  location?: string;
  ip?: string;
}

export interface CreateConversationData {
  title?: string;
  channel?: Conversation['channel'];
  metadata?: Partial<ConversationMetadata>;
  visitorId?: string;
}

export interface UpdateConversationData {
  status?: Conversation['status'];
  priority?: Conversation['priority'];
  assignedTo?: string;
  tags?: string[];
  rating?: number;
  ratingComment?: string;
  resolvedAt?: Date;
  escalatedAt?: Date;
  assignedToName?: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  visitorId?: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  assignedToName?: string;
  channel: 'widget' | 'email' | 'facebook' | 'instagram' | 'twitter' | 'api';
  tags: string[];
  rating?: number;
  ratingComment?: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  resolvedAt?: string;
  escalatedAt?: string;
  metadata: {
    visitorName?: string;
    visitorEmail?: string;
    page?: string;
    browser?: string;
    location?: string;
    ip?: string;
  };
  internalNotes: Array<{
    content: string;
    createdBy: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  escalated: number;
  unassigned: number;
  highPriority: number;
}

export interface CreateConversationData {
  title?: string;
  channel?: Conversation['channel'];
  metadata?: Partial<Conversation['metadata']>;
  visitorId?: string;
}

export interface UpdateConversationData {
  status?: Conversation['status'];
  priority?: Conversation['priority'];
  assignedTo?: string;
  tags?: string[];
  rating?: number;
  ratingComment?: string;
}

export interface GetConversationsParams {
  status?: Conversation['status'];
  assignedTo?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  };
}

export interface ConversationDetailResponse {
  success: boolean;
  data: {
    conversation: Conversation;
    messages: Message[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class ConversationService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_ENDPOINT}/conversations`,
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

  async getConversations(params: GetConversationsParams = {}): Promise<ConversationsResponse> {
    const response = await this.api.get<ConversationsResponse>('/', { params });
    return response.data;
  }

  async getConversation(id: string): Promise<ConversationDetailResponse> {
    const response = await this.api.get<ConversationDetailResponse>(`/${id}`);
    return response.data;
  }

  async createConversation(data: CreateConversationData): Promise<ApiResponse<Conversation>> {
    const response = await this.api.post<ApiResponse<Conversation>>('/', data);
    return response.data;
  }

  async updateConversation(id: string, data: UpdateConversationData): Promise<ApiResponse<Conversation>> {
    const response = await this.api.put<ApiResponse<Conversation>>(`/${id}`, data);
    return response.data;
  }

  async addInternalNote(id: string, content: string): Promise<ApiResponse<{ content: string; createdBy: string; createdAt: string }>> {
    const response = await this.api.post<ApiResponse<{ content: string; createdBy: string; createdAt: string }>>(
      `/${id}/notes`,
      { content }
    );
    return response.data;
  }

  async getStats(): Promise<ApiResponse<ConversationStats>> {
    const response = await this.api.get<ApiResponse<ConversationStats>>('/stats');
    return response.data;
  }

  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<ApiResponse<{ messages: Message[]; total: number }>> {
    const response = await this.api.get(`/${conversationId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  }

  async sendMessage(conversationId: string, content: string, type: Message['type'] = 'text'): Promise<ApiResponse<Message>> {
    const response = await this.api.post(`/${conversationId}/messages`, { content, type });
    return response.data;
  }

  async markAsRead(conversationId: string): Promise<ApiResponse<{ unreadCount: number }>> {
    const response = await this.api.post(`/${conversationId}/read`);
    return response.data;
  }

  async assignConversation(id: string, userId: string): Promise<ApiResponse<Conversation>> {
    return this.updateConversation(id, { assignedTo: userId });
  }

  async resolveConversation(id: string): Promise<ApiResponse<Conversation>> {
    return this.updateConversation(id, { status: 'resolved' });
  }

  async escalateConversation(id: string): Promise<ApiResponse<Conversation>> {
    return this.updateConversation(id, { status: 'escalated' });
  }

  async rateConversation(id: string, rating: number, comment?: string): Promise<ApiResponse<Conversation>> {
    return this.updateConversation(id, { rating, ratingComment: comment });
  }
}

export const conversationAPI = new ConversationService();
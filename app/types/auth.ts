// types/auth.ts

// Auth State
export type AuthState = {
  isReady: boolean;
  isAuth: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
};

// Auth Context Type
export type AuthContextType = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<string | null>;
  isLoading: boolean;
};

// User Interface - Matches backend User model
export interface User {
  id: string;
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  avatarPublicId?: string;
  role: 'user' | 'admin' | 'super_admin';
  isEmailVerified: boolean;
  companyName?: string;
  companyLogo?: string;
  companyLogoPublicId?: string;
  companyId: string;
  setupCompleted: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  widgetSettings: WidgetSettings;
  products: Product[];
  teamMembers: TeamMember[];
  integrations: Integrations;
}

// Widget Settings
export interface WidgetSettings {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color: string;
  icon: string;
  font: string;
  welcomeMessage: string;
  quickReplies: string[];
}

// Product
export type Product = 
  | 'live-chat'
  | 'analytics'
  | 'automation'
  | 'knowledge-base'
  | 'ticketing'
  | 'voice'
  | 'video';

// Team Member
export interface TeamMember {
  email: string;
  role: 'admin' | 'agent';
  invitedAt: Date;
  acceptedAt?: Date;
}

// Integrations
export interface Integrations {
  slack?: SlackIntegration;
  email?: EmailIntegration;
  facebook?: FacebookIntegration;
  instagram?: InstagramIntegration;
  twitter?: TwitterIntegration;
  github?: GithubIntegration;
  zoom?: ZoomIntegration;
  zapier?: ZapierIntegration;
}

// Individual Integration Types
export interface SlackIntegration {
  webhookUrl: string;
  channel: string;
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

export interface GithubIntegration {
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
  triggers: ('newMessage' | 'newTicket' | 'newLead' | 'ticketClosed')[];
}

// Login Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
  message?: string;
}

// Register Request/Response Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  companyName?: string;
}

export interface RegisterResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
  message?: string;
}

// Refresh Token Types
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
  refreshToken: string;
}

// Update User Request
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
  companyName?: string;
  companyLogo?: string;
  widgetSettings?: Partial<WidgetSettings>;
  products?: Product[];
}

// Reset Password Types
export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}

// Verify Email Types
export interface VerifyEmailRequest {
  token: string;
}

// Team Management Types
export interface InviteTeamMemberRequest {
  email: string;
  role: 'admin' | 'agent';
}

export interface InviteTeamMemberResponse {
  success: boolean;
  message: string;
  teamMember: TeamMember;
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Login Error Types
export interface AuthError {
  message: string;
  code?: 'invalid_credentials' | 'email_not_verified' | 'account_locked' | 'too_many_attempts' | 'network_error' | 'unknown';
  field?: 'email' | 'password' | 'general';
}

// Login Payload
export type LoginPayload = {
  email: string;
  password: string;
}
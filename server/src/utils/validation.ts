// server/src/utils/validation.ts
import { z } from 'zod';

// User registration validation
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z.string()
    .email('Please provide a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  captchaToken: z.string().optional(),
});

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Email verification validation
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Forgot password validation
export const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

// Reset password validation
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Setup validation
export const setupProductSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
});

export const setupWidgetSchema = z.object({
  position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  icon: z.string().min(1, 'Please select an icon'),
});

export const setupBrandingSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'),
  font: z.string().optional(),
  welcomeMessage: z.string().optional(),
  quickReplies: z.array(z.string()).max(6, 'Maximum 6 quick replies allowed').optional(),
});

export const setupTeamSchema = z.object({
  members: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'agent']),
  })),
});

export const setupIntegrationsSchema = z.object({
  integrations: z.array(z.string()),
});

// Update profile validation
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  companyName: z.string().optional(),
  setupCompleted: z.boolean().optional(),
  widgetSettings: z.object({
    position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    font: z.string().optional(),
    welcomeMessage: z.string().optional(),
    quickReplies: z.array(z.string()).optional(),
  }).optional(),
  products: z.array(z.string()).optional(),
  teamMembers: z.array(z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'agent']),
    invitedAt: z.date().optional(),
    acceptedAt: z.date().optional(),
  })).optional(),
});
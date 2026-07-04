// web/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, User, AuthResponse } from '@/services/auth';
import { useToast } from './ToastContext';
import { useErrorHandler } from '@/utils/error-handler';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, captchaToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const { handleError } = useErrorHandler();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await authAPI.getMe();
          setUser(response.data);
        }
      } catch (error) {
        handleError(error, 'Failed to fetch user information.');
        // Token is invalid or expired
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { user, accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      showSuccess(`Welcome back, ${user.name}!`, 'Login successful.');
      router.push('/dashboard');
    } catch (error) {
      handleError(error, 'Failed to login.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, captchaToken?: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(name, email, password, captchaToken);
      const { user, accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      showSuccess('Registration successful!', 'Please verify your email address.');
      router.push('/verify-email-pending');
    } catch (error) {
      handleError(error, 'Failed to register.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      showSuccess('Logged out successfully!', 'You have been logged out.');
    } catch (error) {
      handleError(error, 'Failed to logout.');
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      router.push('/login');
    }
  };

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    try {
      await authAPI.verifyEmail(token);
      // Refresh user data
      const response = await authAPI.getMe();
      setUser(response.data);
      showSuccess('Email verified successfully!', 'Your email address has been verified.');
      router.push('/dashboard');
    } catch (error) {
      handleError(error, 'Failed to verify email.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    setIsLoading(true);
    try {
      await authAPI.resendVerification(email);
      showInfo('Verification email sent!', 'Please check your inbox.');
    } catch (error) {
      handleError(error, 'Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      showInfo('Password reset email sent!', 'Please check your inbox.');
    } catch (error) {
      handleError(error, 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      showSuccess('Password reset successful!', 'You can now log in with your new password.');
      router.push('/login');
    } catch (error) {
      handleError(error, 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
      showSuccess('Profile updated successfully!', 'Your profile information has been updated.');
    } catch (error) {
      handleError(error, 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
// web/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
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
  
  // Add refs to prevent duplicate calls
  const authCheckDone = useRef(false);
  const isVerifying = useRef(false);
  const isRefreshing = useRef(false);
  const fetchPromise = useRef<Promise<User | null> | null>(null);

  // Memoized function to fetch user
  const fetchUser = useCallback(async (silent: boolean = false): Promise<User | null> => {
    // If there's already a fetch in progress, return that promise
    if (fetchPromise.current) {
      console.log('Fetch already in progress, returning existing promise');
      return fetchPromise.current;
    }

    // Create new fetch promise
    const promise = (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setUser(null);
          return null;
        }
        
        const response = await authAPI.getMe();
        const userData = response.data;
        setUser(userData);
        return userData;
      } catch (error) {
        // Only show error if not silent
        if (!silent) {
          const isAuthError = error && typeof error === 'object' && 'response' in error && 
            (error as { response?: { status?: number } }).response?.status === 401;
          
          if (!isAuthError) {
            handleError(error, 'Failed to fetch user information.');
          }
        }
        // Token is invalid or expired
        localStorage.removeItem('accessToken');
        setUser(null);
        return null;
      }
    })();

    // Store the promise
    fetchPromise.current = promise;

    try {
      const result = await promise;
      return result;
    } finally {
      // Clear the promise after completion
      fetchPromise.current = null;
    }
  }, [handleError]);

  // Memoized check authentication
  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (authCheckDone.current) {
      console.log('Auth check already done, skipping...');
      return;
    }
    
    // Check if token exists before making request
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No token found, skipping auth check');
      setUser(null);
      setIsLoading(false);
      authCheckDone.current = true;
      return;
    }
    
    setIsLoading(true);
    try {
      await fetchUser(true); // Silent fetch
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      authCheckDone.current = true;
    }
  }, [fetchUser]);

  // Check if user is authenticated on mount - ONLY ONCE
  useEffect(() => {
    console.log('AuthProvider mounted - checking auth once');
    // eslint-disable-next-line 
    checkAuth();
    
    // Reset the flag when component unmounts
    return () => {
      authCheckDone.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - ONLY RUN ONCE

  // Memoized login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { user, accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      authCheckDone.current = false; // Reset so next check works
      showSuccess(`Welcome back, ${user.name}!`, 'Login successful.');
      router.push('/dashboard');
    } catch (error) {
      handleError(error, 'Failed to login.');
    } finally {
      setIsLoading(false);
    }
  }, [router, showSuccess, handleError]);

  // Memoized register
  const register = useCallback(async (name: string, email: string, password: string, captchaToken?: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(name, email, password, captchaToken);
      const { user, accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      authCheckDone.current = false; // Reset so next check works
      showSuccess('Registration successful!', 'Please verify your email address.');
      router.push('/verify-email-pending');
    } catch (error) {
      handleError(error, 'Failed to register.');
    } finally {
      setIsLoading(false);
    }
  }, [router, showSuccess, handleError]);

  // Memoized logout
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
      showSuccess('Logged out successfully!', 'You have been logged out.');
    } catch (error) {
      // Don't show error for logout if it's just a network error
      const isNetworkError = error && typeof error === 'object' && 'code' in error &&
        (error as { code?: string }).code === 'ERR_NETWORK';
      
      if (!isNetworkError) {
        handleError(error, 'Failed to logout.');
      }
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      authCheckDone.current = false; 
      router.push('/login');
    }
  }, [router, showSuccess, handleError]);

  // Memoized verify email - FIXED to prevent multiple error messages
  const verifyEmail = useCallback(async (token: string) => {
    // Prevent multiple verification attempts
    if (isVerifying.current) {
      console.log('Verification already in progress, skipping...');
      return;
    }
    
    isVerifying.current = true;
    setIsLoading(true);
    
    try {
      // First, verify the email
      await authAPI.verifyEmail(token);
      
      // Show success immediately
      showSuccess('Email verified successfully!', 'Your email address has been verified.');
      
      // Then fetch updated user data
      try {
        const userData = await fetchUser(true); // Silent fetch
        if (userData) {
          setUser(userData);
          authCheckDone.current = false;
          router.push('/dashboard');
        } else {
          // If fetch fails, user might need to login again
          router.push('/login?verified=true');
        }
      } catch (fetchError) {
        // If fetching user fails, redirect to login with verification flag
        console.warn('Failed to fetch user after verification:', fetchError);
        router.push('/login?verified=true');
      }
      
    } catch (error) {
      // Check if it's an email already verified error
      const isAlreadyVerified = error && typeof error === 'object' && 'response' in error && 
        (error as { response?: { data?: { message?: string } } }).response?.data?.message?.includes('already verified');
      
      if (isAlreadyVerified) {
        showInfo('Email already verified', 'You can continue to your dashboard.');
        // Try to fetch user anyway
        try {
          const userData = await fetchUser(true);
          if (userData) {
            setUser(userData);
            authCheckDone.current = false;
            router.push('/dashboard');
          } else {
            router.push('/login');
          }
        } catch {
          router.push('/login');
        }
      } else {
        // Only show error if it's not a silent error
        handleError(error, 'Failed to verify email.');
      }
    } finally {
      setIsLoading(false);
      // Reset verification flag after a delay
      setTimeout(() => {
        isVerifying.current = false;
      }, 1000);
    }
  }, [fetchUser, router, showSuccess, showInfo, handleError]);

  // Memoized resend verification
  const resendVerification = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await authAPI.resendVerification(email);
      showInfo('Verification email sent!', 'Please check your inbox.');
    } catch (error) {
      handleError(error, 'Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  }, [showInfo, handleError]);

  // Memoized forgot password
  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      showInfo('Password reset email sent!', 'Please check your inbox.');
    } catch (error) {
      handleError(error, 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  }, [showInfo, handleError]);

  // Memoized reset password
  const resetPassword = useCallback(async (token: string, password: string) => {
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
  }, [router, showSuccess, handleError]);

  // Memoized update profile
  const updateProfile = useCallback(async (data: Partial<User>) => {
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
  }, [showSuccess, handleError]);

  // Memoized context value
  const contextValue = useMemo(() => ({
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
  }), [
    user,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updateProfile,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
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
// web/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, User, AuthResponse, SetupProductResponse, SetupWidgetResponse, SetupBrandingResponse, SetupTeamResponse, SetupIntegrationsResponse, CompleteSetupResponse } from '@/services/auth';
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
  // Setup methods
  setupProduct: (productId: string) => Promise<SetupProductResponse>;
  setupWidget: (settings: { position: string; color: string; icon: string }) => Promise<SetupWidgetResponse>;
  setupBranding: (settings: { companyName: string; brandColor: string; font: string; welcomeMessage: string; quickReplies: string[] }) => Promise<SetupBrandingResponse>;
  setupTeam: (members: Array<{ name: string; email: string; role: 'admin' | 'agent' }>) => Promise<SetupTeamResponse>;
  setupIntegrations: (integrations: string[]) => Promise<SetupIntegrationsResponse>;
  completeSetup: () => Promise<CompleteSetupResponse>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
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
    if (fetchPromise.current) {
      console.log('Fetch already in progress, returning existing promise');
      return fetchPromise.current;
    }

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
        if (!silent) {
          const isAuthError = error && typeof error === 'object' && 'response' in error && 
            (error as { response?: { status?: number } }).response?.status === 401;
          
          if (!isAuthError) {
            handleError(error, 'Failed to fetch user information.');
          }
        }
        localStorage.removeItem('accessToken');
        setUser(null);
        return null;
      }
    })();

    fetchPromise.current = promise;

    try {
      const result = await promise;
      return result;
    } finally {
      fetchPromise.current = null;
    }
  }, [handleError]);

  // Memoized check authentication
  const checkAuth = useCallback(async () => {
    if (authCheckDone.current) {
      console.log('Auth check already done, skipping...');
      return;
    }
    
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
      await fetchUser(true);
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
    
    return () => {
      authCheckDone.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoized login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { user, accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      authCheckDone.current = false;
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
      authCheckDone.current = false;
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

  // Memoized verify email
  const verifyEmail = useCallback(async (token: string) => {
    if (isVerifying.current) {
      console.log('Verification already in progress, skipping...');
      return;
    }
    
    isVerifying.current = true;
    setIsLoading(true);
    
    try {
      await authAPI.verifyEmail(token);
      showSuccess('Email verified successfully!', 'Your email address has been verified.');
      
      try {
        const userData = await fetchUser(true);
        if (userData) {
          setUser(userData);
          authCheckDone.current = false;
          router.push('/dashboard');
        } else {
          router.push('/login?verified=true');
        }
      } catch (fetchError) {
        console.warn('Failed to fetch user after verification:', fetchError);
        router.push('/login?verified=true');
      }
      
    } catch (error) {
      const isAlreadyVerified = error && typeof error === 'object' && 'response' in error && 
        (error as { response?: { data?: { message?: string } } }).response?.data?.message?.includes('already verified');
      
      if (isAlreadyVerified) {
        showInfo('Email already verified', 'You can continue to your dashboard.');
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
        handleError(error, 'Failed to verify email.');
      }
    } finally {
      setIsLoading(false);
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

  // Memoized update profile - Fixed to handle both JSON and FormData
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

  // Setup methods
  const setupProduct = useCallback(async (productId: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.setupProduct(productId);
      // Refresh user data after setup
      await fetchUser(true);
      showSuccess('Product setup successful!', 'You can now continue to the next step.');
      return response;
    } catch (error) {
      handleError(error, 'Failed to setup product.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser, handleError, showSuccess]);

  const setupWidget = useCallback(async (settings: { position: string; color: string; icon: string }) => {
    setIsLoading(true);
    try {
      const response = await authAPI.setupWidget(settings);
      await fetchUser(true);
      showSuccess('Widget setup successful!', 'Your widget is now configured.');
      return response;
    } catch (error) {
      handleError(error, 'Failed to setup widget.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser, handleError, showSuccess]);

  const setupBranding = useCallback(async (settings: { 
    companyName: string; 
    brandColor: string; 
    font: string; 
    welcomeMessage: string; 
    quickReplies: string[];
    logo?: File | string;
  }) => {
    setIsLoading(true);
    try {
      const response = await authAPI.setupBranding(settings);
      await fetchUser(true);
      showSuccess('Branding setup successful!', 'Your branding is now configured.');
      return response;
    } catch (error) {
      handleError(error, 'Failed to setup branding.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser, handleError, showSuccess]);

  const setupTeam = useCallback(async (members: Array<{ name: string; email: string; role: 'admin' | 'agent' }>) => {
    setIsLoading(true);
    try {
      const response = await authAPI.setupTeam(members);
      await fetchUser(true);
      showSuccess('Team setup successful!', 'Your team is now configured.');
      return response;
    } catch (error) {
      handleError(error, 'Failed to setup team.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser, handleError, showSuccess]);

  const setupIntegrations = useCallback(async (integrations: string[]) => {
    setIsLoading(true);
    try {
      const response = await authAPI.setupIntegrations(integrations);
      await fetchUser(true);
      showSuccess('Integrations setup successful!', 'Your integrations are now configured.');
      return response;
    } catch (error) {
      handleError(error, 'Failed to setup integrations.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser, handleError, showSuccess]);

  const completeSetup = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.completeSetup();
      // Update user with the response data
      if (response.data.user) {
        setUser(response.data.user);
      }
      await fetchUser(true);
      showSuccess('Setup complete! 🎉', 'Welcome to Comvia!');
      return response;
    } catch (error) {
      handleError(error, 'Failed to complete setup.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, handleError]);

  const refreshUser = useCallback(async () => {
    await fetchUser(true);
  }, [fetchUser]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user && !!localStorage.getItem('accessToken'),
    setUser,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updateProfile,
    setupProduct,
    setupWidget,
    setupBranding,
    setupTeam,
    setupIntegrations,
    completeSetup,
    refreshUser,
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
    setupProduct,
    setupWidget,
    setupBranding,
    setupTeam,
    setupIntegrations,
    completeSetup,
    refreshUser,
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
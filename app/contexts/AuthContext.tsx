// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from '../utils/api';
import { AuthState, User, LoginPayload } from '@/types/auth';
import { router } from 'expo-router';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

// Action types
type Action =
  | { type: 'RESTORE'; payload: Partial<AuthState> }
  | { type: 'LOGIN'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH'; payload: { accessToken: string } };

// Initial state
const initialState: AuthState = {
  isReady: false,
  isAuth: false,
  accessToken: null,
  refreshToken: null,
  user: null,
};

// Reducer
function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'RESTORE':
      return { ...state, ...action.payload, isReady: true };
    case 'LOGIN':
      return {
        ...state,
        isAuth: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isReady: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        isReady: true,
        isAuth: false,
        accessToken: null,
        refreshToken: null,
        user: null,
      };
    case 'REFRESH':
      return {
        ...state,
        accessToken: action.payload.accessToken,
      };
    default:
      return state;
  }
}

// Context type
type AuthContextType = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const isRefreshing = useRef(false);
  const refreshPromise = useRef<Promise<string | null> | null>(null);

  // Load stored auth data on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [accessToken, refreshToken, userString] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
          SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
          SecureStore.getItemAsync(STORAGE_KEYS.USER),
        ]);

        if (accessToken && refreshToken && userString) {
          const user = JSON.parse(userString) as User;
          dispatch({
            type: 'RESTORE',
            payload: {
              accessToken,
              refreshToken,
              user,
              isAuth: true,
            },
          });
        } else {
          dispatch({ type: 'RESTORE', payload: {} });
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        dispatch({ type: 'RESTORE', payload: {} });
      }
    };

    loadStoredData();
  }, []);

  // Persist tokens and user
  const persist = useCallback(async (user: User, accessToken: string, refreshToken: string) => {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user)),
    ]);
  }, []);

  // Clear stored data
  const clearStoredData = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
    ]);
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{
        success: boolean;
        message?: string;
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        await persist(data.user, data.accessToken, data.refreshToken);
        dispatch({
          type: 'LOGIN',
          payload: {
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          },
        });
        router.replace('/dashboard');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Login failed. Please try again.';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [persist]);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Call logout endpoint if token exists
      if (state.accessToken) {
        await apiFetch('/auth/logout', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.accessToken}`,
          },
        }).catch(() => {});
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      await clearStoredData();
      dispatch({ type: 'LOGOUT' });
      router.replace('/');
      setIsLoading(false);
    }
  }, [state.accessToken, clearStoredData]);

  // Refresh token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    // If already refreshing, return existing promise
    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    // Prevent multiple refresh attempts
    if (isRefreshing.current) {
      return null;
    }

    isRefreshing.current = true;

    const promise = (async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const data = await apiFetch<{
          success: boolean;
          accessToken: string;
          refreshToken: string;
        }>('/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!data.success) {
          throw new Error('Refresh failed');
        }

        // Save new tokens
        await Promise.all([
          SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken),
          SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken),
        ]);

        // Update state
        dispatch({
          type: 'REFRESH',
          payload: { accessToken: data.accessToken },
        });

        return data.accessToken;
      } catch (error) {
        // If refresh fails, logout
        await clearStoredData();
        dispatch({ type: 'LOGOUT' });
        router.replace('/login');
        throw error;
      } finally {
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    })();

    refreshPromise.current = promise;
    return promise;
  }, [clearStoredData]);

  // Context value
  const value: AuthContextType = {
    state,
    login,
    logout,
    refreshToken,
    isLoading,
    isAuthenticated: state.isAuth,
    user: state.user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
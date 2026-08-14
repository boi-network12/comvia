// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from '../utils/api';
import { AuthState, User, LoginPayload } from '@/types/auth';
import { router } from 'expo-router';
import { useSnackbar } from './SnackbarContext';

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
  const { showError, showSuccess } = useSnackbar(); 
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const isRefreshing = useRef(false);
  const refreshPromise = useRef<Promise<string | null> | null>(null);

  // Load stored auth data on mount
  useEffect(() => {
  const loadStoredData = async () => {
    try {
      const [accessToken, userString] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.USER),
      ]);

      // Check if we have a valid session
      if (accessToken && userString) {
        try {
          const user = JSON.parse(userString) as User;
          
          // Validate token by making a test request
          // Optional: You can call /auth/me to validate the token
          
          dispatch({
            type: 'RESTORE',
            payload: {
              accessToken,
              refreshToken: 'cookie-stored', // Placeholder
              user,
              isAuth: true,
            },
          });
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          // Clear invalid data
          await clearStoredData();
          dispatch({ type: 'RESTORE', payload: { isAuth: false } });
        }
      } else {
        dispatch({ type: 'RESTORE', payload: { isAuth: false } });
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      dispatch({ type: 'RESTORE', payload: { isAuth: false } });
    }
  };

  loadStoredData();
}, []);


  // Persist tokens and user
  // contexts/AuthContext.tsx

const persist = useCallback(async (user: User, accessToken: string) => {
  // Validate inputs
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('Invalid access token');
  }
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid user data');
  }

  try {
    // Store only the access token and user data
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    
    const userString = JSON.stringify(user);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, userString);
  } catch (error) {
    console.error('Error persisting auth data:', error);
    throw error;
  }
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
    const response = await apiFetch<{
      success: boolean;
      message?: string;
      data: {
        user: User;
        accessToken: string;
      };
    }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      const { user, accessToken } = response.data;
      
      // The refresh token is set as an HTTP-only cookie by the server
      // We don't need to store it in SecureStore, but we'll store the access token
      await persist(user, accessToken); // Note: refresh token is in cookie
      
      dispatch({
        type: 'LOGIN',
        payload: {
          user: user,
          accessToken: accessToken,
          refreshToken: 'cookie-stored', // Placeholder since it's in HTTP-only cookie
        },
      });
      
      showSuccess(response.message || 'Welcome back!');
      router.replace('/dashboard');
    } else {
      throw new Error(response.message || 'Login failed');
    }
  } catch (error: any) {
    const message = error?.body?.message || error?.message || 'Login failed. Please try again.';
    showError(message);
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
  if (refreshPromise.current) {
    return refreshPromise.current;
  }

  if (isRefreshing.current) {
    return null;
  }

  isRefreshing.current = true;

  const promise = (async () => {
    try {
      // The refresh token is automatically sent as a cookie
      const data = await apiFetch<{
        success: boolean;
        data: {
          accessToken: string;
        };
      }>('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No body needed - refresh token is in cookie
      });

      if (!data.success) {
        throw new Error('Refresh failed');
      }

      // Save new access token
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);

      dispatch({
        type: 'REFRESH',
        payload: { accessToken: data.data.accessToken },
      });

      return data.data.accessToken;
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
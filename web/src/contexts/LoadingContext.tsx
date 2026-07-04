// contexts/LoadingContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface LoadingOptions {
  message?: string;
  description?: string;
  overlay?: boolean;
  delay?: number; // Delay before showing loading in ms
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
}

interface LoadingContextType {
  isLoading: boolean;
  loadingOptions: LoadingOptions | null;
  showLoading: (options?: LoadingOptions) => void;
  hideLoading: () => void;
  withLoading: <T>(promise: Promise<T>, options?: LoadingOptions) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
  defaultOptions?: LoadingOptions;
}

export const LoadingProvider = ({ 
  children, 
  defaultOptions = { 
    message: 'Loading...', 
    overlay: true,
    size: 'md',
    variant: 'spinner'
  } 
}: LoadingProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState<LoadingOptions | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showLoading = useCallback((options?: LoadingOptions) => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    const delay = options?.delay ?? 0;
    
    if (delay > 0) {
      const id = setTimeout(() => {
        setIsLoading(true);
        setLoadingOptions({ ...defaultOptions, ...options });
      }, delay);
      setTimeoutId(id);
    } else {
      setIsLoading(true);
      setLoadingOptions({ ...defaultOptions, ...options });
    }
  }, [defaultOptions, timeoutId]);

  const hideLoading = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsLoading(false);
    setLoadingOptions(null);
  }, [timeoutId]);

  const withLoading = useCallback(async <T,>(
    promise: Promise<T>,
    options?: LoadingOptions
  ): Promise<T> => {
    try {
      showLoading(options);
      const result = await promise;
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  const value = {
    isLoading,
    loadingOptions,
    showLoading,
    hideLoading,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <LoadingOverlay 
          isLoading={isLoading} 
          options={loadingOptions} 
        />,
        document.body
      )}
    </LoadingContext.Provider>
  );
};

// Loading Overlay Component
interface LoadingOverlayProps {
  isLoading: boolean;
  options: LoadingOptions | null;
}

const LoadingOverlay = ({ isLoading, options }: LoadingOverlayProps) => {
  if (!isLoading || !options) return null;

  return (
    <div className={`
      fixed inset-0 z-[9999] flex items-center justify-center
      ${options.overlay ? 'bg-black/50 backdrop-blur-sm' : ''}
      transition-all duration-300
    `}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Loading Spinner */}
          <div className="relative">
            {options.variant === 'spinner' && (
              <div className={`
                animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700
                border-t-primary-600 dark:border-t-primary-400
                ${options.size === 'sm' ? 'h-8 w-8 border-2' : ''}
                ${options.size === 'md' ? 'h-12 w-12 border-4' : ''}
                ${options.size === 'lg' ? 'h-16 w-16 border-4' : ''}
              `} />
            )}
            
            {options.variant === 'dots' && (
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`
                      bg-primary-600 dark:bg-primary-400 rounded-full
                      animate-bounce
                      ${options.size === 'sm' ? 'h-2 w-2' : ''}
                      ${options.size === 'md' ? 'h-3 w-3' : ''}
                      ${options.size === 'lg' ? 'h-4 w-4' : ''}
                    `}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}

            {options.variant === 'pulse' && (
              <div className={`
                bg-primary-600 dark:bg-primary-400 rounded-full
                animate-pulse
                ${options.size === 'sm' ? 'h-8 w-8' : ''}
                ${options.size === 'md' ? 'h-12 w-12' : ''}
                ${options.size === 'lg' ? 'h-16 w-16' : ''}
              `} />
            )}
          </div>

          {/* Loading Message */}
          <div className="text-center space-y-1">
            {options.message && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {options.message}
              </h3>
            )}
            {options.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {options.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper hook for using loading with API calls
export const useLoadingWithApi = () => {
  const { withLoading, showLoading, hideLoading } = useLoading();

  const withApiLoading = useCallback(async <T,>(
    apiCall: () => Promise<T>,
    options?: LoadingOptions
  ): Promise<T> => {
    return await withLoading(apiCall(), options);
  }, [withLoading]);

  return {
    withApiLoading,
    showLoading,
    hideLoading,
  };
};

// Loading Component for direct usage
interface LoadingComponentProps {
  loading?: boolean;
  message?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  children?: ReactNode;
}

export const LoadingComponent = ({
  loading = true,
  message = 'Loading...',
  description,
  size = 'md',
  variant = 'spinner',
  children,
}: LoadingComponentProps) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        {variant === 'spinner' && (
          <div className={`
            animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700
            border-t-primary-600 dark:border-t-primary-400
            ${size === 'sm' ? 'h-6 w-6 border-2' : ''}
            ${size === 'md' ? 'h-10 w-10 border-4' : ''}
            ${size === 'lg' ? 'h-14 w-14 border-4' : ''}
          `} />
        )}
        
        {variant === 'dots' && (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce
                  ${size === 'sm' ? 'h-2 w-2' : ''}
                  ${size === 'md' ? 'h-3 w-3' : ''}
                  ${size === 'lg' ? 'h-4 w-4' : ''}
                `}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {variant === 'pulse' && (
          <div className={`
            bg-primary-600 dark:bg-primary-400 rounded-full animate-pulse
            ${size === 'sm' ? 'h-6 w-6' : ''}
            ${size === 'md' ? 'h-10 w-10' : ''}
            ${size === 'lg' ? 'h-14 w-14' : ''}
          `} />
        )}
      </div>
      
      <div className="text-center space-y-1">
        {message && (
          <h4 className="font-medium text-gray-900 dark:text-white">
            {message}
          </h4>
        )}
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
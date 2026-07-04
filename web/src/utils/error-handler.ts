// utils/error-handler.ts


import { useToast } from '@/contexts';
import { AxiosError } from 'axios';

export const useErrorHandler = () => {
  const { showError } = useToast();

  const handleError = (error: unknown, defaultMessage?: string) => {
    let message = defaultMessage || 'An unexpected error occurred';
    
    // Handle Axios errors
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosError = error as AxiosError;
      
      // Check if the response has data with a message
      if (axiosError.response?.data) {
        const responseData = axiosError.response.data as unknown;

        // Try to get error message from different possible formats
        if (typeof responseData === 'string') {
          message = responseData;
        } else if (responseData && typeof responseData === 'object') {
          const data = responseData as Record<string, unknown>;

          // ✅ FIX: Check for different error formats
          // Format 1: { error: { message: "..." } } - Your backend format
          if (data.error && typeof data.error === 'object') {
            const errorObj = data.error as Record<string, unknown>;
            if (typeof errorObj.message === 'string') {
              message = errorObj.message;
            }
          }
          // Format 2: { message: "..." } - Simple format
          else if (typeof data.message === 'string') {
            message = data.message;
          }
          // Format 3: { error: "..." } - Simple error field
          else if (typeof data.error === 'string') {
            message = data.error;
          }
          // Format 4: { msg: "..." } - Validation format
          else if (typeof data.msg === 'string') {
            message = data.msg;
          }
          // Format 5: Check for nested error messages
          else {
            // Try to find any message in the response
            const errorMessage = findErrorMessage(data);
            if (errorMessage) {
              message = errorMessage;
            } else {
              // Use status code fallback
              const status = axiosError.response.status;
              const statusMessages: Record<number, string> = {
                400: 'Bad request. Please check your input.',
                401: 'Unauthorized. Please log in again.',
                403: 'Access denied. You don\'t have permission.',
                404: 'Resource not found.',
                409: 'Conflict with existing data.',
                422: 'Validation failed. Please check your input.',
                429: 'Too many requests. Please try again later.',
                500: 'Server error. Please try again later.',
                502: 'Service temporarily unavailable.',
                503: 'Service unavailable. Please try again later.',
              };
              message = statusMessages[status] || `Error ${status}: ${axiosError.message}`;
            }
          }
        }
      } else if (axiosError.message) {
        message = axiosError.message;
      }
    } 
    // Handle standard Error objects
    else if (error instanceof Error) {
      message = error.message;
    } 
    // Handle string errors
    else if (typeof error === 'string') {
      message = error;
    } 
    // Handle other objects
    else if (error && typeof error === 'object' && 'message' in error) {
      message = String(error.message);
    }

    // ✅ Log the full error for debugging
    console.error('Error details:', error);
    console.error('Extracted message:', message);
    
    showError(message, 'Error');
    
    return message;
  };

  // Helper function to find error message in nested objects
  const findErrorMessage = (obj: Record<string, unknown>, depth: number = 0): string | null => {
    if (depth > 3) return null; // Prevent infinite recursion
    
    // Check common error message fields
    const messageFields = ['message', 'msg', 'error', 'detail', 'details'];
    for (const field of messageFields) {
      if (obj[field] && typeof obj[field] === 'string') {
        return obj[field] as string;
      }
    }
    
    // Recursively check nested objects
    for (const value of Object.values(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const result = findErrorMessage(value as Record<string, unknown>, depth + 1);
        if (result) return result;
      }
    }
    
    return null;
  };

  return { handleError };
};
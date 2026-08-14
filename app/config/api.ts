// config/api.ts
import { Platform } from 'react-native';

// Get the correct backend URL based on environment
const getBackendUrl = () => {
  // For production
  if (process.env.NODE_ENV === 'production') {
    return 'https://comvia-backend-endpoint.vercel.app';
  }

  // For development
  const isPhysicalDevice = false; // You might want to detect this

  if (Platform.OS === 'android') {
    // Android emulator
    return 'http://10.34.246.4:8080';
  } else if (Platform.OS === 'ios') {
    // iOS simulator
    return 'http://10.34.246.4:8080';
  } else {
    // Physical device - use your computer's local IP
    return 'http://10.34.246.4:8080'; // Replace with your IP
  }
};

export const BACKEND_URI = getBackendUrl();

// Socket Configuration
export const SOCKET_URL = process.env.SOCKET_URL || "https://comvia-realtime.fly.dev";
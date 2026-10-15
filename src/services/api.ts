import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Android network configuration:
 * - In Android Emulator: '10.0.2.2' points to the development machine's localhost.
 * - On a Physical Android Device: Replace with your machine's local Wi-Fi IP (e.g., '192.168.1.50:3000').
 * - For Production: Define EXPO_PUBLIC_API_URL in a .env file.
 */
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }

  return 'http://localhost:3000/api';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // If you store an auth token (e.g., with expo-secure-store), attach it here:
    // const token = ...;
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.warn('[API Error]:', error.response.status, error.response.data);
    } else if (error.request) {
      console.warn('[API Network Error]: Check if backend server is running and accessible from Android.');
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Android network configuration:
 * - In Android Emulator: '10.0.2.2:8080' points to the development machine's localhost.
 * - On a Physical Android Device: Replace with your machine's local Wi-Fi IP (e.g., '192.168.1.50:8080').
 * - For Production: Define EXPO_PUBLIC_API_URL in a .env file.
 */
const getBaseUrl = (): string => {
  let url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    url = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
  }
  if (Platform.OS === 'android' && url.includes('localhost')) {
    return url.replace('localhost', '10.0.2.2');
  }
  return url;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor con inyección automática de JWT
api.interceptors.request.use(
  async (config) => {
    try {
      const session = await AsyncStorage.getItem('@eventia_session_v1');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch {
      // Ignorar fallo de lectura de sesión
    }
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

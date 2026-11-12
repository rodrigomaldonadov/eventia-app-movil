import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    return 'http://10.0.2.2:8080/api';
  }

  return 'http://localhost:8080/api';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const SESSION_KEY = '@eventia_session_v1';

/**
 * Recupera el token JWT de la sesión almacenada (AsyncStorage hoy; SecureStore por el Integrante 1).
 */
async function getStoredToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Request interceptor: attaches Authorization: Bearer <token> on every request.
 */
api.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: handles 401 by clearing the session and signalling auth failure.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await AsyncStorage.removeItem(SESSION_KEY);
      } catch { }
      // Dispatch a custom event so listeners (AuthProvider / layout guards) can react.
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('eventia:auth:401'));
      }
    }
    if (error.response) {
      console.warn('[API Error]:', error.response.status, error.response.data);
    } else if (error.request) {
      console.warn('[API Network Error]: Check if backend server is running and accessible from Android.');
    }
    return Promise.reject(error);
  }
);

export default api;

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export interface User {
  id?: string;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, token?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = '@eventia_session_v1';

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // ignore
    }
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // ignore
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
  },
};

let memorySession: { user: User; token?: string } | null = null;

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = await storage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.user) {
            setUser(parsed.user);
            setToken(parsed.token || null);
          }
        } else if (memorySession) {
          setUser(memorySession.user);
          setToken(memorySession.token || null);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (userData: User, authToken?: string) => {
    setUser(userData);
    setToken(authToken || 'session-token');
    const sessionData = { user: userData, token: authToken || 'session-token' };
    memorySession = sessionData;
    await storage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    memorySession = null;
    await storage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

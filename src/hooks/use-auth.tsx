import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id?: string;
  fullName: string;
  email: string;
}

interface Session {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, token?: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = '@eventia_session_v1';

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<Session>;
  return (
    typeof session.token === 'string' &&
    session.token.length > 0 &&
    !!session.user &&
    typeof session.user.fullName === 'string' &&
    typeof session.user.email === 'string'
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (isSession(parsed)) {
            if (active) setSession(parsed);
          } else {
            await AsyncStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('[Auth] No se pudo recuperar la sesión', error);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadSession();
    return () => { active = false; };
  }, []);

  const login = async (userData: User, authToken?: string, remember = true) => {
    // Token local de demostración: no representa una sesión validada por un servidor.
    const nextSession: Session = { user: userData, token: authToken || Crypto.randomUUID() };
    if (remember) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    setSession(nextSession);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{
      user: session?.user ?? null,
      token: session?.token ?? null,
      isLoading,
      isAuthenticated: !!session,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

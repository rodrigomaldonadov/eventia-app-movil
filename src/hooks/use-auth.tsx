import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Preferencias configurables por el usuario dentro de su perfil.
 */
export interface UserPreferences {
  saleAlerts?: boolean;
  emailNotifications?: boolean;
  favoriteCategories?: string[];
}

/**
 * Estructura del usuario autenticado en la aplicación.
 */
export interface User {
  id?: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  preferences?: UserPreferences;
}

/**
 * Representación de la sesión activa guardada.
 */
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
  /** Función en español para actualizar los datos del usuario en la sesión */
  actualizarUsuario: (datosActualizados: Partial<User>) => Promise<void>;
  /** Alias en inglés para compatibilidad */
  updateUser: (datosActualizados: Partial<User>) => Promise<void>;
}

const STORAGE_KEY = '@eventia_session_v1';

/**
 * Validador para asegurar que los datos recuperados corresponden a una sesión válida.
 */
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

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  actualizarUsuario: async () => {},
  updateUser: async () => {},
});

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
    return () => {
      active = false;
    };
  }, []);

  const login = async (userData: User, authToken?: string, remember = true) => {
    // Token local de demostración: no representa una sesión validada por un servidor.
    const nextSession: Session = {
      user: userData,
      token: authToken || Crypto.randomUUID(),
    };
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

  /**
   * Actualiza parcialmente el usuario en memoria y en almacenamiento local.
   * Permite actualizar correo, avatarUrl, preferencias, etc.
   */
  const actualizarUsuario = async (datosActualizados: Partial<User>) => {
    setSession((prev) => {
      if (!prev) return null;
      const nuevoUsuario: User = {
        ...prev.user,
        ...datosActualizados,
        preferences: {
          ...(prev.user.preferences || {}),
          ...(datosActualizados.preferences || {}),
        },
      };
      const nextSession: Session = {
        ...prev,
        user: nuevoUsuario,
      };

      // Si hay sesión guardada en AsyncStorage, sincronizamos el cambio
      AsyncStorage.getItem(STORAGE_KEY)
        .then((stored) => {
          if (stored) {
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession)).catch(() => {});
          }
        })
        .catch(() => {});

      return nextSession;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? null,
        isLoading,
        isAuthenticated: !!session,
        login,
        logout,
        actualizarUsuario,
        updateUser: actualizarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

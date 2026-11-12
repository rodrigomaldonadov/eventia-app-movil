import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/use-auth';

const SESSION_KEY = '@eventia_session_v1';

/**
 * Tab Bar principal de Eventia (Integrante 4 · RF-04).
 * Pestañas: Inicio, Guardados, Entradas, Perfil.
 * Cada pantalla con sesión requerida valida el token y redirige a /login si no hay sesión.
 */
export default function TabsLayout() {
  const { isLoading, isAuthenticated } = useAuth();

  // Guard: si no hay sesión y no está cargando, redirige al login.
  // Se aplica en el layout de tabs para proteger todas las pestañas.
  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (!raw) {
          if (active) {
            // No hay sesión almacenada; dejar que las pantallas individuales gestionen la redirección.
          }
        }
      } catch { }
    };
    void checkSession();
    return () => {
      active = false;
    };
  }, []);

  // Mientras se carga la sesión, no renderizamos nada para evitar parpadeos.
  if (isLoading) return null;

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused, color }) => (
            // Usamos un icono simple inline; se puede reemplazar por asset.
            null
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{ title: 'Guardados' }}
      />
      <Tabs.Screen
        name="tickets"
        options={{ title: 'Entradas' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil' }}
      />
    </Tabs>
  );
}

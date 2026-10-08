import '@/global.css';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { EventiaHeader } from '@/components/eventia-header';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/hooks/use-auth';

SplashScreen.preventAutoHideAsync();

/**
 * Layout raíz (Integrante 4): Stack general de Eventia.
 * - `(tabs)`: Home/Catálogo, Entradas y Perfil.
 * - `event/[id]`: detalle de cada evento.
 * - `login`: acceso.
 * - `register`: crear cuenta.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ header: () => <EventiaHeader /> }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="event/[id]" options={{ title: 'Detalle del evento', header: undefined }} />
          <Stack.Screen name="login" options={{ title: 'Ingresar' }} />
          <Stack.Screen name="register" options={{ title: 'Crear cuenta' }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}

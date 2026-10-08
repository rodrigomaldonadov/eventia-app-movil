import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import '@/global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

/**
 * Layout raíz (Integrante 4): Stack general de Eventia.
 * - `(tabs)`: Home/Catálogo, Entradas y Perfil (Tab Bar).
 * - `event/[id]`: detalle de cada evento (push sobre las tabs).
 * - `login`: acceso (pantalla del Integrante 1).
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]" options={{ title: 'Detalle del evento' }} />
        <Stack.Screen name="login" options={{ title: 'Ingresar' }} />
      </Stack>
    </ThemeProvider>
  );
}

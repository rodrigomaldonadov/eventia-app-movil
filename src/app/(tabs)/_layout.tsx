import { Stack } from 'expo-router';

/** Pestañas/Rutas principales sin barra inferior. */
export default function TabsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

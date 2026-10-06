import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';

/**
 * Placeholder de Login.
 * La pantalla real (validación, sesión, token, recuperación y redirección
 * por rol) la implementa el Integrante 1. Solo se declara la ruta para que
 * la navegación del Integrante 4 quede completa.
 */
export default function LoginPlaceholderScreen() {
  const eventia = useEventiaTheme();
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Ingresar' }} />
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="smallBold" style={[styles.brand, { color: eventia.primary }]}>
          Eventia
        </ThemedText>
        <ThemedText type="subtitle">Iniciar sesión</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.text}>
          Módulo del Integrante 1 (Login, sesión y recuperación de contraseña).
        </ThemedText>
        <Link href="/" asChild>
          <Pressable
            style={StyleSheet.flatten([
              styles.button,
              { backgroundColor: eventia.primaryContainer },
            ])}>
            <ThemedText type="smallBold" style={styles.buttonLabel}>
              Continuar como invitado
            </ThemedText>
          </Pressable>
        </Link>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    gap: Spacing.three,
    justifyContent: 'center',
  },
  brand: {
    fontSize: 20,
    lineHeight: 26,
  },
  text: {
    lineHeight: 22,
  },
  button: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#FFFFFF',
  },
});

import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';

/**
 * TODO(Integrante 1): implementar el formulario de login, validación, token de sesión, recuperación de contraseña y redirección por rol.
 */
export default function LoginScreen() {
  const eventia = useEventiaTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedText type="subtitle">Aquí se inicia sesión</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.text}>
          Módulo del Integrante 1 (Login, token de sesión, recuperación de contraseña y redirección por rol).
        </ThemedText>

        <Link href="/register" asChild>
          <Pressable style={styles.registerLink}>
            <ThemedText type="small" themeColor="textSecondary">
              ¿No tienes cuenta?{' '}
              <ThemedText type="smallBold" style={{ color: eventia.primary }}>
                Regístrate
              </ThemedText>
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
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    lineHeight: 22,
  },
  registerLink: {
    paddingVertical: Spacing.two,
  },
});

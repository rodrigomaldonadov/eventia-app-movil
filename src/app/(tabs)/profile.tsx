import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';

/**
 * Placeholder de "Perfil".
 * El contenido (visualización, edición, foto, preferencias) lo implementa
 * el Integrante 3. Solo define la ruta para completar la navegación.
 */
export default function ProfilePlaceholderScreen() {
  const eventia = useEventiaTheme();
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Perfil</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.text}>
          Módulo del Integrante 3 (Usuario / Perfil): datos personales, foto y
          preferencias.
        </ThemedText>
        <Link href="/login" asChild>
          <Pressable
            style={StyleSheet.flatten([
              styles.button,
              { backgroundColor: eventia.primaryContainer },
            ])}>
            <ThemedText type="smallBold" style={styles.buttonLabel}>
              Ir al login
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

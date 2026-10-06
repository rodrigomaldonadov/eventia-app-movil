import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';

/**
 * Placeholder de "Guardados".
 * La guía del catálogo incluye esta pestaña (favoritos). Ningún integrante
 * la tiene asignada aún; solo se declara la ruta para completar la
 * navegación del Tab Bar del Integrante 4.
 */
export default function SavedPlaceholderScreen() {
  const eventia = useEventiaTheme();
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Guardados</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.text}>
          Eventos guardados como favoritos. Módulo aún sin asignar.
        </ThemedText>
        <Link href="/" asChild>
          <Pressable
            style={StyleSheet.flatten([
              styles.button,
              { backgroundColor: eventia.primaryContainer },
            ])}>
            <ThemedText type="smallBold" style={styles.buttonLabel}>
              Explorar eventos
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

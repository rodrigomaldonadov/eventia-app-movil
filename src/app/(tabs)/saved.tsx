import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventiaHeader } from '@/components/eventia-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useAuth } from '@/hooks/use-auth';

/**
 * Placeholder de "Guardados".
 * Requiere sesión autenticada. Redirige a /login si no hay sesión.
 */
export default function SavedPlaceholderScreen() {
  const eventia = useEventiaTheme();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <EventiaHeader />
        <View style={styles.content}>
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
        </View>
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
  },
  content: {
    flex: 1,
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

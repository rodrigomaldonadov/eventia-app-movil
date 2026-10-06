import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getEventById } from '@/data/events';

/**
 * Destino de la navegación "ver detalle" del catálogo (Integrante 4).
 * El contenido de la ficha (información, selección de entradas y carrito)
 * lo implementa el Integrante 5.
 */
export default function EventDetailStubScreen() {
  const eventia = useEventiaTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = getEventById(id);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: event?.title ?? 'Detalle del evento' }} />
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">{event?.title ?? 'Evento no encontrado'}</ThemedText>
        {event && (
          <ThemedText themeColor="textSecondary">{event.category}</ThemedText>
        )}
        <ThemedText themeColor="textSecondary" style={styles.text}>
          Módulo del Integrante 5 (Eventos + Carrito): ficha del evento, selección
          de entradas y carrito.
        </ThemedText>
        <Link href="/" asChild>
          <Pressable
            style={StyleSheet.flatten([
              styles.button,
              { backgroundColor: eventia.primaryContainer },
            ])}>
            <ThemedText type="smallBold" style={styles.buttonLabel}>
              Volver al catálogo
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

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useAuth } from '@/hooks/use-auth';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { eventService } from '@/services/eventService';
import type { EventItem } from '@/types/event.types';

/**
 * Mis eventos (Integrante 4 · organizador).
 * Vista exclusiva para organizadores: lista los eventos propios mediante
 * GET /api/events/organizer y permite activar/desactivar con
 * PATCH /api/events/{id}/active (borrado lógico, nada se borra físicamente).
 * Solo accesible si el usuario tiene rol de organizador.
 */
export default function MisEventosScreen() {
  const router = useRouter();
  const theme = useTheme();
  const eventia = useEventiaTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Guard: sin sesión, redirige al login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventService.getMyEvents(false);
      setEvents(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar tus eventos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void loadEvents();
    }
  }, [isAuthenticated]);

  const onRefresh = () => {
    setIsRefreshing(true);
    void loadEvents();
  };

  const toggleActive = async (eventId: string | number, currentActive: boolean) => {
    try {
      await eventService.toggleEventActive(eventId, !currentActive);
      await loadEvents();
    } catch {
      Alert.alert(
        'Error',
        `No se pudo ${currentActive ? 'desactivar' : 'activar'} el evento.`,
      );
    }
  };

  if (!isAuthenticated || authLoading) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Mis Eventos
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Gestiona los eventos que organizas. Activa o desactiva según necesites.
            </ThemedText>
          </View>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Cargando eventos…
              </Text>
            </View>
          )}

          {!isLoading && events.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                No tienes eventos creados
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.emptySubtitle}>
                Crea tu primer evento desde el panel de organizador.
              </ThemedText>
            </View>
          )}

          {!isLoading && events.length > 0 && (
            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.eventCard, { backgroundColor: theme.backgroundElement }]}
                  onPress={() =>
                    router.push({ pathname: '/event/[id]', params: { id: item.id } })
                  }
                >
                  <View style={styles.eventCardBody}>
                    <View style={styles.eventCardInfo}>
                      <ThemedText type="smallBold" style={styles.eventTitle}>
                        {item.title}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.eventMeta}>
                        {item.venue} · {item.city}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.eventMeta}>
                        {item.date} {item.time}
                      </ThemedText>
                    </View>
                    <View style={styles.eventCardActions}>
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.activeChip,
                          {
                            backgroundColor: item.active
                              ? eventia.successBg
                              : eventia.dangerBg,
                            color: item.active ? eventia.successText : eventia.dangerText,
                          },
                        ]}>
                        {item.active ? 'Activo' : 'Inactivo'}
                      </ThemedText>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          item.active ? 'Desactivar evento' : 'Activar evento'
                        }
                        onPress={() => toggleActive(item.id, Boolean(item.active))}
                        style={styles.toggleButton}
                      >
                        <Ionicons
                          name={item.active ? 'close-outline' : 'checkmark-outline'}
                          size={18}
                          color={item.active ? eventia.dangerText : eventia.successText}
                        />
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              )}
              contentContainerStyle={styles.listContent}
            />
          )}
        </ScrollView>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.half,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    lineHeight: 20,
  },
  loadingContainer: {
    padding: Spacing.five,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#687086',
  },
  listContent: {
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: Spacing.two,
  },
  eventCardBody: {
    flexDirection: 'row',
    padding: Spacing.three,
    gap: Spacing.three,
    alignItems: 'center',
  },
  eventCardInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  eventMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  eventCardActions: {
    gap: 8,
    alignItems: 'center',
  },
  activeChip: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
  },
});

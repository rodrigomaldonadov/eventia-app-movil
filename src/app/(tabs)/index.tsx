import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { CategoryChips, type CategoryFilter } from '@/components/category-chips';
import { EventCard } from '@/components/event-card';
import { HeroCard } from '@/components/hero-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth, Spacing, Eventia } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { EVENT_CATEGORIES, EVENTS } from '@/data/events';
import { eventService } from '@/services/eventService';
import type { EventItem } from '@/types/event.types';

const FILTERS: readonly CategoryFilter[] = ['Todos', ...EVENT_CATEGORIES];

/**
 * Home / Catálogo general de eventos (Integrante 4 · RF-04), según la guía:
 * header, buscador + orden, píldoras de categoría, hero destacado y lista
 * de eventos próximos. Cada tarjeta navega al detalle `/event/[id]`.
 * Carga reactiva desde almacenamiento persistente para reflejar cambios del Admin y compras.
 */
export default function HomeCatalogScreen() {
  const theme = useTheme();
  const eventia = useEventiaTheme();
  const [events, setEvents] = useState<EventItem[]>(EVENTS);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('Todos');
  const [ascending, setAscending] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (e) {
      console.warn('[HomeCatalog] Error al cargar eventos:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const featured = useMemo(() => events.filter((event) => event.featured), [events]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matches = events.filter((event) => {
      const matchesCategory = category === 'Todos' || event.category === category;
      const matchesQuery =
        normalized.length === 0 ||
        event.title.toLowerCase().includes(normalized) ||
        event.venue.toLowerCase().includes(normalized) ||
        event.city.toLowerCase().includes(normalized) ||
        event.organizer.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
    return [...matches].sort((a, b) =>
      ascending ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
    );
  }, [events, query, category, ascending]);

  const showSections = query.trim().length === 0 && category === 'Todos';
  const listData = showSections
    ? filtered.filter((item) => !featured.some((event) => event.id === item.id))
    : filtered;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement }]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar festivales, conferencias, deportes…"
              placeholderTextColor={theme.textSecondary}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              style={[styles.search, { color: theme.text }]}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              ascending ? 'Ordenar por fecha descendente' : 'Ordenar por fecha ascendente'
            }
            onPress={() => setAscending((value) => !value)}
            style={({ pressed }) => [
              styles.sortButton,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">{ascending ? 'Fecha ↓' : 'Fecha ↑'}</ThemedText>
          </Pressable>
        </View>

        <CategoryChips categories={FILTERS} selected={category} onSelect={setCategory} />

        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          style={styles.flatList}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Eventia.primary]} />
          }
          ListHeaderComponent={
            showSections ? (
              <View>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Destacados
                </ThemedText>
                {featured.map((event) => (
                  <View key={event.id} style={styles.cardGap}>
                    <HeroCard event={event} />
                  </View>
                ))}
                <View style={styles.sectionRow}>
                  <View>
                    <ThemedText type="smallBold" style={[styles.sectionHeading, { color: eventia.primary }]}>
                      Eventos Próximos
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Acceso verificado con emisión instantánea
                    </ThemedText>
                  </View>
                </View>
              </View>
            ) : (
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                {`${filtered.length} resultado(s)`}
              </ThemedText>
            )
          }
          ListEmptyComponent={
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              No se encontraron eventos. Prueba con otra búsqueda o categoría.
            </ThemedText>
          }
          renderItem={({ item }) => (
            <View style={styles.cardGap}>
              <EventCard event={item} />
            </View>
          )}
        />
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  searchBox: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
  },
  search: {
    fontSize: 14,
    paddingVertical: 0,
  },
  sortButton: {
    height: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  flatList: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  sectionTitle: {
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  sectionHeading: {
    fontSize: 16,
  },
  cardGap: {
    marginBottom: Spacing.three,
  },
  empty: {
    padding: Spacing.four,
    textAlign: 'center',
  },
});

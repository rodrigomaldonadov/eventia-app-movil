import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { MaxContentWidth, Spacing, Eventia } from '@/constants/theme';
import { eventService } from '@/services/eventService';
import type { EventItem } from '@/types/event.types';
import { formatPricePEN, formatShortDate } from '@/data/events';

export default function AdminEventsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadEvents = useCallback(async () => {
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (e) {
      console.error('[AdminEvents Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handleDelete = (event: EventItem) => {
    Alert.alert(
      'Eliminar Evento',
      `¿Estás seguro de que deseas eliminar permanentemente "${event.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventService.deleteEvent(event.id);
              setEvents((prev) => prev.filter((e) => e.id !== event.id));
              Alert.alert('Éxito', 'El evento fue eliminado correctamente.');
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el evento.');
            }
          },
        },
      ]
    );
  };

  const filteredEvents = events.filter((e) => {
    const q = search.trim().toLowerCase();
    return (
      q.length === 0 ||
      e.title.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    );
  });

  if (authLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Eventia.primary} />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Acceso Denegado' }} />
        <Ionicons name="lock-closed-outline" size={64} color="#EF4444" />
        <Text style={[styles.deniedTitle, { color: theme.text }]}>Acceso Restringido</Text>
        <Text style={[styles.deniedSubtitle, { color: theme.textSecondary }]}>
          Solo el personal administrador puede gestionar el catálogo de eventos.
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: Eventia.primary }]}
          onPress={() => router.replace('/')}>
          <Text style={styles.primaryBtnText}>Volver al Catálogo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Gestión de Eventos',
          headerShown: true,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerAddBtn}
              onPress={() => router.push('/admin/event-form' as never)}>
              <Ionicons name="add-circle" size={22} color={Eventia.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.contentWrap}>
        {/* Barra superior de búsqueda y botón Crear */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="search" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Buscar por título, lugar o categoría..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Botón destacado "Crear Nuevo Evento" */}
        <TouchableOpacity
          style={[styles.createBannerBtn, { backgroundColor: Eventia.primary }]}
          activeOpacity={0.85}
          onPress={() => router.push('/admin/event-form' as never)}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createBannerText}>Publicar Nuevo Evento</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="small" color={Eventia.primary} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Eventia.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No se encontraron eventos</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Intenta cambiar el término de búsqueda o crea uno nuevo.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const generalTicket = item.tickets.find((t) => t.id === 'general' || t.name.includes('General'));
              const vipTicket = item.tickets.find((t) => t.id === 'vip' || t.name.includes('VIP'));
              const vipPlusTicket = item.tickets.find((t) => t.id === 'vip_plus' || t.name.includes('+'));

              return (
                <View style={[styles.eventCard, { backgroundColor: theme.backgroundElement }]}>
                  <View style={styles.cardHeader}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.eventThumb} />
                    ) : (
                      <View style={[styles.eventThumbPlaceholder, { backgroundColor: Eventia.primaryContainer }]}>
                        <Ionicons name="image-outline" size={22} color="#FFFFFF" />
                      </View>
                    )}
                    <View style={styles.cardInfo}>
                      <View style={styles.badgeCategory}>
                        <Text style={styles.badgeCategoryText}>{item.category}</Text>
                      </View>
                      <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={[styles.cardDate, { color: theme.textSecondary }]}>
                        {formatShortDate(item.date)} • {item.time} hrs
                      </Text>
                      <Text style={[styles.cardVenue, { color: theme.textSecondary }]} numberOfLines={1}>
                        {item.venue}, {item.city}
                      </Text>
                    </View>
                  </View>

                  {/* Stock por las 3 categorías: General, VIP, VIP+ */}
                  <View style={[styles.ticketTiersBox, { backgroundColor: theme.background }]}>
                    <Text style={[styles.ticketTiersHeader, { color: theme.textSecondary }]}>
                      DISPONIBILIDAD Y PRECIOS POR CATEGORÍA
                    </Text>
                    <View style={styles.tiersGrid}>
                      <View style={styles.tierItem}>
                        <Text style={[styles.tierName, { color: theme.text }]}>General</Text>
                        <Text style={[styles.tierPrice, { color: Eventia.primary }]}>
                          {generalTicket ? formatPricePEN(generalTicket.price) : 'N/D'}
                        </Text>
                        <Text style={[styles.tierStock, { color: theme.textSecondary }]}>
                          {generalTicket ? `${generalTicket.available} cupos` : '0 cupos'}
                        </Text>
                      </View>

                      <View style={styles.tierDivider} />

                      <View style={styles.tierItem}>
                        <Text style={[styles.tierName, { color: theme.text }]}>VIP</Text>
                        <Text style={[styles.tierPrice, { color: '#F59E0B' }]}>
                          {vipTicket ? formatPricePEN(vipTicket.price) : 'N/D'}
                        </Text>
                        <Text style={[styles.tierStock, { color: theme.textSecondary }]}>
                          {vipTicket ? `${vipTicket.available} cupos` : '0 cupos'}
                        </Text>
                      </View>

                      <View style={styles.tierDivider} />

                      <View style={styles.tierItem}>
                        <Text style={[styles.tierName, { color: theme.text }]}>VIP+</Text>
                        <Text style={[styles.tierPrice, { color: '#8B5CF6' }]}>
                          {vipPlusTicket ? formatPricePEN(vipPlusTicket.price) : 'N/D'}
                        </Text>
                        <Text style={[styles.tierStock, { color: theme.textSecondary }]}>
                          {vipPlusTicket ? `${vipPlusTicket.available} cupos` : '0 cupos'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Botones de Acción */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.editBtn]}
                      onPress={() => router.push(`/admin/event-form?id=${item.id}` as never)}>
                      <Ionicons name="create-outline" size={16} color="#3B82F6" />
                      <Text style={[styles.actionBtnText, { color: '#3B82F6' }]}>Editar Evento</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDelete(item)}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  deniedTitle: { fontSize: 20, fontWeight: '800', marginTop: 12 },
  deniedSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  primaryBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  headerAddBtn: { padding: 4 },
  contentWrap: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  searchRow: { marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  createBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: Eventia.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createBannerText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  listContent: { paddingBottom: 32, gap: 14 },
  eventCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', gap: 12 },
  eventThumb: { width: 72, height: 72, borderRadius: 12 },
  eventThumbPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  badgeCategory: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeCategoryText: { fontSize: 10, fontWeight: '700', color: Eventia.primary },
  cardTitle: { fontSize: 15, fontWeight: '800', lineHeight: 19 },
  cardDate: { fontSize: 12, marginTop: 2 },
  cardVenue: { fontSize: 11, marginTop: 1 },
  ticketTiersBox: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  ticketTiersHeader: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6, marginBottom: 6 },
  tiersGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  tierItem: { flex: 1, alignItems: 'center' },
  tierDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  tierName: { fontSize: 11, fontWeight: '700' },
  tierPrice: { fontSize: 12, fontWeight: '800', marginTop: 1 },
  tierStock: { fontSize: 10, marginTop: 1 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  editBtn: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptySubtitle: { fontSize: 12, textAlign: 'center' },
});


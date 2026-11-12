import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
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

  // Estado para el modal de Detalle de Evento (Solo Lectura)
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

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
    const tickets = Array.isArray(event.tickets) ? event.tickets : ((event as any).ticketTypes ?? []);
    const totalSold = tickets.reduce((acc: number, t: any) => {
      const tot = t.total ?? t.totalCapacity ?? t.available ?? 0;
      const avail = t.available ?? t.availableCapacity ?? 0;
      return acc + Math.max(0, tot - avail);
    }, 0);
    const hasSold = Boolean(event.hasSoldTickets) || (event.soldTicketsCount ?? 0) > 0 || totalSold > 0;

    if (hasSold) {
      Alert.alert(
        'Acción Denegada',
        'No se puede eliminar un evento que ya registra entradas vendidas por compromiso con los compradores.'
      );
      return;
    }

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
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || err?.message || 'No se pudo eliminar el evento.');
            }
          },
        },
      ]
    );
  };

  const handleEditPress = (event: EventItem, isLocked: boolean, soldCount: number) => {
    if (isLocked) {
      Alert.alert(
        '🔒 Evento Bloqueado para Edición',
        `Este evento ya cuenta con ${soldCount} entrada(s) vendida(s).\n\nPor políticas de seguridad y protección a los compradores, no se pueden alterar fechas, recintos ni tarifas una vez iniciada la venta de boletos.`
      );
      return;
    }
    router.push(`/admin/event-form?id=${event.id}` as never);
  };

  const filteredEvents = events.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const title = (e.title ?? '').toLowerCase();
    const venue = (e.venue ?? (e as any).location ?? '').toLowerCase();
    const category = (e.category ?? (e as any).categoryName ?? '').toLowerCase();
    return title.includes(q) || venue.includes(q) || category.includes(q);
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
            keyExtractor={(item) => String(item.id)}
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
              const tickets = Array.isArray(item.tickets) ? item.tickets : ((item as any).ticketTypes ?? []);
              const generalTicket = tickets.find((t: any) => t.id === 'general' || (t.name || '').includes('General'));
              const vipTicket = tickets.find((t: any) => t.id === 'vip' || (t.name || '').includes('VIP'));
              const vipPlusTicket = tickets.find((t: any) => t.id === 'vip_plus' || (t.name || '').includes('+'));

              const totalCap = tickets.reduce((acc: number, t: any) => acc + (t.total ?? t.totalCapacity ?? t.available ?? 0), 0);
              const totalAvail = tickets.reduce((acc: number, t: any) => acc + (t.available ?? t.availableCapacity ?? 0), 0);
              const totalSold = Math.max(0, totalCap - totalAvail);
              const isLocked = Boolean(item.hasSoldTickets) || (item.soldTicketsCount ?? 0) > 0 || totalSold > 0;
              const soldCount = (item.soldTicketsCount ?? 0) || totalSold;

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
                      <View style={styles.badgesRow}>
                        <View style={styles.badgeCategory}>
                          <Text style={styles.badgeCategoryText}>
                            {item.category ?? (item as any).categoryName ?? 'General'}
                          </Text>
                        </View>
                        {isLocked ? (
                          <View style={[styles.badgeCategory, styles.badgeLocked]}>
                            <Text style={styles.badgeLockedText}>
                              🔒 {soldCount} vendida{soldCount !== 1 ? 's' : ''} (No editable)
                            </Text>
                          </View>
                        ) : (
                          <View style={[styles.badgeCategory, styles.badgeEditable]}>
                            <Text style={styles.badgeEditableText}>
                              🔓 Sin ventas (Editable)
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={[styles.cardDate, { color: theme.textSecondary }]}>
                        {formatShortDate(item.date)} • {item.time ?? '20:00'} hrs
                      </Text>
                      <Text style={[styles.cardVenue, { color: theme.textSecondary }]} numberOfLines={1}>
                        {item.venue ?? (item as any).location ?? 'Lugar por confirmar'}
                        {item.city ? `, ${item.city}` : ''}
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

                  {/* Botones de Acción: Ver Detalle (Solo lectura), Editar, Eliminar */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.detailBtn]}
                      onPress={() => {
                        setSelectedEvent(item);
                        setDetailVisible(true);
                      }}>
                      <Ionicons name="eye-outline" size={15} color="#A855F7" />
                      <Text style={[styles.actionBtnText, { color: '#A855F7' }]}>Ver Detalle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, isLocked ? styles.lockedBtn : styles.editBtn]}
                      onPress={() => handleEditPress(item, isLocked, soldCount)}>
                      <Ionicons
                        name={isLocked ? 'lock-closed-outline' : 'create-outline'}
                        size={15}
                        color={isLocked ? '#94A3B8' : '#3B82F6'}
                      />
                      <Text style={[styles.actionBtnText, { color: isLocked ? '#94A3B8' : '#3B82F6' }]}>
                        {isLocked ? 'Bloqueado' : 'Editar'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, isLocked ? styles.disabledDeleteBtn : styles.deleteBtn]}
                      onPress={() => handleDelete(item)}>
                      <Ionicons name="trash-outline" size={15} color={isLocked ? '#64748B' : '#EF4444'} />
                      <Text style={[styles.actionBtnText, { color: isLocked ? '#64748B' : '#EF4444' }]}>
                        Eliminar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Modal de Detalle de Evento (Solo Lectura) */}
        <Modal
          visible={detailVisible && selectedEvent !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setDetailVisible(false)}>
          {selectedEvent && (() => {
            const tkts = Array.isArray(selectedEvent.tickets)
              ? selectedEvent.tickets
              : ((selectedEvent as any).ticketTypes ?? []);

            let totalCap = 0;
            let totalAvail = 0;
            let totalRevenue = 0;

            const tierBreakdown = tkts.map((t: any) => {
              const cap = t.total ?? t.totalCapacity ?? t.available ?? 0;
              const avail = t.available ?? t.availableCapacity ?? 0;
              const sold = Math.max(0, cap - avail);
              const price = t.price ?? 0;
              const revenue = sold * price;

              totalCap += cap;
              totalAvail += avail;
              totalRevenue += revenue;

              return {
                id: t.id,
                name: t.name || 'Entrada',
                price,
                total: cap,
                available: avail,
                sold,
                revenue,
              };
            });

            const totalSold = Math.max(0, totalCap - totalAvail);
            const occupancy = totalCap > 0 ? Math.round((totalSold / totalCap) * 100) : 0;
            const isLocked = Boolean(selectedEvent.hasSoldTickets) || (selectedEvent.soldTicketsCount ?? 0) > 0 || totalSold > 0;

            return (
              <View style={styles.modalOverlay}>
                <View style={[styles.modalCard, { backgroundColor: theme.backgroundElement }]}>
                  {/* Cabecera del modal */}
                  <View style={styles.modalHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>Resumen del Evento</Text>
                      <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                        Vista de solo lectura y métricas de taquilla
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.closeIconBtn, { backgroundColor: theme.background }]}
                      onPress={() => setDetailVisible(false)}>
                      <Ionicons name="close" size={20} color={theme.text} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                    {/* Imagen o Banner */}
                    {selectedEvent.imageUrl ? (
                      <Image source={{ uri: selectedEvent.imageUrl }} style={styles.modalBanner} />
                    ) : null}

                    {/* Información General */}
                    <View style={styles.modalSection}>
                      <View style={styles.badgesRow}>
                        <View style={styles.badgeCategory}>
                          <Text style={styles.badgeCategoryText}>
                            {selectedEvent.category ?? (selectedEvent as any).categoryName ?? 'General'}
                          </Text>
                        </View>
                        {isLocked ? (
                          <View style={[styles.badgeCategory, styles.badgeLocked]}>
                            <Text style={styles.badgeLockedText}>
                              🔒 {totalSold} Entrada(s) vendida(s) • No editable
                            </Text>
                          </View>
                        ) : (
                          <View style={[styles.badgeCategory, styles.badgeEditable]}>
                            <Text style={styles.badgeEditableText}>
                              🔓 Sin ventas • Evento editable
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={[styles.detailEventTitle, { color: theme.text }]}>
                        {selectedEvent.title}
                      </Text>

                      <View style={styles.metaGrid}>
                        <View style={styles.metaRow}>
                          <Ionicons name="calendar-outline" size={16} color={Eventia.primary} />
                          <Text style={[styles.metaText, { color: theme.text }]}>
                            {formatShortDate(selectedEvent.date)}
                          </Text>
                        </View>
                        <View style={styles.metaRow}>
                          <Ionicons name="time-outline" size={16} color={Eventia.primary} />
                          <Text style={[styles.metaText, { color: theme.text }]}>
                            {selectedEvent.time ?? '20:00'} hrs
                          </Text>
                        </View>
                        <View style={styles.metaRow}>
                          <Ionicons name="location-outline" size={16} color={Eventia.primary} />
                          <Text style={[styles.metaText, { color: theme.text }]}>
                            {selectedEvent.venue ?? (selectedEvent as any).location ?? 'Lugar por confirmar'}
                          </Text>
                        </View>
                        <View style={styles.metaRow}>
                          <Ionicons name="person-circle-outline" size={16} color={Eventia.primary} />
                          <Text style={[styles.metaText, { color: theme.text }]}>
                            {selectedEvent.organizer || 'Eventia Live'}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>DESCRIPCIÓN</Text>
                      <Text style={[styles.detailDescription, { color: theme.text }]}>
                        {selectedEvent.description || 'Sin descripción registrada.'}
                      </Text>
                    </View>

                    {/* Tarjeta de Métricas Globales del Evento */}
                    <View style={[styles.metricsBox, { backgroundColor: theme.background }]}>
                      <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginBottom: 8 }]}>
                        MÉTRICAS DE TAQUILLA
                      </Text>

                      <View style={styles.metricsRow}>
                        <View style={styles.metricItem}>
                          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Vendidas</Text>
                          <Text style={[styles.metricValue, { color: Eventia.primary }]}>
                            {totalSold} <Text style={{ fontSize: 11, color: theme.textSecondary }}>/ {totalCap}</Text>
                          </Text>
                        </View>

                        <View style={styles.metricItem}>
                          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Ocupación</Text>
                          <Text style={[styles.metricValue, { color: '#10B981' }]}>
                            {occupancy}%
                          </Text>
                        </View>

                        <View style={styles.metricItem}>
                          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Recaudación</Text>
                          <Text style={[styles.metricValue, { color: '#F59E0B' }]}>
                            {formatPricePEN(totalRevenue)}
                          </Text>
                        </View>
                      </View>

                      {/* Barra de progreso de ocupación */}
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${Math.min(100, occupancy)}%` }]} />
                      </View>
                    </View>

                    {/* Desglose de Tipos de Entrada */}
                    <View style={styles.modalSection}>
                      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                        DESGLOSE POR TIPO DE ENTRADA
                      </Text>

                      <View style={{ gap: 8, marginTop: 6 }}>
                        {tierBreakdown.map((t: any) => (
                          <View key={t.name} style={[styles.tierDetailCard, { backgroundColor: theme.background }]}>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.tierDetailName, { color: theme.text }]}>{t.name}</Text>
                              <Text style={[styles.tierDetailPrice, { color: Eventia.primary }]}>
                                {formatPricePEN(t.price)}
                              </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={[styles.tierDetailStats, { color: theme.text }]}>
                                {t.sold} vendidas • {t.available} libres
                              </Text>
                              <Text style={[styles.tierDetailSubtotal, { color: '#F59E0B' }]}>
                                Total: {formatPricePEN(t.revenue)}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Regla de negocio explicada */}
                    <View
                      style={[
                        styles.ruleNoticeBox,
                        {
                          backgroundColor: isLocked ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          borderColor: isLocked ? '#F59E0B' : '#10B981',
                        },
                      ]}>
                      <Ionicons
                        name={isLocked ? 'information-circle' : 'checkmark-circle'}
                        size={20}
                        color={isLocked ? '#F59E0B' : '#10B981'}
                      />
                      <Text style={[styles.ruleNoticeText, { color: theme.text }]}>
                        {isLocked
                          ? 'Este evento se encuentra bloqueado para edición y eliminación porque ya registra compras realizadas. Esta regla garantiza la validez de los tickets emitidos.'
                          : 'Este evento aún no tiene compras. Puedes editar sus precios, fechas y capacidad en cualquier momento desde el formulario de edición.'}
                      </Text>
                    </View>
                  </ScrollView>

                  {/* Botones del footer del modal */}
                  <View style={styles.modalFooter}>
                    {!isLocked && (
                      <TouchableOpacity
                        style={[styles.modalActionBtn, { backgroundColor: Eventia.primary }]}
                        onPress={() => {
                          setDetailVisible(false);
                          router.push(`/admin/event-form?id=${selectedEvent.id}` as never);
                        }}>
                        <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.modalActionBtnText}>Ir a Editar Evento</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.modalCloseBtn, { backgroundColor: theme.background }]}
                      onPress={() => setDetailVisible(false)}>
                      <Text style={[styles.modalCloseBtnText, { color: theme.text }]}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })()}
        </Modal>
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
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: 10,
  },
  detailBtn: { backgroundColor: 'rgba(168, 85, 247, 0.12)' },
  editBtn: { backgroundColor: 'rgba(59, 130, 246, 0.12)' },
  lockedBtn: { backgroundColor: 'rgba(148, 163, 184, 0.1)', opacity: 0.8 },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.12)' },
  disabledDeleteBtn: { backgroundColor: 'rgba(100, 116, 139, 0.08)', opacity: 0.5 },
  actionBtnText: { fontSize: 11, fontWeight: '700' },
  badgesRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  badgeLocked: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  badgeLockedText: { fontSize: 10, fontWeight: '700', color: '#F59E0B' },
  badgeEditable: { backgroundColor: 'rgba(16, 185, 129, 0.12)' },
  badgeEditableText: { fontSize: 10, fontWeight: '700', color: '#10B981' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptySubtitle: { fontSize: 12, textAlign: 'center' },
  // Estilos del Modal de Detalle
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  modalSubtitle: { fontSize: 12, marginTop: 2 },
  closeIconBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  modalScroll: { paddingHorizontal: 20, paddingVertical: 14 },
  modalBanner: { width: '100%', height: 160, borderRadius: 14, marginBottom: 14 },
  modalSection: { marginBottom: 16 },
  detailEventTitle: { fontSize: 19, fontWeight: '800', lineHeight: 24, marginTop: 4, marginBottom: 12 },
  metaGrid: { gap: 8, marginBottom: 14 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13, fontWeight: '600' },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  detailDescription: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  metricsBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 16,
  },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metricItem: { flex: 1, alignItems: 'center' },
  metricLabel: { fontSize: 11, fontWeight: '600' },
  metricValue: { fontSize: 17, fontWeight: '800', marginTop: 3 },
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Eventia.primary, borderRadius: 3 },
  tierDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tierDetailName: { fontSize: 13, fontWeight: '700' },
  tierDetailPrice: { fontSize: 13, fontWeight: '800', marginTop: 2 },
  tierDetailStats: { fontSize: 11, fontWeight: '600' },
  tierDetailSubtotal: { fontSize: 12, fontWeight: '800', marginTop: 2 },
  ruleNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  ruleNoticeText: { flex: 1, fontSize: 12, lineHeight: 17 },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalActionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  modalCloseBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalCloseBtnText: { fontWeight: '700', fontSize: 13 },
});


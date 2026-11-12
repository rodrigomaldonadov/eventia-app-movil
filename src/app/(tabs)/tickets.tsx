import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth, Spacing, Eventia } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

import { HeroTicketPass } from '@/features/orders/components/HeroTicketPass';
import { WalletPassBanner } from '@/features/orders/components/WalletPassBanner';
import { OrdersHistoryList } from '@/features/orders/components/OrdersHistoryList';
import { TicketQrModal } from '@/features/orders/components/TicketQrModal';
import { orderService } from '@/features/orders/services/orderService';
import type { BackendTicket, Order, OrderStatus, OrderTabType } from '@/features/orders/types/order.types';

export default function TicketsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<OrderTabType>('upcoming');
  const [orders, setOrders] = useState<Order[]>([]);
  const [myTickets, setMyTickets] = useState<BackendTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtros de historial de compras
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAGADA' | 'PENDIENTE' | 'CANCELADA'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'MONTH' | 'YEAR'>('ALL');

  // Modal para ver QR y nominar cualquier orden o entrada
  const [selectedOrderForQr, setSelectedOrderForQr] = useState<Order | null>(null);

  // Guard: sin sesión, redirige al login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      // 1. Cargar órdenes reales desde GET /api/orders (sin pedidos semilla)
      const ordersData = await orderService.getOrders();
      setOrders(ordersData);

      // 2. Cargar entradas individuales desde GET /api/tickets/my
      const ticketsData = await orderService.getMyTickets();
      setMyTickets(ticketsData);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  if (!isAuthenticated || authLoading) {
    return null;
  }

  // Filtrado de órdenes
  const upcomingOrders = orders.filter((o) => o.isUpcoming);
  const pastOrders = orders.filter((o) => !o.isUpcoming);

  // Si no hay órdenes marcadas como pasadas por fecha pero hay órdenes en el sistema,
  // mostrar todas las órdenes en la pestaña de historial para permitir filtrado completo.
  const historyOrdersSource = pastOrders.length > 0 ? pastOrders : orders;

  const filteredHistoryOrders = historyOrdersSource.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) {
      return false;
    }
    if (dateFilter === 'MONTH') {
      try {
        const d = new Date(o.createdAt);
        const now = new Date();
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } catch {
        // Ignorar
      }
    } else if (dateFilter === 'YEAR') {
      try {
        const d = new Date(o.createdAt);
        const now = new Date();
        if (d.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } catch {
        // Ignorar
      }
    }
    return true;
  });

  const activeHeroOrder = upcomingOrders[0] || orders[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Eventia.primary]} />
        }>
        <View style={styles.mainWrapper}>
          {/* Segmented Control Tabs */}
          <View
            style={[
              styles.segmentedContainer,
              { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
            ]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('upcoming')}
              style={[
                styles.segmentTab,
                activeTab === 'upcoming' && styles.segmentTabActive,
              ]}>
              <Ionicons
                name="ticket"
                size={16}
                color={activeTab === 'upcoming' ? '#FFFFFF' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.segmentLabel,
                  { color: activeTab === 'upcoming' ? '#FFFFFF' : theme.textSecondary },
                  activeTab === 'upcoming' && styles.segmentLabelActive,
                ]}>
                Mis Entradas
              </Text>
              {(upcomingOrders.length > 0 || myTickets.length > 0) && (
                <View
                  style={[
                    styles.countPill,
                    activeTab === 'upcoming' && styles.countPillActive,
                  ]}>
                  <Text
                    style={[
                      styles.countPillText,
                      activeTab === 'upcoming' && styles.countPillTextActive,
                    ]}>
                    {myTickets.length || upcomingOrders.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('past')}
              style={[
                styles.segmentTab,
                activeTab === 'past' && styles.segmentTabActive,
              ]}>
              <Ionicons
                name="time-outline"
                size={16}
                color={activeTab === 'past' ? '#FFFFFF' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.segmentLabel,
                  { color: activeTab === 'past' ? '#FFFFFF' : theme.textSecondary },
                  activeTab === 'past' && styles.segmentLabelActive,
                ]}>
                Historial de Compras
              </Text>
              {orders.length > 0 && (
                <View
                  style={[
                    styles.countPill,
                    activeTab === 'past' && styles.countPillActive,
                  ]}>
                  <Text
                    style={[
                      styles.countPillText,
                      activeTab === 'past' && styles.countPillTextActive,
                    ]}>
                    {orders.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* CONTENIDO SEGÚN PESTAÑA */}
          {activeTab === 'upcoming' ? (
            <View style={styles.tabContentCol}>
              {activeHeroOrder ? (
                <>
                  {/* Hero Ticket Pass Card con QR react-native-qrcode-svg */}
                  <HeroTicketPass order={activeHeroOrder} />

                  {/* Wallet Pass Banner */}
                  <WalletPassBanner />

                  {/* Sección: Otras órdenes recientes */}
                  {upcomingOrders.length > 1 && (
                    <View style={styles.sectionHeaderRow}>
                      <Text style={[styles.sectionTitle, { color: theme.text }]}>Otras entradas activas</Text>
                    </View>
                  )}
                  {upcomingOrders.length > 1 && (
                    <OrdersHistoryList
                      orders={upcomingOrders.slice(1)}
                      onSelectOrder={(ord) => setSelectedOrderForQr(ord)}
                    />
                  )}
                </>
              ) : (
                <View style={[styles.emptyState, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: theme.backgroundSelected }]}>
                    <Ionicons name="ticket-outline" size={42} color={theme.textSecondary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>No tienes entradas activas</Text>
                  <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Explora el catálogo de conciertos y festivales para reservar tus boletos inteligentes.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/')}
                    style={styles.exploreBtn}>
                    <Text style={styles.exploreBtnText}>Explorar Eventos</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* PESTAÑA: HISTORIAL DE COMPRAS CON FILTROS */
            <View style={styles.tabContentCol}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Historial de Compras</Text>
                <Text style={[styles.sectionCountText, { color: theme.textSecondary }]}>
                  {filteredHistoryOrders.length} {filteredHistoryOrders.length === 1 ? 'orden' : 'órdenes'}
                </Text>
              </View>

              {/* Filtros por Estado */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: theme.textSecondary }]}>Estado:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
                  <TouchableOpacity
                    onPress={() => setStatusFilter('ALL')}
                    style={[styles.filterPill, statusFilter === 'ALL' && styles.filterPillActive]}>
                    <Text style={[styles.filterPillText, statusFilter === 'ALL' && styles.filterPillTextActive]}>
                      Todas
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStatusFilter('PAGADA')}
                    style={[styles.filterPill, statusFilter === 'PAGADA' && styles.filterPillActive]}>
                    <Text style={[styles.filterPillText, statusFilter === 'PAGADA' && styles.filterPillTextActive]}>
                      Pagadas
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStatusFilter('PENDIENTE')}
                    style={[styles.filterPill, statusFilter === 'PENDIENTE' && styles.filterPillActive]}>
                    <Text style={[styles.filterPillText, statusFilter === 'PENDIENTE' && styles.filterPillTextActive]}>
                      Pendientes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStatusFilter('CANCELADA')}
                    style={[styles.filterPill, statusFilter === 'CANCELADA' && styles.filterPillActive]}>
                    <Text style={[styles.filterPillText, statusFilter === 'CANCELADA' && styles.filterPillTextActive]}>
                      Canceladas
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Filtros por Fecha */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: theme.textSecondary }]}>Fecha:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
                  <TouchableOpacity
                    onPress={() => setDateFilter('ALL')}
                    style={[styles.filterPill, dateFilter === 'ALL' && styles.filterPillActive]}>
                    <Text style={[styles.filterPillText, dateFilter === 'ALL' && styles.filterPillTextActive]}>
                      Todo el tiempo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDateFilter('MONTH')}
                    style={[styles.filterPill, dateFilter === 'MONTH' && styles.filterPillActive]}>
                    <Text style={[styles.filterPillText, dateFilter === 'MONTH' && styles.filterPillTextActive]}>
                      Este mes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDateFilter('YEAR')}
                    style={[styles.filterPill, dateFilter === 'YEAR' && styles.filterPillActive]}>
                    <Text style={[styles.filterPillText, dateFilter === 'YEAR' && styles.filterPillTextActive]}>
                      Este año
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Listado filtrado */}
              <OrdersHistoryList
                orders={filteredHistoryOrders}
                onSelectOrder={(ord) => setSelectedOrderForQr(ord)}
              />
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Modal QR y Nominación interactiva para órdenes del historial */}
      {selectedOrderForQr && (
        <TicketQrModal
          visible={Boolean(selectedOrderForQr)}
          orderNumber={selectedOrderForQr.orderNumber}
          eventTitle={selectedOrderForQr.eventTitle}
          buyerName={selectedOrderForQr.buyerName}
          qrCode={selectedOrderForQr.qrCode}
          ticketId={selectedOrderForQr.tickets?.[0]?.id}
          dni={selectedOrderForQr.buyerDocument || selectedOrderForQr.tickets?.[0]?.dni}
          onNominated={(newNombre, newDni) => {
            // Actualizar estado local
            setOrders((prev) =>
              prev.map((o) =>
                o.id === selectedOrderForQr.id
                  ? { ...o, buyerName: newNombre, buyerDocument: newDni }
                  : o
              )
            );
            setSelectedOrderForQr((prev) =>
              prev ? { ...prev, buyerName: newNombre, buyerDocument: newDni } : null
            );
          }}
          onClose={() => setSelectedOrderForQr(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 14,
  },
  segmentedContainer: {
    width: '100%',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentTabActive: {
    backgroundColor: Eventia.primary,
    shadowColor: Eventia.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  segmentLabelActive: {
    color: '#FFFFFF',
  },
  countPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  countPillTextActive: {
    color: '#FFFFFF',
  },
  tabContentCol: {
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterGroupTitle: {
    fontSize: 12,
    fontWeight: '600',
    width: 50,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterPillActive: {
    backgroundColor: Eventia.primary,
    borderColor: Eventia.primary,
  },
  filterPillText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  exploreBtn: {
    backgroundColor: Eventia.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  bottomSpacer: {
    height: 40,
  },
});

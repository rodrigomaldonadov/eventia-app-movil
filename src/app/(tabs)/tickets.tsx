import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { MaxContentWidth, Spacing, Eventia } from '@/constants/theme';
import { PurchasedOrderCard } from '@/features/orders/components/PurchasedOrderCard';
import { orderService } from '@/features/orders/services/orderService';
import type { Order, OrderTabType } from '@/features/orders/types/order.types';

export default function TicketsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<OrderTabType>('upcoming');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await orderService.getOrders(user?.email);
      setOrders(data);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.email]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  // 1. Ordenar por fechas más próximas (ascendente: los eventos más cercanos en el tiempo primero)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.eventDate).getTime() || 0;
      const dateB = new Date(b.eventDate).getTime() || 0;
      return dateA - dateB;
    });
  }, [orders]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const upcomingOrders = useMemo(() => {
    return sortedOrders.filter((o) => {
      const d = new Date(o.eventDate);
      return isNaN(d.getTime()) || d >= today;
    });
  }, [sortedOrders, today]);

  const pastOrders = useMemo(() => {
    return sortedOrders.filter((o) => {
      const d = new Date(o.eventDate);
      return !isNaN(d.getTime()) && d < today;
    });
  }, [sortedOrders, today]);

  // Expandir automáticamente el primer evento si aún no hay ninguno seleccionado
  useEffect(() => {
    if (activeTab === 'upcoming' && upcomingOrders.length > 0 && !expandedOrderId) {
      setExpandedOrderId(upcomingOrders[0].id);
    } else if (activeTab === 'past' && pastOrders.length > 0 && !expandedOrderId) {
      setExpandedOrderId(pastOrders[0].id);
    }
  }, [activeTab, upcomingOrders, pastOrders]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const currentList = activeTab === 'upcoming' ? upcomingOrders : pastOrders;

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
          {/* Header de sección */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.screenTitle}>Mis Entradas y Eventos</Text>
              <Text style={styles.screenSubtitle}>
                {sortedOrders.length} {sortedOrders.length === 1 ? 'evento comprado' : 'eventos comprados'} • Ordenados por fecha más próxima
              </Text>
            </View>
          </View>

          {/* Segmented Control Tabs */}
          <View style={[styles.segmentedContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setActiveTab('upcoming');
                if (upcomingOrders.length > 0) setExpandedOrderId(upcomingOrders[0].id);
              }}
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
                Próximos eventos
              </Text>
              {upcomingOrders.length > 0 && (
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
                    {upcomingOrders.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setActiveTab('past');
                if (pastOrders.length > 0) setExpandedOrderId(pastOrders[0].id);
              }}
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
                Pasados
              </Text>
              {pastOrders.length > 0 && (
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
                    {pastOrders.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* LISTADO DE EVENTOS COMPRADOS: Expandibles al seleccionarlos */}
          {currentList.length > 0 ? (
            <View style={styles.ordersListContainer}>
              {currentList.map((order) => (
                <PurchasedOrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrderId === order.id}
                  onToggle={() => toggleExpand(order.id)}
                />
              ))}
            </View>
          ) : (
            /* Estado Vacío */
            <View style={[styles.emptyState, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: theme.backgroundSelected }]}>
                <Ionicons name="ticket-outline" size={42} color={theme.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {activeTab === 'upcoming' ? 'No tienes entradas activas' : 'Sin compras pasadas'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {activeTab === 'upcoming'
                  ? 'Explora el catálogo de conciertos, festivales y eventos para comprar tus boletos inteligentes.'
                  : 'Aquí figurarán los eventos concluidos a los que hayas asistido.'}
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/')}
                style={styles.exploreBtn}>
                <Ionicons name="sparkles-outline" size={16} color="#FFFFFF" />
                <Text style={styles.exploreBtnText}>Explorar Catálogo</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
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
  headerRow: {
    paddingHorizontal: 2,
    paddingTop: 4,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  segmentedContainer: {
    width: '100%',
    backgroundColor: '#1E2024',
    padding: 4,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#2E3135',
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
    color: '#64748B',
  },
  segmentLabelActive: {
    color: '#FFFFFF',
  },
  countPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#CBD5E1',
  },
  countPillTextActive: {
    color: '#FFFFFF',
  },
  ordersListContainer: {
    gap: 12,
  },
  emptyState: {
    backgroundColor: '#1E2024',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2E3135',
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#262930',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 6,
    backgroundColor: Eventia.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
});

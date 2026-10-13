import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { EventiaHeader } from '@/components/eventia-header';
import { MaxContentWidth, Spacing, Eventia } from '@/constants/theme';

import { HeroTicketPass } from '@/features/orders/components/HeroTicketPass';
import { WalletPassBanner } from '@/features/orders/components/WalletPassBanner';
import { OrdersHistoryList } from '@/features/orders/components/OrdersHistoryList';
import { orderService } from '@/features/orders/services/orderService';
import type { Order, OrderTabType } from '@/features/orders/types/order.types';

export default function TicketsScreen() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<OrderTabType>('upcoming');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  const upcomingOrders = orders.filter((o) => o.isUpcoming);
  const pastOrders = orders.filter((o) => !o.isUpcoming);
  const activeHeroOrder = upcomingOrders[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <EventiaHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Eventia.primary]} />
        }>
        <View style={styles.mainWrapper}>
          {/* Segmented Control Tabs (Stitch Vista 8) */}
          <View style={styles.segmentedContainer}>
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
                color={activeTab === 'upcoming' ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.segmentLabel,
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
              onPress={() => setActiveTab('past')}
              style={[
                styles.segmentTab,
                activeTab === 'past' && styles.segmentTabActive,
              ]}>
              <Ionicons
                name="time-outline"
                size={16}
                color={activeTab === 'past' ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.segmentLabel,
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

          {/* CONTENIDO SEGÚN PESTAÑA */}
          {activeTab === 'upcoming' ? (
            <View style={styles.tabContentCol}>
              {activeHeroOrder ? (
                <>
                  {/* Hero Ticket Pass Card */}
                  <HeroTicketPass order={activeHeroOrder} />

                  {/* Wallet Pass Banner */}
                  <WalletPassBanner />

                  {/* Sección: Otras órdenes recientes */}
                  {upcomingOrders.length > 1 && (
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionTitle}>Otras entradas activas</Text>
                    </View>
                  )}
                  {upcomingOrders.length > 1 && (
                    <OrdersHistoryList orders={upcomingOrders.slice(1)} />
                  )}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="ticket-outline" size={42} color="#94A3B8" />
                  </View>
                  <Text style={styles.emptyTitle}>No tienes entradas activas</Text>
                  <Text style={styles.emptySubtitle}>
                    Explora el catálogo de conciertos y festivales para reservar tus boletos inteligentes.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            /* PESTAÑA PASADOS: HISTORIAL DE COMPRAS */
            <View style={styles.tabContentCol}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Historial de Compras</Text>
                <Text style={styles.sectionCountText}>
                  {pastOrders.length} {pastOrders.length === 1 ? 'orden' : 'órdenes'}
                </Text>
              </View>

              <OrdersHistoryList orders={pastOrders} />
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: '#E2E8F0',
    padding: 4,
    borderRadius: 14,
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
    color: '#64748B',
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
    color: '#0B1C30',
  },
  sectionCountText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B1C30',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});

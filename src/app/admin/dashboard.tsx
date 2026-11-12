import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { MaxContentWidth, Spacing, Eventia } from '@/constants/theme';
import { eventService } from '@/services/eventService';
import type { DashboardMetrics } from '@/services/eventStorage';
import { formatPricePEN } from '@/data/events';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const eventia = useEventiaTheme();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await eventService.getDashboardMetrics();
      setMetrics(data);
    } catch (e) {
      console.error('[Dashboard Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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
        <Ionicons name="shield-outline" size={64} color="#EF4444" />
        <Text style={[styles.deniedTitle, { color: theme.text }]}>Acceso Restringido</Text>
        <Text style={[styles.deniedSubtitle, { color: theme.textSecondary }]}>
          Se requieren credenciales de Administrador para ver este panel.
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
          title: 'Panel Administrativo',
          headerShown: true,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Eventia.primary]} />
        }>
        {/* Header con bienvenida y acciones rápidas */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Control General • Métricas Globales
            </Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Dashboard de Ventas</Text>
          </View>
        </View>

        {/* Accesos rápidos de navegación Admin */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            style={[styles.quickNavCard, { backgroundColor: theme.backgroundElement }]}
            onPress={() => router.push('/admin/events' as never)}>
            <Ionicons name="calendar" size={20} color={Eventia.primary} />
            <Text style={[styles.quickNavText, { color: theme.text }]}>Gestión Eventos</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickNavCard, { backgroundColor: theme.backgroundElement }]}
            onPress={() => router.push('/admin/users' as never)}>
            <Ionicons name="people" size={20} color="#10B981" />
            <Text style={[styles.quickNavText, { color: theme.text }]}>Gestión Usuarios</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {loading || !metrics ? (
          <ActivityIndicator size="small" color={Eventia.primary} style={{ marginTop: 24 }} />
        ) : (
          (() => {
            const sales = metrics.salesByCategory ?? { general: 0, vip: 0, vipPlus: 0 };
            const rev = metrics.revenueByCategory ?? { general: 0, vip: 0, vipPlus: 0 };
            const popularEvents = metrics.popularEvents ?? [];
            const stockMetrics = metrics.stockMetrics ?? [];
            const totalRevenue = metrics.totalRevenue ?? 0;
            const totalTicketsSold = metrics.totalTicketsSold ?? 0;

            return (
              <>
                {/* Tarjeta de Ingresos Principales (KPI) */}
                <View style={[styles.kpiHeroCard, { backgroundColor: Eventia.primaryContainer }]}>
                  <View style={styles.kpiHeroTop}>
                    <View>
                      <Text style={styles.kpiHeroLabel}>INGRESOS TOTALES RECAUDADOS</Text>
                      <Text style={styles.kpiHeroValue}>{formatPricePEN(totalRevenue)}</Text>
                    </View>
                    <View style={styles.kpiIconWrap}>
                      <Ionicons name="cash" size={28} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={styles.kpiHeroDivider} />
                  <View style={styles.kpiHeroBottom}>
                    <View style={styles.kpiStatCol}>
                      <Text style={styles.kpiStatNumber}>{totalTicketsSold}</Text>
                      <Text style={styles.kpiStatLabel}>Tickets Vendidos</Text>
                    </View>
                    <View style={styles.kpiStatCol}>
                      <Text style={styles.kpiStatNumber}>{stockMetrics.length}</Text>
                      <Text style={styles.kpiStatLabel}>Eventos Activos</Text>
                    </View>
                  </View>
                </View>

                {/* Desglose de Ventas por Categoría (General, VIP, VIP+) */}
                <View style={[styles.sectionCard, { backgroundColor: theme.backgroundElement }]}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="pie-chart-outline" size={18} color={Eventia.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Ventas por Categoría de Entrada
                    </Text>
                  </View>

                  <View style={styles.categoryGrid}>
                    {/* Categoría General */}
                    <View style={[styles.categoryTile, { backgroundColor: theme.background }]}>
                      <View style={styles.categoryBadgeRow}>
                        <View style={[styles.badgeDot, { backgroundColor: '#3B82F6' }]} />
                        <Text style={[styles.categoryName, { color: theme.text }]}>General</Text>
                      </View>
                      <Text style={[styles.categoryUnits, { color: theme.text }]}>
                        {sales.general ?? 0} <Text style={styles.unitText}>tickets</Text>
                      </Text>
                      <Text style={[styles.categoryRevenue, { color: theme.textSecondary }]}>
                        {formatPricePEN(rev.general ?? 0)}
                      </Text>
                    </View>

                    {/* Categoría VIP */}
                    <View style={[styles.categoryTile, { backgroundColor: theme.background }]}>
                      <View style={styles.categoryBadgeRow}>
                        <View style={[styles.badgeDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={[styles.categoryName, { color: theme.text }]}>VIP</Text>
                      </View>
                      <Text style={[styles.categoryUnits, { color: theme.text }]}>
                        {sales.vip ?? 0} <Text style={styles.unitText}>tickets</Text>
                      </Text>
                      <Text style={[styles.categoryRevenue, { color: theme.textSecondary }]}>
                        {formatPricePEN(rev.vip ?? 0)}
                      </Text>
                    </View>

                    {/* Categoría VIP+ */}
                    <View style={[styles.categoryTile, { backgroundColor: theme.background }]}>
                      <View style={styles.categoryBadgeRow}>
                        <View style={[styles.badgeDot, { backgroundColor: '#8B5CF6' }]} />
                        <Text style={[styles.categoryName, { color: theme.text }]}>VIP+</Text>
                      </View>
                      <Text style={[styles.categoryUnits, { color: theme.text }]}>
                        {sales.vipPlus ?? 0} <Text style={styles.unitText}>tickets</Text>
                      </Text>
                      <Text style={[styles.categoryRevenue, { color: theme.textSecondary }]}>
                        {formatPricePEN(rev.vipPlus ?? 0)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Eventos Más Populares / Mayor Recaudación */}
                <View style={[styles.sectionCard, { backgroundColor: theme.backgroundElement }]}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="trophy-outline" size={18} color="#F59E0B" />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Eventos Más Populares
                    </Text>
                  </View>

                  {popularEvents.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                      Aún no hay compras registradas en los eventos.
                    </Text>
                  ) : (
                    popularEvents.map((evt, idx) => (
                      <View key={evt.id} style={[styles.popularRow, idx > 0 && styles.rowDivider]}>
                        <View style={styles.rankBadge}>
                          <Text style={styles.rankText}>#{idx + 1}</Text>
                        </View>
                        {evt.imageUrl ? (
                          <Image source={{ uri: evt.imageUrl }} style={styles.popularThumb} />
                        ) : null}
                        <View style={styles.popularInfo}>
                          <Text style={[styles.popularTitle, { color: theme.text }]} numberOfLines={1}>
                            {evt.title}
                          </Text>
                          <Text style={[styles.popularSold, { color: theme.textSecondary }]}>
                            {evt.ticketsSold} entradas vendidas
                          </Text>
                        </View>
                        <Text style={[styles.popularMoney, { color: '#10B981' }]}>
                          {formatPricePEN(evt.revenue)}
                        </Text>
                      </View>
                    ))
                  )}
                </View>

                {/* Monitoreo de Stock Restante por Evento */}
                <View style={[styles.sectionCard, { backgroundColor: theme.backgroundElement }]}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="cube-outline" size={18} color={Eventia.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Estado de Stock Restante
                    </Text>
                  </View>

                  {stockMetrics.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                      No hay eventos creados para monitorear stock.
                    </Text>
                  ) : (
                    stockMetrics.map((sm, index) => {
                      const isLow = sm.currentAvailableStock <= 10;
                      return (
                        <View key={sm.id} style={[styles.stockCard, index > 0 && styles.rowDivider]}>
                          <View style={styles.stockHeader}>
                            <Text style={[styles.stockTitle, { color: theme.text }]} numberOfLines={1}>
                              {sm.title}
                            </Text>
                            <View
                              style={[
                                styles.stockBadge,
                                {
                                  backgroundColor:
                                    sm.currentAvailableStock === 0
                                      ? '#EF4444'
                                      : isLow
                                        ? '#F59E0B'
                                        : '#10B981',
                                },
                              ]}>
                              <Text style={styles.stockBadgeText}>
                                {sm.currentAvailableStock === 0
                                  ? 'Agotado'
                                  : `${sm.currentAvailableStock} disp.`}
                              </Text>
                            </View>
                          </View>

                          {/* Barra de Progreso de Ventas */}
                          <View style={[styles.progressBarTrack, { backgroundColor: theme.background }]}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${Math.min(100, Math.max(0, sm.percentSold))}%`,
                                  backgroundColor: sm.percentSold > 80 ? '#EF4444' : Eventia.primary,
                                },
                              ]}
                            />
                          </View>

                          <View style={styles.stockFooter}>
                            <Text style={[styles.stockFootText, { color: theme.textSecondary }]}>
                              Vendidas: {sm.ticketsSold} / {sm.totalInitialStock}
                            </Text>
                            <Text style={[styles.stockFootText, { color: theme.textSecondary }]}>
                              {sm.percentSold}% Ocupación
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </>
            );
          })()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: Spacing.three,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deniedTitle: { fontSize: 20, fontWeight: '800', marginTop: 12 },
  deniedSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  headerRow: { marginTop: 4, marginBottom: 4 },
  headerSubtitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginTop: 2 },
  quickNavRow: { flexDirection: 'row', gap: 10 },
  quickNavCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  quickNavText: { flex: 1, fontSize: 12, fontWeight: '700' },
  kpiHeroCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: Eventia.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  kpiHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiHeroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  kpiHeroValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  kpiIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiHeroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 14,
  },
  kpiHeroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  kpiStatCol: { alignItems: 'center' },
  kpiStatNumber: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  kpiStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  sectionCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  categoryGrid: { flexDirection: 'row', gap: 10 },
  categoryTile: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  categoryBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: { fontSize: 12, fontWeight: '800' },
  categoryUnits: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  unitText: { fontSize: 10, fontWeight: '500' },
  categoryRevenue: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
    marginTop: 4,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { fontSize: 11, fontWeight: '800', color: '#F59E0B' },
  popularThumb: { width: 38, height: 38, borderRadius: 8 },
  popularInfo: { flex: 1 },
  popularTitle: { fontSize: 13, fontWeight: '700' },
  popularSold: { fontSize: 11, marginTop: 1 },
  popularMoney: { fontSize: 13, fontWeight: '800' },
  emptyText: { fontSize: 12, paddingVertical: 8 },
  stockCard: { gap: 6 },
  stockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockTitle: { fontSize: 13, fontWeight: '700', flex: 1, marginRight: 8 },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  stockBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  progressBarTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  stockFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  stockFootText: { fontSize: 10, fontWeight: '600' },
});


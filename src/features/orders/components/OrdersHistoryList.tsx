import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';
import { formatPricePEN } from '@/data/events';
import type { Order } from '../types/order.types';

interface OrdersHistoryListProps {
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
}

export const OrdersHistoryList: React.FC<OrdersHistoryListProps> = ({
  orders,
  onSelectOrder,
}) => {
  if (orders.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No hay órdenes en esta sección</Text>
        <Text style={styles.emptySubtitle}>
          Tus compras de boletos confirmadas se listarán automáticamente aquí.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {orders.map((order) => {
        const isPaid = order.status === 'PAGADA';
        const isPending = order.status === 'PENDIENTE';

        return (
          <TouchableOpacity
            key={order.id}
            activeOpacity={0.8}
            onPress={() => onSelectOrder?.(order)}
            style={styles.orderCard}>
            {/* Top row: Order Number & Status */}
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Ionicons name="receipt-outline" size={15} color={Eventia.primary} />
                <Text style={styles.orderNumText}>Orden #{order.orderNumber}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isPaid
                    ? styles.statusPaid
                    : isPending
                    ? styles.statusPending
                    : styles.statusCanceled,
                ]}>
                <Text
                  style={[
                    styles.statusBadgeText,
                    isPaid
                      ? styles.statusTextPaid
                      : isPending
                      ? styles.statusTextPending
                      : styles.statusTextCanceled,
                  ]}>
                  {order.status}
                </Text>
              </View>
            </View>

            {/* Event Name */}
            <Text style={styles.eventTitle} numberOfLines={1}>
              {order.eventTitle}
            </Text>

            {/* Metadata (Date & Venue) */}
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={13} color="#64748B" />
              <Text style={styles.metaText}>{order.eventDate}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>
                {order.totalTickets} {order.totalTickets === 1 ? 'entrada' : 'entradas'}
              </Text>
            </View>

            {/* Footer with Total and Payment Method */}
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.footerLabel}>Método</Text>
                <Text style={styles.footerMethodText}>{order.paymentMethod}</Text>
              </View>

              <View style={styles.footerTotalRight}>
                <Text style={styles.footerLabel}>Total Pagado</Text>
                <Text style={styles.footerAmount}>{formatPricePEN(order.total)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B1C30',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPaid: {
    backgroundColor: '#E6F4EA',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusCanceled: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextPaid: {
    color: '#006E4B',
  },
  statusTextPending: {
    color: '#B45309',
  },
  statusTextCanceled: {
    color: '#991B1B',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1C30',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  metaDot: {
    fontSize: 12,
    color: '#94A3B8',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 2,
  },
  footerLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  footerTotalRight: {
    alignItems: 'flex-end',
  },
  footerAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Eventia.primary,
    fontVariant: ['tabular-nums'],
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 16,
  },
});

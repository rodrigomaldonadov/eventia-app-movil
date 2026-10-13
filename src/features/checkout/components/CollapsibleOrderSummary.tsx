import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';
import { formatPricePEN } from '@/data/events';
import type { CartItem } from '@/types/cart.types';

interface CollapsibleOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  igv: number;
  total: number;
  totalTickets: number;
}

export const CollapsibleOrderSummary: React.FC<CollapsibleOrderSummaryProps> = ({
  items,
  subtotal,
  igv,
  total,
  totalTickets,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.card}>
      {/* Header / Trigger */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen(!isOpen)}
        style={styles.triggerBtn}>
        <View style={styles.triggerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="receipt-outline" size={18} color={Eventia.primary} />
          </View>
          <View>
            <Text style={styles.triggerTitle}>Resumen de Compra</Text>
            <Text style={styles.triggerSubtitle}>
              {totalTickets} {totalTickets === 1 ? 'entrada seleccionada' : 'entradas seleccionadas'}
            </Text>
          </View>
        </View>

        <View style={styles.triggerRight}>
          <Text style={styles.triggerTotal}>{formatPricePEN(total)}</Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#64748B"
          />
        </View>
      </TouchableOpacity>

      {/* Expandable Panel */}
      {isOpen && (
        <View style={styles.panelContent}>
          <View style={styles.itemsList}>
            {items.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>
                      {item.quantity}x {item.ticketName}
                    </Text>
                    <Text style={styles.itemDetail}>
                      {formatPricePEN(item.price)} c/u • {item.eventTitle}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>{formatPricePEN(itemTotal)}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Subtotal & IGV Breakdown */}
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Subtotal de entradas</Text>
            <Text style={styles.calcValue}>{formatPricePEN(subtotal)}</Text>
          </View>

          <View style={styles.calcRow}>
            <View style={styles.infoLabelRow}>
              <Text style={styles.calcLabel}>IGV y cargos por servicio (18%)</Text>
              <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
            </View>
            <Text style={styles.calcValue}>{formatPricePEN(igv)}</Text>
          </View>

          {/* Total Box */}
          <View style={styles.totalBox}>
            <Text style={styles.totalBoxLabel}>TOTAL A FACTURAR</Text>
            <Text style={styles.totalBoxAmount}>{formatPricePEN(total)}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  triggerBtn: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1C30',
  },
  triggerSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  triggerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1C30',
    fontVariant: ['tabular-nums'],
  },
  panelContent: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemsList: {
    gap: 8,
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
  },
  itemDetail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calcLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  calcValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B1C30',
    fontVariant: ['tabular-nums'],
  },
  totalBox: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  totalBoxLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  totalBoxAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: Eventia.primary,
    fontVariant: ['tabular-nums'],
  },
});

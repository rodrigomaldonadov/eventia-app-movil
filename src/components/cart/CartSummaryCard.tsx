import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatPricePEN } from '@/data/events';

interface CartSummaryCardProps {
  totalTickets: number;
  subtotal: number;
  igv: number;
  total: number;
  onCheckout: () => void;
  onClear: () => void;
}

export function CartSummaryCard({
  totalTickets,
  subtotal,
  igv,
  total,
  onCheckout,
  onClear,
}: CartSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Resumen de la compra</Text>

      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.label}>{`Entradas (${totalTickets}):`}</Text>
          <Text style={styles.value}>{formatPricePEN(subtotal)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>IGV (18%):</Text>
          <Text style={styles.value}>{formatPricePEN(igv)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total a pagar:</Text>
          <Text style={styles.totalValue}>{formatPricePEN(total)}</Text>
        </View>
      </View>

      {/* Botón para continuar con el proceso de pago */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onCheckout}
        style={styles.checkoutBtn}>
        <Text style={styles.checkoutBtnText}>Proceder al Pago</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Botón secundario para vaciar carrito */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onClear}
        style={styles.clearBtn}>
        <Text style={styles.clearBtnText}>Vaciar carrito</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: '#64748B',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4F46E5',
  },
  checkoutBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
});

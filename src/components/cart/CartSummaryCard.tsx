import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatPricePEN } from '@/data/events';
import { useTheme } from '@/hooks/use-theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';

interface CartSummaryCardProps {
  totalTickets: number;
  subtotal: number;
  igv: number;
  total: number;
  onCheckout: () => void;
}

export function CartSummaryCard({
  totalTickets,
  subtotal,
  igv,
  total,
  onCheckout,
}: CartSummaryCardProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
        },
      ]}>
      <Text style={[styles.heading, { color: theme.text }]}>Resumen de la compra</Text>

      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>{`Entradas (${totalTickets}):`}</Text>
          <Text style={[styles.value, { color: theme.text }]}>{formatPricePEN(subtotal)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>IGV (18%):</Text>
          <Text style={[styles.value, { color: theme.text }]}>{formatPricePEN(igv)}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.text }]}>Total a pagar:</Text>
          <Text style={[styles.totalValue, { color: eventia.price }]}>{formatPricePEN(total)}</Text>
        </View>
      </View>

      {/* Botón para continuar con el proceso de compra */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onCheckout}
        style={[styles.checkoutBtn, { backgroundColor: eventia.primaryContainer }]}>
        <Text style={styles.checkoutBtnText}>Proceder al Pago</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
});

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';

interface EventCheckoutBarProps {
  totalTickets: number;
  subtotal: number;
  isSubmitting?: boolean;
  onContinue: () => void;
}

function formatPricePEN(value: number): string {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

export function EventCheckoutBar({
  totalTickets,
  subtotal,
  isSubmitting = false,
  onContinue,
}: EventCheckoutBarProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();
  const isDisabled = totalTickets === 0 || isSubmitting;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.backgroundSelected,
        },
      ]}>
      {/* Información: Cantidad y Subtotal */}
      <View style={styles.leftCol}>
        <Text style={[styles.countText, { color: theme.textSecondary }]}>
          {totalTickets === 0
            ? '0 entradas'
            : `${totalTickets} ${totalTickets === 1 ? 'entrada' : 'entradas'}`}
        </Text>
        <Text style={[styles.subtotalPrice, { color: eventia.price }]}>
          {formatPricePEN(subtotal)}
        </Text>
      </View>

      {/* Botón directo: Agregar al Carrito */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onContinue}
        disabled={isDisabled}
        style={[
          styles.button,
          { backgroundColor: isDisabled ? '#94A3B8' : eventia.primaryContainer },
        ]}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="cart" size={18} color="#FFFFFF" />
        )}
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Validando stock...' : 'Agregar al Carrito'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  leftCol: {
    justifyContent: 'center',
    gap: 2,
  },
  countText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  subtotalPrice: {
    fontSize: 19,
    fontWeight: '800',
    color: '#4F46E5',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

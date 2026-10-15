import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { formatPricePEN, formatShortDate } from '@/data/events';
import { useTheme } from '@/hooks/use-theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import type { CartItem } from '@/types/cart.types';

interface CartItemCardProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function CartItemCard({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemCardProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  const itemTotal = item.price * item.quantity;
  const isMaxReached = item.quantity >= item.available;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
        },
      ]}>
      {/* Cabecera del Item: Imagen (si hay), Título del Evento y Botón Eliminar */}
      <View style={styles.headerRow}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.eventThumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumbPlaceholder, { backgroundColor: theme.backgroundSelected }]}>
            <Ionicons name="calendar" size={18} color={eventia.primary} />
          </View>
        )}

        <View style={styles.eventInfo}>
          <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>
            {item.eventTitle}
          </Text>
          <Text style={[styles.eventMeta, { color: theme.textSecondary }]} numberOfLines={1}>
            {`${formatShortDate(item.eventDate)} · ${item.eventVenue}`}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${item.ticketName}`}
          onPress={onRemove}
          hitSlop={8}
          style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />

      {/* Detalle del Ticket, Precio y Controles de Cantidad */}
      <View style={styles.ticketRow}>
        <View style={styles.ticketDetails}>
          <Text style={[styles.ticketName, { color: theme.text }]}>{item.ticketName}</Text>
          <Text style={[styles.unitPrice, { color: theme.textSecondary }]}>{`${formatPricePEN(item.price)} c/u`}</Text>
        </View>

        {/* Controles de Cantidad */}
        <View style={[styles.counterRow, { backgroundColor: theme.backgroundSelected }]}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Reducir cantidad"
            onPress={onDecrement}
            hitSlop={6}
            style={[styles.counterBtn, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="remove" size={16} color={eventia.primary} />
          </TouchableOpacity>

          <Text style={[styles.counterValue, { color: theme.text }]}>{item.quantity}</Text>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Aumentar cantidad"
            onPress={onIncrement}
            disabled={isMaxReached}
            hitSlop={6}
            style={[
              styles.counterBtn,
              { backgroundColor: theme.backgroundElement },
              isMaxReached && styles.counterBtnDisabled,
            ]}>
            <Ionicons
              name="add"
              size={16}
              color={isMaxReached ? theme.textSecondary : eventia.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subtotal del item */}
      <View style={styles.subtotalRow}>
        <Text style={[styles.subtotalLabel, { color: theme.textSecondary }]}>Subtotal item:</Text>
        <Text style={[styles.subtotalValue, { color: eventia.price }]}>{formatPricePEN(itemTotal)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  thumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  eventMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  deleteBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketDetails: {
    gap: 2,
  },
  ticketName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  unitPrice: {
    fontSize: 12,
    color: '#64748B',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
  },
  counterBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  counterBtnDisabled: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  counterValue: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 22,
    textAlign: 'center',
    color: '#0F172A',
  },
  subtotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  subtotalLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4F46E5',
  },
});

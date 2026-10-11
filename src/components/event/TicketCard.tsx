import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPricePEN } from '@/data/events';
import type { TicketType } from '@/types/event.types';

interface TicketCardProps {
  ticket: TicketType;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function TicketCard({
  ticket,
  quantity,
  onIncrement,
  onDecrement,
}: TicketCardProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  const isSoldOut = ticket.available <= 0;
  const isMaxReached = quantity >= ticket.available;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement },
        quantity > 0 && { borderColor: eventia.primary, borderWidth: 1.5 },
      ]}>
      {/* Cabecera del ticket: nombre y precio */}
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <ThemedText type="smallBold" style={styles.ticketName}>
            {ticket.name}
          </ThemedText>
          {isSoldOut ? (
            <View style={styles.soldOutBadge}>
              <ThemedText type="small" style={styles.soldOutText}>
                Agotado
              </ThemedText>
            </View>
          ) : ticket.available <= 10 ? (
            <View style={styles.lowStockBadge}>
              <ThemedText type="small" style={styles.lowStockText}>
                Últimos {ticket.available}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.priceCol}>
          <ThemedText type="smallBold" style={[styles.priceText, { color: eventia.price }]}>
            {formatPricePEN(ticket.price)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            c/u
          </ThemedText>
        </View>
      </View>

      {/* Descripción del acceso */}
      {ticket.description ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
          {ticket.description}
        </ThemedText>
      ) : null}

      {/* Pie del ticket: Disponibilidad y botones de cantidad */}
      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.availabilityText}>
          {isSoldOut ? 'No disponible para compra' : 'Disponibilidad inmediata'}
        </ThemedText>

        {isSoldOut ? (
          <View style={styles.disabledAction}>
            <ThemedText type="small" themeColor="textSecondary">
              Agotado
            </ThemedText>
          </View>
        ) : (
          <View style={styles.counterRow}>
            {/* Botón Disminuir [-] */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Disminuir ${ticket.name}`}
              onPress={onDecrement}
              disabled={quantity === 0}
              hitSlop={8}
              style={({ pressed }) => [
                styles.counterBtn,
                quantity === 0 && styles.counterBtnDisabled,
                pressed && styles.pressed,
              ]}>
              <Ionicons
                name="remove"
                size={18}
                color={quantity === 0 ? '#9CA3AF' : eventia.primary}
              />
            </Pressable>

            {/* Cantidad seleccionada */}
            <ThemedText type="smallBold" style={styles.counterValue}>
              {quantity}
            </ThemedText>

            {/* Botón Aumentar [+] */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Aumentar ${ticket.name}`}
              onPress={onIncrement}
              disabled={isMaxReached}
              hitSlop={8}
              style={({ pressed }) => [
                styles.counterBtn,
                isMaxReached && styles.counterBtnDisabled,
                pressed && styles.pressed,
              ]}>
              <Ionicons
                name="add"
                size={18}
                color={isMaxReached ? '#9CA3AF' : eventia.primary}
              />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    gap: 4,
    paddingRight: 8,
  },
  ticketName: {
    fontSize: 16,
  },
  soldOutBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  soldOutText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  lowStockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowStockText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  availabilityText: {
    fontSize: 12,
  },
  disabledAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  counterBtnDisabled: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '800',
    minWidth: 26,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});

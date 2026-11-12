import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';
import type { TicketTypeDto } from '@/types/event.types';

interface TicketCardProps {
  ticket: TicketTypeDto;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

function formatPricePEN(value: number): string {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

export function TicketCard({
  ticket,
  quantity,
  onIncrement,
  onDecrement,
}: TicketCardProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  const available = ticket.availableCapacity ?? 0;
  const maxPerTicket = ticket.maxPerPurchase ?? 10;
  const isSoldOut = available <= 0 || ticket.status === 'sold_out' || ticket.status === 'paused';
  const isMaxReached = quantity >= Math.min(available, maxPerTicket);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
        quantity > 0 && { borderColor: eventia.primary, borderWidth: 1.5 },
      ]}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <ThemedText type="smallBold" style={styles.ticketName}>
            {ticket.name}
          </ThemedText>

          <View style={styles.badgesRow}>
            {ticket.zone ? (
              <View style={[styles.zoneBadge, { backgroundColor: eventia.surfaceLow }]}>
                <ThemedText type="small" style={[styles.zoneBadgeText, { color: eventia.primary }]}>
                  {`Zona: ${ticket.zone}`}
                </ThemedText>
              </View>
            ) : null}

            {ticket.isPresale ? (
              <View style={styles.presaleBadge}>
                <ThemedText type="small" style={styles.presaleText}>
                  Preventa
                </ThemedText>
              </View>
            ) : null}

            {isSoldOut ? (
              <View style={styles.soldOutBadge}>
                <ThemedText type="small" style={styles.soldOutText}>
                  Agotado
                </ThemedText>
              </View>
            ) : available <= 10 ? (
              <View style={styles.lowStockBadge}>
                <ThemedText type="small" style={styles.lowStockText}>
                  {`Últimos ${available}`}
                </ThemedText>
              </View>
            ) : null}
          </View>
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

      <View style={styles.metaBox}>
        <ThemedText type="small" themeColor="textSecondary">
          {`Stock disponible: ${available} de ${ticket.totalCapacity} · Máx. ${maxPerTicket} por compra`}
        </ThemedText>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.backgroundSelected }]}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.availabilityText}>
          {isSoldOut ? 'No disponible para compra' : 'Disponibilidad inmediata'}
        </ThemedText>

        {isSoldOut ? (
          <View style={[styles.disabledAction, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="small" themeColor="textSecondary">
              Agotado
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.counterRow, { backgroundColor: theme.backgroundSelected }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Disminuir ${ticket.name}`}
              onPress={onDecrement}
              disabled={quantity === 0}
              hitSlop={8}
              style={({ pressed }) => [
                styles.counterBtn,
                { backgroundColor: theme.backgroundElement },
                quantity === 0 && styles.counterBtnDisabled,
                pressed && styles.pressed,
              ]}>
              <Ionicons
                name="remove"
                size={18}
                color={quantity === 0 ? theme.textSecondary : eventia.primary}
              />
            </Pressable>

            <ThemedText type="smallBold" style={[styles.counterValue, { color: theme.text }]}>
              {quantity}
            </ThemedText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Aumentar ${ticket.name}`}
              onPress={onIncrement}
              disabled={isMaxReached}
              hitSlop={8}
              style={({ pressed }) => [
                styles.counterBtn,
                { backgroundColor: theme.backgroundElement },
                isMaxReached && styles.counterBtnDisabled,
                pressed && styles.pressed,
              ]}>
              <Ionicons
                name="add"
                size={18}
                color={isMaxReached ? theme.textSecondary : eventia.primary}
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
    gap: 6,
    paddingRight: 8,
  },
  ticketName: {
    fontSize: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  zoneBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  zoneBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  presaleBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  presaleText: {
    color: '#3730A3',
    fontSize: 11,
    fontWeight: '700',
  },
  soldOutBadge: {
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
  metaBox: {
    gap: 2,
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

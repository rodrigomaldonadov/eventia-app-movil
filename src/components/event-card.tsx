import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';
import { Eventia, Spacing } from '@/constants/theme';
import {
  CATEGORY_COVER,
  formatPricePEN,
  formatShortDate,
  getAvailability,
  getDateBadge,
  getPriceFrom,
  type EventItem,
} from '@/data/events';

interface EventCardProps {
  event: EventItem;
}

const AVAILABILITY_STYLE = {
  ok: {
    bg: Eventia.successBg,
    text: Eventia.successText,
    dot: Eventia.successDot,
  },
  low: {
    bg: Eventia.warningBg,
    text: Eventia.warningText,
    dot: Eventia.warningDot,
  },
  out: {
    bg: Eventia.dangerBg,
    text: Eventia.dangerText,
    dot: Eventia.dangerDot,
  },
} as const;

export function EventCard({ event }: EventCardProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();
  const router = useRouter();

  const badge = getDateBadge(event.date);
  const availability = getAvailability(event);
  const availabilityStyle = AVAILABILITY_STYLE[availability.tone];
  const soldOut = availability.tone === 'out';

  const goToDetail = () =>
    router.push({
      pathname: '/event/[id]',
      params: { id: event.id },
    });

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement },
      ]}
    >
      {/* Parte clickeable de la tarjeta */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de ${event.title}`}
        onPress={goToDetail}
        style={({ pressed }) => [
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.cover,
            { backgroundColor: CATEGORY_COVER[event.category] },
          ]}
        >
          <ThemedText type="title" style={styles.coverInitial}>
            {event.title.charAt(0)}
          </ThemedText>

          <View style={styles.dateBadge}>
            <ThemedText
              type="smallBold"
              style={styles.dateMonth}
              numberOfLines={1}
            >
              {badge.month}
            </ThemedText>

            <ThemedText
              type="smallBold"
              style={styles.dateDay}
              numberOfLines={1}
            >
              {badge.day}
            </ThemedText>
          </View>

          <View
            style={[
              styles.availability,
              { backgroundColor: availabilityStyle.bg },
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: availabilityStyle.dot },
              ]}
            />

            <ThemedText
              type="smallBold"
              numberOfLines={1}
              style={{ color: availabilityStyle.text }}
            >
              {availability.label}
            </ThemedText>
          </View>
        </View>

        <View style={styles.body}>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            numberOfLines={1}
          >
            {`${event.organizer} ✓`}
          </ThemedText>

          <ThemedText
            type="smallBold"
            style={styles.title}
            numberOfLines={2}
          >
            {event.title}
          </ThemedText>

          <ThemedText
            type="small"
            themeColor="textSecondary"
            numberOfLines={1}
          >
            {`${event.venue} · ${formatShortDate(event.date)}`}
          </ThemedText>
        </View>
      </Pressable>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: eventia.surfaceLow },
        ]}
      >
        <View>
          <ThemedText
            type="small"
            themeColor="textSecondary"
          >
            {soldOut ? 'Lista de espera' : 'Precio por entrada'}
          </ThemedText>

          <ThemedText
            type="smallBold"
            style={[
              styles.price,
              { color: eventia.price },
            ]}
          >
            {`Desde ${formatPricePEN(getPriceFrom(event))}`}
          </ThemedText>
        </View>

        {soldOut ? (
          <View style={styles.notifyButton}>
            <ThemedText type="smallBold">
              Avisarme
            </ThemedText>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Comprar entradas para ${event.title}`}
            onPress={goToDetail}
            style={({ pressed }) => [
              styles.buyButton,
              { backgroundColor: eventia.primaryContainer },
              pressed && styles.pressed,
            ]}
          >
            <ThemedText
              type="smallBold"
              style={styles.buyLabel}
            >
              Comprar
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  pressed: {
    opacity: 0.9,
  },
  cover: {
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInitial: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  dateBadge: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    minHeight: 56,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  dateMonth: {
    // Color fijo: el badge siempre es blanco en ambos temas.
    color: '#4F46E5',
    fontSize: 11,
    lineHeight: 14,
  },
  dateDay: {
    color: '#0B1C30',
    fontSize: 16,
    lineHeight: 20,
  },
  availability: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    maxWidth: '60%',
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  body: {
    gap: 4,
    padding: Spacing.three,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  price: {
    fontSize: 20,
    lineHeight: 26,
  },
  buyButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },
  buyLabel: {
    color: '#FFFFFF',
  },
  notifyButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
});

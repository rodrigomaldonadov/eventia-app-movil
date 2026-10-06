import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { Spacing } from '@/constants/theme';
import { CATEGORY_COVER, formatShortDate, type EventItem } from '@/data/events';

interface HeroCardProps {
  event: EventItem;
}

/**
 * Banner destacado del catálogo (Hero, según la guía): portada del evento
 * con categoría, título, fecha/lugar y acceso directo al detalle.
 */
export function HeroCard({ event }: HeroCardProps) {
  const router = useRouter();
  const eventia = useEventiaTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver evento destacado ${event.title}`}
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      style={({ pressed }) => [
        styles.hero,
        { backgroundColor: CATEGORY_COVER[event.category] },
        pressed && styles.pressed,
      ]}>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.categoryPill}>
          <ThemedText type="smallBold" style={styles.categoryLabel} numberOfLines={1}>
            {`Destacado · ${event.category}`}
          </ThemedText>
        </View>
        <ThemedText type="smallBold" style={styles.title} numberOfLines={2}>
          {event.title}
        </ThemedText>
        <ThemedText style={styles.meta} numberOfLines={1}>
          {`${formatShortDate(event.date)} · ${event.time} hrs · ${event.venue}`}
        </ThemedText>
        <View style={[styles.cta, { backgroundColor: eventia.primaryContainer }]}>
          <ThemedText type="smallBold" style={styles.ctaLabel}>
            Ver entradas
          </ThemedText>
        </View>
      </View>
      <ThemedText type="title" style={styles.watermark}>
        {event.title.charAt(0)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  pressed: {
    opacity: 0.92,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  watermark: {
    position: 'absolute',
    top: 8,
    right: 16,
    color: '#FFFFFF',
    opacity: 0.25,
    fontSize: 96,
    lineHeight: 96,
  },
  content: {
    gap: 6,
    padding: Spacing.three,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryLabel: {
    // Color fijo: el pill siempre es blanco en ambos temas.
    color: '#4F46E5',
    fontSize: 11,
    lineHeight: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 28,
  },
  meta: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 12,
    lineHeight: 16,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },
  ctaLabel: {
    color: '#FFFFFF',
  },
});

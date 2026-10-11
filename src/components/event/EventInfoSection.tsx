import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { formatFullDate } from '@/data/events';
import type { EventItem } from '@/types/event.types';

interface EventInfoSectionProps {
  event: EventItem;
}

export function EventInfoSection({ event }: EventInfoSectionProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.categoryPill, { backgroundColor: eventia.surfaceLow }]}>
          <ThemedText type="smallBold" style={{ color: eventia.primary }}>
            {event.category}
          </ThemedText>
        </View>

        <ThemedText type="subtitle" style={styles.title}>
          {event.title}
        </ThemedText>
      </View>

      {/* Datos Clave: Fecha/Hora, Lugar, Organizador */}
      <View style={styles.detailsList}>
        <View style={[styles.detailItem, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="calendar-outline" size={20} color={eventia.primary} />
          <View style={styles.detailTextCol}>
            <ThemedText type="smallBold">{formatFullDate(event.date)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {`${event.time} hrs`}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.detailItem, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="location-outline" size={20} color={eventia.primary} />
          <View style={styles.detailTextCol}>
            <ThemedText type="smallBold">{event.venue}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {event.city}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.detailItem, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="business-outline" size={20} color={eventia.primary} />
          <View style={styles.detailTextCol}>
            <ThemedText type="smallBold">{event.organizer}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Organizador
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Descripción */}
      <View style={[styles.descCard, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold" style={styles.descHeading}>
          Descripción
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.descText}>
          {event.description}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    gap: 8,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  detailsList: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  detailTextCol: {
    flex: 1,
    gap: 2,
  },
  descCard: {
    padding: 14,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  descHeading: {
    fontSize: 15,
  },
  descText: {
    lineHeight: 22,
    fontSize: 14,
  },
});

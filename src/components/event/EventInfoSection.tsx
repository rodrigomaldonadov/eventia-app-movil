import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import type { EventDetailDto } from '@/types/event.types';

interface EventInfoSectionProps {
  event: EventDetailDto;
}

function formatEventFullDate(isoDate: string): string {
  const [year, month, day] = (isoDate ?? '').split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  const d = new Date(year, month - 1, day);
  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return `${weekdays[d.getDay()] ?? ''}, ${day} de ${months[month - 1] ?? ''} de ${year}`;
}

function formatTimeHHMM(timeStr: string | undefined | null): string {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
}

export function EventInfoSection({ event }: EventInfoSectionProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  const startFormatted = formatTimeHHMM(event.startTime);
  const endFormatted = formatTimeHHMM(event.endTime);
  const scheduleLabel =
    startFormatted && endFormatted
      ? `${startFormatted} - ${endFormatted} hrs`
      : `${startFormatted || endFormatted} hrs`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {event.categoryName ? (
          <View style={[styles.categoryPill, { backgroundColor: eventia.surfaceLow }]}>
            <ThemedText type="smallBold" style={{ color: eventia.primary }}>
              {event.categoryName}
            </ThemedText>
          </View>
        ) : null}

        <ThemedText type="subtitle" style={styles.title}>
          {event.title}
        </ThemedText>
      </View>

      {/* Datos reales del modelo Event: Fecha/Horario, Ubicación/Capacidad, Organizador */}
      <View style={styles.detailsList}>
        <View style={[styles.detailItem, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="calendar-outline" size={20} color={eventia.primary} />
          <View style={styles.detailTextCol}>
            <ThemedText type="smallBold">{formatEventFullDate(event.date)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {scheduleLabel}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.detailItem, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="location-outline" size={20} color={eventia.primary} />
          <View style={styles.detailTextCol}>
            <ThemedText type="smallBold">{event.location}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {`Capacidad: ${event.capacity.toLocaleString()} asistentes`}
            </ThemedText>
          </View>
        </View>

        {event.organizerName ? (
          <View style={[styles.detailItem, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="business-outline" size={20} color={eventia.primary} />
            <View style={styles.detailTextCol}>
              <ThemedText type="smallBold">{event.organizerName}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Organizador
              </ThemedText>
            </View>
          </View>
        ) : null}
      </View>

      {/* Descripción real del evento */}
      {event.description ? (
        <View style={[styles.descCard, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" style={styles.descHeading}>
            Descripción
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.descText}>
            {event.description}
          </ThemedText>
        </View>
      ) : null}
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

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';
import { formatShortDate } from '@/data/events';

interface EventSummaryBannerProps {
  title: string;
  date: string;
  venue: string;
  imageUrl?: string;
  category?: string;
}

export const EventSummaryBanner: React.FC<EventSummaryBannerProps> = ({
  title,
  date,
  venue,
  imageUrl,
  category = 'EVENTO EVENTIA',
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="musical-notes" size={24} color={Eventia.primary} />
          </View>
        )}
      </View>

      <View style={styles.infoCol}>
        <Text style={styles.categoryBadge}>{category.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color="#64748B" />
          <Text style={styles.metaText} numberOfLines={1}>
            {date.includes('-') ? formatShortDate(date) : date} • {venue}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#EFF4FF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DAE2FD',
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Eventia.primary,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1C30',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    flexShrink: 1,
  },
});

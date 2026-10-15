import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';

interface ReservationTimerProps {
  initialMinutes?: number;
  onExpire?: () => void;
}

export const ReservationTimer: React.FC<ReservationTimerProps> = ({
  initialMinutes = 10,
  onExpire,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = secondsLeft === 0;

  return (
    <View style={styles.card}>
      <View style={styles.leftRow}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="timer-outline"
            size={18}
            color={isExpired ? '#EF4444' : Eventia.primary}
          />
        </View>
        <View>
          <Text style={styles.caption}>Entradas reservadas por</Text>
          <Text
            style={[
              styles.timeText,
              isExpired && styles.timeTextExpired,
            ]}>
            {isExpired ? '00:00 min (Expirado)' : `${formattedTime} min`}
          </Text>
        </View>
      </View>

      <View style={[styles.badge, isExpired && styles.badgeExpired]}>
        <View style={[styles.pulseDot, isExpired && styles.pulseDotExpired]} />
        <Text style={[styles.badgeText, isExpired && styles.badgeTextExpired]}>
          {isExpired ? 'LIBERADO' : 'GARANTIZADO'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E2024',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2E3135',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2D3142',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#818CF8',
    fontVariant: ['tabular-nums'],
  },
  timeTextExpired: {
    color: '#EF4444',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#133526',
  },
  badgeExpired: {
    backgroundColor: '#3B1215',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  pulseDotExpired: {
    backgroundColor: '#EF4444',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  badgeTextExpired: {
    color: '#F87171',
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ProfileSectionCardProps {
  /** Título de la sección (ej: "Preferencias", "Asistencia") */
  title: string;
  /** Los elementos hijos o filas dentro de la tarjeta */
  children: React.ReactNode;
}

export function ProfileSectionCard({ title, children }: ProfileSectionCardProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Título de sección en mayúsculas pequeñas */}
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </ThemedText>

      {/* Tarjeta contenedora blanca / fondo según el tema */}
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.one,
  },
  card: {
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
});

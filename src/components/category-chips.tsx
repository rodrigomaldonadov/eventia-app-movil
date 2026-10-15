import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { EventCategory } from '@/data/events';

export type CategoryFilter = 'Todos' | EventCategory;

interface CategoryChipsProps {
  categories: readonly CategoryFilter[];
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
}

/** Píldoras de filtro por categoría del catálogo (RF-04), según la guía. */
export function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.row}>
      {categories.map((category) => {
        const isActive = category === selected;
        return (
          <Pressable
            key={category}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onSelect(category)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isActive ? '#EEF2FF' : theme.backgroundElement,
                borderColor: isActive ? '#4F46E5' : theme.backgroundSelected,
              },
              pressed && styles.pressed,
            ]}>
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              style={isActive ? styles.activeLabel : undefined}
              themeColor={isActive ? 'text' : 'textSecondary'}>
              {category}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Altura fija: el carrusel no depende del contenido de la lista.
  scroller: {
    flexGrow: 0,
    flexShrink: 0,
    height: 60,
    paddingBottom: Spacing.two,
    marginBottom: Spacing.two,
  },
  row: {
    height: 52,
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  chip: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    // shadow-sm de la guía
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  activeLabel: {
    color: '#0B1C30',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});

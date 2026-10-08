import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedFieldProps<T extends string> {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedField<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedFieldProps<T>) {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[
                styles.option,
                { backgroundColor: selected ? eventia.primary : theme.backgroundElement },
              ]}>
              <ThemedText
                type="smallBold"
                style={{ color: selected ? '#FFFFFF' : theme.textSecondary }}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.one },
  row: { flexDirection: 'row', gap: Spacing.two },
  option: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
});
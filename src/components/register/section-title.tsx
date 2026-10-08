import { StyleSheet, View } from 'react-native';

import { ERROR_COLOR } from '@/components/register/form-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';

export function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  const eventia = useEventiaTheme();
  return (
    <View style={[styles.row, { borderLeftColor: eventia.primary }]}>
      <ThemedText type="smallBold" style={styles.title}>
        {title}
      </ThemedText>
      {hint ? (
        <ThemedText type="small" style={{ color: ERROR_COLOR }}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    paddingLeft: Spacing.two,
  },
  title: { letterSpacing: 1, textTransform: 'uppercase' },
});
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';

export const ERROR_COLOR = '#F43F5E';

interface FormFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  prefix?: string;
}

export function FormField({ label, required, error, prefix, style, ...inputProps }: FormFieldProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold">
        {label}
        {required ? <ThemedText style={{ color: ERROR_COLOR }}> *</ThemedText> : null}
      </ThemedText>

      <View
        style={[
          styles.box,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? ERROR_COLOR : 'transparent',
          },
        ]}>
        {prefix ? (
          <ThemedText type="smallBold" style={{ color: eventia.primary }}>
            {prefix}
          </ThemedText>
        ) : null}
        <TextInput
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel={label}
          style={[styles.input, { color: theme.text }, style]}
          {...inputProps}
        />
      </View>

      {error ? (
        <ThemedText type="small" style={{ color: ERROR_COLOR }} accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.one },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
});
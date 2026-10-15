import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';

export interface ProfileOptionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  valueText?: string;
  onPress?: () => void;
  showDivider?: boolean;
}

export function ProfileOptionRow({
  icon,
  title,
  subtitle,
  valueText,
  onPress,
  showDivider = false,
}: ProfileOptionRowProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}>
        <View style={styles.row}>
          <View style={[styles.iconContainer, { backgroundColor: eventia.surfaceLow }]}>
            <Ionicons name={icon} size={20} color={eventia.primary} />
          </View>

          {/* Textos centrales: Título y subtítulo */}
          <View style={styles.textContainer}>
            <ThemedText type="smallBold" style={styles.title}>
              {title}
            </ThemedText>
            {subtitle ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                {subtitle}
              </ThemedText>
            ) : null}
          </View>

          {/* Lado derecho: Valor opcional + Flecha */}
          <View style={styles.rightContainer}>
            <View style={styles.valueRow}>
              {valueText ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.valueText}>
                  {valueText}
                </ThemedText>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </View>
          </View>
        </View>
      </Pressable>

      {/* Línea divisoria */}
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueText: {
    fontSize: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.one,
    marginLeft: 42 + Spacing.three,
  },
});

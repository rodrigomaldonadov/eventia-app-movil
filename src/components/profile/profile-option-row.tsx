import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';

export interface ProfileOptionRowProps {
  /** Nombre del icono de Ionicons */
  icon: keyof typeof Ionicons.glyphMap;
  /** Título principal de la opción */
  title: string;
  /** Subtítulo descriptivo secundario (opcional) */
  subtitle?: string;
  /** Texto a la derecha antes de la flecha (opcional, ej: "Electrónica, Indie") */
  valueText?: string;
  /** Si es true, muestra un interruptor (Switch) en lugar de una flecha */
  isSwitch?: boolean;
  /** Estado activo/inactivo del switch */
  switchValue?: boolean;
  /** Función que se ejecuta al cambiar el switch */
  onSwitchChange?: (value: boolean) => void;
  /** Acción al tocar la fila */
  onPress?: () => void;
  /** Si debe mostrar la línea divisoria inferior */
  showDivider?: boolean;
}

export function ProfileOptionRow({
  icon,
  title,
  subtitle,
  valueText,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
  onPress,
  showDivider = false,
}: ProfileOptionRowProps) {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  return (
    <>
      <Pressable
        disabled={isSwitch}
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          pressed && !isSwitch && styles.pressed,
        ]}>
        {/* Cajita redondeada para el icono con fondo tenue */}
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

        {/* Lado derecho: Switch o (Texto de valor + Flecha) */}
        <View style={styles.rightContainer}>
          {isSwitch ? (
            <Switch
              value={switchValue}
              onValueChange={onSwitchChange}
              trackColor={{ false: '#D1D5DB', true: eventia.primaryContainer }}
              thumbColor="#FFFFFF"
            />
          ) : (
            <View style={styles.valueRow}>
              {valueText ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.valueText}>
                  {valueText}
                </ThemedText>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </View>
          )}
        </View>
      </Pressable>

      {/* Línea divisoria suave entre opciones de la misma tarjeta */}
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
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
    marginLeft: 42 + Spacing.three, // Alineado con el inicio del texto
  },
});

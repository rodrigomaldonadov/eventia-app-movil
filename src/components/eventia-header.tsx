import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';

/**
 * Header general de Eventia (Integrante 4), según la guía del catálogo.
 * Marca a la izquierda y acceso al perfil a la derecha.
 *
 * Nota: la guía muestra iconos de búsqueda y notificaciones en el header.
 * La búsqueda vive en la barra bajo el header y las notificaciones push
 * están fuera del alcance del MVP (ver documento §6), por eso no se incluyen.
 * TODO(equipo): usar una librería de iconos cuando se defina el set final.
 */
export function EventiaHeader() {
  const theme = useTheme();
  const eventia = useEventiaTheme();

  return (
    <View style={[styles.outer, { backgroundColor: theme.background }]}>
      <View style={styles.inner}>
        <View style={styles.brandRow}>
          <View style={[styles.logoMark, { backgroundColor: eventia.primaryContainer }]}>
            <ThemedText type="smallBold" style={styles.logoLetter}>
              E
            </ThemedText>
          </View>
          <ThemedText type="smallBold" style={styles.brand}>
            Eventia
          </ThemedText>
        </View>

        <Link href="/profile" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ir a mi perfil"
            style={({ pressed }) => [
              styles.avatar,
              { backgroundColor: eventia.primary },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" style={styles.avatarLetter}>
              S
            </ThemedText>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // Sombra sutil del header de la guía
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 10,
  },
  inner: {
    flex: 1,
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
  },
  brand: {
    fontSize: 20,
    lineHeight: 26,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.8,
  },
});

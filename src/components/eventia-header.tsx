import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

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
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const go = (href: string) => {
    setOpen(false);
    router.push(href as never);
  };

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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir menú de cuenta"
          onPress={() => setOpen(true)}
          hitSlop={8}
          style={({ pressed }) => [
            styles.menuButton,
            { backgroundColor: theme.backgroundElement },
            pressed && styles.pressed,
          ]}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.bar, { backgroundColor: theme.text }]} />
          ))}
        </Pressable>

        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <View style={[styles.menu, { backgroundColor: theme.backgroundElement }]}>
              <Pressable style={styles.menuItem} onPress={() => go('/profile')}>
                <ThemedText type="smallBold">Mi perfil</ThemedText>
              </Pressable>
              {/* agrega aquí Configuración, Cerrar sesión, etc. */}
            </View>
          </Pressable>
        </Modal>
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

  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bar: { width: 18, height: 2, borderRadius: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'flex-end' },
  menu: { marginTop: 64, marginRight: Spacing.three, minWidth: 200, borderRadius: 16, padding: Spacing.two },
  menuItem: { padding: Spacing.three },


  pressed: {
    opacity: 0.8,
  },
});

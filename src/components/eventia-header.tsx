import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Header general de Eventia.
 * Muestra logo a la izquierda (lleva al catálogo /) y estado dinámico a la derecha:
 * - Sin sesión: botones "Iniciar sesión" y "Registrarse".
 * - Con sesión: hamburguesa con menú modal (Explorar, Mis Tickets, Guardados, Mi perfil, Configuración, Cerrar sesión).
 */
export function EventiaHeader() {
  const theme = useTheme();
  const eventia = useEventiaTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const go = (href: string) => {
    setOpen(false);
    router.push(href as never);
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push('/');
  };

  const menuItems = [
    { label: 'Explorar', href: '/' },
    { label: 'Mis Tickets', href: '/tickets' },
    { label: 'Guardados', href: '/saved' },
    { label: 'Mi perfil', href: '/profile' },
    { label: 'Configuración', href: '/profile' },
  ];

  const isCurrentRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname.startsWith(href);
  };

  return (
    <View style={[styles.outer, { backgroundColor: theme.background }]}>
      <View style={styles.inner}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ir al catálogo principal"
          onPress={() => router.push('/')}
          style={({ pressed }) => [styles.brandRow, pressed && styles.pressed]}>
          <View style={[styles.logoMark, { backgroundColor: eventia.primaryContainer }]}>
            <ThemedText type="smallBold" style={styles.logoLetter}>
              E
            </ThemedText>
          </View>
          <ThemedText type="smallBold" style={styles.brand}>
            Eventia
          </ThemedText>
        </Pressable>

        {isLoading ? (
          <View style={styles.rightPlaceholder} />
        ) : isAuthenticated ? (
          <>
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
                  {menuItems.map((item) => {
                    const active = isCurrentRoute(item.href);
                    return (
                      <Pressable
                        key={item.label}
                        style={({ pressed }) => [
                          styles.menuItem,
                          active && { backgroundColor: theme.backgroundSelected },
                          pressed && styles.pressed,
                        ]}
                        onPress={() => go(item.href)}>
                        <ThemedText
                          type="smallBold"
                          style={active ? { color: eventia.primary } : undefined}>
                          {item.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                  <Pressable
                    style={({ pressed }) => [styles.menuItem, styles.logoutItem, pressed && styles.pressed]}
                    onPress={handleLogout}>
                    <ThemedText type="smallBold" style={styles.logoutText}>
                      Cerrar sesión
                    </ThemedText>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>
          </>
        ) : (
          <View style={styles.authButtonsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Iniciar sesión"
              onPress={() => router.push('/login')}
              style={({ pressed }) => [
                styles.loginButton,
                { borderColor: theme.backgroundSelected },
                pressed && styles.pressed,
              ]}>
              <ThemedText type="smallBold" style={styles.loginText}>
                Iniciar sesión
              </ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Registrarse"
              onPress={() => router.push('/register')}
              style={({ pressed }) => [
                styles.registerButton,
                { backgroundColor: eventia.primaryContainer },
                pressed && styles.pressed,
              ]}>
              <ThemedText type="smallBold" style={styles.registerText}>
                Registrarse
              </ThemedText>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  rightPlaceholder: {
    width: 36,
    height: 36,
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
  menu: {
    marginTop: 64,
    marginRight: Spacing.three,
    minWidth: 200,
    borderRadius: 16,
    padding: Spacing.two,
  },
  menuItem: {
    padding: Spacing.three,
    borderRadius: 10,
  },
  logoutItem: {
    marginTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  logoutText: {
    color: '#EF4444',
  },
  authButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loginButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  loginText: {
    fontSize: 13,
  },
  registerButton: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.8,
  },
});

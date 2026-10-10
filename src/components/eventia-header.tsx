import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Header general de Eventia.
 * Muestra logo a la izquierda (lleva al catálogo /) y estado dinámico a la derecha:
 * - Sin sesión: carrito, botones "Iniciar" y "Registrarse".
 * - Con sesión: carrito y hamburguesa con menú modal.
 */
export function EventiaHeader() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const eventia = useEventiaTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { totalTickets } = useCart();
  const isAuthScreen = pathname === '/login' || pathname === '/register';
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
    { label: 'Mi Carrito', href: '/cart' },
    { label: 'Mi Perfil', href: '/profile' },
  ];

  const isCurrentRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname.startsWith(href);
  };

  return (
    <View style={[styles.outer, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.inner}>
        {/* Logo a la izquierda siempre intacto */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ir al catálogo principal"
          onPress={() => router.push('/')}
          style={({ pressed }) => [styles.brandRow, pressed && styles.pressed]}>
          <View style={[styles.logoMark, { backgroundColor: eventia.primaryContainer }]}>
            <Text style={styles.logoLetter}>
              E
            </Text>
          </View>
          <ThemedText type="smallBold" style={styles.brand}>
            Eventia
          </ThemedText>
        </Pressable>

        {/* Bloque derecho ordenado: Carrito, Iniciar y Registrarse */}
        <View style={styles.rightCluster}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ir al carrito de compras"
            onPress={() => router.push('/cart' as never)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.cartButton,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <Ionicons name="cart-outline" size={19} color={theme.text} />
            {totalTickets > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {totalTickets > 99 ? '99+' : totalTickets}
                </Text>
              </View>
            )}
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
                style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
                <Text style={styles.authText}>
                  Iniciar
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Registrarse"
                onPress={() => router.push('/register')}
                style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
                <Text style={styles.authText}>
                  Registrarse
                </Text>
              </Pressable>
            </View>
          )}
        </View>
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
    gap: 8,
    flexShrink: 0,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  brand: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  cartButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  rightPlaceholder: {
    width: 34,
    height: 34,
  },
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
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
    gap: 8,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
  },
  authText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  pressed: {
    opacity: 0.8,
  },
});

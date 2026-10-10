import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/hooks/use-cart';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { CartSummaryCard } from '@/components/cart/CartSummaryCard';

export default function CartScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    items,
    totalTickets,
    subtotal,
    igv,
    total,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const handleCheckout = () => {
    // Redirige al inicio para que el flujo quede listo para conectar la pasarela de pagos
    router.replace('/');
  };

  const handleClear = () => {
    Alert.alert(
      'Vaciar carrito',
      '¿Estás seguro de que deseas eliminar todas las entradas de tu carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Vaciar', style: 'destructive', onPress: clearCart },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Superior */}
      <View style={[styles.topBar, { backgroundColor: theme.background }]}>
        <View style={styles.topBarInner}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.topBarTitle, { color: theme.text }]}>
            Mi Carrito
          </Text>

          <View style={styles.topBarSpacer} />
        </View>
      </View>

      {items.length === 0 ? (
        /* Estado Vacío */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={48} color="#94A3B8" />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Tu carrito está vacío
          </Text>
          <Text style={styles.emptySubtitle}>
            Aún no has agregado entradas. Explora nuestro catálogo y selecciona tus eventos favoritos.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/')}
            style={styles.exploreBtn}>
            <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
            <Text style={styles.exploreBtnText}>Explorar Eventos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Lista de Entradas en el Carrito */
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainWrapper}>
            <View style={styles.itemsList}>
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                  onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </View>

            {/* Resumen de la compra */}
            <CartSummaryCard
              totalTickets={totalTickets}
              subtotal={subtotal}
              igv={igv}
              total={total}
              onCheckout={handleCheckout}
              onClear={handleClear}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  topBarInner: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  topBarSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    padding: Spacing.three,
    paddingBottom: 32,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 16,
  },
  itemsList: {
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  exploreBtn: {
    marginTop: 8,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

import { useEffect } from 'react';
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
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { CartSummaryCard } from '@/components/cart/CartSummaryCard';
import { ReservationTimer } from '@/features/checkout/components/ReservationTimer';
import type { CartItem } from '@/types/cart.types';

export default function CartScreen() {
  const router = useRouter();
  const theme = useTheme();
  const eventia = useEventiaTheme();
  const { isAuthenticated } = useAuth();
  const {
    items,
    totalTickets,
    subtotal,
    igv,
    total,
    isValidatingStock,
    updateQuantity,
    removeItem,
    validateCartStock,
  } = useCart();

  // Sincroniza el stock de los items del carrito con el backend al entrar a la vista
  useEffect(() => {
    if (items.length > 0) {
      validateCartStock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aumenta la cantidad de una entrada verificando el stock y el máximo por compra
  const handleIncrementItem = (item: CartItem) => {
    const available = item.availableCapacity ?? item.available ?? 0;
    const maxPerTicket = item.maxPerPurchase ?? 10;

    if (totalTickets >= 10) {
      Alert.alert('Límite por compra', 'Solo se pueden comprar hasta 10 entradas por compra.');
      return;
    }

    if (item.quantity >= maxPerTicket) {
      Alert.alert('Límite por tarifa', `Solo se pueden comprar hasta ${maxPerTicket} entradas de "${item.ticketName}".`);
      return;
    }

    if (item.quantity >= available) {
      Alert.alert('Límite de stock', `Solo quedan ${available} entradas disponibles para "${item.ticketName}".`);
      return;
    }

    updateQuantity(item.id, item.quantity + 1);
  };

  // Verifica el stock en el backend y redirige al checkout si la sesión está activa
  const handleCheckout = async () => {
    const stockCheck = await validateCartStock();
    if (!stockCheck.valid) {
      Alert.alert(
        'Disponibilidad de stock',
        stockCheck.message ?? 'Algunas entradas ya no cuentan con stock suficiente. Ajusta las cantidades en tu carrito.',
      );
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        'Inicia sesión para continuar',
        'Debes iniciar sesión con tu cuenta de Eventia para proceder al pago de tus entradas. Tu selección permanecerá guardada en el carrito.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Iniciar Sesión',
            onPress: () =>
              router.push({
                pathname: '/login',
                params: { returnUrl: '/checkout' },
              }),
          },
        ],
      );
      return;
    }

    router.push('/checkout');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.topBar, { backgroundColor: theme.background, borderBottomColor: theme.backgroundSelected }]}>
        <View style={styles.topBarInner}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            hitSlop={10}
            style={[styles.backBtn, { backgroundColor: theme.backgroundSelected }]}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.topBarTitle, { color: theme.text }]}>
            Mi Carrito
          </Text>

          <View style={styles.topBarSpacer} />
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.backgroundSelected }]}>
            <Ionicons name="cart-outline" size={48} color={theme.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Tu carrito está vacío
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Aún no has agregado entradas. Explora nuestro catálogo y selecciona tus eventos favoritos.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/')}
            style={[styles.exploreBtn, { backgroundColor: eventia.primaryContainer }]}>
            <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
            <Text style={styles.exploreBtnText}>Explorar Eventos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainWrapper}>
            <ReservationTimer
              initialMinutes={15}
              onExpire={() => {
                Alert.alert(
                  'Tiempo de reserva concluido',
                  'El tiempo estimado de reserva ha finalizado. Verifica la disponibilidad al proceder al pago.',
                );
              }}
            />

            <View style={styles.itemsList}>
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onIncrement={() => handleIncrementItem(item)}
                  onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </View>

            <CartSummaryCard
              totalTickets={totalTickets}
              subtotal={subtotal}
              igv={igv}
              total={total}
              isValidating={isValidatingStock}
              onCheckout={handleCheckout}
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

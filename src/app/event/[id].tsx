import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { eventService } from '@/services/eventService';
import type { EventDetailDto, TicketSelectionItem, TicketTypeDto } from '@/types/event.types';
import { useCart } from '@/hooks/use-cart';
import { EventInfoSection } from '@/components/event/EventInfoSection';
import { TicketCard } from '@/components/event/TicketCard';
import { EventCheckoutBar } from '@/components/event/EventCheckoutBar';

// Define un color de portada de respaldo según la categoría del evento
function getCategoryCoverColor(categoryName: string | null | undefined): string {
  const normalized = (categoryName ?? '').toLowerCase();
  if (normalized.includes('concierto') || normalized.includes('música')) return '#4F46E5';
  if (normalized.includes('festival')) return '#9333EA';
  if (normalized.includes('teatro') || normalized.includes('arte')) return '#B45309';
  if (normalized.includes('tecnolog') || normalized.includes('tech')) return '#0B1C30';
  if (normalized.includes('gastronom')) return '#006E4B';
  return '#4F46E5';
}

export default function EventDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const eventia = useEventiaTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addEventSelection, totalTickets: cartTotalTickets } = useCart();

  const [event, setEvent] = useState<EventDetailDto | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeDto[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Consulta el detalle del evento y sus tipos de entrada desde el backend
  const fetchEventData = useCallback(async () => {
    if (!id) {
      setErrorMessage('ID de evento no proporcionado.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [eventData, ticketsData] = await Promise.all([
        eventService.getEventById(id),
        eventService.getTicketTypesByEvent(id),
      ]);
      setEvent(eventData);
      setTicketTypes(ticketsData);
    } catch {
      setEvent(null);
      setTicketTypes([]);
      setErrorMessage('No se pudo cargar el evento desde el servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.notFoundContent}>
          <ActivityIndicator size="large" color={eventia.primary} />
          <ThemedText type="smallBold" style={styles.centerText}>
            Cargando detalle del evento...
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!event) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.notFoundContent}>
          <Ionicons name="alert-circle-outline" size={56} color={theme.textSecondary} />
          <ThemedText type="subtitle" style={styles.centerText}>
            Evento no disponible
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            {errorMessage ?? 'El evento solicitado no existe o ya no se encuentra disponible.'}
          </ThemedText>
          <View style={styles.errorActions}>
            <Pressable
              onPress={fetchEventData}
              style={[styles.retryButton, { borderColor: eventia.primary }]}>
              <ThemedText type="smallBold" style={{ color: eventia.primary }}>
                Reintentar
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: eventia.primaryContainer }]}>
              <ThemedText type="smallBold" style={styles.backButtonText}>
                Volver al catálogo
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const totalTickets = Object.values(quantities).reduce((acc, qty) => acc + qty, 0);
  const subtotal = ticketTypes.reduce((sum, ticket) => {
    const qty = quantities[ticket.id] ?? 0;
    return sum + qty * ticket.price;
  }, 0);

  // Incrementa la cantidad seleccionada verificando el stock y el máximo por compra
  const handleIncrement = (ticket: TicketTypeDto) => {
    const current = quantities[ticket.id] ?? 0;
    const available = ticket.availableCapacity ?? 0;
    const maxPerTicket = ticket.maxPerPurchase ?? 10;

    if (totalTickets >= 10) {
      Alert.alert('Límite por compra', 'Solo puedes seleccionar hasta 10 entradas por compra.');
      return;
    }

    if (current >= maxPerTicket) {
      Alert.alert('Límite por tarifa', `Solo puedes seleccionar hasta ${maxPerTicket} entradas de "${ticket.name}".`);
      return;
    }

    if (current >= available) {
      Alert.alert('Límite de stock', `Solo quedan ${available} entradas disponibles para "${ticket.name}".`);
      return;
    }

    setQuantities({ ...quantities, [ticket.id]: current + 1 });
  };

  // Disminuye la cantidad seleccionada de una entrada
  const handleDecrement = (ticketId: number) => {
    const current = quantities[ticketId] ?? 0;
    if (current <= 0) return;
    const next = { ...quantities };
    if (current === 1) {
      delete next[ticketId];
    } else {
      next[ticketId] = current - 1;
    }
    setQuantities(next);
  };

  // Valida el stock con el backend y guarda las entradas seleccionadas en el carrito
  const handleContinue = async () => {
    if (totalTickets === 0) {
      Alert.alert('Selecciona tus entradas', 'Debes seleccionar al menos una entrada para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selections: TicketSelectionItem[] = Object.entries(quantities).map(
        ([ticketId, quantity]) => ({
          ticketTypeId: Number(ticketId),
          quantity,
        }),
      );

      const result = await eventService.validateTicketsStock(event.id, selections);
      if (result.updatedTicketTypes) {
        setTicketTypes(result.updatedTicketTypes);
      }

      if (!result.valid) {
        Alert.alert('Disponibilidad de stock', result.message ?? 'No hay suficiente stock disponible.');
        return;
      }

      const freshTicketTypes = result.updatedTicketTypes ?? ticketTypes;
      addEventSelection(event, freshTicketTypes, quantities);
      setQuantities({});

      Alert.alert(
        'Entradas agregadas',
        'Tus entradas se agregaron al carrito correctamente.',
        [
          { text: 'Seguir viendo', style: 'cancel' },
          {
            text: 'Ir al Carrito',
            onPress: () => router.push('/cart' as never),
          },
        ],
      );
    } catch {
      Alert.alert('Error de conexión', 'No se pudo verificar la disponibilidad con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.topBar, { backgroundColor: theme.background }]}>
        <View style={styles.topBarInner}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver al catálogo"
            onPress={() => router.back()}
            hitSlop={10}
            style={({ pressed }) => [styles.backIconCircle, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>

          <ThemedText type="smallBold" style={styles.topBarTitle}>
            Detalle del Evento
          </ThemedText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ir al carrito de compras"
            onPress={() => router.push('/cart' as never)}
            hitSlop={10}
            style={({ pressed }) => [styles.cartIconCircle, pressed && styles.pressed]}>
            <Ionicons name="cart-outline" size={20} color={theme.text} />
            {cartTotalTickets > 0 && (
              <View style={styles.cartBadge}>
                <ThemedText style={styles.cartBadgeText}>
                  {cartTotalTickets > 99 ? '99+' : cartTotalTickets}
                </ThemedText>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}>
        <View style={styles.mainWrapper}>
          <View style={styles.imageContainer}>
            {event.bannerUrl ? (
              <Image
                source={{ uri: event.bannerUrl }}
                style={styles.heroImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View
                style={[
                  styles.heroPlaceholder,
                  { backgroundColor: getCategoryCoverColor(event.categoryName) },
                ]}>
                <ThemedText type="title" style={styles.placeholderInitial}>
                  {event.title.charAt(0)}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.contentSection}>
            <EventInfoSection event={event} />

            <View style={styles.ticketsSection}>
              <View style={styles.ticketsSectionHeader}>
                <ThemedText type="smallBold" style={styles.ticketsSectionTitle}>
                  Selecciona tus entradas
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Precios en PEN
                </ThemedText>
              </View>

              {ticketTypes.length === 0 ? (
                <View style={[styles.emptyTicketsBox, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="small" themeColor="textSecondary">
                    No hay tipos de entrada activos para este evento.
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.ticketsList}>
                  {ticketTypes.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      quantity={quantities[ticket.id] ?? 0}
                      onIncrement={() => handleIncrement(ticket)}
                      onDecrement={() => handleDecrement(ticket.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <EventCheckoutBar
        totalTickets={totalTickets}
        subtotal={subtotal}
        isSubmitting={isSubmitting}
        onContinue={handleContinue}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundContent: {
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
    maxWidth: 400,
  },
  centerText: {
    textAlign: 'center',
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.three,
  },
  retryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  backButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
  },
  topBar: {
    width: '100%',
    zIndex: 10,
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
    paddingVertical: 8,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  backIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  cartIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#4F46E5',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#1E1B4B',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderInitial: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  contentSection: {
    padding: Spacing.three,
    gap: 20,
  },
  ticketsSection: {
    gap: 12,
  },
  ticketsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketsSectionTitle: {
    fontSize: 17,
  },
  ticketsList: {
    gap: 12,
  },
  emptyTicketsBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});

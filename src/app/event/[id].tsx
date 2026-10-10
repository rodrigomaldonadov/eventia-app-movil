import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { CATEGORY_COVER, formatPricePEN, getEventById as getMockEventById } from '@/data/events';
import { eventService } from '@/services/eventService';
import type { EventItem, TicketType, ValidateTicketsPayload } from '@/types/event.types';
import { EventInfoSection } from '@/components/event/EventInfoSection';
import { TicketCard } from '@/components/event/TicketCard';
import { EventCheckoutBar } from '@/components/event/EventCheckoutBar';

export default function EventDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const eventia = useEventiaTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Obtiene el evento inmediatamente de los datos locales
  const [event, setEvent] = useState<EventItem | null>(() => (id ? getMockEventById(id) ?? null : null));
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Si no está en datos locales y se configuró un backend, intenta cargarlo vía API
  useEffect(() => {
    if (!event && id) {
      eventService.getEventById(id).then((data) => {
        if (data) setEvent(data);
      });
    }
  }, [id, event]);

  if (!event) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.notFoundContent}>
          <Ionicons name="alert-circle-outline" size={56} color={theme.textSecondary} />
          <ThemedText type="subtitle" style={styles.centerText}>
            Evento no encontrado
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            El evento solicitado no existe o ya no se encuentra disponible.
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: eventia.primaryContainer }]}>
            <ThemedText type="smallBold" style={styles.backButtonText}>
              Volver al catálogo
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Aumenta la cantidad de una entrada validando su stock
  const handleIncrement = (ticket: TicketType) => {
    const current = quantities[ticket.id] ?? 0;
    if (current >= ticket.available) {
      Alert.alert('Límite de stock', `Solo quedan ${ticket.available} entradas disponibles.`);
      return;
    }
    setQuantities({ ...quantities, [ticket.id]: current + 1 });
  };

  // Disminuye la cantidad de una entrada
  const handleDecrement = (ticketId: string) => {
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

  // Conteo total y subtotal calculado
  const totalTickets = Object.values(quantities).reduce((acc, qty) => acc + qty, 0);
  const subtotal = event.tickets.reduce((sum, ticket) => {
    const qty = quantities[ticket.id] ?? 0;
    return sum + qty * ticket.price;
  }, 0);

  // Valida y prepara las entradas para transferir al carrito
  const handleContinue = async () => {
    if (totalTickets === 0) {
      Alert.alert('Selecciona tus entradas', 'Debes seleccionar al menos una entrada para continuar.');
      return;
    }

    const payload: ValidateTicketsPayload = {
      eventId: event.id,
      items: Object.entries(quantities).map(([ticketId, quantity]) => ({
        ticketId,
        quantity,
      })),
    };

    const result = await eventService.validateTickets(payload);
    if (!result.valid) {
      Alert.alert('Disponibilidad', result.message ?? 'No hay suficiente disponibilidad.');
      return;
    }

    Alert.alert(
      'Agregado al Carrito',
      `Se agregaron ${totalTickets} entrada(s) de "${event.title}" por ${formatPricePEN(subtotal)}. Listo para gestionar en el carrito.`,
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Barra superior con botón de regreso */}
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

          <View style={styles.topBarSpacer} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}>
        <View style={styles.mainWrapper}>
          {/* Imagen de Portada */}
          <View style={styles.imageContainer}>
            {event.imageUrl ? (
              <Image
                source={{ uri: event.imageUrl }}
                style={styles.heroImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View
                style={[styles.heroPlaceholder, { backgroundColor: CATEGORY_COVER[event.category] }]}>
                <ThemedText type="title" style={styles.placeholderInitial}>
                  {event.title.charAt(0)}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Información del Evento y Entradas */}
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

              <View style={styles.ticketsList}>
                {event.tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    quantity={quantities[ticket.id] ?? 0}
                    onIncrement={() => handleIncrement(ticket)}
                    onDecrement={() => handleDecrement(ticket.id)}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Barra Inferior Fija de Subtotales y Continuar */}
      <EventCheckoutBar
        totalTickets={totalTickets}
        subtotal={subtotal}
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
  backButton: {
    marginTop: Spacing.three,
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
  topBarSpacer: {
    width: 36,
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
  pressed: {
    opacity: 0.8,
  },
});

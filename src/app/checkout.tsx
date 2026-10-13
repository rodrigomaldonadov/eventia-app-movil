import React, { useEffect, useState } from 'react';
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
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { MaxContentWidth, Spacing, Eventia } from '@/constants/theme';
import { findUserByEmail } from '@/services/user-storage';

import { CheckoutStepper } from '@/features/checkout/components/CheckoutStepper';
import { ReservationTimer } from '@/features/checkout/components/ReservationTimer';
import { EventSummaryBanner } from '@/features/checkout/components/EventSummaryBanner';
import { CollapsibleOrderSummary } from '@/features/checkout/components/CollapsibleOrderSummary';
import { BuyerInfoCard } from '@/features/checkout/components/BuyerInfoCard';
import { PaymentMethodSelector } from '@/features/checkout/components/PaymentMethodSelector';
import { DigitalPassPreviewModal } from '@/features/checkout/components/DigitalPassPreviewModal';
import { TermsAndSecurityFooter } from '@/features/checkout/components/TermsAndSecurityFooter';
import { StickyCheckoutDock } from '@/features/checkout/components/StickyCheckoutDock';

import type {
  BuyerInfo,
  CardDetails,
  PaymentMethodId,
} from '@/features/checkout/types/checkout.types';

export default function CheckoutScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { items, totalTickets, subtotal, igv, total, clearCart } = useCart();

  // Datos del Comprador
  const [buyer, setBuyer] = useState<BuyerInfo>({
    fullName: user?.fullName || 'Daniela Morales',
    email: user?.email || 'daniela@eventia.io',
    documentType: 'DNI',
    documentNumber: '41890321',
  });

  // Método de pago y formulario de tarjeta
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('card');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '4532 8821 9910 8910',
    expiry: '11/28',
    cvv: '842',
    cardHolder: user?.fullName ? user.fullName.toUpperCase() : 'DANIELA MORALES',
  });

  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Precargar datos del usuario desde almacenamiento si existen
  useEffect(() => {
    if (user?.email) {
      findUserByEmail(user.email)
        .then((storedUser) => {
          if (storedUser) {
            setBuyer((prev) => ({
              ...prev,
              fullName: `${storedUser.firstName} ${storedUser.lastName}`.trim() || prev.fullName,
              email: storedUser.email || prev.email,
              documentType: storedUser.documentType || 'DNI',
              documentNumber: storedUser.documentNumber || prev.documentNumber,
              phone: storedUser.phoneNumber || prev.phone,
            }));
            if (storedUser.firstName) {
              setCardDetails((prev) => ({
                ...prev,
                cardHolder: `${storedUser.firstName} ${storedUser.lastName}`.toUpperCase(),
              }));
            }
          }
        })
        .catch(() => {
          // Ignorar si no existe
        });
    }
  }, [user]);

  // Evento representativo para el banner
  const primaryItem = items[0];
  const eventTitle = primaryItem?.eventTitle || 'Electric Odyssey 2025: Soundscapes of Tomorrow';
  const eventDate = primaryItem?.eventDate || '2025-05-24';
  const eventVenue = primaryItem?.eventVenue || 'Estadio Metropolitano, Lima';
  const eventImage = primaryItem?.imageUrl;

  const handleExecutePayment = () => {
    if (!termsAccepted) {
      Alert.alert(
        'Términos y Condiciones',
        'Debes aceptar los Términos del Servicio y la Política de Reembolsos para continuar.',
      );
      return;
    }

    if (!buyer.fullName.trim() || !buyer.documentNumber.trim()) {
      Alert.alert(
        'Datos incompletos',
        'Por favor completa tu nombre y número de documento para emitir los boletos.',
      );
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        '¡Compra Exitosa!',
        `Se han emitido tus ${totalTickets} entradas para "${eventTitle}". Tus pases digitales ya están listos.`,
        [
          {
            text: 'Ver Mis Entradas',
            onPress: () => {
              clearCart();
              router.replace('/(tabs)/tickets');
            },
          },
        ],
      );
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: theme.text }]}>Checkout Seguro</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={44} color="#94A3B8" />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay entradas para procesar</Text>
          <Text style={styles.emptySubtitle}>
            Tu carrito está vacío. Agrega boletos desde el catálogo para iniciar la compra.
          </Text>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Explorar Catálogo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: theme.background }]}>
        <View style={styles.topBarInner}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Volver al carrito"
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.topTitleBox}>
            <Text style={[styles.topBarTitle, { color: theme.text }]}>Checkout Seguro</Text>
          </View>

          <View style={styles.secureHeaderBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#006E4B" />
          </View>
        </View>
      </View>

      {/* Stepper de Progreso */}
      <CheckoutStepper currentStep={2} />

      {/* Contenido Principal con Scroll */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {/* 1. Temporizador de Reserva de Entradas */}
          <ReservationTimer
            initialMinutes={10}
            onExpire={() => {
              Alert.alert(
                'Tiempo expirado',
                'El tiempo de reserva de tus entradas ha concluido. Puedes continuar o actualizar el carrito.',
              );
            }}
          />

          {/* 2. Banner de Evento Principal */}
          <EventSummaryBanner
            title={eventTitle}
            date={eventDate}
            venue={eventVenue}
            imageUrl={eventImage}
          />

          {/* 3. Desglose Colapsable de la Compra */}
          <CollapsibleOrderSummary
            items={items}
            subtotal={subtotal}
            igv={igv}
            total={total}
            totalTickets={totalTickets}
          />

          {/* 4. Datos del Comprador */}
          <BuyerInfoCard
            buyer={buyer}
            onChange={setBuyer}
            isVerified={Boolean(buyer.fullName && buyer.documentNumber)}
          />

          {/* 5. Selector de Método de Pago */}
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            cardDetails={cardDetails}
            onChangeCardDetails={setCardDetails}
          />

          {/* 6. Previsualización de Entrada Digital (Ticket Stub Modal) */}
          <DigitalPassPreviewModal
            eventTitle={eventTitle}
            eventDate={eventDate}
            eventVenue={eventVenue}
            buyer={buyer}
            tierName={primaryItem?.ticketName}
          />

          {/* 7. Términos y Condiciones + Sello de Seguridad */}
          <TermsAndSecurityFooter
            termsAccepted={termsAccepted}
            onToggleTerms={setTermsAccepted}
          />

          {/* Espaciador inferior para no tapar con el dock fijo */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* 8. Dock Inferior Fijo de Pago */}
      <StickyCheckoutDock
        total={total}
        onPressPay={handleExecutePayment}
        isLoading={isProcessing}
        disabled={!termsAccepted}
        buttonText={isProcessing ? 'Procesando...' : 'Pagar y Generar Entradas'}
      />
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  topTitleBox: {
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  topBarSpacer: {
    width: 36,
  },
  secureHeaderBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 14,
  },
  bottomSpacer: {
    height: 90,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: Eventia.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

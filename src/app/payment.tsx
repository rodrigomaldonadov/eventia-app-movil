import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { formatPricePEN } from '@/data/events';

import { CreditCardVisual } from '@/features/payments/components/CreditCardVisual';
import { InstallmentsSelector } from '@/features/payments/components/InstallmentsSelector';
import { PaymentProcessingModal } from '@/features/payments/components/PaymentProcessingModal';
import { paymentService } from '@/features/payments/services/paymentService';
import { orderService } from '@/features/orders/services/orderService';
import type {
  PaymentGatewayType,
  PaymentTransactionRequest,
  PaymentTransactionResponse,
} from '@/features/payments/types/payment.types';

export default function PaymentScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { items, subtotal, igv, total, totalTickets, clearCart } = useCart();

  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>('card');
  const [cardNumber, setCardNumber] = useState('4532 8821 9910 8910');
  const [cardHolder, setCardHolder] = useState(
    user?.fullName ? user.fullName.toUpperCase() : 'DANIELA MORALES'
  );
  const [expiry, setExpiry] = useState('11/28');
  const [cvv, setCvv] = useState('842');
  const [installments, setInstallments] = useState(1);

  // Estados de Modal y procesamiento
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionResult, setTransactionResult] = useState<PaymentTransactionResponse | null>(null);

  const eventTitle = items[0]?.eventTitle || 'Electric Odyssey 2025';

  const handleCardNumberChange = (text: string) => {
    setCardNumber(paymentService.formatCardNumber(text));
  };

  const handleExpiryChange = (text: string) => {
    setExpiry(paymentService.formatExpiry(text));
  };

  // Simular botón de prueba rápida para el evaluador/profesor
  const setTestScenario = (type: 'approved' | 'insufficient_funds' | 'expired') => {
    if (type === 'approved') {
      setCardNumber('4532 8821 9910 8910');
      setExpiry('11/28');
      setCvv('842');
    } else if (type === 'insufficient_funds') {
      setCardNumber('4532 8821 9910 0002');
      setExpiry('11/28');
      setCvv('123');
    } else if (type === 'expired') {
      setCardNumber('4532 8821 9910 0003');
      setExpiry('01/22');
      setCvv('456');
    }
  };

  const executeTransaction = async () => {
    if (selectedGateway === 'card') {
      if (cardNumber.replace(/\s+/g, '').length < 16) {
        Alert.alert('Tarjeta Inválida', 'Por favor ingresa un número de tarjeta de 16 dígitos.');
        return;
      }
      if (!cardHolder.trim()) {
        Alert.alert('Nombre Requerido', 'Ingresa el nombre del titular tal como figura en el plástico.');
        return;
      }
      if (expiry.length < 5) {
        Alert.alert('Vencimiento Inválido', 'Ingresa el formato MM/AA.');
        return;
      }
      if (cvv.length < 3) {
        Alert.alert('Código CVV', 'Ingresa los 3 dígitos del reverso de tu tarjeta.');
        return;
      }
    }

    setIsModalVisible(true);
    setIsProcessing(true);
    setTransactionResult(null);

    const request: PaymentTransactionRequest = {
      orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
      amount: total || 288,
      currency: 'PEN',
      gateway: selectedGateway,
      description: `Entradas (${totalTickets}) para ${eventTitle}`,
      payer: {
        fullName: cardHolder,
        email: user?.email || 'comprador@eventia.io',
        documentType: 'DNI',
        documentNumber: '41890321',
      },
      card: {
        cardNumber,
        cardHolder,
        expiryMonth: expiry.slice(0, 2),
        expiryYear: expiry.slice(3),
        cvv,
        installments,
        brand: paymentService.detectCardBrand(cardNumber),
      },
    };

    const res = await paymentService.processPayment(request);

    if (res.status === 'approved') {
      await orderService.createOrder({
        items,
        subtotal: subtotal || (total ? Math.round((total / 1.18) * 100) / 100 : 244),
        igv: igv || (total ? Math.round((total - total / 1.18) * 100) / 100 : 44),
        total: total || 288,
        buyerName: cardHolder,
        buyerEmail: user?.email || 'comprador@eventia.io',
        buyerDocument: '41.890.321-K',
        paymentMethod: `Mercado Pago (${request.card?.brand?.toUpperCase() || 'Tarjeta'})`,
        authorizationCode: res.authorizationCode,
      });
    }

    setIsProcessing(false);
    setTransactionResult(res);
  };

  const handleSuccessRedirect = () => {
    setIsModalVisible(false);
    clearCart();
    router.replace('/(tabs)/tickets');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: theme.background }]}>
        <View style={styles.topBarInner}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: theme.text }]}>Pasarela de Pago Segura</Text>
          <View style={styles.secureBadge}>
            <Ionicons name="lock-closed" size={16} color="#006E4B" />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.mainWrapper}>
          {/* Tarjeta Visual de Crédito / Débito */}
          <CreditCardVisual
            cardNumber={cardNumber}
            cardHolder={cardHolder}
            expiry={expiry}
          />

          {/* Sandbox Test Scenarios Toolbar */}
          <View style={styles.sandboxBox}>
            <View style={styles.sandboxHeader}>
              <Ionicons name="flask-outline" size={15} color={Eventia.primary} />
              <Text style={styles.sandboxTitle}>Simulador Sandbox de Pruebas</Text>
            </View>
            <View style={styles.sandboxButtonsRow}>
              <TouchableOpacity
                onPress={() => setTestScenario('approved')}
                style={[styles.sandboxPill, styles.pillSuccess]}>
                <Text style={styles.pillTextSuccess}>Aprobada (OK)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTestScenario('insufficient_funds')}
                style={[styles.sandboxPill, styles.pillDanger]}>
                <Text style={styles.pillTextDanger}>Fondos Insuf.</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTestScenario('expired')}
                style={[styles.sandboxPill, styles.pillWarn]}>
                <Text style={styles.pillTextWarn}>Expirada</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Formulario de Entrada de Tarjeta */}
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Detalles de la Tarjeta</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número de Tarjeta</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  placeholder="4532 8821 9910 8910"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={19}
                  style={styles.textInput}
                />
                <Ionicons name="card-outline" size={20} color="#64748B" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Titular (en el plástico)</Text>
              <TextInput
                value={cardHolder}
                onChangeText={setCardHolder}
                placeholder="DANIELA MORALES"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                style={styles.textInputRegular}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Vencimiento</Text>
                <TextInput
                  value={expiry}
                  onChangeText={handleExpiryChange}
                  placeholder="MM/AA"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={5}
                  style={styles.textInputRegular}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <View style={styles.cvvLabelRow}>
                  <Text style={styles.inputLabel}>CVV / CVC</Text>
                  <Ionicons name="help-circle-outline" size={14} color="#94A3B8" />
                </View>
                <TextInput
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="•••"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  style={styles.textInputRegular}
                />
              </View>
            </View>
          </View>

          {/* Selector de Cuotas Mercado Pago */}
          <InstallmentsSelector
            totalAmount={total || 288}
            selectedInstallments={installments}
            onSelectInstallments={setInstallments}
          />

          {/* Botón de Confirmación y Pago */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={executeTransaction}
            style={styles.payButton}>
            <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
            <Text style={styles.payButtonText}>
              Pagar {formatPricePEN(total || 288)} con Mercado Pago
            </Text>
          </TouchableOpacity>

          <View style={styles.footerSeal}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#64748B" />
            <Text style={styles.footerSealText}>
              Transacción protegida por Mercado Pago Gateway y PCI Compliance Nivel 1
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Procesamiento y Respuesta */}
      <PaymentProcessingModal
        visible={isModalVisible}
        isProcessing={isProcessing}
        result={transactionResult}
        onSuccess={handleSuccessRedirect}
        onRetry={executeTransaction}
        onClose={() => setIsModalVisible(false)}
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
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  secureBadge: {
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
    paddingBottom: 36,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 16,
  },
  sandboxBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sandboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sandboxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  sandboxButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sandboxPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSuccess: {
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  pillTextSuccess: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  pillDanger: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  pillTextDanger: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '700',
  },
  pillWarn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pillTextWarn: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  cvvLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0B1C30',
    paddingVertical: 10,
  },
  textInputRegular: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0B1C30',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  payButton: {
    backgroundColor: Eventia.primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Eventia.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  footerSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  footerSealText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    flexShrink: 1,
    lineHeight: 16,
  },
});

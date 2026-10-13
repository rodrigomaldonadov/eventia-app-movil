import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';
import type { CardDetails, PaymentMethodId } from '../types/checkout.types';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
  cardDetails: CardDetails;
  onChangeCardDetails: (details: CardDetails) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  cardDetails,
  onChangeCardDetails,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="wallet-outline" size={18} color={Eventia.primary} />
        <Text style={styles.sectionTitle}>Selecciona Método de Pago</Text>
      </View>

      {/* 1. Apple Pay / Google Pay (1-TAP) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectMethod('wallet')}
        style={[
          styles.methodCard,
          selectedMethod === 'wallet' && styles.methodCardSelected,
        ]}>
        <View style={styles.radioRow}>
          <View
            style={[
              styles.radioOuter,
              selectedMethod === 'wallet' && styles.radioOuterSelected,
            ]}>
            {selectedMethod === 'wallet' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.methodInfo}>
            <View style={styles.badgeLine}>
              <Text style={styles.methodName}>Apple Pay / Google Pay</Text>
              <View style={styles.tapBadge}>
                <Text style={styles.tapBadgeText}>1-TAP</Text>
              </View>
            </View>
            <Text style={styles.methodDesc}>
              Autenticación biométrica instantánea
            </Text>
          </View>
        </View>
        <Ionicons name="phone-portrait-outline" size={20} color="#0B1C30" />
      </TouchableOpacity>

      {/* 2. Mercado Pago / Tarjetas de Crédito y Débito */}
      <View
        style={[
          styles.cardMethodWrapper,
          selectedMethod === 'card' && styles.methodCardSelected,
        ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectMethod('card')}
          style={styles.cardHeader}>
          <View style={styles.radioRow}>
            <View
              style={[
                styles.radioOuter,
                selectedMethod === 'card' && styles.radioOuterSelected,
              ]}>
              {selectedMethod === 'card' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>Mercado Pago / Tarjetas</Text>
              <Text style={styles.methodDesc}>Crédito y Débito hasta 6 cuotas</Text>
            </View>
          </View>

          <View style={styles.cardLogos}>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>VISA</Text>
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>MC</Text>
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>AMEX</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Inputs de tarjeta cuando está activo */}
        {selectedMethod === 'card' && (
          <View style={styles.cardInputsWrapper}>
            <View style={styles.inputField}>
              <Text style={styles.inputFieldLabel}>Número de Tarjeta</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  value={cardDetails.cardNumber}
                  onChangeText={(val) =>
                    onChangeCardDetails({ ...cardDetails, cardNumber: val })
                  }
                  placeholder="4532 •••• •••• 8910"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
                <Ionicons name="card-outline" size={18} color="#94A3B8" />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputField, { flex: 1 }]}>
                <Text style={styles.inputFieldLabel}>Vencimiento (MM/AA)</Text>
                <TextInput
                  value={cardDetails.expiry}
                  onChangeText={(val) =>
                    onChangeCardDetails({ ...cardDetails, expiry: val })
                  }
                  placeholder="11/28"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={5}
                  style={styles.textInput}
                />
              </View>

              <View style={[styles.inputField, { flex: 1 }]}>
                <Text style={styles.inputFieldLabel}>CVV / CVC</Text>
                <TextInput
                  value={cardDetails.cvv}
                  onChangeText={(val) =>
                    onChangeCardDetails({ ...cardDetails, cvv: val })
                  }
                  placeholder="•••"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={styles.inputField}>
              <Text style={styles.inputFieldLabel}>Nombre en la Tarjeta</Text>
              <TextInput
                value={cardDetails.cardHolder}
                onChangeText={(val) =>
                  onChangeCardDetails({ ...cardDetails, cardHolder: val })
                }
                placeholder="DANIELA MORALES"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                style={styles.textInput}
              />
            </View>
          </View>
        )}
      </View>

      {/* 3. PayPal Express */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectMethod('paypal')}
        style={[
          styles.methodCard,
          selectedMethod === 'paypal' && styles.methodCardSelected,
        ]}>
        <View style={styles.radioRow}>
          <View
            style={[
              styles.radioOuter,
              selectedMethod === 'paypal' && styles.radioOuterSelected,
            ]}>
            {selectedMethod === 'paypal' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.methodInfo}>
            <View style={styles.badgeLine}>
              <Text style={styles.methodName}>PayPal Express</Text>
              <View style={styles.globalBadge}>
                <Text style={styles.globalBadgeText}>Global</Text>
              </View>
            </View>
            <Text style={styles.methodDesc}>
              Saldo PayPal o tarjetas internacionales
            </Text>
          </View>
        </View>
        <Ionicons name="logo-paypal" size={22} color={Eventia.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1C30',
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardMethodWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  methodCardSelected: {
    borderColor: Eventia.primary,
  },
  cardHeader: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Eventia.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Eventia.primary,
  },
  methodInfo: {
    flex: 1,
    gap: 2,
  },
  badgeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  methodDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  tapBadge: {
    backgroundColor: '#E2DFFF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  tapBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Eventia.primary,
  },
  globalBadge: {
    backgroundColor: '#DAE2FD',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  globalBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3F465C',
  },
  cardLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#334155',
  },
  cardInputsWrapper: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputField: {
    gap: 4,
  },
  inputFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0B1C30',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
});

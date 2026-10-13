import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';
import type { CardDetails, PaymentMethodId } from '../types/checkout.types';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
  cardDetails?: CardDetails;
  onChangeCardDetails?: (details: CardDetails) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  const handleDisabledMethodPress = (methodName: string) => {
    Alert.alert(
      'Próximamente disponible',
      `El método de pago con ${methodName} se habilitará en la siguiente actualización. Por favor selecciona Mercado Pago / Tarjetas para continuar tu compra.`,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="wallet-outline" size={18} color={Eventia.primary} />
        <Text style={styles.sectionTitle}>Selecciona Método de Pago</Text>
      </View>

      {/* 1. Apple Pay / Google Pay (Deshabilitado / Próximamente) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleDisabledMethodPress('Apple Pay / Google Pay')}
        style={[styles.methodCard, styles.methodCardDisabled]}>
        <View style={styles.radioRow}>
          <View style={styles.radioOuterDisabled} />
          <View style={styles.methodInfo}>
            <View style={styles.badgeLine}>
              <Text style={styles.methodNameDisabled}>Apple Pay / Google Pay</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>PRÓXIMAMENTE</Text>
              </View>
            </View>
            <Text style={styles.methodDescDisabled}>
              Autenticación biométrica de un solo toque
            </Text>
          </View>
        </View>
        <Ionicons name="phone-portrait-outline" size={20} color="#94A3B8" />
      </TouchableOpacity>

      {/* 2. Mercado Pago / Tarjetas de Crédito y Débito (Activo principal) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectMethod('card')}
        style={[
          styles.methodCard,
          selectedMethod === 'card' && styles.methodCardSelected,
        ]}>
        <View style={styles.radioRow}>
          <View
            style={[
              styles.radioOuter,
              selectedMethod === 'card' && styles.radioOuterSelected,
            ]}>
            {selectedMethod === 'card' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.methodInfo}>
            <View style={styles.badgeLine}>
              <Text style={styles.methodName}>Mercado Pago / Tarjetas</Text>
              <View style={styles.activeTagBadge}>
                <Text style={styles.activeTagText}>RECOMENDADO</Text>
              </View>
            </View>
            <Text style={styles.methodDesc}>
              Crédito y Débito hasta 6 cuotas sin interés
            </Text>
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

      {/* 3. PayPal Express (Deshabilitado / Próximamente) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleDisabledMethodPress('PayPal Express')}
        style={[styles.methodCard, styles.methodCardDisabled]}>
        <View style={styles.radioRow}>
          <View style={styles.radioOuterDisabled} />
          <View style={styles.methodInfo}>
            <View style={styles.badgeLine}>
              <Text style={styles.methodNameDisabled}>PayPal Express</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>PRÓXIMAMENTE</Text>
              </View>
            </View>
            <Text style={styles.methodDescDisabled}>
              Saldo PayPal y tarjetas internacionales
            </Text>
          </View>
        </View>
        <Ionicons name="logo-paypal" size={22} color="#94A3B8" />
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
  methodCardSelected: {
    borderColor: Eventia.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: Eventia.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  methodCardDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.65,
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
  radioOuterDisabled: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F1F5F9',
  },
  methodInfo: {
    flex: 1,
    gap: 2,
  },
  badgeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  methodName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B1C30',
  },
  methodNameDisabled: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  methodDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  methodDescDisabled: {
    fontSize: 11,
    color: '#94A3B8',
  },
  activeTagBadge: {
    backgroundColor: '#E2DFFF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: Eventia.primary,
  },
  comingSoonBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
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
});

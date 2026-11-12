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
      `El método de pago con ${methodName} se habilitará en una próxima versión. Por favor selecciona Tarjetas de Crédito / Débito para continuar tu compra.`,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="wallet-outline" size={18} color={Eventia.primary} />
        <Text style={styles.sectionTitle}>Selecciona Método de Pago</Text>
      </View>

      {/* 1. Tarjetas de Crédito y Débito (Activo principal) */}
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

      {/* 2. Yape (Deshabilitado / Próximamente) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleDisabledMethodPress('Yape')}
        style={[styles.methodCard, styles.methodCardDisabled]}>
        <View style={styles.radioRow}>
          <View style={styles.radioOuterDisabled} />
          <View style={styles.methodInfo}>
            <View style={styles.badgeLine}>
              <Text style={styles.methodNameDisabled}>Yape</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>PRÓXIMAMENTE</Text>
              </View>
            </View>
            <Text style={styles.methodDescDisabled}>
              Pago móvil rápido con QR o número celular
            </Text>
          </View>
        </View>
        <View style={styles.yapeBadge}>
          <Text style={styles.yapeBadgeText}>YAPE</Text>
        </View>
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
    color: '#FFFFFF',
  },
  methodCard: {
    backgroundColor: '#1E2024',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#2E3135',
  },
  methodCardSelected: {
    borderColor: '#818CF8',
    backgroundColor: '#1E1B4B',
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  methodCardDisabled: {
    backgroundColor: '#161719',
    borderColor: '#25272B',
    opacity: 0.5,
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
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#818CF8',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#818CF8',
  },
  radioOuterDisabled: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#374151',
    backgroundColor: '#1E2024',
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
    color: '#FFFFFF',
  },
  methodNameDisabled: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  methodDesc: {
    fontSize: 11,
    color: '#94A3B8',
  },
  methodDescDisabled: {
    fontSize: 11,
    color: '#64748B',
  },
  activeTagBadge: {
    backgroundColor: '#312E81',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A5B4FC',
  },
  comingSoonBadge: {
    backgroundColor: '#27272A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  yapeBadge: {
    backgroundColor: '#742284',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9333EA',
  },
  yapeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00D1A0',
    letterSpacing: 0.8,
  },
  cardLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardBadge: {
    backgroundColor: '#2A2D32',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E2E8F0',
  },
});

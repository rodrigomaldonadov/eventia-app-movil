import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '../services/paymentService';

interface CreditCardVisualProps {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  brand?: 'visa' | 'mastercard' | 'amex' | 'generic';
}

export const CreditCardVisual: React.FC<CreditCardVisualProps> = ({
  cardNumber,
  cardHolder,
  expiry,
  brand,
}) => {
  const detectedBrand = brand || paymentService.detectCardBrand(cardNumber);

  // Formatear display del número
  const displayCardNumber =
    cardNumber.length > 0
      ? cardNumber.padEnd(19, '•')
      : '•••• •••• •••• ••••';

  return (
    <View style={styles.cardContainer}>
      {/* Fondo y Brillo Decorativo */}
      <View style={styles.cardGlow1} />
      <View style={styles.cardGlow2} />

      {/* Header de la Tarjeta (Chip + Contactless + Marca) */}
      <View style={styles.cardTopRow}>
        <View style={styles.chipAndContactless}>
          {/* Chip EMV Dorado */}
          <View style={styles.emvChip}>
            <View style={styles.emvLine1} />
            <View style={styles.emvLine2} />
          </View>
          <Ionicons name="wifi" size={18} color="rgba(255,255,255,0.7)" />
        </View>

        {/* Brand Badge */}
        <View style={styles.brandBadge}>
          <Text style={styles.brandText}>
            {detectedBrand === 'visa'
              ? 'VISA'
              : detectedBrand === 'mastercard'
              ? 'MASTERCARD'
              : detectedBrand === 'amex'
              ? 'AMEX'
              : 'EVENTIA PAY'}
          </Text>
        </View>
      </View>

      {/* Número de Tarjeta */}
      <View style={styles.numberBox}>
        <Text style={styles.cardNumberText} numberOfLines={1}>
          {displayCardNumber}
        </Text>
      </View>

      {/* Footer de la Tarjeta (Titular y Vencimiento) */}
      <View style={styles.cardBottomRow}>
        <View style={styles.cardCol}>
          <Text style={styles.metaLabel}>TITULAR DE LA TARJETA</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {cardHolder.trim() || 'NOMBRE DEL TITULAR'}
          </Text>
        </View>

        <View style={[styles.cardCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.metaLabel}>VENCE</Text>
          <Text style={styles.metaValue}>{expiry.trim() || 'MM/AA'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 190,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#3525CD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGlow1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(79, 70, 229, 0.45)',
  },
  cardGlow2: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  chipAndContactless: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emvChip: {
    width: 36,
    height: 26,
    borderRadius: 5,
    backgroundColor: '#EAB308',
    borderWidth: 1,
    borderColor: '#CA8A04',
    padding: 3,
    justifyContent: 'space-around',
  },
  emvLine1: {
    height: 1,
    backgroundColor: '#A16207',
    width: '100%',
  },
  emvLine2: {
    height: 1,
    backgroundColor: '#A16207',
    width: '60%',
  },
  brandBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  numberBox: {
    zIndex: 2,
    marginVertical: 4,
  },
  cardNumberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardCol: {
    gap: 2,
  },
  metaLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  metaValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    maxWidth: 200,
  },
});

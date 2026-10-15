import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';
import { formatPricePEN } from '@/data/events';
import { paymentService } from '../services/paymentService';
import type { InstallmentOption } from '../types/payment.types';

interface InstallmentsSelectorProps {
  totalAmount: number;
  selectedInstallments: number;
  onSelectInstallments: (count: number) => void;
}

export const InstallmentsSelector: React.FC<InstallmentsSelectorProps> = ({
  totalAmount,
  selectedInstallments,
  onSelectInstallments,
}) => {
  const options = paymentService.calculateInstallments(totalAmount);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="calendar-outline" size={17} color={Eventia.primary} />
        <Text style={styles.title}>Planes de Cuotas (Mercado Pago)</Text>
      </View>

      <View style={styles.optionsList}>
        {options.map((opt: InstallmentOption) => {
          const isSelected = selectedInstallments === opt.installments;
          return (
            <TouchableOpacity
              key={opt.installments}
              activeOpacity={0.8}
              onPress={() => onSelectInstallments(opt.installments)}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}>
              <View style={styles.radioRow}>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <View>
                  <Text style={[styles.optionMainText, isSelected && styles.optionMainTextSelected]}>
                    {opt.installments}x de {formatPricePEN(opt.amountPerInstallment)}
                  </Text>
                  <Text style={styles.optionSubText}>{opt.interestText}</Text>
                </View>
              </View>

              {!opt.hasInterest ? (
                <View style={styles.zeroInterestBadge}>
                  <Text style={styles.zeroInterestText}>0% INTERÉS</Text>
                </View>
              ) : (
                <Text style={styles.totalCalcText}>Total: {formatPricePEN(opt.totalAmount)}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
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
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionsList: {
    gap: 8,
  },
  optionCard: {
    backgroundColor: '#1E2024',
    borderWidth: 1.5,
    borderColor: '#2E3135',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardSelected: {
    borderColor: '#818CF8',
    backgroundColor: '#1E1B4B',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#818CF8',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#818CF8',
  },
  optionMainText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionMainTextSelected: {
    color: '#818CF8',
  },
  optionSubText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  zeroInterestBadge: {
    backgroundColor: '#133526',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  zeroInterestText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
  },
  totalCalcText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';

interface CheckoutStepperProps {
  currentStep?: 1 | 2 | 3;
}

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ currentStep = 2 }) => {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* Step 1: Entradas (Completado) */}
        <View style={styles.stepItem}>
          <View style={[styles.circle, styles.circleCompleted]}>
            <Ionicons name="checkmark" size={14} color="#34D399" />
          </View>
          <Text style={[styles.label, styles.labelCompleted]}>1. Entradas</Text>
        </View>

        <View style={[styles.connector, styles.connectorActive]} />

        {/* Step 2: Pago (Activo) */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.circle,
              currentStep >= 2 ? styles.circleActive : styles.circlePending,
            ]}>
            <Ionicons
              name="card-outline"
              size={13}
              color={currentStep >= 2 ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
          <Text
            style={[
              styles.label,
              currentStep >= 2 ? styles.labelActive : styles.labelPending,
            ]}>
            2. Pago
          </Text>
        </View>

        <View
          style={[
            styles.connector,
            currentStep >= 3 ? styles.connectorActive : styles.connectorPending,
          ]}
        />

        {/* Step 3: Listo (Pendiente) */}
        <View style={[styles.stepItem, currentStep < 3 && styles.itemDimmed]}>
          <View
            style={[
              styles.circle,
              currentStep === 3 ? styles.circleActive : styles.circlePending,
            ]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={14}
              color={currentStep === 3 ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
          <Text
            style={[
              styles.label,
              currentStep === 3 ? styles.labelActive : styles.labelPending,
            ]}>
            3. Listo
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#161719',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2E3135',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemDimmed: {
    opacity: 0.6,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: '#133526',
  },
  circleActive: {
    backgroundColor: '#4F46E5',
  },
  circlePending: {
    backgroundColor: '#2A2D32',
  },
  connector: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    borderRadius: 1,
  },
  connectorActive: {
    backgroundColor: '#818CF8',
  },
  connectorPending: {
    backgroundColor: '#374151',
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelCompleted: {
    color: '#34D399',
    fontWeight: '700',
  },
  labelActive: {
    color: '#818CF8',
    fontWeight: '800',
  },
  labelPending: {
    color: '#94A3B8',
    fontWeight: '500',
  },
});

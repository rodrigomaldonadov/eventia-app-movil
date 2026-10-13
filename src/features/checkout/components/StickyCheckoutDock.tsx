import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';
import { formatPricePEN } from '@/data/events';

interface StickyCheckoutDockProps {
  total: number;
  onPressPay: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  buttonText?: string;
}

export const StickyCheckoutDock: React.FC<StickyCheckoutDockProps> = ({
  total,
  onPressPay,
  isLoading = false,
  disabled = false,
  buttonText = 'Pagar y Generar Entradas',
}) => {
  return (
    <View style={styles.dock}>
      <View style={styles.inner}>
        <View style={styles.totalCol}>
          <Text style={styles.totalCaption}>TOTAL A PAGAR</Text>
          <Text style={styles.totalAmount}>{formatPricePEN(total)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressPay}
          disabled={disabled || isLoading}
          style={[
            styles.payButton,
            (disabled || isLoading) && styles.payButtonDisabled,
          ]}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={17} color="#FFFFFF" />
              <Text style={styles.payButtonText}>{buttonText}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  inner: {
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  totalCol: {
    gap: 1,
  },
  totalCaption: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: Eventia.primary,
    fontVariant: ['tabular-nums'],
  },
  payButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Eventia.primary,
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
  payButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

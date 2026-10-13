import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';
import { formatPricePEN } from '@/data/events';
import type { PaymentTransactionResponse } from '../types/payment.types';

interface PaymentProcessingModalProps {
  visible: boolean;
  isProcessing: boolean;
  result: PaymentTransactionResponse | null;
  onSuccess: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  visible,
  isProcessing,
  result,
  onSuccess,
  onRetry,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {isProcessing ? (
            /* Estado 1: Procesando Pago Seguro */
            <View style={styles.centerContent}>
              <View style={styles.loadingCircle}>
                <ActivityIndicator size="large" color={Eventia.primary} />
              </View>
              <Text style={styles.title}>Procesando Pago Seguro</Text>
              <Text style={styles.subtitle}>
                Conectando con la pasarela y validando autorización con tu entidad financiera...
              </Text>
              <View style={styles.sslBadge}>
                <Ionicons name="lock-closed" size={14} color="#006E4B" />
                <Text style={styles.sslText}>Cifrado TLS 1.3 de extremo a extremo</Text>
              </View>
            </View>
          ) : result?.status === 'approved' ? (
            /* Estado 2: Pago Aprobado */
            <View style={styles.centerContent}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={36} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>¡Transacción Aprobada!</Text>
              <Text style={styles.amountHighlight}>
                {formatPricePEN(result.amount)}
              </Text>

              <View style={styles.receiptBox}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Cód. Autorización:</Text>
                  <Text style={styles.receiptValue}>{result.authorizationCode || 'AUTH-OK'}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>ID de Transacción:</Text>
                  <Text style={styles.receiptValue}>{result.transactionId}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Cuotas:</Text>
                  <Text style={styles.receiptValue}>{result.installments || 1} cuota(s)</Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.8} onPress={onSuccess} style={styles.primaryButton}>
                <Ionicons name="ticket-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Ver Mis Entradas y Pases</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Estado 3: Pago Rechazado o Error */
            <View style={styles.centerContent}>
              <View style={styles.errorIconCircle}>
                <Ionicons name="close" size={36} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Pago No Procesado</Text>
              <Text style={styles.errorDescription}>
                {result?.statusDetail || 'La entidad bancaria no pudo autorizar la transacción.'}
              </Text>

              <View style={styles.actionButtonsCol}>
                <TouchableOpacity activeOpacity={0.8} onPress={onRetry} style={styles.primaryButton}>
                  <Ionicons name="refresh" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Reintentar Transacción</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Cambiar Método de Pago</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  centerContent: {
    alignItems: 'center',
    gap: 12,
  },
  loadingCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#006E4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  errorIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C30',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  amountHighlight: {
    fontSize: 22,
    fontWeight: '900',
    color: Eventia.primary,
  },
  sslBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 8,
  },
  sslText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#006E4B',
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginVertical: 4,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  receiptValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B1C30',
    fontVariant: ['tabular-nums'],
  },
  errorDescription: {
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionButtonsCol: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Eventia.primary,
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});

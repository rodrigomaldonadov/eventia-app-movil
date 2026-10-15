import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';

interface TicketQrModalProps {
  visible: boolean;
  orderNumber: string;
  eventTitle: string;
  buyerName: string;
  qrCode: string;
  onClose: () => void;
}

export const TicketQrModal: React.FC<TicketQrModalProps> = ({
  visible,
  orderNumber,
  eventTitle,
  buyerName,
  qrCode,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.tag}>ACCESO GENERAL VERIFICADO</Text>
              <Text style={styles.orderNumberText}>Orden #{orderNumber}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={22} color="#0B1C30" />
            </TouchableOpacity>
          </View>

          {/* Event Title */}
          <Text style={styles.eventTitle} numberOfLines={2}>
            {eventTitle}
          </Text>
          <Text style={styles.buyerSubtitle}>Titular: {buyerName}</Text>

          {/* Large QR Display */}
          <View style={styles.qrContainer}>
            <View style={styles.qrBorder}>
              <Ionicons name="qr-code" size={170} color="#0B1C30" />
            </View>
            <View style={styles.dynamicPulseRow}>
              <View style={styles.greenPulse} />
              <Text style={styles.dynamicPulseText}>
                Código dinámico activo • Brillo al 100%
              </Text>
            </View>
          </View>

          {/* Code Text & Hint */}
          <View style={styles.codeTextBox}>
            <Text style={styles.codeText}>{qrCode}</Text>
          </View>
          <Text style={styles.instruction}>
            Presenta esta pantalla directamente en los torniquetes o escáneres del recinto.
          </Text>

          <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Cerrar Escáner</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: {
    fontSize: 10,
    fontWeight: '800',
    color: Eventia.primary,
    letterSpacing: 0.8,
  },
  orderNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B1C30',
  },
  closeBtn: {
    padding: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C30',
    textAlign: 'center',
    marginTop: 2,
  },
  buyerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  qrBorder: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  dynamicPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenPulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  dynamicPulseText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
  },
  codeTextBox: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  codeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  instruction: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 260,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: Eventia.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

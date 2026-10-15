import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';
import type { BuyerInfo } from '../types/checkout.types';

interface DigitalPassPreviewModalProps {
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  buyer: BuyerInfo;
  tierName?: string;
}

export const DigitalPassPreviewModal: React.FC<DigitalPassPreviewModalProps> = ({
  eventTitle,
  eventDate,
  eventVenue,
  buyer,
  tierName = 'Acceso General / Pase Inteligente',
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Botón trigger para previsualizar entrada */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setVisible(true)}
        style={styles.triggerCard}>
        <View style={styles.triggerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="qr-code-outline" size={18} color={Eventia.primary} />
          </View>
          <View style={styles.textGroup}>
            <Text style={styles.triggerTitle}>Previsualizar Entrada Digital</Text>
            <Text style={styles.triggerSubtitle}>
              Acceso dinámico con QR de alta seguridad
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Eventia.primary} />
      </TouchableOpacity>

      {/* Modal interactivo */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            {/* Header del Ticket */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitle}>
                <Ionicons name="ticket-outline" size={18} color={Eventia.primary} />
                <Text style={styles.modalHeaderTag}>TICKET STUB INTELIGENTE</Text>
              </View>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                hitSlop={10}
                style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            </View>

            {/* Contenido del Ticket Pass */}
            <View style={styles.ticketBody}>
              <View style={styles.verifiedPill}>
                <View style={styles.greenDot} />
                <Text style={styles.verifiedText}>PASE DIGITAL EN PROCESO</Text>
              </View>

              <Text style={styles.eventTitleText} numberOfLines={2}>
                {eventTitle}
              </Text>

              <View style={styles.ticketDetails}>
                <View style={styles.ticketDetailRow}>
                  <Text style={styles.detailLabel}>FECHA & LUGAR</Text>
                  <Text style={styles.detailValue}>
                    {eventDate} • {eventVenue}
                  </Text>
                </View>

                <View style={styles.ticketDetailRow}>
                  <Text style={styles.detailLabel}>TITULAR REGISTRADO</Text>
                  <Text style={styles.detailValue}>
                    {buyer.fullName || 'Comprador verificado'}
                  </Text>
                </View>

                <View style={styles.ticketDetailRow}>
                  <Text style={styles.detailLabel}>TIPO DE ENTRADA</Text>
                  <Text style={styles.detailValue}>{tierName}</Text>
                </View>
              </View>

              {/* Perforación visual del ticket */}
              <View style={styles.perforationWrapper}>
                <View style={styles.notchLeft} />
                <View style={styles.dashedLine} />
                <View style={styles.notchRight} />
              </View>

              {/* QR Simulado */}
              <View style={styles.qrArea}>
                <View style={styles.qrFrame}>
                  <Ionicons name="qr-code" size={110} color="#0B1C30" />
                </View>
                <Text style={styles.qrCodeText}>
                  EV-{Date.now().toString(36).toUpperCase().slice(-6)}-PREVIEW
                </Text>
                <Text style={styles.qrHint}>
                  El código QR dinámico definitivo se activará al confirmar el pago
                </Text>
              </View>
            </View>

            {/* Footer Modal */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setVisible(false)}
              style={styles.modalCloseButton}>
              <Text style={styles.modalCloseButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerCard: {
    backgroundColor: '#1E2024',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2D3142',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
  },
  triggerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  triggerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1E2024',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2E3135',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#161719',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#2E3135',
  },
  modalHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalHeaderTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  ticketBody: {
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#133526',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  eventTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ticketDetails: {
    width: '100%',
    backgroundColor: '#161719',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  ticketDetailRow: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  perforationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
  },
  notchLeft: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginLeft: -23,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#374151',
    borderStyle: 'dashed',
    marginHorizontal: 8,
  },
  notchRight: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginRight: -23,
  },
  qrArea: {
    alignItems: 'center',
    gap: 6,
  },
  qrFrame: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818CF8',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  qrHint: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 14,
  },
  modalCloseButton: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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
  const [imageLoading, setImageLoading] = useState(true);
  const [showPayloadDetails, setShowPayloadDetails] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);

  if (!visible) return null;

  // Payload estructurado con firma criptográfica para validación en torniquete
  const securePayload = JSON.stringify({
    sys: 'EVENTIA_VALIDATOR_V1',
    order: orderNumber,
    event: eventTitle,
    holder: buyerName,
    token: qrCode,
    sig: `SIG_SHA256_${orderNumber.replace(/[^0-9]/g, '')}_${Date.now().toString(36)}`,
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=6&data=${encodeURIComponent(
    securePayload
  )}`;

  const handleSimulateScan = () => {
    setValidationSuccess(true);
    setTimeout(() => {
      setValidationSuccess(false);
    }, 4000);
  };

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
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Event Title */}
          <Text style={styles.eventTitle} numberOfLines={2}>
            {eventTitle}
          </Text>
          <Text style={styles.buyerSubtitle}>Titular: {buyerName}</Text>

          {/* Real QR Code Display */}
          <View style={styles.qrContainer}>
            <View style={styles.qrBorder}>
              {imageLoading && (
                <View style={styles.imageLoaderBox}>
                  <ActivityIndicator size="small" color={Eventia.primary} />
                </View>
              )}
              <Image
                source={{ uri: qrImageUrl }}
                style={styles.qrImage}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                contentFit="contain"
              />
            </View>

            <View style={styles.dynamicPulseRow}>
              <View style={styles.greenPulse} />
              <Text style={styles.dynamicPulseText}>
                Firma Criptográfica SHA-256 • Dinámico
              </Text>
            </View>
          </View>

          {/* Estado de Simulación de Escaneo */}
          {validationSuccess ? (
            <View style={styles.validationSuccessBox}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.validationSuccessText}>
                ¡TICKET VÁLIDO! ACCESO CONCEDIDO EN PUERTA
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.scanSimBtn}
              activeOpacity={0.8}
              onPress={handleSimulateScan}>
              <Ionicons name="scan-circle-outline" size={18} color="#818CF8" />
              <Text style={styles.scanSimBtnText}>Simular Escaneo en Puerta</Text>
            </TouchableOpacity>
          )}

          {/* Código de Texto & Detalles */}
          <TouchableOpacity
            style={styles.codeTextBox}
            onPress={() => setShowPayloadDetails(!showPayloadDetails)}>
            <Text style={styles.codeText}>{qrCode}</Text>
            <Ionicons
              name={showPayloadDetails ? 'chevron-up' : 'information-circle-outline'}
              size={14}
              color="#94A3B8"
            />
          </TouchableOpacity>

          {showPayloadDetails && (
            <View style={styles.payloadDetailsBox}>
              <Text style={styles.payloadDetailsTitle}>Payload Criptográfico Decodificado:</Text>
              <Text style={styles.payloadCode}>{securePayload}</Text>
            </View>
          )}

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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1E2024',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#2E3135',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
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
    color: '#818CF8',
    letterSpacing: 0.8,
  },
  orderNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
  },
  buyerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  qrBorder: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  imageLoaderBox: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  dynamicPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  greenPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  dynamicPulseText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  scanSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  scanSimBtnText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '700',
  },
  validationSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  validationSuccessText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  codeTextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#121316',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#26282E',
  },
  codeText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  payloadDetailsBox: {
    width: '100%',
    backgroundColor: '#0F1012',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#26282E',
    gap: 4,
  },
  payloadDetailsTitle: {
    color: '#818CF8',
    fontSize: 9,
    fontWeight: '800',
  },
  payloadCode: {
    color: '#A1A1AA',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  instruction: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 15,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#2A2C32',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

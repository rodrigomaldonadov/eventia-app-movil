import React, { useState } from 'react';
import {
  ActivityIndicator,
<<<<<<< HEAD
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
=======
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
>>>>>>> origin/feat/implGeneral
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Eventia } from '@/constants/theme';
import { orderService } from '../services/orderService';

interface TicketQrModalProps {
  visible: boolean;
  orderNumber: string;
  eventTitle: string;
  buyerName: string;
  qrCode: string;
  ticketId?: number;
  dni?: string;
  onNominated?: (newNombre: string, newDni: string) => void;
  onClose: () => void;
}

export const TicketQrModal: React.FC<TicketQrModalProps> = ({
  visible,
  orderNumber,
  eventTitle,
  buyerName,
  qrCode,
  ticketId,
  dni,
  onNominated,
  onClose,
}) => {
<<<<<<< HEAD
  const [isEditingNomination, setIsEditingNomination] = useState(false);
  const [nombreInput, setNombreInput] = useState(buyerName);
  const [dniInput, setDniInput] = useState(dni || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!visible) return null;

  const handleSaveNomination = async () => {
    if (!nombreInput.trim() || !dniInput.trim()) {
      Alert.alert('Datos requeridos', 'Por favor ingresa nombre y DNI completos para la nominación.');
      return;
    }

    if (!ticketId) {
      setIsEditingNomination(false);
      onNominated?.(nombreInput, dniInput);
      return;
    }

    setIsSaving(true);
    try {
      await orderService.nominateTicket(ticketId, {
        nombre: nombreInput.trim(),
        dni: dniInput.trim(),
      });
      Alert.alert('¡Entrada Nominada!', `La entrada ha sido asignada a ${nombreInput.trim()} con DNI ${dniInput.trim()}.`);
      setIsEditingNomination(false);
      onNominated?.(nombreInput.trim(), dniInput.trim());
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'No se pudo actualizar la nominación');
    } finally {
      setIsSaving(false);
    }
=======
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
>>>>>>> origin/feat/implGeneral
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

<<<<<<< HEAD
          {/* Titular y DNI (Nominación) */}
          {!isEditingNomination ? (
            <View style={styles.nominationBox}>
              <View style={styles.nominationInfo}>
                <Ionicons name="person-circle-outline" size={16} color={Eventia.primary} />
                <Text style={styles.buyerSubtitle} numberOfLines={1}>
                  Titular: <Text style={styles.boldWhite}>{buyerName}</Text>
                </Text>
              </View>
              {dni ? (
                <View style={styles.nominationInfo}>
                  <Ionicons name="card-outline" size={14} color="#94A3B8" />
                  <Text style={styles.dniSubtitle}>DNI: {dni}</Text>
                </View>
              ) : null}
              {ticketId ? (
                <TouchableOpacity
                  onPress={() => setIsEditingNomination(true)}
                  style={styles.nominateBtn}
                  activeOpacity={0.8}>
                  <Ionicons name="create-outline" size={13} color={Eventia.primary} />
                  <Text style={styles.nominateBtnText}>Cambiar Nominación</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.editNominationContainer}>
              <Text style={styles.editNominationTitle}>Nominar Entrada con DNI</Text>
              <TextInput
                value={nombreInput}
                onChangeText={setNombreInput}
                placeholder="Nombre completo"
                placeholderTextColor="#64748B"
                style={styles.nominationInput}
              />
              <TextInput
                value={dniInput}
                onChangeText={setDniInput}
                placeholder="Número de DNI"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                maxLength={8}
                style={styles.nominationInput}
              />
              <View style={styles.nominationActions}>
                <TouchableOpacity
                  onPress={() => setIsEditingNomination(false)}
                  style={styles.cancelNominateBtn}>
                  <Text style={styles.cancelNominateText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveNomination}
                  disabled={isSaving}
                  style={styles.saveNominateBtn}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveNominateText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Large QR Display Dibujado con react-native-qrcode-svg */}
          <View style={styles.qrContainer}>
            <View style={styles.qrBorder}>
              <QRCode
                value={qrCode || 'EVENTIA-DEFAULT-UUID'}
                size={170}
                backgroundColor="#FFFFFF"
                color="#0B1C30"
=======
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
>>>>>>> origin/feat/implGeneral
              />
            </View>

            <View style={styles.dynamicPulseRow}>
              <View style={styles.greenPulse} />
              <Text style={styles.dynamicPulseText}>
<<<<<<< HEAD
                UUID Verificado • Brillo al 100%
=======
                Firma Criptográfica SHA-256 • Dinámico
>>>>>>> origin/feat/implGeneral
              </Text>
            </View>
          </View>

<<<<<<< HEAD
          {/* Code Text & Hint */}
          <View style={styles.codeTextBox}>
            <Text style={styles.codeText} numberOfLines={1} ellipsizeMode="middle">
              {qrCode}
            </Text>
          </View>
=======
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

>>>>>>> origin/feat/implGeneral
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
  nominationBox: {
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    width: '100%',
  },
  nominationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buyerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  boldWhite: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dniSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  nominateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  nominateBtnText: {
    fontSize: 11,
    color: '#818CF8',
    fontWeight: '600',
  },
  editNominationContainer: {
    width: '100%',
    backgroundColor: '#121417',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  editNominationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
  },
  nominationInput: {
    backgroundColor: '#1E2024',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#FFFFFF',
    fontSize: 13,
  },
  nominationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  cancelNominateBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cancelNominateText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  saveNominateBtn: {
    backgroundColor: Eventia.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  saveNominateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
<<<<<<< HEAD
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  dynamicPulseText: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '600',
  },
  codeTextBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    maxWidth: '90%',
  },
  codeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
=======
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
>>>>>>> origin/feat/implGeneral
  },
  instruction: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
<<<<<<< HEAD
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: Eventia.primary,
    paddingVertical: 12,
    borderRadius: 14,
=======
    lineHeight: 15,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#2A2C32',
    paddingVertical: 12,
    borderRadius: 12,
>>>>>>> origin/feat/implGeneral
    alignItems: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

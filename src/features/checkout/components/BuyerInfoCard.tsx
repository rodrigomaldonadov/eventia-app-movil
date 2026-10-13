import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';
import type { BuyerInfo } from '../types/checkout.types';

interface BuyerInfoCardProps {
  buyer: BuyerInfo;
  onChange: (updated: BuyerInfo) => void;
  isVerified?: boolean;
}

export const BuyerInfoCard: React.FC<BuyerInfoCardProps> = ({
  buyer,
  onChange,
  isVerified = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={isVerified ? '#006E4B' : Eventia.primary}
          />
          <Text style={styles.title}>Datos del Comprador</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.badge, !isVerified && styles.badgePending]}>
            <Text style={[styles.badgeText, !isVerified && styles.badgeTextPending]}>
              {isVerified ? 'VERIFICADO' : 'POR CONFIRMAR'}
            </Text>
          </View>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editBtn}>
            <Ionicons
              name={isEditing ? 'checkmark' : 'create-outline'}
              size={16}
              color={Eventia.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {!isEditing ? (
        /* Vista de lectura formateada como en Vista 1.html */
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Titular:</Text>
            <Text style={styles.infoValue}>{buyer.fullName || 'No especificado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Correo:</Text>
            <Text style={styles.infoValue}>{buyer.email || 'No especificado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DNI / Documento:</Text>
            <Text style={styles.infoValue}>
              {buyer.documentNumber
                ? `${buyer.documentType} ${buyer.documentNumber}`
                : 'Pendiente de ingresar'}
            </Text>
          </View>
        </View>
      ) : (
        /* Formulario editable para ajustar datos */
        <View style={styles.editForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre Completo / Titular</Text>
            <TextInput
              value={buyer.fullName}
              onChangeText={(text) => onChange({ ...buyer, fullName: text })}
              placeholder="Ej. Daniela Morales"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo electrónico (para envío de boletos)</Text>
            <TextInput
              value={buyer.email}
              onChangeText={(text) => onChange({ ...buyer, email: text })}
              placeholder="tu@correo.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DNI / Carné de Extranjería / Pasaporte</Text>
            <TextInput
              value={buyer.documentNumber}
              onChangeText={(text) => onChange({ ...buyer, documentNumber: text })}
              placeholder="Número de documento"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1C30',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#006E4B',
    letterSpacing: 0.5,
  },
  badgeTextPending: {
    color: '#B45309',
  },
  editBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#EFF4FF',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B1C30',
  },
  editForm: {
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0B1C30',
  },
});

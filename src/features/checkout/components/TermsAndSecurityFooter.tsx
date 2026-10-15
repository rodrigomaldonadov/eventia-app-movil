import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';

interface TermsAndSecurityFooterProps {
  termsAccepted: boolean;
  onToggleTerms: (accepted: boolean) => void;
}

export const TermsAndSecurityFooter: React.FC<TermsAndSecurityFooterProps> = ({
  termsAccepted,
  onToggleTerms,
}) => {
  return (
    <View style={styles.container}>
      {/* Checkbox de Términos y Condiciones */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onToggleTerms(!termsAccepted)}
        style={styles.checkboxRow}>
        <View
          style={[
            styles.checkbox,
            termsAccepted && styles.checkboxActive,
          ]}>
          {termsAccepted && (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          )}
        </View>

        <Text style={styles.termsText}>
          Acepto los{' '}
          <Text style={styles.linkText}>Términos del Servicio</Text>, la{' '}
          <Text style={styles.linkText}>Política de Reembolsos</Text> y confirmo la
          veracidad de los datos suministrados.
        </Text>
      </TouchableOpacity>

      {/* Sello de Seguridad SSL & PCI-DSS */}
      <View style={styles.securitySeal}>
        <Ionicons name="lock-closed" size={16} color="#006E4B" />
        <Text style={styles.securityText}>
          Encriptación SSL de 256 bits y certificación PCI-DSS Nivel 1
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#4B5563',
    backgroundColor: '#1E2024',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#818CF8',
    borderColor: '#818CF8',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  linkText: {
    color: '#818CF8',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  securitySeal: {
    backgroundColor: '#1E2024',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2E3135',
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
    flexShrink: 1,
  },
});

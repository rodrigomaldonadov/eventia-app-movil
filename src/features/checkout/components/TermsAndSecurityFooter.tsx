import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
});

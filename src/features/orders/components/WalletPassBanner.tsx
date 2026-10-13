import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';

export const WalletPassBanner: React.FC = () => {
  const handleAddToWallet = () => {
    Alert.alert(
      'Pase Inteligente Añadido',
      'Tu entrada ha sido sincronizada con el servicio de Wallet para acceso sin conexión a internet.',
      [{ text: 'Listo' }],
    );
  };

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.leftCol}>
        <View style={styles.iconBox}>
          <Ionicons name="wallet-outline" size={20} color={Eventia.primary} />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>Pases en Apple / Google Wallet</Text>
          <Text style={styles.subtitle}>Accede sin conexión en el recinto</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleAddToWallet}
        style={styles.actionBtn}>
        <Text style={styles.btnText}>Añadir</Text>
        <Ionicons name="arrow-forward" size={13} color={Eventia.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    backgroundColor: '#EFF4FF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  actionBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Eventia.primary,
  },
});

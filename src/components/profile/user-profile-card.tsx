import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';

export const FOTO_PERFIL_POR_DEFECTO =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80';

export interface PropiedadesTarjetaUsuario {
  nombreCompleto?: string;
  correo?: string;
  urlFoto?: string;
  alPresionarCambiarFoto: () => void;
}

export function TarjetaPerfilUsuario({
  nombreCompleto = 'Daniela Morales',
  correo = 'daniela@eventia.io',
  urlFoto,
  alPresionarCambiarFoto,
}: PropiedadesTarjetaUsuario) {
  const tema = useTheme();
  const temaEventia = useEventiaTheme();

  return (
    <View style={[estilos.tarjeta, { backgroundColor: tema.backgroundElement }]}>
      <View style={estilos.filaInformacion}>
        {/* Avatar */}
        <Pressable
          accessibilityLabel="Cambiar foto de perfil"
          accessibilityRole="button"
          onPress={alPresionarCambiarFoto}
          style={({ pressed }) => [
            estilos.contenedorAvatar,
            pressed && estilos.avatarPresionado,
          ]}>
          <Image
            source={{ uri: urlFoto || FOTO_PERFIL_POR_DEFECTO }}
            style={estilos.imagenAvatar}
          />
          <View
            style={[
              estilos.insigniaCamara,
              { backgroundColor: temaEventia.primaryContainer, borderColor: tema.backgroundElement },
            ]}>
            <Ionicons name="camera" size={12} color="#FFFFFF" />
          </View>
        </Pressable>

        {/* Datos del usuario */}
        <View style={estilos.detallesTexto}>
          <ThemedText type="smallBold" style={estilos.nombreUsuario}>
            {nombreCompleto}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={estilos.correoUsuario}>
            {correo}
          </ThemedText>

          <View
            style={[
              estilos.pildoraVerificada,
              { backgroundColor: temaEventia.successBg },
            ]}>
            <View
              style={[
                estilos.puntoVerificado,
                { backgroundColor: temaEventia.successDot },
              ]}
            />
            <ThemedText
              type="small"
              style={[estilos.textoPildora, { color: temaEventia.successText }]}>
              Miembro Verificado
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    width: '100%',
    borderRadius: 20,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filaInformacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  contenedorAvatar: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  avatarPresionado: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  imagenAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
  },
  insigniaCamara: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  detallesTexto: {
    flex: 1,
    gap: 3,
  },
  nombreUsuario: {
    fontSize: 17,
  },
  correoUsuario: {
    fontSize: 13,
  },
  pildoraVerificada: {
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 12,
    gap: 5,
  },
  puntoVerificado: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  textoPildora: {
    fontSize: 11,
    fontWeight: '600',
  },
});

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
  alPresionarEditar: () => void;
  alPresionarCambiarFoto: () => void;
}

export function TarjetaPerfilUsuario({
  nombreCompleto = 'Daniela Morales',
  correo = 'daniela@eventia.io',
  urlFoto,
  alPresionarEditar,
  alPresionarCambiarFoto,
}: PropiedadesTarjetaUsuario) {
  const tema = useTheme();
  const temaEventia = useEventiaTheme();

  return (
    <View style={[estilos.tarjeta, { backgroundColor: tema.backgroundElement }]}>
      <View style={estilos.filaInformacion}>
        {/* Avatar interactivo */}
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
              { backgroundColor: temaEventia.primary, borderColor: tema.backgroundElement },
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

      {/* Botón para editar datos personales */}
      <Pressable
        accessibilityLabel="Editar correo y contraseña"
        accessibilityRole="button"
        onPress={alPresionarEditar}
        style={({ pressed }) => [
          estilos.botonEditar,
          { backgroundColor: temaEventia.surfaceLow },
          pressed && estilos.botonEditarPresionado,
        ]}>
        <Ionicons name="pencil" size={17} color={temaEventia.primary} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
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
  botonEditar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.two,
  },
  botonEditarPresionado: {
    opacity: 0.7,
  },
});

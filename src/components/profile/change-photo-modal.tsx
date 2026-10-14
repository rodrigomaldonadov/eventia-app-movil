import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Lista de avatares modernos y curados de muestra para que el usuario
 * pueda elegir uno fácilmente como alternativa.
 */
export const AVATARES_PREDEFINIDOS = [
  {
    id: 'avatar-1',
    titulo: 'Daniela (Por defecto)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-2',
    titulo: 'Carlos (Casual)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-3',
    titulo: 'Alex (Creativo)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-4',
    titulo: 'Sofía (Minimalista)',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-5',
    titulo: 'Mateo (Moderno)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-6',
    titulo: 'Valentina (Boho)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  },
];

export interface PropiedadesModalCambiarFotoPerfil {
  visible: boolean;
  fotoActual?: string;
  alCerrar: () => void;
  alGuardarNuevaFoto: (nuevaFotoUrl: string) => Promise<void> | void;
}

/**
 * Modal para cambiar la foto de perfil mediante galería, cámara o avatares predefinidos.
 */
export function ModalCambiarFotoPerfil({
  visible,
  fotoActual,
  alCerrar,
  alGuardarNuevaFoto,
}: PropiedadesModalCambiarFotoPerfil) {
  const tema = useTheme();
  const temaEventia = useEventiaTheme();

  const [fotoSeleccionada, setFotoSeleccionada] = useState(
    fotoActual || AVATARES_PREDEFINIDOS[0].url,
  );
  const [urlPersonalizada, setUrlPersonalizada] = useState('');
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [cargandoImagen, setCargandoImagen] = useState(false);

  useEffect(() => {
    if (visible) {
      setFotoSeleccionada(fotoActual || AVATARES_PREDEFINIDOS[0].url);
      setUrlPersonalizada('');
      setErrorCarga(null);
      setGuardando(false);
      setCargandoImagen(false);
    }
  }, [visible, fotoActual]);

  const cargarFotoDesdeGaleria = async () => {
    try {
      setErrorCarga(null);
      setCargandoImagen(true);

      if (Platform.OS !== 'web') {
        const estadoPermisos = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!estadoPermisos.granted) {
          setErrorCarga('Se requieren permisos de acceso a las fotos para continuar.');
          setCargandoImagen(false);
          return;
        }
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        const uriFoto = resultado.assets[0].uri;
        setFotoSeleccionada(uriFoto);
        setUrlPersonalizada('');
      }
    } catch (error: any) {
      console.error('[ModalCambiarFoto] Error al abrir la galería:', error);
      setErrorCarga('No se pudo cargar la imagen seleccionada.');
    } finally {
      setCargandoImagen(false);
    }
  };

  const tomarFotoConCamara = async () => {
    try {
      setErrorCarga(null);
      setCargandoImagen(true);

      if (Platform.OS !== 'web') {
        const estadoPermisos = await ImagePicker.requestCameraPermissionsAsync();
        if (!estadoPermisos.granted) {
          setErrorCarga('Se requieren permisos de cámara para tomar una foto.');
          setCargandoImagen(false);
          return;
        }
      }

      const resultado = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        const uriFoto = resultado.assets[0].uri;
        setFotoSeleccionada(uriFoto);
        setUrlPersonalizada('');
      }
    } catch (error: any) {
      console.error('[ModalCambiarFoto] Error al abrir la cámara:', error);
      setErrorCarga('No se pudo tomar la foto con la cámara.');
    } finally {
      setCargandoImagen(false);
    }
  };

  const seleccionarAvatarDeGaleria = (url: string) => {
    setFotoSeleccionada(url);
    setUrlPersonalizada('');
    setErrorCarga(null);
  };

  const aplicarUrlPersonalizada = (url: string) => {
    setUrlPersonalizada(url);
    setErrorCarga(null);
    if (url.trim().length > 10) {
      setFotoSeleccionada(url.trim());
    }
  };

  const confirmarCambioDeFoto = async () => {
    try {
      setGuardando(true);
      await alGuardarNuevaFoto(fotoSeleccionada);
      alCerrar();
    } catch (error) {
      console.error('[ModalCambiarFoto] Error al guardar la nueva foto:', error);
      setErrorCarga('Ocurrió un error al guardar la foto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={alCerrar}>
      <View style={estilos.fondoOscurecido}>
        <View
          style={[
            estilos.cajaModal,
            { backgroundColor: tema.backgroundElement },
          ]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Cabecera del modal */}
            <View style={estilos.cabecera}>
              <ThemedText type="subtitle" style={estilos.tituloModal}>
                Cambiar Foto de Perfil
              </ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={estilos.subtituloModal}>
                Carga una foto desde tu dispositivo, tómate una o elige un avatar.
              </ThemedText>
            </View>

            {/* Mensaje de error si falla la carga */}
            {errorCarga ? (
              <View
                style={[
                  estilos.alertaError,
                  { backgroundColor: temaEventia.dangerBg },
                ]}>
                <Ionicons name="alert-circle" size={18} color={temaEventia.dangerDot} />
                <ThemedText
                  type="small"
                  style={[estilos.textoError, { color: temaEventia.dangerText }]}>
                  {errorCarga}
                </ThemedText>
              </View>
            ) : null}

            <View style={estilos.seccionPrevisualizacion}>
              <View
                style={[
                  estilos.bordePrevisualizacion,
                  { borderColor: temaEventia.primary },
                ]}>
                {cargandoImagen ? (
                  <View style={estilos.cargadorImagen}>
                    <ActivityIndicator size="small" color={temaEventia.primary} />
                  </View>
                ) : (
                  <Image
                    source={{ uri: fotoSeleccionada }}
                    style={estilos.imagenPrevisualizacion}
                  />
                )}
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                Vista previa de tu avatar
              </ThemedText>
            </View>

            <ThemedText type="smallBold" style={estilos.etiquetaSeccion}>
              Cargar foto desde el dispositivo
            </ThemedText>

            <View style={estilos.filaBotonesCarga}>
              {/* Botón 1: Galería / Archivos */}
              <Pressable
                disabled={cargandoImagen}
                onPress={cargarFotoDesdeGaleria}
                style={({ pressed }) => [
                  estilos.botonAccionCarga,
                  { backgroundColor: temaEventia.surfaceLow, borderColor: temaEventia.primaryContainer },
                  pressed && { opacity: 0.75 },
                ]}>
                <Ionicons name="images-outline" size={20} color={temaEventia.primary} />
                <ThemedText
                  type="smallBold"
                  style={[estilos.textoAccionCarga, { color: temaEventia.primary }]}>
                  Elegir de Galería
                </ThemedText>
              </Pressable>

              {/* Botón 2: Cámara */}
              <Pressable
                disabled={cargandoImagen}
                onPress={tomarFotoConCamara}
                style={({ pressed }) => [
                  estilos.botonAccionCarga,
                  { backgroundColor: temaEventia.surfaceLow, borderColor: temaEventia.primaryContainer },
                  pressed && { opacity: 0.75 },
                ]}>
                <Ionicons name="camera-outline" size={20} color={temaEventia.primary} />
                <ThemedText
                  type="smallBold"
                  style={[estilos.textoAccionCarga, { color: temaEventia.primary }]}>
                  Tomar Foto
                </ThemedText>
              </Pressable>
            </View>

            <ThemedText type="smallBold" style={estilos.etiquetaSeccion}>
              O elige un avatar sugerido
            </ThemedText>

            <View style={estilos.cuadriculaAvatares}>
              {AVATARES_PREDEFINIDOS.map((avatar) => {
                const estaSeleccionado = fotoSeleccionada === avatar.url;
                return (
                  <Pressable
                    key={avatar.id}
                    onPress={() => seleccionarAvatarDeGaleria(avatar.url)}
                    style={({ pressed }) => [
                      estilos.itemAvatar,
                      estaSeleccionado && [
                        estilos.itemAvatarSeleccionado,
                        { borderColor: temaEventia.primary },
                      ],
                      pressed && { opacity: 0.8 },
                    ]}>
                    <Image source={{ uri: avatar.url }} style={estilos.miniaturaAvatar} />
                    {estaSeleccionado ? (
                      <View
                        style={[
                          estilos.checkSeleccionado,
                          { backgroundColor: temaEventia.primary },
                        ]}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={estilos.seccionUrl}>
              <ThemedText type="smallBold" style={estilos.etiquetaSeccion}>
                O pegar enlace de imagen web (URL)
              </ThemedText>
              <View
                style={[
                  estilos.cajaInputUrl,
                  { backgroundColor: tema.background, borderColor: '#CBD5E1' },
                ]}>
                <Ionicons name="link-outline" size={18} color={tema.textSecondary} />
                <TextInput
                  value={urlPersonalizada}
                  onChangeText={aplicarUrlPersonalizada}
                  placeholder="https://ejemplo.com/mifoto.jpg"
                  placeholderTextColor={tema.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[estilos.inputUrl, { color: tema.text }]}
                />
              </View>
            </View>

            <View style={estilos.filaBotones}>
              <Pressable
                onPress={alCerrar}
                style={({ pressed }) => [
                  estilos.botonCancelar,
                  pressed && { opacity: 0.7 },
                ]}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Cancelar
                </ThemedText>
              </Pressable>

              <Pressable
                disabled={guardando || cargandoImagen}
                onPress={confirmarCambioDeFoto}
                style={({ pressed }) => [
                  estilos.botonGuardar,
                  { backgroundColor: temaEventia.primary },
                  pressed && { opacity: 0.8 },
                ]}>
                {guardando ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText type="smallBold" style={estilos.textoBotonGuardar}>
                    Aplicar Foto
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondoOscurecido: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  cajaModal: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cabecera: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  tituloModal: {
    fontSize: 18,
    textAlign: 'center',
  },
  subtituloModal: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: Spacing.two,
  },
  alertaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.two,
    borderRadius: 12,
    marginBottom: Spacing.three,
  },
  textoError: {
    flex: 1,
    fontSize: 12,
  },
  seccionPrevisualizacion: {
    alignItems: 'center',
    marginBottom: Spacing.three,
    gap: 6,
  },
  bordePrevisualizacion: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cargadorImagen: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagenPrevisualizacion: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E2E8F0',
  },
  etiquetaSeccion: {
    fontSize: 12,
    marginBottom: 8,
  },
  filaBotonesCarga: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.three,
  },
  botonAccionCarga: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  textoAccionCarga: {
    fontSize: 12,
  },
  cuadriculaAvatares: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  itemAvatar: {
    position: 'relative',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },
  itemAvatarSeleccionado: {
    transform: [{ scale: 1.05 }],
  },
  miniaturaAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  checkSeleccionado: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  seccionUrl: {
    marginBottom: Spacing.three,
    gap: 6,
  },
  cajaInputUrl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    gap: 8,
  },
  inputUrl: {
    flex: 1,
    fontSize: 13,
  },
  filaBotones: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  botonCancelar: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  botonGuardar: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
    minWidth: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonGuardar: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

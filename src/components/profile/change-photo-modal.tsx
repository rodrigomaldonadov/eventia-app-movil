import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';
import { cloudinaryService } from '@/services/cloudinaryService';

export interface PropiedadesModalCambiarFotoPerfil {
  visible: boolean;
  fotoActual?: string;
  alCerrar: () => void;
  alGuardarNuevaFoto: (nuevaFotoUrl: string) => Promise<void> | void;
}

export function ModalCambiarFotoPerfil({
  visible,
  fotoActual,
  alCerrar,
  alGuardarNuevaFoto,
}: PropiedadesModalCambiarFotoPerfil) {
  const tema = useTheme();
  const temaEventia = useEventiaTheme();

  const [fotoSeleccionada, setFotoSeleccionada] = useState<string>(
    fotoActual || '',
  );
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [permisoCamaraDenegado, setPermisoCamaraDenegado] = useState(false);

  useEffect(() => {
    if (visible) {
      setFotoSeleccionada(fotoActual || '');
      setErrorCarga(null);
      setGuardando(false);
      setCargandoImagen(false);
      setPermisoCamaraDenegado(false);
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
      }
    } catch (error: any) {
      console.error('[ModalCambiarFoto] Error al abrir la galería:', error);
      setErrorCarga('No se pudo cargar la imagen seleccionada.');
    } finally {
      setCargandoImagen(false);
    }
  };

  /**
   * Sistema de gestión y solicitud de permisos para acceder a la cámara
   */
  const tomarFotoConCamara = async () => {
    try {
      setErrorCarga(null);
      setCargandoImagen(true);

      if (Platform.OS !== 'web') {
        // 1. Verificar estado actual de permisos
        const permisoActual = await ImagePicker.getCameraPermissionsAsync();
        let concedido = permisoActual.granted;

        if (!concedido) {
          // Si el sistema permite volver a solicitar el permiso de cámara
          if (permisoActual.canAskAgain) {
            const respuestaSolicitud = await ImagePicker.requestCameraPermissionsAsync();
            concedido = respuestaSolicitud.granted;
          }

          // Si el usuario denegó o está permanentemente bloqueado
          if (!concedido) {
            setPermisoCamaraDenegado(true);
            setErrorCarga('Se requiere permiso para acceder a la cámara y tomar tu foto.');
            setCargandoImagen(false);

            Alert.alert(
              'Permiso de Cámara Requerido',
              'Eventia necesita acceso a la cámara para tomar tu nueva foto de perfil. Puedes habilitar el permiso directamente en los Ajustes del dispositivo.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Abrir Ajustes',
                  onPress: () => {
                    Linking.openSettings().catch(() => {});
                  },
                },
              ]
            );
            return;
          }
        }
      }

      setPermisoCamaraDenegado(false);

      // 2. Disparar cámara con configuración optimizada para retrato/perfil
      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        const uriFoto = resultado.assets[0].uri;
        setFotoSeleccionada(uriFoto);
      }
    } catch (error: any) {
      console.error('[ModalCambiarFoto] Error al abrir la cámara:', error);
      setErrorCarga(
        Platform.OS === 'web'
          ? 'No se pudo acceder a la cámara en el navegador. Verifica los permisos de tu navegador.'
          : 'No se pudo tomar la foto con la cámara.'
      );
    } finally {
      setCargandoImagen(false);
    }
  };

  const confirmarCambioDeFoto = async () => {
    try {
      setGuardando(true);
      let urlFinal = fotoSeleccionada;

      // Si la foto es un archivo local (tomado de la cámara o galería), subirlo a Cloudinary
      if (fotoSeleccionada && !fotoSeleccionada.startsWith('http')) {
        try {
          urlFinal = await cloudinaryService.uploadImage(fotoSeleccionada);
        } catch (uploadErr) {
          console.warn('[ModalCambiarFoto] Cloudinary fallback a URI local:', uploadErr);
        }
      }

      await alGuardarNuevaFoto(urlFinal);
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
            <View style={estilos.cabecera}>
              <ThemedText type="subtitle" style={estilos.tituloModal}>
                Cambiar Foto de Perfil
              </ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={estilos.subtituloModal}>
                Carga una foto desde tu dispositivo o tómate una con la cámara.
              </ThemedText>
            </View>

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
                ) : fotoSeleccionada ? (
                  <Image
                    source={{ uri: fotoSeleccionada }}
                    style={estilos.imagenPrevisualizacion}
                  />
                ) : (
                  <View
                    style={[
                      estilos.imagenPrevisualizacion,
                      { backgroundColor: '#312E81', alignItems: 'center', justifyContent: 'center' },
                    ]}>
                    <Ionicons name="person" size={54} color="#A5B4FC" />
                  </View>
                )}
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                Vista previa de tu avatar
              </ThemedText>

              {fotoSeleccionada ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setFotoSeleccionada('')}
                  style={{ marginTop: 8, paddingVertical: 4 }}>
                  <ThemedText type="small" style={{ color: '#EF4444', textAlign: 'center', fontWeight: '600' }}>
                    Quitar foto y usar icono por defecto
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>

            <ThemedText type="smallBold" style={estilos.etiquetaSeccion}>
              Cargar foto desde el dispositivo
            </ThemedText>

            <View style={estilos.filaBotonesCarga}>
              {/* Galería */}
              <Pressable
                disabled={cargandoImagen}
                onPress={cargarFotoDesdeGaleria}
                style={({ pressed }) => [
                  estilos.botonAccionCarga,
                  { backgroundColor: temaEventia.surfaceLow, borderColor: temaEventia.primaryContainer },
                  pressed && { opacity: 0.75 },
                ]}>
                <View style={estilos.filaBotonInterno}>
                  <Ionicons name="images-outline" size={20} color={temaEventia.primary} />
                  <ThemedText
                    type="smallBold"
                    numberOfLines={1}
                    style={[estilos.textoAccionCarga, { color: temaEventia.primary }]}>
                    Elegir de Galería
                  </ThemedText>
                </View>
              </Pressable>

              {/* Cámara */}
              <Pressable
                disabled={cargandoImagen}
                onPress={tomarFotoConCamara}
                style={({ pressed }) => [
                  estilos.botonAccionCarga,
                  { backgroundColor: temaEventia.surfaceLow, borderColor: temaEventia.primaryContainer },
                  pressed && { opacity: 0.75 },
                ]}>
                <View style={estilos.filaBotonInterno}>
                  <Ionicons name="camera-outline" size={20} color={temaEventia.primary} />
                  <ThemedText
                    type="smallBold"
                    numberOfLines={1}
                    style={[estilos.textoAccionCarga, { color: temaEventia.primary }]}>
                    Tomar Foto
                  </ThemedText>
                </View>
              </Pressable>
            </View>

            {/* Aviso informativo de permiso de cámara si fue denegado */}
            {permisoCamaraDenegado ? (
              <View style={estilos.alertaPermisos}>
                <Ionicons name="videocam-off-outline" size={20} color="#D97706" />
                <View style={{ flex: 1 }}>
                  <ThemedText type="smallBold" style={{ color: '#B45309' }}>
                    Permiso de cámara requerido
                  </ThemedText>
                  <ThemedText type="small" style={{ color: '#92400E', fontSize: 11 }}>
                    Habilita el acceso en los Ajustes del dispositivo para tomar fotos.
                  </ThemedText>
                </View>
                {Platform.OS !== 'web' ? (
                  <Pressable
                    onPress={() => Linking.openSettings().catch(() => {})}
                    style={estilos.botonAbrirAjustes}>
                    <ThemedText type="smallBold" style={{ color: '#FFFFFF', fontSize: 11 }}>
                      Ajustes
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

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
                  { backgroundColor: temaEventia.primaryContainer },
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
    marginBottom: Spacing.four,
  },
  botonAccionCarga: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaBotonInterno: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textoAccionCarga: {
    fontSize: 12,
  },
  alertaPermisos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: Spacing.four,
  },
  botonAbrirAjustes: {
    backgroundColor: '#D97706',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
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


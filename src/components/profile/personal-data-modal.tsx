import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import type { DatosPersonalesCompletos } from '@/services/profile-service';

const REGEX_CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface PropiedadesModalDatosPersonales {
  visible: boolean;
  datosUsuario: DatosPersonalesCompletos;
  alCerrar: () => void;
  alGuardarNuevoCorreo: (nuevoCorreo: string) => Promise<{ exito: boolean; mensaje: string }>;
}

export function ModalDatosPersonales({
  visible,
  datosUsuario,
  alCerrar,
  alGuardarNuevoCorreo,
}: PropiedadesModalDatosPersonales) {
  const tema = useTheme();
  const temaEventia = useEventiaTheme();

  const [correo, setCorreo] = useState(datosUsuario.correo);
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setCorreo(datosUsuario.correo);
      setErrorCorreo(null);
      setMensajeExito(null);
      setGuardando(false);
    }
  }, [visible, datosUsuario]);

  const validarCorreo = (): boolean => {
    const limpio = correo.trim();
    if (!limpio) {
      setErrorCorreo('El correo electrónico no puede estar vacío.');
      return false;
    }
    if (!REGEX_CORREO_VALIDO.test(limpio)) {
      setErrorCorreo('Ingresa un formato de correo válido (ej: usuario@correo.com).');
      return false;
    }
    setErrorCorreo(null);
    return true;
  };

  const manejarGuardarCorreo = async () => {
    const esValido = validarCorreo();
    if (!esValido) return;

    const correoLimpio = correo.trim().toLowerCase();
    if (correoLimpio === datosUsuario.correo.trim().toLowerCase()) {
      setMensajeExito('El correo ingresado es el mismo que el actual.');
      return;
    }

    try {
      setGuardando(true);
      setErrorCorreo(null);
      const respuesta = await alGuardarNuevoCorreo(correoLimpio);

      if (respuesta.exito) {
        setMensajeExito('¡Correo electrónico actualizado correctamente!');
        setTimeout(() => {
          alCerrar();
        }, 1200);
      } else {
        setErrorCorreo(respuesta.mensaje || 'No se pudo actualizar el correo.');
      }
    } catch (error: any) {
      setErrorCorreo(error?.message || 'Error al actualizar el correo electrónico.');
    } finally {
      setGuardando(false);
    }
  };

  const correoHaCambiado = correo.trim().toLowerCase() !== datosUsuario.correo.trim().toLowerCase();

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
              <View
                style={[
                  estilos.iconoCabecera,
                  { backgroundColor: temaEventia.surfaceLow },
                ]}>
                <Ionicons name="person-outline" size={28} color={temaEventia.primary} />
              </View>
              <ThemedText type="subtitle" style={estilos.tituloModal}>
                Datos Personales
              </ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={estilos.subtituloModal}>
                Visualiza tu información registrada y modifica tu correo si gustas.
              </ThemedText>
            </View>

            {mensajeExito ? (
              <View
                style={[
                  estilos.alertaExito,
                  { backgroundColor: temaEventia.successBg },
                ]}>
                <Ionicons name="checkmark-circle" size={18} color={temaEventia.successDot} />
                <ThemedText
                  type="small"
                  style={[estilos.textoExito, { color: temaEventia.successText }]}>
                  {mensajeExito}
                </ThemedText>
              </View>
            ) : null}

            {/* Datos personales de solo lectura */}
            <View style={[estilos.tarjetaDatos, { backgroundColor: tema.background }]}>
              <View style={estilos.filaDato}>
                <ThemedText type="small" themeColor="textSecondary" style={estilos.etiquetaDato}>
                  Nombre Completo
                </ThemedText>
                <ThemedText type="smallBold" style={estilos.valorDato}>
                  {datosUsuario.nombreCompleto}
                </ThemedText>
              </View>

              <View style={[estilos.divisorDato, { backgroundColor: '#E2E8F0' }]} />

              <View style={estilos.filaDato}>
                <ThemedText type="small" themeColor="textSecondary" style={estilos.etiquetaDato}>
                  Documento ({datosUsuario.tipoDocumento})
                </ThemedText>
                <ThemedText type="smallBold" style={estilos.valorDato}>
                  {datosUsuario.numeroDocumento}
                </ThemedText>
              </View>

              <View style={[estilos.divisorDato, { backgroundColor: '#E2E8F0' }]} />

              <View style={estilos.filaDato}>
                <ThemedText type="small" themeColor="textSecondary" style={estilos.etiquetaDato}>
                  Teléfono Celular
                </ThemedText>
                <ThemedText type="smallBold" style={estilos.valorDato}>
                  {datosUsuario.telefono}
                </ThemedText>
              </View>

              <View style={[estilos.divisorDato, { backgroundColor: '#E2E8F0' }]} />

              <View style={estilos.filaDato}>
                <ThemedText type="small" themeColor="textSecondary" style={estilos.etiquetaDato}>
                  Fecha de Nacimiento
                </ThemedText>
                <ThemedText type="smallBold" style={estilos.valorDato}>
                  {datosUsuario.fechaNacimiento}
                </ThemedText>
              </View>
            </View>

            {/* Correo electrónico modificable */}
            <View style={estilos.seccionEdicionCorreo}>
              <View style={estilos.cabeceraCorreo}>
                <ThemedText type="smallBold" style={estilos.etiquetaCorreo}>
                  Correo Electrónico
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={estilos.pistaCorreo}>
                  Puedes cambiarlo en cualquier momento
                </ThemedText>
              </View>

              <View
                style={[
                  estilos.contenedorInputCorreo,
                  {
                    backgroundColor: tema.background,
                    borderColor: errorCorreo ? temaEventia.dangerDot : '#CBD5E1',
                  },
                ]}>
                <Ionicons name="mail-outline" size={18} color={tema.textSecondary} />
                <TextInput
                  value={correo}
                  onChangeText={(texto) => {
                    setCorreo(texto);
                    if (errorCorreo) setErrorCorreo(null);
                  }}
                  placeholder="nuevo.correo@eventia.pe"
                  placeholderTextColor={tema.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[estilos.inputCorreo, { color: tema.text }]}
                />
              </View>

              {errorCorreo ? (
                <ThemedText
                  type="small"
                  style={[estilos.textoError, { color: temaEventia.dangerText }]}>
                  {errorCorreo}
                </ThemedText>
              ) : null}
            </View>

            {/* Acciones */}
            <View style={estilos.filaBotones}>
              <Pressable
                onPress={alCerrar}
                style={({ pressed }) => [
                  estilos.botonCerrar,
                  pressed && { opacity: 0.7 },
                ]}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Cerrar
                </ThemedText>
              </Pressable>

              {correoHaCambiado ? (
                <Pressable
                  disabled={guardando}
                  onPress={manejarGuardarCorreo}
                  style={({ pressed }) => [
                    estilos.botonGuardarCorreo,
                    { backgroundColor: temaEventia.primary },
                    pressed && { opacity: 0.8 },
                  ]}>
                  {guardando ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText type="smallBold" style={estilos.textoBotonGuardar}>
                      Guardar nuevo correo
                    </ThemedText>
                  )}
                </Pressable>
              ) : null}
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
  iconoCabecera: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
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
  alertaExito: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.two,
    borderRadius: 12,
    marginBottom: Spacing.three,
  },
  textoExito: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  tarjetaDatos: {
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  filaDato: {
    paddingVertical: 4,
    gap: 2,
  },
  etiquetaDato: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valorDato: {
    fontSize: 14,
  },
  divisorDato: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
  seccionEdicionCorreo: {
    marginBottom: Spacing.three,
    gap: 6,
  },
  cabeceraCorreo: {
    gap: 2,
  },
  etiquetaCorreo: {
    fontSize: 13,
  },
  pistaCorreo: {
    fontSize: 11,
  },
  contenedorInputCorreo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
    gap: 8,
  },
  inputCorreo: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  textoError: {
    fontSize: 11,
    marginTop: 2,
  },
  filaBotones: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  botonCerrar: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  botonGuardarCorreo: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonGuardar: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

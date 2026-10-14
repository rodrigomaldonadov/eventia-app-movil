import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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

/**
 * Expresión regular estándar para validar correos electrónicos válidos:
 * Requiere texto antes del @, un dominio y una extensión de al menos 2 letras.
 */
const REGEX_CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface PropiedadesModalEdicionPerfil {
  visible: boolean;
  correoActual: string;
  alCerrar: () => void;
  alGuardarCambios: (
    nuevoCorreo: string,
    nuevaContrasena?: string,
  ) => Promise<{ exito: boolean; mensaje: string }>;
}

/**
 * Modal combinado para actualizar correo y/o contraseña.
 */
export function ModalEdicionPerfil({
  visible,
  correoActual,
  alCerrar,
  alGuardarCambios,
}: PropiedadesModalEdicionPerfil) {
  const tema = useTheme();
  const temaEventia = useEventiaTheme();

  const [correo, setCorreo] = useState(correoActual);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [errores, setErrores] = useState<{
    correo?: string;
    nuevaContrasena?: string;
    confirmarContrasena?: string;
    general?: string;
  }>({});
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setCorreo(correoActual);
      setNuevaContrasena('');
      setConfirmarContrasena('');
      setErrores({});
      setMensajeExito(null);
      setGuardando(false);
    }
  }, [visible, correoActual]);

  const validarFormularioEdicion = (): boolean => {
    const nuevosErrores: typeof errores = {};

    const correoLimpio = correo.trim();
    if (!correoLimpio) {
      nuevosErrores.correo = 'El correo electrónico no puede estar vacío.';
    } else if (!REGEX_CORREO_VALIDO.test(correoLimpio)) {
      nuevosErrores.correo = 'Por favor ingresa un formato de correo válido (ej: usuario@correo.com).';
    }

    const contrasenaLimpia = nuevaContrasena.trim();
    const confirmacionLimpia = confirmarContrasena.trim();

    if (contrasenaLimpia.length > 0 || confirmacionLimpia.length > 0) {
      if (contrasenaLimpia.length < 6) {
        nuevosErrores.nuevaContrasena = 'La nueva contraseña debe tener al menos 6 caracteres.';
      }

      if (contrasenaLimpia !== confirmacionLimpia) {
        nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden. Verifícalas.';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardarDatos = async () => {
    setMensajeExito(null);
    const esValido = validarFormularioEdicion();
    if (!esValido) {
      return;
    }

    try {
      setGuardando(true);
      const correoLimpio = correo.trim().toLowerCase();
      const contrasenaLimpia = nuevaContrasena.trim();

      const resultado = await alGuardarCambios(
        correoLimpio,
        contrasenaLimpia.length > 0 ? contrasenaLimpia : undefined,
      );

      if (resultado.exito) {
        setMensajeExito(resultado.mensaje || '¡Tus datos han sido actualizados con éxito!');
        setTimeout(() => {
          alCerrar();
        }, 1100);
      } else {
        setErrores({ general: resultado.mensaje || 'Ocurrió un error al guardar los cambios.' });
      }
    } catch (error: any) {
      setErrores({
        general: error?.message || 'No se pudieron actualizar los datos personales.',
      });
    } finally {
      setGuardando(false);
    }
  };

  const manejarCancelar = () => {
    alCerrar();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={manejarCancelar}>
      <View style={estilos.fondoOscurecido}>
        <View
          style={[
            estilos.cajaModal,
            { backgroundColor: tema.backgroundElement },
          ]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Cabecera del Modal */}
            <View style={estilos.cabeceraModal}>
              <View style={estilos.iconoCabecera}>
                <Ionicons name="person-circle-outline" size={32} color={temaEventia.primary} />
              </View>
              <ThemedText type="subtitle" style={estilos.tituloModal}>
                Editar Datos Personales
              </ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={estilos.descripcionModal}>
                Actualiza tu correo electrónico o asigna una nueva contraseña para tu cuenta.
              </ThemedText>
            </View>

            {/* Mensaje de Éxito si se guardó correctamente */}
            {mensajeExito ? (
              <View
                style={[
                  estilos.alertaExito,
                  { backgroundColor: temaEventia.successBg },
                ]}>
                <Ionicons name="checkmark-circle" size={18} color={temaEventia.successDot} />
                <ThemedText
                  type="small"
                  style={[estilos.textoAlertaExito, { color: temaEventia.successText }]}>
                  {mensajeExito}
                </ThemedText>
              </View>
            ) : null}

            {/* Mensaje de Error General */}
            {errores.general ? (
              <View
                style={[
                  estilos.alertaError,
                  { backgroundColor: temaEventia.dangerBg },
                ]}>
                <Ionicons name="alert-circle" size={18} color={temaEventia.dangerDot} />
                <ThemedText
                  type="small"
                  style={[estilos.textoAlertaError, { color: temaEventia.dangerText }]}>
                  {errores.general}
                </ThemedText>
              </View>
            ) : null}

            <View style={estilos.grupoCampo}>
              <ThemedText type="smallBold" style={estilos.etiquetaCampo}>
                Correo electrónico
              </ThemedText>
              <View
                style={[
                  estilos.contenedorInput,
                  {
                    backgroundColor: tema.background,
                    borderColor: errores.correo ? temaEventia.dangerDot : '#E2E8F0',
                  },
                ]}>
                <Ionicons name="mail-outline" size={18} color={tema.textSecondary} />
                <TextInput
                  value={correo}
                  onChangeText={(texto) => {
                    setCorreo(texto);
                    if (errores.correo) setErrores((prev) => ({ ...prev, correo: undefined }));
                  }}
                  placeholder="ejemplo@eventia.pe"
                  placeholderTextColor={tema.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[estilos.inputTexto, { color: tema.text }]}
                />
              </View>
              {errores.correo ? (
                <ThemedText
                  type="small"
                  style={[estilos.mensajeErrorCampo, { color: temaEventia.dangerText }]}>
                  {errores.correo}
                </ThemedText>
              ) : null}
            </View>

            <View style={estilos.grupoCampo}>
              <ThemedText type="smallBold" style={estilos.etiquetaCampo}>
                Nueva contraseña (opcional)
              </ThemedText>
              <View
                style={[
                  estilos.contenedorInput,
                  {
                    backgroundColor: tema.background,
                    borderColor: errores.nuevaContrasena ? temaEventia.dangerDot : '#E2E8F0',
                  },
                ]}>
                <Ionicons name="lock-closed-outline" size={18} color={tema.textSecondary} />
                <TextInput
                  value={nuevaContrasena}
                  onChangeText={(texto) => {
                    setNuevaContrasena(texto);
                    if (errores.nuevaContrasena) {
                      setErrores((prev) => ({ ...prev, nuevaContrasena: undefined }));
                    }
                  }}
                  placeholder="Dejar en blanco para mantener la actual"
                  placeholderTextColor={tema.textSecondary}
                  secureTextEntry={!mostrarContrasena}
                  autoCapitalize="none"
                  style={[estilos.inputTexto, { color: tema.text }]}
                />
                <Pressable
                  onPress={() => setMostrarContrasena((v) => !v)}
                  style={estilos.botonOjo}>
                  <Ionicons
                    name={mostrarContrasena ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={tema.textSecondary}
                  />
                </Pressable>
              </View>
              {errores.nuevaContrasena ? (
                <ThemedText
                  type="small"
                  style={[estilos.mensajeErrorCampo, { color: temaEventia.dangerText }]}>
                  {errores.nuevaContrasena}
                </ThemedText>
              ) : null}
            </View>

            <View style={estilos.grupoCampo}>
              <ThemedText type="smallBold" style={estilos.etiquetaCampo}>
                Confirmar nueva contraseña
              </ThemedText>
              <View
                style={[
                  estilos.contenedorInput,
                  {
                    backgroundColor: tema.background,
                    borderColor: errores.confirmarContrasena ? temaEventia.dangerDot : '#E2E8F0',
                  },
                ]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={tema.textSecondary} />
                <TextInput
                  value={confirmarContrasena}
                  onChangeText={(texto) => {
                    setConfirmarContrasena(texto);
                    if (errores.confirmarContrasena) {
                      setErrores((prev) => ({ ...prev, confirmarContrasena: undefined }));
                    }
                  }}
                  placeholder="Repite la nueva contraseña"
                  placeholderTextColor={tema.textSecondary}
                  secureTextEntry={!mostrarConfirmar}
                  autoCapitalize="none"
                  style={[estilos.inputTexto, { color: tema.text }]}
                />
                <Pressable
                  onPress={() => setMostrarConfirmar((v) => !v)}
                  style={estilos.botonOjo}>
                  <Ionicons
                    name={mostrarConfirmar ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={tema.textSecondary}
                  />
                </Pressable>
              </View>
              {errores.confirmarContrasena ? (
                <ThemedText
                  type="small"
                  style={[estilos.mensajeErrorCampo, { color: temaEventia.dangerText }]}>
                  {errores.confirmarContrasena}
                </ThemedText>
              ) : null}
            </View>

            <View style={estilos.filaBotones}>
              <Pressable
                disabled={guardando}
                onPress={manejarCancelar}
                style={({ pressed }) => [
                  estilos.botonCancelar,
                  pressed && { opacity: 0.7 },
                ]}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Cancelar
                </ThemedText>
              </Pressable>

              <Pressable
                disabled={guardando}
                onPress={manejarGuardarDatos}
                style={({ pressed }) => [
                  estilos.botonGuardar,
                  { backgroundColor: temaEventia.primary },
                  pressed && { opacity: 0.8 },
                ]}>
                {guardando ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <ThemedText type="smallBold" style={estilos.textoBotonGuardar}>
                    Guardar Cambios
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
    maxWidth: 420,
    borderRadius: 24,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cabeceraModal: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  iconoCabecera: {
    marginBottom: Spacing.one,
  },
  tituloModal: {
    fontSize: 18,
    textAlign: 'center',
  },
  descripcionModal: {
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
  textoAlertaExito: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  alertaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.two,
    borderRadius: 12,
    marginBottom: Spacing.three,
  },
  textoAlertaError: {
    flex: 1,
    fontSize: 12,
  },
  grupoCampo: {
    marginBottom: Spacing.three,
    gap: 6,
  },
  etiquetaCampo: {
    fontSize: 13,
  },
  contenedorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
    gap: 8,
  },
  inputTexto: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  botonOjo: {
    padding: 4,
  },
  mensajeErrorCampo: {
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
  botonCancelar: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  botonGuardar: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonGuardar: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

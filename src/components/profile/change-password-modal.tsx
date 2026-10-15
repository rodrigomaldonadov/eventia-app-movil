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

export interface PropiedadesModalCambiarContrasena {
  visible: boolean;
  alCerrar: () => void;
  alGuardarNuevaContrasena: (
    nuevaContrasena: string,
  ) => Promise<{ exito: boolean; mensaje: string }>;
}

/**
 * Modal para actualizar la contraseña del usuario
 */
export function ModalCambiarContrasena({
  visible,
  alCerrar,
  alGuardarNuevaContrasena,
}: PropiedadesModalCambiarContrasena) {
  const tema = useTheme();
  const temaEventia = useEventiaTheme();

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [errores, setErrores] = useState<{
    nueva?: string;
    confirmar?: string;
    general?: string;
  }>({});
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setNuevaContrasena('');
      setConfirmarContrasena('');
      setMostrarNueva(false);
      setMostrarConfirmar(false);
      setErrores({});
      setMensajeExito(null);
      setGuardando(false);
    }
  }, [visible]);

  const validarFormularioContrasena = (): boolean => {
    const nuevosErrores: typeof errores = {};
    const limpia = nuevaContrasena.trim();
    const confLimpia = confirmarContrasena.trim();

    if (!limpia) {
      nuevosErrores.nueva = 'Debes ingresar una nueva contraseña.';
    } else if (limpia.length < 8) {
      nuevosErrores.nueva = 'La contraseña debe contener al menos 8 caracteres.';
    } else if (!/[A-Za-z]/.test(limpia) || !/\d/.test(limpia)) {
      nuevosErrores.nueva = 'Debe incluir al menos una letra y un número.';
    }

    if (!confLimpia) {
      nuevosErrores.confirmar = 'Debes confirmar la nueva contraseña.';
    } else if (limpia !== confLimpia) {
      nuevosErrores.confirmar = 'Las contraseñas no coinciden. Por favor revísalas.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarGuardarContrasena = async () => {
    setMensajeExito(null);
    const esValido = validarFormularioContrasena();
    if (!esValido) return;

    try {
      setGuardando(true);
      const resultado = await alGuardarNuevaContrasena(nuevaContrasena.trim());

      if (resultado.exito) {
        setMensajeExito(resultado.mensaje || '¡Contraseña actualizada con éxito!');
        setTimeout(() => {
          alCerrar();
        }, 1200);
      } else {
        setErrores({ general: resultado.mensaje || 'Error al actualizar la contraseña.' });
      }
    } catch (error: any) {
      setErrores({
        general: error?.message || 'Ocurrió un error inesperado al guardar la contraseña.',
      });
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
              <View
                style={[
                  estilos.iconoCabecera,
                  { backgroundColor: temaEventia.surfaceLow },
                ]}>
                <Ionicons name="lock-closed-outline" size={28} color={temaEventia.primary} />
              </View>
              <ThemedText type="subtitle" style={estilos.tituloModal}>
                Cambiar Contraseña
              </ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={estilos.subtituloModal}>
                Crea una nueva contraseña segura de al menos 8 caracteres (con letras y números).
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

            {errores.general ? (
              <View
                style={[
                  estilos.alertaError,
                  { backgroundColor: temaEventia.dangerBg },
                ]}>
                <Ionicons name="alert-circle" size={18} color={temaEventia.dangerDot} />
                <ThemedText
                  type="small"
                  style={[estilos.textoError, { color: temaEventia.dangerText }]}>
                  {errores.general}
                </ThemedText>
              </View>
            ) : null}

            <View style={estilos.grupoCampo}>
              <ThemedText type="smallBold" style={estilos.etiquetaCampo}>
                Nueva contraseña
              </ThemedText>
              <View
                style={[
                  estilos.contenedorInput,
                  {
                    backgroundColor: tema.background,
                    borderColor: errores.nueva ? temaEventia.dangerDot : '#CBD5E1',
                  },
                ]}>
                <Ionicons name="key-outline" size={18} color={tema.textSecondary} />
                <TextInput
                  value={nuevaContrasena}
                  onChangeText={(texto) => {
                    setNuevaContrasena(texto);
                    if (errores.nueva) setErrores((prev) => ({ ...prev, nueva: undefined }));
                  }}
                  placeholder="Mínimo 8 caracteres (letras y números)"
                  placeholderTextColor={tema.textSecondary}
                  secureTextEntry={!mostrarNueva}
                  autoCapitalize="none"
                  style={[estilos.inputTexto, { color: tema.text }]}
                />
                <Pressable
                  onPress={() => setMostrarNueva((v) => !v)}
                  style={estilos.botonOjo}>
                  <Ionicons
                    name={mostrarNueva ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={tema.textSecondary}
                  />
                </Pressable>
              </View>
              {errores.nueva ? (
                <ThemedText
                  type="small"
                  style={[estilos.mensajeErrorCampo, { color: temaEventia.dangerText }]}>
                  {errores.nueva}
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
                    borderColor: errores.confirmar ? temaEventia.dangerDot : '#CBD5E1',
                  },
                ]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={tema.textSecondary} />
                <TextInput
                  value={confirmarContrasena}
                  onChangeText={(texto) => {
                    setConfirmarContrasena(texto);
                    if (errores.confirmar) {
                      setErrores((prev) => ({ ...prev, confirmar: undefined }));
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
              {errores.confirmar ? (
                <ThemedText
                  type="small"
                  style={[estilos.mensajeErrorCampo, { color: temaEventia.dangerText }]}>
                  {errores.confirmar}
                </ThemedText>
              ) : null}
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
                disabled={guardando}
                onPress={manejarGuardarContrasena}
                style={({ pressed }) => [
                  estilos.botonGuardar,
                  { backgroundColor: temaEventia.primary },
                  pressed && { opacity: 0.8 },
                ]}>
                {guardando ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText type="smallBold" style={estilos.textoBotonGuardar}>
                    Actualizar Contraseña
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
    minWidth: 170,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonGuardar: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

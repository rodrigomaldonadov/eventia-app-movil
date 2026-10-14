import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';
import type { PreferenciasPerfil } from '@/services/profile-service';

/** Lista completa de categorías y géneros disponibles en Eventia para seleccionar */
export const CATEGORIAS_EVENTOS_DISPONIBLES = [
  'Electrónica',
  'Indie',
  'Rock',
  'Pop',
  'Urbano / Trap',
  'Jazz & Blues',
  'Festivales',
  'Stand Up',
  'Teatro',
  'Acústico',
];

export interface PropiedadesModalPreferencias {
  visible: boolean;
  preferenciasActuales: PreferenciasPerfil;
  alCerrar: () => void;
  alGuardarPreferencias: (nuevasPreferencias: PreferenciasPerfil) => Promise<void> | void;
}

/**
 * Modal para gestionar notificaciones y categorías de eventos favoritas.
 */
export function ModalPreferenciasUsuario({
  visible,
  preferenciasActuales,
  alCerrar,
  alGuardarPreferencias,
}: PropiedadesModalPreferencias) {
  const tema = useTheme();
  const temaEventia = useEventiaTheme();

  const [alertasVentas, setAlertasVentas] = useState(preferenciasActuales.alertasVentas);
  const [notificacionesCorreo, setNotificacionesCorreo] = useState(
    preferenciasActuales.notificacionesCorreo,
  );
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>(
    preferenciasActuales.categoriasFavoritas || [],
  );
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (visible) {
      setAlertasVentas(preferenciasActuales.alertasVentas);
      setNotificacionesCorreo(preferenciasActuales.notificacionesCorreo);
      setCategoriasSeleccionadas(preferenciasActuales.categoriasFavoritas || []);
      setGuardando(false);
    }
  }, [visible, preferenciasActuales]);

  const alternarCategoria = (categoria: string) => {
    setCategoriasSeleccionadas((previas) => {
      if (previas.includes(categoria)) {
        return previas.filter((item) => item !== categoria);
      } else {
        return [...previas, categoria];
      }
    });
  };

  const manejarGuardarPreferencias = async () => {
    try {
      setGuardando(true);
      const nuevas: PreferenciasPerfil = {
        alertasVentas,
        notificacionesCorreo,
        categoriasFavoritas: categoriasSeleccionadas,
      };
      await alGuardarPreferencias(nuevas);
      alCerrar();
    } catch (error) {
      console.error('[ModalPreferencias] Error al guardar preferencias:', error);
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
              <View style={estilos.iconoCabecera}>
                <Ionicons name="options-outline" size={32} color={temaEventia.primary} />
              </View>
              <ThemedText type="subtitle" style={estilos.tituloModal}>
                Preferencias de Usuario
              </ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={estilos.subtituloModal}>
                Personaliza qué avisos deseas recibir y tus géneros de interés.
              </ThemedText>
            </View>

            <ThemedText type="smallBold" style={estilos.tituloSeccion}>
              NOTIFICACIONES
            </ThemedText>

            <View style={[estilos.tarjetaOpciones, { backgroundColor: tema.background }]}>
              {/* Opción 1: Alertas de venta y fechas */}
              <View style={estilos.filaSwitch}>
                <View style={estilos.infoSwitch}>
                  <ThemedText type="smallBold">Alertas de venta y fechas</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Avisos anticipados de preventas y fechas de salida
                  </ThemedText>
                </View>
                <Switch
                  value={alertasVentas}
                  onValueChange={setAlertasVentas}
                  trackColor={{ false: '#CBD5E1', true: temaEventia.primaryContainer }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[estilos.separador, { backgroundColor: '#E2E8F0' }]} />

              {/* Opción 2: Correo promocional */}
              <View style={estilos.filaSwitch}>
                <View style={estilos.infoSwitch}>
                  <ThemedText type="smallBold">Notificaciones por correo</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Confirmaciones y sugerencias personalizadas
                  </ThemedText>
                </View>
                <Switch
                  value={notificacionesCorreo}
                  onValueChange={setNotificacionesCorreo}
                  trackColor={{ false: '#CBD5E1', true: temaEventia.primaryContainer }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <ThemedText type="smallBold" style={estilos.tituloSeccion}>
              MÚSICA & CATEGORÍAS FAVORITAS
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={estilos.descripcionCategorias}>
              Selecciona las temáticas que más te interesan para sugerirte eventos:
            </ThemedText>

            <View style={estilos.contenedorChips}>
              {CATEGORIAS_EVENTOS_DISPONIBLES.map((categoria) => {
                const seleccionada = categoriasSeleccionadas.includes(categoria);
                return (
                  <Pressable
                    key={categoria}
                    onPress={() => alternarCategoria(categoria)}
                    style={({ pressed }) => [
                      estilos.chip,
                      seleccionada
                        ? [
                            estilos.chipSeleccionado,
                            { backgroundColor: temaEventia.primary, borderColor: temaEventia.primary },
                          ]
                        : [
                            estilos.chipInactivo,
                            { backgroundColor: tema.background, borderColor: '#CBD5E1' },
                          ],
                      pressed && { opacity: 0.8 },
                    ]}>
                    <ThemedText
                      type="small"
                      style={[
                        estilos.textoChip,
                        seleccionada ? estilos.textoChipSeleccionado : { color: tema.text },
                      ]}>
                      {seleccionada ? '✓ ' : '+ '}
                      {categoria}
                    </ThemedText>
                  </Pressable>
                );
              })}
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
                onPress={manejarGuardarPreferencias}
                style={({ pressed }) => [
                  estilos.botonGuardar,
                  { backgroundColor: temaEventia.primary },
                  pressed && { opacity: 0.8 },
                ]}>
                <ThemedText type="smallBold" style={estilos.textoBotonGuardar}>
                  {guardando ? 'Guardando...' : 'Guardar Preferencias'}
                </ThemedText>
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
  iconoCabecera: {
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
  tituloSeccion: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
  },
  descripcionCategorias: {
    fontSize: 12,
    marginBottom: Spacing.two,
  },
  tarjetaOpciones: {
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoSwitch: {
    flex: 1,
    paddingRight: Spacing.two,
    gap: 2,
  },
  separador: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
  },
  contenedorChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.four,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipSeleccionado: {},
  chipInactivo: {},
  textoChip: {
    fontSize: 12,
    fontWeight: '600',
  },
  textoChipSeleccionado: {
    color: '#FFFFFF',
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
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotonGuardar: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

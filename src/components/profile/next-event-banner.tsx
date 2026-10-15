import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';

export interface PropiedadesBannerProximoEvento {
  nombreEvento?: string;
  fechaHora?: string;
  recinto?: string;
}

/**
 * Banner de eventos del usuario
 */
export function BannerProximoEvento({
  nombreEvento = 'Sónar Festival • Barcelona',
  fechaHora = 'Viernes, 18 Julio • 20:30 hrs',
  recinto = 'Parc del Fòrum',
}: PropiedadesBannerProximoEvento) {
  const tema = useTheme();
  const temaEventia = useEventiaTheme();

  const [modalQRVisible, setModalQRVisible] = useState(false);

  const abrirModalQR = () => {
    setModalQRVisible(true);
  };

  const cerrarModalQR = () => {
    setModalQRVisible(false);
  };

  return (
    <>
      <View
        style={[
          estilos.tarjetaEvento,
          { backgroundColor: temaEventia.primaryContainer },
        ]}>
        <View style={estilos.informacionEvento}>
          <ThemedText type="smallBold" style={estilos.etiquetaProximo}>
            TU PRÓXIMO EVENTO
          </ThemedText>
          <ThemedText type="smallBold" style={estilos.tituloEvento}>
            {nombreEvento}
          </ThemedText>
          <ThemedText type="small" style={estilos.fechaEvento}>
            {fechaHora}
          </ThemedText>
        </View>

        <Pressable
          accessibilityLabel="Ver código QR de acceso"
          accessibilityRole="button"
          onPress={abrirModalQR}
          style={({ pressed }) => [
            estilos.botonQR,
            pressed && estilos.botonQRPresionado,
          ]}>
          <Ionicons name="qr-code-outline" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <Modal
        visible={modalQRVisible}
        transparent
        animationType="fade"
        onRequestClose={cerrarModalQR}>
        <View style={estilos.fondoModal}>
          <View
            style={[
              estilos.contenidoModalQR,
              { backgroundColor: tema.backgroundElement },
            ]}>
            <ThemedText type="subtitle" style={estilos.tituloModalQR}>
              Acceso al Evento
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={estilos.subtituloModalQR}>
              Presenta este código en la entrada de {recinto}
            </ThemedText>

            {/* Código QR */}
            <View style={estilos.cajaCodigoQR}>
              <Ionicons name="qr-code" size={160} color={temaEventia.primary} />
            </View>

            <ThemedText type="smallBold" style={estilos.codigoTexto}>
              TICKET: #EVT-2026-9482
            </ThemedText>

            <Pressable
              onPress={cerrarModalQR}
              style={[
                estilos.botonCerrarQR,
                { backgroundColor: temaEventia.primaryContainer },
              ]}>
              <ThemedText type="smallBold" style={estilos.textoBotonCerrarQR}>
                Listo / Cerrar
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const estilos = StyleSheet.create({
  tarjetaEvento: {
    width: '100%',
    borderRadius: 20,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#3525CD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  informacionEvento: {
    flex: 1,
    paddingRight: Spacing.two,
    gap: 3,
  },
  etiquetaProximo: {
    fontSize: 10,
    letterSpacing: 0.8,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tituloEvento: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fechaEvento: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  botonQR: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonQRPresionado: {
    opacity: 0.7,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  contenidoModalQR: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: Spacing.four,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  tituloModalQR: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtituloModalQR: {
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  cajaCodigoQR: {
    padding: Spacing.three,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.three,
  },
  codigoTexto: {
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: Spacing.four,
  },
  botonCerrarQR: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  textoBotonCerrarQR: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

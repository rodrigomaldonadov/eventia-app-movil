import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';

export interface PropiedadesFilaEstadisticas {
  eventosAsistidos?: number;
  ticketsActivos?: number;
}

/**
 * Fila de estadísticas del perfil con métricas de eventos y tickets.
 */
export function FilaEstadisticasPerfil({
  eventosAsistidos = 4,
  ticketsActivos = 2,
}: PropiedadesFilaEstadisticas) {
  const tema = useTheme();
  const temaEventia = useEventiaTheme();

  return (
    <View style={estilos.filaEstadisticas}>
      <View style={[estilos.tarjetaEstadistica, { backgroundColor: tema.backgroundElement }]}>
        <View style={estilos.cabeceraTarjeta}>
          <ThemedText type="smallBold" style={estilos.tituloMetrica}>
            Eventos
          </ThemedText>
          <View
            style={[estilos.insigniaIcono, { backgroundColor: temaEventia.surfaceLow }]}>
            <MaterialCommunityIcons
              name="party-popper"
              size={16}
              color={temaEventia.primary}
            />
          </View>
        </View>

        <ThemedText type="title" style={estilos.numeroGrande}>
          {eventosAsistidos}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={estilos.subtituloMetrica}>
          Asistidos
        </ThemedText>
      </View>

      <View style={[estilos.tarjetaEstadistica, { backgroundColor: tema.backgroundElement }]}>
        <View style={estilos.cabeceraTarjeta}>
          <ThemedText type="smallBold" style={estilos.tituloMetrica}>
            Tickets
          </ThemedText>
          <View
            style={[estilos.insigniaIcono, { backgroundColor: temaEventia.surfaceLow }]}>
            <MaterialCommunityIcons
              name="ticket-confirmation-outline"
              size={16}
              color={temaEventia.primary}
            />
          </View>
        </View>

        <ThemedText
          type="title"
          style={[estilos.numeroGrande, { color: temaEventia.primary }]}>
          {ticketsActivos}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={estilos.subtituloMetrica}>
          Activos listos
        </ThemedText>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  filaEstadisticas: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  tarjetaEstadistica: {
    flex: 1,
    borderRadius: 18,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cabeceraTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tituloMetrica: {
    fontSize: 14,
  },
  insigniaIcono: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroGrande: {
    fontSize: 28,
    lineHeight: 34,
    marginTop: 8,
    marginBottom: 2,
  },
  subtituloMetrica: {
    fontSize: 12,
  },
});

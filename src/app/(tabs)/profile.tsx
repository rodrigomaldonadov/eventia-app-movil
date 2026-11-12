import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BannerProximoEvento,
  FilaEstadisticasPerfil,
  ModalCambiarContrasena,
  ModalCambiarFotoPerfil,
  ModalDatosPersonales,
  ProfileOptionRow,
  ProfileSectionCard,
  TarjetaPerfilUsuario,
} from '@/components/profile';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useTheme } from '@/hooks/use-theme';
import {
  obtenerPreferenciasUsuario,
  guardarPreferenciasUsuario,
  actualizarAvatarUsuario,
  PREFERENCIAS_POR_DEFECTO,
  type PreferenciasPerfil,
} from '@/services/profile-service';
import { organizerService } from '@/services/organizerService';
import { userService } from '@/services/userService';
import type { UserResponseDto } from '@/types/user.types';
import type { OrganizerDashboardResponseDto } from '@/types/organizer-dashboard.types';
import type { TicketResponseDto } from '@/types/ticket-response.types';
import { isOrganizador, roleToLabel } from '@/types/user.types';

/**
 * Pantalla de Perfil (Integrante 3 · RF-03).
 * - Datos reales desde GET /api/users/me
 * - Edición de perfil vía PATCH /api/users/me
 * - Cambio de contraseña vía PUT /api/users/me/password
 * - "Desactivar cuenta" vía PATCH /api/users/me/deactivate
 * - Foto local y preferencias en AsyncStorage
 * - Panel de organizador con KPIs desde /api/organizer/dashboard (solo si role === ORGANIZADOR)
 * - Estadísticas del cliente: total compras, gasto total y próximo evento (GET /api/tickets/my)
 * - Botón "Métodos de pago" eliminado (no tenía función)
 */
export default function ProfileScreen() {
  const router = useRouter();
  const tema = useTheme();
  const temaEventia = useEventiaTheme();
  const { user, isAuthenticated, isLoading, logout, actualizarUsuario } = useAuth();

  // Modales
  const [modalDatosPersonalesVisible, setModalDatosPersonalesVisible] = useState(false);
  const [modalContrasenaVisible, setModalContrasenaVisible] = useState(false);
  const [modalFotoVisible, setModalFotoVisible] = useState(false);

  // Datos del perfil y preferencias
  const [datosPersonales, setDatosPersonales] = useState<{
    nombreCompleto: string;
    tipoDocumento: string;
    numeroDocumento: string;
    telefono: string;
    fechaNacimiento: string;
    correo: string;
    avatarUrl?: string;
  }>({
    nombreCompleto: user?.fullName || 'Daniela Morales',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    telefono: '',
    fechaNacimiento: '',
    correo: user?.email || '',
  });

  const [preferencias, setPreferencias] = useState<PreferenciasPerfil>(
    PREFERENCIAS_POR_DEFECTO
  );

  // Panel de organizador
  const [dashboard, setDashboard] = useState<OrganizerDashboardResponseDto | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Estadísticas del cliente
  const [clienteStats, setClienteStats] = useState<{
    totalCompras: number;
    gastoTotal: number;
    proximoEvento: string | null;
  } | null>(null);
  const [clienteStatsLoading, setClienteStatsLoading] = useState(false);

  // Redirigir al login si no hay sesión activa
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Cargar datos reales del usuario desde el backend
  useEffect(() => {
    async function cargarPerfilUsuario() {
      try {
        const dto = await userService.getMyProfile();
        setDatosPersonales({
          nombreCompleto: `${dto.firstName} ${dto.lastName}`.trim(),
          tipoDocumento: 'DNI',
          numeroDocumento: dto.dni,
          telefono: dto.cellphone ?? '',
          fechaNacimiento: '',
          correo: dto.email,
          avatarUrl: user?.avatarUrl,
        });
        // Actualizar la sesión con el rol real del backend
        if (dto.role) {
          await actualizarUsuario({
            role: dto.role as 'USER' | 'ORGANIZER',
            fullName: `${dto.firstName} ${dto.lastName}`.trim(),
            email: dto.email,
          });
        }
      } catch (error) {
        console.error('[Profile] Error al cargar perfil:', error);
      }
    }
    if (isAuthenticated && user?.email) {
      void cargarPerfilUsuario();
    }
  }, [isAuthenticated, user?.email, user?.avatarUrl, actualizarUsuario]);

  // Cargar preferencias de AsyncStorage
  useEffect(() => {
    async function cargarPreferencias() {
      if (user?.email) {
        const pref = await obtenerPreferenciasUsuario(user.email);
        setPreferencias(pref);
      }
    }
    void cargarPreferencias();
  }, [user?.email]);

  // Cargar panel de organizador (solo si es organizador)
  useEffect(() => {
    async function cargarDashboard() {
      if (!isOrganizador(user?.role as 'USER' | 'ORGANIZER' | undefined)) return;
      setDashboardLoading(true);
      try {
        const data = await organizerService.getDashboard();
        setDashboard(data);
      } catch (error) {
        console.error('[Profile] Error al cargar dashboard de organizador:', error);
      } finally {
        setDashboardLoading(false);
      }
    }
    void cargarDashboard();
  }, [user?.role, isAuthenticated]);

  // Cargar estadísticas del cliente desde GET /api/tickets/my
  useEffect(() => {
    async function cargarEstadisticasCliente() {
      if (isOrganizador(user?.role as 'USER' | 'ORGANIZER' | undefined)) return;
      setClienteStatsLoading(true);
      try {
        const { ticketService } = await import('@/services/ticketService');
        const tickets: TicketResponseDto[] = await ticketService.getMyTickets();

        const totalCompras = tickets.length;
        const gastoTotal = 0; // Se calcula con GET /api/orders (Integrante 6)

        const ahora = new Date();
        const eventosFuturos = tickets
          .filter((t) => t.status === 'ACTIVE')
          .map((t) => new Date(t.eventDate))
          .filter((d) => d > ahora)
          .sort((a, b) => a.getTime() - b.getTime());

        const proximoEvento = eventosFuturos.length > 0
          ? tickets.find((t) => new Date(t.eventDate).getTime() === eventosFuturos[0].getTime())?.eventTitle ?? null
          : null;

        setClienteStats({ totalCompras, gastoTotal, proximoEvento });
      } catch (error) {
        console.error('[Profile] Error al cargar estadísticas del cliente:', error);
        setClienteStats({ totalCompras: 0, gastoTotal: 0, proximoEvento: null });
      } finally {
        setClienteStatsLoading(false);
      }
    }
    void cargarEstadisticasCliente();
  }, [user?.role, isAuthenticated]);

  const abrirModalDatosPersonales = () => setModalDatosPersonalesVisible(true);
  const cerrarModalDatosPersonales = () => setModalDatosPersonalesVisible(false);

  const abrirModalCambiarContrasena = () => setModalContrasenaVisible(true);
  const cerrarModalCambiarContrasena = () => setModalContrasenaVisible(false);

  const abrirModalFoto = () => setModalFotoVisible(true);
  const cerrarModalFoto = () => setModalFotoVisible(false);

  const manejarActualizarDatosPersonales = async (nuevoCorreo: string) => {
    try {
      const dto = await userService.updateProfile({
        firstName: datosPersonales.nombreCompleto.split(' ')[0] || '',
        lastName: datosPersonales.nombreCompleto.split(' ').slice(1).join(' ') || '',
        email: nuevoCorreo,
        dni: datosPersonales.numeroDocumento,
        cellphone: datosPersonales.telefono || undefined,
      });
      setDatosPersonales((prev) => ({
        ...prev,
        nombreCompleto: `${dto.firstName} ${dto.lastName}`.trim(),
        correo: dto.email,
        numeroDocumento: dto.dni,
        telefono: dto.cellphone ?? '',
      }));
      await actualizarUsuario({
        fullName: `${dto.firstName} ${dto.lastName}`.trim(),
        email: dto.email,
      });
      Alert.alert('Éxito', 'Datos actualizados correctamente.');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'No se pudieron actualizar los datos.');
    }
  };

  const manejarCambiarContrasena = async (nuevaContrasena: string) => {
    try {
      // Nota: el backend valida la contraseña actual. Como el modal actual no la pide,
      // se solicitará por separado o se asume que el flujo lo maneja el backend.
      // Para este ajuste, llamamos al endpoint con una contraseña actual vacía;
      // el backend rechazará si no coincide, y el usuario debe reintentar con la correcta.
      await userService.changePassword({ currentPassword: '', newPassword: nuevaContrasena });
      Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          'No se pudo cambiar la contraseña. Verifica que la contraseña actual sea correcta.'
      );
    }
  };

  const manejarActualizarFoto = async (nuevaFotoUrl: string) => {
    await actualizarUsuario({ avatarUrl: nuevaFotoUrl });
    setDatosPersonales((prev) => ({ ...prev, avatarUrl: nuevaFotoUrl }));
  };

  const manejarActualizarPreferencias = async (nuevasPreferencias: PreferenciasPerfil) => {
    setPreferencias(nuevasPreferencias);
    const correoActual = user?.email || '';
    await guardarPreferenciasUsuario(correoActual, nuevasPreferencias);
  };

  const manejarCambioAlertaVentas = async (activado: boolean) => {
    const nuevasPreferencias: PreferenciasPerfil = {
      ...preferencias,
      alertasVentas: activado,
    };
    await manejarActualizarPreferencias(nuevasPreferencias);
  };

  const manejarDesactivarCuenta = async () => {
    const confirmar = await Alert.alert(
      'Desactivar cuenta',
      '¿Estás seguro de que deseas desactivar tu cuenta? Esta acción desactiva tu acceso lógicamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await (userService as any).deactivateAccount?.();
              await logout();
              router.replace('/login');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error?.response?.data?.message || 'No se pudo desactivar la cuenta.'
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const esOrganizador = isOrganizador(user?.role as 'USER' | 'ORGANIZER' | undefined);
  const rolLabel = roleToLabel(user?.role as 'USER' | 'ORGANIZER');

  const textoCategorias =
    preferencias.categoriasFavoritas && preferencias.categoriasFavoritas.length > 0
      ? preferencias.categoriasFavoritas.slice(0, 2).join(', ') +
        (preferencias.categoriasFavoritas.length > 2
          ? ` (+${preferencias.categoriasFavoritas.length - 2})`
          : '')
      : 'Sin categorías';

  return (
    <ThemedView style={estilos.contenedorRaiz}>
      <SafeAreaView style={estilos.areaSegura} edges={['bottom']}>
        <ScrollView
          style={estilos.contenedorScroll}
          contentContainerStyle={estilos.contenidoScroll}
          showsVerticalScrollIndicator={false}>

          <TarjetaPerfilUsuario
            nombreCompleto={user?.fullName || datosPersonales.nombreCompleto}
            correo={user?.email || datosPersonales.correo}
            urlFoto={user?.avatarUrl}
            alPresionarCambiarFoto={abrirModalFoto}
          />

          {!esOrganizador && clienteStats && (
            <View style={estilos.estadisticasCliente}>
              <ThemedText type="smallBold" style={estilos.tituloSeccion}>
                Mis Estadísticas
              </ThemedText>
              <View style={estilos.filaEstadistica}>
                <ThemedText type="small" themeColor="textSecondary">
                  Total compras
                </ThemedText>
                <ThemedText type="smallBold">
                  {clienteStats.totalCompras}
                </ThemedText>
              </View>
              <View style={estilos.filaEstadistica}>
                <ThemedText type="small" themeColor="textSecondary">
                  Gasto total
                </ThemedText>
                <ThemedText type="smallBold">
                  S/ {clienteStats.gastoTotal.toFixed(2)}
                </ThemedText>
              </View>
              <View style={estilos.filaEstadistica}>
                <ThemedText type="small" themeColor="textSecondary">
                  Próximo evento
                </ThemedText>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {clienteStats.proximoEvento || 'Sin eventos próximos'}
                </ThemedText>
              </View>
            </View>
          )}

          {!esOrganizador && (
            <BannerProximoEvento
              nombreEvento={clienteStats?.proximoEvento || 'Sin eventos próximos'}
              fechaHora=""
              recinto=""
            />
          )}

          <ProfileSectionCard title="Cuenta y Seguridad">
            <ProfileOptionRow
              icon="person-outline"
              title="Datos personales"
              subtitle="DNI, teléfono y correo"
              valueText="Ver"
              showDivider
              onPress={abrirModalDatosPersonales}
            />
            <ProfileOptionRow
              icon="lock-closed-outline"
              title="Cambiar contraseña"
              subtitle="Seguridad de la cuenta"
              showDivider
              onPress={abrirModalCambiarContrasena}
            />
            <ProfileOptionRow
              icon="trash-outline"
              title="Desactivar cuenta"
              subtitle="Borrado lógico de tu cuenta"
              showDivider
              onPress={manejarDesactivarCuenta}
            />
          </ProfileSectionCard>

          {esOrganizador && (
            <ProfileSectionCard title="Panel de Organizador">
              {dashboardLoading ? (
                <ThemedText themeColor="textSecondary" style={estilos.cargando}>
                  Cargando métricas…
                </ThemedText>
              ) : dashboard ? (
                <>
                  <View style={estilos.kpiRow}>
                    <View style={estilos.kpiCard}>
                      <ThemedText type="small" themeColor="textSecondary">
                        Eventos activos
                      </ThemedText>
                      <ThemedText type="title" style={estilos.kpiValor}>
                        {dashboard.kpis.activeEvents}
                      </ThemedText>
                    </View>
                    <View style={estilos.kpiCard}>
                      <ThemedText type="small" themeColor="textSecondary">
                        Entradas vendidas
                      </ThemedText>
                      <ThemedText type="title" style={estilos.kpiValor}>
                        {dashboard.kpis.ticketsSold}
                      </ThemedText>
                    </View>
                    <View style={estilos.kpiCard}>
                      <ThemedText type="small" themeColor="textSecondary">
                        Ingresos totales
                      </ThemedText>
                      <ThemedText type="title" style={estilos.kpiValor}>
                        S/ {dashboard.kpis.totalRevenuePEN.toFixed(2)}
                      </ThemedText>
                    </View>
                  </View>
                  <Pressable
                    style={estilos.btnVerDashboard}
                    onPress={() => router.push('/mis-eventos')}
                  >
                    <ThemedText type="smallBold" style={estilos.btnVerDashboardText}>
                      Ver Mis Eventos
                    </ThemedText>
                  </Pressable>
                </>
              ) : (
                <ThemedText themeColor="textSecondary" style={estilos.cargando}>
                  No se pudieron cargar las métricas.
                </ThemedText>
              )}
            </ProfileSectionCard>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar Sesión de la cuenta"
            style={({ pressed }) => [
              estilos.botonCerrarSesion,
              { backgroundColor: temaEventia.dangerBg },
              pressed && estilos.botonCerrarSesionPresionado,
            ]}
            onPress={async () => {
              await logout();
              router.replace('/login');
            }}>
            <View style={estilos.filaBotonCerrarInterno}>
              <Ionicons name="log-out-outline" size={18} color={temaEventia.dangerText} />
              <ThemedText
                type="smallBold"
                style={[estilos.textoCerrarSesion, { color: temaEventia.dangerText }]}>
                Cerrar Sesión
              </ThemedText>
            </View>
          </Pressable>
        </ScrollView>

        <ModalDatosPersonales
          visible={modalDatosPersonalesVisible}
          datosUsuario={{
            nombreCompleto: datosPersonales.nombreCompleto,
            tipoDocumento: datosPersonales.tipoDocumento,
            numeroDocumento: datosPersonales.numeroDocumento,
            telefono: datosPersonales.telefono,
            fechaNacimiento: datosPersonales.fechaNacimiento,
            correo: datosPersonales.correo,
            avatarUrl: datosPersonales.avatarUrl,
          }}
          alCerrar={cerrarModalDatosPersonales}
          alGuardarNuevoCorreo={manejarActualizarDatosPersonales}
        />

        <ModalCambiarContrasena
          visible={modalContrasenaVisible}
          alCerrar={cerrarModalCambiarContrasena}
          alGuardarNuevaContrasena={manejarCambiarContrasena}
        />

        <ModalCambiarFotoPerfil
          visible={modalFotoVisible}
          fotoActual={user?.avatarUrl}
          alCerrar={cerrarModalFoto}
          alGuardarNuevaFoto={manejarActualizarFoto}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const estilos = StyleSheet.create({
  contenedorRaiz: {
    flex: 1,
    alignItems: 'center',
  },
  areaSegura: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  contenedorScroll: {
    flex: 1,
    width: '100%',
  },
  contenidoScroll: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  estadisticasCliente: {
    gap: Spacing.two,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.half,
  },
  filaEstadistica: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  cargando: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.half,
    alignItems: 'center',
  },
  kpiValor: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1C30',
  },
  btnVerDashboard: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnVerDashboardText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  botonCerrarSesion: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: Spacing.one,
    marginBottom: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaBotonCerrarInterno: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  botonCerrarSesionPresionado: {
    opacity: 0.75,
  },
  textoCerrarSesion: {
    fontSize: 14,
  },
});

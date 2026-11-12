import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { orderService } from '@/features/orders/services/orderService';
import type { Order } from '@/features/orders/types/order.types';
import {
  actualizarAvatarUsuario,
  actualizarContrasenaUsuario,
  actualizarCorreoUsuario,
  guardarPreferenciasUsuario,
  obtenerDatosPersonalesUsuario,
  obtenerPreferenciasUsuario,
  PREFERENCIAS_POR_DEFECTO,
  type DatosPersonalesCompletos,
  type PreferenciasPerfil,
} from '@/services/profile-service';

export default function ProfileScreen() {
  const router = useRouter();
  const tema = useTheme();
  const temaEventia = useEventiaTheme();
  const { user, isAuthenticated, isAdmin, isLoading, logout, actualizarUsuario } = useAuth();

  // Modales
  const [modalDatosPersonalesVisible, setModalDatosPersonalesVisible] = useState(false);
  const [modalContrasenaVisible, setModalContrasenaVisible] = useState(false);
  const [modalFotoVisible, setModalFotoVisible] = useState(false);
  const [modalPreferenciasVisible, setModalPreferenciasVisible] = useState(false);

  // Datos del perfil y preferencias
  const [datosPersonales, setDatosPersonales] = useState<DatosPersonalesCompletos>({
    nombreCompleto: user?.fullName || 'Usuario Eventia',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    telefono: user?.phoneNumber || '',
    fechaNacimiento: '14/08/1998',
    correo: user?.email || '',
  });

  const [preferencias, setPreferencias] = useState<PreferenciasPerfil>(
    PREFERENCIAS_POR_DEFECTO,
  );
  const [orders, setOrders] = useState<Order[]>([]);

  // Redirigir al login si no hay sesión activa
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Cargar datos, preferencias y órdenes reales del usuario autenticado
  useEffect(() => {
    async function cargarInformacionUsuario() {
      if (user?.email) {
        const datos = await obtenerDatosPersonalesUsuario(
          user.email,
          user.fullName || 'Usuario Eventia',
        );
        setDatosPersonales(datos);

        if (!user.avatarUrl && datos.avatarUrl) {
          await actualizarUsuario({ avatarUrl: datos.avatarUrl });
        }

        const pref = await obtenerPreferenciasUsuario(user.email);
        setPreferencias(pref);

        try {
          const misOrdenes = await orderService.getOrders(user.email);
          setOrders(misOrdenes);
        } catch {
          // fallback
        }
      }
    }
    cargarInformacionUsuario();
  }, [user?.email, user?.fullName, user?.avatarUrl]);

  // Manejadores de modales
  const abrirModalDatosPersonales = () => setModalDatosPersonalesVisible(true);
  const cerrarModalDatosPersonales = () => setModalDatosPersonalesVisible(false);

  const abrirModalCambiarContrasena = () => setModalContrasenaVisible(true);
  const cerrarModalCambiarContrasena = () => setModalContrasenaVisible(false);

  const abrirModalFoto = () => setModalFotoVisible(true);
  const cerrarModalFoto = () => setModalFotoVisible(false);

  const abrirModalPreferencias = () => setModalPreferenciasVisible(true);
  const cerrarModalPreferencias = () => setModalPreferenciasVisible(false);

  // Actualización de datos
  const manejarActualizarCorreo = async (nuevoCorreo: string) => {
    const correoActual = user?.email || '';
    const resultado = await actualizarCorreoUsuario(correoActual, nuevoCorreo);

    if (resultado.exito) {
      await actualizarUsuario({ email: nuevoCorreo });
      setDatosPersonales((prev) => ({ ...prev, correo: nuevoCorreo }));
    }

    return resultado;
  };

  const manejarActualizarContrasena = async (nuevaContrasena: string) => {
    const correoActual = user?.email || '';
    return await actualizarContrasenaUsuario(correoActual, nuevaContrasena);
  };

  const manejarActualizarFoto = async (nuevaFotoUrl: string) => {
    await actualizarUsuario({ avatarUrl: nuevaFotoUrl });
    if (user?.email) {
      await actualizarAvatarUsuario(user.email, nuevaFotoUrl);
    }
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

  const manejarCerrarSesion = async () => {
    await logout();
    router.replace('/login');
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  // Cálculos reales basados en órdenes del usuario
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingOrders = orders
    .filter((o) => {
      const d = new Date(o.eventDate);
      return isNaN(d.getTime()) || d >= today;
    })
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const totalTicketsActivos = upcomingOrders.reduce((sum, o) => sum + (o.totalTickets || 1), 0);
  const totalEventosComprados = orders.length;
  const proximoEvento = upcomingOrders[0];

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

          <FilaEstadisticasPerfil
            eventosAsistidos={totalEventosComprados}
            ticketsActivos={totalTicketsActivos}
          />

          {proximoEvento ? (
            <BannerProximoEvento
              nombreEvento={proximoEvento.eventTitle}
              fechaHora={`${proximoEvento.eventDate} ${proximoEvento.eventTime ? `• ${proximoEvento.eventTime}` : ''}`}
              recinto={proximoEvento.eventVenue}
            />
          ) : null}

          {isAdmin && (
            <ProfileSectionCard title="Administración Eventia">
              <ProfileOptionRow
                icon="speedometer-outline"
                title="Dashboard de Métricas"
                subtitle="Ingresos, tickets vendidos y stock"
                valueText="Métricas"
                showDivider
                onPress={() => router.push('/admin/dashboard' as never)}
              />
              <ProfileOptionRow
                icon="calendar-outline"
                title="Gestión de Eventos"
                subtitle="Crear, editar, eliminar y entradas"
                valueText="Catálogo"
                showDivider
                onPress={() => router.push('/admin/events' as never)}
              />
              <ProfileOptionRow
                icon="people-outline"
                title="Gestión de Usuarios"
                subtitle="Roles, accesos y restauración"
                valueText="Usuarios"
                onPress={() => router.push('/admin/users' as never)}
              />
            </ProfileSectionCard>
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
              onPress={abrirModalCambiarContrasena}
            />
          </ProfileSectionCard>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar Sesión de la cuenta"
            style={({ pressed }) => [
              estilos.botonCerrarSesion,
              { backgroundColor: temaEventia.dangerBg },
              pressed && estilos.botonCerrarSesionPresionado,
            ]}
            onPress={manejarCerrarSesion}>
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
          datosUsuario={datosPersonales}
          alCerrar={cerrarModalDatosPersonales}
          alGuardarNuevoCorreo={manejarActualizarCorreo}
        />

        <ModalCambiarContrasena
          visible={modalContrasenaVisible}
          alCerrar={cerrarModalCambiarContrasena}
          alGuardarNuevaContrasena={manejarActualizarContrasena}
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

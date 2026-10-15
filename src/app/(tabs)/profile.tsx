import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BannerProximoEvento,
  FilaEstadisticasPerfil,
  ModalCambiarContrasena,
  ModalCambiarFotoPerfil,
  ModalDatosPersonales,
  ModalPreferenciasUsuario,
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
  const { user, isAuthenticated, isLoading, logout, actualizarUsuario } = useAuth();

  // Modales
  const [modalDatosPersonalesVisible, setModalDatosPersonalesVisible] = useState(false);
  const [modalContrasenaVisible, setModalContrasenaVisible] = useState(false);
  const [modalFotoVisible, setModalFotoVisible] = useState(false);
  const [modalPreferenciasVisible, setModalPreferenciasVisible] = useState(false);

  // Datos del perfil y preferencias
  const [datosPersonales, setDatosPersonales] = useState<DatosPersonalesCompletos>({
    nombreCompleto: user?.fullName || 'Daniela Morales',
    tipoDocumento: 'DNI',
    numeroDocumento: '74829103',
    telefono: '+51 987 654 321',
    fechaNacimiento: '14/08/1998',
    correo: user?.email || 'daniela@eventia.io',
  });

  const [preferencias, setPreferencias] = useState<PreferenciasPerfil>(
    PREFERENCIAS_POR_DEFECTO,
  );

  // Redirigir al login si no hay sesión activa
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Cargar datos y preferencias del usuario autenticado
  useEffect(() => {
    async function cargarInformacionUsuario() {
      if (user?.email) {
        const datos = await obtenerDatosPersonalesUsuario(
          user.email,
          user.fullName || 'Daniela Morales',
        );
        setDatosPersonales(datos);

        if (!user.avatarUrl && datos.avatarUrl) {
          await actualizarUsuario({ avatarUrl: datos.avatarUrl });
        }

        const pref = await obtenerPreferenciasUsuario(user.email);
        setPreferencias(pref);
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
    const correoActual = user?.email || 'daniela@eventia.io';
    const resultado = await actualizarCorreoUsuario(correoActual, nuevoCorreo);

    if (resultado.exito) {
      await actualizarUsuario({ email: nuevoCorreo });
      setDatosPersonales((prev) => ({ ...prev, correo: nuevoCorreo }));
    }

    return resultado;
  };

  const manejarActualizarContrasena = async (nuevaContrasena: string) => {
    const correoActual = user?.email || 'daniela@eventia.io';
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
    const correoActual = user?.email || 'daniela@eventia.io';
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

  const textoCategorias =
    preferencias.categoriasFavoritas && preferencias.categoriasFavoritas.length > 0
      ? preferencias.categoriasFavoritas.slice(0, 2).join(', ') +
        (preferencias.categoriasFavoritas.length > 2
          ? ` (+${preferencias.categoriasFavoritas.length - 2})`
          : '')
      : 'Sin categorías';

  return (
    <ThemedView style={estilos.contenedorRaiz}>
      <SafeAreaView style={estilos.areaSegura} edges={['top']}>
        <ScrollView
          style={estilos.contenedorScroll}
          contentContainerStyle={estilos.contenidoScroll}
          showsVerticalScrollIndicator={false}>

          <TarjetaPerfilUsuario
            nombreCompleto={user?.fullName || datosPersonales.nombreCompleto}
            correo={user?.email || datosPersonales.correo}
            urlFoto={user?.avatarUrl}
            alPresionarEditar={abrirModalDatosPersonales}
            alPresionarCambiarFoto={abrirModalFoto}
          />

          <FilaEstadisticasPerfil eventosAsistidos={4} ticketsActivos={2} />

          <BannerProximoEvento
            nombreEvento="Sónar Festival • Barcelona"
            fechaHora="Viernes, 18 Julio • 20:30 hrs"
            recinto="Parc del Fòrum"
          />

          <ProfileSectionCard title="Cuenta & Seguridad">
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
              icon="card-outline"
              title="Métodos de pago"
              valueText="Visa •••• 4092"
              onPress={() => {}}
            />
          </ProfileSectionCard>

          <ProfileSectionCard title="Preferencias">
            <ProfileOptionRow
              icon="notifications-outline"
              title="Alertas de venta y fechas"
              subtitle="Recordatorios anticipados"
              isSwitch
              switchValue={preferencias.alertasVentas}
              onSwitchChange={manejarCambioAlertaVentas}
              showDivider
            />
            <ProfileOptionRow
              icon="options-outline"
              title="Música & Categorías"
              valueText={textoCategorias}
              onPress={abrirModalPreferencias}
            />
          </ProfileSectionCard>

          <ProfileSectionCard title="Asistencia">
            <ProfileOptionRow
              icon="help-circle-outline"
              title="Ayuda y Soporte 24/7"
              showDivider
              onPress={() => {}}
            />
            <ProfileOptionRow
              icon="shield-checkmark-outline"
              title="Políticas y privacidad"
              onPress={() => {}}
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
            <Ionicons name="log-out-outline" size={18} color={temaEventia.dangerText} />
            <ThemedText
              type="smallBold"
              style={[estilos.textoCerrarSesion, { color: temaEventia.dangerText }]}>
              Cerrar Sesión
            </ThemedText>
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

        <ModalPreferenciasUsuario
          visible={modalPreferenciasVisible}
          preferenciasActuales={preferencias}
          alCerrar={cerrarModalPreferencias}
          alGuardarPreferencias={manejarActualizarPreferencias}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: Spacing.one,
    marginBottom: Spacing.four,
  },
  botonCerrarSesionPresionado: {
    opacity: 0.75,
  },
  textoCerrarSesion: {
    fontSize: 14,
  },
});

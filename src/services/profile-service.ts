import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import api from './api';

/**
 * Servicio de perfil de usuario: gestión de datos personales,
 * credenciales, fotos y preferencias conectado a Spring Boot + MySQL.
 */

const isBackendConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL);

const CLAVE_PREFERENCIAS_STORAGE = '@eventia/profile_preferences_v1';
const CLAVE_USUARIOS_STORAGE = '@eventia/users';

export interface PreferenciasPerfil {
  alertasVentas: boolean;
  notificacionesCorreo: boolean;
  categoriasFavoritas: string[];
}

export interface DatosPersonalesCompletos {
  nombreCompleto: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  fechaNacimiento: string;
  correo: string;
  avatarUrl?: string;
}

export const PREFERENCIAS_POR_DEFECTO: PreferenciasPerfil = {
  alertasVentas: true,
  notificacionesCorreo: true,
  categoriasFavoritas: ['Electrónica', 'Indie'],
};

interface UsuarioAlmacenadoInterno {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  avatarUrl?: string;
}

/**
 * Obtiene la información personal completa del usuario desde MySQL (Spring Boot)
 * o desde la base de datos local en caso de desconexión.
 */
export async function obtenerDatosPersonalesUsuario(
  correoUsuario: string,
  nombreFallback = 'Usuario Eventia',
): Promise<DatosPersonalesCompletos> {
  if (isBackendConfigured && correoUsuario) {
    try {
      const response = await api.get<any>('/users/profile', {
        params: { email: correoUsuario },
      });
      if (response.data) {
        const u = response.data;
        const nombre = (u.fullName || `${u.firstName || ''} ${u.lastName || ''}`).trim();
        return {
          nombreCompleto: nombre || nombreFallback,
          tipoDocumento: u.documentType || 'DNI',
          numeroDocumento: u.documentNumber || '',
          telefono: u.phoneNumber || '',
          fechaNacimiento: '14/08/1998',
          correo: u.email || correoUsuario,
          avatarUrl: u.avatarUrl,
        };
      }
    } catch (e) {
      console.warn('[profile-service] Error obteniendo perfil de Spring Boot, usando local:', e);
    }
  }

  try {
    const normEmail = correoUsuario.trim().toLowerCase();
    const usuariosCrudos = await AsyncStorage.getItem(CLAVE_USUARIOS_STORAGE);

    if (usuariosCrudos) {
      const usuarios: UsuarioAlmacenadoInterno[] = JSON.parse(usuariosCrudos);
      const usuarioEncontrado = usuarios.find(
        (u) => u.email.trim().toLowerCase() === normEmail,
      );

      if (usuarioEncontrado) {
        return {
          nombreCompleto: `${usuarioEncontrado.firstName} ${usuarioEncontrado.lastName}`.trim(),
          tipoDocumento: usuarioEncontrado.documentType || 'DNI',
          numeroDocumento: usuarioEncontrado.documentNumber || '',
          telefono: usuarioEncontrado.phoneNumber || '',
          fechaNacimiento: usuarioEncontrado.birthDate || '14/08/1998',
          correo: usuarioEncontrado.email,
          avatarUrl: usuarioEncontrado.avatarUrl,
        };
      }
    }

    return {
      nombreCompleto: nombreFallback,
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      telefono: '',
      fechaNacimiento: '14/08/1998',
      correo: correoUsuario,
    };
  } catch (error) {
    console.error('[ProfileService] Error al obtener datos personales locales:', error);
    return {
      nombreCompleto: nombreFallback,
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      telefono: '',
      fechaNacimiento: '14/08/1998',
      correo: correoUsuario,
    };
  }
}

/**
 * Modifica exclusivamente el correo electrónico, validando que no esté duplicado.
 */
export async function actualizarCorreoUsuario(
  correoActual: string,
  nuevoCorreo: string,
): Promise<{ exito: boolean; mensaje: string }> {
  try {
    const normActual = correoActual.trim().toLowerCase();
    const normNuevo = nuevoCorreo.trim().toLowerCase();

    if (normActual === normNuevo) {
      return {
        exito: true,
        mensaje: 'El correo electrónico es el mismo que el actual.',
      };
    }

    if (isBackendConfigured) {
      try {
        const response = await api.put('/users/profile', {
          email: normNuevo,
        });
        if (response.data) {
          return {
            exito: true,
            mensaje: 'Correo electrónico actualizado correctamente.',
          };
        }
      } catch (e: any) {
        const errorMsg = e?.response?.data?.message || e?.message;
        throw new Error(errorMsg || 'Error al actualizar el correo en el servidor.');
      }
    }

    const usuariosCrudos = await AsyncStorage.getItem(CLAVE_USUARIOS_STORAGE);
    if (usuariosCrudos) {
      const usuarios: UsuarioAlmacenadoInterno[] = JSON.parse(usuariosCrudos);

      const duplicado = usuarios.some(
        (u) => u.email.trim().toLowerCase() === normNuevo,
      );
      if (duplicado) {
        throw new Error('Este correo electrónico ya se encuentra registrado por otro usuario.');
      }

      const indice = usuarios.findIndex(
        (u) => u.email.trim().toLowerCase() === normActual,
      );

      if (indice !== -1) {
        usuarios[indice].email = normNuevo;
        await AsyncStorage.setItem(CLAVE_USUARIOS_STORAGE, JSON.stringify(usuarios));
      }
    }

    const prefCrudas = await AsyncStorage.getItem(CLAVE_PREFERENCIAS_STORAGE);
    if (prefCrudas) {
      const mapa = JSON.parse(prefCrudas);
      if (mapa[normActual]) {
        mapa[normNuevo] = mapa[normActual];
        delete mapa[normActual];
        await AsyncStorage.setItem(CLAVE_PREFERENCIAS_STORAGE, JSON.stringify(mapa));
      }
    }

    return {
      exito: true,
      mensaje: 'Correo electrónico actualizado correctamente.',
    };
  } catch (error: any) {
    console.error('[ProfileService] Error al actualizar correo:', error);
    throw error;
  }
}

/**
 * Modifica la contraseña conectando directamente con Spring Boot + MySQL.
 */
export async function actualizarContrasenaUsuario(
  correoUsuario: string,
  nuevaContrasena: string,
  contrasenaActual?: string,
): Promise<{ exito: boolean; mensaje: string }> {
  try {
    const normEmail = correoUsuario.trim().toLowerCase();
    const contrasenaLimpia = nuevaContrasena.trim();

    if (contrasenaLimpia.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
    }
    if (!/[A-Za-z]/.test(contrasenaLimpia) || !/\d/.test(contrasenaLimpia)) {
      throw new Error('La nueva contraseña debe incluir al menos una letra y un número.');
    }

    // Con backend configurado, la contraseña real vive en la API (BCrypt).
    if (isBackendConfigured) {
      try {
        await api.patch('/users/me/password', { newPassword: contrasenaLimpia });
        return {
          exito: true,
          mensaje: '¡Contraseña actualizada con éxito!',
        };
      } catch (error: any) {
        const mensaje =
          error?.response?.data?.message ||
          'No se pudo actualizar la contraseña. Verifica tu conexión con el servidor.';
        console.error('[ProfileService] Error al actualizar contraseña en la API:', error);
        return { exito: false, mensaje };
      }
    }

    const usuariosCrudos = await AsyncStorage.getItem(CLAVE_USUARIOS_STORAGE);
    if (usuariosCrudos) {
      const usuarios: UsuarioAlmacenadoInterno[] = JSON.parse(usuariosCrudos);
      const indice = usuarios.findIndex(
        (u) => u.email.trim().toLowerCase() === normEmail,
      );

      if (indice !== -1) {
        const nuevoSalt = Crypto.randomUUID();
        const nuevoHash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          nuevoSalt + contrasenaLimpia,
        );
        usuarios[indice].salt = nuevoSalt;
        usuarios[indice].passwordHash = nuevoHash;
        await AsyncStorage.setItem(CLAVE_USUARIOS_STORAGE, JSON.stringify(usuarios));
      }
    }

    return {
      exito: true,
      mensaje: '¡Contraseña actualizada con éxito!',
    };
  } catch (error: any) {
    console.error('[ProfileService] Error al actualizar contraseña:', error);
    throw error;
  }
}

/**
 * Actualiza la foto de perfil en la base de datos de usuarios.
 */
export async function actualizarAvatarUsuario(
  correoUsuario: string,
  nuevaFotoUrl: string,
): Promise<void> {
  try {
    const normEmail = correoUsuario.trim().toLowerCase();
    const usuariosCrudos = await AsyncStorage.getItem(CLAVE_USUARIOS_STORAGE);
    if (usuariosCrudos) {
      const usuarios: UsuarioAlmacenadoInterno[] = JSON.parse(usuariosCrudos);
      const indice = usuarios.findIndex(
        (u) => u.email.trim().toLowerCase() === normEmail,
      );
      if (indice !== -1) {
        usuarios[indice].avatarUrl = nuevaFotoUrl;
        await AsyncStorage.setItem(CLAVE_USUARIOS_STORAGE, JSON.stringify(usuarios));
      }
    }
  } catch (error) {
    console.error('[ProfileService] Error al actualizar avatar:', error);
  }
}

/**
 * Obtiene las preferencias configuradas del usuario.
 */
export async function obtenerPreferenciasUsuario(
  correoUsuario: string,
): Promise<PreferenciasPerfil> {
  try {
    const datosCrudos = await AsyncStorage.getItem(CLAVE_PREFERENCIAS_STORAGE);
    if (!datosCrudos) {
      return PREFERENCIAS_POR_DEFECTO;
    }

    const mapaPreferencias: Record<string, PreferenciasPerfil> = JSON.parse(datosCrudos);
    const normalizado = correoUsuario.trim().toLowerCase();
    return mapaPreferencias[normalizado] || PREFERENCIAS_POR_DEFECTO;
  } catch (error) {
    console.error('[ProfileService] Error al obtener preferencias:', error);
    return PREFERENCIAS_POR_DEFECTO;
  }
}

/**
 * Guarda las preferencias del usuario en el almacenamiento local.
 */
export async function guardarPreferenciasUsuario(
  correoUsuario: string,
  nuevasPreferencias: PreferenciasPerfil,
): Promise<void> {
  try {
    const datosCrudos = await AsyncStorage.getItem(CLAVE_PREFERENCIAS_STORAGE);
    let mapaPreferencias: Record<string, PreferenciasPerfil> = {};

    if (datosCrudos) {
      mapaPreferencias = JSON.parse(datosCrudos);
    }

    const normalizado = correoUsuario.trim().toLowerCase();
    mapaPreferencias[normalizado] = nuevasPreferencias;

    await AsyncStorage.setItem(
      CLAVE_PREFERENCIAS_STORAGE,
      JSON.stringify(mapaPreferencias),
    );
  } catch (error) {
    console.error('[ProfileService] Error al guardar preferencias:', error);
    throw new Error('No se pudieron guardar las preferencias en el almacenamiento local.');
  }
}

/**
 * Función compatible para actualizar correo y/o contraseña en conjunto.
 */
export async function actualizarDatosPersonalesUsuario(
  correoActual: string,
  nuevoCorreo: string,
  nuevaContrasena?: string,
): Promise<{ exito: boolean; mensaje: string }> {
  if (nuevoCorreo !== correoActual) {
    await actualizarCorreoUsuario(correoActual, nuevoCorreo);
  }
  if (nuevaContrasena && nuevaContrasena.trim().length >= 8) {
    await actualizarContrasenaUsuario(nuevoCorreo, nuevaContrasena);
  }
  return {
    exito: true,
    mensaje: 'Datos actualizados con éxito.',
  };
}

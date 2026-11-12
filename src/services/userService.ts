import api from './api';
import { getAllUsers, toggleUserStatus as localToggleStatus, type StoredUserPublic } from './user-storage';

const isBackendConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL);

export interface AdminUserItem {
  id: string | number;
  fullName?: string;
  firstName: string;
  lastName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  phoneNumber?: string;
  role: 'ADMIN' | 'CLIENT' | string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export const userService = {
  /**
   * Obtiene la lista completa de usuarios desde MySQL / Spring Boot.
   */
  async getUsers(): Promise<AdminUserItem[]> {
    if (isBackendConfigured) {
      try {
        const response = await api.get<AdminUserItem[]>('/admin/users');
        if (Array.isArray(response.data)) {
          return response.data;
        }
      } catch (e) {
        console.warn('[userService.getUsers] Error consultando backend, usando fallback local:', e);
      }
    }
    const local = await getAllUsers();
    return local.map((u) => ({
      ...u,
      fullName: `${u.firstName} ${u.lastName}`,
    }));
  },

  /**
   * Activa o inactiva un usuario en la base de datos MySQL.
   */
  async updateUserStatus(id: string | number, active: boolean): Promise<AdminUserItem> {
    if (isBackendConfigured) {
      try {
        const response = await api.put<AdminUserItem>(`/admin/users/${id}/status`, {
          active,
          status: active ? 'ACTIVE' : 'INACTIVE',
        });
        if (response.data) {
          return response.data;
        }
      } catch (e) {
        console.warn('[userService.updateUserStatus] Error en backend, actualizando local:', e);
      }
    }

    const localUpdated = await localToggleStatus(String(id), active ? 'ACTIVE' : 'INACTIVE');
    return {
      ...localUpdated,
      fullName: `${localUpdated.firstName} ${localUpdated.lastName}`,
    };
  },
};

export default userService;


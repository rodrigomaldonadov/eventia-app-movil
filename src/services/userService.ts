import api from './api';
import type {
  UserResponseDto,
  UserUpdateRequestDto,
  UserPasswordChangeDto,
} from '@/types/user.types';

/**
 * Servicio de usuario autenticado (Integrante 3 · RF-03).
 * Endpoints: GET/PATCH /api/users/me, PUT /api/users/me/password
 */
export const userService = {
  /**
   * Obtiene el perfil completo del usuario autenticado.
   * Endpoint: GET /api/users/me
   */
  async getMyProfile(): Promise<UserResponseDto> {
    const response = await api.get<UserResponseDto>('/api/users/me');
    return response.data;
  },

  /**
   * Actualiza el perfil del usuario autenticado.
   * Endpoint: PATCH /api/users/me
   */
  async updateProfile(data: UserUpdateRequestDto): Promise<UserResponseDto> {
    const response = await api.patch<UserResponseDto>('/api/users/me', data);
    return response.data;
  },

  /**
   * Cambia la contraseña del usuario autenticado.
   * Endpoint: PUT /api/users/me/password
   */
  async changePassword(data: UserPasswordChangeDto): Promise<void> {
    await api.put('/api/users/me/password', data);
  },

  /**
   * Desactiva lógicamente la cuenta del usuario autenticado.
   * Endpoint: PATCH /api/users/me/deactivate
   */
  async deactivateAccount(): Promise<void> {
    await api.patch('/api/users/me/deactivate');
  },
};

export default userService;
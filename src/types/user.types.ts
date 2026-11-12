/**
 * Tipos de usuario para el módulo de perfil (Integrante 3 · RF-03).
 * Alinea los DTOs del backend (Spring Boot) con el frontend.
 * Los roles internos USER/ORGANIZER se muestran como Cliente/Organizador.
 */

export type UserRole = 'USER' | 'ORGANIZER';

/**
 * Respuesta de GET /auth/me y GET /api/users/me
 */
export interface UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  cellphone?: string | null;
  role: UserRole;
  active: boolean;
}

/**
 * Payload para PATCH /api/users/me
 */
export interface UserUpdateRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  cellphone?: string | null;
}

/**
 * Payload para PUT /api/users/me/password
 */
export interface UserPasswordChangeDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * Usuario autenticado en la sesión (extiende el tipo User de use-auth)
 */
export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export function mapUserResponseToSessionUser(dto: UserResponseDto): SessionUser {
  return {
    id: String(dto.id),
    fullName: `${dto.firstName} ${dto.lastName}`.trim(),
    email: dto.email,
    role: dto.role,
    avatarUrl: undefined,
  };
}

export function roleToLabel(role: UserRole): 'Cliente' | 'Organizador' {
  return role === 'ORGANIZER' ? 'Organizador' : 'Cliente';
}

export function isOrganizador(role: UserRole | undefined): boolean {
  return role === 'ORGANIZER';
}

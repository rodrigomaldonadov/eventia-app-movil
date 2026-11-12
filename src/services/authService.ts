import api, { getApiRootUrl } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  documentType?: 'DNI' | 'CE' | null;
  cellphone?: string | null;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

export interface RegisterResponse {
  success?: boolean;
  message?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  token?: string;
}

export const authService = {
  /**
   * Autentica al usuario contra el backend y devuelve el token JWT.
   */
  async login(data: LoginPayload): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data, {
      baseURL: getApiRootUrl(),
    });
    return response.data;
  },

  /**
   * Registers a new user on the Eventia backend.
   */
  async register(data: RegisterPayload): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Helper to extract friendly error message from Axios errors.
   */
  getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
    }
    if (typeof error === 'object' && error !== null && 'request' in error) {
      return 'No se pudo conectar con el servidor. Verifica que tu backend esté encendido y accesible.';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Ocurrió un error inesperado al procesar la solicitud.';
  },
};

export default authService;

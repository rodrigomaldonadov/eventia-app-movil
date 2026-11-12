import api from './api';
import type { OrganizerDashboardResponseDto } from '@/types/organizer-dashboard.types';

/**
 * Servicio del panel de organizador (Integrante 3 · RF-03 · P0).
 * Endpoint: GET /api/organizer/dashboard
 */
export const organizerService = {
  /**
   * Obtiene los KPIs y métricas del panel de organizador.
   * Endpoint: GET /api/organizer/dashboard
   */
  async getDashboard(): Promise<OrganizerDashboardResponseDto> {
    const response = await api.get<OrganizerDashboardResponseDto>(
      '/api/organizer/dashboard'
    );
    return response.data;
  },
};

export default organizerService;
import api from './api';
import type { TicketResponseDto } from '@/types/ticket-response.types';

/**
 * Servicio de tickets del usuario (Integrante 3 · RF-03 / Integrante 6 · RF-06).
 * Endpoint: GET /api/tickets/my
 */
export const ticketService = {
  /**
   * Obtiene los tickets del usuario autenticado.
   * Endpoint: GET /api/tickets/my
   */
  async getMyTickets(): Promise<TicketResponseDto[]> {
    const response = await api.get<TicketResponseDto[]>('/api/tickets/my');
    return response.data ?? [];
  },
};

export default ticketService;

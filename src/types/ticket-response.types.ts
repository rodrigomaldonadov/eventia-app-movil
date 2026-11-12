/**
 * Tipos para la respuesta de GET /api/tickets/my (Integrante 3 · RF-03).
 * Alinea con TicketResponseDto del backend.
 */

export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED' | 'EXPIRED';

export interface TicketResponseDto {
  id: number;
  orderId: number;
  eventId: number;
  eventTitle: string;
  ticketType: string;
  eventDate: string; // ISO datetime
  venue: string;
  status: TicketStatus;
}

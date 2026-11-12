import api from './api';
import type {
  EventDetailDto,
  StockValidationResult,
  TicketSelectionItem,
  TicketTypeDto,
} from '@/types/event.types';
import {
  EventDetailBackendDto,
  EventSummaryBackendDto,
  mapDetailToEventItem,
  mapSummaryToEventItem,
} from '@/utils/eventMapper';

const LEGACY_SLUG_TO_ID: Record<string, number> = {
  'neon-wave-2025': 1,
  'sonica-open-air': 2,
  'indie-rock-sessions': 3,
  'maridaje-craft-spirits': 4,
  'founders-night': 5,
  'tech-founders-summit': 6,
  'hamlet-contemporaneo': 3,
};

// Convierte el id recibido por ruta al ID numérico real del backend
export function resolveNumericEventId(rawId: string | number | undefined): number | null {
  if (typeof rawId === 'number' && Number.isFinite(rawId) && rawId > 0) {
    return rawId;
  }
  if (typeof rawId === 'string') {
    const trimmed = rawId.trim();
    const parsed = Number(trimmed);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
    if (LEGACY_SLUG_TO_ID[trimmed]) {
      return LEGACY_SLUG_TO_ID[trimmed];
    }
  }
  return null;
}

export const eventService = {
  // Obtiene la lista de eventos desde GET /api/events
  async getEvents(params?: Record<string, string | number | boolean | undefined>): Promise<EventDetailDto[]> {
    const response = await api.get<{ content?: EventDetailDto[] } | EventDetailDto[]>('/api/events', { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.content ?? [];
  },

  // Obtiene el detalle de un evento por su ID desde GET /api/events/{id}
  async getEventById(id: number | string): Promise<EventDetailDto> {
    const numericId = resolveNumericEventId(id);
    if (!numericId) {
      throw new Error('ID de evento inválido.');
    }

    const response = await api.get<EventDetailDto>(`/api/events/${numericId}`);
    return response.data;
  },

  // Obtiene las tarifas activas y el stock de un evento desde GET /api/events/{id}/ticket-types
  async getTicketTypesByEvent(eventId: number | string): Promise<TicketTypeDto[]> {
    const numericId = resolveNumericEventId(eventId);
    if (!numericId) {
      throw new Error('ID de evento inválido.');
    }

    const response = await api.get<TicketTypeDto[]>(`/api/events/${numericId}/ticket-types`);
    return Array.isArray(response.data) ? response.data : [];
  },

  // Valida que las cantidades seleccionadas no superen el stock disponible en el backend
  async validateTicketsStock(
    eventId: number,
    items: TicketSelectionItem[],
  ): Promise<StockValidationResult> {
    const ticketTypes = await this.getTicketTypesByEvent(eventId);

    let subtotal = 0;
    let totalTickets = 0;

    for (const selection of items) {
      if (selection.quantity <= 0) continue;

      const ticket = ticketTypes.find((t) => t.id === selection.ticketTypeId);
      if (!ticket || ticket.status === 'paused') {
        return {
          valid: false,
          eventId,
          subtotal: 0,
          totalTickets: 0,
          updatedTicketTypes: ticketTypes,
          message: 'Una de las entradas seleccionadas ya no está disponible.',
        };
      }

      if (ticket.availableCapacity <= 0) {
        return {
          valid: false,
          eventId,
          subtotal: 0,
          totalTickets: 0,
          updatedTicketTypes: ticketTypes,
          message: `La entrada "${ticket.name}" está agotada.`,
        };
      }

      if (selection.quantity > ticket.availableCapacity) {
        return {
          valid: false,
          eventId,
          subtotal: 0,
          totalTickets: 0,
          updatedTicketTypes: ticketTypes,
          message: `Solo quedan ${ticket.availableCapacity} entradas disponibles para "${ticket.name}".`,
        };
      }

      const maxPerTicket = ticket.maxPerPurchase ?? 10;
      if (selection.quantity > maxPerTicket) {
        return {
          valid: false,
          eventId,
          subtotal: 0,
          totalTickets: 0,
          updatedTicketTypes: ticketTypes,
          message: `Solo se pueden comprar hasta ${maxPerTicket} entradas de "${ticket.name}".`,
        };
      }

      subtotal += ticket.price * selection.quantity;
      totalTickets += selection.quantity;
    }

    if (totalTickets > 10) {
      return {
        valid: false,
        eventId,
        subtotal: 0,
        totalTickets: 0,
        updatedTicketTypes: ticketTypes,
        message: 'Solo se pueden comprar hasta 10 entradas por compra.',
      };
    }

    return {
      valid: true,
      eventId,
      subtotal: Math.round(subtotal * 100) / 100,
      totalTickets,
      updatedTicketTypes: ticketTypes,
    };
  },
};

export default eventService;

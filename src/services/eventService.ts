import api from './api';
import { getEventById as getMockEventById, EVENTS } from '@/data/events';
import type {
  EventDetailResponse,
  EventItem,
  EventListResponse,
  TicketAvailabilityResponse,
  ValidateTicketsPayload,
  ValidateTicketsResponse,
} from '@/types/event.types';
import {
  EventDetailBackendDto,
  EventSummaryBackendDto,
  mapDetailToEventItem,
  mapSummaryToEventItem,
} from '@/utils/eventMapper';

// Comprueba si se ha configurado la URL del backend
const isBackendConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL);

/**
 * Página genérica devuelta por el backend (Spring Data Page).
 */
interface BackendPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Filtros soportados por GET /api/events (Integrante 4 · backend):
 * q, categoryId, dateFrom, dateTo, city.
 */
export interface EventFilters {
  q?: string;
  categoryId?: string | number;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  city?: string;
  page?: number;
  size?: number;
}

/**
 * Servicio para consultar eventos y validar disponibilidad de entradas.
 * Conecta con el backend real cuando EXPO_PUBLIC_API_URL está definida;
 * de lo contrario, usa los datos locales de la aplicación.
 */
export const eventService = {
  /**
   * Obtiene la lista general de eventos.
   * Endpoint: GET /api/events (con filtros opcionales)
   * Convierte Page<EventSummaryResponseDto> -> EventItem[]
   */
  async getEvents(filters?: EventFilters): Promise<EventItem[]> {
    if (!isBackendConfigured) {
      return EVENTS;
    }

    try {
      const params: Record<string, string | number | boolean> = {};
      if (filters?.q) params.q = filters.q;
      if (filters?.categoryId !== undefined) params.categoryId = filters.categoryId;
      if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters?.dateTo) params.dateTo = filters.dateTo;
      if (filters?.city) params.city = filters.city;
      if (filters?.page !== undefined) params.page = filters.page;
      if (filters?.size !== undefined) params.size = filters.size;

      const response = await api.get<BackendPage<EventSummaryBackendDto>>('/events', {
        params,
      });

      const page = response.data as BackendPage<EventSummaryBackendDto>;
      return (page.content ?? []).map(mapSummaryToEventItem);
    } catch {
      return EVENTS;
    }
  },

  /**
   * Obtiene el detalle de un evento por su ID.
   * Endpoint: GET /api/events/:id
   */
  async getEventById(id: string): Promise<EventItem | null> {
    if (!isBackendConfigured) {
      return getMockEventById(id) ?? null;
    }

    try {
      const response = await api.get<EventDetailBackendDto>(`/events/${id}`);
      return mapDetailToEventItem(response.data);
    } catch {
      return getMockEventById(id) ?? null;
    }
  },

  /**
   * Obtiene los eventos del organizador autenticado.
   * Endpoint: GET /api/events/organizer
   */
  async getMyEvents(includeInactive = false): Promise<EventItem[]> {
    if (!isBackendConfigured) {
      return EVENTS.filter((e) => e.organizer === 'organizador');
    }

    try {
      const response = await api.get<BackendPage<EventSummaryBackendDto>>('/events/organizer', {
        params: { includeInactive },
      });

      const page = response.data as BackendPage<EventSummaryBackendDto>;
      return (page.content ?? []).map(mapSummaryToEventItem);
    } catch {
      return [];
    }
  },

  /**
   * Activa o desactiva un evento del organizador (borrado lógico).
   * Endpoint: PATCH /api/events/{id}/active
   */
  async toggleEventActive(eventId: string | number, active: boolean): Promise<void> {
    if (!isBackendConfigured) return;

    await api.patch(`/events/${eventId}/active`, null, {
      params: { active },
    });
  },

  /**
   * Consulta el stock disponible de un tipo de entrada.
   * Endpoint: GET /api/events/:eventId/tickets/:ticketId/availability
   */
  async checkTicketAvailability(
    eventId: string,
    ticketId: string,
  ): Promise<TicketAvailabilityResponse> {
    if (isBackendConfigured) {
      try {
        const response = await api.get<TicketAvailabilityResponse>(
          `/events/${eventId}/tickets/${ticketId}/availability`,
        );
        return response.data;
      } catch {
        // Continúa con la respuesta local si el backend no responde
      }
    }

    const event = getMockEventById(eventId);
    const ticket = event?.tickets.find((t) => t.id === ticketId);
    const available = ticket?.available ?? 0;

    return {
      ticketId,
      available,
      isAvailable: available > 0,
    };
  },

  /**
   * Valida la cantidad de entradas seleccionadas frente al stock disponible.
   * Endpoint: POST /api/events/:eventId/validate-tickets
   */
  async validateTickets(payload: ValidateTicketsPayload): Promise<ValidateTicketsResponse> {
    if (isBackendConfigured) {
      try {
        const response = await api.post<ValidateTicketsResponse>(
          `/events/${payload.eventId}/validate-tickets`,
          payload,
        );
        return response.data;
      } catch {
        // Continúa con la validación local si el backend no responde
      }
    }

    const event = getMockEventById(payload.eventId);
    if (!event) {
      return {
        valid: false,
        eventId: payload.eventId,
        subtotal: 0,
        totalTickets: 0,
        message: 'Evento no encontrado.',
      };
    }

    let subtotal = 0;
    let totalTickets = 0;

    for (const item of payload.items) {
      const ticket = event.tickets.find((t) => t.id === item.ticketId);
      if (!ticket || item.quantity > ticket.available) {
        return {
          valid: false,
          eventId: payload.eventId,
          subtotal: 0,
          totalTickets: 0,
          message: `No hay suficiente disponibilidad para la entrada "${ticket?.name ?? item.ticketId}".`,
        };
      }
      subtotal += ticket.price * item.quantity;
      totalTickets += item.quantity;
    }

    return {
      valid: true,
      eventId: payload.eventId,
      subtotal,
      totalTickets,
      message: 'Entradas validadas correctamente.',
    };
  },
};

export default eventService;

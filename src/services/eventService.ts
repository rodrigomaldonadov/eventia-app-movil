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

// Comprueba si se ha configurado la URL del backend
const isBackendConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL);

/**
 * Servicio para consultar eventos y validar disponibilidad de entradas.
 * Si hay un backend configurado, realiza las peticiones HTTP;
 * de lo contrario, responde usando los datos locales de la aplicación.
 */
export const eventService = {
  /**
   * Obtiene la lista general de eventos.
   * Endpoint: GET /api/events
   */
  async getEvents(params?: { category?: string; search?: string }): Promise<EventItem[]> {
    if (!isBackendConfigured) {
      return EVENTS;
    }

    try {
      const response = await api.get<EventListResponse | EventItem[]>('/events', { params });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data ?? EVENTS;
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
      const response = await api.get<EventDetailResponse | EventItem>(`/events/${id}`);
      if ('data' in response.data && response.data.data) {
        return response.data.data;
      }
      return (response.data as EventItem) ?? null;
    } catch {
      return getMockEventById(id) ?? null;
    }
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

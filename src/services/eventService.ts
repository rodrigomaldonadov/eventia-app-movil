import api from './api';
import { eventStorage } from './eventStorage';
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
 * de lo contrario, responde usando la persistencia reactiva en AsyncStorage (eventStorage).
 */
export const eventService = {
  /**
   * Obtiene la lista general de eventos (con filtrado opcional por categoría o búsqueda).
   */
  async getEvents(params?: { category?: string; search?: string }): Promise<EventItem[]> {
    if (!isBackendConfigured) {
      return eventStorage.getEvents(params);
    }

    try {
      const response = await api.get<EventListResponse | EventItem[]>('/events', { params });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data ?? eventStorage.getEvents(params);
    } catch {
      return eventStorage.getEvents(params);
    }
  },

  /**
   * Obtiene el detalle de un evento por su ID.
   */
  async getEventById(id: string): Promise<EventItem | null> {
    if (!isBackendConfigured) {
      return eventStorage.getEventById(id);
    }

    try {
      const response = await api.get<EventDetailResponse | EventItem>(`/events/${id}`);
      if ('data' in response.data && response.data.data) {
        return response.data.data;
      }
      return (response.data as EventItem) ?? null;
    } catch {
      return eventStorage.getEventById(id);
    }
  },

  /**
   * Consulta el stock disponible de un tipo de entrada.
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

    const event = await eventStorage.getEventById(eventId);
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

    const event = await eventStorage.getEventById(payload.eventId);
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

  // Funciones CRUD para Administrador
  createEvent: eventStorage.createEvent.bind(eventStorage),
  updateEvent: eventStorage.updateEvent.bind(eventStorage),
  deleteEvent: eventStorage.deleteEvent.bind(eventStorage),
  decrementBatchStock: eventStorage.decrementBatchStock.bind(eventStorage),
  getDashboardMetrics: eventStorage.getDashboardMetrics.bind(eventStorage),
};

export default eventService;

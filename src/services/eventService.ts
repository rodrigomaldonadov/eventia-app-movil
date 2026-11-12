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
        if (response.data) {
          return response.data;
        }
      } catch (err) {
        console.warn('[validateTickets] Error validando en backend, probando con datos locales/cacheados:', err);
      }
    }

    const event = (await this.getEventById(payload.eventId)) ?? (await eventStorage.getEventById(payload.eventId));
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

  // Funciones CRUD para Administrador conectadas a MySQL / Spring Boot
  async createEvent(eventData: Omit<EventItem, 'id'>): Promise<EventItem> {
    if (isBackendConfigured) {
      try {
        const mappedTickets = eventData.tickets?.map((t) => ({
          name: t.name,
          price: Number(t.price) || 0,
          available: Number(t.available) || 0,
          totalCapacity: Number(t.available) || 0,
          availableCapacity: Number(t.available) || 0,
          zone: t.name,
        }));
        const payload = {
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          venue: eventData.venue,
          location: eventData.venue,
          category: eventData.category,
          categoryName: eventData.category,
          imageUrl: eventData.imageUrl,
          bannerUrl: eventData.imageUrl,
          tickets: mappedTickets,
          ticketTypes: mappedTickets,
        };
        const response = await api.post<EventItem>('/events', payload);
        try {
          await eventStorage.createEvent(eventData);
        } catch {}
        return response.data;
      } catch (e) {
        console.warn('[eventService.createEvent] Error enviando al backend, usando local fallback:', e);
      }
    }
    return eventStorage.createEvent(eventData);
  },

  async updateEvent(id: string, updates: Partial<EventItem>): Promise<EventItem> {
    if (isBackendConfigured) {
      try {
        const mappedTickets = updates.tickets?.map((t) => ({
          name: t.name,
          price: Number(t.price) || 0,
          available: Number(t.available) || 0,
          totalCapacity: Number(t.available) || 0,
          availableCapacity: Number(t.available) || 0,
          zone: t.name,
        }));
        const payload = {
          title: updates.title,
          description: updates.description,
          date: updates.date,
          time: updates.time,
          venue: updates.venue,
          location: updates.venue,
          category: updates.category,
          categoryName: updates.category,
          imageUrl: updates.imageUrl,
          bannerUrl: updates.imageUrl,
          tickets: mappedTickets,
          ticketTypes: mappedTickets,
        };
        const response = await api.put<EventItem>(`/events/${id}`, payload);
        try {
          await eventStorage.updateEvent(id, updates);
        } catch {}
        return response.data;
      } catch (e) {
        console.warn('[eventService.updateEvent] Error enviando al backend, usando local fallback:', e);
      }
    }
    return eventStorage.updateEvent(id, updates);
  },

  async deleteEvent(id: string): Promise<boolean> {
    if (isBackendConfigured) {
      try {
        await api.delete(`/events/${id}`);
      } catch (e) {
        console.warn('[eventService.deleteEvent] Error en backend, eliminando local:', e);
      }
    }
    return eventStorage.deleteEvent(id);
  },

  decrementBatchStock: eventStorage.decrementBatchStock.bind(eventStorage),

  async getDashboardMetrics(): Promise<any> {
    if (isBackendConfigured) {
      try {
        const response = await api.get('/admin/dashboard');
        if (response.data) {
          return response.data;
        }
      } catch (e) {
        console.warn('[eventService.getDashboardMetrics] Error obteniendo de backend, usando local:', e);
      }
    }
    return eventStorage.getDashboardMetrics();
  },
};

export default eventService;

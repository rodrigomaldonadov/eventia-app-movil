import api from './api';
<<<<<<< HEAD
import { EVENTS } from '@/data/events';
=======
import { eventStorage } from './eventStorage';
>>>>>>> origin/feat/implGeneral
import type {
  EventDetailDto,
  EventItem,
  StockValidationResult,
  TicketSelectionItem,
  TicketTypeDto,
} from '@/types/event.types';
import {
  EventSummaryBackendDto,
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
<<<<<<< HEAD
 * Conecta con el backend real cuando EXPO_PUBLIC_API_URL está definida;
 * de lo contrario, usa los datos locales de la aplicación.
 */
export const eventService = {
  /**
   * Obtiene la lista general de eventos (catálogo).
   * Endpoint: GET /api/events (con filtros opcionales)
   * Convierte Page<EventSummaryResponseDto> -> EventItem[]
=======
 * Si hay un backend configurado, realiza las peticiones HTTP;
 * de lo contrario, responde usando la persistencia reactiva en AsyncStorage (eventStorage).
 */
export const eventService = {
  /**
   * Obtiene la lista general de eventos (con filtrado opcional por categoría o búsqueda).
>>>>>>> origin/feat/implGeneral
   */
  async getEvents(filters?: EventFilters): Promise<EventItem[]> {
    if (!isBackendConfigured) {
      return eventStorage.getEvents(params);
    }

    try {
<<<<<<< HEAD
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
=======
      const response = await api.get<EventListResponse | EventItem[]>('/events', { params });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data ?? eventStorage.getEvents(params);
>>>>>>> origin/feat/implGeneral
    } catch {
      return eventStorage.getEvents(params);
    }
  },

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/feat/implGeneral

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

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/feat/implGeneral
  },
};

export default eventService;

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { EVENTS } from '@/data/events';
import type { EventItem, TicketTier, TicketType } from '@/types/event.types';
import { orderService } from '@/features/orders/services/orderService';

const EVENTS_STORAGE_KEY = '@eventia_events_v2';

export interface CategorySalesSummary {
  general: number;
  vip: number;
  vipPlus: number;
}

export interface EventStockMetric {
  id: string;
  title: string;
  category: string;
  totalInitialStock: number;
  currentAvailableStock: number;
  ticketsSold: number;
  percentSold: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalTicketsSold: number;
  salesByCategory: CategorySalesSummary;
  revenueByCategory: CategorySalesSummary;
  popularEvents: {
    id: string;
    title: string;
    ticketsSold: number;
    revenue: number;
    imageUrl?: string;
  }[];
  stockMetrics: EventStockMetric[];
}

let writeLock = Promise.resolve();

function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeLock.then(fn, fn);
  writeLock = next.then(
    () => { },
    () => { },
  );
  return next;
}

export const eventStorage = {
  /**
   * Obtiene todos los eventos de AsyncStorage. Si no existen, los inicializa con los datos semilla.
   */
  async getEvents(params?: { category?: string; search?: string }): Promise<EventItem[]> {
    try {
      let events: EventItem[] = [];
      const raw = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          events = parsed;
        }
      }

      if (events.length === 0) {
        events = [...EVENTS];
        await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      }

      // Filtrado por categoría si se provee
      if (params?.category && params.category !== 'Todos') {
        events = events.filter((e) => e.category.toLowerCase() === params.category?.toLowerCase());
      }

      // Filtrado por búsqueda de texto
      if (params?.search && params.search.trim().length > 0) {
        const query = params.search.toLowerCase().trim();
        events = events.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.venue.toLowerCase().includes(query) ||
            e.city.toLowerCase().includes(query) ||
            e.description.toLowerCase().includes(query)
        );
      }

      return events;
    } catch (e) {
      console.error('[EventStorage] Error leyendo eventos:', e);
      return EVENTS;
    }
  },

  /**
   * Obtiene un evento específico por su identificador.
   */
  async getEventById(id: string): Promise<EventItem | null> {
    const list = await this.getEvents();
    return list.find((e) => e.id === id) ?? null;
  },

  /**
   * Crea un nuevo evento en el catálogo (Función de Administrador).
   */
  async createEvent(data: Omit<EventItem, 'id'> & { id?: string }): Promise<EventItem> {
    return withWriteLock(async () => {
      const list = await this.getEvents();
      const newEvent: EventItem = {
        ...data,
        id: data.id || `evt-${Crypto.randomUUID().slice(0, 8)}`,
      };
      const updated = [newEvent, ...list];
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
      return newEvent;
    });
  },

  /**
   * Actualiza un evento existente (Función de Administrador).
   */
  async updateEvent(id: string, updates: Partial<EventItem>): Promise<EventItem> {
    return withWriteLock(async () => {
      const list = await this.getEvents();
      const index = list.findIndex((e) => e.id === id);
      if (index === -1) {
        throw new Error(`Evento con ID ${id} no encontrado.`);
      }
      const updatedEvent: EventItem = {
        ...list[index],
        ...updates,
      };
      list[index] = updatedEvent;
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(list));
      return updatedEvent;
    });
  },

  /**
   * Elimina un evento del catálogo (Función de Administrador).
   */
  async deleteEvent(id: string): Promise<boolean> {
    return withWriteLock(async () => {
      const list = await this.getEvents();
      const filtered = list.filter((e) => e.id !== id);
      if (filtered.length === list.length) return false;
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    });
  },

  /**
   * Descuenta stock de entradas para un evento tras una compra confirmada.
   */
  async decrementBatchStock(
    items: { eventId: string; ticketId: string; quantity: number }[]
  ): Promise<boolean> {
    return withWriteLock(async () => {
      const list = await this.getEvents();
      let changed = false;

      for (const item of items) {
        const event = list.find((e) => e.id === item.eventId);
        if (!event) continue;

        const ticket = event.tickets.find((t) => t.id === item.ticketId);
        if (ticket) {
          ticket.available = Math.max(0, ticket.available - item.quantity);
          changed = true;
        }
      }

      if (changed) {
        await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(list));
      }
      return changed;
    });
  },

  /**
   * Calcula métricas agregadas del Dashboard de Administrador (Avance 3.5).
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [events, orders] = await Promise.all([
      this.getEvents(),
      orderService.getOrders(),
    ]);

    let totalRevenue = 0;
    let totalTicketsSold = 0;
    const salesByCategory: CategorySalesSummary = { general: 0, vip: 0, vipPlus: 0 };
    const revenueByCategory: CategorySalesSummary = { general: 0, vip: 0, vipPlus: 0 };

    const eventSalesMap = new Map<string, { ticketsSold: number; revenue: number }>();

    for (const order of orders) {
      if (order.status === 'PAGADA') {
        totalRevenue += order.total;

        for (const item of order.items) {
          totalTicketsSold += item.quantity;
          const itemRevenue = item.price * item.quantity;

          // Categorizar ventas
          const ticketIdLower = (item.ticketId || '').toLowerCase();
          const ticketNameLower = (item.ticketName || '').toLowerCase();

          if (ticketIdLower.includes('plus') || ticketNameLower.includes('+') || ticketNameLower.includes('plus')) {
            salesByCategory.vipPlus += item.quantity;
            revenueByCategory.vipPlus += itemRevenue;
          } else if (ticketIdLower.includes('vip') || ticketNameLower.includes('vip')) {
            salesByCategory.vip += item.quantity;
            revenueByCategory.vip += itemRevenue;
          } else {
            salesByCategory.general += item.quantity;
            revenueByCategory.general += itemRevenue;
          }

          // Agrupar por evento
          const prev = eventSalesMap.get(item.eventId) || { ticketsSold: 0, revenue: 0 };
          eventSalesMap.set(item.eventId, {
            ticketsSold: prev.ticketsSold + item.quantity,
            revenue: prev.revenue + itemRevenue,
          });
        }
      }
    }

    const popularEvents = events
      .map((e) => {
        const stats = eventSalesMap.get(e.id) || { ticketsSold: 0, revenue: 0 };
        return {
          id: e.id,
          title: e.title,
          ticketsSold: stats.ticketsSold,
          revenue: stats.revenue,
          imageUrl: e.imageUrl,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const stockMetrics: EventStockMetric[] = events.map((e) => {
      const stats = eventSalesMap.get(e.id) || { ticketsSold: 0, revenue: 0 };
      const currentAvailable = e.tickets.reduce((sum, t) => sum + t.available, 0);
      const totalInitial = currentAvailable + stats.ticketsSold;
      const percentSold = totalInitial > 0 ? Math.round((stats.ticketsSold / totalInitial) * 100) : 0;

      return {
        id: e.id,
        title: e.title,
        category: e.category,
        totalInitialStock: totalInitial,
        currentAvailableStock: currentAvailable,
        ticketsSold: stats.ticketsSold,
        percentSold,
      };
    });

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTicketsSold,
      salesByCategory,
      revenueByCategory,
      popularEvents,
      stockMetrics,
    };
  },
};

export default eventStorage;


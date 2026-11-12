import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import api from '@/services/api';
import type {
  BackendOrder,
  BackendTicket,
  CreateOrderParams,
  NominateTicketPayload,
  Order,
  OrderStatus,
} from '../types/order.types';

const ORDERS_STORAGE_KEY = '@eventia_orders_v1';

/**
 * Mapea un BackendOrder proveniente de Spring Boot a la interfaz Order de la UI.
 */
function mapBackendOrderToOrder(backendOrder: BackendOrder, fallbackParams?: Partial<CreateOrderParams>): Order {
  const details = backendOrder.details || [];
  const allTickets: BackendTicket[] = details.flatMap((d) => d.tickets || []);
  const firstTicket = allTickets[0];
  const totalTickets = details.reduce((sum, d) => sum + (d.quantity || 0), 0);

  const statusMap: Record<string, OrderStatus> = {
    PAID: 'PAGADA',
    PENDING: 'PENDIENTE',
    CANCELLED: 'CANCELADA',
  };

  const status: OrderStatus = statusMap[backendOrder.status] || 'PAGADA';

  const subtotal = backendOrder.totalAmount
    ? Math.round((backendOrder.totalAmount / 1.18) * 100) / 100
    : 0;
  const igv = Math.round((backendOrder.totalAmount - subtotal) * 100) / 100;

  // Convertir fecha del backend a formato legible
  let eventDateStr = 'Próximo evento';
  let eventTimeStr = 'Hora por confirmar';
  let isUpcoming = true;

  if (firstTicket?.eventDate) {
    try {
      const d = new Date(firstTicket.eventDate);
      eventDateStr = d.toLocaleDateString('es-PE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      eventTimeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} hrs`;
      isUpcoming = d.getTime() > Date.now();
    } catch {
      // Ignorar si formato ISO varía
    }
  }

  return {
    id: String(backendOrder.id),
    orderNumber: `EV-${String(backendOrder.id).padStart(5, '0')}`,
    eventId: String(firstTicket?.eventId || fallbackParams?.items?.[0]?.eventId || '1'),
    eventTitle: firstTicket?.eventTitle || fallbackParams?.items?.[0]?.eventTitle || 'Evento Eventia',
    eventDate: eventDateStr,
    eventTime: eventTimeStr,
    eventVenue: firstTicket?.venue || fallbackParams?.items?.[0]?.eventVenue || 'Recinto Principal',
    imageUrl: fallbackParams?.items?.[0]?.imageUrl,
    items: fallbackParams?.items || details.map((d) => ({
      id: `${firstTicket?.eventId || 1}_${d.ticketTypeId}`,
      eventId: String(firstTicket?.eventId || 1),
      eventTitle: firstTicket?.eventTitle || 'Evento',
      eventDate: eventDateStr,
      eventVenue: firstTicket?.venue || 'Recinto',
      ticketId: String(d.ticketTypeId),
      ticketName: d.ticketTypeName,
      price: d.unitPrice,
      quantity: d.quantity,
      available: 100,
    })),
    totalTickets: totalTickets || 1,
    subtotal,
    igv,
    total: backendOrder.totalAmount,
    status,
    buyerName: firstTicket?.nombre || fallbackParams?.buyerName || 'Titular',
    buyerEmail: fallbackParams?.buyerEmail || '',
    buyerDocument: firstTicket?.dni || fallbackParams?.buyerDocument,
    qrCode: firstTicket?.qrCode || `EVENTIA-ORDER-${backendOrder.id}`,
    paymentMethod: backendOrder.paymentMethod || 'Tarjeta',
    createdAt: backendOrder.createdAt || new Date().toISOString(),
    isUpcoming,
    tickets: allTickets,
  };
}

export const orderService = {
  /**
   * Crea una nueva orden conectando a POST /api/orders.
   * Incluye nominación con nombre y DNI del titular.
   */
  async createOrder(params: CreateOrderParams): Promise<Order> {
    const formattedPaymentMethod =
      params.paymentMethod && params.paymentMethod.toUpperCase().includes('CARD')
        ? 'CARD'
        : 'CARD';

    // Construir items para el backend: [{ ticketTypeId, quantity, nombre, dni, attendees }]
    const requestItems = params.items.map((item) => {
      const ticketTypeId = Number(item.ticketId) || 1;
      const attendees = Array.from({ length: item.quantity }, () => ({
        nombre: params.buyerName,
        dni: params.buyerDocument || '',
      }));

      return {
        ticketTypeId,
        quantity: item.quantity,
        nombre: params.buyerName,
        dni: params.buyerDocument || '',
        attendees,
      };
    });

    try {
      const response = await api.post<BackendOrder>('/orders', {
        paymentMethod: formattedPaymentMethod,
        items: requestItems,
      });

      if (response.data && response.data.id) {
        const order = mapBackendOrderToOrder(response.data, params);
        await this.saveLocalOrder(order);
        return order;
      }
    } catch (err: any) {
      console.warn('[OrderService]: Error al conectar con POST /api/orders, guardando localmente:', err?.message);
    }

    // Fallback local si el backend no responde
    const orderNum = `EV-${Math.floor(10000 + Math.random() * 90000)}`;
    const totalTickets = params.items.reduce((acc, i) => acc + i.quantity, 0);
    const primaryItem = params.items[0];

    const fallbackOrder: Order = {
      id: `ord_${Crypto.randomUUID().slice(0, 8)}`,
      orderNumber: orderNum,
      eventId: primaryItem?.eventId || '1',
      eventTitle: primaryItem?.eventTitle || 'Evento Eventia',
      eventDate: primaryItem?.eventDate || new Date().toLocaleDateString('es-PE'),
      eventTime: '19:00 hrs',
      eventVenue: primaryItem?.eventVenue || 'Recinto Principal, Lima',
      imageUrl: primaryItem?.imageUrl,
      items: params.items,
      totalTickets,
      subtotal: params.subtotal,
      igv: params.igv,
      total: params.total,
      status: 'PAGADA',
      buyerName: params.buyerName,
      buyerEmail: params.buyerEmail,
      buyerDocument: params.buyerDocument,
      qrCode: Crypto.randomUUID(),
      paymentMethod: params.paymentMethod,
      authorizationCode: params.authorizationCode || `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      isUpcoming: true,
    };

    await this.saveLocalOrder(fallbackOrder);
    return fallbackOrder;
  },

  /**
   * Obtiene las entradas del usuario autenticado vía GET /api/tickets/my.
   */
  async getMyTickets(): Promise<BackendTicket[]> {
    try {
      const response = await api.get<BackendTicket[]>('/tickets/my');
      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch (err: any) {
      console.warn('[OrderService]: Error al obtener GET /api/tickets/my:', err?.message);
    }
    return [];
  },

  /**
   * Obtiene el listado de órdenes desde GET /api/orders con filtros opcionales.
   * Sin pedidos semilla.
   */
  async getOrders(filters?: { status?: string; fromDate?: string; toDate?: string }): Promise<Order[]> {
    try {
      const params: Record<string, string> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.fromDate) params.fromDate = filters.fromDate;
      if (filters?.toDate) params.toDate = filters.toDate;

      const response = await api.get<any>('/orders', { params });
      const content = response.data?.content || (Array.isArray(response.data) ? response.data : []);

      if (Array.isArray(content) && content.length > 0) {
        const mapped = content.map((bo: BackendOrder) => mapBackendOrderToOrder(bo));
        await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err: any) {
      console.warn('[OrderService]: Error al consultar GET /api/orders:', err?.message);
    }

    // Si la API falla o está vacía, retornar las órdenes guardadas en sesión local
    try {
      const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignorar
    }

    return [];
  },

  /**
   * Nomina o renombra una entrada con nombre y DNI vía PATCH /api/tickets/{id}/nominate.
   */
  async nominateTicket(ticketId: number, payload: NominateTicketPayload): Promise<BackendTicket> {
    const response = await api.patch<BackendTicket>(`/tickets/${ticketId}/nominate`, payload);
    return response.data;
  },

  /**
   * Guarda una orden en el almacenamiento local.
   */
  async saveLocalOrder(order: Order): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      const list: Order[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((o) => o.id !== order.id && o.orderNumber !== order.orderNumber);
      filtered.unshift(order);
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('[OrderService]: Error al guardar en AsyncStorage:', e);
    }
  },

  /**
   * Busca una orden por su ID o número de orden.
   */
  async getOrderById(idOrNumber: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return (
      orders.find(
        (o) => o.id === idOrNumber || o.orderNumber === idOrNumber,
      ) || null
    );
  },
};

export default orderService;

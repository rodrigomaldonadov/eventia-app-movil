import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import api from '@/services/api';
<<<<<<< HEAD
import type {
  BackendOrder,
  BackendTicket,
  CreateOrderParams,
  NominateTicketPayload,
  Order,
  OrderStatus,
} from '../types/order.types';
=======
import type { CartItem } from '@/types/cart.types';
import type { CreateOrderParams, Order } from '../types/order.types';
>>>>>>> origin/feat/implGeneral

const ORDERS_STORAGE_KEY = '@eventia_orders_v1';
const isBackendConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL);

<<<<<<< HEAD
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
    totalTickets,
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
=======
interface BackendTicketDTO {
  id: number;
  qrCode: string;
  eventTitle: string;
  eventLocation: string;
  eventDate: string;
  ticketTypeName: string;
  price: number;
  status: string;
  createdAt: string;
}

interface BackendOrderDTO {
  id: number;
  userId?: number;
  userEmail?: string;
  totalAmount: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
  tickets?: BackendTicketDTO[];
>>>>>>> origin/feat/implGeneral
}

export const orderService = {
  /**
<<<<<<< HEAD
   * Crea una nueva orden conectando a POST /api/orders.
   * Incluye nominación con nombre y DNI del titular.
=======
   * Crea una nueva orden a partir de los datos del carrito y el pago.
   * Envía la orden a MySQL a través de Spring Boot y descuenta el stock real.
>>>>>>> origin/feat/implGeneral
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

<<<<<<< HEAD
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
=======
    // 1. Guardar en Backend Spring Boot + MySQL
    if (isBackendConfigured) {
      try {
        const payload = {
          buyerName: params.buyerName,
          buyerEmail: params.buyerEmail,
          buyerDocument: params.buyerDocument,
          paymentMethod: params.paymentMethod,
          totalAmount: params.total,
          items: params.items.map((it) => {
            const parsedId = parseInt(it.ticketId, 10);
            return {
              ticketTypeId: !isNaN(parsedId) && parsedId > 0 ? parsedId : 1,
              quantity: it.quantity,
              unitPrice: it.price,
            };
          }),
        };

        const response = await api.post<BackendOrderDTO>('/orders', payload);
        if (response.data && response.data.id) {
          newOrder.orderNumber = `EV-${response.data.id}`;
          newOrder.id = `ord_${response.data.id}`;
        }
      } catch (e) {
        console.warn('[orderService.createOrder] Error guardando en backend:', e);
      }
    }

    // 2. Guardar en AsyncStorage local como respaldo
    try {
      const existing = await this.getLocalOrders();
      const updated = [newOrder, ...existing];
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[orderService.createOrder] Error guardando local:', e);
    }

    return newOrder;
  },

  /**
   * Obtiene las órdenes del usuario desde MySQL (Spring Boot) si hay conexión,
   * o desde AsyncStorage si está sin red.
   */
  async getOrders(userEmail?: string): Promise<Order[]> {
    if (isBackendConfigured) {
      try {
        const params = userEmail ? { email: userEmail } : undefined;
        const response = await api.get<BackendOrderDTO[]>('/orders/my-orders', { params });

        if (Array.isArray(response.data)) {
          return response.data.map((bo) => {
            const firstTicket = bo.tickets?.[0];
            const eventTitle = firstTicket?.eventTitle || 'Evento Eventia';
            const eventDate = firstTicket?.eventDate || 'Fecha por confirmar';
            const eventVenue = firstTicket?.eventLocation || 'Lima, Perú';

            // Agrupar tickets por tipo para mostrar cantidades consolidadas (ej. 2x General)
            const groupedItemsMap = new Map<string, CartItem>();
            if (bo.tickets && bo.tickets.length > 0) {
              for (const t of bo.tickets) {
                const key = t.ticketTypeName || 'Entrada';
                const existing = groupedItemsMap.get(key);
                if (existing) {
                  existing.quantity += 1;
                } else {
                  groupedItemsMap.set(key, {
                    id: String(t.id),
                    eventId: 'evt_db',
                    eventTitle: t.eventTitle,
                    eventDate: t.eventDate,
                    eventVenue: t.eventLocation,
                    ticketId: String(t.id),
                    ticketName: t.ticketTypeName,
                    price: t.price,
                    quantity: 1,
                    available: 0,
                  });
                }
              }
            }
            const items: CartItem[] = Array.from(groupedItemsMap.values());

            const totalTickets = bo.tickets?.length || 1;
            const subtotal = Math.round((bo.totalAmount / 1.18) * 100) / 100;
            const igv = Math.round((bo.totalAmount - subtotal) * 100) / 100;

            const isUpcoming = true;

            return {
              id: `ord_${bo.id}`,
              orderNumber: `EV-${bo.id}`,
              eventId: 'evt_db',
              eventTitle,
              eventDate,
              eventTime: '20:00 hrs',
              eventVenue,
              items,
              totalTickets,
              subtotal,
              igv,
              total: bo.totalAmount,
              status: bo.paymentStatus === 'PAID' ? 'PAGADA' : 'PENDIENTE',
              buyerName: 'Comprador Registrado',
              buyerEmail: bo.userEmail || '',
              buyerDocument: 'DNI Verificado',
              qrCode: firstTicket?.qrCode || `EVENTIA-EV-${bo.id}-VALIDPASS`,
              paymentMethod: bo.paymentMethod || 'Tarjeta',
              authorizationCode: `AUTH-00${bo.id}`,
              createdAt: bo.createdAt || new Date().toISOString(),
              isUpcoming,
            };
          });
        }
      } catch (e) {
        console.warn('[orderService.getOrders] Error obteniendo órdenes del backend, usando local:', e);
      }
    }

    return this.getLocalOrders();
  },

  /**
   * Obtiene las órdenes guardadas en AsyncStorage.
   */
  async getLocalOrders(): Promise<Order[]> {
>>>>>>> origin/feat/implGeneral
    try {
      const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
<<<<<<< HEAD
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
=======
      return [];
    } catch {
      return [];
>>>>>>> origin/feat/implGeneral
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import api from '@/services/api';
import type { CartItem } from '@/types/cart.types';
import type { CreateOrderParams, Order } from '../types/order.types';

const ORDERS_STORAGE_KEY = '@eventia_orders_v1';
const isBackendConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL);

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
}

export const orderService = {
  /**
   * Crea una nueva orden a partir de los datos del carrito y el pago.
   * Envía la orden a MySQL a través de Spring Boot y descuenta el stock real.
   */
  async createOrder(params: CreateOrderParams): Promise<Order> {
    const primaryItem = params.items[0];
    const orderNum = `EV-${Math.floor(10000 + Math.random() * 90000)}`;
    const totalTickets = params.items.reduce((acc, i) => acc + i.quantity, 0);

    const newOrder: Order = {
      id: `ord_${Crypto.randomUUID().slice(0, 8)}`,
      orderNumber: orderNum,
      eventId: primaryItem?.eventId || 'general-event',
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
      qrCode: `EVENTIA-${orderNum}-${Date.now().toString(36).toUpperCase()}-VALIDPASS`,
      paymentMethod: params.paymentMethod,
      authorizationCode: params.authorizationCode || `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      isUpcoming: true,
    };

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
    try {
      const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import type { CreateOrderParams, Order } from '../types/order.types';

const ORDERS_STORAGE_KEY = '@eventia_orders_v1';

// Datos semilla basados en Stitch Vista 8 para pruebas y demo inmediata
const SEED_ORDERS: Order[] = [
  {
    id: 'ord-nova-sound-2026',
    orderNumber: 'EV-10492',
    eventId: 'nova-sound-festival',
    eventTitle: 'Nova Sound Festival 2026',
    eventDate: 'Sábado 24 Octubre, 2026',
    eventTime: '16:00 hrs',
    eventVenue: 'Parque Bicentenario, CDMX',
    imageUrl:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    items: [
      {
        id: 'nova_gen',
        eventId: 'nova-sound-festival',
        eventTitle: 'Nova Sound Festival 2026',
        eventDate: '2026-10-24',
        eventVenue: 'Parque Bicentenario, CDMX',
        ticketId: 'gen',
        ticketName: 'General Pass',
        price: 65,
        quantity: 2,
        available: 100,
      },
      {
        id: 'nova_vip',
        eventId: 'nova-sound-festival',
        eventTitle: 'Nova Sound Festival 2026',
        eventDate: '2026-10-24',
        eventVenue: 'Parque Bicentenario, CDMX',
        ticketId: 'vip',
        ticketName: 'VIP Experience',
        price: 140,
        quantity: 1,
        available: 30,
      },
    ],
    totalTickets: 3,
    subtotal: 270,
    igv: 48.6,
    total: 318.6,
    status: 'PAGADA',
    buyerName: 'Daniela Morales',
    buyerEmail: 'daniela@eventia.io',
    buyerDocument: '41.890.321-K',
    qrCode: 'EVENTIA-EV-10492-VERIFIED-PASS-3X-ENTRADAS',
    paymentMethod: 'Mercado Pago (Tarjeta)',
    authorizationCode: 'AUTH-891042',
    createdAt: new Date().toISOString(),
    isUpcoming: true,
  },
  {
    id: 'ord-indie-summit-2025',
    orderNumber: 'EV-08311',
    eventId: 'indie-summit-lima',
    eventTitle: 'Lima Indie Music Summit 2025',
    eventDate: '15 Enero, 2025',
    eventTime: '20:00 hrs',
    eventVenue: 'Barranco Arena, Lima',
    imageUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
    items: [
      {
        id: 'indie_std',
        eventId: 'indie-summit-lima',
        eventTitle: 'Lima Indie Music Summit 2025',
        eventDate: '2025-01-15',
        eventVenue: 'Barranco Arena, Lima',
        ticketId: 'std',
        ticketName: 'Pase General',
        price: 90,
        quantity: 1,
        available: 50,
      },
    ],
    totalTickets: 1,
    subtotal: 90,
    igv: 16.2,
    total: 106.2,
    status: 'PAGADA',
    buyerName: 'Daniela Morales',
    buyerEmail: 'daniela@eventia.io',
    buyerDocument: '41.890.321-K',
    qrCode: 'EVENTIA-EV-08311-COMPLETED',
    paymentMethod: 'Tarjeta de Crédito',
    authorizationCode: 'AUTH-112093',
    createdAt: '2025-01-10T14:30:00.000Z',
    isUpcoming: false,
  },
];

export const orderService = {
  /**
   * Crea una nueva orden a partir de los datos del carrito y el pago.
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

    try {
      const existing = await this.getOrders();
      const updated = [newOrder, ...existing];
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[OrderService]: Error al guardar la orden en AsyncStorage', e);
    }

    return newOrder;
  },

  /**
   * Obtiene todas las órdenes almacenadas o carga los datos semilla.
   */
  async getOrders(): Promise<Order[]> {
    try {
      const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Inicializar con datos semilla si es la primera vez
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    } catch {
      return SEED_ORDERS;
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

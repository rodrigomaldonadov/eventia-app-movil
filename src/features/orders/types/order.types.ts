import type { CartItem } from '@/types/cart.types';

export type OrderStatus = 'PAGADA' | 'PENDIENTE' | 'CANCELADA';

export type OrderTabType = 'upcoming' | 'past';

export interface BackendTicket {
  id: number;
  orderId: number;
  eventId: number;
  eventTitle: string;
  ticketType: string;
  eventDate: string;
  venue: string;
  status: 'VALID' | 'USED' | 'CANCELLED';
  nombre?: string;
  dni?: string;
  qrCode: string;
}

export interface BackendOrderDetail {
  ticketTypeId: number;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountApplied: number;
  tickets: BackendTicket[];
}

export interface BackendOrder {
  id: number;
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string;
  status: 'PAID' | 'PENDING' | 'CANCELLED';
  createdAt: string;
  details: BackendOrderDetail[];
}

export interface NominateTicketPayload {
  nombre: string;
  dni: string;
}

export interface OrderTicketItem {
  ticketId: string;
  ticketName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  eventVenue: string;
  imageUrl?: string;
  items: CartItem[];
  totalTickets: number;
  subtotal: number;
  igv: number;
  total: number;
  status: OrderStatus;
  buyerName: string;
  buyerEmail: string;
  buyerDocument?: string;
  qrCode: string;
  paymentMethod: string;
  authorizationCode?: string;
  createdAt: string;
  isUpcoming: boolean;
  tickets?: BackendTicket[];
}

export interface CreateOrderParams {
  items: CartItem[];
  subtotal: number;
  igv: number;
  total: number;
  buyerName: string;
  buyerEmail: string;
  buyerDocument?: string;
  paymentMethod: string;
  authorizationCode?: string;
}

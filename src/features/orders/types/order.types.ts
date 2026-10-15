import type { CartItem } from '@/types/cart.types';

export type OrderStatus = 'PAGADA' | 'PENDIENTE' | 'CANCELADA';

export type OrderTabType = 'upcoming' | 'past';

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

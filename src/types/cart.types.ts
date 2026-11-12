// Estructura de cada entrada guardada en el carrito
export interface CartItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventLocation?: string;
  imageUrl?: string;
  bannerUrl?: string | null;
  ticketTypeId?: number;
  ticketId: string;
  ticketName: string;
  zone?: string | null;
  price: number;
  quantity: number;
  available: number;
  availableCapacity?: number;
  maxPerPurchase?: number;
}

export interface CartSummary {
  items: CartItem[];
  totalTickets: number;
  subtotal: number;
  igv: number;
  total: number;
}

export interface OrderRequestItemDto {
  ticketTypeId: number;
  quantity: number;
}

export interface OrderRequestDto {
  paymentMethod: string;
  items: OrderRequestItemDto[];
}

export interface CheckoutOrderPayload {
  orderId: string;
  items: CartItem[];
  orderItems: OrderRequestItemDto[];
  subtotal: number;
  igv: number;
  total: number;
  createdAt: string;
}

/**
 * Modelos de datos para el carrito de compras.
 * Define la estructura de items seleccionados, resumen de totales y la orden de compra.
 */

export interface CartItem {
  id: string; // `${eventId}_${ticketId}`
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  imageUrl?: string;
  ticketId: string;
  ticketName: string;
  price: number;
  quantity: number;
  available: number;
}

export interface CartSummary {
  items: CartItem[];
  totalTickets: number;
  subtotal: number;
  igv: number;
  total: number;
}

/**
 * Estructura de la orden para procesar la transacción y pasarela de pago.
 */
export interface CheckoutOrderPayload {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  igv: number;
  total: number;
  createdAt: string;
}

/**
 * Tipos de datos para el módulo de Eventos.
 * Define las entidades y los formatos de solicitud y respuesta de la API.
 */

export type EventCategory =
  | 'Música'
  | 'Tech & Startups'
  | 'Festivales'
  | 'Gastronomía'
  | 'Teatro'
  | 'Networking';

export interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
  description?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  /** Fecha en formato ISO (YYYY-MM-DD). */
  date: string;
  time: string;
  venue: string;
  city: string;
  description: string;
  organizer: string;
  featured: boolean;
  imageUrl?: string;
  edition?: string;
  tickets: TicketType[];
}

/* =======================================================
 * CONTRATOS API REST: RESPONSES & REQUESTS (BACKEND DTOs)
 * ======================================================= */

/**
 * Respuesta del backend al consultar el detalle de un evento:
 * GET /api/events/:id
 */
export interface EventDetailResponse {
  success?: boolean;
  data: EventItem;
  message?: string;
}

/**
 * Respuesta del backend al listar eventos:
 * GET /api/events
 */
export interface EventListResponse {
  success?: boolean;
  data: EventItem[];
  total?: number;
  message?: string;
}

/**
 * Elemento de selección de entrada para validaciones y reservas.
 */
export interface TicketSelectionItem {
  ticketId: string;
  quantity: number;
}

/**
 * Payload enviado al backend para validar disponibilidad y cálculo de precios:
 * POST /api/events/:id/validate-tickets
 */
export interface ValidateTicketsPayload {
  eventId: string;
  items: TicketSelectionItem[];
}

/**
 * Respuesta del backend tras validar entradas seleccionadas.
 */
export interface ValidateTicketsResponse {
  valid: boolean;
  eventId: string;
  subtotal: number;
  totalTickets: number;
  message?: string;
}

/**
 * Respuesta de disponibilidad de stock en tiempo real:
 * GET /api/events/:id/tickets/:ticketId/availability
 */
export interface TicketAvailabilityResponse {
  ticketId: string;
  available: number;
  isAvailable: boolean;
}

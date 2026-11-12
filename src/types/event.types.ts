export type EventStatus = 'PENDING' | 'PUBLISHED' | 'CANCELLED' | 'FINISHED';

export type TicketTypeComputedStatus = 'active' | 'sold_out' | 'paused';

// Estructura del detalle de evento devuelta por GET /api/events/{id}
export interface EventDetailDto {
  id: number;
  title: string;
  description: string | null;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  bannerUrl: string | null;
  status: EventStatus;
  active: boolean;
  categoryId: number | null;
  categoryName: string | null;
  organizerId: number | null;
  organizerName: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Estructura de tipo de entrada devuelta por GET /api/events/{eventId}/ticket-types
export interface TicketTypeDto {
  id: number;
  eventId: number;
  eventTitle: string;
  name: string;
  zone: string | null;
  price: number;
  totalCapacity: number;
  availableCapacity: number;
  soldCount: number;
  status: TicketTypeComputedStatus;
  maxPerPurchase: number;
  isPresale: boolean;
  saleStartDate: string | null;
  saleEndDate: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketSelectionItem {
  ticketTypeId: number;
  quantity: number;
}

export interface StockValidationResult {
  valid: boolean;
  eventId: number;
  subtotal: number;
  totalTickets: number;
  updatedTicketTypes?: TicketTypeDto[];
  message?: string;
}

// Tipos mantenidos para compatibilidad con el catálogo actual
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

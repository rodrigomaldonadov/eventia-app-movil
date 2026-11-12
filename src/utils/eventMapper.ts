/**
 * eventMapper.ts (Integrante 4 · RF-04)
 *
 * Mapper compartido entre los DTOs del backend (Spring Boot) y el tipo
 * frontend `EventItem`. Centraliza la conversión para que el catálogo,
 * el detalle y "Mis eventos" usen siempre la misma forma de datos.
 *
 * Backend DTOs (resumen y detalle) usan snake/camel de Java:
 *   - id, title, description, date, startTime, endTime, location,
 *     capacity, bannerUrl, categoryName, status, active, categoryId,
 *   - organizerId, organizerName, createdAt, updatedAt (solo detalle)
 *
 * Frontend EventItem:
 *   - id, title, category, date, time, venue, city, description,
 *     organizer, featured, imageUrl, edition, tickets
 */

import type { EventItem, TicketType } from '@/types/event.types';

/**
 * DTO de respuesta resumida del backend: GET /api/events (Page<EventSummaryResponseDto>)
 */
export interface EventSummaryBackendDto {
  id: number | string;
  title: string;
  description: string;
  date: string; // LocalDate (YYYY-MM-DD)
  startTime: string; // LocalTime (HH:MM)
  endTime: string;
  location: string;
  capacity: number;
  bannerUrl?: string | null;
  categoryName: string;
  status: string;
  active: boolean;
}

/**
 * DTO de detalle del backend: GET /api/events/{id}
 */
export interface EventDetailBackendDto extends EventSummaryBackendDto {
  categoryId?: number | string;
  organizerId?: number | string;
  organizerName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Convierte un EventSummaryResponseDto del backend en un EventItem del frontend.
 * Los tipos de entrada no vienen en el listado, por eso tickets = [].
 * El detalle se enriquece por separado con getEventById.
 */
export function mapSummaryToEventItem(dto: EventSummaryBackendDto): EventItem {
  return {
    id: String(dto.id),
    title: dto.title,
    category: mapCategoryName(dto.categoryName),
    date: dto.date,
    time: dto.startTime ?? '',
    venue: dto.location,
    city: extractCity(dto.location),
    description: dto.description,
    organizer: dto.categoryName, // placeholder; el backend no expone organizador en el resumen
    featured: false,
    imageUrl: dto.bannerUrl ?? undefined,
    edition: undefined,
    tickets: [], // se poblan al consultar el detalle del evento
  };
}

/**
 * Convierte un EventDetailResponseDto del backend en un EventItem del frontend,
 * incluyendo los tipos de entrada (ticket types) si el backend los expone.
 * Como el DTO actual no incluye ticket types, se mapea una lista vacía;
 * el frontend puede completarlos con GET /api/events/{id}/ticket-types.
 */
export function mapDetailToEventItem(dto: EventDetailBackendDto): EventItem {
  return {
    id: String(dto.id),
    title: dto.title,
    category: mapCategoryName(dto.categoryName),
    date: dto.date,
    time: dto.startTime ?? '',
    venue: dto.location,
    city: extractCity(dto.location),
    description: dto.description,
    organizer: dto.organizerName ?? dto.categoryName,
    featured: false,
    imageUrl: dto.bannerUrl ?? undefined,
    edition: undefined,
    tickets: [], // ticket types se obtienen por endpoint separado
  };
}

/**
 * Normaliza el nombre de categoría del backend a un EventCategory válido.
 * Si el nombre no encaja exactamente, devuelve el primero que coincida o 'Networking'.
 */
function mapCategoryName(categoryName: string): EventItem['category'] {
  const valid: EventItem['category'][] = [
    'Música',
    'Tech & Startups',
    'Festivales',
    'Gastronomía',
    'Teatro',
    'Networking',
  ];
  const exact = valid.find((c) => c.toLowerCase() === categoryName.toLowerCase());
  if (exact) return exact;
  const contains = valid.find((c) => categoryName.toLowerCase().includes(c.toLowerCase()));
  return contains ?? 'Networking';
}

/**
 * Extrae la ciudad del campo `location` del backend.
 * El backend usa `location` (ej. "Arena 1, San Miguel"); el frontend espera
 * `venue` (lugar) y `city` (ciudad) por separado. Intenta separar por coma.
 */
function extractCity(location: string): string {
  const parts = location.split(',').map((p) => p.trim());
  return parts.length > 1 ? parts[parts.length - 1] : 'Lima';
}

export type { EventSummaryBackendDto, EventDetailBackendDto };

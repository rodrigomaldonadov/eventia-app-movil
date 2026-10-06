/**
 * Datos mock del catálogo de eventos (Integrante 4: Navegación + Home/Catálogo).
 *
 * Categorías alineadas con la guía visual del catálogo. La forma de
 * `EventItem` sigue la ficha del documento: nombre, fecha, lugar,
 * descripción, organizador, tipos de entrada y precio.
 *
 * TODO/backend: reemplazar por consumo de la API REST (Spring Boot) cuando el
 * backend exponga el endpoint de eventos (RF-04).
 */

export type EventCategory =
  | 'Música'
  | 'Tech & Startups'
  | 'Festivales'
  | 'Gastronomía'
  | 'Teatro'
  | 'Networking';

export const EVENT_CATEGORIES: EventCategory[] = [
  'Música',
  'Tech & Startups',
  'Festivales',
  'Gastronomía',
  'Teatro',
  'Networking',
];

/** Color de portada por categoría (placeholder hasta tener imágenes reales). */
export const CATEGORY_COVER: Record<EventCategory, string> = {
  Música: '#4F46E5',
  'Tech & Startups': '#0B1C30',
  Festivales: '#9333EA',
  Gastronomía: '#006E4B',
  Teatro: '#B45309',
  Networking: '#0369A1',
};

export interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
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
  tickets: TicketType[];
}

export const EVENTS: EventItem[] = [
  {
    id: 'neon-wave-2025',
    title: 'Festival Neon Wave 2025',
    category: 'Música',
    date: '2025-10-24',
    time: '19:00',
    venue: 'Arena 1, San Miguel',
    city: 'Lima',
    description:
      'El mayor festival de música electrónica y synthwave del país con artistas internacionales, sistema de sonido inmersivo 360° y zonas gastronómicas.',
    organizer: 'Vibe Productions',
    featured: true,
    tickets: [
      { id: 'general', name: 'General - Fase 2', price: 120, available: 110 },
      { id: 'vip', name: 'VIP Lounge Experience', price: 250, available: 35 },
    ],
  },
  {
    id: 'sonica-open-air',
    title: 'Sónica Open Air Showcase',
    category: 'Festivales',
    date: '2025-12-04',
    time: '18:00',
    venue: 'Parque Bicentenario · Escenario Lago',
    city: 'Lima',
    description:
      'Showcase al aire libre con 8 horas de música electrónica, lasers y mapping sobre el lago. Acceso desde las 16:00 hrs.',
    organizer: 'Wavefront Live',
    featured: true,
    tickets: [
      { id: 'general', name: 'General', price: 95, available: 240 },
      { id: 'vip', name: 'Pase VIP', price: 180, available: 4 },
    ],
  },
  {
    id: 'indie-rock-sessions',
    title: 'Indie Rock Sessions',
    category: 'Música',
    date: '2025-11-02',
    time: '20:00',
    venue: 'Teatro Leguía',
    city: 'Lima',
    description:
      'Una noche con las mejores bandas indie nacionales en un formato íntimo. Apertura de puertas 18:30 hrs.',
    organizer: 'Costa Verde Producciones',
    featured: false,
    tickets: [{ id: 'general', name: 'General', price: 89, available: 920 }],
  },
  {
    id: 'tech-founders-summit',
    title: 'Ibero Digital Innovation Day 2026',
    category: 'Tech & Startups',
    date: '2025-11-18',
    time: '09:00',
    venue: 'Centro de Convenciones · Auditorio Principal',
    city: 'San Borja',
    description:
      'Cumbre de tecnología e innovación con charlas, networking y feria de emprendimientos. Incluye acceso a todas las conferencias.',
    organizer: 'Fintech Leaders Global',
    featured: false,
    tickets: [{ id: 'regular', name: 'Pase Regular', price: 65, available: 18 }],
  },
  {
    id: 'maridaje-craft-spirits',
    title: 'Festival de Maridaje & Craft Spirits',
    category: 'Gastronomía',
    date: '2025-12-12',
    time: '12:00',
    venue: 'Terraza Condesa · Piso 6',
    city: 'Lima',
    description:
      'Festival gastronómico con maridajes, destilados artesanales y catas guiadas por sommeliers invitados.',
    organizer: 'Sabores del Valle Co.',
    featured: false,
    tickets: [{ id: 'general', name: 'General', price: 75, available: 0 }],
  },
  {
    id: 'hamlet-contemporaneo',
    title: 'Hamlet: Clásico Contemporáneo',
    category: 'Teatro',
    date: '2025-10-22',
    time: '20:00',
    venue: 'Teatro Municipal de Lima',
    city: 'Lima',
    description:
      'Reinterpretación contemporánea del clásico de Shakespeare a cargo de la compañía Teatro del Centro Histórico.',
    organizer: 'Teatro Municipal',
    featured: false,
    tickets: [{ id: 'general', name: 'General', price: 45, available: 130 }],
  },
  {
    id: 'founders-night',
    title: 'Founders Night: Networking',
    category: 'Networking',
    date: '2025-11-06',
    time: '19:30',
    venue: 'WeWork Larco, Miraflores',
    city: 'Lima',
    description:
      'Noche de networking para fundadores, inversionistas y operadores. Pitch abierto y ronda de contactos guiada.',
    organizer: 'Eventia S.A.C.',
    featured: false,
    tickets: [{ id: 'general', name: 'Acceso', price: 30, available: 8 }],
  },
];

export function getEventById(id: string | undefined): EventItem | undefined {
  if (!id) return undefined;
  return EVENTS.find((event) => event.id === id);
}

/** Precio mínimo entre los tipos de entrada del evento. */
export function getPriceFrom(event: EventItem): number {
  return Math.min(...event.tickets.map((ticket) => ticket.price));
}

/** Total de entradas disponibles del evento. */
export function getTicketsAvailable(event: EventItem): number {
  return event.tickets.reduce((total, ticket) => total + ticket.available, 0);
}

export type AvailabilityTone = 'ok' | 'low' | 'out';

/**
 * Estado de disponibilidad para el chip de la tarjeta, según la guía:
 * verde (quedan), ámbar (últimos), rosa (agotado).
 */
export function getAvailability(event: EventItem): { label: string; tone: AvailabilityTone } {
  const total = getTicketsAvailable(event);
  if (total <= 0) return { label: 'Agotado', tone: 'out' };
  if (total <= 10) return { label: `Últimos ${total} tickets`, tone: 'low' };
  return { label: `Quedan ${total} tickets`, tone: 'ok' };
}

export function formatPricePEN(value: number): string {
  return `S/ ${value.toFixed(2)}`;
}

/** Fecha ISO (YYYY-MM-DD) -> "24 oct 2025". */
export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const months = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];
  return `${day} ${months[(month ?? 1) - 1]} ${year}`;
}

/** Fecha ISO -> { month: 'NOV', day: '18' } para el badge de la tarjeta. */
export function getDateBadge(isoDate: string): { month: string; day: string } {
  const [, month, day] = isoDate.split('-').map(Number);
  const months = [
    'ENE',
    'FEB',
    'MAR',
    'ABR',
    'MAY',
    'JUN',
    'JUL',
    'AGO',
    'SEP',
    'OCT',
    'NOV',
    'DIC',
  ];
  return { month: months[(month ?? 1) - 1], day: String(day) };
}

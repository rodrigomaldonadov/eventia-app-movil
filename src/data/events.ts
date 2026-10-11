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

import {
  type EventCategory,
  type TicketType,
  type EventItem,
} from '@/types/event.types';

export type { EventCategory, TicketType, EventItem };

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

export const EVENTS: EventItem[] = [
  {
    id: 'neon-wave-2025',
    title: 'Festival Neon Wave 2025',
    category: 'Música',
    edition: 'EDICIÓN 10° ANIVERSARIO',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    date: '2025-10-24',
    time: '19:00',
    venue: 'Arena 1, San Miguel',
    city: 'Lima',
    description:
      'El mayor festival de música electrónica y synthwave del país con artistas internacionales, sistema de sonido inmersivo 360° y zonas gastronómicas.',
    organizer: 'Vibe Productions',
    featured: true,
    tickets: [
      {
        id: 'general',
        name: 'General Pass - Fase 2',
        price: 120,
        available: 110,
        description: 'Acceso a los 3 escenarios simultáneos, zona de food trucks y lockers generales.',
      },
      {
        id: 'vip',
        name: 'VIP Lounge Experience',
        price: 250,
        available: 35,
        description: 'Plataforma elevada premium, barra libre de cortesía y sanitarios climatizados.',
      },
      {
        id: 'early',
        name: 'Early Bird Pass',
        price: 80,
        available: 0,
        description: 'Fase inicial con precio especial promocional. Cupos de preventa agotados.',
      },
    ],
  },
  {
    id: 'sonica-open-air',
    title: 'Sónica Open Air Showcase',
    category: 'Festivales',
    edition: 'EDICIÓN OPEN AIR 2025',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    date: '2025-12-04',
    time: '18:00',
    venue: 'Parque Bicentenario · Escenario Lago',
    city: 'Lima',
    description:
      'Showcase al aire libre con 8 horas de música electrónica, lasers y mapping sobre el lago. Acceso desde las 16:00 hrs.',
    organizer: 'Wavefront Live',
    featured: true,
    tickets: [
      {
        id: 'general',
        name: 'General Access',
        price: 95,
        available: 240,
        description: 'Acceso general al predio, zona de barras y escenario principal al aire libre.',
      },
      {
        id: 'vip',
        name: 'Pase VIP Escenario',
        price: 180,
        available: 4,
        description: 'Ubicación preferencial frente al lago, fast-pass en ingreso y merchandising conmemorativo.',
      },
    ],
  },
  {
    id: 'indie-rock-sessions',
    title: 'Indie Rock Sessions',
    category: 'Música',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop',
    date: '2025-11-02',
    time: '20:00',
    venue: 'Teatro Leguía',
    city: 'Lima',
    description:
      'Una noche con las mejores bandas indie nacionales en un formato íntimo. Apertura de puertas 18:30 hrs.',
    organizer: 'Costa Verde Producciones',
    featured: false,
    tickets: [
      {
        id: 'general',
        name: 'Platea General',
        price: 89,
        available: 920,
        description: 'Ingreso al patio de butacas en orden de llegada y acceso a la feria de vinilos.',
      },
    ],
  },
  {
    id: 'tech-founders-summit',
    title: 'Ibero Digital Innovation Day 2026',
    category: 'Tech & Startups',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
    date: '2025-11-18',
    time: '09:00',
    venue: 'Centro de Convenciones · Auditorio Principal',
    city: 'San Borja',
    description:
      'Cumbre de tecnología e innovación con charlas, networking y feria de emprendimientos. Incluye acceso a todas las conferencias.',
    organizer: 'Fintech Leaders Global',
    featured: false,
    tickets: [
      {
        id: 'regular',
        name: 'Pase Regular Tech',
        price: 65,
        available: 18,
        description: 'Acceso a conferencias magistrales, workshops matutinos y kit de bienvenida del asistente.',
      },
    ],
  },
  {
    id: 'maridaje-craft-spirits',
    title: 'Festival de Maridaje & Craft Spirits',
    category: 'Gastronomía',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200&auto=format&fit=crop',
    date: '2025-12-12',
    time: '12:00',
    venue: 'Terraza Condesa · Piso 6',
    city: 'Lima',
    description:
      'Festival gastronómico con maridajes, destilados artesanales y catas guiadas por sommeliers invitados.',
    organizer: 'Sabores del Valle Co.',
    featured: false,
    tickets: [
      {
        id: 'general',
        name: 'Ticket Degustación',
        price: 75,
        available: 0,
        description: 'Cata de 5 destilados artesanales y tabla de maridaje gourmet individual.',
      },
    ],
  },
  {
    id: 'hamlet-contemporaneo',
    title: 'Hamlet: Clásico Contemporáneo',
    category: 'Teatro',
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=1200&auto=format&fit=crop',
    date: '2025-10-22',
    time: '20:00',
    venue: 'Teatro Municipal de Lima',
    city: 'Lima',
    description:
      'Reinterpretación contemporánea del clásico de Shakespeare a cargo de la compañía Teatro del Centro Histórico.',
    organizer: 'Teatro Municipal',
    featured: false,
    tickets: [
      {
        id: 'general',
        name: 'Platea y Palco',
        price: 45,
        available: 130,
        description: 'Entrada numerada con vista directa al escenario principal.',
      },
    ],
  },
  {
    id: 'founders-night',
    title: 'Founders Night: Networking',
    category: 'Networking',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    date: '2025-11-06',
    time: '19:30',
    venue: 'WeWork Larco, Miraflores',
    city: 'Lima',
    description:
      'Noche de networking para fundadores, inversionistas y operadores. Pitch abierto y ronda de contactos guiada.',
    organizer: 'Eventia S.A.C.',
    featured: false,
    tickets: [
      {
        id: 'general',
        name: 'Pase Acceso Networking',
        price: 30,
        available: 8,
        description: 'Acceso a la sesión de pitch, coctel de bienvenida y directorio de contactos.',
      },
    ],
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

/** Fecha ISO (YYYY-MM-DD) -> "Sábado, 24 de Octubre de 2025". */
export function formatFullDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  const d = new Date(year, month - 1, day);
  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  const weekday = weekdays[d.getDay()] ?? '';
  const monthName = months[month - 1] ?? '';
  return `${weekday}, ${day} de ${monthName} de ${year}`;
}

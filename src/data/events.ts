/**
 * Datos mock del catálogo de eventos (Integrante 4: Navegación + Home/Catálogo).
 * Estandarizado con las 3 categorías requeridas: General, VIP y VIP+.
 */

import {
  type EventCategory,
  type TicketType,
  type TicketTier,
  type EventItem,
} from '@/types/event.types';

export type { EventCategory, TicketType, TicketTier, EventItem };

export const EVENT_CATEGORIES: EventCategory[] = [
  'Música',
  'Tech & Startups',
  'Festivales',
  'Gastronomía',
  'Teatro',
  'Networking',
];

/** Color de portada por categoría (placeholder hasta tener imágenes reales). */
export const CATEGORY_COVER: Record<string, string> = {
  Música: '#4F46E5',
  Conciertos: '#4F46E5',
  'Tech & Startups': '#0B1C30',
  'Tecnología & Negocios': '#0B1C30',
  Festivales: '#9333EA',
  Gastronomía: '#006E4B',
  Teatro: '#B45309',
  'Teatro & Artes': '#B45309',
  Networking: '#0369A1',
};

export function getCategoryCoverColor(category: string): string {
  return CATEGORY_COVER[category] ?? '#4F46E5';
}

/**
 * Coincidencia flexible de categorías para catálogo y filtros,
 * soportando tildes, minúsculas y nombres equivalentes (p.ej. Música / Conciertos).
 */
export function matchCategory(eventCategory: string = '', filter: string = ''): boolean {
  if (!filter || filter === 'Todos') return true;
  if (!eventCategory) return false;

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const normEvt = normalize(eventCategory);
  const normFlt = normalize(filter);

  if (normEvt === normFlt) return true;

  const map: Record<string, string[]> = {
    musica: ['musica', 'conciertos', 'concierto', 'music'],
    conciertos: ['musica', 'conciertos', 'concierto', 'music'],
    techstartups: ['techstartups', 'tecnologia', 'tecnologiaynegocios', 'tecnologianegocios', 'tech', 'software'],
    tecnologiaynegocios: ['techstartups', 'tecnologia', 'tecnologiaynegocios', 'tecnologianegocios', 'tech'],
    festivales: ['festivales', 'festival', 'openair'],
    gastronomia: ['gastronomia', 'comida', 'culinario', 'maridaje'],
    teatro: ['teatro', 'teatroyartes', 'teatroartes', 'artes', 'obra'],
    teatroyartes: ['teatro', 'teatroyartes', 'teatroartes', 'artes', 'obra'],
    networking: ['networking', 'negocios', 'emprendimiento', 'conferencias', 'founders'],
  };

  const aliases = map[normFlt];
  if (aliases) {
    return aliases.some(alias => normEvt.includes(alias) || alias.includes(normEvt));
  }

  return normEvt.includes(normFlt) || normFlt.includes(normEvt);
}

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
        name: 'General',
        tier: 'General',
        price: 120,
        available: 150,
        description: 'Acceso a los 3 escenarios simultáneos, zona de food trucks y lockers generales.',
      },
      {
        id: 'vip',
        name: 'VIP',
        tier: 'VIP',
        price: 250,
        available: 45,
        description: 'Plataforma elevada premium, barra de cortesía y sanitarios climatizados.',
      },
      {
        id: 'vip_plus',
        name: 'VIP+',
        tier: 'VIP+',
        price: 380,
        available: 20,
        description: 'Pase backstage, Meet & Greet exclusivo con artistas, barra libre total y pack oficial.',
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
        name: 'General',
        tier: 'General',
        price: 95,
        available: 240,
        description: 'Acceso general al predio, zona de barras y escenario principal al aire libre.',
      },
      {
        id: 'vip',
        name: 'VIP',
        tier: 'VIP',
        price: 180,
        available: 60,
        description: 'Ubicación preferencial frente al lago, fast-pass en ingreso y merchandising.',
      },
      {
        id: 'vip_plus',
        name: 'VIP+',
        tier: 'VIP+',
        price: 290,
        available: 15,
        description: 'Lounge VIP techado con vista 360°, cócteles ilimitados y estacionamiento privado.',
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
        name: 'General',
        tier: 'General',
        price: 89,
        available: 120,
        description: 'Ingreso al patio de butacas en orden de llegada y acceso a la feria de vinilos.',
      },
      {
        id: 'vip',
        name: 'VIP',
        tier: 'VIP',
        price: 150,
        available: 30,
        description: 'Primeras filas del teatro y firma de autógrafos con bandas en el intermedio.',
      },
      {
        id: 'vip_plus',
        name: 'VIP+',
        tier: 'VIP+',
        price: 220,
        available: 10,
        description: 'Asientos de palco exclusivo con atención personalizada y disco de vinilo conmemorativo.',
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
        id: 'general',
        name: 'General',
        tier: 'General',
        price: 65,
        available: 100,
        description: 'Acceso a conferencias magistrales, workshops matutinos y kit de bienvenida.',
      },
      {
        id: 'vip',
        name: 'VIP',
        tier: 'VIP',
        price: 140,
        available: 40,
        description: 'Almuerzo de networking con ponentes e inversionistas en la terraza ejecutiva.',
      },
      {
        id: 'vip_plus',
        name: 'VIP+',
        tier: 'VIP+',
        price: 260,
        available: 12,
        description: 'Acceso a sesiones 1:1 de mentoría privada con VCs y cena exclusiva de gala.',
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
        name: 'General',
        tier: 'General',
        price: 75,
        available: 80,
        description: 'Cata de 5 destilados artesanales y tabla de maridaje gourmet individual.',
      },
      {
        id: 'vip',
        name: 'VIP',
        tier: 'VIP',
        price: 130,
        available: 25,
        description: 'Degustación extendida con mixología de autor y mesa reservada frente al show.',
      },
      {
        id: 'vip_plus',
        name: 'VIP+',
        tier: 'VIP+',
        price: 210,
        available: 8,
        description: 'Masterclass privada con Master Distiller y botella de colección numerada.',
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
        name: 'General',
        tier: 'General',
        price: 45,
        available: 130,
        description: 'Entrada numerada en platea alta con vista directa al escenario principal.',
      },
      {
        id: 'vip',
        name: 'VIP',
        tier: 'VIP',
        price: 90,
        available: 40,
        description: 'Butacas preferenciales en platea baja con libreto oficial de la obra.',
      },
      {
        id: 'vip_plus',
        name: 'VIP+',
        tier: 'VIP+',
        price: 160,
        available: 15,
        description: 'Palco central privado, copa de espumante de bienvenida y charla con el elenco tras la función.',
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
        name: 'General',
        tier: 'General',
        price: 30,
        available: 50,
        description: 'Acceso a la sesión de pitch, cóctel de bienvenida y directorio de contactos.',
      },
      {
        id: 'vip',
        name: 'VIP',
        tier: 'VIP',
        price: 70,
        available: 20,
        description: 'Slot de 3 minutos de pitch asegurado en tarima y acceso al VIP Lounge de inversores.',
      },
      {
        id: 'vip_plus',
        name: 'VIP+',
        tier: 'VIP+',
        price: 120,
        available: 10,
        description: 'Reunión privada Speed Dating con Ángeles Inversionistas y mención de marca en el evento.',
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
  if (!event.tickets || event.tickets.length === 0) return 0;
  return Math.min(...event.tickets.map((ticket) => ticket.price));
}

/** Total de entradas disponibles del evento. */
export function getTicketsAvailable(event: EventItem): number {
  if (!event.tickets || event.tickets.length === 0) return 0;
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

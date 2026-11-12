/**
 * Tipos para el Panel de Organizador (Integrante 3 · RF-03 · P0).
 * Alinea con OrganizerDashboardResponseDto del backend.
 */

export interface OrganizerKpiDto {
  activeEvents: number;
  activeEventsChange?: number | null;
  ticketsSold: number;
  ticketsSoldChange?: number | null;
  totalRevenuePEN: number;
  totalRevenueChange?: number | null;
  occupancyRate: number;
  occupancyRateChange?: number | null;
}

export interface DailySalesDataPointDto {
  date: string;
  sales: number;
  tickets: number;
}

export interface ZoneDistributionDataPointDto {
  zone: string;
  percentage: number;
}

export interface ActiveShiftDto {
  eventTitle: string;
  ticketsSold: number;
  revenuePEN: number;
}

export interface OrganizerDashboardResponseDto {
  kpis: OrganizerKpiDto;
  dailySales: DailySalesDataPointDto[];
  zoneDistribution: ZoneDistributionDataPointDto[];
  recentEvents: unknown[];
  activeShift: ActiveShiftDto | null;
}

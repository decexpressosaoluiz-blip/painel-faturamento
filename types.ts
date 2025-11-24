export interface Transaction {
  id: string;
  ano: number;
  mes: string;
  origem: string;
  destino: string;
  faturamento: number; // Mapped from 'Valor'
  emissoes: number;    // Calculated as 1 per row (volume)
  recebimento: number; // Mapped from 'Valor' usually, or specific logic
  dataCompleta: Date;
}

export interface FilterState {
  selectedYears: number[];
  selectedMonths: string[];
  selectedOrigins: string[];
  selectedDestinations: string[];
}

export interface KPI {
  totalFaturamento: number;
  totalEmissoes: number;
  totalRecebimento: number;
  ticketMedio: number;
}

export interface RouteData {
  origem: string;
  destino: string;
  faturamento: number;
  volume: number;
  ticketMedio: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface RouteHistoryData {
  name: string; // Month/Year
  faturamento: number;
  ticketMedio: number;
  volume: number;
}
export interface DashboardStats {
  todayQuotes: number;         // Orçamentos recebidos hoje
  negotiatingQuotes: number;   // Orçamentos que respondi e aguardo cliente
  pendingRentals: number;      // Aluguéis que preciso aprovar
  activeRentals: number;       // Aluguéis em andamento
  activeRentalsValue: number;  // Valor total dos aluguéis ativos
  pendingCollections: number;  // Solicitações de coleta pendentes
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'error';
  date: string;
}

export interface GPTUsage {
  totalTokens: number;
  totalCost: number;
  usageByPurpose: Record<string, number>;
}

export interface DailyGPTUsage {
  [date: string]: {
    tokens: number;
    cost: number;
  };
}

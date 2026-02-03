export interface OpenPosition {
  symbol: string;
  volume: number;
  purchaseValue: number;
  currentValue: number;
  profit: number;
  openTime: Date;
}

export interface MonthData {
  id: string;
  year: number;
  month: number;
  positions: OpenPosition[];
  totalInvested: number;
  totalProfit: number;
  monthlyNetGain: number;
}

export interface PortfolioStore {
  reports: Record<string, MonthData>;
}

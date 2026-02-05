export interface OpenPosition {
  symbol: string;
  volume: number;
  purchaseValue: number; // Całkowity koszt zakupu (ilość * cena)
  currentValue: number; // Aktualna wartość (ilość * cena rynkowa)
  avgPurchasePrice: number; // Średnia cena kupna 1 akcji
  currentPrice: number; // Aktualny kurs 1 akcji
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

export interface Dividend {
  id: string;
  symbol: string;
  yieldPercentage: number;
  payDate: string;
  status: "planned" | "received";
  amountPerShare?: number;
  totalAmount?: number;
}

export interface PortfolioStore {
  reports: Record<string, MonthData>;
  plannedDividends: Dividend[];
}

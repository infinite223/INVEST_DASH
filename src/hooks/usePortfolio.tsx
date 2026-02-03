import { useState, useEffect } from "react";
import { MonthData, OpenPosition, PortfolioStore } from "../types";

export const usePortfolio = () => {
  const [store, setStore] = useState<PortfolioStore>(() => {
    const saved = localStorage.getItem("invest_dash_data");
    return saved ? JSON.parse(saved) : { reports: {} };
  });

  useEffect(() => {
    localStorage.setItem("invest_dash_data", JSON.stringify(store));
  }, [store]);

  const addReport = (
    year: number,
    month: number,
    positions: OpenPosition[],
  ) => {
    const id = `${year}-${month.toString().padStart(2, "0")}`;

    const totalInvested = positions.reduce(
      (sum, p) => sum + p.purchaseValue,
      0,
    );
    const totalProfit = positions.reduce((sum, p) => sum + p.profit, 0);

    const prevMonthId =
      month === 1
        ? `${year - 1}-12`
        : `${year}-${(month - 1).toString().padStart(2, "0")}`;

    const prevReport = store.reports[prevMonthId];
    const monthlyNetGain = prevReport
      ? totalProfit - prevReport.totalProfit
      : totalProfit;

    const newReport: MonthData = {
      id,
      year,
      month,
      positions,
      totalInvested,
      totalProfit,
      monthlyNetGain,
    };

    setStore((prev) => ({
      reports: { ...prev.reports, [id]: newReport },
    }));
  };

  return { store, addReport };
};

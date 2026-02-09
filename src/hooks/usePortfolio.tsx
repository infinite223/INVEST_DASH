import { useState, useEffect } from "react";
import { MonthData, OpenPosition, PortfolioStore, Dividend } from "../types";

export const usePortfolio = () => {
  const [store, setStore] = useState<PortfolioStore>(() => {
    const saved = localStorage.getItem("invest_dash_data");
    const defaultStructure = {
      reports: {},
      plannedDividends: [],
      isFirstVisit: true,
    };

    try {
      if (!saved) return defaultStructure;
      const parsed = JSON.parse(saved);
      return {
        ...defaultStructure,
        ...parsed,
      };
    } catch {
      return defaultStructure;
    }
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
      ...prev,
      reports: { ...prev.reports, [id]: newReport },
    }));
  };

  const addPlannedDividend = (dividend: Dividend) => {
    setStore((prev) => ({
      ...prev,
      plannedDividends: [...(prev.plannedDividends || []), dividend],
    }));
  };

  const removePlannedDividend = (id: string) => {
    setStore((prev) => ({
      ...prev,
      plannedDividends: prev.plannedDividends.filter((d) => d.id !== id),
    }));
  };

  const addReceivedDividends = (dividends: Dividend[]) => {
    setStore((prev) => {
      const existingIds = new Set(prev.plannedDividends.map((d) => d.id));
      const newDividends = dividends.filter((d) => !existingIds.has(d.id));

      return {
        ...prev,
        plannedDividends: [...prev.plannedDividends, ...newDividends],
      };
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(store, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `invest-dash-backup-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importData = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);

          if (parsed.reports && parsed.plannedDividends) {
            setStore(parsed);
            resolve(true);
          } else {
            throw new Error("Nieprawidłowy format pliku");
          }
        } catch (err) {
          console.error("Błąd podczas importu:", err);
          reject(false);
        }
      };

      reader.onerror = () => reject(false);
      reader.readAsText(file);
    });
  };

  const completeFirstVisit = () => {
    setStore((prev) => ({ ...prev, isFirstVisit: false }));
  };

  return {
    store,
    addReport,
    addPlannedDividend,
    removePlannedDividend,
    addReceivedDividends,
    exportData,
    importData,
    completeFirstVisit,
  };
};

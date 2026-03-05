import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MonthData, OpenPosition, PortfolioStore, Dividend } from '../types';

const STORAGE_KEY = 'invest_dash_data';

export const usePortfolio = () => {
  const [store, setStore] = useState<PortfolioStore>({
    reports: {},
    plannedDividends: [],
    isFirstVisit: true,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setStore(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Błąd ładowania danych:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        } catch (e) {
          console.error('Błąd zapisu danych:', e);
        }
      };
      saveData();
    }
  }, [store, isLoaded]);

  const addReport = (
    year: number,
    month: number,
    positions: OpenPosition[],
    closedProfit: number = 0
  ) => {
    const id = `${year}-${month.toString().padStart(2, '0')}`;
    const totalInvested = positions.reduce((sum, p) => sum + p.purchaseValue, 0);
    const totalProfit = positions.reduce((sum, p) => sum + p.profit, 0);

    const prevMonthId =
      month === 1 ? `${year - 1}-12` : `${year}-${(month - 1).toString().padStart(2, '0')}`;

    const prevReport = store.reports[prevMonthId];
    const monthlyNetGain = prevReport ? totalProfit - prevReport.totalProfit : totalProfit;

    const newReport: MonthData = {
      id,
      year,
      month,
      positions,
      totalInvested,
      totalProfit,
      closedProfit,
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

  const resetAllData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setStore({ reports: {}, plannedDividends: [], isFirstVisit: true });
    } catch (e) {
      console.error('Błąd resetowania:', e);
    }
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

  const completeFirstVisit = () => {
    setStore((prev) => ({ ...prev, isFirstVisit: false }));
  };

  return {
    store,
    isLoaded,
    addReport,
    addPlannedDividend,
    removePlannedDividend,
    addReceivedDividends,
    completeFirstVisit,
    resetAllData,
  };
};

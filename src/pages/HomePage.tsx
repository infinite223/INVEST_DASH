import React, { useMemo, useState } from "react";
import { Briefcase, TrendingUp, DollarSign } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import { PortfolioTable } from "../components/PortfolioTable";
import { PortfolioSortKeys, SortOrder } from "../types";

export const HomePage = () => {
  const { store } = usePortfolio();

  const [portfolioSort, setPortfolioSort] = useState<{
    key: PortfolioSortKeys;
    order: SortOrder;
  }>({ key: "purchaseValue", order: "desc" });

  const getPreviousMonthReport = (year: number, month: number) => {
    const allReports = Object.values(store.reports);
    return allReports.find((r) => {
      if (month === 1) return r.year === year - 1 && r.month === 12;
      return r.year === year && r.month === month - 1;
    });
  };

  const calculateMonthlyDelta = (currentReport: any) => {
    const prevReport = getPreviousMonthReport(
      currentReport.year,
      currentReport.month,
    );
    if (!prevReport) return currentReport.totalProfit;
    return currentReport.totalProfit - prevReport.totalProfit;
  };

  const globalStats = useMemo(() => {
    const allReports = Object.values(store.reports).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    if (allReports.length === 0) return null;

    const latestReport = allReports[allReports.length - 1];

    const stockProfit = allReports.reduce(
      (sum, r) => sum + calculateMonthlyDelta(r),
      0,
    );

    const dividendProfit = (store.plannedDividends || [])
      .filter((d) => d.status === "received")
      .reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    const totalAbsoluteProfit = stockProfit + dividendProfit;

    const sortedPositions = [...latestReport.positions].sort((a, b) => {
      let aVal: any, bVal: any;
      if (portfolioSort.key === "currPrice") {
        aVal = a.currentPrice || (a.purchaseValue + a.profit) / a.volume;
        bVal = b.currentPrice || (b.purchaseValue + b.profit) / b.volume;
      } else {
        aVal = a[portfolioSort.key as keyof typeof a] ?? 0;
        bVal = b[portfolioSort.key as keyof typeof b] ?? 0;
      }
      return portfolioSort.order === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
          ? 1
          : -1;
    });

    const realizedProfit = allReports.reduce(
      (sum, r) => sum + (r.closedProfit || 0),
      0,
    );

    return {
      totalInvested: latestReport.totalInvested,
      stockProfit,
      dividendProfit,
      totalAbsoluteProfit,
      realizedProfit,
      roi:
        latestReport.totalInvested !== 0
          ? (totalAbsoluteProfit / latestReport.totalInvested) * 100
          : 0,
      latestPositions: sortedPositions,
    };
  }, [store.reports, store.plannedDividends, portfolioSort]);

  if (!globalStats) {
    return (
      <div className="p-6 text-center py-20 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase className="text-slate-400" size={32} />
        </div>
        <h2 className="text-xl font-black uppercase italic text-slate-800 dark:text-white mb-2">
          Brak danych portfela
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto font-bold">
          Użyj przycisku <span className="text-indigo-500">+</span> na dolnym
          pasku, aby dodać swój pierwszy raport z XTB.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-2 mb-2">
          <img
            src="/icon.png"
            alt="App Logo"
            className="w-8 h-8 object-contain"
          />{" "}
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Assets TRACK
          </p>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
          Podsumowanie{" "}
          <span className="text-indigo-600 text-stroke-sm">Portfela</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-7 bg-slate-900 dark:bg-indigo-950 rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[280px] shadow-2xl shadow-indigo-200 dark:shadow-none">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300">
                <TrendingUp size={20} />
              </div>
              <span className="text-[11px] font-black text-indigo-200/60 uppercase tracking-widest">
                Łączny zwrot z inwestycji
              </span>
            </div>
            <div className="mt-8">
              <h2 className="text-7xl md:text-8xl font-black italic tracking-tighter leading-none">
                {globalStats.roi.toFixed(2)}
                <span className="text-indigo-400 text-3xl ml-1">%</span>
              </h2>
              <p className="text-indigo-200/80 font-bold mt-4 text-xl italic">
                {globalStats.totalAbsoluteProfit >= 0 ? "+" : ""}
                {globalStats.totalAbsoluteProfit.toLocaleString()}{" "}
                <span className="text-sm">PLN TOTAL PROFIT</span>
              </p>
            </div>
          </div>

          <div className="absolute -right-12 -bottom-12 opacity-10 text-white transform -rotate-12">
            <TrendingUp size={320} strokeWidth={3} />
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Całkowity Wkład własny
            </span>
            <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {globalStats.totalInvested.toLocaleString()}
              <span className="text-xs text-slate-300 ml-2 font-black uppercase">
                PLN
              </span>
            </p>
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-[32px] border border-emerald-100/50 dark:border-emerald-500/10 flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center gap-2 text-emerald-600">
              <Briefcase size={16} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Zrealizowany zysk
              </span>
            </div>
            <p className="text-3xl font-black text-emerald-600 tracking-tight">
              +{globalStats.realizedProfit.toLocaleString()}
            </p>
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-[32px] border border-amber-100/50 dark:border-amber-500/10 flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center gap-2 text-amber-600">
              <DollarSign size={16} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Dywidendy netto
              </span>
            </div>
            <p className="text-3xl font-black text-amber-600 tracking-tight">
              +{globalStats.dividendProfit.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <PortfolioTable
          positions={globalStats.latestPositions}
          sortConfig={portfolioSort}
          onRequestSort={(key) =>
            setPortfolioSort((prev) => ({
              key,
              order: prev.key === key && prev.order === "desc" ? "asc" : "desc",
            }))
          }
        />
      </div>
    </div>
  );
};

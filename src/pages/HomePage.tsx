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

    return {
      totalInvested: latestReport.totalInvested,
      stockProfit,
      dividendProfit,
      totalAbsoluteProfit,
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
          <div className="h-1 w-8 bg-indigo-600 rounded-full" />
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Live Dashboard
          </p>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
          Podsumowanie{" "}
          <span className="text-indigo-600 text-stroke-sm">Portfela</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        <div className="md:col-span-8 lg:col-span-6 bg-slate-900 dark:bg-indigo-950 rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-2xl shadow-indigo-200 dark:shadow-none">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300">
                <TrendingUp size={20} />
              </div>
              <span className="text-[11px] font-black text-indigo-200/60 uppercase tracking-widest">
                Łączny zwrot z inwestycji
              </span>
            </div>
            <div className="mt-4">
              <h2 className="text-6xl md:text-7xl font-black italic tracking-tighter leading-none">
                {globalStats.roi.toFixed(2)}
                <span className="text-indigo-400 text-3xl ml-1">%</span>
              </h2>
              <p className="text-indigo-200/80 font-bold mt-2 text-lg italic">
                {globalStats.totalAbsoluteProfit >= 0 ? "+" : ""}
                {globalStats.totalAbsoluteProfit.toLocaleString()}{" "}
                <span className="text-sm">PLN PROFIT</span>
              </p>
            </div>
          </div>

          <div className="absolute -right-8 -bottom-8 opacity-10 text-white transform -rotate-12">
            <TrendingUp size={240} strokeWidth={3} />
          </div>
        </div>

        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-6">
          <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Wkład własny
            </span>
            <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {globalStats.totalInvested.toLocaleString()}
              <span className="text-xs text-slate-300 ml-2 font-black uppercase">
                PLN
              </span>
            </p>
          </div>

          <div className="flex-1 bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-[32px] border border-amber-100/50 dark:border-amber-500/10 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1 text-amber-600">
              <DollarSign size={14} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Dywidendy netto
              </span>
            </div>
            <p className="text-3xl font-black text-amber-600 tracking-tight">
              +{globalStats.dividendProfit.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="md:col-span-12 lg:col-span-3 bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between items-center text-center lg:text-left lg:items-start relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 italic">
              Zysk z kursu (akcje)
            </span>
            <p
              className={`text-4xl font-black leading-none ${globalStats.stockProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
            >
              {globalStats.stockProfit >= 0 ? "+" : ""}
              {globalStats.stockProfit.toLocaleString()}
            </p>
            <div
              className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                globalStats.stockProfit >= 0
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {globalStats.stockProfit >= 0
                ? "Market Bullish"
                : "Market Bearish"}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 left-0 h-1/2 opacity-[0.03] pointer-events-none">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full preserve-aspect-ratio-none"
            >
              <path
                d="M0,100 C20,80 40,90 60,40 C80,10 100,30 100,0 L100,100 Z"
                fill="currentColor"
                className={
                  globalStats.stockProfit >= 0
                    ? "text-emerald-500"
                    : "text-rose-500"
                }
              />
            </svg>
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

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Briefcase, Download, Upload, UploadCloud } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import {
  processDividendsFromExcel,
  processOpenPositions,
} from "../utils/excelParser";

import { YearCard } from "../components/YearCard";
import { PortfolioTable } from "../components/PortfolioTable";
import { DividendSection } from "../components/DividendSection";
import { UploadModal } from "../components/UploadModal";

import { PortfolioSortKeys, DividendSortKeys, SortOrder } from "../types";
import { WelcomeModal } from "../components/WelcomeModal";

export const YearsPage = () => {
  const navigate = useNavigate();
  const {
    store,
    completeFirstVisit,
    addReport,
    addPlannedDividend,
    removePlannedDividend,
    exportData,
    importData,
  } = usePortfolio();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [divForm, setDivForm] = useState({ symbol: "", yield: "", date: "" });

  const [portfolioSort, setPortfolioSort] = useState<{
    key: PortfolioSortKeys;
    order: SortOrder;
  }>({ key: "purchaseValue", order: "desc" });

  const [divSort, setDivSort] = useState<{
    key: DividendSortKeys;
    order: SortOrder;
  }>({ key: "payDate", order: "asc" });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await importData(file);
      if (success) {
        alert("Dane zostały pomyślnie zaimportowane!");
        window.location.reload();
      } else {
        alert("Wystąpił błąd podczas importu pliku.");
      }
    }
  };

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
    const totalProfit = allReports.reduce(
      (sum, r) => sum + calculateMonthlyDelta(r),
      0,
    );

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
      totalProfit,
      roi:
        latestReport.totalInvested !== 0
          ? (totalProfit / latestReport.totalInvested) * 100
          : 0,
      latestPositions: sortedPositions,
    };
  }, [store.reports, portfolioSort]);

  const calculateYearlyStats = (year: number) => {
    const yearReports = Object.values(store.reports).filter(
      (r) => r.year === year,
    );
    const yearlyDelta = yearReports.reduce(
      (sum, r) => sum + calculateMonthlyDelta(r),
      0,
    );
    const latestInYear = [...yearReports].sort((a, b) => b.month - a.month)[0];
    return {
      deltaProfit: yearlyDelta,
      roi: latestInYear?.totalInvested
        ? (yearlyDelta / latestInYear.totalInvested) * 100
        : 0,
    };
  };

  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".xlsx")) {
      setPendingFile(file);
      setIsModalOpen(true);
    }
  };

  const sortedDividends = useMemo(() => {
    const baseDividends = [...(store.plannedDividends || [])].map((div) => {
      if (div.status === "received" && div.totalAmount) return div;
      const pos = globalStats?.latestPositions.find(
        (p) => p.symbol === div.symbol,
      );
      if (pos) {
        const currPrice =
          pos.currentPrice || (pos.purchaseValue + pos.profit) / pos.volume;
        const amountPerShare = currPrice * (div.yieldPercentage / 100);
        return {
          ...div,
          amountPerShare,
          totalAmount: amountPerShare * pos.volume,
        };
      }
      return div;
    });

    return baseDividends.sort((a, b) => {
      let aVal =
        divSort.key === "payDate"
          ? new Date(a.payDate).getTime()
          : (a[divSort.key as keyof typeof a] ?? 0);
      let bVal =
        divSort.key === "payDate"
          ? new Date(b.payDate).getTime()
          : (b[divSort.key as keyof typeof b] ?? 0);
      return divSort.order === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
          ? 1
          : -1;
    });
  }, [store.plannedDividends, globalStats, divSort]);

  const handleUpload = async () => {
    if (pendingFile) {
      const positionsData = await processOpenPositions(pendingFile);
      addReport(selectedYear, selectedMonth, positionsData);
      try {
        const historicalDividends =
          await processDividendsFromExcel(pendingFile);
        historicalDividends.forEach((div) =>
          addPlannedDividend({ ...div, status: "received" }),
        );
      } catch (err) {
        console.log("Brak dywidend.");
      }
      setIsModalOpen(false);
      setPendingFile(null);
    }
  };

  const years = Array.from(
    new Set(Object.values(store.reports).map((r) => r.year)),
  ).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 md:p-10 font-sans text-slate-900 dark:text-slate-100 pb-32 transition-colors duration-300">
      {store.isFirstVisit && <WelcomeModal onClose={completeFirstVisit} />}

      <header className="max-w-7xl mx-auto mb-8 md:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 px-2 md:px-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden p-1.5">
              <img
                src="/icon.png"
                alt="App Icon"
                className="w-full h-full object-contain dark:brightness-110"
              />
            </div>
            <h1 className="uppercase text-2xl md:text-4xl font-black tracking-tighter italic text-slate-800 dark:text-white">
              assets xtb
            </h1>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3">
          <button
            onClick={exportData}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] md:text-[11px] font-black text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm uppercase tracking-wider"
          >
            <Download size={14} /> Eksportuj
          </button>

          <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] md:text-[11px] font-black text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-all shadow-sm uppercase tracking-wider">
            <Upload size={14} /> Importuj
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </header>

      {globalStats && (
        <div className="max-w-7xl mx-auto mb-8 md:mb-16 bg-white dark:bg-slate-900/50 rounded-[30px] md:rounded-[40px] p-6 md:p-10 shadow-sm dark:shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-6 md:gap-10 items-center px-4 md:px-10">
          <div className="flex-1 w-full">
            <h3 className="text-base md:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 md:gap-3 mb-4 md:mb-6 uppercase italic tracking-tighter">
              <Briefcase
                className="text-indigo-500 dark:text-indigo-400"
                size={18}
              />{" "}
              Stan Portfela (Łącznie)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 md:p-6 rounded-[20px] md:rounded-[25px] border border-slate-100/50 dark:border-slate-700/50">
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-widest">
                  Zainwestowane
                </p>
                <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">
                  {globalStats.totalInvested.toLocaleString()}{" "}
                  <span className="text-[10px] md:text-sm font-bold text-slate-400 dark:text-slate-600 uppercase">
                    PLN
                  </span>
                </p>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 md:p-6 rounded-[20px] md:rounded-[25px] border border-slate-100/50 dark:border-slate-700/50">
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-widest">
                  Zysk Całkowity
                </p>
                <p
                  className={`text-xl md:text-2xl font-black ${globalStats.totalProfit >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
                >
                  {globalStats.totalProfit >= 0 ? "+" : ""}
                  {globalStats.totalProfit.toLocaleString()}{" "}
                  <span className="text-[10px] md:text-sm font-bold opacity-60 dark:opacity-40 uppercase">
                    PLN
                  </span>
                </p>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 md:p-6 rounded-[20px] md:rounded-[25px] border border-slate-100/50 dark:border-slate-700/50 flex flex-col justify-center">
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1 tracking-widest">
                  Global ROI
                </p>
                <p className="text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400 italic">
                  {globalStats.roi.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {years.map((year) => (
          <YearCard
            key={year}
            year={year}
            stats={calculateYearlyStats(year)}
            count={
              Object.values(store.reports).filter((r) => r.year === year).length
            }
            onClick={() => navigate(`/${year}`)}
          />
        ))}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-xl flex flex-col items-center justify-center 
            transition-all duration-300 cursor-pointer group min-h-[200px] md:min-h-[260px] border-2 md:border-4 border-dashed
            ${
              isDragging
                ? "bg-indigo-800 dark:bg-indigo-900 border-white dark:border-indigo-400 scale-[1.01] shadow-2xl"
                : "bg-indigo-600 dark:bg-indigo-700 border-transparent hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-indigo-100 dark:shadow-none"
            }
          `}
        >
          <input
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setPendingFile(f);
                setIsModalOpen(true);
              }
            }}
            className="hidden"
            id="init-upload"
            accept=".xlsx"
          />
          <label
            htmlFor="init-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div
              className={`h-14 w-14 md:h-16 md:w-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500
              ${isDragging ? "bg-white dark:bg-indigo-400 text-indigo-600 dark:text-white animate-bounce" : "bg-white/10 text-white group-hover:rotate-90"}`}
            >
              {isDragging ? <UploadCloud size={28} /> : <Plus size={28} />}
            </div>
            <div className="text-center px-4">
              <span className="font-black text-lg md:text-xl uppercase tracking-tighter italic text-white block mb-1">
                {isDragging ? "Upuść plik tutaj" : "Nowy Raport"}
              </span>
              <p className="text-indigo-100 dark:text-indigo-200/60 text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60 italic">
                Kliknij lub przeciągnij plik .xlsx
              </p>
            </div>
          </label>
          {isDragging && (
            <div className="absolute inset-2 md:inset-4 border-2 border-white/20 rounded-[25px] md:rounded-[30px] animate-pulse pointer-events-none" />
          )}
        </div>
      </div>

      {globalStats && (
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
      )}

      <DividendSection
        dividends={sortedDividends}
        form={divForm}
        onFormChange={(field, value) =>
          setDivForm({ ...divForm, [field]: value })
        }
        onSave={() => {
          if (!divForm.symbol || !divForm.yield || !divForm.date) return;
          addPlannedDividend({
            id: crypto.randomUUID(),
            symbol: divForm.symbol,
            yieldPercentage: Number(divForm.yield),
            payDate: divForm.date,
            status: "planned",
          });
          setDivForm({ symbol: "", yield: "", date: "" });
        }}
        onRemove={removePlannedDividend}
        availableSymbols={
          globalStats?.latestPositions.map((p) => p.symbol) || []
        }
        sortConfig={divSort}
        onRequestSort={(key) =>
          setDivSort((prev) => ({
            key,
            order: prev.key === key && prev.order === "desc" ? "asc" : "desc",
          }))
        }
      />

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />
    </div>
  );
};

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
  const { exportData, importData } = usePortfolio();

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

  // --- STATYSTYKI ---
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
    e.preventDefault(); // Zapobiega otwarciu pliku w przeglądarce
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
      // Wywołujemy Twoją logikę (tą samą co w onChange)
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
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans text-slate-900 pb-32">
      {store.isFirstVisit && <WelcomeModal onClose={completeFirstVisit} />}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 md:w-16 md:h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden p-1">
              <img
                src="/icon.png"
                alt="App Icon"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="uppercase text-3xl md:text-4xl font-black tracking-tighter italic text-slate-800">
              assets xtb
            </h1>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-slate-200 text-[11px] font-black text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all shadow-sm uppercase tracking-wider"
          >
            <Download size={14} /> Eksportuj
          </button>

          <label className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-slate-200 text-[11px] font-black text-slate-500 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50/30 cursor-pointer transition-all shadow-sm uppercase tracking-wider">
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
        <div className="max-w-7xl mx-auto mb-16 bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-10 items-center">
          <div className="flex-1 w-full">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-6">
              <Briefcase className="text-indigo-500" /> Stan Portfela (Łącznie)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-6 rounded-[25px]">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                  Zainwestowane
                </p>
                <p className="text-2xl font-black">
                  {globalStats.totalInvested.toLocaleString()}{" "}
                  <span className="text-sm font-normal">PLN</span>
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[25px]">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                  Zysk Całkowity
                </p>
                <p
                  className={`text-2xl font-black ${globalStats.totalProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {globalStats.totalProfit >= 0 ? "+" : ""}
                  {globalStats.totalProfit.toLocaleString()}{" "}
                  <span className="text-sm font-normal">PLN</span>
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-[25px]">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                  Global ROI
                </p>
                <p className="text-3xl font-black text-emerald-500">
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
        relative p-8 rounded-[40px] shadow-xl flex flex-col items-center justify-center 
        transition-all duration-300 cursor-pointer group min-h-[280px] border-4 border-dashed
        ${
          isDragging
            ? "bg-indigo-800 border-white scale-[1.02] shadow-2xl"
            : "bg-indigo-600 border-transparent hover:bg-indigo-700 shadow-indigo-200"
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
              className={`
          h-20 w-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500
          ${isDragging ? "bg-white text-indigo-600 animate-bounce" : "bg-white/10 text-white group-hover:rotate-90"}
        `}
            >
              {isDragging ? <UploadCloud size={40} /> : <Plus size={40} />}
            </div>

            <div className="text-center">
              <span className="font-black text-2xl uppercase tracking-tight text-white block mb-1">
                {isDragging ? "Upuść plik tutaj" : "Nowy Raport"}
              </span>
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-60">
                Kliknij lub przeciągnij plik .xlsx
              </p>
            </div>
          </label>

          {/* Efekt "poświaty" przy przeciąganiu */}
          {isDragging && (
            <div className="absolute inset-4 border-2 border-white/20 rounded-[30px] animate-pulse pointer-events-none" />
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

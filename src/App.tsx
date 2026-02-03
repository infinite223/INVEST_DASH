import React, { useState } from "react";
import { usePortfolio } from "./hooks/usePortfolio";
import { processOpenPositions } from "./utils/excelParser";
import Dashboard from "./components/Dashboard";
import { Folder, Calendar, ArrowLeft, Plus, X } from "lucide-react";

export default function App() {
  const { store, addReport } = usePortfolio();
  const [view, setView] = useState<{
    type: "years" | "months" | "details";
    id?: number | string;
  }>({ type: "years" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

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

  const calculateYearlyStats = (year: number) => {
    const yearReports = Object.values(store.reports)
      .filter((r) => r.year === year)
      .sort((a, b) => a.month - b.month);

    if (yearReports.length === 0)
      return { totalInvested: 0, deltaProfit: 0, roi: 0 };

    const latestReport = yearReports[yearReports.length - 1];
    const yearlyDelta = yearReports.reduce(
      (sum, r) => sum + calculateMonthlyDelta(r),
      0,
    );
    const roi =
      latestReport.totalInvested !== 0
        ? (yearlyDelta / latestReport.totalInvested) * 100
        : 0;

    return {
      totalInvested: latestReport.totalInvested,
      deltaProfit: yearlyDelta,
      roi,
    };
  };

  const years = Array.from(
    new Set(Object.values(store.reports).map((r) => r.year)),
  ).sort((a, b) => b - a);

  const handleUpload = async () => {
    if (pendingFile) {
      const data = await processOpenPositions(pendingFile);
      addReport(selectedYear, selectedMonth, data);
      setIsModalOpen(false);
      setPendingFile(null);
    }
  };

  if (view.type === "years") {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans text-slate-900">
        <header className="max-w-7xl mx-auto mb-12 animate-in slide-in-from-top duration-500">
          <h1 className="text-4xl font-black tracking-tighter italic text-slate-900">
            INVEST_DASH
          </h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">
            Portfolio Summary
          </p>
        </header>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {years.map((year) => {
            const stats = calculateYearlyStats(year);
            const yearReportsCount = Object.values(store.reports).filter(
              (r) => r.year === year,
            ).length;

            return (
              <div
                key={year}
                onClick={() => setView({ type: "months", id: year })}
                className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col justify-between min-h-[320px]"
              >
                <div className="flex justify-between items-start">
                  <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                    <Folder size={32} />
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-black ${stats.roi >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                  >
                    {stats.roi >= 0 ? "+" : ""}
                    {stats.roi.toFixed(2)}%
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                    Rok {year}
                  </h2>
                  <p className="text-slate-400 font-bold italic mt-1 text-sm">
                    Raportów w roku: {yearReportsCount}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 space-y-4">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Wartość portfela
                    </span>
                    <span className="font-bold text-sm">
                      {stats.totalInvested.toLocaleString()} PLN
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Wynik (YTD)
                    </span>
                    <span
                      className={`text-2xl font-black ${stats.deltaProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {stats.deltaProfit >= 0 ? "+" : ""}
                      {stats.deltaProfit.toLocaleString()}{" "}
                      <span className="text-xs">PLN</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="bg-indigo-600 p-8 rounded-[40px] shadow-xl shadow-indigo-200 flex flex-col items-center justify-center text-white hover:bg-indigo-700 transition-all cursor-pointer group min-h-[320px]">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPendingFile(file);
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
              <div className="h-20 w-20 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:rotate-90 transition-transform duration-500">
                <Plus size={48} />
              </div>
              <span className="font-black text-xl tracking-tight uppercase">
                Nowy Raport
              </span>
              <span className="text-indigo-200 font-bold text-[10px] uppercase tracking-widest mt-2">
                Wczytaj plik excel
              </span>
            </label>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl animate-in zoom-in duration-300">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
              <h3 className="text-3xl font-black mb-2 tracking-tight">
                Dane raportu
              </h3>
              <p className="text-slate-500 font-medium mb-8 text-sm">
                Wybierz okres dla wczytanego pliku.
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Rok
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 font-black focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      {[2024, 2025, 2026].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Miesiąc
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 font-black focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString("pl-PL", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-lg"
                >
                  ZAPISZ RAPORT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view.type === "months") {
    const monthsInYear = Object.values(store.reports)
      .filter((r) => r.year === view.id)
      .sort((a, b) => b.month - a.month);

    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setView({ type: "years" })}
            className="group flex items-center gap-3 text-slate-400 font-black mb-10 hover:text-indigo-600 transition-all uppercase text-xs tracking-widest"
          >
            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:-translate-x-1 transition-transform">
              <ArrowLeft size={16} />
            </div>
            Powrót do lat
          </button>

          <h2 className="text-5xl font-black mb-12 tracking-tighter italic animate-in fade-in slide-in-from-left duration-500">
            Rok {view.id}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {monthsInYear.map((report) => {
              const deltaProfit = calculateMonthlyDelta(report);
              const monthROI =
                report.totalInvested !== 0
                  ? (deltaProfit / report.totalInvested) * 100
                  : 0;

              return (
                <div
                  key={report.id}
                  onClick={() => setView({ type: "details", id: report.id })}
                  className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <Calendar size={24} />
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-[11px] font-black ${deltaProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                    >
                      {monthROI >= 0 ? "+" : ""}
                      {monthROI.toFixed(2)}% m/m
                    </div>
                  </div>

                  <h3 className="text-3xl font-black text-slate-800 uppercase italic mb-8 tracking-tight leading-none">
                    {new Date(0, report.month - 1).toLocaleString("pl-PL", {
                      month: "long",
                    })}
                  </h3>

                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Zainwestowano
                      </span>
                      <span className="font-bold text-slate-600 text-sm">
                        {report.totalInvested.toLocaleString()} PLN
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-serif">
                        Zysk netto
                      </span>
                      <p
                        className={`text-2xl font-black ${deltaProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                      >
                        {deltaProfit >= 0 ? "+" : ""}
                        {deltaProfit.toLocaleString()}{" "}
                        <span className="text-xs">PLN</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const activeReport = store.reports[view.id as string];
  const currentDelta = calculateMonthlyDelta(activeReport);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      <div className="p-6 md:p-8 bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setView({ type: "months", id: activeReport.year })}
            className="group flex items-center gap-3 text-slate-400 font-black hover:text-indigo-600 transition-all uppercase text-xs tracking-widest"
          >
            <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:-translate-x-1 transition-transform">
              <ArrowLeft size={18} />
            </div>
            Wróć do listy
          </button>

          <div className="text-right flex items-center gap-6">
            <div className="h-12 w-[1px] bg-slate-100 hidden md:block" />
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
                Wybrany okres
              </p>
              <p className="font-black text-slate-800 uppercase italic text-lg leading-none">
                {new Date(0, activeReport.month - 1).toLocaleString("pl-PL", {
                  month: "long",
                })}{" "}
                {activeReport.year}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Dashboard report={{ ...activeReport, monthlyNetGain: currentDelta }} />
    </div>
  );
}

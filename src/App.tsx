import React, { useState, useMemo } from "react";
import { usePortfolio } from "./hooks/usePortfolio";
import {
  processDividendsFromExcel,
  processOpenPositions,
} from "./utils/excelParser";
import Dashboard from "./components/Dashboard";
import {
  Folder,
  Calendar,
  ArrowLeft,
  Plus,
  X,
  BarChart3,
  Briefcase,
  ArrowUpRight,
  Trash2,
  DollarSign,
  History,
  Target,
  Trophy,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function App() {
  const { store, addReport, addPlannedDividend, removePlannedDividend } =
    usePortfolio();

  const [view, setView] = useState<{
    type: "years" | "months" | "details";
    id?: number | string;
  }>({ type: "years" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Stan formularza dywidendy
  const [divForm, setDivForm] = useState({ symbol: "", yield: "", date: "" });
  // --- LOGIKA OBLICZEŃ ---

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

    return {
      totalInvested: latestReport.totalInvested,
      totalProfit,
      roi:
        latestReport.totalInvested !== 0
          ? (totalProfit / latestReport.totalInvested) * 100
          : 0,
      latestPositions: latestReport.positions,
      reportCount: allReports.length,
    };
  }, [store.reports]);

  const sortedDividends = useMemo(() => {
    return [...(store.plannedDividends || [])]
      .map((div) => {
        // Jeśli dywidenda ma już totalAmount (np. historyczna z Excela), zostawiamy ją
        if (div.status === "received" && div.totalAmount) return div;

        // Szukamy danych o spółce w najnowszym raporcie
        const pos = globalStats?.latestPositions.find(
          (p) => p.symbol === div.symbol,
        );

        if (pos) {
          // Wyliczamy aktualną cenę akcji (tak samo jak robisz to w tabeli)
          const currPrice =
            pos.currentPrice ||
            (pos.volume > 0
              ? (pos.purchaseValue + pos.profit) / pos.volume
              : 0);

          // Obliczamy kwotę: (Cena * Procent) * Ilość akcji
          const calculatedAmountPerShare =
            currPrice * (div.yieldPercentage / 100);
          const calculatedTotal = calculatedAmountPerShare * pos.volume;

          return {
            ...div,
            amountPerShare: calculatedAmountPerShare,
            totalAmount: calculatedTotal,
          };
        }
        return div;
      })
      .sort(
        (a, b) => new Date(a.payDate).getTime() - new Date(b.payDate).getTime(),
      );
  }, [store.plannedDividends, globalStats]);

  const calculateYearlyStats = (year: number) => {
    const yearReports = Object.values(store.reports)
      .filter((r) => r.year === year)
      .sort((a, b) => a.month - b.month);

    if (yearReports.length === 0)
      return {
        totalInvested: 0,
        deltaProfit: 0,
        roi: 0,
        monthlyData: [],
        bestMonth: null,
      };

    const latestReport = yearReports[yearReports.length - 1];

    const monthlyData = yearReports.map((r) => ({
      name: new Date(0, r.month - 1).toLocaleString("pl-PL", {
        month: "short",
      }),
      profit: calculateMonthlyDelta(r),
      monthNum: r.month,
    }));

    const yearlyDelta = monthlyData.reduce((sum, m) => sum + m.profit, 0);
    const bestMonth = [...monthlyData].sort((a, b) => b.profit - a.profit)[0];

    return {
      totalInvested: latestReport.totalInvested,
      deltaProfit: yearlyDelta,
      roi:
        latestReport.totalInvested !== 0
          ? (yearlyDelta / latestReport.totalInvested) * 100
          : 0,
      monthlyData,
      bestMonth,
    };
  };

  const handleSaveDividend = () => {
    if (!divForm.symbol || !divForm.yield || !divForm.date) return;

    addPlannedDividend({
      id: crypto.randomUUID(),
      symbol: divForm.symbol,
      yieldPercentage: Number(divForm.yield), // Zapisujemy procent
      payDate: divForm.date,
      status: "planned",
    });

    setDivForm({ symbol: "", yield: "", date: "" });
  };

  // --- HANDLERY ---

  const handleUpload = async () => {
    if (pendingFile) {
      const positionsData = await processOpenPositions(pendingFile);
      addReport(selectedYear, selectedMonth, positionsData);

      try {
        const historicalDividends =
          await processDividendsFromExcel(pendingFile);
        historicalDividends.forEach((div) => {
          addPlannedDividend({ ...div, status: "received" });
        });
      } catch (err) {
        console.log("Brak arkusza dywidend - pomijam.");
      }
      setIsModalOpen(false);
      setPendingFile(null);
    }
  };

  const years = Array.from(
    new Set(Object.values(store.reports).map((r) => r.year)),
  ).sort((a, b) => b - a);

  // --- WIDOK: LATA (GŁÓWNY) ---
  if (view.type === "years") {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans text-slate-900 pb-32">
        <header className="max-w-7xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic">
            INVEST_DASH
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
            Portfolio Summary
          </p>
        </header>

        {globalStats && (
          <div className="max-w-7xl mx-auto mb-16 bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1 w-full">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-6">
                <Briefcase className="text-indigo-500" /> Stan Portfela
                (Łącznie)
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
                <div className="bg-slate-50 p-6 rounded-[25px] shadow-lg text-slate-400 shadow-indigo-100">
                  <p className="text-[10px] font-black uppercase mb-1">
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
          {years.map((year) => {
            const stats = calculateYearlyStats(year);
            const count = Object.values(store.reports).filter(
              (r) => r.year === year,
            ).length;
            return (
              <div
                key={year}
                onClick={() => setView({ type: "months", id: year })}
                className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col justify-between min-h-[280px]"
              >
                <div className="flex justify-between items-start">
                  <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                    <Folder className="w-7 h-7" />
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-xs font-black ${stats.roi >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                  >
                    {stats.roi >= 0 ? "+" : ""}
                    {stats.roi.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800">
                    Rok {year}
                  </h2>
                  <p className="text-slate-400 font-bold italic text-sm">
                    Raportów: {count}
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Wynik YTD
                  </span>
                  <span
                    className={`text-xl font-black ${stats.deltaProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {stats.deltaProfit >= 0 ? "+" : ""}
                    {stats.deltaProfit.toLocaleString()}{" "}
                    <span className="text-xs">PLN</span>
                  </span>
                </div>
              </div>
            );
          })}

          <div className="bg-indigo-600 p-8 rounded-[40px] shadow-xl flex flex-col items-center justify-center text-white hover:bg-indigo-700 transition-all cursor-pointer group min-h-[280px]">
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
              <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:rotate-90 transition-transform duration-500">
                <Plus size={32} />
              </div>
              <span className="font-black text-lg uppercase tracking-tight">
                Nowy Raport
              </span>
            </label>
          </div>
        </div>

        {globalStats && (
          <div className="max-w-7xl mt-8 mx-auto bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden mb-16">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <Layers className="text-indigo-500" /> Skład Portfela
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">
                      Spółka
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">
                      Ilość
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">
                      Śr. Cena
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">
                      Zainwestowano
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">
                      Akt. Cena
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">
                      Zysk Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {globalStats.latestPositions.map((pos) => {
                    const avgPrice =
                      pos.avgPurchasePrice ||
                      (pos.volume > 0 ? pos.purchaseValue / pos.volume : 0);
                    const currPrice =
                      pos.currentPrice ||
                      (pos.volume > 0
                        ? (pos.purchaseValue + pos.profit) / pos.volume
                        : 0);
                    return (
                      <tr
                        key={pos.symbol}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-8 py-6 font-black text-slate-800 italic text-lg">
                          {pos.symbol}
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-slate-600">
                          {pos.volume.toLocaleString()}{" "}
                          <span className="text-[10px] font-normal">szt</span>
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-slate-400">
                          {avgPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-slate-800">
                          {pos.purchaseValue.toLocaleString()} PLN
                        </td>
                        <td className="px-8 py-6 text-right font-black text-indigo-600">
                          {currPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td
                          className={`px-8 py-6 text-right font-black ${pos.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                        >
                          <div className="flex flex-col items-end">
                            <span>
                              {pos.profit >= 0 ? "+" : ""}
                              {pos.profit.toLocaleString()}{" "}
                              <ArrowUpRight size={12} className="inline" />
                            </span>
                            <span className="text-[10px] opacity-60 font-bold">
                              {((pos.profit / pos.purchaseValue) * 100).toFixed(
                                2,
                              )}
                              %
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEKCJA DYWIDEND */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-fit">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <DollarSign className="text-indigo-500" /> Planuj Dywidendę
            </h3>
            <div className="space-y-4">
              <select
                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700"
                value={divForm.symbol}
                onChange={(e) =>
                  setDivForm({ ...divForm, symbol: e.target.value })
                }
              >
                <option value="">Wybierz spółkę</option>
                {globalStats?.latestPositions.map((p) => (
                  <option key={p.symbol} value={p.symbol}>
                    {p.symbol}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Stopa dywidendy (%) np. 4.5"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold"
                value={divForm.yield}
                onChange={(e) =>
                  setDivForm({ ...divForm, yield: e.target.value })
                }
              />
              <input
                type="date"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-500"
                value={divForm.date}
                onChange={(e) =>
                  setDivForm({ ...divForm, date: e.target.value })
                }
              />
              <button
                onClick={handleSaveDividend}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                DODAJ DO PLANU
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-xl font-black text-slate-800 italic uppercase">
                Harmonogram Dywidend
              </h3>
              <Target size={20} className="text-slate-300" />
            </div>
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">
                      Spółka
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">
                      Data wypłaty
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">
                      Prognoza (netto)
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">
                      Akcja
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedDividends.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-8 py-10 text-center text-slate-400 font-bold italic"
                      >
                        Brak zaplanowanych dywidend
                      </td>
                    </tr>
                  )}
                  {sortedDividends.map((div) => {
                    const isHistory = new Date(div.payDate) < new Date();
                    return (
                      <tr
                        key={div.id}
                        className={`transition-colors ${isHistory ? "opacity-40 grayscale bg-slate-50/30" : "hover:bg-slate-50/50"}`}
                      >
                        <td className="px-8 py-5 font-black text-slate-800">
                          <div className="flex items-center gap-2">
                            {isHistory ? (
                              <History size={14} />
                            ) : (
                              <Target size={14} className="text-indigo-500" />
                            )}
                            {div.symbol}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-slate-500 font-bold text-sm">
                          {new Date(div.payDate).toLocaleDateString("pl-PL", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-8 py-5 text-right font-black text-emerald-500 text-lg">
                          <div className="flex flex-col items-end">
                            <span>
                              +{" "}
                              {div.totalAmount?.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}{" "}
                              PLN
                            </span>
                            {div.status === "planned" && (
                              <span className="text-[9px] text-slate-400 font-normal uppercase">
                                Est. ({div.yieldPercentage}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => removePlannedDividend(div.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL (Ten sam co wcześniej) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl animate-in zoom-in">
              <h3 className="text-2xl font-black mb-6">Dane raportu</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Rok
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full bg-slate-50 rounded-xl p-4 font-black"
                    >
                      {[2024, 2025, 2026].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Miesiąc
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full bg-slate-50 rounded-xl p-4 font-black"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString("pl", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all"
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

    const yearlyStats = calculateYearlyStats(Number(view.id));

    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 font-sans">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setView({ type: "years" })}
            className="group flex items-center gap-3 text-slate-400 font-black mb-8 hover:text-indigo-600 transition-all uppercase text-[10px] md:text-xs tracking-widest"
          >
            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:-translate-x-1 transition-transform">
              <ArrowLeft size={16} />
            </div>
            Powrót do lat
          </button>

          <h2 className="text-3xl md:text-5xl font-black mb-8 md:mb-12 tracking-tighter italic">
            Rok {view.id}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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
                  className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <Calendar size={20} />
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-[9px] md:text-[11px] font-black ${deltaProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                    >
                      {monthROI >= 0 ? "+" : ""}
                      {monthROI.toFixed(2)}% m/m
                    </div>
                  </div>
                  <h3 className="text-xl md:text-3xl font-black text-slate-800 uppercase italic mb-6">
                    {new Date(0, report.month - 1).toLocaleString("pl-PL", {
                      month: "long",
                    })}
                  </h3>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase">
                      Wynik
                    </span>
                    <p
                      className={`text-lg md:text-2xl font-black ${deltaProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {deltaProfit >= 0 ? "+" : ""}
                      {deltaProfit.toLocaleString()}{" "}
                      <span className="text-xs">PLN</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PODSUMOWANIE ROKU ZE STATYSTYKAMI I WYKRESEM */}
          <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 animate-in slide-in-from-bottom duration-700">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* LEWA KOLUMNA: STATYSTYKI */}
              <div className="flex-1 space-y-8">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-4">
                  <BarChart3 className="text-indigo-500" /> Podsumowanie{" "}
                  {view.id}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-[25px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Kapitał (Max)
                    </p>
                    <p className="text-2xl font-black text-slate-800">
                      {yearlyStats.totalInvested.toLocaleString()}{" "}
                      <span className="text-sm font-normal text-slate-400">
                        PLN
                      </span>
                    </p>
                  </div>

                  <div className="bg-indigo-600 p-6 rounded-[25px] text-white shadow-lg shadow-indigo-100">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">
                      ROI Roczne
                    </p>
                    <div className="flex items-center gap-2">
                      <Target size={18} />
                      <p className="text-2xl font-black">
                        {yearlyStats.roi.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[25px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Zysk Roczny
                    </p>
                    <p
                      className={`text-2xl font-black ${yearlyStats.deltaProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {yearlyStats.deltaProfit >= 0 ? "+" : ""}
                      {yearlyStats.deltaProfit.toLocaleString()}{" "}
                      <span className="text-sm font-normal">PLN</span>
                    </p>
                  </div>

                  {yearlyStats.bestMonth && (
                    <div className="bg-amber-50 p-6 rounded-[25px] border border-amber-100">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">
                        Najlepszy miesiąc
                      </p>
                      <div className="flex items-center gap-2 text-amber-700 font-black uppercase italic text-2xl">
                        <Trophy size={18} className="text-amber-500" />
                        {yearlyStats.bestMonth.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PRAWA KOLUMNA: WYKRES */}
              <div className="flex-1 min-h-[300px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center lg:text-left">
                  Historia zysków (m/m)
                </p>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyStats.monthlyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      />
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const val = Number(payload[0].value);
                            return (
                              <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-50">
                                <p className="text-xs font-black text-slate-400 uppercase mb-1">
                                  {payload[0].payload.name}
                                </p>
                                <p
                                  className={`text-lg font-black ${val >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                                >
                                  {val >= 0 ? "+" : ""}
                                  {val.toLocaleString()} PLN
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="profit" radius={[6, 6, 6, 6]} barSize={30}>
                        {yearlyStats.monthlyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.profit >= 0 ? "#10b981" : "#f43f5e"}
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- WIDOK: DASHBOARD (DETALE MIESIĄCA) ---
  const activeReport = store.reports[view.id as string];
  const currentDelta = calculateMonthlyDelta(activeReport);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      <div className="p-4 md:p-8 bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setView({ type: "months", id: activeReport.year })}
            className="group flex items-center gap-3 text-slate-400 font-black hover:text-indigo-600 transition-all uppercase text-[10px] tracking-widest"
          >
            <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:-translate-x-1 transition-transform">
              <ArrowLeft size={16} />
            </div>
            Wróć do listy
          </button>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">
              Wybrany okres
            </p>
            <p className="font-black text-slate-800 uppercase italic text-lg leading-none">
              {new Date(0, activeReport.month - 1).toLocaleString("pl", {
                month: "long",
              })}{" "}
              {activeReport.year}
            </p>
          </div>
        </div>
      </div>
      <Dashboard report={{ ...activeReport, monthlyNetGain: currentDelta }} />
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, History } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import { YearCard } from "../components/YearCard";

export const HistoryPage = () => {
  const navigate = useNavigate();
  const { store } = usePortfolio();

  // Funkcja pomocnicza do pobierania raportu z poprzedniego miesiąca (potrzebna do delty)
  const getPreviousMonthReport = (year: number, month: number) => {
    const allReports = Object.values(store.reports);
    return allReports.find((r) => {
      if (month === 1) return r.year === year - 1 && r.month === 12;
      return r.year === year && r.month === month - 1;
    });
  };

  // Obliczanie zysku m/m dla konkretnego raportu
  const calculateMonthlyDelta = (currentReport: any) => {
    const prevReport = getPreviousMonthReport(
      currentReport.year,
      currentReport.month,
    );
    if (!prevReport) return currentReport.totalProfit;
    return currentReport.totalProfit - prevReport.totalProfit;
  };

  // Logika obliczania statystyk dla całego roku
  const calculateYearlyStats = (year: number) => {
    const yearReports = Object.values(store.reports).filter(
      (r) => r.year === year,
    );

    // Suma zysków ze wszystkich miesięcy w danym roku
    const yearlyDelta = yearReports.reduce(
      (sum, r) => sum + calculateMonthlyDelta(r),
      0,
    );

    // Pobieramy ostatni dostępny raport w roku, żeby sprawdzić kapitał
    const latestInYear = [...yearReports].sort((a, b) => b.month - a.month)[0];

    return {
      deltaProfit: yearlyDelta,
      roi: latestInYear?.totalInvested
        ? (yearlyDelta / latestInYear.totalInvested) * 100
        : 0,
    };
  };

  // Pobranie unikalnych lat i posortowanie ich malejąco
  const years = Array.from(
    new Set(Object.values(store.reports).map((r) => r.year)),
  ).sort((a, b) => b - a);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-2 mb-2">
          <History className="text-indigo-500" size={16} />
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
            Archiwum i Oś Czasu
          </p>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
          Historia <span className="text-indigo-600">Inwestycji</span>
        </h1>
      </header>

      {years.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {years.map((year) => (
            <YearCard
              key={year}
              year={year}
              stats={calculateYearlyStats(year)}
              count={
                Object.values(store.reports).filter((r) => r.year === year)
                  .length
              }
              onClick={() => navigate(`/${year}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 border border-dashed border-slate-200 dark:border-slate-800 text-center">
          <CalendarDays
            className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
            size={48}
          />
          <p className="text-slate-500 dark:text-slate-400 font-bold italic">
            Nie dodano jeszcze żadnych raportów. <br />
            Twoja historia pojawi się tutaj po wgraniu pierwszego pliku Excel.
          </p>
        </div>
      )}

      {/* Info sekcja na dole */}
      <div className="mt-12 p-6 bg-slate-100 dark:bg-slate-800/50 rounded-[30px] border border-slate-200 dark:border-slate-800">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
          Jak czytać historię?
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Każdy kafelek reprezentuje rok Twojej aktywności. Procenty (
          <span className="text-indigo-500 font-black">ROI</span>) pokazują
          zwrot wypracowany w danym roku kalendarzowym w stosunku do
          zainwestowanego kapitału w tamtym okresie. Kliknij w rok, aby zobaczyć
          podział na poszczególne miesiące.
        </p>
      </div>
    </div>
  );
};

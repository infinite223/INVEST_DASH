import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MonthCard } from "../components/MonthCard";
import { YearlySummary } from "../components/YearlySummary";
import { usePortfolio } from "../hooks/usePortfolio";

export const MonthsPage = () => {
  const { year } = useParams<{ year: string }>();
  const navigate = useNavigate();
  const { store } = usePortfolio();

  const getPreviousMonthReport = (y: number, m: number) => {
    const allReports = Object.values(store.reports);
    return allReports.find((r) => {
      if (m === 1) return r.year === y - 1 && r.month === 12;
      return r.year === y && r.month === m - 1;
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

  const calculateYearlyStats = (y: number) => {
    const yearReports = Object.values(store.reports)
      .filter((r) => r.year === y)
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

  const currentYear = Number(year);
  const monthsInYear = Object.values(store.reports)
    .filter((r) => r.year === currentYear)
    .sort((a, b) => b.month - a.month);

  const yearlyStats = calculateYearlyStats(currentYear);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans pb-20 transition-colors duration-300">
      <div className="p-4 md:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800 mb-8 shadow-sm dark:shadow-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate("/history")}
            className="group flex items-center gap-3 text-slate-400 dark:text-slate-500 font-black hover:text-indigo-600 dark:hover:text-indigo-400 transition-all uppercase text-[10px] tracking-widest"
          >
            <div className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:-translate-x-1 transition-transform border dark:border-slate-700">
              <ArrowLeft size={16} />
            </div>
            <span className="hidden xs:inline">Powrót do lat</span>
          </button>

          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase leading-none mb-1">
              Przegląd roczny
            </p>
            <p className="font-black text-slate-800 dark:text-white uppercase italic text-lg leading-none transition-colors">
              Rok {year}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          {monthsInYear.map((report) => {
            const deltaProfit = calculateMonthlyDelta(report);
            const monthROI =
              report.totalInvested !== 0
                ? (deltaProfit / report.totalInvested) * 100
                : 0;

            return (
              <div
                key={report.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <MonthCard
                  reportId={report.id}
                  month={report.month}
                  deltaProfit={deltaProfit}
                  monthROI={monthROI}
                  onClick={() => navigate(`/${year}/${report.month}`)}
                />
              </div>
            );
          })}

          {monthsInYear.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 dark:text-slate-600 font-bold italic">
                Brak raportów dla tego roku.
              </p>
            </div>
          )}
        </div>

        {monthsInYear.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="mb-6">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">
                Analityka
              </p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
                Statystyki <span className="text-indigo-600">zbiorcze</span>
              </h3>
            </header>
            <YearlySummary
              yearId={year!}
              totalInvested={yearlyStats.totalInvested}
              roi={yearlyStats.roi}
              deltaProfit={yearlyStats.deltaProfit}
              bestMonth={yearlyStats.bestMonth}
              monthlyData={yearlyStats.monthlyData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

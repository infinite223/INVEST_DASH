import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import Dashboard from "../components/Dashboard";

export const DetailsPage = () => {
  const { year, month } = useParams<{ year: string; month: string }>();
  const navigate = useNavigate();
  const { store } = usePortfolio();
  const activeReport = Object.values(store.reports).find(
    (r) => r.year === Number(year) && r.month === Number(month),
  );

  const calculateMonthlyDelta = (report: any) => {
    if (!report) return 0;

    const allReports = Object.values(store.reports);
    const prevReport = allReports.find((r) => {
      if (report.month === 1) {
        return r.year === report.year - 1 && r.month === 12;
      }
      return r.year === report.year && r.month === report.month - 1;
    });

    if (!prevReport) return report.totalProfit;
    return report.totalProfit - prevReport.totalProfit;
  };

  if (!activeReport) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-black text-slate-800 mb-4">
          Nie znaleziono raportu
        </h2>
        <button
          onClick={() => navigate(`/${year}`)}
          className="text-indigo-600 font-bold uppercase text-sm tracking-widest hover:underline"
        >
          Wróć do listy miesięcy
        </button>
      </div>
    );
  }

  const currentDelta = calculateMonthlyDelta(activeReport);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      <div className="p-4 md:p-8 bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate(`/${year}`)}
            className="group flex items-center gap-3 text-slate-400 font-black hover:text-indigo-600 transition-all uppercase text-[10px] tracking-widest"
          >
            <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:-translate-x-1 transition-transform">
              <ArrowLeft size={16} />
            </div>
            Wróć do roku {year}
          </button>

          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">
              Szczegóły okresu
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

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Dashboard report={{ ...activeReport, monthlyNetGain: currentDelta }} />
      </div>
    </div>
  );
};

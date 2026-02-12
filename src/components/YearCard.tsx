import { Folder } from "lucide-react";

interface YearCardProps {
  year: number;
  stats: any;
  count: number;
  onClick: () => void;
}

export const YearCard = ({ year, stats, count, onClick }: YearCardProps) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-slate-900/50 p-6 md:p-7 rounded-[30px] md:rounded-[40px] shadow-sm dark:shadow-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-xl dark:hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all group flex flex-col justify-between min-h-[220px] md:min-h-[260px]"
  >
    <div className="flex justify-between items-start">
      <div className="h-10 w-10 md:h-12 md:w-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform">
        <Folder className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div
        className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-tighter ${
          stats.roi >= 0
            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
        }`}
      >
        {stats.roi >= 0 ? "+" : ""}
        {stats.roi.toFixed(2)}%
      </div>
    </div>

    <div>
      <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
        Rok {year}
      </h2>
      <p className="text-slate-400 dark:text-slate-500 font-bold italic text-[11px] md:text-xs mt-1">
        Raportów: {count}
      </p>
    </div>

    <div className="pt-4 md:pt-5 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
      <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        Wynik YTD
      </span>
      <span
        className={`text-base md:text-lg font-black ${
          stats.deltaProfit >= 0
            ? "text-emerald-500 dark:text-emerald-400"
            : "text-rose-500 dark:text-rose-400"
        }`}
      >
        {stats.deltaProfit >= 0 ? "+" : ""}
        {stats.deltaProfit.toLocaleString()}{" "}
        <span className="text-[10px] opacity-60 dark:text-slate-500">PLN</span>
      </span>
    </div>
  </div>
);

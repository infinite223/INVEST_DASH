import { Calendar } from "lucide-react";

interface MonthCardProps {
  reportId: string | number;
  month: number;
  deltaProfit: number;
  monthROI: number;
  onClick: () => void;
}

export const MonthCard = ({
  month,
  deltaProfit,
  monthROI,
  onClick,
}: MonthCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all group"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white dark:group-hover:bg-indigo-500 transition-colors">
          <Calendar size={20} />
        </div>

        <div
          className={`px-3 py-1 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-wider ${
            deltaProfit >= 0
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          {monthROI >= 0 ? "+" : ""}
          {monthROI.toFixed(2)}% m/m
        </div>
      </div>

      <h3 className="text-xl md:text-3xl font-black text-slate-800 dark:text-white uppercase italic mb-6 transition-colors">
        {new Date(0, month - 1).toLocaleString("pl-PL", {
          month: "long",
        })}
      </h3>

      <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800/50">
        <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
          Wynik
        </span>
        <p
          className={`text-lg md:text-2xl font-black ${
            deltaProfit >= 0
              ? "text-emerald-500 dark:text-emerald-400"
              : "text-rose-500 dark:text-rose-400"
          }`}
        >
          {deltaProfit >= 0 ? "+" : ""}
          {deltaProfit.toLocaleString()}{" "}
          <span className="text-xs opacity-70">PLN</span>
        </p>
      </div>
    </div>
  );
};

import { BarChart3, Target, Trophy } from "lucide-react";
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

interface MonthlyData {
  name: string;
  profit: number;
  monthNum: number;
}

interface YearlySummaryProps {
  yearId: string | number;
  totalInvested: number;
  roi: number;
  deltaProfit: number;
  bestMonth: { name: string; profit: number } | null;
  monthlyData: MonthlyData[];
}

export const YearlySummary = ({
  yearId,
  totalInvested,
  roi,
  deltaProfit,
  bestMonth,
  monthlyData,
}: YearlySummaryProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom duration-700 transition-colors">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3 mb-4 transition-colors">
            <BarChart3 className="text-indigo-500 dark:text-indigo-400" />{" "}
            Podsumowanie {yearId}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kapitał */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[25px] transition-colors">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Kapitał (Max)
              </p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">
                {totalInvested.toLocaleString()}{" "}
                <span className="text-sm font-normal text-slate-400">PLN</span>
              </p>
            </div>

            {/* ROI */}
            <div className="bg-indigo-600 dark:bg-indigo-500 p-6 rounded-[25px] text-white shadow-lg shadow-indigo-100 dark:shadow-none transition-colors">
              <p className="text-[10px] font-black text-indigo-200 dark:text-indigo-100 uppercase tracking-widest mb-1">
                ROI Roczne
              </p>
              <div className="flex items-center gap-2">
                <Target size={18} />
                <p className="text-2xl font-black">{roi.toFixed(2)}%</p>
              </div>
            </div>

            {/* Zysk Roczny */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[25px] transition-colors">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Zysk Roczny
              </p>
              <p
                className={`text-2xl font-black ${
                  deltaProfit >= 0
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-rose-500 dark:text-rose-400"
                }`}
              >
                {deltaProfit >= 0 ? "+" : ""}
                {deltaProfit.toLocaleString()}{" "}
                <span className="text-sm font-normal opacity-60">PLN</span>
              </p>
            </div>

            {/* Najlepszy Miesiąc */}
            {bestMonth && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-[25px] border border-amber-100 dark:border-amber-900/30 transition-colors">
                <p className="text-[10px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1">
                  Najlepszy miesiąc
                </p>
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black uppercase italic text-2xl">
                  <Trophy
                    size={18}
                    className="text-amber-500 dark:text-amber-400"
                  />
                  {bestMonth.name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wykres */}
        <div className="flex-1 min-h-[300px]">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 text-center lg:text-left">
            Historia zysków (m/m)
          </p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
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
                  cursor={{
                    fill: "currentColor",
                    className: "text-slate-50 dark:text-slate-800/50",
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const val = Number(payload[0].value);
                      return (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-50 dark:border-slate-700">
                          <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-1">
                            {payload[0].payload.name}
                          </p>
                          <p
                            className={`text-lg font-black ${
                              val >= 0
                                ? "text-emerald-500 dark:text-emerald-400"
                                : "text-rose-500 dark:text-rose-400"
                            }`}
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
                  {monthlyData.map((entry, index) => (
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
  );
};

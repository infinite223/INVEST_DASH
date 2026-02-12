import { useMemo, useState } from "react";
import {
  Wallet,
  PieChart,
  TrendingUp,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Rectangle,
} from "recharts";
import { MonthData, OpenPosition, SortOrder } from "../types";
import { usePortfolio } from "../hooks/usePortfolio";

type SortKeys = "purchaseValue" | "monthlyProfitDelta" | "profit";

interface DashboardProps {
  report: MonthData;
}

interface PositionWithDelta extends OpenPosition {
  monthlyProfitDelta: number;
}

export default function Dashboard({ report }: DashboardProps) {
  const { store } = usePortfolio();
  const { positions, totalInvested, monthlyNetGain, year, month } = report;

  const [sortConfig, setSortConfig] = useState<{
    key: SortKeys;
    order: SortOrder;
  }>({
    key: "purchaseValue",
    order: "desc",
  });

  const prevReport = useMemo(() => {
    return Object.values(store.reports).find((r) => {
      if (month === 1) return r.year === year - 1 && r.month === 12;
      return r.year === year && r.month === month - 1;
    });
  }, [store.reports, year, month]);

  const enrichedPositions = useMemo<PositionWithDelta[]>(() => {
    const data = positions.map((currentPos) => {
      const prevPos = prevReport?.positions.find(
        (p) => p.symbol === currentPos.symbol,
      );
      const monthlyProfitDelta = prevPos
        ? currentPos.profit - prevPos.profit
        : currentPos.profit;
      return { ...currentPos, monthlyProfitDelta };
    });

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      return sortConfig.order === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
          ? 1
          : -1;
    });
  }, [positions, prevReport, sortConfig]);

  const chartData = useMemo(() => {
    return enrichedPositions.map((pos) => ({
      name: pos.symbol,
      value: Number(pos.purchaseValue.toFixed(2)),
      profit: Number(pos.monthlyProfitDelta.toFixed(2)),
    }));
  }, [enrichedPositions]);

  const totalROI = useMemo(() => {
    return totalInvested !== 0 ? (monthlyNetGain / totalInvested) * 100 : 0;
  }, [totalInvested, monthlyNetGain]);

  const requestSort = (key: SortKeys) => {
    setSortConfig((prev) => ({
      key,
      order: prev.key === key && prev.order === "desc" ? "asc" : "desc",
    }));
  };

  const SortIcon = ({ column }: { column: SortKeys }) => {
    if (sortConfig.key !== column) return <div className="w-4" />;
    return (
      <span className="ml-1 text-indigo-500 dark:text-indigo-400">
        {sortConfig.order === "asc" ? (
          <ChevronUp size={14} />
        ) : (
          <ChevronDown size={14} />
        )}
      </span>
    );
  };

  return (
    <div className="p-3 md:p-10 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-700">
        {/* Sekcja Wykresów */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Wykres Alokacji */}
          <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px] flex flex-col transition-colors">
            <h3 className="text-lg md:text-xl font-black mb-6 text-slate-800 dark:text-white flex items-center gap-3">
              <PieChart className="text-indigo-500" size={20} /> Alokacja
            </h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={60}
                    style={{
                      fontWeight: "700",
                      fill: "currentColor",
                      fontSize: "11px",
                    }}
                    className="text-slate-500 dark:text-slate-400"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(15, 23, 42)",
                      borderRadius: "15px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#6366f1"
                    radius={[0, 8, 8, 0]}
                    barSize={15}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Wykres Wyników Delta */}
          <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px] flex flex-col transition-colors">
            <h3 className="text-lg md:text-xl font-black mb-6 text-slate-800 dark:text-white flex items-center gap-3">
              <TrendingUp className="text-emerald-500" size={20} /> Wynik (Delta
              m/m)
            </h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    style={{
                      fill: "currentColor",
                      fontWeight: "700",
                      fontSize: "11px",
                    }}
                    className="text-slate-500 dark:text-slate-400"
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(15, 23, 42)",
                      borderRadius: "15px",
                      border: "none",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar
                    dataKey="profit"
                    shape={(p: any) => (
                      <Rectangle
                        {...p}
                        fill={p.payload.profit >= 0 ? "#10b981" : "#f43f5e"}
                        fillOpacity={0.8}
                        radius={4}
                      />
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Główne Statystyki (Portfel i Zysk) */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 transition-all">
          <div className="flex items-center gap-5 md:gap-8 w-full lg:w-auto text-center lg:text-left justify-center lg:justify-start">
            <div className="h-14 w-14 md:h-20 md:w-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Wallet className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mb-1">
                Portfel {report.year}
              </p>
              <p className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {totalInvested.toLocaleString("pl-PL", {
                  minimumFractionDigits: 2,
                })}
                <span className="text-lg md:text-2xl ml-1 md:ml-2 text-slate-300 dark:text-slate-700 font-bold font-sans">
                  PLN
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-12 w-full lg:w-auto">
            <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mb-1">
              Zysk netto (m/m)
            </p>
            <div className="flex flex-col items-center lg:items-end gap-2">
              <p
                className={`text-2xl md:text-4xl font-black ${monthlyNetGain >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
              >
                {monthlyNetGain >= 0 ? "+" : ""}
                {monthlyNetGain.toLocaleString("pl-PL", {
                  minimumFractionDigits: 2,
                })}
                <span className="text-base md:text-xl ml-1 font-bold">PLN</span>
              </p>
              <div
                className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-black shadow-sm ${monthlyNetGain >= 0 ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}
              >
                {totalROI.toFixed(2)}% ROI m/m
              </div>
            </div>
          </div>
        </div>

        {/* Tabela Pozycji */}
        <div className="bg-white dark:bg-slate-900 rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px] md:min-w-full">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="px-5 md:px-8 py-3 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Walor
                  </th>
                  <th
                    onClick={() => requestSort("purchaseValue")}
                    className="px-5 md:px-8 py-3 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center justify-end">
                      Kupno <SortIcon column="purchaseValue" />
                    </div>
                  </th>
                  <th
                    onClick={() => requestSort("monthlyProfitDelta")}
                    className="px-5 md:px-8 py-3 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center justify-end">
                      Delta <SortIcon column="monthlyProfitDelta" />
                    </div>
                  </th>
                  <th
                    onClick={() => requestSort("profit")}
                    className="px-5 md:px-8 py-3 md:py-6 text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center justify-end">
                      Total <SortIcon column="profit" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {enrichedPositions.map((pos) => (
                  <tr
                    key={pos.symbol}
                    className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-5 md:px-8 py-3 md:py-6 font-black text-base md:text-xl text-slate-800 dark:text-white italic uppercase transition-colors">
                      {pos.symbol}
                    </td>
                    <td className="px-5 md:px-8 py-3 md:py-6 text-right font-bold text-slate-600 dark:text-slate-400 text-xs md:text-base">
                      {pos.purchaseValue.toLocaleString("pl-PL")}{" "}
                      <span className="text-[8px] md:text-[9px] text-slate-300 dark:text-slate-700 font-normal transition-colors">
                        PLN
                      </span>
                    </td>
                    <td
                      className={`px-5 md:px-8 py-3 md:py-6 text-right font-black text-sm md:text-lg ${
                        pos.monthlyProfitDelta >= 0
                          ? "text-emerald-500 dark:text-emerald-400"
                          : "text-rose-500 dark:text-rose-400"
                      }`}
                    >
                      {pos.monthlyProfitDelta >= 0 ? "+" : ""}
                      {pos.monthlyProfitDelta.toLocaleString("pl-PL")}
                    </td>
                    <td className="px-5 md:px-8 py-3 md:py-6 text-right font-bold text-slate-400 dark:text-slate-500 text-[10px] md:text-sm">
                      {pos.profit >= 0 ? "+" : ""}
                      {pos.profit.toLocaleString("pl-PL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

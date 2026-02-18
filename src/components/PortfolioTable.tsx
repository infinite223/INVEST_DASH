import { useState, useMemo } from "react";
import {
  Layers,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  PieChart as PieIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  PieLabelRenderProps,
} from "recharts";
import { PortfolioSortKeys, SortOrder } from "../types";

interface PortfolioTableProps {
  positions: any[];
  sortConfig: {
    key: PortfolioSortKeys;
    order: SortOrder;
  };
  onRequestSort: (key: PortfolioSortKeys) => void;
}

const COLORS = [
  "#6366f1",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f43f5e",
];

export const PortfolioTable = ({
  positions,
  sortConfig,
  onRequestSort,
}: PortfolioTableProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isChartExpanded, setIsChartExpanded] = useState(true);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const allocationData = useMemo(() => {
    const data = positions.map((pos) => ({
      name: pos.symbol,
      value: Math.max(0, pos.purchaseValue + pos.profit),
    }));
    return data.sort((a, b) => b.value - a.value);
  }, [positions]);

  const totalValue = useMemo(
    () => allocationData.reduce((acc, curr) => acc + curr.value, 0),
    [allocationData],
  );

  const renderCustomLabel = (props: PieLabelRenderProps) => {
    if (isMobile) return undefined;

    const {
      cx = 0,
      cy = 0,
      midAngle = 0,
      outerRadius = 0,
      percent = 0,
      value = 0,
      name,
    } = props;
    const RADIAN = Math.PI / 180;
    const radius = Number(outerRadius) * 1.15;
    const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
    const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#1e293b"
        textAnchor={x > Number(cx) ? "start" : "end"}
        dominantBaseline="central"
        className="font-black italic uppercase"
      >
        <tspan x={x} dy="-0.5em" fontSize="11" fill="#6366f1">
          {name} ({(Number(percent) * 100).toFixed(1)}%)
        </tspan>
        <tspan x={x} dy="1.2em" fontSize="9" fill="#94a3b8" fontWeight="bold">
          {Number(value).toLocaleString()} PLN
        </tspan>
      </text>
    );
  };

  const SortIndicator = ({
    active,
    order,
  }: {
    active: boolean;
    order: SortOrder;
  }) => {
    if (!active) return <span className="ml-1 opacity-20">↕</span>;
    return (
      <span className="ml-1 text-indigo-500">
        {order === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mt-6 md:mt-8 mx-auto space-y-6 mb-8 md:px-0">
      <div className="bg-white dark:bg-slate-900 rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div
          className="p-5 md:p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
            <div className="flex items-center gap-2">
              <Layers className="text-indigo-500 dark:text-indigo-400 w-5 h-5 md:w-6 md:h-6" />
              <h3 className="text-base md:text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter leading-none">
                Skład Portfela
              </h3>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 normal-case italic tracking-normal md:mt-1">
              ({positions.length} pozycji)
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest flex-shrink-0">
            <span>{isExpanded ? "Zwiń" : "Rozwiń"}</span>
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>
        </div>

        <div
          className={`transition-all duration-300 ${isExpanded ? "block" : "hidden"}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[650px] md:min-w-full">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th
                    onClick={() => onRequestSort("symbol")}
                    className="px-5 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Spółka{" "}
                    <SortIndicator
                      active={sortConfig.key === "symbol"}
                      order={sortConfig.order}
                    />
                  </th>
                  <th className="px-5 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-right">
                    Ilość
                  </th>
                  <th className="px-5 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-right">
                    Śr. Cena
                  </th>
                  <th
                    onClick={() => onRequestSort("purchaseValue")}
                    className="px-5 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-right cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Zainwestowano{" "}
                    <SortIndicator
                      active={sortConfig.key === "purchaseValue"}
                      order={sortConfig.order}
                    />
                  </th>
                  <th
                    onClick={() => onRequestSort("currPrice")}
                    className="px-5 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-right cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Akt. Cena{" "}
                    <SortIndicator
                      active={sortConfig.key === "currPrice"}
                      order={sortConfig.order}
                    />
                  </th>
                  <th
                    onClick={() => onRequestSort("profit")}
                    className="px-5 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase text-right cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Zysk Total{" "}
                    <SortIndicator
                      active={sortConfig.key === "profit"}
                      order={sortConfig.order}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs md:text-sm">
                {positions.map((pos) => {
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
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 md:px-8 py-3 md:py-5 font-black text-slate-800 dark:text-white uppercase italic text-sm md:text-base">
                        {pos.symbol}
                      </td>
                      <td className="px-5 md:px-8 py-3 md:py-5 text-right font-bold text-slate-600 dark:text-slate-300">
                        {pos.volume.toLocaleString()}{" "}
                        <span className="text-[8px] md:text-[10px] font-normal uppercase opacity-60">
                          szt
                        </span>
                      </td>
                      <td className="px-5 md:px-8 py-3 md:py-5 text-right font-bold text-slate-400 dark:text-slate-500">
                        {avgPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-5 md:px-8 py-3 md:py-5 text-right font-bold text-slate-800 dark:text-slate-200">
                        {pos.purchaseValue.toLocaleString()}{" "}
                        <span className="text-[8px] md:text-[10px] font-normal uppercase opacity-60">
                          PLN
                        </span>
                      </td>
                      <td className="px-5 md:px-8 py-3 md:py-5 text-right font-black text-indigo-600 dark:text-indigo-400">
                        {currPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`px-5 md:px-8 py-3 md:py-5 text-right font-black ${pos.profit >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
                      >
                        <div className="flex flex-col items-end leading-tight">
                          <span className="whitespace-nowrap">
                            {pos.profit >= 0 ? "+" : ""}
                            {pos.profit.toLocaleString()}{" "}
                            <ArrowUpRight size={10} className="inline ml-1" />
                          </span>
                          <span className="text-[9px] md:text-[10px] opacity-60 font-black">
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
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div
          className="p-5 md:p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors"
          onClick={() => setIsChartExpanded(!isChartExpanded)}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
            <div className="flex items-center gap-2">
              <PieIcon className="text-indigo-500 dark:text-indigo-400 w-5 h-5 md:w-6 md:h-6" />
              <h3 className="text-base md:text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter leading-none">
                Struktura Alokacji Portfela
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest flex-shrink-0">
            <span>{isChartExpanded ? "Zwiń" : "Rozwiń"}</span>
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
              {isChartExpanded ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </div>
          </div>
        </div>

        <div
          className={`p-4 md:p-12 transition-all duration-300 ${isChartExpanded ? "block" : "hidden"}`}
        >
          <div className="w-full aspect-square md:aspect-video max-h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? "60%" : "50%"}
                  outerRadius={isMobile ? "95%" : "80%"}
                  paddingAngle={isMobile ? 2 : 4}
                  dataKey="value"
                  label={isMobile ? undefined : renderCustomLabel}
                  labelLine={!isMobile}
                >
                  {allocationData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="currentColor"
                      strokeWidth={2}
                      className="text-white dark:text-slate-900"
                    />
                  ))}
                </Pie>
                <Tooltip
                  trigger={isMobile ? "click" : "hover"}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const pct = ((data.value / totalValue) * 100).toFixed(1);
                      return (
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 ring-4 ring-slate-50 dark:ring-slate-900/50">
                          <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase italic">
                            {data.name}
                          </p>
                          <p className="text-lg font-black text-slate-800 dark:text-white">
                            {Number(data.value).toLocaleString()} PLN
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {pct}% udziału
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="px-5 pb-8 mt-8 flex flex-wrap justify-center gap-x-4 gap-y-3 md:gap-x-10 md:gap-y-6 border-t border-slate-50 dark:border-slate-800 pt-8">
            {allocationData.map((entry, index) => (
              <div
                key={entry.name}
                className="flex items-center gap-2 min-w-[90px]"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-sm font-black text-slate-700 dark:text-slate-200 uppercase italic leading-none">
                    {entry.name}
                  </span>
                  <span className="text-[9px] md:text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                    {((entry.value / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

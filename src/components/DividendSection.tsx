import {
  DollarSign,
  Target,
  History,
  Trash2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react";
import { DividendSortKeys, SortOrder } from "../types";
import { useMemo, useState } from "react";
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

interface DividendSectionProps {
  dividends: any[];
  form: { symbol: string; yield: string; date: string };
  onFormChange: (field: string, value: string) => void;
  onSave: () => void;
  onRemove: (id: string) => void;
  availableSymbols: string[];
  sortConfig: { key: DividendSortKeys; order: SortOrder };
  onRequestSort: (key: DividendSortKeys) => void;
}

export const DividendSection = ({
  dividends,
  form,
  onFormChange,
  onSave,
  onRemove,
  availableSymbols,
  sortConfig,
  onRequestSort,
}: DividendSectionProps) => {
  const [isTableExpanded, setIsTableExpanded] = useState(true);

  const currentYear = new Date().getFullYear();

  const monthlyData = useMemo(() => {
    const months = [
      "Sty",
      "Lut",
      "Mar",
      "Kwi",
      "Maj",
      "Cze",
      "Lip",
      "Sie",
      "Wrz",
      "Paź",
      "Lis",
      "Gru",
    ];
    const data = months.map((name) => ({ name, total: 0 }));
    dividends.forEach((div) => {
      const date = new Date(div.payDate);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        data[monthIndex].total += div.totalAmount || 0;
      }
    });
    return data;
  }, [dividends, currentYear]);

  const yearlyTotals = useMemo(() => {
    const totals: { [key: number]: number } = {};
    dividends.forEach((div) => {
      const year = new Date(div.payDate).getFullYear();
      const amount = div.totalAmount || 0;
      totals[year] = (totals[year] || 0) + amount;
    });
    return Object.entries(totals)
      .map(([year, total]) => ({ year: Number(year), total }))
      .sort((a, b) => b.year - a.year);
  }, [dividends]);

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
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 mt-4 md:mt-8 px-2 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 h-fit">
          <h3 className="text-lg md:text-xl font-black mb-4 md:mb-6 flex items-center gap-2 text-slate-800 uppercase italic tracking-tighter">
            <DollarSign className="text-indigo-500 w-5 h-5 md:w-6 md:h-6" />{" "}
            Planuj Dywidendę
          </h3>
          <div className="space-y-3 md:space-y-4">
            <select
              className="w-full p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none font-bold text-slate-700 outline-indigo-500 appearance-none text-sm md:text-base"
              value={form.symbol}
              onChange={(e) => onFormChange("symbol", e.target.value)}
            >
              <option value="">Wybierz spółkę</option>
              {availableSymbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Stopa dywidendy (%)"
              className="w-full p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none font-bold outline-indigo-500 placeholder:text-slate-300 text-sm md:text-base"
              value={form.yield}
              onChange={(e) => onFormChange("yield", e.target.value)}
            />
            <input
              type="date"
              className="w-full p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none font-bold text-slate-500 outline-indigo-500 text-sm md:text-base"
              value={form.date}
              onChange={(e) => onFormChange("date", e.target.value)}
            />
            <button
              onClick={onSave}
              className="w-full bg-indigo-600 text-white font-black py-3 md:py-4 rounded-xl md:rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] uppercase tracking-wider text-xs md:text-sm"
            >
              DODAJ DO PLANU
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
            <div
              className="p-5 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 cursor-pointer hover:bg-slate-50/60 transition-colors"
              onClick={() => setIsTableExpanded(!isTableExpanded)}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-indigo-500 w-5 h-5 md:w-6 md:h-6" />
                  <h3 className="text-base md:text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                    Harmonogram Dywidend
                  </h3>
                </div>
                <span className="text-[10px] md:text-xs font-bold text-slate-400 normal-case italic tracking-normal md:mt-1">
                  ({dividends.length} pozycji)
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest flex-shrink-0">
                <span className="hidden xs:inline">
                  {isTableExpanded ? "Zwiń" : "Rozwiń"}
                </span>
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
                  {isTableExpanded ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </div>
              </div>
            </div>

            <div className={`${isTableExpanded ? "block" : "hidden"}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px] md:min-w-full">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th
                        onClick={() => onRequestSort("symbol")}
                        className="px-5 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase cursor-pointer hover:text-indigo-600"
                      >
                        Spółka{" "}
                        <SortIndicator
                          active={sortConfig.key === "symbol"}
                          order={sortConfig.order}
                        />
                      </th>
                      <th
                        onClick={() => onRequestSort("payDate")}
                        className="px-5 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase cursor-pointer hover:text-indigo-600"
                      >
                        Data{" "}
                        <SortIndicator
                          active={sortConfig.key === "payDate"}
                          order={sortConfig.order}
                        />
                      </th>
                      <th
                        onClick={() => onRequestSort("totalAmount")}
                        className="px-5 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase text-right cursor-pointer hover:text-indigo-600"
                      >
                        Prognoza{" "}
                        <SortIndicator
                          active={sortConfig.key === "totalAmount"}
                          order={sortConfig.order}
                        />
                      </th>
                      <th className="px-5 md:px-8 py-3 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase text-right">
                        Akcja
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {dividends.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-8 py-10 text-center text-slate-400 font-bold italic text-sm"
                        >
                          Brak zaplanowanych dywidend
                        </td>
                      </tr>
                    ) : (
                      dividends.map((div) => {
                        const isHistory = new Date(div.payDate) < new Date();
                        return (
                          <tr
                            key={div.id}
                            className={`transition-colors ${isHistory ? "opacity-40 grayscale bg-slate-50/30" : "hover:bg-slate-50/50"}`}
                          >
                            <td className="px-5 md:px-8 py-3 md:py-5 font-black text-slate-800 uppercase italic text-sm md:text-base">
                              <div className="flex items-center gap-2">
                                {isHistory ? (
                                  <History size={12} />
                                ) : (
                                  <Target
                                    size={12}
                                    className="text-indigo-500"
                                  />
                                )}
                                {div.symbol}
                              </div>
                            </td>
                            <td className="px-5 md:px-8 py-3 md:py-5 text-slate-500 font-bold text-[11px] md:text-sm">
                              {new Date(div.payDate).toLocaleDateString(
                                "pl-PL",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="px-5 md:px-8 py-3 md:py-5 text-right font-black text-emerald-500 text-sm md:text-lg leading-tight">
                              <div className="flex flex-col items-end">
                                <span>
                                  +{" "}
                                  {div.totalAmount?.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}{" "}
                                  <span className="text-[9px] md:text-[10px]">
                                    PLN
                                  </span>
                                </span>
                                {div.status === "planned" && (
                                  <span className="text-[8px] md:text-[9px] text-slate-400 font-normal uppercase tracking-tighter">
                                    Est. ({div.yieldPercentage}%)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 md:px-8 py-3 md:py-5 text-right">
                              <button
                                onClick={() => onRemove(div.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 md:p-8 rounded-[30px] md:rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <BarChart3 className="text-indigo-500" size={20} />
          <h3 className="text-base md:text-xl font-black text-slate-800 italic uppercase">
            Prognoza wypłat: {currentYear}
          </h3>
        </div>
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: "bold" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={32}>
                {monthlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.total > 0 ? "#6366f1" : "#e2e8f0"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center gap-3 mb-4 md:mb-6 px-2">
          <CalendarDays className="text-indigo-500" size={20} />
          <h3 className="text-lg md:text-xl font-black text-slate-800 italic uppercase">
            Suma Dywidend w Latach
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {yearlyTotals.map(({ year, total }) => {
            const perMonth = total / 12;
            const perHour = total / (365 * 24);
            return (
              <div
                key={year}
                className="bg-white p-5 md:p-6 rounded-[25px] md:rounded-[30px] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                    Rok {year}
                  </p>
                  <div className="flex items-baseline gap-2 mb-3 md:mb-4">
                    <p className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400">
                      PLN
                    </span>
                  </div>
                </div>
                <div className="space-y-2 pt-3 md:pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">
                      Miesięcznie
                    </span>
                    <span className="text-xs md:text-sm font-bold text-slate-700">
                      ~{" "}
                      {perMonth.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}{" "}
                      zł
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase">
                      Na godzinę
                    </span>
                    <span className="text-xs md:text-sm font-black text-indigo-600">
                      {perHour.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}{" "}
                      zł
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

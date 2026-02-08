import {
  DollarSign,
  Target,
  History,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { DividendSortKeys, SortOrder } from "../types";
import { useMemo } from "react";

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
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-fit">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
            <DollarSign className="text-indigo-500" /> Planuj Dywidendę
          </h3>
          <div className="space-y-4">
            <select
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 outline-indigo-500"
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
              placeholder="Stopa dywidendy (%) np. 4.5"
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-indigo-500"
              value={form.yield}
              onChange={(e) => onFormChange("yield", e.target.value)}
            />

            <input
              type="date"
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-500 outline-indigo-500"
              value={form.date}
              onChange={(e) => onFormChange("date", e.target.value)}
            />

            <button
              onClick={onSave}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
            >
              DODAJ DO PLANU
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-xl font-black text-slate-800 italic uppercase tracking-tight">
              Harmonogram Dywidend
            </h3>
            <Target size={20} className="text-slate-300" />
          </div>

          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th
                      onClick={() => onRequestSort("symbol")}
                      className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      Spółka{" "}
                      <SortIndicator
                        active={sortConfig.key === "symbol"}
                        order={sortConfig.order}
                      />
                    </th>
                    <th
                      onClick={() => onRequestSort("payDate")}
                      className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      Data wypłaty{" "}
                      <SortIndicator
                        active={sortConfig.key === "payDate"}
                        order={sortConfig.order}
                      />
                    </th>
                    <th
                      onClick={() => onRequestSort("totalAmount")}
                      className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      Prognoza{" "}
                      <SortIndicator
                        active={sortConfig.key === "totalAmount"}
                        order={sortConfig.order}
                      />
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">
                      Akcja
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dividends.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-8 py-10 text-center text-slate-400 font-bold italic"
                      >
                        Brak zaplanowanych dywidend
                      </td>
                    </tr>
                  )}
                  {dividends.map((div) => {
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
                            onClick={() => onRemove(div.id)}
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
      </div>

      <div className="pt-4">
        <div className="flex items-center gap-3 mb-6 px-4">
          <CalendarDays className="text-indigo-500" size={24} />
          <h3 className="text-xl font-black text-slate-800 italic uppercase">
            Suma Dywidend w Latach
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {yearlyTotals.map(({ year, total }) => {
            const perMonth = total / 12;
            const perHour = total / (365 * 24); // Średnio w roku

            return (
              <div
                key={year}
                className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                    Rok {year}
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <span className="text-xs font-bold text-slate-400">
                      PLN
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase">
                      Miesięcznie
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      ~{" "}
                      {perMonth.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      zł
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase text-indigo-500">
                      Na godzinę (24h)
                    </span>
                    <span className="text-sm font-black text-indigo-600">
                      {perHour.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      zł
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {yearlyTotals.length === 0 && (
            <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-[30px] p-8 text-center">
              <p className="text-slate-400 font-bold italic">
                Dodaj dywidendy, aby zobaczyć podsumowanie roczne
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

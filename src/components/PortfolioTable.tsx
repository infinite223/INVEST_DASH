import { useState } from "react";
import { Layers, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { PortfolioSortKeys, SortOrder } from "../types";

interface PortfolioTableProps {
  positions: any[];
  sortConfig: {
    key: PortfolioSortKeys;
    order: SortOrder;
  };
  onRequestSort: (key: PortfolioSortKeys) => void;
}

export const PortfolioTable = ({
  positions,
  sortConfig,
  onRequestSort,
}: PortfolioTableProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

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
    <div className="max-w-7xl mt-8 mx-auto bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden mb-8">
      <div
        className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 cursor-pointer hover:bg-slate-50/60 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 uppercase italic tracking-tighter">
          <Layers className="text-indigo-500" /> Skład Portfela
          <span className="text-xs font-bold text-slate-400 normal-case italic tracking-normal ml-2">
            ({positions.length} pozycji)
          </span>
        </h3>

        <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
          {isExpanded ? "Zwiń" : "Rozwiń"}
          <div className="h-8 w-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* WARUNKOWE RENDEROWANIE TREŚCI TABELI */}
      <div
        className={`transition-all duration-300 ease-in-out ${isExpanded ? "opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
      >
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">
                  Ilość
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">
                  Śr. Cena
                </th>
                <th
                  onClick={() => onRequestSort("purchaseValue")}
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  Zainwestowano{" "}
                  <SortIndicator
                    active={sortConfig.key === "purchaseValue"}
                    order={sortConfig.order}
                  />
                </th>
                <th
                  onClick={() => onRequestSort("currPrice")}
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  Akt. Cena{" "}
                  <SortIndicator
                    active={sortConfig.key === "currPrice"}
                    order={sortConfig.order}
                  />
                </th>
                <th
                  onClick={() => onRequestSort("profit")}
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  Zysk Total{" "}
                  <SortIndicator
                    active={sortConfig.key === "profit"}
                    order={sortConfig.order}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
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
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6 font-black text-slate-800 italic text-lg uppercase">
                      {pos.symbol}
                    </td>
                    <td className="px-8 py-6 text-right font-bold text-slate-600">
                      {pos.volume.toLocaleString()}{" "}
                      <span className="text-[10px] font-normal uppercase">
                        szt
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-bold text-slate-400">
                      {avgPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-8 py-6 text-right font-bold text-slate-800">
                      {pos.purchaseValue.toLocaleString()}{" "}
                      <span className="text-[10px] font-normal">PLN</span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-indigo-600">
                      {currPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className={`px-8 py-6 text-right font-black ${pos.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      <div className="flex flex-col items-end">
                        <span>
                          {pos.profit >= 0 ? "+" : ""}
                          {pos.profit.toLocaleString()}{" "}
                          <ArrowUpRight size={12} className="inline mb-1" />
                        </span>
                        <span className="text-[10px] opacity-60 font-black tracking-tight">
                          {((pos.profit / pos.purchaseValue) * 100).toFixed(2)}%
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
  );
};

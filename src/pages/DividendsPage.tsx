import React, { useState, useMemo } from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import { DividendSection } from "../components/DividendSection";
import { DividendSortKeys, SortOrder } from "../types";
import { formatCurrency } from "../utils/formatters";

export const DividendsPage = () => {
  const { store, addPlannedDividend, removePlannedDividend } = usePortfolio();

  // Stan sortowania dla dywidend
  const [divSort, setDivSort] = useState<{
    key: DividendSortKeys;
    order: SortOrder;
  }>({ key: "payDate", order: "asc" });

  // Formularz nowej dywidendy
  const [divForm, setDivForm] = useState({ symbol: "", yield: "", date: "" });

  // Pobieramy ostatnie pozycje z najnowszego raportu, aby znać aktualne ceny i wolumen
  const latestPositions = useMemo(() => {
    const allReports = Object.values(store.reports).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    return allReports[0]?.positions || [];
  }, [store.reports]);

  const sortedDividends = useMemo(() => {
    const baseDividends = [...(store.plannedDividends || [])].map((div) => {
      if (div.status === "received" && div.totalAmount) return div;

      const pos = latestPositions.find((p) => p.symbol === div.symbol);
      if (pos) {
        const currPrice =
          pos.currentPrice || (pos.purchaseValue + pos.profit) / pos.volume;
        const amountPerShare = currPrice * (div.yieldPercentage / 100);
        return {
          ...div,
          amountPerShare,
          totalAmount: amountPerShare * pos.volume,
        };
      }
      return div;
    });

    return baseDividends.sort((a, b) => {
      let aVal =
        divSort.key === "payDate"
          ? new Date(a.payDate).getTime()
          : (a[divSort.key as keyof typeof a] ?? 0);
      let bVal =
        divSort.key === "payDate"
          ? new Date(b.payDate).getTime()
          : (b[divSort.key as keyof typeof b] ?? 0);

      return divSort.order === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
          ? 1
          : -1;
    });
  }, [store.plannedDividends, latestPositions, divSort]);

  const divStats = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const dividendsThisYear = sortedDividends.filter((d) => {
      const payDate = new Date(d.payDate);
      return payDate.getFullYear() === currentYear;
    });

    const received = dividendsThisYear
      .filter((d) => d.status === "received")
      .reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    const planned = dividendsThisYear
      .filter((d) => d.status === "planned")
      .reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    return {
      received,
      planned,
      total: received + planned,
      currentYear,
    };
  }, [sortedDividends]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="text-amber-500" size={16} />
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">
            Pasywny Dochód
          </p>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
          Kalendarz <span className="text-amber-500">Dywidend</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[30px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Otrzymane w {new Date().getFullYear()}
          </p>
          <p className="text-2xl font-black text-emerald-500">
            {formatCurrency(divStats.received)}{" "}
            <span className="text-xs">PLN</span>
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[30px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Zaplanowane
          </p>
          <p className="text-2xl font-black text-amber-500">
            {formatCurrency(divStats.planned)}{" "}
            <span className="text-xs">PLN</span>
          </p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-[30px] shadow-lg shadow-indigo-200 dark:shadow-none text-white">
          <p className="text-[9px] font-black text-indigo-100 uppercase tracking-widest mb-1">
            Suma Roczna (Prognoza)
          </p>
          <p className="text-2xl font-black">
            {formatCurrency(divStats.total)}{" "}
            <span className="text-xs opacity-70">PLN</span>
          </p>
        </div>
      </div>

      <div className="overflow-hidden">
        <DividendSection
          dividends={sortedDividends}
          form={divForm}
          onFormChange={(field, value) =>
            setDivForm({ ...divForm, [field]: value })
          }
          onSave={() => {
            if (!divForm.symbol || !divForm.yield || !divForm.date) return;
            addPlannedDividend({
              id: crypto.randomUUID(),
              symbol: divForm.symbol,
              yieldPercentage: Number(divForm.yield),
              payDate: divForm.date,
              status: "planned",
            });
            setDivForm({ symbol: "", yield: "", date: "" });
          }}
          onRemove={removePlannedDividend}
          availableSymbols={latestPositions.map((p) => p.symbol)}
          sortConfig={divSort}
          onRequestSort={(key) =>
            setDivSort((prev) => ({
              key,
              order: prev.key === key && prev.order === "desc" ? "asc" : "desc",
            }))
          }
        />
      </div>

      <div className="mt-12 p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[40px] border border-amber-100 dark:border-amber-900/30">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <h4 className="font-black text-slate-800 dark:text-white uppercase italic tracking-tight">
              Jak działają prognozy?
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Dla dywidend o statusie <b>"Zaplanowane"</b>, system automatycznie
              pobiera aktualną cenę rynkową Twoich akcji z ostatniego wgranego
              raportu. Na tej podstawie oblicza kwotę dywidendy w PLN, mnożąc
              Twój wolumen przez (Cena akcji × Stopa dywidendy). Dywidendy{" "}
              <b>"Historyczne"</b> (wczytane z Excela) mają zamrożone wartości
              kwotowe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

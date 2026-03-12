import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { usePortfolio } from '../hooks/usePortfolio';
import { formatCurrency } from '../utils/formatters';
import { DividendSection } from 'components/DividendSection';

export default function DividendsPage() {
  const { store, addPlannedDividend, removePlannedDividend } = usePortfolio();
  const [divForm, setDivForm] = useState({ symbol: '', yield: '', date: '' });

  const latestPositions = useMemo(() => {
    const allReports = Object.values(store.reports).sort(
      (a, b) => b.year - a.year || b.month - a.month
    );
    return allReports[0]?.positions || [];
  }, [store.reports]);

  const sortedDividends = useMemo(() => {
    return [...(store.plannedDividends || [])].map((div) => {
      if (div.status === 'received' && div.totalAmount) return div;
      const pos = latestPositions.find((p) => p.symbol === div.symbol);
      if (pos) {
        const currPrice = pos.currentPrice || (pos.purchaseValue + pos.profit) / pos.volume;
        const amountPerShare = currPrice * (div.yieldPercentage / 100);
        return { ...div, amountPerShare, totalAmount: amountPerShare * pos.volume };
      }
      return div;
    });
  }, [store.plannedDividends, latestPositions]);

  const divStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const filtered = sortedDividends.filter(
      (d) => new Date(d.payDate).getFullYear() === currentYear
    );
    const received = filtered
      .filter((d) => d.status === 'received')
      .reduce((s, d) => s + (d.totalAmount || 0), 0);
    const planned = filtered
      .filter((d) => d.status === 'planned')
      .reduce((s, d) => s + (d.totalAmount || 0), 0);
    return { received, planned, total: received + planned };
  }, [sortedDividends]);

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4" contentContainerStyle={{ paddingBottom: 120 }}>
      <View className="mb-8">
        <Text className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
          Pasywny Dochód
        </Text>
        <Text className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
          Kalendarz <Text className="text-amber-500">Dywidend</Text>
        </Text>
      </View>

      <View className="mb-8 flex-row gap-3">
        <View className="flex-1 rounded-[20px] border border-slate-100 bg-white p-4">
          <Text className="mb-1 text-[9px] font-black uppercase text-slate-400">Otrzymane</Text>
          <Text className="text-lg font-black text-emerald-500">
            {formatCurrency(divStats.received)}
          </Text>
        </View>
        <View className="flex-1 rounded-[20px] border border-slate-100 bg-white p-4">
          <Text className="mb-1 text-[9px] font-black uppercase text-slate-400">Zaplanowane</Text>
          <Text className="text-lg font-black text-amber-500">
            {formatCurrency(divStats.planned)}
          </Text>
        </View>
      </View>

      <DividendSection
        dividends={sortedDividends}
        form={divForm}
        onFormChange={(field: keyof typeof divForm, value: string) =>
          setDivForm((prev) => ({ ...prev, [field]: value }))
        }
        onSave={() => {
          if (!divForm.symbol || !divForm.yield || !divForm.date) return;
          addPlannedDividend({
            id: Date.now().toString(),
            symbol: divForm.symbol,
            yieldPercentage: Number(divForm.yield),
            payDate: divForm.date,
            status: 'planned',
          });
          setDivForm({ symbol: '', yield: '', date: '' });
        }}
        onRemove={removePlannedDividend}
        availableSymbols={latestPositions.map((p) => p.symbol)}
      />

      {/* Info Card */}
      <View className="mt-8 rounded-[30px] border border-amber-100 bg-amber-50 p-6">
        <Text className="mb-2 font-black italic text-slate-800">Jak działają prognozy?</Text>
        <Text className="text-xs leading-5 text-slate-600">
          Dla dywidend "Zaplanowane" system automatycznie pobiera cenę z ostatniego raportu i mnoży
          przez Twój wolumen.
        </Text>
      </View>
    </ScrollView>
  );
}

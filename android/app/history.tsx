import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { History, CalendarDays } from 'lucide-react-native';
import { usePortfolio } from '../hooks/usePortfolio';
import { YearCard } from 'components/YearCard';

export default function HistoryPage() {
  const router = useRouter();
  const { store } = usePortfolio();

  const getPreviousMonthReport = (year: number, month: number) => {
    const allReports = Object.values(store.reports);
    return allReports.find((r) => {
      if (month === 1) return r.year === year - 1 && r.month === 12;
      return r.year === year && r.month === month - 1;
    });
  };

  const calculateYearlyStats = (year: number) => {
    const yearReports = Object.values(store.reports).filter((r) => r.year === year);
    const yearlyDelta = yearReports.reduce((sum, r) => {
      const prev = getPreviousMonthReport(r.year, r.month);
      return sum + (prev ? r.totalProfit - prev.totalProfit : r.totalProfit);
    }, 0);

    const latestInYear = [...yearReports].sort((a, b) => b.month - a.month)[0];
    return {
      deltaProfit: yearlyDelta,
      roi: latestInYear?.totalInvested ? (yearlyDelta / latestInYear.totalInvested) * 100 : 0,
    };
  };

  const years = useMemo(
    () =>
      Array.from(new Set(Object.values(store.reports).map((r) => r.year))).sort((a, b) => b - a),
    [store.reports]
  );

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4" contentContainerStyle={{ paddingBottom: 120 }}>
      <View className="mb-8">
        <View className="mb-2 flex-row items-center gap-2">
          <History color="#6366f1" size={16} />
          <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
            Archiwum
          </Text>
        </View>
        <Text className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
          Historia Inwestycji
        </Text>
      </View>

      {years.length > 0 ? (
        <View className="gap-4">
          {years.map((year) => (
            <YearCard
              key={year}
              year={year}
              stats={calculateYearlyStats(year)}
              count={Object.values(store.reports).filter((r) => r.year === year).length}
              onClick={() =>
                router.push({ pathname: '/months', params: { year: year.toString() } })
              }
            />
          ))}
        </View>
      ) : (
        <View className="items-center rounded-[40px] border border-dashed border-slate-200 bg-white p-12">
          <CalendarDays color="#cbd5e1" size={48} />
          <Text className="mt-4 text-center font-bold italic text-slate-500">
            Nie dodano jeszcze żadnych raportów. Twoja historia pojawi się tutaj po wgraniu Excela.
          </Text>
        </View>
      )}

      <View className="mt-8 rounded-[30px] bg-slate-200 p-6">
        <Text className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Jak czytać historię?
        </Text>
        <Text className="text-xs font-medium leading-relaxed text-slate-600">
          Każdy kafelek reprezentuje rok Twojej aktywności. ROI pokazuje zwrot wypracowany w danym
          roku kalendarzowym.
        </Text>
      </View>
    </ScrollView>
  );
}

import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Briefcase, TrendingUp, DollarSign } from 'lucide-react-native';
import { usePortfolio } from '../hooks/usePortfolio';
import { PortfolioSortKeys, SortOrder } from '../types';
import { PortfolioTable } from 'components/PortfolioTable';
import { WelcomeModal } from 'components/WelcomeModal';

export default function HomePage() {
  const { store, completeFirstVisit, isLoaded } = usePortfolio();
  const [portfolioSort, setPortfolioSort] = useState<{
    key: PortfolioSortKeys;
    order: SortOrder;
  }>({ key: 'purchaseValue', order: 'desc' });

  const getPreviousMonthReport = (year: number, month: number) => {
    const allReports = Object.values(store.reports);
    return allReports.find((r) => {
      if (month === 1) return r.year === year - 1 && r.month === 12;
      return r.year === year && r.month === month - 1;
    });
  };

  const calculateMonthlyDelta = (currentReport: any) => {
    const prevReport = getPreviousMonthReport(currentReport.year, currentReport.month);
    if (!prevReport) return currentReport.totalProfit;
    return currentReport.totalProfit - prevReport.totalProfit;
  };

  const globalStats = useMemo(() => {
    const allReports = Object.values(store.reports).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    if (allReports.length === 0) return null;

    const latestReport = allReports[allReports.length - 1];
    const stockProfit = allReports.reduce((sum, r) => sum + calculateMonthlyDelta(r), 0);
    const dividendProfit = (store.plannedDividends || [])
      .filter((d) => d.status === 'received')
      .reduce((sum, d) => sum + (d.totalAmount || 0), 0);

    const totalAbsoluteProfit = stockProfit + dividendProfit;

    const sortedPositions = [...latestReport.positions].sort((a, b) => {
      let aVal: any, bVal: any;
      if (portfolioSort.key === 'currPrice') {
        aVal = a.currentPrice || (a.purchaseValue + a.profit) / a.volume;
        bVal = b.currentPrice || (b.purchaseValue + b.profit) / b.volume;
      } else {
        aVal = a[portfolioSort.key as keyof typeof a] ?? 0;
        bVal = b[portfolioSort.key as keyof typeof b] ?? 0;
      }
      return portfolioSort.order === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });

    const realizedProfit = allReports.reduce((sum, r) => sum + (r.closedProfit || 0), 0);

    return {
      totalInvested: latestReport.totalInvested,
      stockProfit,
      dividendProfit,
      totalAbsoluteProfit,
      realizedProfit,
      roi:
        latestReport.totalInvested !== 0
          ? (totalAbsoluteProfit / latestReport.totalInvested) * 100
          : 0,
      latestPositions: sortedPositions,
    };
  }, [store.reports, store.plannedDividends, portfolioSort]);

  if (!isLoaded) {
    return;
  }

  if (!globalStats) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <WelcomeModal visible={store.isFirstVisit} onClose={completeFirstVisit} />

        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <Briefcase size={32} />
        </View>
        <Text className="mb-2 text-[30px] font-black uppercase italic text-slate-800">
          Brak danych
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4" contentContainerStyle={{ paddingBottom: 120 }}>
      <View className="mb-8">
        <View className="mb-1 flex-row items-center gap-2">
          <Image
            source={require('../assets/icon.png')}
            style={{ width: 35, height: 35 }}
            className="rounded-md"
          />
          <Text className="text-xs font-black uppercase tracking-widest text-slate-500">
            Assets TRACK
          </Text>
        </View>

        <Text className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">
          Podsumowanie Portfela
        </Text>
      </View>

      <View className="mb-6 rounded-[40px] bg-indigo-700 p-8">
        <View className="mb-4 flex-row items-center gap-4">
          <TrendingUp size={20} color={'white'} />
          <Text className="text-[11px] font-black uppercase tracking-widest text-indigo-200">
            Łączny zwrot
          </Text>
        </View>
        <Text className="text-4xl font-black italic tracking-tighter text-white">
          {globalStats.roi.toFixed(2)}
          <Text className="text-3xl text-indigo-400">%</Text>
        </Text>
        <Text className="mt-2 text-xl font-bold italic text-indigo-200">
          {globalStats.totalAbsoluteProfit >= 0 ? '+' : ''}
          {globalStats.totalAbsoluteProfit.toLocaleString()} PLN
        </Text>
      </View>

      <View className="mb-6 gap-4">
        <View className="rounded-[32px] bg-slate-100 p-6">
          <Text className="text-[10px] font-black uppercase text-slate-400">Wkład własny</Text>
          <Text className="text-3xl font-black">
            {globalStats.totalInvested.toLocaleString()} PLN
          </Text>
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1 rounded-[32px] bg-emerald-50 p-6">
            <Text className="text-[10px] font-black uppercase text-emerald-600">Zrealizowany</Text>
            <Text className="text-xl font-black text-emerald-600">
              +{globalStats.realizedProfit.toLocaleString()}
            </Text>
          </View>
          <View className="flex-1 rounded-[32px] bg-amber-50 p-6">
            <Text className="text-[10px] font-black uppercase text-amber-600">Dywidendy</Text>
            <Text className="text-xl font-black text-amber-600">
              +{globalStats.dividendProfit.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <PortfolioTable
        positions={globalStats.latestPositions}
        sortConfig={portfolioSort}
        onRequestSort={(key) =>
          setPortfolioSort((prev) => ({
            key,
            order: prev.key === key && prev.order === 'desc' ? 'asc' : 'desc',
          }))
        }
      />
    </ScrollView>
  );
}

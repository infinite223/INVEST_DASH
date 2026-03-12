import { useState } from 'react';
import { Slot, useRouter } from 'expo-router';
import { usePortfolio } from '../hooks/usePortfolio';
import * as FileSystem from 'expo-file-system/legacy';
import {
  processOpenPositions,
  processClosedPositions,
  processDividendsFromExcel,
} from '../utils/excelParser';
import { UploadModal } from 'components/UploadModal';
import { BottomNav } from 'components/BottomNav';
import '../global.css';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const { addReport, addPlannedDividend } = usePortfolio();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingFileUri, setPendingFileUri] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const handleFileSelect = (fileUri: string) => {
    setPendingFileUri(fileUri);
    setIsModalOpen(true);
  };

  const handleUpload = async () => {
    if (!pendingFileUri) return;

    try {
      const base64Data = await FileSystem.readAsStringAsync(pendingFileUri, {
        encoding: 'base64',
      });

      const positionsData = await processOpenPositions(base64Data);
      const closedProfit = await processClosedPositions(base64Data);

      addReport(selectedYear, selectedMonth, positionsData, closedProfit);

      try {
        const historicalDividends = await processDividendsFromExcel(base64Data);
        historicalDividends.forEach((div) => addPlannedDividend({ ...div, status: 'received' }));
      } catch (err) {
        console.warn('Brak arkusza dywidend w pliku.');
      }

      router.replace('/settings');

      setTimeout(() => {
        router.replace('/');
      }, 100);

      setIsModalOpen(false);
      setPendingFileUri(null);
    } catch (error) {
      console.error('Błąd przetwarzania:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        <BottomNav onFileSelect={handleFileSelect} />
        <UploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpload={handleUpload}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />
        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

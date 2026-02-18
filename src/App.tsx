import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { HistoryPage } from "./pages/HistoryPage";
import { DividendsPage } from "./pages/DividendsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { MonthsPage } from "./pages/MonthsPage";
import { DetailsPage } from "./pages/DetailsPage";

import { BottomNav } from "./components/BottomNav";
import { UploadModal } from "./components/UploadModal";
import { usePortfolio } from "./hooks/usePortfolio";
import {
  processDividendsFromExcel,
  processOpenPositions,
} from "./utils/excelParser";
import { ScrollToTop } from "./components/ScrollToTop";

export default function App() {
  const { addReport, addPlannedDividend } = usePortfolio();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setPendingFile(file);
    setIsModalOpen(true);
  };

  const handleUpload = async () => {
    if (pendingFile) {
      try {
        const positionsData = await processOpenPositions(pendingFile);
        addReport(selectedYear, selectedMonth, positionsData);

        try {
          const historicalDividends =
            await processDividendsFromExcel(pendingFile);
          historicalDividends.forEach((div) =>
            addPlannedDividend({ ...div, status: "received" }),
          );
        } catch (err) {
          console.log("W tym pliku nie znaleziono arkusza dywidend.");
        }

        setIsModalOpen(false);
        setPendingFile(null);
      } catch (error) {
        console.error("Błąd podczas przetwarzania pliku:", error);
        alert(
          "Wystąpił błąd podczas odczytu pliku Excel. Upewnij się, że to poprawny eksport z XTB.",
        );
      }
    }
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 transition-colors duration-300">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/dividends" element={<DividendsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/:year" element={<MonthsPage />} />
          <Route path="/:year/:month" element={<DetailsPage />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <BottomNav onFileSelect={handleFileSelect} />

        <UploadModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setPendingFile(null);
          }}
          onUpload={handleUpload}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />
      </div>
    </BrowserRouter>
  );
}

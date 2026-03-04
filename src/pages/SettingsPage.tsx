import React from "react";
import {
  Settings,
  Download,
  Upload,
  Info,
  ShieldCheck,
  Database,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";

export const SettingsPage = () => {
  const { exportData, importData, resetAllData } = usePortfolio();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await importData(file);
      if (success) {
        alert("Dane zostały pomyślnie zaimportowane!");
        window.location.reload();
      } else {
        alert("Wystąpił błąd podczas importu pliku.");
      }
    }
  };

  const appVersion = "0.1.1";

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="text-slate-400" size={16} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Konfiguracja Systemu
          </p>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">
          Ustawienia <span className="text-indigo-600">&</span> Dane
        </h1>
      </header>

      <div className="space-y-6">
        <section className="bg-white dark:bg-slate-900 rounded-[35px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 dark:bg-slate-800 rounded-[30px] flex items-center justify-center p-4 border dark:border-slate-700">
              <img
                src="/icon.png"
                alt="App Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic">
                ASSETS TRACK
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                Zaawansowany manager portfela inwestycyjnego dedykowany dla
                użytkowników XTB. Pozwala na wizualizację wzrostu kapitału,
                śledzenie dywidend oraz analizę składu portfela.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase">
                  <Info size={12} /> Wersja {appVersion}
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-600 uppercase">
                  <ShieldCheck size={12} /> Local Data Only
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-[35px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <Database size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase italic mb-2">
              Kopia Zapasowa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 flex-1">
              Wyeksportuj wszystkie swoje dane do pliku .json. Możesz go
              przechowywać jako backup.
            </p>
            <button
              onClick={exportData}
              className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              <Download size={16} /> Eksportuj Dane
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[35px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
              <RefreshCw size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase italic mb-2">
              Przywracanie
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 flex-1">
              Wgraj plik .json, aby przywrócić swój portfel na innym urządzeniu.
            </p>
            <label className="flex items-center justify-center gap-3 w-full py-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest cursor-pointer transition-all">
              <Upload size={16} /> Importuj Dane
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </section>

        <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[35px] border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-start gap-4">
            <ShieldCheck className="text-indigo-600 shrink-0" size={24} />
            <div>
              <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight">
                Twoja Prywatność
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Assets TRACK działa w 100% lokalnie. Wszystkie obliczenia i dane
                są przechowywane w pamięci Twojej przeglądarki.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[35px] border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
                <RefreshCw size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-700 dark:text-slate-200 uppercase text-sm tracking-tight">
                  Zarządzanie Pamięcią
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  Przywracanie ustawień fabrycznych
                </p>
              </div>
            </div>
            <button
              onClick={resetAllData}
              className="w-full md:w-auto px-8 py-4 bg-transparent text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-rose-500 hover:text-rose-500 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
            >
              Usuń dane lokalne
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

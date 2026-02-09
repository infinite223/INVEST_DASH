import { useEffect } from "react";
import { X, FileText, Upload, PieChart, Info } from "lucide-react";

export const WelcomeModal = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-[32px] md:rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>

        <div className="p-6 md:p-10">
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-1.5 md:p-2">
              <img
                src="/icon.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black italic tracking-tighter text-slate-800 uppercase leading-none">
                Witaj w assets xtb
              </h2>
              <p className="text-indigo-500 font-bold text-[9px] md:text-xs uppercase tracking-widest mt-1">
                Twój osobisty analityk portfela
              </p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 text-slate-600">
            <p className="font-medium text-sm md:text-lg italic leading-relaxed text-slate-500">
              Aplikacja została stworzona, abyś mógł błyskawicznie analizować
              swoje inwestycje bez ręcznego wpisywania danych.
            </p>

            <div className="grid gap-3 md:gap-4 mt-6 md:mt-8">
              <div className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText size={16} className="md:w-5 md:h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-[12px] md:text-sm italic">
                    1. Pobierz raport z XTB
                  </h4>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-0.5">
                    Zaloguj się do XTB i wyeksportuj Historię (XLSX).
                  </p>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Upload size={16} className="md:w-5 md:h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-[12px] md:text-sm italic">
                    2. Wgraj plik
                  </h4>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-0.5">
                    Wybierz plik XLSX. System automatycznie wyciągnie pozycje i
                    dywidendy.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <PieChart size={16} className="md:w-5 md:h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-[12px] md:text-sm italic">
                    3. Analizuj i planuj
                  </h4>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-0.5">
                    Sprawdź zysk totalny, średnie ceny i przyszłe wypłaty.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-8 flex items-start md:items-center gap-2 bg-indigo-50 p-3 md:p-4 rounded-xl md:rounded-2xl text-indigo-700">
              <Info size={16} className="shrink-0 mt-0.5 md:mt-0" />
              <p className="text-[10px] md:text-[11px] font-black uppercase italic leading-tight">
                Twoje dane nie opuszczają Twojej przeglądarki. Wszystko jest
                przetwarzane lokalnie.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-slate-800 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-slate-900 transition-all shadow-xl mt-2 md:mt-4 uppercase text-xs md:text-sm tracking-widest italic"
            >
              Zaczynamy!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
}

export const UploadModal = ({
  isOpen,
  onClose,
  onUpload,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
}: UploadModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-all"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md p-10 rounded-[40px] shadow-2xl animate-in zoom-in duration-300 border dark:border-slate-800 transition-colors">
        <h3 className="text-2xl font-black mb-6 text-slate-800 dark:text-white transition-colors">
          Dane raportu
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                Rok
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-4 font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all border border-transparent dark:border-slate-700"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2">
                Miesiąc
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-4 font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all border border-transparent dark:border-slate-700"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("pl", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onUpload}
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none active:scale-[0.98] uppercase tracking-widest"
          >
            Zapisz raport
          </button>

          <button
            onClick={onClose}
            className="w-full text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
};

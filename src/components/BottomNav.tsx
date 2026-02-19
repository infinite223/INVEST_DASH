import React, { useRef } from "react";
import { Home, Calendar, Plus, DollarSign, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = ({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void;
}) => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const navItem = (path: string, Icon: any, label: string) => (
    <Link
      to={path}
      className={`flex flex-col items-center justify-center w-16 gap-1 transition-all ${
        isActive(path)
          ? "text-indigo-600 dark:text-indigo-400 scale-105"
          : "text-slate-400"
      }`}
    >
      <Icon size={24} strokeWidth={isActive(path) ? 3 : 2} />
      {/* <span className="text-[10px] font-black uppercase tracking-tighter">
        {label}
      </span> */}
    </Link>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-2 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-lg mx-auto flex justify-between items-center">
        {navItem("/", Home, "Home")}
        {navItem("/history", Calendar, "Lata")}

        <div className="flex items-center justify-center w-16 h-12">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileSelect(f);
              e.target.value = "";
            }}
            className="hidden"
            accept=".xlsx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none active:scale-90 transition-transform flex items-center justify-center"
          >
            <Plus size={25} strokeWidth={2} />
          </button>
        </div>

        {navItem("/dividends", DollarSign, "Dywidendy")}
        {navItem("/settings", Settings, "Opcje")}
      </div>
    </div>
  );
};

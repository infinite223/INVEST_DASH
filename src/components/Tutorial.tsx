import React, { useState, useEffect, useLayoutEffect } from "react";
import { ONBOARDING_STEPS } from "../utils/const";

export const Tutorial = () => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // localStorage.removeItem("hasSeenTutorial");

    const hasSeen = localStorage.getItem("hasSeenTutorial");
    if (!hasSeen) setIsVisible(true);
  }, []);

  useLayoutEffect(() => {
    if (currentStep >= 0 && currentStep < ONBOARDING_STEPS.length) {
      const element = document.getElementById(
        ONBOARDING_STEPS[currentStep].target,
      );
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishTutorial();
    }
  };

  const finishTutorial = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenTutorial", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Overlay z "dziurą" (SVG Mask) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="tutorial-mask">
            <rect width="100%" height="100%" fill="white" />
            {currentStep >= 0 && (
              <rect
                x={coords.left - 8}
                y={coords.top - 8}
                width={coords.width + 16}
                height={coords.height + 16}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.7)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* Okno komunikatu */}
      <div
        className={`relative z-[101] bg-white dark:bg-slate-900 p-8 rounded-[30px] shadow-2xl max-w-xs w-full border border-slate-100 dark:border-slate-800 transition-all duration-500 ${currentStep >= 0 ? "absolute" : ""}`}
        style={currentStep >= 0 ? { bottom: "120px" } : {}}
      >
        {currentStep === -1 ? (
          <div className="text-center">
            <h3 className="text-xl font-black uppercase italic mb-2 dark:text-white">
              Witaj w Portfolio!
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Chcesz krótkiego wprowadzenia po funkcjach aplikacji?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setCurrentStep(0)}
                className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest"
              >
                Zaczynajmy!
              </button>
              <button
                onClick={finishTutorial}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2"
              >
                Pomiń samouczek
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                Krok {currentStep + 1} / {ONBOARDING_STEPS.length}
              </span>
              <button
                onClick={finishTutorial}
                className="text-slate-400 hover:text-slate-600 text-[10px] uppercase font-bold"
              >
                Pomiń
              </button>
            </div>
            <p className="text-slate-700 dark:text-slate-200 font-bold leading-relaxed mb-6">
              {ONBOARDING_STEPS[currentStep].content}
            </p>
            <button
              onClick={handleNext}
              className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest"
            >
              {currentStep === ONBOARDING_STEPS.length - 1
                ? "Rozumiem, zaczynamy!"
                : "Dalej"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

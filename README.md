# 🚀 ASSETS-XTB

**ASSETS-XTB** to nowoczesny, wysokowydajny tracker portfela inwestycyjnego zbudowany w React. Aplikacja oferuje głęboką analitykę wyników miesięcznych, alokacji aktywów oraz prognozowania dywidend poprzez błyskawiczne przetwarzanie raportów giełdowych z XTB.

## ✨ Kluczowe funkcje

- **📊 Dynamic Portfolio Analytics:** Automatyczne obliczanie zainwestowanego kapitału, całkowitego zysku oraz globalnego ROI.
- **📈 Advanced Visualization:** Interaktywne wykresy alokacji oraz wydajności miesiąc-do-miesiąca (MoM) przy użyciu Recharts.
- **💰 Dividend Ecosystem:**
  - **History:** Automatyczny import wypłaconych dywidend bezpośrednio z plików Excel.
  - **Planner:** Możliwość ręcznego planowania przyszłych dywidend z estymacją stopy zwrotu.
  - **Yearly Totals:** Podsumowania roczne, miesięczne oraz przeliczenie pasywnego dochodu na godzinę.
- **📂 Smart Excel Import (Drag & Drop):** Wygodny obszar wrzucania plików `.xlsx` z automatycznym parsowaniem pozycji i historii finansowej.
- **📅 Collapsible UI:** Inteligentne, zwijane sekcje tabel (np. harmonogram dywidend), pozwalające zachować przejrzystość dashboardu.
- **👋 Interactive Onboarding:** System "Pierwszej wizyty" z dedykowanym modalem instruktażowym ułatwiającym start.
- **📱 Modern UI/UX:** Interfejs w stylu "Indigo & Emerald" z pełną responsywnością (mobile-friendly) i nowoczesnymi animacjami.

## 🛠️ Tech Stack

- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Data Parsing:** XLSX (SheetJS)
- **Persistence:** LocalStorage (pełna prywatność – dane nie opuszczają Twojej przeglądarki)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 lub nowszy)
- npm lub yarn

### Installation

1.  **Clone the repository:**
2.  **Install dependencies:**

    ```bash
    cd invest-dash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```text
src/
├── assets/         # Statyczne pliki (obrazy, logo aplikacji)
├── components/     # UI Components (Dashboard, Tables, WelcomeModal)
├── hooks/          # Niestandardowe hooki (np. usePortfolio do obsługi stanu)
├── pages/          # Główne widoki/strony aplikacji
├── utils/          # Parsery Excel i pomocnicza logika matematyczna
├── App.tsx         # Główny kontener aplikacji i routing
├── index.css       # Style globalne Tailwind CSS
├── main.tsx        # Punkt wejścia aplikacji React
└── types.ts        # Współdzielone interfejsy i typy TypeScript
```

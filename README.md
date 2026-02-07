# 🚀 INVEST_DASH

**INVEST_DASH** is a modern, high-performance investment portfolio tracker built with React. It provides deep insights into monthly performance, asset allocation, and dividend forecasting by processing Excel-based brokerage reports.



## ✨ Key Features

* **📊 Dynamic Portfolio Analytics:** Real-time calculation of total invested capital, total profit, and Global ROI.
* **📈 Advanced Visualization:** Interactive bar charts for asset allocation and month-over-month (MoM) net gain performance using Recharts.
* **📂 Smart Excel Import:** Seamlessly parse `.xlsx` files to update open positions and historical dividend data.
* **📅 Dividend Scheduler:** Plan future dividends with automated projections based on current share prices and yields.
* **⚡ Smart Sorting:** Fully interactive tables allowing you to sort by Symbol, Purchase Value, Monthly Delta, or Dividend Date.
* **📱 Modern UI/UX:** A sleek, "Indigo & Emerald" themed interface that is fully responsive and mobile-friendly.

## 🛠️ Tech Stack

* **Framework:** React 18 (Hooks, useMemo, Context API)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (with Lucide React icons)
* **Charts:** Recharts
* **Data Parsing:** XLSX (SheetJS)
* **Persistence:** LocalStorage via custom hooks

## 🚀 Getting Started

### Prerequisites

* Node.js (v16 or higher)
* npm or yarn

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
├── components/     # UI Components (Dashboard, Table, Modals)
├── hooks/          # Custom React hooks (usePortfolio)
├── utils/          # Excel parsers and math logic
├── types/          # TypeScript interfaces
└── App.tsx         # Main application logic & routing

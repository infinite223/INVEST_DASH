# 🚀 ASSETS-XTB

**ASSETS-XTB** is a modern, high-performance investment portfolio tracker built with React. The application offers deep analytics of monthly performance, asset allocation, and dividend forecasting by instantly processing XTB stock reports.

> **🌐 Live Web Version:** [https://assets-xtb.vercel.app/](https://assets-xtb.vercel.app/)

## ✨ Key Features

- **📊 Dynamic Portfolio Analytics:** Automatic calculation of invested capital, total profit, and global ROI.
- **📈 Advanced Visualization:** Interactive allocation charts and Month-over-Month (MoM) performance tracking using Recharts.
- **🖥️ Native Desktop Experience:** Dedicated Windows application built with the **Tauri** framework – ultra-lightweight and efficient (installer size is only ~5MB!).
- **💰 Dividend Ecosystem:**
  - **History:** Automatic import of paid dividends directly from Excel (.xlsx) files.
  - **Planner:** Manual planning for future dividends with yield estimates.
  - **Yearly Totals:** Annual and monthly summaries, including passive income per hour calculations.
- **📂 Smart Excel Import (Drag & Drop):** Intuitive upload area for `.xlsx` files with automatic parsing of positions and financial history.
- **👋 Interactive Onboarding:** "First-visit" system with a dedicated instructional modal to help users get started instantly.
- **📱 Modern UI/UX:** "Indigo & Emerald" styled interface with full responsiveness and smooth animations.

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Desktop Wrapper:** [Tauri](https://tauri.app/) (Rust-based)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Data Parsing:** XLSX (SheetJS)
- **Persistence:** LocalStorage (Full privacy – data never leaves your browser or local machine)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer)
- Rust (Required only for building the Windows Desktop version)

### Installation & Web Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

````

2. **Run the development server:**
```bash
npm run dev

````

### 🖥️ Desktop Version (Windows)

The application uses Tauri to provide a native experience with minimal resource consumption.

1. **Run in dev mode:**

```bash
npx tauri dev

```

2. **Build production installer (.exe / .msi):**

```bash
npx tauri build

```

_The generated installer will be located in: `src-tauri/target/release/bundle/msi/_`

## 📂 Project Structure

```text
├── src-tauri/      # Native Tauri files (Rust config, icons, build artifacts)
├── src/
│   ├── components/ # UI Components (Dashboard, Tables, WelcomeModal)
│   ├── hooks/      # Custom hooks (Portfolio state & logic)
│   ├── utils/      # Excel parsers and financial math helpers
│   ├── App.tsx     # Main container and routing logic
│   └── types.ts    # Shared TypeScript interfaces
├── vercel.json     # Vercel hosting configuration
└── package.json

```

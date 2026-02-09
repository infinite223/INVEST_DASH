import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { YearsPage } from "./pages/YearsPage";
import { MonthsPage } from "./pages/MonthsPage";
import { DetailsPage } from "./pages/DetailsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<YearsPage />} />
        <Route path="/:year" element={<MonthsPage />} />
        <Route path="/:year/:month" element={<DetailsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

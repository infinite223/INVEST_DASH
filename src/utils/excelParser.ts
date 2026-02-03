import * as XLSX from "xlsx";
import { OpenPosition } from "../types";

const excelDateToJS = (excelDate: any): Date => {
  if (excelDate instanceof Date) return excelDate;

  const dateNum = parseFloat(excelDate);
  if (isNaN(dateNum)) return new Date();

  const date = new Date((dateNum - 25569) * 86400 * 1000);
  return date;
};

export const processOpenPositions = async (
  file: File,
): Promise<OpenPosition[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { cellDates: true });

  const sheetName =
    workbook.SheetNames.find((n) => n.includes("OPEN POSITION")) ||
    workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { range: 10 });

  const grouped = rawData.reduce(
    (acc, row) => {
      const symbol = row["Symbol"];
      if (!symbol || row["Position"] === "Total") return acc;

      const rowDate = excelDateToJS(row["Open time"]);

      if (!acc[symbol]) {
        acc[symbol] = {
          symbol: symbol,
          volume: 0,
          purchaseValue: 0,
          currentValue: 0,
          profit: 0,
          openTime: rowDate,
        };
      } else if (rowDate < acc[symbol].openTime) {
        acc[symbol].openTime = rowDate;
      }

      acc[symbol].volume += parseFloat(row["Volume"] || 0);
      acc[symbol].purchaseValue += parseFloat(row["Purchase value"] || 0);
      acc[symbol].profit += parseFloat(row["Gross P/L"] || 0);

      return acc;
    },
    {} as Record<string, OpenPosition>,
  );

  return (Object.values(grouped) as OpenPosition[]).sort(
    (a, b) => b.purchaseValue - a.purchaseValue,
  );
};

import * as XLSX from "xlsx";
import { Dividend, OpenPosition } from "../types";

const excelDateToJS = (excelDate: any): Date => {
  if (excelDate instanceof Date) return excelDate;
  const dateNum = parseFloat(excelDate);
  if (isNaN(dateNum)) return new Date();
  return new Date((dateNum - 25569) * 86400 * 1000);
};

export const processDividendsFromExcel = async (
  file: File,
): Promise<Dividend[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);

  const sheetName = workbook.SheetNames.find((n) =>
    n.toUpperCase().includes("CASH OPERATION HISTORY"),
  );

  if (!sheetName) return [];

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
  const headerRowIndex = rows.findIndex(
    (row) =>
      row.includes("Symbol") && row.includes("Amount") && row.includes("Type"),
  );

  if (headerRowIndex === -1) return [];

  const header = rows[headerRowIndex];
  const dataRows = rows.slice(headerRowIndex + 1);

  const jsonData = dataRows.map((row) => {
    const obj: any = {};
    header.forEach((key: string, i: number) => {
      obj[key] = row[i];
    });
    return obj;
  });

  return jsonData
    .filter((row) => {
      const type = String(row["Type"] || "").toUpperCase();
      return type.includes("DIVIDENT") || type.includes("DIVIDEND");
    })
    .map((row) => ({
      id: Math.random().toString(36).substr(2, 9),
      symbol: row["Symbol"]
        ? row["Symbol"].replace(".PL", "").replace(".UK", "").replace(".US", "")
        : "Cash",
      amountPerShare: 0,
      totalAmount: Math.abs(parseFloat(row["Amount"] || 0)),
      yieldPercentage: 0,
      payDate: formatExcelDate(row["Time"]),
      status: "received" as const,
    }));
};

const formatExcelDate = (rawDate: any): string => {
  if (!rawDate) return new Date().toISOString().split("T")[0];

  if (typeof rawDate === "number") {
    const date = new Date((rawDate - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }

  if (typeof rawDate === "string" && rawDate.includes("/")) {
    const [datePart] = rawDate.split(" ");
    const [day, month, year] = datePart.split("/");
    return `${year}-${month}-${day}`;
  }

  return String(rawDate).split("T")[0];
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
      const volume = parseFloat(row["Volume"] || 0);
      const purchaseValue = parseFloat(row["Purchase value"] || 0);
      const profit = parseFloat(row["Gross P/L"] || 0);
      const currentValue = purchaseValue + profit;

      if (!acc[symbol]) {
        acc[symbol] = {
          symbol,
          volume: 0,
          purchaseValue: 0,
          currentValue: 0,
          profit: 0,
          avgPurchasePrice: 0,
          currentPrice: 0,
          openTime: rowDate,
        };
      } else if (rowDate < acc[symbol].openTime) {
        acc[symbol].openTime = rowDate;
      }

      acc[symbol].volume += volume;
      acc[symbol].purchaseValue += purchaseValue;
      acc[symbol].profit += profit;
      acc[symbol].currentValue += currentValue;

      if (acc[symbol].volume > 0) {
        acc[symbol].avgPurchasePrice =
          acc[symbol].purchaseValue / acc[symbol].volume;
        acc[symbol].currentPrice =
          acc[symbol].currentValue / acc[symbol].volume;
      }

      return acc;
    },
    {} as Record<string, OpenPosition>,
  );
  return (Object.values(grouped) as OpenPosition[]).sort(
    (a, b) => b.purchaseValue - a.purchaseValue,
  );
};

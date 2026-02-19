const currencyFormatter = new Intl.NumberFormat("pl-PL", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (
  value: number | string | undefined | null,
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num === null || num === undefined || isNaN(num)) return "0,00";
  return currencyFormatter.format(num);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

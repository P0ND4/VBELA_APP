export const thousandsSystem = (number: number | string): string => {
  const num = String(number);
  const parts = num.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (parts[1]) parts[1] = parts[1].slice(0, 2);
  return parts.join(",");
};

export const convertThousandsSystem = (number: number | string): string => {
  const num = String(number);
  const numberWithoutSeparators = num.replace(/\./g, "");
  const normalizedNumber = numberWithoutSeparators.replace(",", ".");
  return normalizedNumber;
};

export const reduce = (value: number) => {
  const sizes = ["", "K", "M", "B", "T", "C", "Q", "S"];
  const i = Math.floor(Math.log(value) / Math.log(1000));

  return Math.round(value / Math.pow(1000, i)) + " " + sizes[i];
};

export const formatDecimals = (value: number, decimal: number) =>
  parseFloat(value.toFixed(decimal));

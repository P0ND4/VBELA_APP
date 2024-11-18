export const addDays = (date: Date, days: number): Date => {
  date.setDate(date.getDate() + days);
  return date;
};

export const changeDate = (date: Readonly<Date>, time?: boolean): string => {
  const format = (n: number) => String(n).padStart(2, "0");
  const formattedDate = `${format(date.getDate())}/${format(date.getMonth() + 1)}/${String(date.getFullYear()).slice(-2)}`;
  const formattedTime = time ? ` ${format(date.getHours())}:${format(date.getMinutes())}` : "";
  return formattedDate + formattedTime;
};

export const formatTimeDHM = (start: number, end: number): string => {
  const milliseconds = end - start;
  const seconds = Math.floor(milliseconds / 1000);

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let formatted = "";
  if (days > 0) formatted += `${days}d `;
  if (hours > 0) formatted += `${hours}h `;
  formatted += `${minutes}m`;

  return formatted;
};

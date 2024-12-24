import moment from "moment";
import "moment/locale/es";

moment.locale("es");

export const addDays = (date: Date, days: number): Date => moment(date).add(days, "days").toDate();

export const beautifulChangeDate = (date: Readonly<Date>): string =>
  moment(date).format("dddd, DD [de] MMM [de] YYYY");

export const changeDate = (date: Readonly<Date>, time?: boolean): string =>
  moment(date).format(`DD/MM/YYYY ${time ? "HH:mm" : ""}`);

export const formatTimeDHM = (start: number, end: number): string => {
  const duration = moment.duration(moment(end).diff(moment(start)));

  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();

  let formatted = "";
  if (days > 0) formatted += `${days}d `;
  if (hours > 0) formatted += `${hours}h `;
  formatted += `${minutes}m`;

  return formatted;
};

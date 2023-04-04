export const random = (repeat = 10, options = {}) => {
  let possible = "";
  if (Object.keys(options).length === 0) {
    possible = "ABCDEFGHIJKMNLOPQRSTUVWXYZabcdefghijkmnlopqrstuvwxyz";
  } else {
    const { upperCase, lowerCase, number, symbols } = options;
    if (upperCase) possible += "ABCDEFGHIJKMNLOPQRSTUVWXYZ";
    if (lowerCase) possible += "abcdefghijkmnlopqrstuvwxyz";
    if (number) possible += "0123456789";
    if (symbols) possible += "!@#$%^&*()_+=-/*,.";
  }

  let stringRandom = "";

  for (let i = 0; i < repeat; i++) {
    stringRandom += possible.charAt(
      Math.floor(Math.random() * possible.length)
    );
  }

  return stringRandom;
};

export const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const addDays = (date, days) => {
  date.setDate(date.getDate() + days);
  return date;
};

export const changeDate = (date) => {
  return `${("0" + date.getDate()).slice(-2)}/${(
    "0" +
    (date.getMonth() + 1)
  ).slice(-2)}/${date.getFullYear()}`;
};

export const thousandsSystem = (num) => {
  num = num
    .toString()
    .split("")
    .reverse()
    .join("")
    .replace(/(?=\d*\.?)(\d{3})/g, "$1.");
  num = num.split("").reverse().join("").replace(/^[.]/, "");
  return num;
};

export const reduce = (value) => {
  const sizes = ["", "K", "M", "B", "T", "C", "Q", "S"];
  const i = parseInt(Math.floor(Math.log(value) / Math.log(1000)));

  return Math.round(value / Math.pow(1000, i), 2) + " " + sizes[i];
};

export const randomColor = () => "#" + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, "0");
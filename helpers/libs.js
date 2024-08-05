import { Platform, PixelRatio } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import theme from "@theme";

const { light, dark } = theme();

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
    stringRandom += possible.charAt(Math.floor(Math.random() * possible.length));
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

export const languageCodes = [
  { code: "ar", name: "العربية" },
  { code: "bn", name: "বাংলা" },
  { code: "de", name: "Deutsch" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "he", name: "עִבְרִית" },
  { code: "hi", name: "हिन्दी" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "sw", name: "Kiswahili" },
  { code: "tr", name: "Türkçe" },
  { code: "zh", name: "中文 (简体)" },
];

export const addDays = (date, days) => {
  date.setDate(date.getDate() + days);
  return date;
};

export const changeDate = (date, { time } = {}) => {
  return `${("0" + date.getDate()).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(-2)}/${String(
    date.getFullYear()
  ).slice(-2)} ${
    time ? `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}` : ""
  }`;
};

export const reverseDate = (date) => {
  const [day, month, year] = date.split("/");
  return new Date(year, month - 1, day).getTime();
};

export const thousandsSystem = (number) => {
  const num = String(number);
  const parts = num.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (parts[1]) parts[1] = parts[1].slice(0, 2);
  return parts.join(",");
};

export const convertThousandsSystem = (number) => {
  const num = String(number);
  const numberWithoutSeparators = num.replace(/\./g, "");
  const normalizedNumber = numberWithoutSeparators.replace(",", ".");
  return normalizedNumber;
};

export const reduce = (value) => {
  const sizes = ["", "K", "M", "B", "T", "C", "Q", "S"];
  const i = parseInt(Math.floor(Math.log(value) / Math.log(1000)));

  return Math.round(value / Math.pow(1000, i), 2) + " " + sizes[i];
};

export const randomColor = () => "#" + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, "0");

export const generatePDF = async ({
  html,
  code = random(6, { number: true }),
  width = 340,
  height = 520,
}) => {
  try {
    const { uri } = await Print.printToFileAsync({
      // VAMOS A SUPUESTAMENTE A IMPRIMIR PARA CONSEGUIR EL PDF
      html, // HTML A UTILIZAR
      width, // TAMANO DEL PDF (WIDTH)
      height, // TAMANO DEL PDF (HEIGHT)
      base64: true, // USAREMOVE BASE64
    });

    if (Platform.OS === "ios") {
      await Sharing.shareAsync(uri);
    } else {
      const base64 = FileSystem.EncodingType.Base64; // CODIFICAMOS A BASE 64
      const storageAccess = FileSystem.StorageAccessFramework; // COLOCAMOS EL ACCESO AL ALMACENAMIENTO

      const fileString = await FileSystem.readAsStringAsync(uri, {
        // LEEMOS EL PDF
        encoding: base64, // USAMOS EL CODIFICADOR DE BASE64
      });

      const permissions = await storageAccess.requestDirectoryPermissionsAsync(); // PEDIMOS PERMISO PARA ACCEDER A SUS ARCHIVOS

      if (!permissions.granted) return; // SI NO NOS DA PERMISO RETORNAMOS

      await storageAccess
        .createFileAsync(permissions.directoryUri, code, "application/pdf") // CREAMOS EL ARCHIVO DONDE EL USUARIO NOS DIO ACCESO A LA CARPETA
        .then(async (uri) => {
          await FileSystem.writeAsStringAsync(uri, fileString, {
            // AGARRAMOS LA URI OBTENIDA Y ESCRIBIMOS EL ARCHIVO ANTES LEIDO
            encoding: base64, // CODIFICAMOS A BAse 64
          });
          alert("PDF Guardado satisfactoriamente"); // AVISAMOS QUE SE GUARDO EL ARCHIVO
        })
        .catch((e) => console.log(e.message));
    }
  } catch (err) {
    console.error(err);
  }
};

export const print = async ({ html, width = 425, height = 570 }) => {
  const { uri } = await Print.printToFileAsync({
    html,
    width,
    height,
    base64: true,
  });
  await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
};

export const getExpoID = async () => {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#EEEEEE",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Hubo un error al obtener el token de la push notifications!");
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "0dd838a6-95db-4883-9a7f-7e6112496cd0",
      })
    ).data;
    console.log(token);
  } else {
    alert("Debe usar un dispositivo físico para las notificaciones automáticas");
  }

  return token;
};

export const calendarTheme = (mode) => ({
  backgroundColor: mode === "light" ? light.main5 : dark.main2,
  calendarBackground: mode === "light" ? light.main5 : dark.main2,
  textSectionTitleColor: light.main2, // TITULO DE SEMANA
  textSectionTitleDisabledColor: "#d9e1e8", // TITULO DE SEMANA DESACTIVADO
  selectedDayBackgroundColor: "#00adf5", // NO SE
  selectedDayTextColor: "#ffffff", // NO SE
  todayTextColor: light.main2, // COLOR DEL DIA DE HOY
  dayTextColor: mode === "light" ? light.textDark : dark.textWhite, // COLOR DE LAS FECHAS
  textDisabledColor: `${mode === "light" ? light.textDark : dark.textWhite}66`, // COLOR QUE NO ES DEL MES
  dotColor: "#00adf5", // NO SE
  selectedDotColor: "#ffffff", // NO SE
  arrowColor: mode === "light" ? light.textDark : dark.textWhite, // COLOR DE LAS FLECHAS
  disabledArrowColor: `${light.main2}66`, //COLOR DE LAS FECHAS DESHABILITADAS
  monthTextColor: mode === "light" ? light.textDark : dark.textWhite, // TEXTO DEL MES
  indicatorColor: mode === "light" ? light.textDark : dark.textWhite, // COLOR DE INDICADOR
  textDayFontFamily: "monospace", // FONT FAMILY DEL DIA
  textMonthFontFamily: "monospace", // FONT FAMILY DEL MES
  textDayHeaderFontFamily: "monospace", // FONT FAMILY DEL ENCABEZADO
  textDayFontWeight: "300", // FONT WEIGHT DEL LOS DIAS DEL MES
  textMonthFontWeight: "bold", // FONT WEIGHT DEL TITULO DEL MES
  textDayHeaderFontWeight: "300", // FONT WEIGHT DEL DIA DEL ENCABEZADO
  textDayFontSize: 16, // TAMANO DE LA LETRA DEL DIA
  textMonthFontSize: 18, // TAMANO DE LA LETRA DEL MES
  textDayHeaderFontSize: 16, // TAMANO DEL ENCABEZADO DEL DIA
});

export const generateBill = (props) => {
  const { value, description, bills, ref, type = "pay" } = props;

  const id = random(6, { number: true });
  if (bills.find((b) => b.id === id)) return generateBill(props);

  return {
    id,
    ref,
    value,
    type,
    description,
    creationDate: new Date().getTime(),
    modificationDate: new Date().getTime(),
  };
};

const fontScale = PixelRatio.getFontScale();
export const getFontSize = (size) => size / fontScale;

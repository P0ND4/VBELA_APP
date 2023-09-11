import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

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

export const randomColor = () =>
  "#" + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, "0");

export const generatePDF = async ({
  html,
  code = random(6, { number: true }),
}) => {
  try {
    const { uri } = await Print.printToFileAsync({
      // VAMOS A SUPUESTAMENTE A IMPRIMIR PARA CONSEGUIR EL PDF
      html, // HTML A UTILIZAR
      width: 340, // TAMANO DEL PDF (WIDTH)
      height: 520, // TAMANO DEL PDF (HEIGHT)
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

      const permissions =
        await storageAccess.requestDirectoryPermissionsAsync(); // PEDIMOS PERMISO PARA ACCEDER A SUS ARCHIVOS

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

export const print = async ({ html }) => {
  const { uri } = await Print.printToFileAsync({
    html,
    width: 400,
    height: 520,
    base64: true,
  });
  await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
};

export const getExpoID = async () =>  {
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
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
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
    alert(
      "Debe usar un dispositivo físico para las notificaciones automáticas"
    );
  }

  return token;
}
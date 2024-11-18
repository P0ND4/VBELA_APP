import { Platform } from "react-native";
import { random } from "shared/utils";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

export interface PDF {
  html: string;
  code?: string | undefined;
  width?: number;
  height?: number;
}

export const generatePDF = async ({
  html,
  code = random(6, { number: true }),
  width = 390,
  height = 450,
}: PDF): Promise<void> => {
  try {
    const { uri } = await Print.printToFileAsync({
      html,
      width,
      height,
      base64: true,
    });

    if (Platform.OS === "ios") await sharePDF(uri);
    else await savePDFToFile(uri, code);
  } catch (err) {
    console.error("Error al generar el PDF:", err);
  }
};

export const printPDF = async ({ html, width = 390, height = 450 }: PDF): Promise<void> => {
  try {
    const { uri } = await Print.printToFileAsync({
      html,
      width,
      height,
      base64: true,
    });
    await sharePDF(uri);
  } catch (err) {
    console.error("Error al imprimir el PDF:", err);
  }
};

const sharePDF = async (uri: string): Promise<void> => {
  try {
    await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  } catch (err) {
    console.error("Error al compartir el PDF:", err);
  }
};

const savePDFToFile = async (uri: string, code: string): Promise<void> => {
  try {
    const base64 = FileSystem.EncodingType.Base64;
    const storageAccess = FileSystem.StorageAccessFramework;

    const fileString = await FileSystem.readAsStringAsync(uri, {
      encoding: base64,
    });

    const permissions = await storageAccess.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      console.warn("Permisos no otorgados para guardar el PDF");
      return;
    }

    const fileUri = await storageAccess.createFileAsync(
      permissions.directoryUri,
      code,
      "application/pdf",
    );

    await FileSystem.writeAsStringAsync(fileUri, fileString, {
      encoding: base64,
    });

    alert("PDF guardado satisfactoriamente");
  } catch (err) {
    console.error("Error al guardar el PDF:", err);
  }
};

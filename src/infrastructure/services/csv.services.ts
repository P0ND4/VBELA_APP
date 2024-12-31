import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import XLSX from "xlsx";

/**
 * Exportar datos a un archivo Excel y compartirlo
 * @param data - Arreglo de objetos con los datos de la tabla
 * @param fileName - Nombre del archivo (sin extensión)
 * @param summary - Agregar información adicional al final
 */

export const generateExcel = async (
  data: Record<string, any>[],
  fileName: string,
  summary?: (string | number)[][],
): Promise<void> => {
  try {
    // 1. Crear una hoja de cálculo a partir de los datos
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // 2. Agregar información adicional (resumen) si se proporciona
    if (summary) {
      XLSX.utils.sheet_add_aoa(worksheet, summary, { origin: -1 }); // Agregar al final de la hoja
    }

    // 3. Crear un libro de trabajo
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 4. Convertir el libro de trabajo a un archivo binario
    const excelBuffer: string = XLSX.write(workbook, { type: "binary", bookType: "xlsx" });

    // 5. Convertir el binario a Uint8Array
    const binaryArray: Uint8Array = new Uint8Array(
      Array.from(excelBuffer).map((char) => char.charCodeAt(0)),
    );

    // 6. Convertir Uint8Array a Base64
    const base64String = Buffer.from(binaryArray).toString("base64");

    // 7. Guardar el archivo en el sistema de archivos de Expo
    const fileUri = `${FileSystem.documentDirectory}${fileName}.xlsx`;
    await FileSystem.writeAsStringAsync(fileUri, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log(`Archivo Excel guardado en: ${fileUri}`);

    // 8. Compartir el archivo
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: "Compartir archivo Excel",
      UTI: "com.microsoft.excel.xlsx",
    });
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
  }
};

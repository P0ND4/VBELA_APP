import * as FileSystem from "expo-file-system";

const URI = FileSystem.documentDirectory + "sync.data.json";

export const saveSyncFile = async (data: any) => {
  await FileSystem.writeAsStringAsync(URI, JSON.stringify(data));
};

export const readSyncFile = async () => {
  const fileContent = await FileSystem.readAsStringAsync(URI);
  return JSON.parse(fileContent);
};

export const deleteSyncFile = async () => {
  await FileSystem.deleteAsync(URI);
};

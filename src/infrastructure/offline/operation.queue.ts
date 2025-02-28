import * as FileSystem from "expo-file-system";

const QUEUE_FILE = `${FileSystem.documentDirectory}queue.json`;

const ensureQueueFileExists = async () => {
  const fileInfo = await FileSystem.getInfoAsync(QUEUE_FILE);

  if (!fileInfo.exists) {
    await FileSystem.writeAsStringAsync(QUEUE_FILE, JSON.stringify([]));
  }
};

export interface Queue {
  id: string;
  endpoint: string;
  method: "POST" | "PUT" | "DELETE";
  data: any;
}

export const saveQueueOperation = async (props: Queue) => {
  await ensureQueueFileExists();
  let operations: Queue[] = await readQueueOperation();
  operations.push(props);
  await FileSystem.writeAsStringAsync(QUEUE_FILE, JSON.stringify(operations));
};

export const readQueueOperation = async () => {
  try {
    await ensureQueueFileExists();
    const fileContent = await FileSystem.readAsStringAsync(QUEUE_FILE);
    return JSON.parse(fileContent) as Queue[];
  } catch (error) {
    console.error("Error reading queue file:", error);
    return [];
  }
};

export const deleteQueueOperation = async (id: string) => {
  await ensureQueueFileExists();
  const operations: Queue[] = await readQueueOperation();
  const updatedOperations = operations.filter((operation: Queue) => operation.id !== id);
  await FileSystem.writeAsStringAsync(QUEUE_FILE, JSON.stringify(updatedOperations));
};

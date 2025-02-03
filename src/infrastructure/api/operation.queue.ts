import * as FileSystem from "expo-file-system";
import NetInfo from "@react-native-community/netinfo";
import apiClient from "./server";

const QUEUE_FILE = `${FileSystem.documentDirectory}queue.json`;

interface QueueOperation {
  id: string;
  endpoint: () => string;
  method: "POST" | "PUT" | "DELETE";
  data?: Record<string, any>;
  dependencies?: string[];
}

let operationQueue: QueueOperation[] = [];

const loadQueue = async () => {
  try {
    const queue = await FileSystem.readAsStringAsync(QUEUE_FILE);
    operationQueue = JSON.parse(queue) || [];
  } catch (error) {
    operationQueue = [];
    console.error(error);
  }
};

const saveQueue = async () => {
  try {
    await FileSystem.writeAsStringAsync(QUEUE_FILE, JSON.stringify(operationQueue));
  } catch (error) {
    console.error("Error saving the queue:", error);
  }
};

export const addOperationToQueue = async (operation: QueueOperation) => {
  operationQueue.push(operation);
  await saveQueue();
};

const processQueue = async () => {
  await loadQueue();
  const isConnected = await NetInfo.fetch().then((state) => state.isConnected);

  if (!isConnected) return;

  while (operationQueue.length > 0) {
    const currentOperation = operationQueue[0];

    try {
      const url = currentOperation?.endpoint();
      await apiClient({
        url,
        method: currentOperation?.method,
        data: currentOperation?.data,
      });
      operationQueue.shift();
      await saveQueue();
    } catch (error) {
      console.error("Error processing operation:", error);
      break;
    }
  }
};

export const operationQueueManager = {
  addOperationToQueue,
  processQueue,
};

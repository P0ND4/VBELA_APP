import axios, { AxiosRequestConfig } from "axios";
import { Queue, readQueueOperation, saveQueueOperation } from "../offline/operation.queue";
import { thousandsSystem } from "shared/utils";
import { getTokens } from "infrastructure/security/tokens";
import { ApiResponse } from "domain/entities/api.response";
import { baseURL } from "./route.constants";

const addQueue = async (config: AxiosRequestConfig) => {
  const queueItem: Queue = {
    id: `req_${Date.now()}`,
    endpoint: config.url!,
    method: config.method as "POST" | "PUT" | "DELETE",
    data: config.data,
  };

  await saveQueueOperation(queueItem);
};

const apiClient = async <T>(
  config: AxiosRequestConfig,
  options: { synchronization?: boolean; token?: boolean } = { synchronization: true, token: true },
): Promise<ApiResponse<T>> => {
  let accessToken;
  if (options.token) accessToken = (await getTokens())?.accessToken;

  if (options.synchronization) {
    const currentQueue = await readQueueOperation();
    if (currentQueue.length > 0) {
      const message = `Queued request due to pending transactions: ${thousandsSystem(currentQueue.length)}`;
      console.warn(message);
      await addQueue(config);
      throw new Error(message);
    }
  }

  try {
    const response = await axios({
      ...config,
      baseURL,
      headers: { ...(accessToken && { Authorization: `Bearer ${accessToken}` }) },
    });
    return response.data;
  } catch (error) {
    console.warn("API Error:", error);
    if (options.synchronization) await addQueue(config);
    throw new Error(`API ERROR: ${error}`);
  }
};

export default apiClient;

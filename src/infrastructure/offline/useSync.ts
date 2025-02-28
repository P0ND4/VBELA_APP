import { useEffect, useRef, useState } from "react";
import { readQueueOperation, deleteQueueOperation, Queue } from "./operation.queue";
import { baseURL } from "../api/server";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const MAX_RETRIES = 3;

export const useSync = () => {
  const abortControllerRef = useRef(new AbortController());
  const isMountedRef = useRef(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const processQueue = async (queue: Queue): Promise<void> => {
    for (let retries = 0; retries < MAX_RETRIES; retries++) {
      try {
        const state = await NetInfo.fetch();
        if (!state.isConnected) throw new Error("NO_INTERNET");

        const token = await AsyncStorage.getItem("access_token");
        if (!token) throw new Error("UNAUTHORIZED");

        await axios({
          baseURL,
          url: queue.endpoint,
          method: queue.method,
          data: queue.data,
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
        });

        await deleteQueueOperation(queue.id);
        return;
      } catch (error) {
        if (retries === MAX_RETRIES - 1) throw error;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  };

  const sync = async (): Promise<void> => {
    if (!isMountedRef.current || isSyncing) return;

    try {
      setIsSyncing(true);
      abortControllerRef.current = new AbortController();

      while (true) {
        const queues = await readQueueOperation();
        if (queues.length === 0) break;

        const queue = queues[0];
        try {
          await processQueue(queue);
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error(
        "Error durante sincronización:",
        error instanceof Error ? error.message : error,
      );
    } finally {
      setIsSyncing(false);
    }
  };

  let syncTimeout: NodeJS.Timeout;

  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        if (state.isConnected && !isSyncing) sync();
      }, 1000);
    });

    return () => {
      isMountedRef.current = false;
      unsubscribeNetInfo();
      abortControllerRef.current.abort();
    };
  }, []);

  return { sync };
};

export default useSync;

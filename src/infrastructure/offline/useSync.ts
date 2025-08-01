import { useEffect, useRef, useState, useCallback } from "react";
import { readQueueOperation, deleteQueueOperation, Queue } from "./operation.queue";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { change, InternetStatus } from "application/appState/internet/status.slice";
import axios, { AxiosError } from "axios";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { getTokens } from "infrastructure/security/tokens";
import { baseURL } from "infrastructure/api/route.constants";
import { ServerStatus } from "application/appState/server/status.slice";
import { useWebSocketContext } from "infrastructure/context/SocketContext";

const SYNC_DELAY = 2000;
const NETWORK_CHECK_DELAY = 1000;

export const useSync = () => {
  const serverStatus = useAppSelector((state) => state.serverStatus);
  const { socket } = useWebSocketContext();

  const triggeredRef = useRef(false);
  const abortControllerRef = useRef(new AbortController());

  const [isSyncing, setIsSyncing] = useState(false);
  const [triggerChangeAll, setTriggerChangeAll] = useState(false);

  const dispatch = useAppDispatch();

  const processQueueItem = async (queueItem: Queue) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) throw new Error("NO_INTERNET");

    const token = (await getTokens())?.accessToken;

    try {
      await axios({
        baseURL,
        url: queueItem.endpoint,
        method: queueItem.method,
        data: queueItem.data,
        headers: { Authorization: `Bearer ${token}` },
        signal: abortControllerRef.current.signal,
      });

      await deleteQueueOperation(queueItem.id);
    } catch (err) {
      const error = err as AxiosError;
      const status = error?.response?.status;

      if ([400, 401, 404, 422].includes(status || 0)) {
        await deleteQueueOperation(queueItem.id);
      }

      throw error;
    }
  };

  const sync = useCallback(async (): Promise<void> => {
    const queues = await readQueueOperation();
    if (isSyncing || queues.length === 0) {
      dispatch(change(InternetStatus.Online));
      return;
    }

    dispatch(change(InternetStatus.Syncing));
    setIsSyncing(true);

    try {
      while (!abortControllerRef.current.signal.aborted) {
        const queues = await readQueueOperation();
        if (queues.length === 0) break;

        try {
          await processQueueItem(queues[0]);
        } catch (error) {
          console.warn("Error processing queue item:", error);
          await new Promise((r) => setTimeout(r, SYNC_DELAY));
          continue;
        }
      }
    } finally {
      setIsSyncing(false);
      dispatch(change(InternetStatus.Online));
      setTriggerChangeAll(true);
    }
  }, [isSyncing, dispatch]);

  useEffect(() => {
    if (!triggerChangeAll) return;

    const timeoutId = setTimeout(() => {
      if (socket) socket.emit("change-all");
      setTriggerChangeAll(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [triggerChangeAll, socket]);

  useEffect(() => {
    let syncTimeout: NodeJS.Timeout;
    let lastState: boolean | null = null;

    const handleNetworkChange = (state: NetInfoState) => {
      if (lastState === state.isConnected) return;
      lastState = state.isConnected;

      clearTimeout(syncTimeout);

      syncTimeout = setTimeout(() => {
        if (state.isConnected && !isSyncing && !triggeredRef.current) {
          triggeredRef.current = true;
          sync().finally(() => (triggeredRef.current = false));
        } else dispatch(change(InternetStatus.Offline));
      }, NETWORK_CHECK_DELAY);
    };

    const unsubscribeNetInfo = NetInfo.addEventListener(handleNetworkChange);
    NetInfo.fetch().then(handleNetworkChange);

    return () => {
      clearTimeout(syncTimeout);
      unsubscribeNetInfo();
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
    };
  }, [isSyncing, sync, dispatch]);

  useEffect(() => {
    if (serverStatus.status === ServerStatus.Online && !isSyncing && !triggeredRef.current) {
      triggeredRef.current = true;
      sync().finally(() => (triggeredRef.current = false));
    }
  }, [serverStatus.status, isSyncing, sync]);

  return { sync, isSyncing };
};

export default useSync;

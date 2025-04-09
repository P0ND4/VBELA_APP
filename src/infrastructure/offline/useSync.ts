import { useEffect, useRef, useState, useCallback } from "react";
import { readQueueOperation, deleteQueueOperation, Queue } from "./operation.queue";
import { useAppDispatch } from "application/store/hook";
import { baseURL } from "../api/server";
import { change, Status } from "application/appState/internet/status.slice";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

const SYNC_DELAY = 2000;
const NETWORK_CHECK_DELAY = 1000;

export const useSync = () => {
  const abortControllerRef = useRef(new AbortController());
  const [isSyncing, setIsSyncing] = useState(false);
  const dispatch = useAppDispatch();

  const processQueueItem = async (queueItem: Queue) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) throw new Error("NO_INTERNET");

    const token = await AsyncStorage.getItem("access_token");
    if (!token) throw new Error("UNAUTHORIZED");

    await axios({
      baseURL,
      url: queueItem.endpoint,
      method: queueItem.method,
      data: queueItem.data,
      headers: { Authorization: `Bearer ${token}` },
      signal: abortControllerRef.current.signal,
    });

    await deleteQueueOperation(queueItem.id);
  };

  const sync = useCallback(async (): Promise<void> => {
    const queues = await readQueueOperation();
    if (isSyncing || queues.length === 0) {
      dispatch(change(Status.Online));
      return;
    }

    dispatch(change(Status.Syncing));
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
      dispatch(change(Status.Online));
    }
  }, [isSyncing, dispatch]);

  useEffect(() => {
    let syncTimeout: NodeJS.Timeout;
    let isMounted = true;
    let lastState: boolean | null = null;

    const handleNetworkChange = (state: NetInfoState) => {
      if (!isMounted) return;

      if (lastState === state.isConnected) return;
      lastState = state.isConnected;

      clearTimeout(syncTimeout);

      syncTimeout = setTimeout(() => {
        if (!isMounted) return;

        if (state.isConnected) {
          if (!isSyncing) sync();
        } else dispatch(change(Status.Offline));
      }, NETWORK_CHECK_DELAY);
    };

    const unsubscribeNetInfo = NetInfo.addEventListener(handleNetworkChange);
    NetInfo.fetch().then(handleNetworkChange);

    return () => {
      isMounted = false;
      clearTimeout(syncTimeout);
      unsubscribeNetInfo();
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
    };
  }, [isSyncing, sync, dispatch]);

  return { sync, isSyncing };
};

export default useSync;

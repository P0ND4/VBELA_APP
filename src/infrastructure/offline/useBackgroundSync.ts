import { useEffect } from "react";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { useSync } from "./useSync";

const BACKGROUND_SYNC_TASK = "background-sync";

export const useBackgroundSync = () => {
  const { sync } = useSync();

  useEffect(() => {
    // Registrar tarea
    TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
      await sync();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    });

    // Registrar periodicidad
    BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });

    return () => {
      BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    };
  }, []);
};

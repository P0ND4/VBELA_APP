import { useEffect } from "react";
import { useSync } from "./useSync";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

const BACKGROUND_SYNC_TASK = "background-sync";

export const useBackgroundSync = () => {
  const { sync } = useSync();

  useEffect(() => {
    // Register Task
    TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
      await sync();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    });

    // Register reciprocity
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

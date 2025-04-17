import { useEffect } from "react";
import apiClient, { endpoints } from "infrastructure/api/server";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Collection } from "domain/entities/data";
import { changeAll, cleanAll } from "application/store/actions";
import { signOutWithGoogle } from "infrastructure/auth/google.auth";
import { readQueueOperation } from "infrastructure/offline/operation.queue";
import { AppState } from "react-native";
import { Status } from "application/appState/internet/status.slice";

export const useUser = () => {
  const user = useAppSelector((state) => state.user);
  const session = useAppSelector((state) => state.session);
  const internetStatus = useAppSelector((state) => state.internetStatus);

  const dispatch = useAppDispatch();

  // Update user information
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") {
        const currentQueue = await readQueueOperation();

        if (!session || currentQueue.length > 0 || internetStatus.status === Status.Offline) return;
        try {
          const userResponse = await apiClient<Collection[]>(
            {
              url: endpoints.user.get(),
              method: "GET",
              data: { identifier: user.identifier, expoID: null },
            },
            { synchronization: false },
          );

          if (userResponse?.data[0]) dispatch(changeAll(userResponse.data[0]));
          else {
            await signOutWithGoogle();
            dispatch(cleanAll());
            console.warn("User deleted");
          }
        } catch (error) {
          console.warn(`User update process failed: ${error}`);
        }
      }
    });

    return () => subscription.remove();
  }, []);
};

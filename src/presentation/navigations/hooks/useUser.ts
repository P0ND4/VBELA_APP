import { useEffect } from "react";
import { useAppSelector } from "application/store/hook";
import { readQueueOperation } from "infrastructure/offline/operation.queue";
import { AppState } from "react-native";
import { InternetStatus } from "application/appState/internet/status.slice";
import { store } from "application/store";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import useGetUser from "../../../infrastructure/hooks/useGetUser";
import { ServerStatus } from "application/appState/server/status.slice";

export const useUser = () => {
  const { getUserInformation } = useGetUser();
  const { connect, isConnected } = useWebSocketContext();

  const session = useAppSelector((state) => state.session);
  const internetStatus = useAppSelector((state) => state.internetStatus);
  const serverStatus = useAppSelector((state) => state.serverStatus);

  const shouldSkipUpdate = async () => {
    const currentQueue = await readQueueOperation();
    return !session || currentQueue.length > 0 || internetStatus.status === InternetStatus.Offline;
  };

  // Update user information
  useEffect(() => {
    const checkAndUpdate = async () => {
      const validation =
        !(await shouldSkipUpdate()) && serverStatus.status === ServerStatus.Online && !isConnected;

      if (validation) await getUserInformation();
    };
    checkAndUpdate();

    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") await checkAndUpdate();
    });

    return () => subscription.remove();
  }, [serverStatus, isConnected]);

  // Manejar los WebSockets
  useEffect(() => {
    const checkAndConnect = async () => {
      // Usamos store.getState() en lugar de useSelector para evitar tener que declarar dependencias en el array del useEffect.
      // Esto asegura que se ejecute solo una vez al iniciar la app y cuando vuelva a estado 'active'.
      const state = store.getState();
      const { identifier, selected } = state.user;
      const collaborators = state.collaborators;

      const shouldConnect =
        identifier !== selected || (identifier === selected && collaborators.length > 0);

      const validation =
        !(await shouldSkipUpdate()) &&
        shouldConnect &&
        serverStatus.status === ServerStatus.Online &&
        !isConnected;

      if (validation) await connect();
    };

    checkAndConnect();
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") await checkAndConnect();
    });

    return () => subscription.remove();
  }, [serverStatus, isConnected]);
};

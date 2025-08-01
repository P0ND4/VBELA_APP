import { store } from "application/store";
import { ServerStatus, setServerStatus } from "application/appState/server/status.slice";
import { isServerReachable } from "infrastructure/api/server.connection";

let interval: NodeJS.Timeout | null = null;

export const startServerWatcher = (delay: number = 5000) => {
  if (interval) return;

  const check = async () => {
    const isReachable = await isServerReachable();
    const status = isReachable ? ServerStatus.Online : ServerStatus.Unreachable;
    store.dispatch(setServerStatus(status));
  };

  interval = setInterval(check, delay);
  check();
};

export const stopServerWatcher = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
};

import { onQueueChange, readQueueOperation } from "infrastructure/offline/operation.queue";
import { useEffect, useState } from "react";

export const useSyncCheck = () => {
  const [isSynchronized, setSynchronized] = useState<boolean>(true);

  useEffect(() => {
    const checkQueue = async () => {
      const queues = await readQueueOperation();
      setSynchronized(queues.length === 0);
    };

    checkQueue();
    const unsubscribe = onQueueChange(checkQueue);

    return () => {
      unsubscribe();
    };
  }, []);

  return { isSynchronized };
};

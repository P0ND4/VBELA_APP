import { operationQueue } from "./operation.queue";

export const sync = async () => {
  try {
    const promises = operationQueue.map((operation) => operation());
    await Promise.all(promises);
    console.log("All operations completed successfully.");
  } catch (error) {
    console.error("Error executing operations:", error);
  }
};

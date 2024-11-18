type Operation = () => Promise<any>;

export const operationQueue: Operation[] = [];

export const addToQueue = (operation: Operation): void => {
  operationQueue.push(operation);
};

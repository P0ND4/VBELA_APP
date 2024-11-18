const RETRY_LIMIT = 3;
const RETRY_DELAY = 2000;

export async function retry<T>(func: () => Promise<T>, retries = RETRY_LIMIT): Promise<T> {
  try {
    return await func();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying... (${RETRY_LIMIT - retries + 1})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return retry(func, retries - 1);
    } else {
      throw error;
    }
  }
}

import { notifier } from "@/components/notifier";
/**
 * @function RetryOperation
 * @description This function handles the retry operation of the fetch function
 * @param {operation} Function - The function to be executed
 */
export async function RetryOperation(
  fn: (params?: any) => void | any,
  params?: any,
  remaining_retries: number = 3
) {
  try {
    return await fn(...params);
  } catch (error: any) {
    if (remaining_retries > 0) {
      notifier.error(
        `Request failed. Retrying in 2 seconds...`,
        `Retry Attempt ${4 - remaining_retries} of 3`
      );
      return new Promise((resolve) => {
        setTimeout(
          () => resolve(RetryOperation(fn, params, remaining_retries - 1)),
          2000
        );
      });
    } else {
      notifier.error("Maximum retry attempts reached", "Request Failed");
      throw error;
    }
  }
}

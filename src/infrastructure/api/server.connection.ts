import axios from "axios";
import { baseURL } from "./route.constants";

export const isServerReachable = async (): Promise<boolean> => {
  try {
    const response = await axios.head(`${baseURL}/api/v1/health`, { timeout: 3000 });
    return response.status >= 200 && response.status < 400;
  } catch (error) {
    console.error("Server is not reachable:", error);
    return false;
  }
};

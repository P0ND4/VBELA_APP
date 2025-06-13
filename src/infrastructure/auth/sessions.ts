import apiClient from "infrastructure/api/server";
import { Session } from "domain/entities/navigation";
import CryptoJS from "crypto-js";
import endpoints from "config/constants/api.endpoints";

const getServerTime = async () => {
  try {
    const response = await apiClient<{ timestamp: number }>(
      {
        url: endpoints.auth.serverTime(),
        method: "GET",
      },
      { synchronization: false, token: false },
    );
    return response.data.timestamp;
  } catch (error) {
    console.warn(`Using client time as fallback, error: ${error}`);
    return Date.now();
  }
};

type Response = { sessions: Session[]; token: string };

export const sessions = async (identifier: string): Promise<Response> => {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("Auth secret is not configured");

    const serverTimestamp = await getServerTime();
    const hash = CryptoJS.HmacSHA256(`${identifier}:${serverTimestamp}`, secret).toString();

    // Realizar la obtención de sesiones y token
    const sessionsResponse = await apiClient<Response>(
      {
        url: endpoints.auth.sessions(),
        method: "POST",
        data: { identifier, hash, timestamp: serverTimestamp },
      },
      { synchronization: false, token: false },
    );

    // Si la petición de sesiones es exitosa, ejecutar finished
    if (sessionsResponse?.data) return sessionsResponse.data;
    else throw new Error(`Server returned ${sessionsResponse.status}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Sessions failed: ${message}`);
  }
};

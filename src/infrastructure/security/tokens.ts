import axios from "axios";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiResponse } from "domain/entities/api.response";
import { baseURL } from "infrastructure/api/route.constants";
import endpoints from "config/constants/api.endpoints";
import * as SecureStore from "expo-secure-store";

const listeners = new Set<() => void>();

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const notify = () => {
  listeners.forEach((listener) => listener());
};

type AccessRefresh = { accessToken: string; refreshToken: string };

type TokenData = AccessRefresh & {
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
};

// Almacena tokens encriptados
export const storeTokens = async (accessToken: string, refreshToken: string) => {
  const tokenData: TokenData = {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: moment().add(1, "hour").toISOString(),
    refreshTokenExpiresAt: moment().add(7, "days").toISOString(),
  };

  // Encripta y guarda el objeto
  await SecureStore.setItemAsync("auth_tokens", JSON.stringify(tokenData));
};

// Renueva el token usando el refresh token
export const refreshToken = async (tokenRefresh: string): Promise<AccessRefresh> => {
  try {
    const response = await axios.post<ApiResponse<{ access_token: string; refresh_token: string }>>(
      endpoints.auth.refreshToken(),
      null,
      {
        baseURL,
        headers: {
          Authorization: `Bearer ${tokenRefresh}`,
        },
      },
    );

    const { access_token, refresh_token } = response.data.data;
    await storeTokens(access_token, refresh_token);

    return { accessToken: access_token, refreshToken: refresh_token };
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw new Error(`Error al renovar el token: ${error}`);
  }
};

// Obtiene tokens válidos (con desencriptación)
export const getValidTokens = async () => {
  const encryptedTokens = await SecureStore.getItemAsync("auth_tokens");
  if (!encryptedTokens) return null;

  try {
    // Obtener los tokens
    const tokens: TokenData = JSON.parse(encryptedTokens);

    const now = moment();
    const refreshTokenExpired = now.isAfter(moment(tokens.refreshTokenExpiresAt));

    // Caso 1: Refresh token expirado → Limpiar y redirigir a login
    if (refreshTokenExpired) {
      await AsyncStorage.removeItem("auth_tokens");
      console.warn("Refresh token expirado. Sesión cerrada.");
      return null;
    }

    const accessTokenExpired = now.isAfter(moment(tokens.accessTokenExpiresAt));

    // Caso 2: Access token aún válido
    if (!accessTokenExpired) {
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    }

    // Caso 3: Solo access token expirado
    return {
      refreshToken: tokens.refreshToken,
      needsRefresh: true,
    };
  } catch (error) {
    console.error("Error decrypting tokens:", error);
    await AsyncStorage.removeItem("auth_tokens");
    return null;
  }
};

export const getTokens = async (): Promise<AccessRefresh> => {
  let tokens;
  try {
    tokens = await getValidTokens();
    if (!tokens) throw new Error("TOKEN_EXPIRED");
  } catch {
    notify();
    throw new Error("Sesión expirada. Redirigiendo a login...");
  }

  if (tokens.needsRefresh) {
    try {
      return await refreshToken(tokens.refreshToken);
    } catch (refreshError: any) {
      const status = refreshError?.response?.status;
      if ([400, 401, 403, 404, 422].includes(status || 0)) {
        notify();
        throw new Error("Sesión expirada. Redirigiendo a login...");
      }

      throw new Error("NO_CONNECTION");
    }
  }

  return { accessToken: tokens.accessToken!, refreshToken: tokens.refreshToken };
};

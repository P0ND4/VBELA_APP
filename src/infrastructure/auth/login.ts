import AsyncStorage from "@react-native-async-storage/async-storage";
import { Collection } from "domain/entities/data/user";
import apiClient, { endpoints } from "infrastructure/api/server";
import CryptoJS from "crypto-js";

const getServerTime = async () => {
  const response = await apiClient<{ timestamp: number }>({
    url: endpoints.auth.serverTime(),
    method: "GET",
  });
  return response.data.timestamp;
};

export const login = async (identifier: string, collaborator: string | null = null) => {
  try {
    const secret = process.env.LOGIN_SECRET;
    const serverTimestamp = await getServerTime();
    const hash = CryptoJS.HmacSHA256(`${identifier}:${serverTimestamp}`, secret!).toString();

    // Realizar login
    const loginResponse = await apiClient<{ access_token: string }>({
      url: endpoints.auth.login(),
      method: "POST",
      data: { identifier, collaborator, expoID: null, hash, timestamp: serverTimestamp },
    });

    // Verificar si la respuesta es exitosa
    if (loginResponse?.status !== "success") return;

    const token = loginResponse.data.access_token;

    // Guardar el token
    await AsyncStorage.setItem("access_token", token);

    // Obtener usuario después de login
    const userResponse = await apiClient<Collection[]>({
      url: endpoints.user.get(),
      method: "GET",
      data: { identifier, expoID: null },
    });

    // Si la petición de usuario es exitosa, ejecutar finished
    if (userResponse?.data) return userResponse.data;
    else alert("Error fetching user data");
  } catch (error) {
    alert(`Login process failed: ${error}`);
  }
};

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Collection } from "domain/entities/data/user";
import apiClient, { endpoints } from "infrastructure/api/server";

export const login = async (identifier: string) => {
  try {
    // Realizar login
    const loginResponse = await apiClient<{ access_token: string }>({
      url: endpoints.auth.login(),
      method: "POST",
      data: { identifier, expoID: null },
    });

    // Verificar si la respuesta es exitosa
    if (loginResponse?.status !== "success") return;

    const token = loginResponse.data.access_token;

    // Guardar el token
    await AsyncStorage.setItem("access_token", token);

    // Obtener usuario después de login
    const userResponse = await apiClient<Collection>({
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

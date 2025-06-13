import endpoints from "config/constants/api.endpoints";
import apiClient from "infrastructure/api/server";
import { storeTokens } from "infrastructure/security/tokens";

type Response = { access_token: string; refresh_token: string };

export const login = async (
  identifier: string,
  selected: string,
  token: string,
): Promise<boolean> => {
  try {
    // Realizar el inicio de sesión para la obteción de los tokens
    const loginResponse = await apiClient<Response>(
      {
        url: endpoints.auth.login(),
        method: "POST",
        data: { identifier, selected, token },
      },
      { synchronization: false, token: false },
    );

    // Si la petición de login es exitosa, ejecutar finished
    if (loginResponse?.data) {
      // Se encriptan los tokens y luego se guarda
      const { access_token, refresh_token } = loginResponse?.data;
      await storeTokens(access_token, refresh_token);

      // Retornamos un booleano indicando que ya puede acceder al usuario
      return true;
    } else throw new Error(`Server returned ${loginResponse.status}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Login failed: ${message}`);
  }
};

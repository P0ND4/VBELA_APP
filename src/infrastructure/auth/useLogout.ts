import { cleanAll } from "application/store/actions";
import { signOutWithGoogle } from "infrastructure/auth/google.auth";
import { clearQueue } from "infrastructure/offline/operation.queue";
import { getTokens } from "infrastructure/security/tokens";
import { useAppDispatch } from "application/store/hook";
import apiClient from "infrastructure/api/server";
import endpoints from "config/constants/api.endpoints";

export const useLogout = () => {
  const dispatch = useAppDispatch();

  const logout = async (callback: () => void = () => {}) => {
    const { accessToken, refreshToken } = (await getTokens()) || {};

    await clearQueue();
    await signOutWithGoogle();
    dispatch(cleanAll());
    callback();
    await apiClient(
      {
        url: endpoints.auth.logout(),
        method: "POST",
        data: { accessToken, refreshToken },
      },
      { synchronization: false, token: true },
    );
  };

  return { logout };
};

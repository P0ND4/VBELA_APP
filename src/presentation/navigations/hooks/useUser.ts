import { useEffect } from "react";
import apiClient, { endpoints } from "infrastructure/api/server";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { Collection } from "domain/entities/data";
import { changeAll, cleanAll } from "application/store/actions";
import { signOutWithGoogle } from "infrastructure/auth/google.auth";

export const useUser = () => {
  const user = useAppSelector((state) => state.user);
  const session = useAppSelector((state) => state.session);

  const dispatch = useAppDispatch();

  //TODO SI useUser tiene datos pendiente por subir que no sincronice los datos
  // Update user information
  useEffect(() => {
    (async () => {
      if (!session) return;
      try {
        const userResponse = await apiClient<Collection[]>({
          url: endpoints.user.get(),
          method: "GET",
          data: { identifier: user.identifier, expoID: null },
        });

        if (userResponse?.data) dispatch(changeAll(userResponse.data[0]));
        else {
          await signOutWithGoogle();
          dispatch(cleanAll());
          console.warn("User deleted");
        }
      } catch (error) {
        console.warn(`User update process failed: ${error}`);
      }
    })();
  }, []);
};

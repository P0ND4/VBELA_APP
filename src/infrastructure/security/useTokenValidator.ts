import { useEffect } from "react";
import { useAppDispatch } from "application/store/hook";
import { signOutWithGoogle } from "infrastructure/auth/google.auth";
import { cleanAll } from "application/store/actions";
import { subscribe } from "./tokens";
import { clearQueue } from "infrastructure/offline/operation.queue";

export const useTokenValidator = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Escucha si no hay tokens para procesar una petición
    const unsubscribe = subscribe(async () => {
      // Cierra la sesión
      await clearQueue();
      await signOutWithGoogle();
      dispatch(cleanAll());
    });

    return () => {
      // Limpia el listener
      unsubscribe();
    };
  }, []);

  return null;
};

import { changeAll, cleanAll } from "application/store/actions";
import { useAppDispatch } from "application/store/hook";
import { Collection } from "domain/entities/data";
import endpoints from "config/constants/api.endpoints";
import apiClient from "infrastructure/api/server";
import { signOutWithGoogle } from "infrastructure/auth/google.auth";
import { clearQueue } from "infrastructure/offline/operation.queue";

const useGetUser = () => {
  const dispatch = useAppDispatch();

  const getUserInformation = async () => {
    try {
      const res = await apiClient<Partial<Collection>>(
        {
          url: endpoints.user.get(),
          method: "GET",
        },
        { synchronization: false, token: true },
      );

      if (res?.data) dispatch(changeAll(res.data));
      else {
        await clearQueue();
        await signOutWithGoogle();
        dispatch(cleanAll());
        console.warn("User deleted");
      }
    } catch (error) {
      console.warn(`User update process failed: ${error}`);
    }
  };

  return { getUserInformation };
};

export default useGetUser;

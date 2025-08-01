import { CommonActions, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppSelector } from "application/store/hook";
import endpoints from "config/constants/api.endpoints";
import { RootStackParamList } from "domain/entities/navigation";
import apiClient from "infrastructure/api/server";
import { useEffect } from "react";
import { AppState } from "react-native";

type Config = {
  version: string;
  codeVersion: number;
  url: string;
  blocked: string[];
  maintenance: boolean;
};

type NavigationProps = StackNavigationProp<RootStackParamList>;

export const useGetConfig = () => {
  const user = useAppSelector((state) => state.user);
  const session = useAppSelector((state) => state.session);
  const serverStatus = useAppSelector((state) => state.serverStatus);

  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    const getConfigAndValidate = async () => {
      if (!session) return;
      const res = await apiClient<Config>(
        {
          url: endpoints.config.get(),
          method: "GET",
        },
        { synchronization: false, token: true },
      );

      if (res.code !== 200) return;

      const config = res.data;

      if (config.blocked.includes(user.identifier))
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Banned" }] }));
      else if (config.maintenance)
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Maintenance" }] }));
      else if (config.codeVersion > parseInt(process.env.EXPO_PIBLIC_VERSION_CODE || "0"))
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: "UpdateAvailable", params: { version: config.version, url: config.url } },
            ],
          }),
        );
    };
    getConfigAndValidate();

    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") await getConfigAndValidate();
    });

    return () => subscription.remove();
  }, [session, user.identifier, serverStatus.status]);
};

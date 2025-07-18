import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "domain/entities/navigation/root.stack.param.list.entity";
import { useTokenValidator } from "infrastructure/security/useTokenValidator";
import { useAppSelector } from "application/store/hook";
import { useBackgroundSync } from "infrastructure/offline/useBackgroundSync";
import { useUser } from "./hooks/useUser";
import AuthRoutes from "./routes/AuthRoutes";
import ProviderStoreRoutes from "./routes/ProviderStoreRoutes";
import ReservationRoutes from "./routes/ReservationRoutes";
import RestaurantRoutes from "./routes/RestaurantRoutes";
import StoreRoutes from "./routes/StoreRoutes";
import CustomerRoutes from "./routes/CustomerRoutes";
import SettingRoutes from "./routes/SettingRoutes";
import ProviderRestaurantRoutes from "./routes/ProviderRestaurantRoutes";
import OrderRoutes from "./routes/OrderRoutes";
import InventoryRoutes from "./routes/InventoryRoutes";
import StatisticsRoutes from "./routes/StatisticsRoutes";
import CollaboratorRoutes from "./routes/CollaboratorRoutes";
import SupplierRoutes from "./routes/SupplierRoutes";
import EconomyRoutes from "./routes/EconomyRoutes";
import App from "./App";
import WifiConnection from "./modal/WifiConnection";

const Stack = createStackNavigator<RootStackParamList>();

const Main: React.FC = () => {
  const session = useAppSelector((state) => state.session);

  // Procesa la información fuera de conexión
  useBackgroundSync();

  // Procesa la información acerca del usuario
  useUser();

  // Escucha si ya no existen token (access_token, refresh_token)
  useTokenValidator();

  return (
    <>
      <WifiConnection />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="AuthRoutes" component={AuthRoutes} />
        ) : (
          <>
            <Stack.Screen name="App" component={App} />
            <Stack.Screen name="ReservationRoutes" component={ReservationRoutes} />
            <Stack.Screen name="RestaurantRoutes" component={RestaurantRoutes} />
            <Stack.Screen name="ProviderRestaurantRoutes" component={ProviderRestaurantRoutes} />
            <Stack.Screen name="StoreRoutes" component={StoreRoutes} />
            <Stack.Screen name="ProviderStoreRoutes" component={ProviderStoreRoutes} />
            <Stack.Screen name="CustomerRoutes" component={CustomerRoutes} />
            <Stack.Screen name="SettingRoutes" component={SettingRoutes} />
            <Stack.Screen name="OrderRoutes" component={OrderRoutes} />
            <Stack.Screen name="InventoryRoutes" component={InventoryRoutes} />
            <Stack.Screen name="StatisticsRoutes" component={StatisticsRoutes} />
            <Stack.Screen name="CollaboratorRoutes" component={CollaboratorRoutes} />
            <Stack.Screen name="SupplierRoutes" component={SupplierRoutes} />
            <Stack.Screen name="EconomyRoutes" component={EconomyRoutes} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
};

export default Main;

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "domain/entities/navigation/root.stack.param.list.entity";
import { useAppSelector } from "application/store/hook";
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
import App from "./App";

const Stack = createStackNavigator<RootStackParamList>();

const Main: React.FC = () => {
  const session = useAppSelector((state) => state.session);

  return (
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
        </>
      )}
    </Stack.Navigator>
  );
};

export default Main;

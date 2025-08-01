import { RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  AuthRoutes: undefined;
  ReservationRoutes: undefined;
  RestaurantRoutes: undefined;
  ProviderRestaurantRoutes: undefined;
  StoreRoutes: undefined;
  CustomerRoutes: undefined;
  SettingRoutes: undefined;
  ProviderStoreRoutes: undefined;
  OrderRoutes: undefined;
  InventoryRoutes: undefined;
  StatisticsRoutes: undefined;
  CollaboratorRoutes: undefined;
  SupplierRoutes: undefined;
  EconomyRoutes: undefined;
  App: undefined;
  Banned: undefined;
  Maintenance: undefined;
  UpdateAvailable: { version: string; url: string };
};

export type StackParamListRouteProp<RouteName extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  RouteName
>;

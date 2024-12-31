import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RouteProp } from "@react-navigation/native";
import { RootRestaurant } from "./route.restaurant.entity";
import { RootReservation } from "./route.reservation.entity";
import { RootStore } from "./route.store.entity";
import { RootCustomer } from "./root.customer.entity";
import { RootSetting } from "./root.setting.entity";
import { RootOrder } from "./route.order.entity";
import { RootInventory } from "./root.inventory.entity";
import { RootStatistics } from "./route.statistics.entity";

export type RootApp = {
  Home: undefined;
  Statistic: undefined;
  Reservation: undefined;
  Restaurant: undefined;
  Customer: undefined;
  Store: undefined;
  Delivery: undefined;
  Kitchen: undefined;
  Inventory: undefined;
  Setting: undefined;
  Order: undefined;
  OrderRoutes: {
    screen: keyof RootOrder;
    params?: RootOrder[keyof RootOrder];
  };
  RestaurantRoutes: {
    screen: keyof RootRestaurant;
    params?: RootRestaurant[keyof RootRestaurant];
  };
  ReservationRoutes: {
    screen: keyof RootReservation;
    params?: RootReservation[keyof RootReservation];
  };
  StoreRoutes: {
    screen: keyof RootStore;
    params?: RootStore[keyof RootStore];
  };
  CustomerRoutes: {
    screen: keyof RootCustomer;
    params?: RootCustomer[keyof RootCustomer];
  };
  SettingRoutes: {
    screen: keyof RootSetting;
    params?: RootSetting[keyof RootSetting];
  };
  InventoryRoutes: {
    screen: keyof RootInventory;
    params?: RootInventory[keyof RootInventory];
  };
  StatisticsRoutes: {
    screen: keyof RootStatistics;
    params?: RootStatistics[keyof RootStatistics];
  };
};

export type AppNavigationProp = { navigation: DrawerNavigationProp<RootApp> };
export type AppRouteProp<RouteName extends keyof RootApp> = RouteProp<RootApp, RouteName>;

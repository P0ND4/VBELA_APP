import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Group, Location } from "../data/common";
import { Element } from "../data/common/element.entity";
import { Order, PaymentMethod } from "../data/common/order.entity";
import { Table } from "../data/restaurants";

interface ScreenOrder {
  restaurantID: string;
  tableID?: string;
}

interface Create extends ScreenOrder {
  defaultValue?: Order;
}

interface Multiple extends ScreenOrder {
  paymentMethod: PaymentMethod;
}

type Provider = {
  CreateOrder: Create;
  PreviewOrder: Create;
  OrderPayment: ScreenOrder;
  MultiplePayment: Multiple;
};

type NoProvider = {
  MenuTab: { restaurantID: string; defaultValue?: Element };
  Table: { restaurantID: string };
  OrderCompleted: { sale: Order };
  CreateRestaurant: { restaurant?: Location };
  CreateTable: { restaurantID: string; defaultValue?: Table };
  CreateGroup: { restaurantID: string; group?: Group };
  Invoice: { sale: Order };
};

export type RootRestaurant = Provider &
  NoProvider & {
    RestaurantRoutes: {
      screen: keyof NoProvider;
      params?: NoProvider[keyof NoProvider];
    };
    ProviderRestaurantRoutes: {
      screen: keyof Provider;
      params?: Provider[keyof Provider];
    };
  };

export type RestaurantNavigationProp = { navigation: StackNavigationProp<RootRestaurant> };
export type RestaurantRouteProp<RouteName extends keyof RootRestaurant> = RouteProp<
  RootRestaurant,
  RouteName
>;

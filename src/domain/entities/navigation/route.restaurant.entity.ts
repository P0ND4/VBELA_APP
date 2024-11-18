import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Location } from "../data/common";
import { Element } from "../data/common/element.entity";
import { Order, PaymentMethod } from "../data/common/order.entity";
import { Table } from "../data/restaurants";

type Provider = {
  CreateOrder: { restaurantID: string };
  PreviewOrder: { restaurantID: string };
  OrderPayment: undefined;
  MultiplePayment: { paymentMethod: PaymentMethod };
};

type NoProvider = {
  MenuTab: { restaurantID: string; defaultValue?: Element };
  Table: { restaurantID: string };
  OrderCompleted: { sale: Order };
  CreateRestaurant: { restaurant?: Location };
  CreateTable: { restaurantID: string; defaultValue?: Table };
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

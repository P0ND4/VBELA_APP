import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Order } from "../data/common";

export type RootOrder = {
  ProductViewOrder: { order: Order };
  MenuViewOrder: { order: Order };
};

export type OrderNavigationProp = { navigation: StackNavigationProp<RootOrder> };
export type OrderRouteProp<RouteName extends keyof RootOrder> = RouteProp<RootOrder, RouteName>;

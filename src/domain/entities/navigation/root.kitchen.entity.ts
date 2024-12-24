import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

export type RootKitchen = {
  Kitchen: undefined;
};

export type KitchenNavigationProp = { navigation: StackNavigationProp<RootKitchen> };
export type KitchenRouteProp<RouteName extends keyof RootKitchen> = RouteProp<
  RootKitchen,
  RouteName
>;

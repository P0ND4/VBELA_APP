import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

export type RootCustomer = {
  CreateCustomer: undefined;
  CustomerInformation: undefined;
};

export type CustomerNavigationProp = { navigation: StackNavigationProp<RootCustomer> };
export type CustomerRouteProp<RouteName extends keyof RootCustomer> = RouteProp<
  RootCustomer,
  RouteName
>;

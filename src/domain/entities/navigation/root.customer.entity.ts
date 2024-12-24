import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Customer } from "../data/customers";

export type RootCustomer = {
  CreateCustomer: undefined;
  CustomerInformation: { customer: Customer };
};

export type CustomerNavigationProp = { navigation: StackNavigationProp<RootCustomer> };
export type CustomerRouteProp<RouteName extends keyof RootCustomer> = RouteProp<
  RootCustomer,
  RouteName
>;

import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Supplier } from "../data";

export type RootSupplier = {
  SupplierEconomy: { supplierID: string };
  CreateSupplier: { supplier?: Supplier };
  SupplierInformation: { supplier: Supplier };
};

export type SupplierNavigationProp = { navigation: StackNavigationProp<RootSupplier> };
export type SupplierRouteProp<RouteName extends keyof RootSupplier> = RouteProp<
  RootSupplier,
  RouteName
>;

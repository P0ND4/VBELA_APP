import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Supplier } from "../data";
import { Economy } from "../data/suppliers/economy.entity";
import { Type } from "domain/enums/data/supplier/economy.enums";

export type RootSupplier = {
  EconomyInformation: { supplierID: string };
  CreateEconomy: { economy?: Economy; type: Type };
  CreateSupplier: { supplier?: Supplier };
  SupplierInformation: { supplier: Supplier };
};

export type SupplierNavigationProp = { navigation: StackNavigationProp<RootSupplier> };
export type SupplierRouteProp<RouteName extends keyof RootSupplier> = RouteProp<
  RootSupplier,
  RouteName
>;

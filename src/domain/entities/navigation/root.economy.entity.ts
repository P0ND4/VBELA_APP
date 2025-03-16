import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Economy } from "../data/suppliers/economy.entity";
import { Type } from "domain/enums/data/economy/economy.enums";

export type RootEconomy = {
  CreateEconomy: { economy?: Economy; type: Type };
  EconomyInformation: { economy: Economy };
};

export type EconomyNavigationProp = { navigation: StackNavigationProp<RootEconomy> };
export type EconomyRouteProp<RouteName extends keyof RootEconomy> = RouteProp<
  RootEconomy,
  RouteName
>;

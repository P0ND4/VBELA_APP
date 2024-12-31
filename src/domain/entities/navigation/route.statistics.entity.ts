import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Order } from "../data/common";
import { Kitchen } from "../data/kitchens";

export type RootStatistics = {
  Sale: { orders: Order[]; sales: Order[]; title: string };
  Production: { orders: Kitchen[] };
};

export type StatisticsNavigationProp = { navigation: StackNavigationProp<RootStatistics> };
export type StatisticsRouteProp<RouteName extends keyof RootStatistics> = RouteProp<
  RootStatistics,
  RouteName
>;

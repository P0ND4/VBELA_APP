import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Order } from "../data/common";
import { Kitchen } from "../data/kitchens";
import { DateType, PaymentMethodSummary } from "presentation/screens/statistic/Statistic";
import { Economy } from "../data";

export type RootStatistics = {
  Sale: { orders: Order[]; sales: Order[]; title: string };
  Production: { orders: Kitchen[] };
  Report: { orders: Order[]; sales: Order[]; date: DateType };
  PaymentMethod: { data: PaymentMethodSummary[] };
  TotalGain: { orders: Order[]; sales: Order[] };
  Indicators: { economies: Economy[] };
};

export type StatisticsNavigationProp = { navigation: StackNavigationProp<RootStatistics> };
export type StatisticsRouteProp<RouteName extends keyof RootStatistics> = RouteProp<
  RootStatistics,
  RouteName
>;

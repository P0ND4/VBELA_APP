import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Order } from "../data/common";
import { Kitchen } from "../data/kitchens";
import { Economy } from "../data";
import { DateType } from "presentation/components/layout/FullFilterDate";
import { PaymentMethodSummary } from "presentation/screens/statistic/hooks/useStatisticsData";

export type RootStatistics = {
  Sale: { orders: Order[]; sales: Order[]; title: string };
  Production: { orders: Kitchen[] };
  Report: {
    orders: Order[];
    sales: Order[];
    date: DateType;
    economies: Economy[];
  };
  PaymentMethod: { data: PaymentMethodSummary[] };
  TotalGain: { orders: Order[]; sales: Order[]; economies: Economy[] };
  Indicators: { economies: Economy[] };
};

export type StatisticsNavigationProp = { navigation: StackNavigationProp<RootStatistics> };
export type StatisticsRouteProp<RouteName extends keyof RootStatistics> = RouteProp<
  RootStatistics,
  RouteName
>;

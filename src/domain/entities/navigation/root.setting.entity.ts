import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { EconomicGroup, PaymentMethods } from "../data";

export type RootSetting = {
  Account: undefined;
  EconomicGroup: undefined;
  CreateEconomicGroup?: { defaultValue: EconomicGroup };
  PaymentMethods: undefined;
  CreatePaymentMethod?: { defaultValue: PaymentMethods };
  Theme: undefined;
  Invoice: undefined;
};

export type SettingNavigationProp = { navigation: StackNavigationProp<RootSetting> };
export type SettingRouteProp<RouteName extends keyof RootSetting> = RouteProp<
  RootSetting,
  RouteName
>;

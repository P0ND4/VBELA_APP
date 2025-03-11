import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { PaymentMethods } from "../data/settings/payment.methods.entity";

export type RootSetting = {
  Account: undefined;
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

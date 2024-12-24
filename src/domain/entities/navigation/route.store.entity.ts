import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Location } from "../data/common";
import { Element } from "../data/common/element.entity";
import { Order, PaymentMethod } from "../data/common/order.entity";

interface ScreenOrder {
  storeID: string;
}

interface Create extends ScreenOrder {
  defaultValue?: Order;
}

interface Multiple extends ScreenOrder {
  paymentMethod: PaymentMethod;
}

type Provider = {
  CreateOrder: Create;
  PreviewOrder: Create;
  OrderPayment: ScreenOrder;
  MultiplePayment: Multiple;
};

type NoProvider = {
  ProductTab: { storeID: string; defaultValue?: Element };
  OrderCompleted: { sale: Order };
  CreateStore: { store?: Location };
  Invoice: { sale: Order };
};

export type RootStore = Provider &
  NoProvider & {
    StoreRoutes: {
      screen: keyof NoProvider;
      params?: NoProvider[keyof NoProvider];
    };
    ProviderStoreRoutes: {
      screen: keyof Provider;
      params?: Provider[keyof Provider];
    };
  };

export type StoreNavigationProp = { navigation: StackNavigationProp<RootStore> };
export type StoreRouteProp<RouteName extends keyof RootStore> = RouteProp<RootStore, RouteName>;

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStore } from "domain/entities/navigation/route.store.entity";
import { OrderProvider } from "application/context/sales/OrderContext";
import CreateOrder from "presentation/screens/store/order/CreateOrder";
import PreviewOrder from "presentation/screens/store/order/PreviewOrder";
import OrderPayment from "presentation/screens/store/order/OrderPayment";
import MultiplePayment from "presentation/screens/store/order/MultiplePayment";

const Stack = createStackNavigator<RootStore>();

const ProviderStoreRoutes: React.FC = () => {
  return (
    <OrderProvider>
      <Stack.Navigator>
        <Stack.Screen name="CreateOrder" component={CreateOrder} />
        <Stack.Screen name="PreviewOrder" component={PreviewOrder} />
        <Stack.Screen name="OrderPayment" component={OrderPayment} />
        <Stack.Screen name="MultiplePayment" component={MultiplePayment} />
      </Stack.Navigator>
    </OrderProvider>
  );
};

export default ProviderStoreRoutes;

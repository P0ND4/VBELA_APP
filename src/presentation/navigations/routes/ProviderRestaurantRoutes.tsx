import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { OrderProvider } from "application/context/OrderContext";
import { RootRestaurant } from "domain/entities/navigation";
import CreateOrder from "presentation/screens/restaurant/order/CreateOrder";
import MultiplePayment from "presentation/screens/restaurant/order/MultiplePayment";
import PreviewOrder from "presentation/screens/restaurant/order/PreviewOrder";
import OrderPayment from "presentation/screens/restaurant/order/OrderPayment";

const Stack = createStackNavigator<RootRestaurant>();

const ProviderRestaurantRoutes: React.FC = () => {
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

export default ProviderRestaurantRoutes;

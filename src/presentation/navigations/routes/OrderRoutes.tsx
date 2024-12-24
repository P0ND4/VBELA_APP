import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootOrder } from "domain/entities/navigation";
import ProductViewOrder from "presentation/screens/order/product/ProductViewOrder";
import MenuViewOrder from "presentation/screens/order/menu/MenuViewOrder";

const Stack = createStackNavigator<RootOrder>();

const OrderRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductViewOrder" component={ProductViewOrder} />
      <Stack.Screen name="MenuViewOrder" component={MenuViewOrder} />
    </Stack.Navigator>
  );
};

export default OrderRoutes;

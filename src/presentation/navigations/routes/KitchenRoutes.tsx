import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootKitchen } from "domain/entities/navigation/root.kitchen.entity";
import Kitchen from "presentation/screens/kitchen/Kitchen";

const Stack = createStackNavigator<RootKitchen>();

const OrderRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Kitchen" component={Kitchen} />
    </Stack.Navigator>
  );
};

export default OrderRoutes;

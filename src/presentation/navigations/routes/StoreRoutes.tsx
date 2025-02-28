import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStore } from "domain/entities/navigation/route.store.entity";
import CreateStore from "presentation/screens/store/CreateStore";
import ProductTab from "presentation/screens/store/order/ProductTab";
import OrderCompleted from "presentation/screens/store/order/OrderCompleted";
import Invoice from "presentation/screens/store/order/Invoice";
import CreateGroup from "presentation/screens/store/group/CreateGroup";

const Stack = createStackNavigator<RootStore>();

const StoreRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CreateGroup" component={CreateGroup} />
      <Stack.Screen name="CreateStore" component={CreateStore} />
      <Stack.Screen name="ProductTab" component={ProductTab} />
      <Stack.Screen name="OrderCompleted" component={OrderCompleted} />
      <Stack.Screen name="Invoice" component={Invoice} />
    </Stack.Navigator>
  );
};

export default StoreRoutes;

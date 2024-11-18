import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootRestaurant } from "domain/entities/navigation";
import Table from "presentation/screens/restaurant/table/Table";
import CreateTable from "presentation/screens/restaurant/table/CreateTable";
import CreateRestaurant from "presentation/screens/restaurant/CreateRestaurant";
import OrderCompleted from "presentation/screens/restaurant/order/OrderCompleted";
import Invoice from "presentation/screens/restaurant/order/Invoice";
import MenuTab from "presentation/screens/restaurant/order/MenuTab";

const Stack = createStackNavigator<RootRestaurant>();

const RestaurantRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CreateRestaurant" component={CreateRestaurant} />
      <Stack.Screen name="CreateTable" component={CreateTable} />
      <Stack.Screen name="Table" component={Table} />
      <Stack.Screen name="MenuTab" component={MenuTab} />
      <Stack.Screen name="OrderCompleted" component={OrderCompleted} />
      <Stack.Screen name="Invoice" component={Invoice} />
    </Stack.Navigator>
  );
};

export default RestaurantRoutes;

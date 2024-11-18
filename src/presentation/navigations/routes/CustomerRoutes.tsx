import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootCustomer } from "domain/entities/navigation/root.customer.entity";
import CreateCustomer from "presentation/screens/customer/CreateCustomer";
import InformationTab from "presentation/screens/customer/information/InformationTab";

const Stack = createStackNavigator<RootCustomer>();

const CustomerRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CreateCustomer" component={CreateCustomer} />
      <Stack.Screen name="CustomerInformation" component={InformationTab} />
    </Stack.Navigator>
  );
};

export default CustomerRoutes;

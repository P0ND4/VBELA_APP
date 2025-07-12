import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootEconomy } from "domain/entities/navigation/root.economy.entity";
import CreateEconomy from "presentation/screens/economy/CreateEconomy";
import EconomyInformation from "presentation/screens/economy/EconomyInformation";
import GroupInformation from "presentation/screens/economy/GroupInformation";

const Stack = createStackNavigator<RootEconomy>();

const EconomyRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CreateEconomy" component={CreateEconomy} />
      <Stack.Screen name="EconomyInformation" component={EconomyInformation} />
      <Stack.Screen name="GroupInformation" component={GroupInformation} />
    </Stack.Navigator>
  );
};

export default EconomyRoutes;

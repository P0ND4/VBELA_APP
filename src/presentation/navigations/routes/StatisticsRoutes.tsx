import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStatistics } from "domain/entities/navigation";
import Sale from "presentation/screens/statistic/sale/Sale";
import Production from "presentation/screens/statistic/production/Production";

const Stack = createStackNavigator<RootStatistics>();

const StatisticsRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Sale" component={Sale} />
      <Stack.Screen name="Production" component={Production} options={{ title: "Producción" }} />
    </Stack.Navigator>
  );
};

export default StatisticsRoutes;

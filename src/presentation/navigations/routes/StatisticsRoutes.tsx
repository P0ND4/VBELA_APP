import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStatistics } from "domain/entities/navigation";
import Sale from "presentation/screens/statistic/sale/Sale";
import Production from "presentation/screens/statistic/production/Production";
import Report from "presentation/screens/statistic/report/Report";
import PaymentMethod from "presentation/screens/statistic/payment/PaymentMethod";
import TotalGain from "presentation/screens/statistic/gain/TotalGain";
import Indicators from "presentation/screens/statistic/economy/Indicators";

const Stack = createStackNavigator<RootStatistics>();

const StatisticsRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Sale" component={Sale} />
      <Stack.Screen name="Production" component={Production} options={{ title: "Producción" }} />
      <Stack.Screen name="Report" component={Report} options={{ title: "Reporte de ventas" }} />
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethod}
        options={{ title: "Medio de pagos" }}
      />
      <Stack.Screen name="TotalGain" component={TotalGain} options={{ title: "Ganancia total" }} />
      <Stack.Screen
        name="Indicators"
        component={Indicators}
        options={{ title: "Indicadores: Centro de costo/ventas" }}
      />
    </Stack.Navigator>
  );
};

export default StatisticsRoutes;

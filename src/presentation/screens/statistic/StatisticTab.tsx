import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import SalesBalancing from "./SalesBalancing";
import Statistic from "./Statistic";

const Tab = createMaterialTopTabNavigator();

const StatisticTab = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="CUADRE DE VENTAS" component={SalesBalancing} />
      <Tab.Screen name="INFORMACIÓN" component={Statistic} />
    </Tab.Navigator>
  );
};

export default StatisticTab;

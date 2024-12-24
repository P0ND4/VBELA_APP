import React from "react";
import { View, Text } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Layout from "presentation/components/layout/Layout";

const Tab = createMaterialTopTabNavigator();

const Delivery = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="PARA ENTREGAR"
        options={
          {
            //   tabBarBadge: () => processing.length > 0 && <BadgeIcon count={processing.length} />,
          }
        }
      >
        {(props) => <View></View>}
      </Tab.Screen>
      <Tab.Screen
        name="ENVIADO"
        options={
          {
            //   tabBarBadge: () => finished.length > 0 && <BadgeIcon count={finished.length} />,
          }
        }
      >
        {(props) => <View></View>}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default Delivery;

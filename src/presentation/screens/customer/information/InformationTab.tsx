import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CreationForm from "../common/CreationForm";

const Tab = createMaterialTopTabNavigator();

const InformationTab = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="DATOS"
        component={() => <CreationForm disable={{ switchAgency: true, switchContact: true }} />}
      />
      <Tab.Screen name="VENTAS" component={() => <View />} />
      <Tab.Screen name="PEDIDOS" component={() => <View />} />
      <Tab.Screen name="CUENTA" component={() => <View />} />
    </Tab.Navigator>
  );
};

export default InformationTab;

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootSupplier } from "domain/entities/navigation/root.supplier.entity";
import CreateSupplier from "presentation/screens/supplier/CreateSupplier";
import SupplierInformation from "presentation/screens/supplier/SupplierInformation";
import CreateEconomy from "presentation/screens/supplier/economy/CreateEconomy";
import EconomyInformation from "presentation/screens/supplier/economy/EconomyInformation";

const Stack = createStackNavigator<RootSupplier>();

const SupplierRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CreateEconomy" component={CreateEconomy} />
      <Stack.Screen
        name="EconomyInformation"
        component={EconomyInformation}
        options={{ title: "Movimientos" }}
      />
      <Stack.Screen
        name="CreateSupplier"
        component={CreateSupplier}
        options={{ title: "Crear proveedor" }}
      />
      <Stack.Screen name="SupplierInformation" component={SupplierInformation} />
    </Stack.Navigator>
  );
};

export default SupplierRoutes;

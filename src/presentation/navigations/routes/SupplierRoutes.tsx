import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootSupplier } from "domain/entities/navigation/root.supplier.entity";
import CreateSupplier from "presentation/screens/supplier/CreateSupplier";
import SupplierInformation from "presentation/screens/supplier/SupplierInformation";
import SupplierEconomy from "presentation/screens/supplier/SupplierEconomy";

const Stack = createStackNavigator<RootSupplier>();

const SupplierRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CreateSupplier"
        component={CreateSupplier}
        options={{ title: "Crear proveedor" }}
      />
      <Stack.Screen name="SupplierInformation" component={SupplierInformation} />
      <Stack.Screen
        name="SupplierEconomy"
        component={SupplierEconomy}
        options={{ title: "Movimientos" }}
      />
    </Stack.Navigator>
  );
};

export default SupplierRoutes;

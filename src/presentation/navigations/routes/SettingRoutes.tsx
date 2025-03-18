import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootSetting } from "domain/entities/navigation/root.setting.entity";
import Account from "presentation/screens/setting/Account";
import PaymentMethods from "presentation/screens/setting/paymentMethods/PaymentMethods";
import CreatePaymentMethod from "presentation/screens/setting/paymentMethods/CreatePaymentMethod";
import Theme from "presentation/screens/setting/Theme";
import Invoice from "presentation/screens/setting/Invoice";
import EconomicGroup from "presentation/screens/setting/economicGroup/EconomicGroup";
import CreateEconomicGroup from "presentation/screens/setting/economicGroup/CreateEconomicGroup";

const Stack = createStackNavigator<RootSetting>();

const SettingRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Account" component={Account} options={{ title: "Cuenta" }} />
      <Stack.Group>
        <Stack.Screen
          name="EconomicGroup"
          component={EconomicGroup}
          options={{ title: "Categoría de ingreso/egreso" }}
        />
        <Stack.Screen
          name="CreateEconomicGroup"
          component={CreateEconomicGroup}
          options={{ title: "Crear Categoría de ingreso/egreso" }}
        />
      </Stack.Group>

      <Stack.Group>
        <Stack.Screen
          name="PaymentMethods"
          component={PaymentMethods}
          options={{ title: "Métodos de pago" }}
        />
        <Stack.Screen
          name="CreatePaymentMethod"
          component={CreatePaymentMethod}
          options={{ title: "Crear método de pago" }}
        />
      </Stack.Group>
      <Stack.Screen name="Theme" component={Theme} options={{ title: "Tema" }} />
      <Stack.Screen
        name="Invoice"
        component={Invoice}
        options={{ title: "Información de factura" }}
      />
    </Stack.Navigator>
  );
};

export default SettingRoutes;

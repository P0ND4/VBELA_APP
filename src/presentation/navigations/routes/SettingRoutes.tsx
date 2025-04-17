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
import TipTax from "presentation/screens/setting/TipTax";
import Statistic from "presentation/screens/setting/Statistic";

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
          options={{ title: "Crear categoría de ingreso/egreso" }}
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
      <Stack.Screen
        name="TipTax"
        component={TipTax}
        options={{ title: "Propina/Impuestos de pedidos" }}
      />
      <Stack.Screen
        name="Statistic"
        component={Statistic}
        options={{ title: "Configuración de estadística" }}
      />
    </Stack.Navigator>
  );
};

export default SettingRoutes;

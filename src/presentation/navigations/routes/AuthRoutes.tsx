import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootAuth } from "domain/entities/navigation";

import SignIn from "presentation/screens/auth/SignIn";
import EmailSignIn from "presentation/screens/auth/email/EmailSignIn";
import PhoneSignIn from "presentation/screens/auth/phone/PhoneSignIn";
import EmailVerification from "presentation/screens/auth/email/EmailVerification";
import PhoneVerification from "presentation/screens/auth/phone/PhoneVerification";
import UserSelection from "presentation/screens/auth/UserSelection";

const Stack = createStackNavigator<RootAuth>();

const AuthRoutes: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
      <Stack.Screen
        name="UserSelection"
        component={UserSelection}
        options={{ title: "Selección de usuario" }}
      />
      <Stack.Screen
        name="EmailSignIn"
        component={EmailSignIn}
        options={{ title: "Ingresar con: Correo electrónico" }}
      />
      <Stack.Screen
        name="PhoneSignIn"
        component={PhoneSignIn}
        options={{ title: "Ingresar con: Número de teléfono" }}
      />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerification}
        options={{ title: "Verificación: Correo electrónico" }}
      />
      <Stack.Screen
        name="PhoneVerification"
        component={PhoneVerification}
        options={{ title: "Verificación: Número de teléfono" }}
      />
    </Stack.Navigator>
  );
};

export default AuthRoutes;

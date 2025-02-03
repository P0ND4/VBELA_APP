import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

export type RootAuth = {
  SignIn: undefined;
  PhoneSignIn: undefined;
  EmailSignIn: undefined;
  EmailVerification: { email: string };
  PhoneVerification: { phone: string };
  UserSelection: undefined;
};

export type AuthNavigationProp = { navigation: StackNavigationProp<RootAuth> };
export type AuthRouteProp<RouteName extends keyof RootAuth> = RouteProp<RootAuth, RouteName>;

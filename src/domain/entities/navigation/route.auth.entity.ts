import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

export type RootAuth = {
  SignIn: undefined;
  PhoneSignIn: undefined;
  EmailSignIn: undefined;
  EmailVerification: { value: string };
  PhoneVerification: { value: string };
  UserSelection: undefined;
};

export type AuthNavigationProp = { navigation: StackNavigationProp<RootAuth> };
export type AuthRouteProp<RouteName extends keyof RootAuth> = RouteProp<RootAuth, RouteName>;

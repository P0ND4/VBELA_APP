import React from "react";
import { Alert } from "react-native";
import { AuthNavigationProp, AuthRouteProp } from "domain/entities/navigation";
import apiClient, { endpoints } from "infrastructure/api/server";
import VerificationScreen from "../common/VerificationScreen";

type EmailVerificationProps = {
  navigation: AuthNavigationProp;
  route: AuthRouteProp<"EmailVerification">;
};

const EmailVerification: React.FC<EmailVerificationProps> = ({ route }) => {
  const email = route.params.email;

  const check = async (code: string) => {
    try {
      const res = await apiClient({
        url: endpoints.check.email(),
        method: "POST",
        data: { email, code },
      });
      return res?.status === "success";
    } catch (error) {
      Alert.alert("Error", `Hubo un error al comparar el código: ${error}`);
      return false;
    }
  };

  return (
    <VerificationScreen
      identifier={email}
      description={`Hemos enviado un código de verificación a tu correo electrónico ${email} (valido por 5 minutos)`}
      checkHandler={check}
    />
  );
};

export default EmailVerification;

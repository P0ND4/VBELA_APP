import React from "react";
import { Alert } from "react-native";
import { AuthNavigationProp, AuthRouteProp } from "domain/entities/navigation";
import apiClient, { endpoints } from "infrastructure/api/server";
import VerificationScreen from "../common/VerificationScreen";

type PhoneVerificationProps = {
  navigation: AuthNavigationProp;
  route: AuthRouteProp<"PhoneVerification">;
};

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ route }) => {
  const phone = route.params.phone;

  const check = async (code: string) => {
    try {
      const res = await apiClient({
        url: endpoints.check.phone(),
        method: "POST",
        data: { to: phone, code },
      });

      return res?.status === "success";
    } catch (error) {
      Alert.alert("Error", `Hubo un error al comparar el código: ${error}`);
      return false;
    }
  };

  return (
    <VerificationScreen
      identifier={phone}
      description={`Hemos enviado un código de verificación a tu número telefónico ${phone} (valido por 5 minutos)`}
      checkHandler={check}
    />
  );
};

export default PhoneVerification;

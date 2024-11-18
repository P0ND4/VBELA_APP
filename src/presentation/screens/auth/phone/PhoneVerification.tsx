import React from "react";
import VerificationScreen from "../common/VerificationScreen";
import { AuthNavigationProp, AuthRouteProp } from "domain/entities/navigation";

type PhoneVerificationProps = {
  navigation: AuthNavigationProp;
  route: AuthRouteProp<"PhoneVerification">;
};

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ route }) => {
  const value = route.params.value;

  return (
    <VerificationScreen
      description={`Hemos enviado un código de verificación a tu número telefónico ${value} (valido por 5 minutos)`}
    />
  );
};

export default PhoneVerification;

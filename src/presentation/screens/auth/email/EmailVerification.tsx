import React from "react";
import VerificationScreen from "../common/VerificationScreen";
import { AuthNavigationProp, AuthRouteProp } from "domain/entities/navigation";

type EmailVerificationProps = {
  navigation: AuthNavigationProp;
  route: AuthRouteProp<"EmailVerification">;
};

const EmailVerification: React.FC<EmailVerificationProps> = ({ route }) => {
  const value = route.params.value;

  return (
    <VerificationScreen
      description={`Hemos enviado un código de verificación a tu correo electrónico ${value} (valido por 5 minutos)`}
    />
  );
};

export default EmailVerification;

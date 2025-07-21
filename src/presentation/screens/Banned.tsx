import { Image } from "react-native";
import { useTheme } from "@react-navigation/native";
import React from "react";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import BannedImage from "presentation/assets/banned.gif";

const Banned = () => {
  const { colors } = useTheme();

  return (
    <Layout style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
      <Image source={BannedImage} style={{ width: 200, height: 200 }} />
      <StyledText smallTitle bold style={{ marginBottom: 16 }} color={colors.primary}>
        Acceso restringido
      </StyledText>
      <StyledText bigParagraph center>
        Tu cuenta ha sido baneada y no puedes utilizar la aplicación. Si crees que esto es un error,
        por favor contacta al soporte.
      </StyledText>
    </Layout>
  );
};

export default Banned;

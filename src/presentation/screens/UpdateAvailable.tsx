import { Image } from "react-native";
import { useTheme } from "@react-navigation/native";
import React from "react";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import UpdateAvailableImage from "presentation/assets/update-available.gif";
import StyledButton from "presentation/components/button/StyledButton";

const UpdateAvailable = () => {
  const { colors } = useTheme();

  const handleUpdate = () => {};

  return (
    <Layout style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
      <Image source={UpdateAvailableImage} style={{ width: 200, height: 200 }} />
      <StyledText smallTitle bold style={{ marginBottom: 16 }} color={colors.primary}>
        ¡Actualización disponible!
      </StyledText>
      <StyledText bigParagraph center>
        Hay una nueva versión de la aplicación. Actualiza ahora para disfrutar de las últimas
        funciones y mejoras.
      </StyledText>
      <StyledButton
        auto
        backgroundColor={colors.primary}
        onPress={handleUpdate}
        style={{ marginTop: 20 }}
      >
        <StyledText bold color="#FFFFFF">
          Actualizar ahora
        </StyledText>
      </StyledButton>
    </Layout>
  );
};

export default UpdateAvailable;

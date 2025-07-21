import { Image } from "react-native";
import { useTheme } from "@react-navigation/native";
import React from "react";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import MaintenanceImage from "presentation/assets/maintenance.gif";

const Maintenance = () => {
  const { colors } = useTheme();

  return (
    <Layout style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
      <Image source={MaintenanceImage} style={{ width: 200, height: 200 }} />
      <StyledText smallTitle bold style={{ marginBottom: 16 }} color={colors.primary}>
        Mantenimiento en progreso
      </StyledText>
      <StyledText bigParagraph center>
        Estamos realizando mejoras en la aplicación. Por favor, vuelve a intentarlo más tarde.
      </StyledText>
    </Layout>
  );
};

export default Maintenance;

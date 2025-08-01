import { Image, Linking } from "react-native";
import { useTheme } from "@react-navigation/native";
import React from "react";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import UpdateAvailableImage from "presentation/assets/update-available.gif";
import StyledButton from "presentation/components/button/StyledButton";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList, StackParamListRouteProp } from "domain/entities/navigation";

type UpdateAvailableProps = {
  navigation: StackNavigationProp<RootStackParamList>;
  route: StackParamListRouteProp<"UpdateAvailable">;
};

const UpdateAvailable: React.FC<UpdateAvailableProps> = ({ route }) => {
  const { colors } = useTheme();
  const { version, url } = route.params;

  const handleUpdate = (url: string) => url && Linking.openURL(url);

  return (
    <Layout style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
      <Image source={UpdateAvailableImage} style={{ width: 200, height: 200 }} />
      <StyledText smallTitle bold center style={{ marginBottom: 16 }} color={colors.primary}>
        ¡Actualización disponible! v{version}
      </StyledText>
      <StyledText bigParagraph center>
        Hay una nueva versión de la aplicación. Actualiza ahora para disfrutar de las últimas
        funciones y mejoras.
      </StyledText>
      <StyledButton
        auto
        backgroundColor={colors.primary}
        onPress={() => handleUpdate(url)}
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

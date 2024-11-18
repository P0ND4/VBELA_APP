import React from "react";
import { View, StyleSheet, Image, ScrollView, ImageSourcePropType } from "react-native";
import { useTheme } from "@react-navigation/native";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Layout from "presentation/components/layout/Layout";
import { AuthNavigationProp, AuthRouteProp } from "domain/entities/navigation";

type UserSelectionProps = {
  navigation: AuthNavigationProp;
  route: AuthRouteProp<"UserSelection">;
};

type CardProps = {
  source: ImageSourcePropType;
  title: string;
  description: string;
  type: string;
};

const UserSelection: React.FC<UserSelectionProps> = () => {
  const { colors } = useTheme();

  const sendInformation = (type: string) => {};

  const Card: React.FC<CardProps> = ({ source, title, description, type }) => {
    return (
      <StyledButton style={styles.card} onPress={() => sendInformation(type)}>
        <StyledText subtitle center color={colors.primary}>
          {title}
        </StyledText>
        <Image source={source} style={{ width: 80, height: 80 }} />
        <StyledText smallParagraph justify>
          {description}
        </StyledText>
      </StyledButton>
    );
  };

  return (
    <Layout>
      <View style={{ marginBottom: 10 }}>
        <StyledText subtitle center color={colors.primary}>
          ¿Que prefieres?
        </StyledText>
        <StyledText center smallParagraph style={{ marginTop: 10 }}>
          Queremos conocer tus preferencias y el propósito de uso de la aplicación. Por favor, elige
          la opción que mejor se adapte a tus necesidades.
        </StyledText>
      </View>
      <View style={{ alignItems: "center", maxHeight: 620 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Card
            title="Ventas"
            source={require("presentation/assets/auth/selection/trade.png")}
            description="Excelente para negocios, registro de ventas, y restaurantes"
            type="trade"
          />
          <Card
            title="Alojamiento"
            source={require("presentation/assets/auth/selection/reservation.png")}
            description="Buena para el manejo de hoteleros, inquilinos o resort"
            type="reservation"
          />
          <Card
            title="Alojamiento + Ventas"
            source={require("presentation/assets/auth/selection/both.png")}
            description="Esta opción incluye las dos opciones anteriores"
            type="both"
          />
        </ScrollView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 260,
    height: 190,
    marginVertical: 5,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default UserSelection;

import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { changeDate } from "shared/utils";
import { useTheme } from "@react-navigation/native";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppNavigationProp } from "domain/entities/navigation";

const Accommodation: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <Layout>
      <View style={styles.row}>
        <StyledButton backgroundColor={colors.primary} style={{ width: "auto" }} onPress={() => {}}>
          <StyledText center smallParagraph color="#FFFFFF">
            Crear reserva
          </StyledText>
        </StyledButton>
        <TouchableOpacity
          onPress={() => navigation.navigate("ReservationRoutes", { screen: "CreateZone" })}
        >
          <Ionicons name="add-circle" color={colors.primary} size={35} />
        </TouchableOpacity>
      </View>
      <View style={[{ marginVertical: 15 }, styles.row]}>
        <StyledButton
          style={{ width: "auto", paddingHorizontal: 12 }}
          onPress={() => navigation.navigate("ReservationRoutes", { screen: "PlaceInformation" })}
        >
          <StyledText verySmall center>
            ALOJADOS
          </StyledText>
        </StyledButton>
        <StyledButton style={{ width: "auto", paddingHorizontal: 12 }} onPress={() => {}}>
          <StyledText verySmall center>
            RESERVAS
          </StyledText>
        </StyledButton>
        <StyledButton style={{ width: "auto", paddingHorizontal: 12 }} onPress={() => {}}>
          <StyledText verySmall center>
            UBICACIÓN
          </StyledText>
        </StyledButton>
        <StyledButton style={{ width: "auto", paddingHorizontal: 12 }} onPress={() => {}}>
          <StyledText verySmall center>
            HISTORIAL
          </StyledText>
        </StyledButton>
      </View>
      <View>
        <StyledText>ZONAS</StyledText>
        <StyledButton
          onLongPress={() => {}}
          onPress={() => {}}
          style={[styles.zone, { marginTop: 20 }]}
        >
          <View style={styles.row}>
            <StyledText color={colors.primary} smallSubtitle>
              Nombre
            </StyledText>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ReservationRoutes", { screen: "ZoneInformation" })
                }
              >
                <Ionicons size={30} color={colors.primary} name="information-circle-outline" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {}}>
                <Ionicons size={30} color={colors.primary} name="create-outline" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ marginBottom: 10 }}>
            <StyledText verySmall>Descripción: aqui va la descripcion</StyledText>
            <StyledText verySmall>Ubicación: locallizacion va aqui</StyledText>
          </View>
          <View style={styles.row}>
            <StyledText smallParagraph>
              Creación:{" "}
              <StyledText smallParagraph color={colors.primary}>
                {changeDate(new Date())}
              </StyledText>
            </StyledText>
            <StyledText smallParagraph>
              Alojados actuales:{" "}
              <StyledText smallParagraph color={colors.primary}>
                {0}
              </StyledText>
            </StyledText>
          </View>
        </StyledButton>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  zone: {
    padding: 14,
    borderRadius: 4,
    marginVertical: 4,
  },
});

export default Accommodation;

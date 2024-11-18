import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ReservationNavigationProp, ReservationRouteProp } from "domain/entities/navigation";
import { useTheme } from "@react-navigation/native";
import { changeDate, thousandsSystem } from "shared/utils";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";

type PlaceInformationProps = {
  navigation: ReservationNavigationProp;
  route: ReservationRouteProp<"PlaceInformation">;
};

const PlaceInformation: React.FC<PlaceInformationProps> = ({ route, navigation }) => {
  const { colors } = useTheme();

  // const zoneID = route.params.zoneID;
  // const nomenclatureID = route.params.nomenclatureID;

  return (
    <Layout style={styles.layout}>
      <View style={styles.row}>
        <StyledText smallTitle>Información</StyledText>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="create-outline" size={36} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <StyledText smallSubtitle color={colors.primary}>
        Nomenclatura
      </StyledText>
      <View style={{ marginVertical: 30 }}>
        <StyledText>
          Dinero total: <StyledText color={colors.primary}>{thousandsSystem("0")}</StyledText>
        </StyledText>
        <StyledText>
          Personas reservadas:{" "}
          <StyledText color={colors.primary}>{thousandsSystem("0")}</StyledText>
        </StyledText>
        <StyledText>
          Total de días reservado:{" "}
          <StyledText color={colors.primary}>{thousandsSystem("0")}</StyledText>
        </StyledText>
        <StyledText>
          Ultima actualización:{" "}
          <StyledText color={colors.primary}>{changeDate(new Date())}</StyledText>
        </StyledText>
        <StyledText>
          Fecha de creación:{" "}
          <StyledText color={colors.primary}>{changeDate(new Date())}</StyledText>
        </StyledText>
      </View>
      <StyledButton backgroundColor={colors.primary} onPress={() => {}}>
        <StyledText center color="#FFFFFF">
          Eliminar nomenclatura
        </StyledText>
      </StyledButton>
    </Layout>
  );
};

const styles = StyleSheet.create({
  layout: {
    justifyContent: "center",
    padding: 30,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default PlaceInformation;

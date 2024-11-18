import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ReservationNavigationProp, ReservationRouteProp } from "domain/entities/navigation";
import { useTheme } from "@react-navigation/native";
import { changeDate, thousandsSystem } from "shared/utils";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import StyledButton from "presentation/components/button/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";

type ZoneInformationProps = {
  navigation: ReservationNavigationProp;
  route: ReservationRouteProp<"ZoneInformation">;
};

const ZoneInformation: React.FC<ZoneInformationProps> = ({ navigation, route }) => {
  const { colors } = useTheme();

  // const zoneID = route.params.zoneID;

  // useEffect(() => {
  //   navigation.setOptions({ title: zone?.name });
  // }, [zone]);

  return (
    <Layout style={styles.layout}>
      <View style={styles.row}>
        <StyledText smallTitle>Información</StyledText>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="create-outline" size={36} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <StyledText smallSubtitle color={colors.primary}>
        Zona
      </StyledText>
      {/* {(zone?.description || zone?.location) && (
        <View style={{ marginTop: 14 }}>
          {zone?.description && <StyledText>{zone?.description}</StyledText>}
          {zone?.location && (
            <StyledText>
              Ubicacion: <StyledText color={colors.primary}>{zone?.location}</StyledText>
            </StyledText>
          )}
        </View>
      )} */}
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
      <StyledButton backgroundColor={colors.primary}>
        <StyledText center color="#FFFFFF">
          Eliminar zona
        </StyledText>
      </StyledButton>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  layout: {
    justifyContent: "center",
    padding: 30,
  },
});

export default ZoneInformation;

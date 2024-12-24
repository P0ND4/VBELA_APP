import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Location } from "domain/entities/data/common";
import { useTheme } from "@react-navigation/native";
import { changeDate } from "shared/utils";
import InformationModal from "presentation/components/modal/InformationModal";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "presentation/components/text/StyledText";
import { Inventory } from "domain/entities/data/inventories";

type LocationInformationProps = {
  visible: boolean;
  onClose: () => void;
  onPressEdit: () => void;
  onPressDelete: () => void;
  location: Location;
};

const LocationInformation: React.FC<LocationInformationProps> = ({
  visible,
  location,
  onClose,
  onPressEdit,
  onPressDelete,
}) => {
  const { colors } = useTheme();

  return (
    <InformationModal
      title="Información"
      visible={visible}
      animationType="fade"
      onClose={onClose}
      headerRight={() => (
        <>
          <TouchableOpacity onPress={onPressDelete}>
            <Ionicons name="trash-outline" color={colors.text} size={30} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressEdit}>
            <Ionicons name="create-outline" color={colors.text} size={30} style={styles.icon} />
          </TouchableOpacity>
        </>
      )}
    >
      <View style={{ marginTop: 10 }}>
        <StyledText>
          Nombre: <StyledText color={colors.primary}>{location.name}</StyledText>
        </StyledText>
        {location.description && (
          <StyledText>
            Descripción: <StyledText color={colors.primary}>{location.description}</StyledText>
          </StyledText>
        )}
        {!!location.inventories?.length && (
          <StyledText>
            Inventario: <StyledText color={colors.primary}></StyledText>
          </StyledText>
        )}
        <StyledText>
          Fecha de creación:{" "}
          <StyledText color={colors.primary}>
            {changeDate(new Date(location.creationDate), true)}
          </StyledText>
        </StyledText>
        <StyledText>
          Fecha de modificación:{" "}
          <StyledText color={colors.primary}>
            {changeDate(new Date(location.modificationDate), true)}
          </StyledText>
        </StyledText>
      </View>
    </InformationModal>
  );
};

const styles = StyleSheet.create({
  icon: { marginHorizontal: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default LocationInformation;

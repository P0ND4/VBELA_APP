import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import InformationModal from "presentation/components/modal/InformationModal";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "presentation/components/text/StyledText";
import { changeDate } from "shared/utils";
import { Table } from "domain/entities/data/restaurants";

type TableInformationProps = {
  visible: boolean;
  table: Table;
  onClose: () => void;
  onPressDelete: () => void;
  onPressEdit: () => void;
};

const TableInformation: React.FC<TableInformationProps> = ({
  visible,
  table,
  onClose,
  onPressDelete,
  onPressEdit,
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
          Nombre: <StyledText color={colors.primary}>{table.name}</StyledText>
        </StyledText>
        <StyledText>
          Descripción: <StyledText color={colors.primary}>{table.description}</StyledText>
        </StyledText>
        <StyledText>
          Dinero recolectado: <StyledText color={colors.primary}>0</StyledText>
        </StyledText>
        <StyledText>
          Fecha de creación:{" "}
          <StyledText color={colors.primary}>
            {changeDate(new Date(table.creationDate), true)}
          </StyledText>
        </StyledText>
        <StyledText>
          Fecha de modificación:{" "}
          <StyledText color={colors.primary}>
            {changeDate(new Date(table.modificationDate), true)}
          </StyledText>
        </StyledText>
      </View>
    </InformationModal>
  );
};

const styles = StyleSheet.create({
  icon: { marginHorizontal: 2 },
});

export default TableInformation;

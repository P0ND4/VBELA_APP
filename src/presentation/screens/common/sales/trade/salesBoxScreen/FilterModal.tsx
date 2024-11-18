import React from "react";
import { useTheme } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";
import Layout from "presentation/components/layout/Layout";
import ScreenModal from "presentation/components/modal/ScreenModal";
import StyledText from "presentation/components/text/StyledText";
import { StyleSheet } from "react-native";

type ModalProps = {
  visible: boolean;
  onClose: () => void;
};

const FilterModal: React.FC<ModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  return (
    <ScreenModal title="Filtro" visible={visible} onClose={onClose}>
      <Layout>
        <StyledButton style={styles.row}>
          <StyledText>Categoría</StyledText>
          <Ionicons name="chevron-forward" color={colors.text} size={19} />
        </StyledButton>
        <StyledButton style={styles.row}>
          <StyledText>Sub - Categoría</StyledText>
          <Ionicons name="chevron-forward" color={colors.text} size={19} />
        </StyledButton>
      </Layout>
    </ScreenModal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default FilterModal;

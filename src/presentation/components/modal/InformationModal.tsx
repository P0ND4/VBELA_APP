import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ModalProps,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "../text/StyledText";

interface InformationModalProps extends ModalProps {
  title: string;
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
  headerRight?: () => React.ReactNode;
  downCard?: () => React.ReactNode;
}

const InformationModal: React.FC<InformationModalProps> = ({
  title,
  visible,
  children,
  onClose,
  headerRight = () => <></>,
  downCard = () => <></>,
  ...rest
}) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} {...rest}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#0005" }]} />
      </TouchableWithoutFeedback>
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.row}>
            <StyledText bigParagraph>{title}</StyledText>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {headerRight()}
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" color={colors.text} size={30} />
              </TouchableOpacity>
            </View>
          </View>
          {children}
        </View>
        {downCard()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  card: {
    width: "80%",
    borderRadius: 4,
    padding: 15,
  },
});

export default InformationModal;

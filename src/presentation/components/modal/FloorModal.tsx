import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ModalProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import StyledText from "../text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";

interface FloorModalProps extends ModalProps {
  onClose: () => void;
  title: string;
  visible: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const FloorModal: React.FC<FloorModalProps> = ({
  onClose,
  visible,
  children,
  title,
  style,
  ...rest
}) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="fade" transparent {...rest}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#0005" }]} />
      </TouchableWithoutFeedback>
      <View style={[styles.container, style, { backgroundColor: colors.background }]}>
        <View style={styles.row}>
          <StyledText bigParagraph>{title}</StyledText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" color={colors.text} size={30} />
          </TouchableOpacity>
        </View>
        {children}
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
    width: "100%",
    height: "90%",
    position: "absolute",
    bottom: 0,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default FloorModal;

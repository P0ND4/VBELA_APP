import React from "react";
import { View, Modal, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "../text/StyledText";

type ScreenModalProps = {
  title: string;
  visible: boolean;
  children?: React.ReactNode;
  onClose: () => void;
  headerRight?: () => React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const ScreenModal: React.FC<ScreenModalProps> = ({
  title,
  visible,
  children,
  onClose,
  headerRight = () => <></>,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.left}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back-outline" size={23} style={styles.icon} color={colors.text} />
          </TouchableOpacity>
          <StyledText style={styles.title}>{title}</StyledText>
        </View>
        {headerRight()}
      </View>
      <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>{children}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  icon: {
    alignItems: "center",
    marginLeft: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  title: { marginLeft: 30, fontSize: 20 },
  left: { flexDirection: "row", alignItems: "center" },
});

export default ScreenModal;

import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";

const styles = StyleSheet.create({
  default: {
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 4,
    width: "100%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});

type StyledButtonProps = {
  text?: string;
  auto?: boolean;
  noMargin?: boolean;
  noShadow?: boolean;
  noBorderRadius?: boolean;
  grow?: number;
  basis?: number;
  loading?: boolean;
  loadingColor?: string;
  backgroundColor?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  disable?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  enableDarkModeText?: boolean;
};

const StyledButton: React.FC<StyledButtonProps> = ({
  backgroundColor,
  auto,
  noMargin,
  noShadow,
  noBorderRadius,
  grow,
  basis,
  onPress,
  onLongPress,
  loading,
  loadingColor = "#FFFFFF",
  disable = false,
  children,
  style,
}) => {
  const { colors } = useTheme();
  const buttonStyles: StyleProp<ViewStyle> = [
    styles.default,
    {
      backgroundColor: backgroundColor || colors.card,
      opacity: !disable || loading ? 1 : 0.6,
      elevation: !disable || loading ? 1 : 0,
      flexGrow: grow,
      flexBasis: basis,
    },
    auto && { width: "auto" },
    noMargin && { marginVertical: 0 },
    noShadow && { elevation: 0 },
    noBorderRadius && { borderRadius: 0 },
    style,
  ];

  return (
    <TouchableOpacity
      disabled={disable || loading}
      style={buttonStyles}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {loading ? <ActivityIndicator size="small" color={loadingColor} /> : children && children}
    </TouchableOpacity>
  );
};

export default StyledButton;

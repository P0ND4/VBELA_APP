import React from "react";
import { useTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleProp, View, ViewStyle } from "react-native";

type StyledButtonProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const Layout: React.FC<StyledButtonProps> = ({ style, children }) => {
  const { colors } = useTheme();

  return (
    <View style={[{ flex: 1, padding: 20 }, style]}>
      <StatusBar style="auto" backgroundColor={colors.notification} />
      {children}
    </View>
  );
};

export default Layout;

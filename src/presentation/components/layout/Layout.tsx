import React from "react";
import { useTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleProp, ViewStyle } from "react-native";

type StyledButtonProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const Layout: React.FC<StyledButtonProps> = ({ style, children }) => {
  const { colors, dark } = useTheme();

  return (
    <SafeAreaView style={[{ flex: 1, padding: 20 }, style]}>
      <StatusBar style={dark ? "light" : "dark"} backgroundColor={colors.notification} />
      {children}
    </SafeAreaView>
  );
};

export default Layout;

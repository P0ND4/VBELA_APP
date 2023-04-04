import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useSelector } from "react-redux";
import theme from "../theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const Layout = ({ style, children }) => {
  const mode = useSelector((state) => state.mode);

  return (
    <View
      style={[
        theme.styles.default,
        { backgroundColor: mode === "light" ? light.main4 : dark.main1 },
        style,
      ]}
    >
      <StatusBar
        style={mode === 'light' ? 'dark' : 'light'}
        backgroundColor={mode === "light" ? '#FFFFFF' : dark.main1}
      />
      {children}
    </View>
  );
};

export default Layout;

import { View, StyleSheet } from "react-native";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "@components/Layout";

import theme from "@theme";
import TextStyle from "@components/TextStyle";

const dark = theme.colors.dark;
const light = theme.colors.light;

const Inventory = () => {
  return (
    <Layout style={{ marginTop: 0 }}>
      <View style={styles.row}>
        <ButtonStyle></ButtonStyle>
        <View style={{ flexDirection: "row" }}></View>
      </View>
      <View>
        <TextStyle
          color={light.main2}
          center
          subtitle
          customStyle={{ marginTop: 10 }}
        >
          No hay ingredientes
        </TextStyle>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    marginHorizontal: 10,
  },
});

export default Inventory;
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { print, generatePDF, getFontSize } from "@helpers/libs";
import TextStyle from "@components/TextStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();

const Header = ({ rightIcon = () => {}, nomenclature, html }) => {
  const mode = useSelector((state) => state.mode);

  return (
    <>
      <View style={styles.row}>
        <TextStyle
          smallTitle
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Reservación
        </TextStyle>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => print({ html })}>
            <Ionicons
              name="print"
              size={getFontSize(28)}
              color={light.main2}
              style={{ marginHorizontal: 5 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => generatePDF({ html })}>
            <Ionicons
              name="document-attach"
              size={getFontSize(28)}
              color={light.main2}
              style={{ marginHorizontal: 5 }}
            />
          </TouchableOpacity>
          {rightIcon()}
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextStyle
          smallSubtitle
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Nomenclatura:{" "}
        </TextStyle>
        <TextStyle smallSubtitle color={light.main2}>
          {nomenclature}
        </TextStyle>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default Header;

import { View } from "react-native";
import { useSelector } from "react-redux";
import { months } from "@helpers/libs";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const Header = ({ type, nomenclature, year, month, day }) => {
  const mode = useSelector((state) => state.mode);

  return (
    <View style={{ width: "100%" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TextStyle
          smallTitle
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          {months[month]?.toUpperCase()}{" "}
          {("0" + day).slice(-2)}
        </TextStyle>
        <TextStyle smallTitle color={light.main2}>
          {year}
        </TextStyle>
      </View>
      <View style={{ flexDirection: "row" }}>
        <TextStyle
          bigParagraph
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          {nomenclature?.name || nomenclature?.nomenclature}
        </TextStyle>
        <TextStyle style={{ marginLeft: 5 }} bigParagraph color={light.main2}>
          {type}
        </TextStyle>
      </View>
    </View>
  );
};

export default Header;

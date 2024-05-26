import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { thousandsSystem } from "@helpers/libs";
import { useSelector } from "react-redux";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const FrontPage = ({
  containerStyle = {},
  headerStyle = {},
  footerStyle = {},
  name,
  quantity,
  reorder,
  value,
  unit,
  identifier,
  recipe,
}) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.header, { flexGrow: 1 }, headerStyle]}>
        <TextStyle smallParagraph color={textColor} center>
          {name}
        </TextStyle>
        {!recipe && (
          <View style={{ flexDirection: "row" }}>
            <TextStyle verySmall color={quantity < reorder ? "#F70000" : light.main2}>
              {thousandsSystem(quantity || "0")}/
            </TextStyle>
            <TextStyle verySmall color={textColor}>
              {thousandsSystem(reorder || "0")}
            </TextStyle>
          </View>
        )}
        {recipe && (
          <TextStyle verySmall color={textColor}>
            {recipe.toUpperCase().slice(0, 12) + (recipe.length > 12 ? "..." : "")}
          </TextStyle>
        )}
      </View>
      <View style={[styles.footer, footerStyle]}>
        <TextStyle verySmall>{identifier}</TextStyle>
        <View style={[styles.row, { flexWrap: "wrap" }]}>
          <TextStyle verySmall>{thousandsSystem(value || "0")}</TextStyle>
          <TextStyle verySmall>{unit}</TextStyle>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    minHeight: 40,
    backgroundColor: light.main2,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    padding: 6,
    justifyContent: "center",
  },
});

export default FrontPage;

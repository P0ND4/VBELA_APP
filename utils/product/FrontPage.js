import { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { thousandsSystem } from "@helpers/libs";
import { useSelector } from "react-redux";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const { light, dark } = theme();

const FrontPage = ({ name, quantity, reorder, value, unit, identifier, recipe }) => {
  const mode = useSelector(state => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <View style={styles.card}>
        <TextStyle smallParagraph color={textColor}>
          {name}
        </TextStyle>
        <View style={{ flexDirection: "row" }}>
          <TextStyle verySmall color={quantity < reorder ? "#F70000" : light.main2}>
            {quantity < 0 ? "-" : ""}
            {thousandsSystem(Math.abs(quantity))}/
          </TextStyle>
          <TextStyle verySmall color={textColor}>
            {thousandsSystem(reorder)}
          </TextStyle>
        </View>
        {recipe && (
          <TextStyle verySmall color={textColor}>
            {recipe.name.toUpperCase().slice(0, 12) + (recipe.name.length > 12 ? "..." : "")}
          </TextStyle>
        )}
      </View>
      <View
        style={[
          styles.footer,
          {
            width: Math.floor(SCREEN_WIDTH / 3.5),
            paddingHorizontal: 4,
          },
        ]}
      >
        <TextStyle verySmall>{identifier}</TextStyle>
        <View style={[styles.row, { flexWrap: "wrap" }]}>
          <TextStyle verySmall>{thousandsSystem(value)}</TextStyle>
          <TextStyle verySmall>{unit}</TextStyle>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    justifyContent: "center",
    alignItems: "center",
    height: "60%",
  },
  footer: {
    height: "40%",
    justifyContent: "center",
    backgroundColor: light.main2,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    paddingHorizontal: 14,
  },
});

export default FrontPage;

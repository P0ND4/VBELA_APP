import { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useSelector } from "react-redux";
import { getFontSize } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const { light, dark } = theme();

const PaymentButtons = ({
  value,
  setValue,
  type = "others",
  cardStyle = {},
  style = {},
  cardBackgroundColor,
}) => {
  const mode = useSelector((state) => state.mode);

  const getBackgroundColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);

  return (
    <View
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginVertical: 10,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={() => setValue("cash")}
        style={[
          styles.payOptions,
          cardStyle,
          {
            backgroundColor: value === "cash" ? light.main2 : cardBackgroundColor || backgroundColor,
          },
        ]}
      >
        <Ionicons
          name="cash"
          size={getFontSize(28)}
          color={value !== "cash" ? light.main2 : light.textDark}
          style={{ marginLeft: 5 }}
        />
        <TextStyle
          smallParagraph
          style={{ marginTop: 4 }}
          color={value !== "cash" ? light.main2 : light.textDark}
        >
          Efectivo
        </TextStyle>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.payOptions,
          cardStyle,
          {
            backgroundColor: value === "card" ? light.main2 : cardBackgroundColor || backgroundColor,
          },
        ]}
        onPress={() => setValue("card")}
      >
        <Ionicons
          name="card"
          size={getFontSize(28)}
          color={value !== "card" ? light.main2 : light.textDark}
          style={{ marginLeft: 5 }}
        />
        <TextStyle
          smallParagraph
          style={{ marginTop: 4 }}
          color={value !== "card" ? light.main2 : light.textDark}
        >
          Tarjeta
        </TextStyle>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.payOptions,
          cardStyle,
          {
            backgroundColor:
              value === "others" || value === "credit"
                ? light.main2
                : cardBackgroundColor || backgroundColor,
          },
        ]}
        onPress={() => {
          if (type === "others") setValue("others");
          if (type === "credit") setValue("credit");
        }}
      >
        <Ionicons
          name={type === "others" ? "browsers" : "timer"}
          size={getFontSize(28)}
          color={value === "others" || value === "credit" ? light.textDark : light.main2}
          style={{ marginLeft: 5 }}
        />
        <TextStyle
          smallParagraph
          style={{ marginTop: 4 }}
          color={value === "others" || value === "credit" ? light.textDark : light.main2}
        >
          {type === "others" ? "Otros" : "Crédito"}
        </TextStyle>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  payOptions: {
    padding: 8,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    width: Math.floor(SCREEN_WIDTH / 3.8),
    height: Math.floor(SCREEN_WIDTH / 5),
  },
});

export default PaymentButtons;

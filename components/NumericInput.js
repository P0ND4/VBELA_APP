import { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import TextStyle from "./TextStyle";
import theme from "../theme";

const light = theme.colors.light;

const NumericInput = ({ min = 0, max = 999, defaultNumber = 1 }) => {
  const [number, setNumber] = useState(defaultNumber);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          { borderBottomStartRadius: 8, borderTopStartRadius: 8 },
        ]}
        onPress={() => {
          if (number - 1 > min) setNumber(number - 1);
        }}
      >
        <TextStyle bigParagraph>-</TextStyle>
      </TouchableOpacity>
      <TextStyle customStyle={styles.box}>{number}</TextStyle>
      <TouchableOpacity
        style={[
          styles.button,
          { borderBottomEndRadius: 8, borderTopEndRadius: 8 },
        ]}
        onPress={() => {
          if (number + 1 < max) setNumber(number + 1);
        }}
      >
        <TextStyle bigParagraph>+</TextStyle>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4
  },
  button: {
    backgroundColor: light.main2,
    paddingVertical: 5,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    backgroundColor: light.main4,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
});

export default NumericInput;

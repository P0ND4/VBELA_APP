import { TouchableOpacity, View, StyleSheet } from "react-native";
import TextStyle from "./TextStyle";
import theme from "../theme";

const light = theme.colors.light;

const styles = StyleSheet.create({
  default: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: "100%",
    margin: 4,
  },
  elementsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const ButtonStyle = ({
  children,
  backgroundColor = light.main5,
  onPress,
  right,
  left,
  centerText = true,
  style,
}) => {
  const stylesTaken = [styles.default, { backgroundColor }, style];

  return (
    <TouchableOpacity style={stylesTaken} onPress={onPress}>
      {children && <TextStyle center={centerText}>{children}</TextStyle>}
      <View style={styles.elementsContainer}>
        {left && left()}
        {right && right()}
      </View>
    </TouchableOpacity>
  );
};

export default ButtonStyle;

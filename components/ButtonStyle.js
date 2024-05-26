import { TouchableOpacity, View, StyleSheet } from "react-native";
import theme from "@theme";

const { light } = theme();

const styles = StyleSheet.create({
  default: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: "100%",
    marginVertical: 4,
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
  onLongPress,
  right,
  left,
  disable = false,
  style,
}) => {
  const stylesTaken = [styles.default, { backgroundColor }, style];

  return (
    <TouchableOpacity disabled={disable} style={stylesTaken} onPress={onPress} onLongPress={onLongPress}>
      {children && children}
      <View style={styles.elementsContainer}>
        {left && left()}
        {right && right()}
      </View>
    </TouchableOpacity>
  );
};

export default ButtonStyle;

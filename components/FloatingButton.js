import { useState, useRef } from "react";
import { View, Animated, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { useSelector } from "react-redux";
import { getFontSize } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();

const FloatingButton = ({ style = {}, buttons = [], position = "bottom" }) => {
  const mode = useSelector((state) => state.mode);

  const [isOpen, setOpen] = useState(false);

  const animation = useRef(new Animated.Value(0)).current;

  const toogleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();

    setOpen(!isOpen);
  };

  const rotate = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
    ],
  };

  return (
    <View style={[{ position: "absolute", alignItems: "center" }, style]}>
      {buttons.map((item, index) => {
        const opacity = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0, 1],
        });

        const topBottom = position === "bottom" ? 1 : -1;

        const translateY = {
          transform: [
            { scale: animation },
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, topBottom * (50 + 44 * index)],
              }),
            },
          ],
        };

        return (
          <TouchableWithoutFeedback onPress={item.onPress} onLongPress={item.onLongPress}>
            <Animated.View
              style={[
                styles.button,
                styles.secondary,
                translateY,
                { opacity, backgroundColor: mode === "light" ? dark.main2 : light.main5 },
              ]}
            >
              <Ionicons
                name={item.name}
                size={item.size || getFontSize(15)}
                color={item.color || mode === "light" ? dark.textWhite : light.textColor}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        );
      })}
      <TouchableWithoutFeedback onPress={() => toogleMenu()}>
        <Animated.View style={[styles.button, styles.menu, rotate]}>
          <Ionicons name="add" size={getFontSize(15)} color="#FFFFFF" />
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 42 / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowRadius: 10,
    shadowColor: light.main2,
    shadowOpacity: 0.3,
    shadowOffset: { height: 10 },
  },
  menu: {
    backgroundColor: light.main2,
  },
  secondary: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
  },
});

export default FloatingButton;

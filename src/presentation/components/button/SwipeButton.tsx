import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";

const BUTTON_HEIGHT = 50;
const BUTTON_PADDING = 4;
const SWIPEABLE_DIMENSIONS = BUTTON_HEIGHT - 2 * BUTTON_PADDING;

const H_WAVE_RANGE = SWIPEABLE_DIMENSIONS + 2 * BUTTON_PADDING;

type SwipeButtonProps = { onSubmit: () => void };

const SwipeButton: React.FC<SwipeButtonProps> = ({ onSubmit = () => {} }) => {
  const { colors } = useTheme();

  const [containerWidth, setContainerWidth] = useState(0);
  const translationX = useSharedValue(0);
  const startX = useSharedValue(0);

  const H_SWIPE_RANGE = containerWidth - 2 * BUTTON_PADDING - SWIPEABLE_DIMENSIONS;

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translationX.value;
    })
    .onUpdate((e) => {
      translationX.value = Math.max(0, Math.min(H_SWIPE_RANGE, startX.value + e.translationX));
    })
    .onEnd(() => {
      if (translationX.value < containerWidth / 2 - SWIPEABLE_DIMENSIONS / 2)
        translationX.value = 0;
      else {
        translationX.value = withSpring(H_SWIPE_RANGE);
        runOnJS(onSubmit)();
      }
    });

  const swipeableStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }],
  }));

  const interpolateXInput = [0, H_SWIPE_RANGE];
  const swipeTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translationX.value, interpolateXInput, [0.8, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(
          translationX.value,
          interpolateXInput,
          [0, containerWidth / 2 - SWIPEABLE_DIMENSIONS],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const colorWave = useAnimatedStyle(() => ({
    width: H_WAVE_RANGE + translationX.value,
    opacity: interpolate(translationX.value, interpolateXInput, [0, 1]),
  }));

  return (
    <View
      style={[styles.swipeContainer, { borderColor: colors.card, borderWidth: 1 }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.colorWave, colorWave, { backgroundColor: colors.primary }]} />
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[swipeableStyle, styles.swipeable, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Animated.View>
      </GestureDetector>
      <Animated.Text style={[styles.swipeText, swipeTextStyle, { color: colors.text }]}>
        Deslice para confirmar
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    flexGrow: 1,
    height: BUTTON_HEIGHT,
    padding: BUTTON_PADDING,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BUTTON_HEIGHT,
  },
  swipeable: {
    height: SWIPEABLE_DIMENSIONS,
    width: SWIPEABLE_DIMENSIONS,
    borderRadius: SWIPEABLE_DIMENSIONS,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F",
    position: "absolute",
    left: BUTTON_PADDING,
    zIndex: 3,
  },
  colorWave: {
    position: "absolute",
    left: 0,
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_HEIGHT,
  },
  swipeText: {
    alignSelf: "center",
    fontSize: 18,
    zIndex: 2,
  },
});

export default SwipeButton;

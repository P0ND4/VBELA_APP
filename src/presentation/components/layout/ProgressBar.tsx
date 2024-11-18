import React, { useRef, useState, useEffect } from "react";
import { Animated, View, Modal, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import StyledText from "../text/StyledText";

interface ProgressProps {
  step?: number;
  steps?: number;
  height?: number;
  width?: number | string;
}

const Progress: React.FC<ProgressProps> = ({ step, steps, height }) => {
  const { colors } = useTheme();

  const [width, setWidth] = useState<number>(0);

  const animatedValue = useRef(new Animated.Value(-1000)).current;
  const reactive = useRef(new Animated.Value(-1000)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: reactive,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    reactive.setValue(-width + (width * step!) / steps!);
  }, [step, width]);

  return (
    <>
      <View
        onLayout={(e) => {
          const newWidth = e.nativeEvent.layout.width;
          setWidth(newWidth);
        }}
        style={{
          height,
          backgroundColor: colors.card,
          borderRadius: height,
          overflow: "hidden",
          width: "75%",
        }}
      >
        <Animated.View
          style={{
            height,
            backgroundColor: colors.primary,
            borderRadius: height,
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            transform: [{ translateX: animatedValue }],
          }}
        />
      </View>
      <StyledText center style={{ marginTop: 8 }}>
        {step}/{steps}
      </StyledText>
    </>
  );
};

interface ProgressBarProps extends ProgressProps {
  modalVisible: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  modalVisible,
  step = 1,
  steps = 10,
  height = 10,
}) => {
  const { colors } = useTheme();

  return (
    <Modal animationType="fade" transparent={true} visible={modalVisible}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StyledText bigTitle center color={colors.primary} style={{ marginBottom: 15 }}>
          VBELA
        </StyledText>
        <Progress step={step} steps={steps} height={height} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
});

export default ProgressBar;

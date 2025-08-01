import React, { useEffect, useRef } from "react";
import { useTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import StyledText from "../text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppSelector } from "application/store/hook";
import { InternetStatus } from "application/appState/internet/status.slice";
import { ServerStatus } from "application/appState/server/status.slice";

type Icons = keyof typeof Ionicons.glyphMap;

type BarProps = {
  color?: string;
  backgroundColor?: string;
  name: string;
  icon?: Icons;
  iconAnimation?: boolean;
};

const Bar: React.FC<BarProps> = ({ color, backgroundColor, name, icon, iconAnimation }) => {
  const { colors } = useTheme();

  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation;

    if (!iconAnimation) {
      rotation.setValue(0);
      return;
    }

    animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [iconAnimation]);

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.bar, { backgroundColor }]}>
      <StyledText color={color || colors.text}>{name}</StyledText>
      {icon && (
        <Animated.View
          style={[styles.iconWrapper, { transform: [{ rotate: rotateInterpolation }] }]}
        >
          <Ionicons name={icon} color={color || colors.text} size={18} />
        </Animated.View>
      )}
    </View>
  );
};

type StyledButtonProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const Layout: React.FC<StyledButtonProps> = ({ style, children }) => {
  const internetStatus = useAppSelector((state) => state.internetStatus);
  const serverStatus = useAppSelector((state) => state.serverStatus);
  const { colors, dark } = useTheme();

  return (
    <>
      {internetStatus.status === InternetStatus.Offline && (
        <Bar name="Sin conexión" backgroundColor="#FF8000" icon="wifi-outline" />
      )}
      {internetStatus.status === InternetStatus.Syncing && (
        <Bar
          name="Sincronizando"
          backgroundColor={colors.primary}
          icon="sync-outline"
          iconAnimation={true}
          color="#FFFFFF"
        />
      )}
      {internetStatus.status === InternetStatus.Synchronized && (
        <Bar name="Sincronizado" backgroundColor="#1ED565" icon="checkbox-outline" />
      )}
      {serverStatus.status === ServerStatus.Unreachable &&
        internetStatus.status === InternetStatus.Online && (
          <Bar
            name="Tratando de conectar al servidor"
            backgroundColor={colors.primary}
            color="#FFFFFF"
            icon="sync-outline"
            iconAnimation={true}
          />
        )}
      <SafeAreaView style={[{ flex: 1, padding: 20 }, style]}>
        <StatusBar style={dark ? "light" : "dark"} backgroundColor={colors.notification} />
        {children}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  bar: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
  },
  iconWrapper: {
    marginLeft: 5,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Layout;

import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import { toggle } from "application/slice/settings/dark.mode.slice";
import { change } from "application/slice/settings/color.slice";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import apiClient from "infrastructure/api/server";
import endpoints from "config/constants/api.endpoints";

type CardProps = {
  name: string;
  value: number;
};

const Card: React.FC<CardProps> = ({ name, value }) => {
  const color = useAppSelector((state) => state.color);

  const { colors } = useTheme();

  const dispatch = useAppDispatch();

  const changeColor = async () => {
    dispatch(change(value));
    await apiClient({
      url: endpoints.setting.color(),
      method: "PATCH",
      data: { color: value },
    });
  };

  return (
    <TouchableOpacity style={[styles.card, { borderColor: colors.border }]} onPress={changeColor}>
      <StyledText>{name}</StyledText>
      {color === value && <Ionicons name="checkmark" size={30} color={colors.primary} />}
    </TouchableOpacity>
  );
};

const Theme: React.FC = () => {
  const { colors } = useTheme();

  const darkMode = useAppSelector((state) => state.darkMode);

  const dispatch = useAppDispatch();

  const changeTheme = async () => {
    dispatch(toggle());
    await apiClient({
      url: endpoints.setting.darkMode(),
      method: "PATCH",
      data: { darkMode: !darkMode },
    });
  };

  return (
    <Layout style={{ padding: 0 }}>
      <TouchableOpacity style={[styles.card, { borderColor: colors.border }]} onPress={changeTheme}>
        <StyledText>
          MODO <StyledText color={colors.primary}>({darkMode ? "OSCURO" : "CLARO"})</StyledText>
        </StyledText>
        <Ionicons
          name={darkMode ? "moon-outline" : "sunny-outline"}
          size={35}
          color={colors.primary}
        />
      </TouchableOpacity>
      <Card name="MORADO" value={0} />
      <Card name="AZUL" value={1} />
      <Card name="NARANJA" value={2} />
      <Card name="VERDE" value={3} />
      <Card name="ROSADO" value={4} />
      <Card name="ROJO" value={5} />
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 70,
    borderBottomWidth: 1,
  },
});

export default Theme;

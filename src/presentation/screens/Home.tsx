import React, { useMemo } from "react";
import moment from "moment";
import { Alert, StyleSheet, View } from "react-native";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { useTheme } from "@react-navigation/native";
import { changeDate, random, thousandsSystem } from "shared/utils";
import { selectCompletedOrders, selectCompletedSales } from "application/selectors";
import { active, clean, Status } from "application/appState/state/state.controller.slice";
import { batch } from "react-redux";
import { Order } from "domain/entities/data/common";
import { add } from "application/slice/handlers/handlers.slice";
import apiClient, { endpoints } from "infrastructure/api/server";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";

const Home: React.FC = () => {
  const { colors } = useTheme();

  const orders = useAppSelector(selectCompletedOrders);
  const sales = useAppSelector(selectCompletedSales);
  const stateController = useAppSelector((state) => state.stateController);

  const dispatch = useAppDispatch();

  const condition = useMemo(() => stateController.status === Status.Inactive, [stateController]);

  const filtered = (orders: Order[]): number => {
    const found = orders.filter(
      (order) =>
        moment(order.creationDate).isSameOrAfter(stateController.start) &&
        moment(order.creationDate).isSameOrBefore(Date.now()),
    );
    return found.reduce((a, b) => a + b.total, 0);
  };

  const value = useMemo(() => (!condition ? filtered([...orders, ...sales]) : 0), [orders, sales]);

  const save = async () => {
    const data = {
      id: random(10),
      start: stateController.start!,
      end: Date.now(),
      creationDate: Date.now(),
      modificationDate: Date.now(),
    };
    batch(() => {
      dispatch(add(data));
      dispatch(clean());
    });
    await apiClient({
      url: endpoints.handler.post(),
      method: "POST",
      data,
    });
  };

  return (
    <Layout>
      {!condition && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="time-outline" size={30} color={colors.primary} />
          <StyledText style={{ marginLeft: 5 }}>
            Abierto desde: {changeDate(new Date(stateController.start!), true)}
          </StyledText>
        </View>
      )}
      <View style={styles.content}>
        <Ionicons
          name="trophy-outline"
          color={condition ? colors.text : colors.primary}
          size={120}
        />
        <StyledText smallTitle>{thousandsSystem(value)}</StyledText>
        <StyledText color={colors.primary}>{!condition ? "ABIERTO" : "CERRADO"}</StyledText>
      </View>
      <StyledButton
        backgroundColor={colors.primary}
        onPress={() => {
          if (condition) dispatch(active({ start: Date.now() }));
          else {
            Alert.alert(
              "EY!",
              "¿Estás seguro que desea cerrar la caja?",
              [
                { text: "No estoy seguro", style: "cancel" },
                {
                  text: "Estoy seguro",
                  onPress: save,
                },
              ],
              { cancelable: true },
            );
          }
        }}
      >
        <StyledText color="#FFFFFF" center>
          {condition ? "APERTURAR" : "CERRAR"} CAJA
        </StyledText>
      </StyledButton>
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  circle: {
    marginRight: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});

export default Home;

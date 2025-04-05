import React, { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { thousandsSystem } from "shared/utils";
import { PieChart } from "react-native-gifted-charts";
import { AppNavigationProp } from "domain/entities/navigation";
import FullFilterDate, { resetDate } from "presentation/components/layout/FullFilterDate";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";
import useStatisticsData from "./hooks/useStatisticsData";

type CardProps = {
  name: string;
  value?: string | null;
  description?: string | null;
  onPress?: () => void;
  right?: (() => React.ReactNode) | null;
};

const Card: React.FC<CardProps> = ({ name, value, description, onPress, right }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View>
        <StyledText>{name}</StyledText>
        {value && (
          <StyledText color={colors.primary} bold>
            {value}
          </StyledText>
        )}
        {description && <StyledText verySmall>{description}</StyledText>}
      </View>
      {right && right()}
      {!right && onPress && <Ionicons name="chevron-forward" color={colors.text} size={19} />}
    </TouchableOpacity>
  );
};

const Statistic: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const {
    date,
    setDate,
    OFCompleted,
    SFCompleted,
    OFCanceled,
    SFCanceled,
    kitchenFiltered,
    economiesFiltered,
    totalBill,
    avgTicket,
    totalRevenue,
    quantitySold,
    totalCostOfSale,
    calculatePaymentMethods,
  } = useStatisticsData();

  const { bestMethod, paymentMethods } = useMemo(
    () => calculatePaymentMethods([...OFCompleted, ...SFCompleted], colors.primary),
    [OFCompleted, SFCompleted, colors.primary],
  );

  return (
    <>
      <Layout style={{ padding: 0 }}>
        <FullFilterDate
          style={{ padding: 20, borderBottomWidth: 1, borderColor: colors.border }}
          date={date}
          setDate={setDate}
        />
        <ScrollView style={{ flexGrow: 1 }}>
          <Card name="Facturación" value={thousandsSystem(totalBill)} />
          <Card
            name="Ventas canceladas"
            value={thousandsSystem(OFCanceled.length + SFCanceled.length)}
            onPress={() =>
              navigation.navigate("StatisticsRoutes", {
                screen: "Sale",
                params: { sales: SFCanceled, orders: OFCanceled, title: "Ventas canceladas" },
              })
            }
          />
          <Card
            name="Ventas completadas"
            value={thousandsSystem(OFCompleted.length + SFCompleted.length)}
            onPress={() =>
              navigation.navigate("StatisticsRoutes", {
                screen: "Sale",
                params: { sales: SFCompleted, orders: OFCompleted, title: "Ventas completadas" },
              })
            }
          />
          <Card name="Ingreso/Egreso Medio" value={thousandsSystem(avgTicket)} />
          <Card
            name="Ganancia total"
            value={thousandsSystem(totalRevenue)}
            onPress={() =>
              navigation.navigate("StatisticsRoutes", {
                screen: "TotalGain",
                params: {
                  orders: OFCompleted,
                  sales: SFCompleted,
                  economies: economiesFiltered,
                },
              })
            }
          />
          <Card
            name="Medios de pago"
            value={bestMethod && bestMethod?.text}
            description={
              bestMethod
                ? `El ${bestMethod.text} es método de pago con más valor usado`
                : "No se ha utilizado método de pagos"
            }
            right={
              paymentMethods.length
                ? () => (
                    <PieChart
                      radius={30}
                      data={paymentMethods.map((d) => ({ ...d, value: d.times }))}
                    />
                  )
                : null
            }
            onPress={() =>
              navigation.navigate("StatisticsRoutes", {
                screen: "PaymentMethod",
                params: { data: paymentMethods },
              })
            }
          />
          <Card name="Cantidad vendidas" value={thousandsSystem(quantitySold)} />
          <Card
            name="Costos/Ventas"
            value={thousandsSystem(totalCostOfSale)}
            onPress={() =>
              navigation.navigate("StatisticsRoutes", {
                screen: "Indicators",
                params: { economies: economiesFiltered },
              })
            }
          />
          <Card
            name="Producción finalizada"
            value={thousandsSystem(kitchenFiltered.length)}
            onPress={() =>
              navigation.navigate("StatisticsRoutes", {
                screen: "Production",
                params: { orders: kitchenFiltered },
              })
            }
          />
        </ScrollView>
        <View style={{ padding: 20 }}>
          <StyledButton
            backgroundColor={colors.primary}
            onPress={() =>
              navigation.navigate("StatisticsRoutes", {
                screen: "Report",
                params: {
                  orders: OFCompleted,
                  sales: SFCompleted,
                  date: resetDate,
                  economies: economiesFiltered,
                },
              })
            }
          >
            <StyledText center color="#FFFFFF">
              Reporte de ventas
            </StyledText>
          </StyledButton>
        </View>
      </Layout>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default Statistic;

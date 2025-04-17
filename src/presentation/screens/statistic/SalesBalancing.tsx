import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { changeDate, thousandsSystem } from "shared/utils";
import React, { useMemo, useState } from "react";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import SimpleCalendarModal from "presentation/components/modal/SimpleCalendarModal";
import moment from "moment";
import { Type as TypeEconomy } from "domain/enums/data/economy/economy.enums";
import { useAppSelector } from "application/store/hook";
import { selectCompletedOrders, selectCompletedSales } from "application/selectors";
import { Economy, Order } from "domain/entities/data";
import { calculatePaymentMethods } from "./hooks/useStatisticsData";
import { AppNavigationProp } from "domain/entities/navigation";
import StyledButton from "presentation/components/button/StyledButton";

const DotSeparatorText = ({
  bold = false,
  leftText,
  rightText,
  dotColor = "#999",
}: {
  bold?: boolean;
  leftText: string;
  rightText: string;
  dotColor?: string;
}) => (
  <View style={styles.container}>
    <StyledText style={styles.leftText} numberOfLines={1} ellipsizeMode="clip" bold={bold}>
      {leftText}
    </StyledText>
    <View style={styles.dotsContainer}>
      <StyledText style={[styles.dots, { color: dotColor }]} numberOfLines={1} bold={bold}>
        {Array(100).fill(".").join("")}
      </StyledText>
    </View>
    <StyledText style={styles.rightText} bold={bold}>
      {rightText}
    </StyledText>
  </View>
);

const SalesBalancing: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();
  const [date, setDate] = useState(Date.now());
  const [calendarModal, setCalendarModal] = useState(false);

  const filterByDate = <T extends { creationDate: number }>(items: T[]) =>
    items.filter((item) => moment(item.creationDate).isSame(moment(date), "day"));

  const ordersCompleted = useAppSelector(selectCompletedOrders);
  const salesCompleted = useAppSelector(selectCompletedSales);
  const economies = useAppSelector((state) => state.economies);
  const initialBasis = useAppSelector((state) => state.initialBasis);

  const OFCompleted = useMemo(() => filterByDate(ordersCompleted), [ordersCompleted, date]);
  const SFCompleted = useMemo(() => filterByDate(salesCompleted), [salesCompleted, date]);
  const allOrders = [...OFCompleted, ...SFCompleted];
  const economiesFiltered = useMemo(() => filterByDate(economies), [economies, date]);

  const sumValues = (items: Economy[], type: TypeEconomy) =>
    items.filter((e) => e.type === type && e.operative).reduce((acc, e) => acc + e.value, 0);

  const incomes = sumValues(economiesFiltered, TypeEconomy.Income);
  const egress = sumValues(economiesFiltered, TypeEconomy.Egress);
  const tip = allOrders.reduce((acc, order) => acc + order.tip, 0);

  const calculateOrderTax = (orders: Order[]) =>
    orders.reduce((acc, order) => {
      const value = order.selection.reduce((a, b) => a + b.total, 0);
      return acc + order.tax * (value - value * order.discount);
    }, 0);

  const tax = calculateOrderTax(allOrders);
  const totalFromOrders = allOrders.reduce((acc, order) => acc + order.total, 0);
  const totalSales = allOrders.reduce(
    (acc, order) => acc + order.selection.reduce((a, b) => a + b.value * b.quantity, 0),
    0,
  );

  const discounts = totalSales - totalFromOrders;
  const paymentMethods = useMemo(
    () => calculatePaymentMethods(allOrders, colors.primary),
    [allOrders, colors.primary],
  );

  const totalSale = totalSales + incomes;
  const netSale = totalSale - discounts;
  const currentIncome = netSale - tax - tip;
  const netCash = currentIncome - egress + initialBasis;
  const cash = netCash - paymentMethods.reduce((a, b) => a + b.value, 0);

  return (
    <>
      <Layout>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <StyledText bold smallSubtitle>
            Fecha:
          </StyledText>
          <TouchableOpacity style={{ marginLeft: 4 }} onPress={() => setCalendarModal(true)}>
            <StyledText bold smallSubtitle color={colors.primary}>
              {changeDate(new Date(date))}
            </StyledText>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ marginTop: 16, flexGrow: 1 }}>
          <View style={[styles.separator, { borderColor: colors.border }]}>
            <DotSeparatorText
              leftText="VENTA TOTAL"
              rightText={thousandsSystem(totalSale)}
              bold
              dotColor={colors.primary}
            />
            <DotSeparatorText leftText="(-) Descuentos" rightText={thousandsSystem(discounts)} />
          </View>
          <View style={[styles.separator, { borderColor: colors.border }]}>
            <DotSeparatorText
              leftText="VENTA NETA"
              rightText={thousandsSystem(netSale)}
              bold
              dotColor={colors.primary}
            />
            <DotSeparatorText leftText="(-) Impuestos" rightText={thousandsSystem(tax)} />
            <DotSeparatorText leftText="(-) Propinas" rightText={thousandsSystem(tip)} />
          </View>
          <View style={[styles.separator, { borderColor: colors.border }]}>
            <DotSeparatorText
              leftText="INGRESO REAL"
              rightText={thousandsSystem(currentIncome)}
              bold
              dotColor={colors.primary}
            />
            <DotSeparatorText leftText="(-) Gastos" rightText={thousandsSystem(egress)} />
            <DotSeparatorText
              leftText="(+) Base inicial"
              rightText={thousandsSystem(initialBasis)}
            />
          </View>
          <View style={[styles.separator, { borderColor: colors.border }]}>
            <DotSeparatorText
              leftText="NETO DE CAJA"
              rightText={thousandsSystem(netCash)}
              bold
              dotColor={colors.primary}
            />
            <FlatList
              data={paymentMethods}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DotSeparatorText leftText={item.name} rightText={thousandsSystem(item.value)} />
              )}
            />
          </View>
          <View style={[styles.separator, { borderColor: colors.border }]}>
            <DotSeparatorText
              leftText="EFECTIVO TOTAL"
              rightText={thousandsSystem(cash)}
              bold
              dotColor={colors.primary}
            />
          </View>
        </ScrollView>
        <View style={styles.features}>
          <StyledButton
            onPress={() => navigation.navigate("SettingRoutes", { screen: "Statistic" })}
            auto
            backgroundColor={colors.primary}
          >
            <StyledText verySmall color="#FFFFFF">
              Configuración
            </StyledText>
          </StyledButton>
        </View>
      </Layout>

      <SimpleCalendarModal
        defaultValue={date}
        visible={calendarModal}
        maxDate={moment().format("YYYY-MM-DD")}
        onClose={() => setCalendarModal(false)}
        onSave={(date) => setDate(date)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  features: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  leftText: {
    flexShrink: 1,
    paddingRight: 4,
  },
  dotsContainer: {
    flex: 1,
    minWidth: 20,
  },
  dots: {
    fontSize: 18,
    includeFontPadding: false,
    opacity: 0.7,
  },
  rightText: {
    flexShrink: 0,
    paddingLeft: 4,
  },
});

export default SalesBalancing;

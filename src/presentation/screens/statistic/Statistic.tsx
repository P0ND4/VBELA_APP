import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { generatePalette, thousandsSystem } from "shared/utils";
import { useAppSelector } from "application/store/hook";
import moment from "moment";
import {
  selectCanceledOrders,
  selectCanceledSales,
  selectCompletedKitchen,
  selectCompletedOrders,
  selectCompletedSales,
} from "application/selectors";
import { Order } from "domain/entities/data/common";
import { PieChart } from "react-native-gifted-charts";
import { Kitchen } from "domain/entities/data/kitchens";
import { Economy, Movement } from "domain/entities/data";
import { AppNavigationProp } from "domain/entities/navigation";
import FullFilterDate, {
  DateType,
  resetDate,
  Type,
} from "presentation/components/layout/FullFilterDate";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";

type Icons = keyof typeof Ionicons.glyphMap;

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

export type PaymentMethodSummary = {
  id: string;
  text: string;
  color?: string;
  value: number;
  icon: Icons | null;
  times: number;
};

const Statistic: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const ordersCanceled = useAppSelector(selectCanceledOrders);
  const salesCanceled = useAppSelector(selectCanceledSales);
  const ordersCompleted = useAppSelector(selectCompletedOrders);
  const salesCompleted = useAppSelector(selectCompletedSales);
  const kitchen = useAppSelector(selectCompletedKitchen);
  const economies = useAppSelector((state) => state.economies);
  const movements = useAppSelector((state) => state.movements);

  const [date, setDate] = useState<DateType>(resetDate);

  const filtered = <T extends { creationDate: number }>(items: T[]): T[] => {
    return items.filter(
      (item) =>
        date.type === Type.All ||
        (moment(item.creationDate).isSameOrAfter(date.start) &&
          moment(item.creationDate).isSameOrBefore(date.end)),
    );
  };

  const OFCompleted = useMemo(() => filtered<Order>(ordersCompleted), [ordersCompleted, date]);
  const SFCompleted = useMemo(() => filtered<Order>(salesCompleted), [salesCompleted, date]);
  const OFCanceled = useMemo(() => filtered<Order>(ordersCanceled), [ordersCanceled, date]);
  const SFCanceled = useMemo(() => filtered<Order>(salesCanceled), [salesCanceled, date]);

  const economiesFiltered = useMemo(() => filtered<Economy>(economies), [economies, date]);
  const kitchenFiltered = useMemo(() => filtered<Kitchen>(kitchen), [kitchen, date]);
  const movementsFiltered = useMemo(() => filtered<Movement>(movements), [movements, date]);

  // Calcular el monto total (ingresos - egresos)
  const calculateTotal = (orders: Order[], ecomomies: Economy[], movements: Movement[]) => {
    const ordersTotal = orders.reduce(
      (acc, order) => acc + order.paymentMethods.reduce((sum, method) => sum + method.amount, 0),
      0,
    );

    const ecomomiesTotal = ecomomies.reduce((acc, e) => acc + e.value, 0);
    const movementsTotal = movements.reduce((acc, m) => acc + m.currentValue * m.quantity, 0);

    return ordersTotal + ecomomiesTotal + movementsTotal;
  };

  // Calcular la ganacia total
  const calculateRevenue = (orders: Order[]) => orders.reduce((acc, order) => acc + order.total, 0);

  // Calcular el promedio de las ganancias
  const calculateAverageTicket = (orders: Order[], ecomomies: Economy[], movements: Movement[]) => {
    const totalQuantity = orders.length + ecomomies.length + movements.length;
    const totalValue = calculateTotal(orders, ecomomies, movements);
    return totalQuantity ? totalValue / totalQuantity : 0;
  };

  // Calcular los metodos de pagos mas utilizados
  const calculatePaymentMethods = (orders: Order[]) => {
    const paymentMethods = orders.flatMap((o) => o.paymentMethods);
    const calculated = paymentMethods.reduce<PaymentMethodSummary[]>((acc, b) => {
      const found = acc.find((a) => a.id === b.id);
      if (found) {
        found.value += b.amount;
        found.times += 1;
      } else
        acc.push({
          id: b.id,
          text: b.method,
          value: b.amount,
          icon: b.icon,
          times: 1,
        });
      return acc;
    }, []);

    const palette = generatePalette(colors.primary, calculated.length);
    return calculated.map((c, i) => ({ ...c, color: palette[i] }));
  };

  // Calcular la cantidad venvida
  const calculateQuantitySold = (orders: Order[]) => {
    const selection = orders.flatMap((o) => o.selection);
    return selection.reduce((a, b) => a + b.quantity, 0);
  };

  // Memoriza el valor total de facturación
  const totalBill = useMemo(
    () => calculateTotal([...OFCompleted, ...SFCompleted], economiesFiltered, movementsFiltered),
    [OFCompleted, SFCompleted, economiesFiltered, movementsFiltered],
  );

  // Memoriza el valor promedio de los ingresos/egresos
  const avgTicket = useMemo(
    () =>
      calculateAverageTicket(
        [...OFCompleted, ...SFCompleted],
        economiesFiltered,
        movementsFiltered,
      ),
    [OFCompleted, SFCompleted, economiesFiltered, movementsFiltered],
  );

  // Memoriza el valor total de ganancias
  const totalRevenue = useMemo(
    () =>
      calculateRevenue([...OFCompleted, ...SFCompleted]) +
      calculateTotal([], economiesFiltered, movementsFiltered),
    [OFCompleted, SFCompleted, economiesFiltered, movementsFiltered],
  );

  // Memoriza los metodos de pago mas utilizados
  const { bestMethod, paymentMethods } = useMemo(() => {
    const paymentMethods = calculatePaymentMethods([...OFCompleted, ...SFCompleted]);
    const bestMethod = paymentMethods.reduce<PaymentMethodSummary>(
      (max, current) => (current.times > max.times ? current : max),
      { id: "", text: "", color: "", value: -Infinity, icon: null, times: -Infinity },
    );
    const sorted = paymentMethods.sort((a, b) => b.times - a.times);
    return { bestMethod: !paymentMethods.length ? null : bestMethod, paymentMethods: sorted };
  }, [OFCompleted, SFCompleted]);

  // Memorizar la cantidad vendida
  const quantitySold = useMemo(
    () => calculateQuantitySold([...OFCompleted, ...SFCompleted]),
    [OFCompleted, SFCompleted],
  );

  // Memoriza el valor de Costos/Ventas
  const totalCostOfSale = useMemo(
    () => economiesFiltered.reduce((a, b) => a + b.quantity * b.value, 0),
    [economiesFiltered],
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
                  movements: movementsFiltered,
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
                  movements: movementsFiltered,
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

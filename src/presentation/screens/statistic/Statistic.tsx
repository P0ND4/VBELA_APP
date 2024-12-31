import React, { useMemo, useState } from "react";
import { Alert, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { changeDate, generatePalette, thousandsSystem } from "shared/utils";
import { useAppDispatch, useAppSelector } from "application/store/hook";
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
import { AppNavigationProp } from "domain/entities/navigation";
import { remove } from "application/slice/controllers/controllers";
import Layout from "presentation/components/layout/Layout";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledButton from "presentation/components/button/StyledButton";
import SimpleCalendarModal from "presentation/components/modal/SimpleCalendarModal";
import MultipleCalendarModal from "presentation/components/modal/MultipleCalendarModal";
import ReportModal from "./components/ReportModal";
import PaymentMethodsModal from "./components/PaymentMethodsModal";
import TotalGainModal from "./components/TotalGainModal";

type Icons = keyof typeof Ionicons.glyphMap;

type FilterButtonProps = {
  name: string;
  selected?: boolean;
  onPress: () => void;
};

const FilterButton: React.FC<FilterButtonProps> = ({ name, onPress, selected }) => {
  const { colors } = useTheme();

  return (
    <StyledButton
      backgroundColor={selected ? colors.primary : colors.card}
      style={styles.filterButton}
      onPress={onPress}
    >
      <StyledText verySmall color={selected ? "#FFFFFF" : colors.text}>
        {name}
      </StyledText>
    </StyledButton>
  );
};

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

enum Type {
  All = "Todos",
  Date = "Fecha",
  Period = "Periodo",
  Controller = "Controlador",
}

type DateType = {
  id: string | null;
  start: number | null;
  end: number | null;
  type: Type;
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
  const controllers = useAppSelector((state) => state.controllers);

  const [simpleCalendarModal, setSimpleCalendarModal] = useState<boolean>(false);
  const [multipleCalendarModal, setMultipleCalendarModal] = useState<boolean>(false);
  const [reportModal, setReportModal] = useState<boolean>(false);
  const [paymentMethodsModal, setPaymentMethodsModal] = useState<boolean>(false);
  const [totalGainModal, setTotalGainModal] = useState<boolean>(false);

  const resetDate = {
    id: null,
    type: Type.Date,
    start: moment(Date.now()).startOf("day").valueOf(),
    end: moment(Date.now()).endOf("day").valueOf(),
  };

  const [date, setDate] = useState<DateType>(resetDate);

  const dispatch = useAppDispatch();

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

  const kitchenFiltered = useMemo(() => filtered<Kitchen>(kitchen), [kitchen, date]);

  const calculateTotal = (orders: Order[]) =>
    orders.reduce(
      (acc, order) => acc + order.paymentMethods.reduce((sum, method) => sum + method.amount, 0),
      0,
    );

  const calculateRevenue = (orders: Order[]) => orders.reduce((acc, order) => acc + order.total, 0);

  const calculateAverageTicket = (orders: Order[]) => {
    const total = calculateTotal(orders);
    return orders.length ? total / orders.length : 0;
  };

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

  const calculateQuantitySold = (orders: Order[]) => {
    const selection = orders.flatMap((o) => o.selection);
    return selection.reduce((a, b) => a + b.quantity, 0);
  };

  const totalBill = useMemo(
    () => calculateTotal([...OFCompleted, ...SFCompleted]),
    [OFCompleted, SFCompleted],
  );

  const avgTicket = useMemo(
    () => calculateAverageTicket([...OFCompleted, ...SFCompleted]),
    [OFCompleted, SFCompleted],
  );

  const totalRevenue = useMemo(
    () => calculateRevenue([...OFCompleted, ...SFCompleted]),
    [OFCompleted, SFCompleted],
  );

  const { bestMethod, paymentMethods } = useMemo(() => {
    const paymentMethods = calculatePaymentMethods([...OFCompleted, ...SFCompleted]);
    const bestMethod = paymentMethods.reduce<PaymentMethodSummary>(
      (max, current) => (current.times > max.times ? current : max),
      { id: "", text: "", color: "", value: -Infinity, icon: null, times: -Infinity },
    );
    const sorted = paymentMethods.sort((a, b) => b.times - a.times);
    return { bestMethod: !paymentMethods.length ? null : bestMethod, paymentMethods: sorted };
  }, [OFCompleted, SFCompleted]);

  const quantitySold = useMemo(
    () => calculateQuantitySold([...OFCompleted, ...SFCompleted]),
    [OFCompleted, SFCompleted],
  );

  const startEndText = useMemo(() => {
    const dateChanged = (d: number) => changeDate(new Date(d), Type.Controller === date.type);
    const period = `${dateChanged(date.start!)} - ${dateChanged(date.end!)}`;

    if (Type.Date === date.type) return changeDate(new Date(date.start!));
    if ([Type.Controller, Type.Period].includes(date.type)) return period;
    return "Todos";
  }, [date]);

  return (
    <>
      <Layout style={{ padding: 0 }}>
        <View style={{ padding: 20, borderBottomWidth: 1, borderColor: colors.border }}>
          <StyledButton style={styles.row} onPress={() => setSimpleCalendarModal(true)}>
            <Ionicons name="chevron-back" size={15} color={colors.text} />
            <StyledText center>{startEndText}</StyledText>
            <Ionicons name="chevron-forward" size={15} color={colors.text} />
          </StyledButton>
          <FlatList
            data={controllers}
            scrollEnabled={controllers.length > 2}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            horizontal
            ItemSeparatorComponent={() => <View style={{ marginHorizontal: 4 }} />}
            renderItem={({ item }) => (
              <StyledButton
                style={styles.filterButton}
                onLongPress={() =>
                  Alert.alert(
                    "EY!",
                    "¿Está seguro que desea eliminar el controlador (apertura/cierre) de caja?",
                    [
                      { text: "No estoy seguro", style: "cancel" },
                      {
                        text: "Estoy seguro",
                        onPress: () => {
                          setDate(resetDate);
                          dispatch(remove({ id: item.id }));
                        },
                      },
                    ],
                    { cancelable: true },
                  )
                }
                onPress={() => {
                  setDate({ id: item.id, type: Type.Controller, start: item.start, end: item.end });
                }}
                backgroundColor={date.id === item.id ? colors.primary : colors.card}
              >
                <StyledText verySmall color={date.id === item.id ? "#FFFFFF" : colors.text}>
                  Apertura: {changeDate(new Date(item.start), true)}
                </StyledText>
                <StyledText verySmall color={date.id === item.id ? "#FFFFFF" : colors.text}>
                  Cierre: {changeDate(new Date(item.end), true)}
                </StyledText>
              </StyledButton>
            )}
          />
          <View style={styles.row}>
            <FilterButton
              name="Todos"
              selected={date.id === "All"}
              onPress={() => setDate({ type: Type.All, start: null, end: null, id: "All" })}
            />
            <FilterButton
              name="Día"
              selected={date.id === "Day"}
              onPress={() => {
                setDate({
                  id: "Day",
                  type: Type.Date,
                  start: moment(Date.now()).startOf("day").valueOf(),
                  end: moment(Date.now()).endOf("day").valueOf(),
                });
              }}
            />
            <FilterButton
              name="Semana"
              selected={date.id === "Week"}
              onPress={() => {
                setDate({
                  id: "Week",
                  type: Type.Period,
                  start: moment(Date.now()).startOf("day").subtract(1, "weeks").valueOf(),
                  end: moment(Date.now()).endOf("day").valueOf(),
                });
              }}
            />
            <FilterButton
              name="Mes"
              selected={date.id === "Month"}
              onPress={() => {
                setDate({
                  id: "Month",
                  type: Type.Period,
                  start: moment(Date.now()).startOf("day").subtract(1, "months").valueOf(),
                  end: moment(Date.now()).endOf("day").valueOf(),
                });
              }}
            />
            <FilterButton
              name="Año"
              selected={date.id === "Year"}
              onPress={() => {
                setDate({
                  id: "Year",
                  type: Type.Period,
                  start: moment(Date.now()).endOf("day").subtract(1, "years").valueOf(),
                  end: moment(Date.now()).startOf("day").valueOf(),
                });
              }}
            />
            <FilterButton
              name="Período"
              selected={date.id === "Period"}
              onPress={() => setMultipleCalendarModal(true)}
            />
          </View>
        </View>
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
          <Card name="Ticket Medio" value={thousandsSystem(avgTicket)} />
          <Card
            name="Ganancia total"
            value={thousandsSystem(totalRevenue)}
            onPress={() => setTotalGainModal(true)}
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
            onPress={() => setPaymentMethodsModal(true)}
          />
          <Card name="Cantidad vendidas" value={thousandsSystem(quantitySold)} />
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
          <StyledButton backgroundColor={colors.primary} onPress={() => setReportModal(true)}>
            <StyledText center color="#FFFFFF">
              Informe de ventas
            </StyledText>
          </StyledButton>
        </View>
      </Layout>
      <SimpleCalendarModal
        defaultValue={date.start}
        visible={simpleCalendarModal}
        maxDate={moment().format("YYYY-MM-DD")}
        onClose={() => setSimpleCalendarModal(false)}
        onSave={(date) => {
          setDate({
            id: null,
            type: Type.Date,
            start: moment(date).startOf("day").valueOf(),
            end: moment(date).endOf("day").valueOf(),
          });
        }}
      />
      <MultipleCalendarModal
        visible={multipleCalendarModal}
        maxDate={moment().format("YYYY-MM-DD")}
        onClose={() => setMultipleCalendarModal(false)}
        onSave={({ start, end }) => {
          setDate({ id: "Period", type: Type.Period, start, end });
        }}
      />
      <ReportModal
        visible={reportModal}
        onClose={() => setReportModal(false)}
        orders={OFCompleted}
        sales={SFCompleted}
      />
      <PaymentMethodsModal
        data={paymentMethods}
        visible={paymentMethodsModal}
        onClose={() => setPaymentMethodsModal(false)}
      />
      <TotalGainModal
        visible={totalGainModal}
        onClose={() => setTotalGainModal(false)}
        orders={OFCompleted}
        sales={SFCompleted}
      />
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
  filterButton: { width: "auto", paddingHorizontal: 12, paddingVertical: 5 },
});

export default Statistic;

import { StyleSheet, TouchableOpacity, View } from "react-native";
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

type DotSeparatorTextProps = {
  bold?: boolean;
  leftText: string;
  rightText: string;
  dotColor?: string;
};

const DotSeparatorText: React.FC<DotSeparatorTextProps> = ({
  bold = false,
  leftText,
  rightText,
  dotColor = "#999",
}) => {
  return (
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
};

const SalesBalancing = () => {
  const { colors } = useTheme();

  const ordersCompleted = useAppSelector(selectCompletedOrders);
  const salesCompleted = useAppSelector(selectCompletedSales);
  const economies = useAppSelector((state) => state.economies);

  const [date, setDate] = useState(Date.now());
  const [calendarModal, setCalendarModal] = useState<boolean>(false);

  const filtered = <T extends { creationDate: number }>(items: T[]): T[] => {
    return items.filter(
      (item) =>
        moment(item.creationDate).isSameOrAfter(moment(date).startOf("day").valueOf()) &&
        moment(item.creationDate).isSameOrBefore(moment(date).endOf("day").valueOf()),
    );
  };

  const incomes = (economies: Economy[]) =>
    economies.filter((e) => e.type === TypeEconomy.Income).reduce((acc, e) => acc + e.value, 0);
  const egress = (economies: Economy[]) =>
    economies.filter((e) => e.type === TypeEconomy.Egress).reduce((acc, e) => acc + e.value, 0);

  const calculateOrdersTotal = (orders: Order[]) => {
    return orders.reduce(
      (acc, order) => acc + order.selection.reduce((a, b) => a + b.value * b.quantity, 0),
      0,
    );
  };

  const OFCompleted = useMemo(() => filtered<Order>(ordersCompleted), [ordersCompleted, date]);
  const SFCompleted = useMemo(() => filtered<Order>(salesCompleted), [salesCompleted, date]);
  const allOrders = useMemo(() => [...OFCompleted, ...SFCompleted], [OFCompleted, SFCompleted]);

  const economiesFiltered = useMemo(() => filtered<Economy>(economies), [economies, date]);

  const totalSales = useMemo(
    () => calculateOrdersTotal(allOrders) + incomes(economiesFiltered),
    [allOrders, economiesFiltered],
  );

  const totalFromOrders = useMemo(() => {
    return allOrders.reduce((acc, order) => acc + order.total, 0);
  }, [allOrders]);

  const discounts = useMemo(() => {
    return totalSales - totalFromOrders + incomes(economiesFiltered);
  }, [totalSales, totalFromOrders, economiesFiltered]);

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
        <View style={{ marginTop: 16 }}>
          <View style={[styles.separator, { borderColor: colors.border }]}>
            <DotSeparatorText
              leftText="VENTA TOTAL"
              rightText={thousandsSystem(totalSales)}
              dotColor={colors.primary}
              bold
            />
            <DotSeparatorText leftText="(-) Descuentos" rightText={thousandsSystem(discounts)} />
          </View>
          <View style={[styles.separator, { borderColor: colors.border }]}>
            <DotSeparatorText
              leftText="VENTA NETA"
              rightText={thousandsSystem(totalSales - discounts)}
              dotColor={colors.primary}
              bold
            />
            {/* <DotSeparatorText leftText="(-) Impuestos" rightText="0.00" />
            <DotSeparatorText leftText="(-) Propinas" rightText="0.00" /> */}
          </View>
          <View style={[styles.separator, { borderColor: colors.border }]}>
            {/* <DotSeparatorText
              leftText="INGRESO REAL"
              rightText="0.00"
              dotColor={colors.primary}
              bold
            /> */}
            <DotSeparatorText
              leftText="(-) Gastos"
              rightText={thousandsSystem(egress(economiesFiltered))}
            />
            {/* <DotSeparatorText leftText="(+) Base inicial" rightText="0.00" /> */}
          </View>
          <View style={[styles.separator, { borderColor: colors.border }]}>
            <DotSeparatorText
              leftText="NETO DE CAJA"
              rightText={thousandsSystem(
                totalFromOrders + incomes(economiesFiltered) + egress(economiesFiltered),
              )}
              dotColor={colors.primary}
              bold
            />
            {/* <DotSeparatorText leftText="(-) Efectivo" rightText="0.00" />
            <DotSeparatorText leftText="(-) Nequi" rightText="0.00" />
            <DotSeparatorText leftText="(-) Otros" rightText="0.00" /> */}
          </View>
          {/* <View style={[styles.separator, { borderColor: colors.border }]}>
            <DotSeparatorText
              leftText="EFECTIVO TOTAL"
              rightText="0.00"
              dotColor={colors.primary}
              bold
            />
          </View> */}
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

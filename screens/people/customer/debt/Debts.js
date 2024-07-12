import { useState, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getFontSize, thousandsSystem, changeDate, reverseDate } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import EventPayment from "@utils/customer/debt/EventPayment";
import DebtInformation from "@utils/customer/debt/Information";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Card = ({ item }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const navigation = useNavigation();

  return (
    <View style={{ borderColor: textColor, borderWidth: 0.5, marginTop: 5 }}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Detail", { id: item.id })}
        style={[
          styles.header,
          {
            backgroundColor: mode === "light" ? light.main5 : dark.main3,
            borderBottomWidth: 0.2,
            borderColor: textColor,
          },
        ]}
      >
        <TextStyle verySmall color={textColor}>
          {item.name}
        </TextStyle>
        <TextStyle verySmall color={light.main2}>
          {thousandsSystem(
            item.logs?.reduce((a, b) => a + b.debts?.reduce((a, h) => a + h.value, 0), 0)
          )}
        </TextStyle>
      </TouchableOpacity>
      <View>
        <View style={{ flexDirection: "row" }}>
          <View style={[styles.table, { borderColor: textColor, width: 160 }]}>
            <TextStyle color={light.main2} verySmall>
              Detalle
            </TextStyle>
          </View>
          <View style={[styles.table, { borderColor: textColor, width: 70 }]}>
            <TextStyle color={light.main2} verySmall>
              Personas
            </TextStyle>
          </View>
          <View style={[styles.table, { borderColor: textColor, width: 40 }]}>
            <TextStyle color={light.main2} verySmall>
              Días
            </TextStyle>
          </View>
          <View style={[styles.table, { borderColor: textColor, flexGrow: 1 }]}>
            <TextStyle color={light.main2} verySmall>
              Valor
            </TextStyle>
          </View>
        </View>
        {item?.logs.map((item) => (
          <View key={item.date}>
            <View
              style={[
                styles.header,
                {
                  backgroundColor: mode === "light" ? light.main4 : dark.main2,
                },
              ]}
            >
              <TextStyle verySmall color={textColor}>
                Fecha
              </TextStyle>
              <TextStyle verySmall color={textColor}>
                {item.date}
              </TextStyle>
              <View />
            </View>
            {item.debts?.map((item) => (
              <View style={{ flexDirection: "row" }} key={item.id}>
                <View style={[styles.table, { borderColor: textColor, width: 80 }]}>
                  <TextStyle color={textColor} verySmall>
                    {item.details}
                  </TextStyle>
                </View>
                <View style={[styles.table, { borderColor: textColor, width: 80 }]}>
                  <TextStyle color={textColor} verySmall>
                    {item.group} {item.nomenclature}
                  </TextStyle>
                </View>
                <View style={[styles.table, { borderColor: textColor, width: 70 }]}>
                  <TextStyle color={textColor} center verySmall>
                    {thousandsSystem(item.people)}
                  </TextStyle>
                </View>
                <View style={[styles.table, { borderColor: textColor, width: 40 }]}>
                  <TextStyle color={textColor} center verySmall>
                    {thousandsSystem(item.days)}
                  </TextStyle>
                </View>
                <View style={[styles.table, { borderColor: textColor, flexGrow: 1 }]}>
                  <TextStyle color={textColor} verySmall>
                    {thousandsSystem(item.value)}
                  </TextStyle>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const Debts = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const customers = useSelector((state) => state.customers);

  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const zones = useSelector((state) => state.zones);
  const sales = useSelector((state) => state.sales);
  const orders = useSelector((state) => state.orders);

  const [debts, setDebts] = useState(null);

  const accommodationHandler = ({ id, ref, days, creationDate }) => {
    const { nomenclature, ref: zoneRef } = nomenclatures.find((n) => n.id === ref);
    const { name: group } = zones.find((z) => z.id === zoneRef);
    return { id, details: "Alojamiento", group, nomenclature, days, creationDate };
  };

  const salesHandler = (trade, { type }) =>
    trade.reduce((result, { selection, id, ref, creationDate }) => {
      const methods = selection.reduce((a, b) => [...a, ...b.method], []);
      const debt = methods.reduce((a, b) => (b.method === "credit" ? a + b.total : a), 0);
      const purified = customers.flatMap(({ id, name, special, clientList }) =>
        special ? clientList.map(({ id, name }) => ({ id, name })) : [{ id, name }]
      );
      const found = purified.find(({ id }) => id === ref);
      if (debt === 0) return result;
      result.push({
        id,
        ref,
        details: `Venta (${type === "sales" ? "P&S" : "Mesa"})`,
        group: found?.name || "Eliminado",
        nomenclature: "",
        days: "-",
        creationDate,
        value: debt,
        people: "-",
      });
      return result;
    }, []);

  const getValueSales = (sales) =>
    sales.reduce(
      (total, { selection }) =>
        total +
        selection
          .flatMap(({ method }) => method)
          .reduce((acc, { method, total }) => acc + (method === "credit" ? total : 0), 0),
      0
    );

  useEffect(() => {
    const calculateDebts = (reservations, filterCondition, mapFunction) =>
      reservations.filter(filterCondition).map(mapFunction);

    const calculateDebt = ({ total, payment }, salesCondition, ordersCondition) => {
      const paidAmount = payment?.reduce((sum, { amount }) => sum + amount, 0) || 0;
      const ACdebt = Math.max(total - paidAmount, 0);
      const SAdebt =
        getValueSales(sales.filter(salesCondition)) + getValueSales(orders.filter(ordersCondition));
      return ACdebt + SAdebt;
    };

    const groupDebts = (array) =>
      array.reduce((group, debt) => {
        const date = changeDate(new Date(debt.creationDate));
        if (!group[date]) group[date] = [];
        group[date].push(debt);
        return group;
      }, {});

    const sortDebts = (array) =>
      array
        .map(([date, debts]) => ({ date, debts }))
        .sort((a, b) => reverseDate(b.date) - reverseDate(a.date));

    const debugged = customers.reduce((acc, { id: customerId, name, clientList }) => {
      const commonFilter = (a) => a.owner === customerId || clientList?.some(({ id }) => id === a.owner);

      const accommodation = calculateDebts(
        accommodationReservations,
        (a) => commonFilter(a) && !["business", "paid"].includes(a.status),
        (a) => ({
          ...accommodationHandler(a),
          people: 1,
          customerIDS: [a.owner],
          value: calculateDebt(
            a,
            (s) => a.owner === s.ref,
            (s) => a.owner === s.ref
          ),
        })
      );

      const standard = calculateDebts(
        standardReservations,
        (s) => s.hosted.some((h) => commonFilter(h)) && !["business", "paid"].includes(s.status),
        (s) => {
          const people = s.hosted.filter((h) => h.owner);
          const condition = (s) => people.some((p) => p.owner === s.ref);
          return {
            ...accommodationHandler(s),
            people: people.length,
            value: calculateDebt(s, condition, condition),
            customerIDS: people.map((p) => p.owner),
          };
        }
      );

      const conditionCommerce = (trade) => {
        const standardIDS = standard.flatMap((s) => s.customerIDS);
        const accommodationIDS = accommodation.flatMap((a) => a.customerIDS);
        const IDS = [...standardIDS, ...accommodationIDS];
        return (
          !IDS.some((id) => id === trade.ref) &&
          (trade.ref === customerId || clientList?.some((c) => c.id === trade.ref))
        );
      };

      const OFound = salesHandler(orders, { type: "orders" }).filter(conditionCommerce);
      const SFound = salesHandler(sales, { type: "sales" }).filter(conditionCommerce);

      const groupedDebts = groupDebts([...accommodation, ...standard, ...OFound, ...SFound]);
      const sortedDebts = sortDebts(Object.entries(groupedDebts));

      acc.push({ id: customerId, name, logs: sortedDebts });
      return acc;
    }, []);

    const debtsWitoutACustomerCondition = (trade) => {
      const IDS = customers.flatMap(({ id, special, clientList }) =>
        special ? clientList.map(({ id }) => id) : id
      );
      return !IDS.some((id) => id === trade.ref);
    };

    const debtsWithoutACustomer = [
      ...salesHandler(orders, { type: "orders" }).filter(debtsWitoutACustomerCondition),
      ...salesHandler(sales, { type: "sales" }).filter(debtsWitoutACustomerCondition),
    ];

    const debts = debugged.filter(({ logs }) => logs.length > 0);

    if (debtsWithoutACustomer.length > 0) {
      const groupedDebts = groupDebts(debtsWithoutACustomer);
      const sortedDebts = sortDebts(Object.entries(groupedDebts));
      debts.push({ id: null, name: "DEUDAS PENDIENTE POR COBRAR (ELIMINADOS)", logs: sortedDebts });
    }

    setDebts(debts);
  }, [customers, standardReservations, accommodationReservations, nomenclatures, zones, sales, orders]);

  return (
    <Layout>
      <View style={styles.row}>
        <TextStyle subtitle color={mode === "light" ? light.textDark : dark.textWhite}>
          Deudas
        </TextStyle>
        <ButtonStyle
          backgroundColor={light.main2}
          style={{ width: SCREEN_WIDTH / 3 }}
          onPress={() => navigation.navigate("Logs")}
        >
          <TextStyle smallParagraph center>
            Reportes
          </TextStyle>
        </ButtonStyle>
      </View>

      {debts?.length > 0 && (
        <View style={styles.row}>
          <View />
          <ButtonStyle
            backgroundColor={light.main2}
            style={{ width: SCREEN_WIDTH / 3 }}
            onPress={() => navigation.navigate("Charge")}
          >
            <TextStyle smallParagraph center>
              Facturar
            </TextStyle>
          </ButtonStyle>
        </View>
      )}

      {debts?.length === 0 && (
        <TextStyle style={{ marginTop: 20 }} center color={light.main2}>
          NO HAY DEUDAS PENDIENTES
        </TextStyle>
      )}

      <FlatList
        data={debts || []}
        style={{ marginTop: 20 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Card item={item} />}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  table: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default Debts;

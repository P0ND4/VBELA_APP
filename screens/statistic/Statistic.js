import { useState, useEffect, useMemo } from "react";
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { ProgressChart, LineChart } from "react-native-chart-kit";
import { thousandsSystem } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import FullFilterDate from "@components/FullFilterDate";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Card = ({ isBold, title, value, component, onPress }) => {
  const mode = useSelector((state) => state.mode);
  const [isOpen, setOpen] = useState(false);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const CardCondition = ({ children, style = {} }) =>
    component || onPress ? (
      <TouchableOpacity
        onPress={() => {
          onPress();
          setOpen(!isOpen);
        }}
        style={style}
      >
        {children}
      </TouchableOpacity>
    ) : (
      <View style={style}>{children}</View>
    );

  return (
    <>
      <CardCondition
        style={[styles.row, styles.card, { borderColor: mode === "light" ? light.main5 : dark.main2 }]}
      >
        <TextStyle verySmall bold={isBold} color={textColor}>
          {title}
        </TextStyle>
        <TextStyle verySmall bold={isBold} color={light.main2}>
          {value}
        </TextStyle>
      </CardCondition>
      {component && isOpen && component()}
    </>
  );
};

const GraphProgressChart = ({
  salesTotal,
  ordersTotal,
  accommodationTotal,
  purchaseTotal,
  expenseTotal,
}) => {
  const mode = useSelector((state) => state.mode);

  const [data, setData] = useState({
    labels: ["Gasto", "Compra", "Ingesta", "Reservas"],
    data: new Array(4).fill(0),
  });

  useEffect(() => {
    const total = salesTotal + ordersTotal + accommodationTotal + purchaseTotal + expenseTotal;
    const getPercentage = (amount) => {
      const operation = amount / total;
      if (isNaN(operation) || operation === Infinity) return 0;
      else return parseFloat(operation.toFixed(2));
    };
    setData({
      ...data,
      data: [
        getPercentage(expenseTotal),
        getPercentage(purchaseTotal),
        getPercentage(salesTotal + ordersTotal),
        getPercentage(accommodationTotal),
      ],
    });
  }, [salesTotal, ordersTotal, accommodationTotal, purchaseTotal, expenseTotal]);

  return (
    <ProgressChart
      style={{ marginTop: 20 }}
      data={data}
      width={SCREEN_WIDTH - 50}
      height={200}
      strokeWidth={12}
      radius={32}
      chartConfig={{
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) =>
          mode === "light" ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`,
        decimalPlaces: 0,
      }}
      hideLegend={false}
    />
  );
};

const GraphLineChart = () => {
  const mode = useSelector((state) => state.mode);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);

  const [data, setData] = useState({
    labels: ["En", "Fe", "Ma", "Ab", "Ma", "Ju", "Jul", "Ag", "Se", "Oc", "No", "Di"],
    datasets: [
      {
        data: new Array(12).fill(0),
        color: (opacity = 1) => "rgba(0, 209, 255, 1)",
        strokeWidth: 2,
      },
      {
        data: new Array(12).fill(0),
        color: (opacity = 1) => "rgba(0, 255, 240, 1)",
        strokeWidth: 2,
      },
    ],
    legend: ["Huéspedes", "Reservaciones"],
  });

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    const procesarReservas = (reservas) =>
      reservas
        .filter(({ creationDate }) => new Date(creationDate).getFullYear() === currentYear)
        .reduce(
          (acc, b) => {
            const month = new Date(b.creationDate).getMonth();
            const people = b.type === "standard" ? b.hosted.length : 1;
            acc.DPeople[month] += people;
            acc.DReservations[month] += 1;
            return acc;
          },
          { DPeople: new Array(12).fill(0), DReservations: new Array(12).fill(0) }
        );

    const { DPeople, DReservations } = procesarReservas([
      ...standardReservations,
      ...accommodationReservations,
    ]);

    setData({
      ...data,
      datasets: [
        { data: DPeople, color: () => "rgba(0, 150, 240, 1)", strokeWidth: 2 },
        { data: DReservations, color: () => "rgba(0, 255, 240, 1)", strokeWidth: 2 },
      ],
    });
  }, [standardReservations, accommodationReservations]);

  return (
    <LineChart
      data={data}
      width={SCREEN_WIDTH - 20}
      style={{ paddingRight: 35, marginTop: 20 }}
      height={SCREEN_HEIGHT / 4}
      chartConfig={{
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) =>
          mode === "light" ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`,
        decimalPlaces: 0,
      }}
    />
  );
};

const Statistic = ({ navigation }) => {
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const standardReservations = useSelector((state) => state.standardReservations);
  const roster = useSelector((state) => state.roster);
  const economy = useSelector((state) => state.economy);

  const [date, setDate] = useState(null);

  const [ordersTotal, setOrdersTotal] = useState(null);
  const [salesTotal, setSalesTotal] = useState(null);
  const [accommodationTotal, setAccommodationTotal] = useState(null);
  const [purchaseTotal, setPurchaseTotal] = useState(null);
  const [expenseTotal, setExpenseTotal] = useState(null);
  const [hostedTotal, setHostedTotal] = useState(null);
  const [rosterTotal, setRosterTotal] = useState(null);
  const [orderDebts, setOrderDebts] = useState(null);
  const [saleDebts, setSaleDebts] = useState(null);
  const [accommodationDebts, setAccommodationDebts] = useState(null);
  const [debts, setDebts] = useState(null);

  const [incomeTotal, setIncomeTotal] = useState(null);
  const [utilityTotal, setUtilityTotal] = useState(null);
  const [expenditureTotal, setExpenditureTotal] = useState(null);

  const dateValidation = (d) => {
    let error = false;
    if (!date) return error;
    if (date.day !== "all" && d.getDate() !== date.day) error = true;
    if (date.month !== "all" && d.getMonth() + 1 !== date.month) error = true;
    if (date.year !== "all" && d.getFullYear() !== date.year) error = true;
    return error;
  };

  useEffect(() => {
    const date = new Date();
    setDate({
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }, []);

  const getOrder = (orders) => {
    const ordersFiltered = orders.filter((o) => !dateValidation(new Date(o.creationDate)));
    const selection = ordersFiltered.reduce((a, b) => [...a, ...b.selection], []);
    const method = selection.reduce((a, b) => [...a, ...b.method], []);
    const debt = method.filter((m) => m.method === "credit").reduce((a, b) => a + b.total, 0);
    const total = method.filter((m) => m.method !== "credit").reduce((a, b) => a + b.total, 0);
    return { debt, total };
  };

  useEffect(() => {
    const { debt, total } = getOrder(orders);
    setOrdersTotal(total);
    setSaleDebts(debt);
  }, [orders, date]);

  useEffect(() => {
    const { debt, total } = getOrder(sales);
    setSalesTotal(total);
    setOrderDebts(debt);
  }, [sales, date]);

  useEffect(() => {
    const SFiltered = standardReservations.filter((s) => !dateValidation(new Date(s.creationDate)));
    const AFiltered = accommodationReservations.filter((a) => !dateValidation(new Date(a.creationDate)));
    const condition = (a, b) => a + b.payment.reduce((a, b) => a + b.amount, 0);
    const totalStandard = SFiltered.reduce(condition, 0);
    const totalAccommodation = AFiltered.reduce(condition, 0);
    const totalHostedStandard = SFiltered.reduce((a, b) => a + b.hosted.length, 0);
    const totalHostedAccommodation = AFiltered.reduce((a) => a + 1, 0);
    const debt = [...AFiltered, ...SFiltered]
      .filter((r) => r.status === "credit")
      .reduce((a, b) => a + b.total, 0);
    setAccommodationTotal(totalStandard + totalAccommodation);
    setHostedTotal(totalHostedStandard + totalHostedAccommodation);
    setAccommodationDebts(debt);
  }, [accommodationReservations, standardReservations, date]);

  useEffect(() => {
    const economyFiltered = economy.filter((e) => !dateValidation(new Date(e.creationDate)));
    const totalPurchase = economyFiltered
      .filter((e) => e.type === "purchase")
      .reduce((a, b) => a + b.payment, 0);

    const totalExpense = economyFiltered
      .filter((e) => e.type === "expense")
      .reduce((a, b) => a + b.payment, 0);

    setPurchaseTotal(totalPurchase);
    setExpenseTotal(totalExpense);
  }, [economy, date]);

  useEffect(() => {
    const rosterFiltered = roster.filter((r) => !dateValidation(new Date(r.creationDate)));
    const totalRoster = rosterFiltered.reduce((a, b) => a + b.amount, 0);
    setRosterTotal(totalRoster);
  }, [roster, date]);

  useEffect(() => {
    setDebts(orderDebts + saleDebts + accommodationDebts);
  }, [orderDebts, saleDebts, accommodationDebts]);

  useEffect(() => {
    setIncomeTotal(ordersTotal + purchaseTotal + salesTotal + rosterTotal + accommodationTotal + debts);
  }, [ordersTotal, purchaseTotal, salesTotal, rosterTotal, debts, accommodationTotal]);

  useEffect(() => {
    setUtilityTotal(
      ordersTotal + purchaseTotal + rosterTotal + debts + accommodationTotal - expenseTotal + salesTotal
    );
  }, [ordersTotal, purchaseTotal, rosterTotal, debts, accommodationTotal, expenseTotal, salesTotal]);

  useEffect(() => {
    setExpenditureTotal(expenseTotal);
  }, [expenseTotal]);

  return (
    <Layout>
      <FullFilterDate
        containerStyle={{ marginBottom: 15 }}
        style={{ width: SCREEN_WIDTH / 3.5 }}
        increment={5}
        start={4}
        defaultValue={{
          day: new Date().getDate(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        }}
        onChangeDay={(value) => setDate({ ...date, day: value })}
        onChangeMonth={(value) => setDate({ ...date, month: value })}
        onChangeYear={(value) => setDate({ ...date, year: value })}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card title="VENTAS DIARIAS (MENÚ)" value={thousandsSystem(ordersTotal || "0")} isBold={true} />
        <Card title="PRODUCTOS Y SERVICIOS" value={thousandsSystem(salesTotal || "0")} />
        <Card title="ALOJAMIENTO" value={thousandsSystem(accommodationTotal || "0")} />
        <Card title="GASTO/INVERSIÓN" value={thousandsSystem(expenseTotal || "0")} />
        <Card title="COMPRAS/COSTOS" value={thousandsSystem(purchaseTotal || "0")} />
        <Card title="PAGOS DE NÓMINA" value={thousandsSystem(rosterTotal || "0")} />
        <Card
          title="CUENTAS POR PAGAR"
          value={thousandsSystem(debts || "0")}
          onPress={() => navigation.navigate("CustomerDebts")}
        />
        <Card title="HUÉSPEDES" value={thousandsSystem(hostedTotal || "0")} />
        <Card title="UTILIDAD PROMEDIO" value={thousandsSystem(utilityTotal || "0")} />
        <Card title="TOTAL EGRESO" value={thousandsSystem(expenditureTotal || "0")} />
        <Card title="TOTAL INGRESO" value={thousandsSystem(incomeTotal || "0")} isBold={true} />
        <GraphProgressChart
          salesTotal={salesTotal}
          ordersTotal={ordersTotal}
          accommodationTotal={accommodationTotal}
          purchaseTotal={purchaseTotal}
          expenseTotal={expenseTotal}
        />
        <GraphLineChart />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    marginVertical: 2,
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default Statistic;

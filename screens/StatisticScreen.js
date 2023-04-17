import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import { ProgressChart, LineChart } from "react-native-chart-kit";
import Layout from "../components/Layout";
import TextStyle from "../components/TextStyle";
import { thousandsSystem, randomColor, months } from "../helpers/libs";
import { Picker } from "@react-native-picker/picker";
import theme from "../theme";
import { TouchableOpacity } from "react-native";

import Premium from "../assets/icons/premium.png";

const dark = theme.colors.dark;
const light = theme.colors.light;

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const StatisticScreen = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const economy = useSelector((state) => state.economy);
  const orders = useSelector((state) => state.orders);
  const reservations = useSelector((state) => state.reservations);

  const [isLoading, setIsLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [purchase, setPurchase] = useState(0);
  const [expense, setExpense] = useState(0);
  const [food, setFood] = useState(0);
  const [sales, setSales] = useState(0);

  const [FBreaksfast, setFBreaksfast] = useState(0);
  const [FLunch, setFLunch] = useState(0);
  const [FDinner, setFDinner] = useState(0);

  const [drink, setDrink] = useState(0);

  const [DBreaksfast, setDBreaksfast] = useState(0);
  const [DLunch, setDLunch] = useState(0);
  const [DDinner, setDDinner] = useState(0);

  const [people, setPeople] = useState(0);
  const [amount, setAmount] = useState(0);

  const [days, setDays] = useState([]);
  const [years, setYears] = useState([]);

  const [day, setDay] = useState("all");
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");

  const dateValidation = (date) => {
    let error = false;
    if (day !== "all" && date.getDate() !== day) error = true;
    if (month !== "all" && date.getMonth() + 1 !== month) error = true;
    if (year !== "all" && date.getFullYear() !== year) error = true;
    return error;
  };

  useEffect(() => {
    const date = new Date();
    let years = [date.getFullYear()];

    for (let i = 5; i >= 0; i--) {
      years.push(years[years.length - 1] - 1);
    }

    setYears(years);

    let sales = 0;
    let people = 0;
    let amount = 0;
    let purchase = 0;
    let expense = 0;
    let purchases = [];
    let expenses = [];
    let food = 0;
    let fbreaksfast = 0;
    let flunch = 0;
    let fdinner = 0;
    let drink = 0;
    let dbreaksfast = 0;
    let dlunch = 0;
    let ddinner = 0;

    for (let reservation of reservations) {
      const date = new Date(reservation.creationDate);
      if (dateValidation(date)) continue;
      people += parseInt(reservation.people);
      amount += reservation.amount;
    }

    for (let data of economy) {
      const date = new Date(data.creationDate);
      if (dateValidation(date)) continue;
      if (data.type === "purchase") {
        purchase += parseInt(data.amount);
        purchases.push(data);
      } else {
        expense += parseInt(data.amount);
        expenses.push(data);
      }
    }

    for (let order of orders) {
      const amount = order.amount * order.gave;
      const date = new Date(order.creationDate);
      if (dateValidation(date) || !order.pay) continue;

      sales += amount;
      if (order.product === "food") {
        food += amount;
        if (order.type === "breakfast") fbreaksfast += amount;
        if (order.type === "lunch") flunch += amount;
        if (order.type === "dinner") fdinner += amount;
      } else {
        drink += amount;
        if (order.type === "breakfast") dbreaksfast += amount;
        if (order.type === "lunch") dlunch += amount;
        if (order.type === "dinner") ddinner += amount;
      }
    }

    setSales(sales);
    setPeople(people);
    setAmount(amount);
    setPurchase(purchase);
    setExpense(expense);
    setFood(food);
    setFBreaksfast(fbreaksfast);
    setFLunch(flunch);
    setFDinner(fdinner);
    setDrink(drink);
    setDBreaksfast(dbreaksfast);
    setDLunch(dlunch);
    setDDinner(ddinner);
    setPurchases(purchases);
    setExpenses(expenses);

    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  }, [day, month, year, economy, orders]);

  useEffect(() => {
    const date = new Date();
    setYear(date.getFullYear());
    setMonth(date.getMonth() + 1);
    setDay(date.getDate());
  }, []);

  useEffect(() => {
    const date = new Date();
    const days = new Date(
      year === "all" ? date.getFullYear() : year,
      month === "all" ? 1 : month + 1,
      0
    ).getDate();
    const monthDays = [];
    for (let day = 0; day < days; day++) {
      monthDays.push(day + 1);
    }
    setDays(monthDays);
  }, [year, month]);

  const getConfig = ({
    BF = randomColor(),
    BFO = 0,
    BT = randomColor(),
    BTO = 0.5,
    C,
    ST,
    BP,
    SC,
    DP = 2,
  }) => {
    return {
      backgroundGradientFrom: BF,
      backgroundGradientFromOpacity: BFO,
      backgroundGradientTo: BT,
      backgroundGradientToOpacity: BTO,
      color: (opacity = 1) =>
        C || mode === "light"
          ? `rgba(0, 0, 0, ${opacity})`
          : `rgba(255, 255, 255, ${opacity})`,
      strokeWidth: ST || 3,
      barPercentage: BP || 0.5,
      useShadowColorFromDataset: SC || false,
      decimalPlaces: DP,
    };
  };

  const Economy = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: mode === "light" ? light.main5 : dark.main2,
          },
        ]}
        onPress={() =>
          navigation.push("CreateEconomy", {
            editing: true,
            item,
          })
        }
      >
        <TextStyle
          color={mode === "light" ? light.textDark : dark.textWhite}
          verySmall
        >
          {item.name}
        </TextStyle>
        <TextStyle color={light.main2} verySmall>
          {item.type === "expense" && "-"} {thousandsSystem(item.amount)}
        </TextStyle>
      </TouchableOpacity>
    );
  };

  const Information = ({ name, value }) => {
    return (
      <View
        style={[
          styles.container,
          { borderColor: mode === "light" ? light.main5 : dark.main2 },
        ]}
      >
        <TextStyle
          verySmall
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          {name}
        </TextStyle>
        <View style={{ maxWidth: width / 2.5 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <TextStyle verySmall color={light.main2}>
              {value}
            </TextStyle>
          </ScrollView>
        </View>
      </View>
    );
  };

  let amountTotal = 0;
  let sale = 0;
  const dataD = [0, 0, 0, 0];

  for (let data of economy) {
    const date = new Date(data.creationDate);
    if (dateValidation(date)) continue;
    amountTotal += parseInt(data.amount);
  }
  for (let order of orders) {
    const date = new Date(order.creationDate);
    if (dateValidation(date)) continue;
    if (order.pay) {
      amountTotal += order.amount * order.gave;
      sale += order.amount * order.gave;
    }
  }

  const getPercentage = (amount) => {
    const operation = amount / amountTotal;
    if (isNaN(operation) || operation === Infinity) return 0;
    else return operation.toFixed(2);
  };

  const DPeople = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const DReservations = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let reservation of reservations) {
    const currentDate = new Date();
    const creation = new Date(reservation.creationDate);
    const start = new Date(reservation.start);

    if (creation.getFullYear() === currentDate.getFullYear())
      DPeople[creation.getMonth()] += parseInt(reservation.people);
    if (start.getFullYear() === currentDate.getFullYear())
      DReservations[start.getMonth()] += parseInt(reservation.people);

    if (dateValidation(creation)) continue;
    amountTotal += reservation.amount;
  }

  dataD[0] = parseFloat(getPercentage(expense));
  dataD[1] = parseFloat(getPercentage(purchase));
  dataD[2] = parseFloat(getPercentage(sale));
  dataD[3] = parseFloat(getPercentage(amount));

  const data = {
    labels: ["Gasto", "Compras", "Consumo", "Reservas"],
    data: dataD,
  };

  const dataLine = {
    labels: [
      "En",
      "Fe",
      "Ma",
      "Ab",
      "Ma",
      "Ju",
      "Jul",
      "Ag",
      "Se",
      "Oc",
      "No",
      "Di",
    ],
    datasets: [
      {
        data: DPeople,
        color: (opacity = 1) => "rgba(0, 209, 255, 1)",
        strokeWidth: 2,
      },
      {
        data: DReservations,
        color: (opacity = 1) => "rgba(0, 255, 240, 1)",
        strokeWidth: 2,
      },
    ],
    legend: ["Fecha de creación", "Reservaciones"],
  };

  return (
    <Layout
      style={{
        marginTop: 0,
        padding: 10,
      }}
    >
      {!isLoading && (
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={[
                styles.cardPicker,
                {
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                },
              ]}
            >
              <Picker
                mode="dropdown"
                selectedValue={day}
                dropdownIconColor={
                  mode === "light" ? light.textDark : dark.textWhite
                }
                onValueChange={(itemValue) => setDay(itemValue)}
                style={{
                  width: width / 3.4,
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  color: mode === "light" ? light.textDark : dark.textWhite,
                  fontSize: 20,
                }}
              >
                <Picker.Item label="Día" value="all" />
                {days.map((day) => (
                  <Picker.Item key={day} label={`${day}`} value={day} />
                ))}
              </Picker>
            </View>
            <View
              style={[
                styles.cardPicker,
                {
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                },
              ]}
            >
              <Picker
                mode="dropdown"
                selectedValue={month}
                onValueChange={(itemValue) => setMonth(itemValue)}
                dropdownIconColor={
                  mode === "light" ? light.textDark : dark.textWhite
                }
                style={{
                  width: width / 3.4,
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  color: mode === "light" ? light.textDark : dark.textWhite,
                  fontSize: 20,
                }}
              >
                <Picker.Item label="Mes" value="all" />
                {months.map((month, index) => (
                  <Picker.Item key={month} label={month} value={index + 1} />
                ))}
              </Picker>
            </View>
            <View
              style={[
                styles.cardPicker,
                {
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                },
              ]}
            >
              <Picker
                mode="dropdown"
                selectedValue={year}
                onValueChange={(itemValue) => setYear(itemValue)}
                dropdownIconColor={
                  mode === "light" ? light.textDark : dark.textWhite
                }
                style={{
                  width: width / 3.4,
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  color: mode === "light" ? light.textDark : dark.textWhite,
                  fontSize: 20,
                }}
              >
                <Picker.Item label="Año" value="all" />
                {years.map((year, index) => (
                  <Picker.Item key={year} label={`${year}`} value={year} />
                ))}
              </Picker>
            </View>
          </View>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 20, height: height / 1.25 }}
          >
            <Information name="COMPRAS" value={thousandsSystem(purchase)} />
            {purchases.length > 0 && (
              <FlatList
                data={purchases}
                style={{ marginVertical: 15 }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.ref + item.modificationDate}
                renderItem={(item) => <Economy {...item} />}
              />
            )}
            <Information name="GASTOS" value={thousandsSystem(expense)} />
            {expenses.length > 0 && (
              <FlatList
                data={expenses}
                style={{ marginVertical: 15 }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.ref + item.modificationDate}
                renderItem={(item) => <Economy {...item} />}
              />
            )}
            <Information name="VENTAS" value={thousandsSystem(sales)} />
            <Information
              name="VENTAS POR COMIDAS"
              value={thousandsSystem(food)}
            />
            <View style={{ marginLeft: 20 }}>
              <Information
                name="DESAYUNO"
                value={thousandsSystem(FBreaksfast)}
              />
              <Information name="ALMUERZO" value={thousandsSystem(FLunch)} />
              <Information name="CENA" value={thousandsSystem(FDinner)} />
            </View>
            <Information
              name="VENTAS POR BEBIDAS"
              value={thousandsSystem(drink)}
            />
            <View style={{ marginLeft: 20 }}>
              <Information
                name="DESAYUNO"
                value={thousandsSystem(DBreaksfast)}
              />
              <Information name="ALMUERZO" value={thousandsSystem(DLunch)} />
              <Information name="CENA" value={thousandsSystem(DDinner)} />
            </View>
            <Information
              name="PERSONAS HOSPEDADAS"
              value={thousandsSystem(people)}
            />
            <Information
              name="RECAUDADO POR RESERVAS"
              value={thousandsSystem(amount)}
            />

            <View>
              <ProgressChart
                style={{ marginTop: 20 }}
                data={data}
                width={width - 20}
                height={220}
                strokeWidth={16}
                radius={32}
                chartConfig={getConfig({ BFO: 0, BTO: 0, DP: 0 })}
                hideLegend={false}
              />
              <Image source={Premium} style={styles.premium} />
            </View>
            <View>
              <LineChart
                data={dataLine}
                width={width - 20}
                style={{ paddingRight: 35, marginTop: 20 }}
                height={height / 4}
                chartConfig={getConfig({ BFO: 0, BTO: 0, DP: 0 })}
              />
              <Image source={Premium} style={styles.premium} />
            </View>
          </ScrollView>
        </View>
      )}
      <Modal animationType="fade" transparent={true} visible={isLoading}>
        <View
          style={{
            flex: 1,
            backgroundColor:
              mode === "light" ? `${light.main4}FF` : `${dark.main1}FF`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size={80} color={light.main2} />
          <TextStyle
            bigParagraph
            color={mode === "dark" ? dark.textWhite : light.textDark}
            customStyle={{ marginTop: 15 }}
          >
            CARGANDO
          </TextStyle>
          <TextStyle smallParagraph color={light.main2}>
            POR FAVOR ESPERE
          </TextStyle>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 2,
    padding: 5,
    borderRadius: 8,
    borderWidth: 2,
  },
  cardPicker: {
    padding: 2,
    borderRadius: 8,
  },
  card: {
    padding: 6,
    width: Math.floor(width / 3.25),
    marginHorizontal: 5,
    height: Math.floor(height / 13),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  premium: {
    height: Math.floor(width / 20),
    width: Math.floor(width / 20),
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default StatisticScreen;

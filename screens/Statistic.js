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
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import { thousandsSystem, randomColor, months } from "@helpers/libs";
import { Picker } from "@react-native-picker/picker";
import theme from "@theme";
import { TouchableOpacity } from "react-native";

import Premium from "@assets/icons/premium.png";

const dark = theme.colors.dark;
const light = theme.colors.light;

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const Statistic = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const economy = useSelector((state) => state.economy);
  const orders = useSelector((state) => state.orders);
  const reservations = useSelector((state) => state.reservations);
  const roster = useSelector((state) => state.roster);
  const salesProductsAndServices = useSelector((state) => state.sales);

  const [isLoading, setIsLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [purchase, setPurchase] = useState(0);
  const [expense, setExpense] = useState(0);
  const [sales, setSales] = useState(0);
  const [food, setFood] = useState(0);
  const [productsAndServices, setProductsAndServices] = useState(0);

  const [people, setPeople] = useState(0);
  const [amount, setAmount] = useState(0);

  const [days, setDays] = useState([]);
  const [years, setYears] = useState([]);

  const [day, setDay] = useState("all");
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");

  const [ro, setRo] = useState(0);
  const [ros, setRos] = useState([]);

  const [receivable, setReceivable] = useState(0);
  const [receivableTotal, setReceivableTotal] = useState(0);
  const [receivables, setReceivables] = useState([]);

  const [accountsPayable, setAccountsPayable] = useState([]);
  const [accountsPayableAmount, setAccountsPayableAmount] = useState(0);
  const [accountsPayableAmountTotal, setAccountsPayableAmountTotal] =
    useState(0);

  const [averageUtility, setAverageUtility] = useState(0);
  const [discharge, setDischarge] = useState(0);
  const [income, setIncome] = useState(0);

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
    let food = 0;
    let accountsPayableAmount = 0;
    let accountsPayableAmountTotal = 0;
    let expenseAndInvestmentAccountPayable = 0;
    let purchaseAndCostAccountPayable = 0;
    let receivable = 0;
    let receivableTotal = 0;
    let receivables = [];
    let ro = 0;
    let purchases = [];
    let expenses = [];
    let ros = [];
    let accountsPayable = [];
    let productsAndServices = 0;

    for (let data of roster) {
      const date = new Date(data.creationDate);
      if (dateValidation(date)) continue;
      ro += parseInt(data.amount);
      ros.push(data);
    }

    for (let reservation of reservations) {
      const date = new Date(reservation.creationDate);
      const calculatedAmount =
        reservation.discount > 0
          ? reservation.amount - reservation.discount
          : reservation.amount;
      if (dateValidation(date)) continue;
      people += reservation.hosted.length;
      amount += calculatedAmount;

      const ids = reservation.hosted.filter((h) => h.owner).map((h) => h.owner);

      for (let id of ids) {
        const eco = economy.find((e) => e.ref === id);
        if (eco && eco.amount !== eco.payment) continue;
        sales += amountTotal;
      }
    }

    for (let data of economy) {
      const date = new Date(data.creationDate);
      if (dateValidation(date)) continue;
      if (data.amount !== data.payment) {
        if (data.type !== "debt") {
          accountsPayableAmount += parseInt(data.amount - data.payment);
          accountsPayableAmountTotal += parseInt(data.amount);
          accountsPayable.push(data);
        }

        if (data.type === "expense")
          expenseAndInvestmentAccountPayable += parseInt(data.amount);
        if (data.type === "purchase")
          purchaseAndCostAccountPayable += parseInt(data.amount);

        if (data.type === "debt") {
          receivable += parseInt(data.amount - data.payment);
          receivableTotal += parseInt(data.amount);
          receivables.push(data);
        }
      } else {
        if (data.type === "purchase") {
          purchase += parseInt(data.amount);
          purchases.push(data);
        }
        if (data.type === "expense") {
          expense += parseInt(data.amount);
          expenses.push(data);
        }
      }
    }

    for (let order of orders) {
      const date = new Date(order.creationDate);
      if (dateValidation(date) || !order.pay) continue;
      const eco = economy.find((e) => e.ref === order.ref);
      if (eco && eco.amount !== eco.payment) continue;
      sales += order.total;
      food += order.total;
    }

    for (let sales of salesProductsAndServices) {
      const date = new Date(sales.creationDate);
      if (dateValidation(date)) continue;
      productsAndServices += sales.total;
    }

    setProductsAndServices(productsAndServices);
    setSales(sales);
    setPeople(people);
    setAmount(amount);
    setPurchase(purchase);
    setExpense(expense);
    setPurchases(purchases);
    setExpenses(expenses);
    setFood(food);
    setRos(ros);
    setRo(ro);
    setAccountsPayable(accountsPayable);
    setAccountsPayableAmount(accountsPayableAmount);
    setAccountsPayableAmountTotal(accountsPayableAmountTotal);
    setReceivable(receivable);
    setReceivableTotal(receivableTotal);
    setReceivables(receivables);
    setAverageUtility(
      sales +
        purchase +
        ro +
        receivableTotal -
        expense -
        expenseAndInvestmentAccountPayable +
        productsAndServices
    );
    setDischarge(expense + expenseAndInvestmentAccountPayable);
    setIncome(
      sales + purchase + ro + receivableTotal + purchaseAndCostAccountPayable + productsAndServices
    );

    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  }, [day, month, year, economy, orders, roster]);

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
        onPress={() => {
          if (item.type === "debt")
            navigation.navigate("PeopleInformation", {
              type: "general",
              userType: "customer",
            });
          else
            navigation.navigate("CreateEconomy", {
              editing: true,
              item,
            });
        }}
      >
        <TextStyle
          color={mode === "light" ? light.textDark : dark.textWhite}
          verySmall
        >
          {item.name}
        </TextStyle>
        <TextStyle color={light.main2} verySmall>
          {item.type === "expense" ? "-" : item.type === "debt" ? "+" : ""}{" "}
          {thousandsSystem(item.amount)}
        </TextStyle>
      </TouchableOpacity>
    );
  };

  const Information = ({ name, value, onPress }) => {
    const [active, setActive] = useState(false);

    const Controller = ({ children, ...props }) =>
      onPress ? (
        <TouchableOpacity {...props}>{children}</TouchableOpacity>
      ) : (
        <View {...props}>{children}</View>
      );

    return (
      <>
        <Controller
          style={[
            styles.container,
            { borderColor: mode === "light" ? light.main5 : dark.main2 },
          ]}
          onPress={() => {
            if (onPress) setActive(!active);
          }}
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
        </Controller>
        {active && onPress()}
      </>
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
      amountTotal += order.total;
      sale += order.total;
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
      DPeople[creation.getMonth()] += parseInt(reservation.hosted.length);
    if (start.getFullYear() === currentDate.getFullYear())
      DReservations[start.getMonth()] += parseInt(reservation.hosted.length);

    if (dateValidation(creation)) continue;
    const calculatedAmount =
      reservation.discount > 0
        ? reservation.amount - reservation.discount
        : reservation.amount;
    amountTotal += calculatedAmount;
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
                <Picker.Item
                  label="Día"
                  value="all"
                  style={{
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                  }}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                />
                {days.map((day) => (
                  <Picker.Item
                    key={day}
                    label={`${day}`}
                    value={day}
                    style={{
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    }}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
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
                <Picker.Item
                  label="Mes"
                  value="all"
                  style={{
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                  }}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                />
                {months.map((month, index) => (
                  <Picker.Item
                    key={month}
                    label={month}
                    value={index + 1}
                    style={{
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    }}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
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
                <Picker.Item
                  label="Año"
                  value="all"
                  style={{
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                  }}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                />
                {years.map((year, index) => (
                  <Picker.Item
                    key={year}
                    label={`${year}`}
                    value={year}
                    style={{
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    }}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                ))}
              </Picker>
            </View>
          </View>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 20, height: height / 1.25 }}
          >
            <View
              style={[
                styles.container,
                { borderColor: mode === "light" ? light.main5 : dark.main2 },
              ]}
            >
              <TextStyle
                bold
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                VENTAS DIARIAS (MENÚ)
              </TextStyle>
              <View style={{ maxWidth: width / 2.5 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <TextStyle bold smallParagraph color={light.main2}>
                    {thousandsSystem(sales)}
                  </TextStyle>
                </ScrollView>
              </View>
            </View>
            <Information name="COMIDA" value={thousandsSystem(food)} />
            <Information
              name="PRODUCTOS Y SERVICIOS"
              value={thousandsSystem(productsAndServices)}
            />
            <Information name="ALOJAMIENTO" value={thousandsSystem(amount)} />
            <Information
              name="GASTOS/INVERSIÓN"
              value={thousandsSystem(expense)}
              onPress={() =>
                expenses.length !== 0 ? (
                  <FlatList
                    data={expenses}
                    style={{ marginVertical: 15 }}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id + item.modificationDate}
                    renderItem={(item) => <Economy {...item} />}
                  />
                ) : (
                  <TextStyle
                    verySmall
                    color={light.main2}
                    customStyle={{ margin: 5 }}
                  >
                    No hay gatos o inversiones realizados
                  </TextStyle>
                )
              }
            />
            <Information
              name="COMPRAS/COSTOS"
              value={thousandsSystem(purchase)}
              onPress={() =>
                purchases.length !== 0 ? (
                  <FlatList
                    data={purchases}
                    style={{ marginVertical: 15 }}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id + item.modificationDate}
                    renderItem={(item) => <Economy {...item} />}
                  />
                ) : (
                  <TextStyle
                    verySmall
                    color={light.main2}
                    customStyle={{ margin: 5 }}
                  >
                    No hay compras o costos realizados
                  </TextStyle>
                )
              }
            />
            <Information
              name="PAGOS DE NÓMINA"
              value={thousandsSystem(ro)}
              onPress={() =>
                ros.length !== 0 ? (
                  <FlatList
                    data={ros}
                    style={{ marginVertical: 15 }}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id + item.modificationDate}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.card,
                          {
                            backgroundColor:
                              mode === "light" ? light.main5 : dark.main2,
                          },
                        ]}
                        onPress={() =>
                          navigation.navigate("CreateRoster", {
                            editing: true,
                            item,
                          })
                        }
                      >
                        <TextStyle
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                          verySmall
                        >
                          {item.name}
                        </TextStyle>
                        <TextStyle color={light.main2} verySmall>
                          {thousandsSystem(item.amount)}
                        </TextStyle>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <TextStyle
                    verySmall
                    color={light.main2}
                    customStyle={{ margin: 5 }}
                  >
                    No hay nominas realizadas
                  </TextStyle>
                )
              }
            />
            <Information
              name="CUENTAS POR PAGAR"
              value={`${thousandsSystem(
                accountsPayableAmountTotal
              )}/${thousandsSystem(
                accountsPayableAmountTotal - accountsPayableAmount
              )}`}
              onPress={() =>
                accountsPayable.length !== 0 ? (
                  <FlatList
                    data={accountsPayable}
                    style={{ marginVertical: 15 }}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id + item.modificationDate}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.card,
                          {
                            backgroundColor:
                              mode === "light" ? light.main5 : dark.main2,
                          },
                        ]}
                        onPress={() =>
                          navigation.navigate("CreateEconomy", {
                            editing: true,
                            item,
                            pay: true,
                          })
                        }
                      >
                        <TextStyle
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                          verySmall
                        >
                          {item.name}
                        </TextStyle>
                        <TextStyle color={light.main2} verySmall>
                          Deuda {thousandsSystem(item.amount - item.payment)}
                        </TextStyle>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <TextStyle
                    verySmall
                    color={light.main2}
                    customStyle={{ margin: 5 }}
                  >
                    No hay cuentas por pagar
                  </TextStyle>
                )
              }
            />
            <Information
              name="CUENTAS POR COBRAR"
              value={`${thousandsSystem(receivableTotal)}/${thousandsSystem(
                receivableTotal - receivable
              )}`}
              onPress={() =>
                receivables.length !== 0 ? (
                  <FlatList
                    data={receivables}
                    style={{ marginVertical: 15 }}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id + item.modificationDate}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.card,
                          {
                            backgroundColor:
                              mode === "light" ? light.main5 : dark.main2,
                          },
                        ]}
                        onPress={() =>
                          navigation.navigate("CreateEconomy", {
                            type: item.type,
                            editing: true,
                            item,
                            pay: true,
                          })
                        }
                      >
                        <TextStyle
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                          verySmall
                        >
                          {item.owner?.name?.slice(0, 8)}
                          {item.owner?.name?.length > 8 ? "..." : ""}
                        </TextStyle>
                        <TextStyle color={light.main2} verySmall>
                          Deuda {thousandsSystem(item.amount - item.payment)}
                        </TextStyle>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <TextStyle
                    verySmall
                    color={light.main2}
                    customStyle={{ margin: 5 }}
                  >
                    No hay cuentas por cobrar
                  </TextStyle>
                )
              }
            />
            <Information name="HUÉSPEDES" value={thousandsSystem(people)} />
            <Information
              name="UTILIDAD PROMEDIO"
              value={thousandsSystem(averageUtility)}
            />
            <Information
              name="TOTAL EGRESO"
              value={thousandsSystem(discharge)}
            />
            <View
              style={[
                styles.container,
                { borderColor: mode === "light" ? light.main5 : dark.main2 },
              ]}
            >
              <TextStyle
                bold
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                TOTAL INGRESO
              </TextStyle>
              <View style={{ maxWidth: width / 2.5 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <TextStyle bold smallParagraph color={light.main2}>
                    {thousandsSystem(income)}
                  </TextStyle>
                </ScrollView>
              </View>
            </View>
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

export default Statistic;

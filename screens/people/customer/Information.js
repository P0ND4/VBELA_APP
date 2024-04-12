import { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { getFontSize, thousandsSystem, changeDate, print, generatePDF } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import Logo from "@assets/logo.png";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import Information from "components/Information";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("screen");
const { light, dark } = theme();

const Table = ({ item }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const navigation = useNavigation();

  return (
    <View style={{ flexDirection: "row" }}>
      <View style={[styles.table, { borderColor: textColor, width: 80 }]}>
        <TextStyle color={textColor} smallParagraph>
          {changeDate(new Date(item.date))}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 75 }]}>
        <TextStyle color={textColor} smallParagraph>
          {thousandsSystem(item.quantity)}
        </TextStyle>
      </View>
      <TouchableOpacity
        style={[styles.table, { borderColor: textColor, width: 90 }]}
        onPress={() => {
          if (item.details === "accommodation")
            navigation.navigate("AccommodationReserveInformation", { ids: [item.id] });
          if (item.details === "standard")
            navigation.navigate("StandardReserveInformation", { id: item.id });
        }}
      >
        <TextStyle color={textColor} smallParagraph>
          {item.details === "accommodation"
            ? "Acomodación"
            : item.details === "standard"
            ? "Estandar"
            : item.details === "sale"
            ? "P&S"
            : "Restaurante"}
        </TextStyle>
      </TouchableOpacity>
      <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
        <TextStyle color={textColor} smallParagraph>
          {thousandsSystem(item.total || "0")}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
        <TextStyle color={textColor} smallParagraph>
          {thousandsSystem(item.payment || "0")}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
        <TextStyle color={textColor} smallParagraph>
          {item.debt ? thousandsSystem(item.debt || "0") : "SIN DEUDA"}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
        <TextStyle color={textColor} smallParagraph>
          {item?.status === "pending"
            ? "PENDIENTE"
            : item?.status === "business"
            ? "POR EMPRESA"
            : item?.status === "paid"
            ? "PAGADO"
            : "ESPERANDO"}
        </TextStyle>
      </View>
    </View>
  );
};

const Card = ({ item }) => {
  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);

  const navigation = useNavigation();

  const [isOpen, setIsOpen] = useState(false);
  const [isName, setIsName] = useState(true);
  const [total, setTotal] = useState(null);
  const [debt, setDebt] = useState(null);
  const [payment, setPayment] = useState(null);
  const [details, setDetails] = useState(null);

  const [activeInformation, setActiveInformation] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const dispatch = useDispatch();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const getSalesPrice = ({ sales, type }) => {
    const found = sales.filter((s) => s.ref === item.id || item.clientList?.some((c) => s.ref === c.id));

    const selections = found.reduce((a, b) => [...a, ...b.selection], []);
    const methods = selections.reduce((a, b) => [...a, ...b.method], []);

    const total = selections.reduce((a, b) => a + b.total, 0);
    const debt = methods.reduce((a, b) => (b.method === "credit" ? a + b.total : a), 0);
    const payment = methods.reduce((a, b) => (b.method !== "credit" ? a + b.total : a), 0);

    return {
      total,
      debt,
      payment,
      orders: found.map((f) => {
        const quantity = f.selection.reduce((a, b) => a + b.quantity, 0);
        const paid = f.selection.reduce((a, b) => a + b.paid, 0);
        const methods = f.selection.reduce((a, b) => [...a, ...b.method], []);

        return {
          id: f.id,
          date: f.creationDate,
          quantity,
          details: type,
          total: f.total,
          payment: methods.reduce((a, b) => (b.method !== "credit" ? a + b.total : a), 0),
          debt: methods.reduce((a, b) => (b.method === "credit" ? a + b.total : a), 0),
          status: methods.some((m) => m.method === "credit")
            ? "credit"
            : quantity === paid
            ? "paid"
            : "pending",
        };
      }),
    };
  };

  const getAccommodationPrice = ({ accommodations }) => {
    const condition = (a) => {
      const itemIds = item.special ? item.clientList.map((i) => i.id) : [item.id];
      return itemIds.some((id) => id === a.owner || a.hosted?.some((h) => h.owner === id));
    };

    const getTotal = (r) => r.reduce((a, b) => a + b?.total, 0);
    const getPayment = (r) => r.reduce((a, b) => a + b?.payment.reduce((a, b) => a + b.amount, 0), 0);

    const debts = accommodations.filter((a) => a.status !== "business" && condition(a));
    const all = accommodations.filter((a) => condition(a));

    return {
      total: getTotal(debts),
      debt: Math.max(getTotal(debts) - getPayment(debts), 0),
      payment: getPayment(debts),
      reservations: all.map((a) => {
        const payment = a.payment.reduce((a, b) => a + b.amount, 0);
        return {
          id: a.id,
          date: a.creationDate,
          quantity: a.hosted?.filter((h) => h.owner)?.length || 1,
          details: a.type,
          total: a.total,
          payment,
          debt: !["business", "paid"].includes(a.status) ? a.total - payment : 0,
          status: a.status,
        };
      }),
    };
  };

  useEffect(() => {
    const accommodation = getAccommodationPrice({ accommodations: accommodationReservations });
    const standard = getAccommodationPrice({ accommodations: standardReservations });
    const order = getSalesPrice({ sales: orders, type: "order" });
    const sale = getSalesPrice({ sales, type: "sale" });
    setDebt(accommodation.debt + standard.debt + order.debt + sale.debt);
    setTotal(accommodation.total + standard.total + order.total + sale.total);
    setPayment(accommodation.payment + standard.payment + order.payment + sale.payment);

    const details = [
      ...accommodation.reservations,
      ...standard.reservations,
      ...order.orders,
      ...sale.orders,
    ];
    setDetails(details.sort((d) => d.date));
  }, [accommodationReservations, standardReservations]);

  const deleteInformation = ({ id }) => {
    Alert.alert(
      `¿Estás seguro que quieres eliminar los datos económicos?`,
      "No podrá recuperar esta información una vez borrada",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {},
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      <View>
        <View style={[styles.card, { backgroundColor: mode === "light" ? light.main5 : dark.main2 }]}>
          <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.row}>
            <TouchableOpacity onPress={() => item.identification && setIsName(!isName)}>
              <TextStyle color={textColor}>
                {isName
                  ? `${item.name.slice(0, 15)}${item.name.length > 15 ? "..." : ""}`
                  : thousandsSystem(item.identification)}
              </TextStyle>
            </TouchableOpacity>
            <TextStyle color={light.main2}>{thousandsSystem(debt || "0")}</TextStyle>
          </TouchableOpacity>
          {isOpen && (
            <View style={{ marginTop: 8 }}>
              <TextStyle color={textColor}>
                Total: <TextStyle color={light.main2}>{thousandsSystem(total || "0")}</TextStyle>
              </TextStyle>
              <TextStyle color={textColor}>
                Pagado:{" "}
                <TextStyle color={light.main2}>
                  {thousandsSystem(payment || "0")}{" "}
                  {total - payment < 0
                    ? `(${thousandsSystem(Math.abs(total - payment))} DE PROPINA)`
                    : ""}
                </TextStyle>
              </TextStyle>
              <TextStyle color={textColor}>
                Deuda: <TextStyle color={light.main2}>{thousandsSystem(debt || "0")}</TextStyle>
              </TextStyle>

              {showDetails && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 15, marginBottom: 5 }}
                >
                  <View>
                    <View style={{ flexDirection: "row" }}>
                      <View style={[styles.table, { borderColor: textColor, width: 80 }]}>
                        <TextStyle color={light.main2} smallParagraph>
                          FECHA
                        </TextStyle>
                      </View>
                      <View style={[styles.table, { borderColor: textColor, width: 75 }]}>
                        <TextStyle color={light.main2} smallParagraph>
                          CANTIDAD
                        </TextStyle>
                      </View>
                      <View style={[styles.table, { borderColor: textColor, width: 90 }]}>
                        <TextStyle color={light.main2} smallParagraph>
                          DETALLE
                        </TextStyle>
                      </View>
                      <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
                        <TextStyle color={light.main2} smallParagraph>
                          TOTAL
                        </TextStyle>
                      </View>
                      <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
                        <TextStyle color={light.main2} smallParagraph>
                          PAGADO
                        </TextStyle>
                      </View>
                      <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
                        <TextStyle color={light.main2} smallParagraph>
                          CRÉDITO
                        </TextStyle>
                      </View>
                      <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
                        <TextStyle color={light.main2} smallParagraph>
                          ESTADO
                        </TextStyle>
                      </View>
                    </View>
                    <FlatList
                      data={details}
                      initialNumToRender={2}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => <Table item={item} />}
                    />
                  </View>
                </ScrollView>
              )}
              {details.length > 0 && (
                <ButtonStyle
                  style={{ marginTop: 10 }}
                  backgroundColor={mode === "light" ? dark.main2 : dark.main5}
                  onPress={() => setShowDetails(!showDetails)}
                >
                  <TextStyle center color={mode === "light" ? dark.textWhite : light.textDark}>
                    {showDetails ? "Cerrar" : "Mostrar"} detalles
                  </TextStyle>
                </ButtonStyle>
              )}
            </View>
          )}
        </View>
      </View>
      <Information
        modalVisible={activeInformation}
        setModalVisible={setActiveInformation}
        style={{ width: "90%" }}
        title="INFORMACIÓN"
        content={() => (
          <View>
            <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
              Más detalle de la deuda
            </TextStyle>
            <View style={{ marginTop: 10 }}>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Creación:{" "}
                <TextStyle color={light.main2}>{changeDate(new Date(item.creationDate))}</TextStyle>
              </TextStyle>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Modificación:{" "}
                <TextStyle color={light.main2}>{changeDate(new Date(item.modificationDate))}</TextStyle>
              </TextStyle>
            </View>
          </View>
        )}
      />
    </>
  );
};

const CustomerInformation = ({ route }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);
  const customers = useSelector((state) => state.customers);

  const [logs, setLogs] = useState(null);
  const [html, setHtml] = useState("");

  const type = route.params.type;
  const id = route.params.id;

  const dispatch = useDispatch();

  useEffect(() => {
    if (type === "individual") setLogs([customers.find((c) => c.id === id)]);
    else setLogs(customers);
  }, [id, customers]);

  const removeEverything = () => {
    Alert.alert(
      "¿Estás seguro que quieres eliminar todo el registro?",
      "No podrá recuperar la información una vez borrada",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {},
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Layout>
      <View style={styles.row}>
        <TextStyle subtitle color={mode === "light" ? light.textDark : dark.textWhite}>
          {type === "individual" ? "Específico" : "General"}
        </TextStyle>
        {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
          {logs?.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "PROXIMAMENTE",
                  "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR"
                );
                // print({ html })
              }}
            >
              <Ionicons
                name="print"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {logs?.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "PROXIMAMENTE",
                  "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR"
                );
                // generatePDF({ html })
              }}
            >
              <Ionicons
                name="document-attach"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {logs?.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "PROXIMAMENTE",
                  "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR"
                );
              }}
            >
              <Ionicons
                name="filter"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
        </View> */}
      </View>
      <View style={{ marginTop: 20 }}>
        {!logs && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator color={light.main2} size="large" />
            <TextStyle
              style={{ marginTop: 8 }}
              center
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              CARGANDO
            </TextStyle>
          </View>
        )}
        {logs?.length === 0 && (
          <TextStyle style={{ marginTop: 20 }} center color={light.main2}>
            NO HAY REGISTROS
          </TextStyle>
        )}
        {logs && (
          <FlatList
            data={logs}
            style={{
              flexGrow: 1,
              maxHeight: SCREEN_HEIGHT / 1.3,
            }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            initialNumToRender={2}
            renderItem={({ item }) => <Card item={item} />}
          />
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    marginVertical: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
  },
  swipe: {
    marginHorizontal: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  table: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default CustomerInformation;

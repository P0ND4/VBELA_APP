import { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { thousandsSystem, changeDate } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
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
        style={[styles.table, { borderColor: textColor, width: 100 }]}
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

  const getTradePrice = (trades) => {
    const selections = trades.reduce((a, b) => [...a, ...b.selection], []);
    const methods = selections.reduce((a, b) => [...a, ...b.method], []);
    const credits = methods.filter((m) => m.method === "credit");
    const debt = credits.reduce((a, b) => a + b.total, 0);
    const total = selections.reduce((a, b) => a + b.total, 0);
    return { total, paid: total - debt, debt };
  };

  const getAccommodationPrice = (accommodations) => {
    const total = accommodations.reduce((a, b) => a + b.total, 0);
    const paid = accommodations.reduce((a, b) => a + b.payment.reduce((a, b) => a + b.amount, 0), 0);
    return { total, paid, debt: Math.max(total - paid, 0) };
  };

  const filterTrades = (trades) =>
    trades.map((tr) => {
      const quantity = tr.selection.reduce((a, b) => a + b.quantity, 0);
      const paid = tr.selection.reduce((a, b) => a + b.paid, 0);
      const methods = tr.selection.reduce((a, b) => [...a, ...b.method], []);
      const isCredit = methods.some((m) => m.method === "credit");
      const status = isCredit ? "credit" : quantity === paid ? "paid" : "pending";

      return {
        id: tr.id,
        date: tr.creationDate,
        quantity,
        total: tr.total,
        payment: getTradePrice([tr]).paid,
        debt: getTradePrice([tr]).debt,
        status,
      };
    });

  const filterReservations = (accommodations) =>
    accommodations.map((ac) => ({
      id: ac.id,
      date: ac.creationDate,
      quantity: ac.hosted?.filter((h) => h.owner)?.length || 1,
      details: ac.type,
      total: ac.total,
      payment: getAccommodationPrice([ac]).paid,
      debt: Math.max(ac.total - getAccommodationPrice([ac]).paid, 0),
      status: ac.status,
    }));

  useEffect(() => {
    const IDS = item.special ? item.clientList.map((i) => i.id) : [item.id];

    const a = accommodationReservations?.filter((a) => IDS.includes(a.owner));
    const s = standardReservations?.filter((s) => s.hosted?.some((h) => IDS.includes(h.owner)));
    const o = orders.filter((o) => IDS.includes(o.ref));
    const f = sales.filter((o) => IDS.includes(o.ref));

    setDebt(getTradePrice([...o, ...f]).debt + getAccommodationPrice([...a, ...s]).debt);
    setTotal(getTradePrice([...o, ...f]).total + getAccommodationPrice([...a, ...s]).total);
    setPayment(getTradePrice([...o, ...f]).paid + getAccommodationPrice([...a, ...s]).paid);

    const details = [...filterReservations([...a, ...s]), ...filterTrades([...o, ...f])];
    setDetails(details.sort((d) => d.date));
  }, [accommodationReservations, standardReservations]);

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
              <View
                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}
              >
                <View>
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
                </View>
                <ButtonStyle
                  backgroundColor={light.main2}
                  style={{ width: "auto" }}
                  onPress={() =>
                    navigation.navigate("CustomerInvoice", {
                      id: item.id,
                      invoice: item.id.slice(0, 7),
                      everything: true,
                    })
                  }
                >
                  <TextStyle smallParagraph>Ver factura</TextStyle>
                </ButtonStyle>
              </View>
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
                      <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
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
                size={32}
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
                size={32}
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
                size={32}
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

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
import { Swipeable } from "react-native-gesture-handler";
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
        style={[styles.table, { borderColor: textColor, width: 85 }]}
        onPress={() => {
          if (item.details === "accommodation")
            navigation.navigate("AccommodationReserveInformation", { ids: [item.id] });
          if (item.details === "standard")
            navigation.navigate("StandardReserveInformation", { id: item.id });
        }}
      >
        <TextStyle color={textColor} smallParagraph>
          {item.details === "accommodation" ? "Acomodación" : "Estandar"}
        </TextStyle>
      </TouchableOpacity>
      <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
        <TextStyle color={textColor} smallParagraph>
          {thousandsSystem(item.total || "0")}
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
        <TextStyle color={textColor} smallParagraph>
          {item?.status === "pending"
            ? "PENDIENTE"
            : item?.status === "credit"
            ? "POR CRÉDITO"
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

  const getAccommodationPrice = ({ accommodations }) => {
    const condition = (a) => {
      const itemIds = item.special ? item.clientList.map((i) => i.id) : [item.id];
      return itemIds.some((id) => id === a.owner || a.hosted?.some((h) => h.owner === id));
    };

    const getTotal = (r) => r.reduce((a, b) => a + b?.total, 0);
    const getPayment = (r) =>
      r.reduce((a, b) => a + b?.payment.reduce((a, b) => a + b.amount, 0), 0);

    const debts = accommodations.filter((a) => a.status === "credit" && condition(a));
    const all = accommodations.filter((a) => condition(a));

    return {
      total: getTotal(all),
      debt: getTotal(debts),
      payment: getPayment(all),
      reservations: all.map((a) => ({
        id: a.id,
        date: a.creationDate,
        quantity: a.hosted?.length || 1,
        details: a.type,
        total: a.total,
        status: a.status,
      })),
    };
  };

  useEffect(() => {
    const accommodation = getAccommodationPrice({ accommodations: accommodationReservations });
    const standard = getAccommodationPrice({ accommodations: standardReservations });
    setDebt(accommodation.debt + standard.debt);
    setTotal(accommodation.total + standard.total);
    setPayment(accommodation.payment + standard.payment);

    const details = [...accommodation.reservations, ...standard.reservations];
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

  const leftSwipe = () => (
    <View style={{ justifyContent: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: light.main2 }]}
        onPress={() => {
          Alert.alert(
            "PROXIMAMENTE",
            "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR"
          );
          // setActiveInformation(!activeInformation)
        }}
      >
        <Ionicons
          name="information-circle-outline"
          color={mode === "light" ? dark.main2 : light.main5}
          size={getFontSize(21)}
        />
      </TouchableOpacity>
    </View>
  );

  const rightSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: "red" }]}
        onPress={() => {
          Alert.alert(
            "PROXIMAMENTE",
            "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR"
          );
          // deleteInformation({ id: item.id })
        }}
      >
        <Ionicons
          name="trash"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
    </View>
  );

  const SwipeableValidation = ({ condition, children }) =>
    condition ? (
      <Swipeable renderLeftActions={leftSwipe} renderRightActions={rightSwipe}>
        {children}
      </Swipeable>
    ) : (
      <View>{children}</View>
    );

  return (
    <>
      <SwipeableValidation condition={!isOpen}>
        <View
          style={[
            styles.card,
            { backgroundColor: mode === "light" ? light.main5 : dark.main2 },
          ]}
        >
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
                Total:{" "}
                <TextStyle color={light.main2}>{thousandsSystem(total || "0")}</TextStyle>
              </TextStyle>
              {debt > 0 && (
                <TextStyle color={textColor}>
                  Deuda:{" "}
                  <TextStyle color={light.main2}>{thousandsSystem(debt || "0")}</TextStyle>
                </TextStyle>
              )}
              {debt > 0 && (
                <TextStyle color={textColor}>
                  Pagado:{" "}
                  <TextStyle color={light.main2}>{thousandsSystem(payment || "0")}</TextStyle>
                </TextStyle>
              )}
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
                      <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
                        <TextStyle color={light.main2} smallParagraph>
                          DETALLE
                        </TextStyle>
                      </View>
                      <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
                        <TextStyle color={light.main2} smallParagraph>
                          TOTAL
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
              <ButtonStyle
                style={{ marginTop: 10 }}
                backgroundColor={mode === "light" ? dark.main2 : dark.main5}
                onPress={() => setShowDetails(!showDetails)}
              >
                <TextStyle center>{showDetails ? "Cerrar" : "Mostrar"} detalles</TextStyle>
              </ButtonStyle>
            </View>
          )}
        </View>
      </SwipeableValidation>
      <Information
        modalVisible={activeInformation}
        setModalVisible={setActiveInformation}
        style={{ width: "90%" }}
        title="INFORMACIÓN"
        content={() => (
          <View>
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Más detalle de la deuda
            </TextStyle>
            <View style={{ marginTop: 10 }}>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Creación:{" "}
                <TextStyle color={light.main2}>
                  {changeDate(new Date(item.creationDate))}
                </TextStyle>
              </TextStyle>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Modificación:{" "}
                <TextStyle color={light.main2}>
                  {changeDate(new Date(item.modificationDate))}
                </TextStyle>
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {logs?.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "PROXIMAMENTE",
                  "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR"
                );
                // removeEverything()
              }}
            >
              <Ionicons
                name="trash"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {logs?.length > 0 && (
            <TouchableOpacity onPress={() => {
              Alert.alert("PROXIMAMENTE", "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR")
              // print({ html })
              }}>
              <Ionicons
                name="print"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {logs?.length > 0 && (
            <TouchableOpacity onPress={() => {
              Alert.alert("PROXIMAMENTE", "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR")
              // generatePDF({ html })
              }}>
              <Ionicons
                name="document-attach"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {logs?.length > 0 && (
            <TouchableOpacity onPress={() => {
              Alert.alert("PROXIMAMENTE", "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR")
            }}>
              <Ionicons
                name="filter"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
        </View>
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

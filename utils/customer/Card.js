import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScrollView, Swipeable } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";
import { thousandsSystem, changeDate, random } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import { editUser, editPerson } from "@api";
import { remove as removeCustomer, edit as editCustomer } from "@features/people/customersSlice";
import { change as changeAccommodation } from "@features/zones/accommodationReservationsSlice";
import { change as changeStandard } from "@features/zones/standardReservationsSlice";
import { change as changeOrders } from "@features/tables/ordersSlice";
import { change as changeSales } from "@features/sales/salesSlice";
import AddPerson from "@components/AddPerson";
import StandardCustomer from "./StandardCustomer";
import SpecialCustomer from "./SpecialCustomer";
import Information from "@components/Information";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();

const Card = ({ item }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const standardReservations = useSelector((state) => state.standardReservations);
  const customers = useSelector((state) => state.customers);

  const navigation = useNavigation();

  const [isOpen, setIsOpen] = useState(false);
  const [isName, setIsName] = useState(true);
  const [debt, setDebt] = useState(null);
  const [informationVisible, setInformationVisible] = useState(false);
  const [modalVisibleAddPerson, setModalVisibleAddPerson] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => setIsName(true), [item.identification]);

  const getSalesPrice = (sales) => {
    const found = sales.filter((s) => s.ref === item.id || item.clientList?.some((c) => s.ref === c.id));

    const selections = found.reduce((a, b) => [...a, ...b.selection], []);
    const methods = selections.reduce((a, b) => [...a, ...b.method], []);

    return methods.reduce((sum, method) => (method.method === "credit" ? sum + method.total : sum), 0);
  };

  const getAccommodationPrice = (accommodations) => {
    const condition = (a) => {
      const itemIds = item.special ? item.clientList.map((i) => i.id) : [item.id];
      return itemIds.some((id) => id === a.owner || a.hosted?.some((h) => h.owner === id));
    };

    const reservations = accommodations.filter((a) => a.status !== "business" && condition(a));
    const total = reservations.reduce((a, b) => a + b?.total, 0);
    const payment = reservations.reduce((a, b) => a + b?.payment.reduce((a, b) => a + b.amount, 0), 0);

    return Math.max(total - payment, 0);
  };

  useEffect(() => {
    const salesDebt = getSalesPrice(sales);
    const ordersDebt = getSalesPrice(orders);
    const accommodationDebt = getAccommodationPrice(accommodationReservations);
    const standardDebt = getAccommodationPrice(standardReservations);
    setDebt(accommodationDebt + standardDebt + salesDebt + ordersDebt);
  }, [sales, orders, accommodationReservations, standardReservations]);

  const salesHandler = ({ item }) => {
    const navigateToMenu = () => {
      const order = orders.find((o) => o.ref === item.id && o.status === "pending");
      navigation.navigate("RestaurantCreateOrder", {
        ref: item.id,
        title: { name: "Cliente", value: item.name },
        order,
      });
    };

    const navigateToSales = () => {
      const order = sales.find((o) => o.ref === item.id && o.status === "pending");
      navigation.navigate("Sales", {
        ref: item.owner || item.id,
        title: { name: "Cliente", value: item.name },
        order,
      });
    };

    Alert.alert(
      "VENTAS",
      "¿A cuál de estas ventas quieres ingresar?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Menú",
          onPress: () => navigateToMenu(),
        },
        {
          text: "Productos&Servicios",
          onPress: () => navigateToSales(),
        },
      ],
      { cancelable: true }
    );
  };

  const checkReservation = ({ id }) => {
    const allReservations = [...standardReservations, ...accommodationReservations];
    const found = allReservations.find((r) => r?.owner === id || r?.hosted?.find((h) => h.owner === id));
    return {
      result: found,
      active:
        found?.status === "paid" &&
        (found.checkOut || found.hosted?.find((h) => h.owner === id).checkOut),
    };
  };

  const getTrades = (trades) =>
    trades.filter((s) => s.ref === item.id || item?.clientList?.some((c) => s.ref === c.id));

  const getAccommodation = (accommodations) =>
    accommodations.filter((a) => {
      const itemIds = item.special ? item.clientList.map((i) => i.id) : [item.id];
      return itemIds.some((id) => id === a.owner || a.hosted?.some((h) => h.owner === id));
    });

  const deleteCustomer = () => {
    const SAFound = getTrades(sales);
    const ORFound = getTrades(orders);
    const ACFound = getAccommodation(accommodationReservations);
    const STFound = getAccommodation(standardReservations);

    const send = async ({ sale, reservation } = {}) => {
      let change = {};

      const accommodationHandler = (changed) => {
        dispatch(changeAccommodation(changed));
        change.accommodation = changed;
      };

      const standardHandler = (changed) => {
        dispatch(changeStandard(changed));
        change.standard = changed;
      };

      if (sale && ORFound.length) {
        const ORChanged = orders.filter((o) => !ORFound.some((or) => o.id === or.id));
        dispatch(changeOrders(ORChanged));
        change.orders = ORChanged;
      }

      if (sale && SAFound.length) {
        const SAChanged = sales.filter((s) => !SAFound.some((sa) => s.id === sa.id));
        dispatch(changeSales(SAChanged));
        change.sales = SAChanged;
      }

      if (reservation && ACFound.length) {
        const ACChanged = accommodationReservations.filter((a) => !ACFound.some((ac) => a.id === ac.id));
        accommodationHandler(ACChanged);
      }

      if (reservation && STFound.length) {
        const STChanged = standardReservations.reduce((acc, s) => {
          const condition = (h) => h.owner !== item.id || item.clientList?.some((c) => c.id !== h.owner);
          const hosted = s.hosted.filter(condition);

          if (hosted.length) acc.push({ ...s, hosted });
          return acc;
        }, []);
        standardHandler(STChanged);
      }

      if (!reservation && ACFound.length) {
        const ACChanged = accommodationReservations.map((a) =>
          ACFound.some((ac) => a.id === ac.id) ? { ...a, owner: null } : a
        );
        accommodationHandler(ACChanged);
      }

      if (!reservation && STFound.length) {
        const STChanged = standardReservations.map((s) => {
          const condition = (h) => h.owner === item.id || item.clientList?.some((c) => c.id === h.owner);
          const hosted = s.hosted.map((h) => (condition(h) ? { ...h, owner: null } : h));
          return { ...s, hosted };
        });
        standardHandler(STChanged);
      }

      dispatch(removeCustomer({ id: item.id }));
      change.customers = customers.filter(({ id }) => id !== item.id);

      await editUser({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        change,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    };

    Alert.alert(
      "ATENCIÓN",
      "¿Desea eliminar los datos de este cliente, no se podrá recuperar la infomación?",
      [
        {
          text: "No estoy seguro",
          style: "cancel",
        },
        {
          text: "Estoy seguro",
          onPress: () => {
            if ([SAFound, ORFound, ACFound, STFound].every((arr) => !arr.length)) return send();

            if (SAFound.length || ORFound.length)
              return Alert.alert(
                "BIEN :)",
                "¿Desea eliminar las ventas asociada al cliente?",
                [
                  {
                    text: "No",
                    onPress: () => send(),
                  },
                  { text: "Si", onPress: () => send({ sale: true }) },
                ],
                { cancelable: true }
              );

            if (STFound.length || ACFound.length)
              return Alert.alert(
                "BIEN :)",
                "¿Desea eliminar las reservaciones asociada al cliente?",
                [
                  {
                    text: "No",
                    onPress: () => send(),
                  },
                  { text: "Si", onPress: () => send({ reservation: true }) },
                ],
                { cancelable: true }
              );

            return Alert.alert(
              "BIEN :)",
              "¿Desea eliminar la información asociada al cliente (Reservaciones, Ventas), o solo un dato?",
              [
                {
                  text: "No eliminar la información",
                  onPress: () => send(),
                },
                {
                  text: "Eliminar un solo dato",
                  onPress: () => {
                    Alert.alert(
                      "OK :)",
                      "¿Cuál de las dos informaciones desea eliminar?",
                      [
                        {
                          text: "Reservaciones",
                          onPress: () => send({ reservation: true }),
                        },
                        {
                          text: "Ventas",
                          onPress: () => send({ trade: true }),
                        },
                      ],
                      { cancelable: true }
                    );
                  },
                },
                {
                  text: "Eliminar toda la información asociada",
                  onPress: () => send({ reservation: true, trade: true }),
                },
              ],
              { cancelable: true }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const LeftSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: light.main2 }]}
        onPress={() => setInformationVisible(!informationVisible)}
      >
        <Ionicons
          name="information-circle-outline"
          color={mode === "light" ? dark.main2 : light.main5}
          size={25}
        />
      </TouchableOpacity>
    </View>
  );

  const RightSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { backgroundColor: "red" }]}
        onPress={() => deleteCustomer()}
      >
        <Ionicons
          name="trash"
          size={25}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipe, { backgroundColor: light.main2 }]}
        onPress={() => {
          navigation.navigate("CreatePerson", {
            type: "customer",
            person: item,
            editing: true,
          });
        }}
      >
        <Ionicons
          name="create"
          size={25}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
    </View>
  );

  const SwipeableValidation = ({ condition, children }) =>
    condition ? (
      <Swipeable renderLeftActions={LeftSwipe} renderRightActions={RightSwipe}>
        {children}
      </Swipeable>
    ) : (
      <View>{children}</View>
    );

  const saveHosted = async ({ cleanData, data }) => {
    const id = random(10, { number: true });
    const hosted = {
      id,
      name: data.fullName,
      identification: data.identification,
      phoneNumber: data.phoneNumber,
      city: data.city,
      address: data.address,
    };
    const newCustomer = { ...item, clientList: [...item.clientList, hosted] };
    cleanData();
    dispatch(editCustomer({ id: item.id, data: newCustomer }));
    await editPerson({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      person: { type: "customer", data: newCustomer },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const HostedFinished = () => {
    const [visible, setVisible] = useState(false);
    const [hosted, setHosted] = useState([]);

    useEffect(() => {
      setHosted(
        item.clientList.reduce((a, b) => {
          const reservation = checkReservation({ id: b.id });
          if (!reservation.active) return a;
          return [...a, b.name];
        }, [])
      );
    }, [standardReservations, accommodationReservations, item]);

    return (
      <View>
        <View style={styles.row}>
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Reservaciones finalizadas:{" "}
            <TextStyle color={light.main2}>{thousandsSystem(hosted?.length)}</TextStyle>
          </TextStyle>
          {hosted?.length > 0 && (
            <TouchableOpacity onPress={() => setVisible(!visible)}>
              <Ionicons name={visible ? "eye-off" : "eye"} color={light.main2} size={26} />
            </TouchableOpacity>
          )}
        </View>
        {visible &&
          hosted.map((name) => (
            <TextStyle color={light.main2} style={{ marginLeft: 10 }}>
              - {name}
            </TextStyle>
          ))}
      </View>
    );
  };

  return (
    <>
      <SwipeableValidation condition={!isOpen}>
        <View style={[styles.card, { backgroundColor: mode === "light" ? light.main5 : dark.main2 }]}>
          <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.row}>
            <TouchableOpacity onPress={() => item.identification && setIsName(!isName)}>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                {isName
                  ? item?.name?.slice(0, 15) + `${item?.name?.length >= 15 ? "..." : ""}`
                  : thousandsSystem(item?.identification)}
              </TextStyle>
            </TouchableOpacity>
            {debt !== null ? (
              <TextStyle color={light.main2}>{thousandsSystem(debt)}</TextStyle>
            ) : (
              <ActivityIndicator size="small" color={light.main2} />
            )}
          </TouchableOpacity>
          {isOpen && (
            <View style={{ marginTop: 15 }}>
              {item.special &&
                item.clientList?.length > 0 &&
                item.clientList?.reduce((a, b) => {
                  const value = checkReservation({ id: b.id })?.active ? 1 : 0;
                  return a + value;
                }, 0) === item.clientList?.length && (
                  <TextStyle verySmall center color={light.main2} style={{ marginBottom: 10 }}>
                    NO HAY SUB-CLIENTES ACTIVOS
                  </TextStyle>
                )}
              {item.special && item.clientList?.length === 0 && (
                <ButtonStyle
                  backgroundColor={light.main2}
                  style={[
                    styles.row,
                    {
                      justifyContent: "center",
                    },
                  ]}
                  onPress={() => setModalVisibleAddPerson(!modalVisibleAddPerson)}
                >
                  <TextStyle>Agregar persona</TextStyle>
                  <Ionicons
                    name="person-add"
                    color={light.textDark}
                    size={22}
                    style={{ marginLeft: 10 }}
                  />
                </ButtonStyle>
              )}
              {item.special &&
                item.clientList
                  .filter((i) => !checkReservation({ id: i.id })?.active)
                  .map((item) => (
                    <SpecialCustomer key={item.id} item={item} salesHandler={salesHandler} />
                  ))}
              {!item.special && <StandardCustomer item={item} salesHandler={salesHandler} />}
              {(item.clientList?.length > 0 || !item.special) && (
                <View style={styles.row}>
                  {item.special && (
                    <ButtonStyle
                      backgroundColor={light.main2}
                      style={{ width: "auto", flexGrow: 1, marginHorizontal: 2 }}
                      onPress={() => setModalVisibleAddPerson(!modalVisibleAddPerson)}
                    >
                      <TextStyle center paragrahp>
                        Agregar
                      </TextStyle>
                    </ButtonStyle>
                  )}
                  <ButtonStyle
                    backgroundColor={light.main2}
                    style={{
                      width: "auto",
                      flexGrow: item.special ? 1 : 0.9,
                      marginHorizontal: item.special ? 2 : 0,
                    }}
                    onPress={() => {
                      navigation.navigate("CustomerInformation", {
                        type: "individual",
                        id: item.id,
                      });
                    }}
                  >
                    <TextStyle center paragrahp>
                      Detalles
                    </TextStyle>
                  </ButtonStyle>
                  <RightSwipe />
                </View>
              )}
            </View>
          )}
        </View>
      </SwipeableValidation>
      <Information
        modalVisible={informationVisible}
        setModalVisible={setInformationVisible}
        style={{ width: "90%" }}
        title="INFORMACIÓN"
        content={() => (
          <View>
            <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
              Más información del cliente
            </TextStyle>
            <ScrollView style={{ marginTop: 10, maxHeight: 400 }}>
              {item.special && <HostedFinished />}
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Nombre: <TextStyle color={light.main2}>{item.name}</TextStyle>
              </TextStyle>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Identificación:{" "}
                <TextStyle color={light.main2}>{thousandsSystem(item.identification)}</TextStyle>
              </TextStyle>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Dirección: <TextStyle color={light.main2}>{item.address}</TextStyle>
              </TextStyle>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Número de teléfono: <TextStyle color={light.main2}>{item.phoneNumber}</TextStyle>
              </TextStyle>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Creación:{" "}
                <TextStyle color={light.main2}>{changeDate(new Date(item.creationDate))}</TextStyle>
              </TextStyle>
              <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                Modificación:{" "}
                <TextStyle color={light.main2}>{changeDate(new Date(item.modificationDate))}</TextStyle>
              </TextStyle>
            </ScrollView>
          </View>
        )}
      />
      <AddPerson
        modalVisible={modalVisibleAddPerson}
        setModalVisible={setModalVisibleAddPerson}
        settings={{
          email: false,
          country: false,
          days: false,
          checkIn: false,
          city: true,
          address: true,
        }}
        handleSubmit={(data) => saveHosted(data)}
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
});

export default Card;

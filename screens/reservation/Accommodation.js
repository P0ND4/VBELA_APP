import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  FlatList,
  Switch,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import {
  edit as editRS,
  remove as removeRS,
} from "@features/zones/standardReservationsSlice";
import {
  add as addRA,
  edit as editRA,
  remove as removeRA,
} from "@features/zones/accommodationReservationsSlice";
import {
  months,
  changeDate,
  thousandsSystem,
  getFontSize,
  random,
  addDays,
} from "@helpers/libs";
import {
  add as addE,
  edit as editE,
  remove as removeE,
} from "@features/function/economySlice";
import {
  editReservation,
  removeEconomy,
  editEconomy,
  removeReservation,
  addReservation,
  addEconomy
} from "@api";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import ChooseDate from "@components/ChooseDate";
import AddPerson from "@components/AddPerson";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { width, height } = Dimensions.get("screen");

const Accommodation = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const zones = useSelector((state) => state.zones);
  const user = useSelector((state) => state.user);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );
  const helperStatus = useSelector((state) => state.helperStatus);
  const orders = useSelector((state) => state.orders);
  const economy = useSelector((state) => state.economy);
  const customer = useSelector((state) => state.client);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [days, setDays] = useState([]);

  const [zoneSelected, setZoneSelected] = useState("");
  const [route, setRoute] = useState("");
  const [modalVisibleCalendar, setModalVisibleCalendar] = useState(false);

  const [modalVisiblePeople, setModalVisiblePeople] = useState(false);
  const [reservationSelected, setReservationSelected] = useState(null);

  const [daySelected, setDaySelected] = useState(null);

  const dispatch = useDispatch();

  const checkInEvent = ({ guest }) => {
    if (helperStatus.active && !helperStatus.accessToReservations) return;

    Alert.alert(
      "CAMBIAR",
      `¿El cliente ${guest.checkIn ? "no " : ""} ha llegado?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            let newReservation;

            if (guest.type === "accommodation") {
              dispatch(
                editRA({
                  id: guest.id,
                  data: {
                    ...guest,
                    checkIn: guest.checkIn ? null : new Date().getTime(),
                  },
                })
              );
            }

            if (guest.type === "standard") {
              newReservation = {
                ...standardReservations.find(
                  (r) => r.ref === guest.reservationID
                ),
              };
              const newHosted = newReservation?.hosted.map((i) => {
                if (i.id === guest.id) {
                  const newI = { ...i };
                  newI.checkIn = i.checkIn ? null : new Date().getTime();
                  return newI;
                }
                return i;
              });

              newReservation.hosted = newHosted;
              dispatch(
                editRS({
                  ref: guest.reservationID,
                  data: newReservation,
                })
              );
            }

            await editReservation({
              identifier: helperStatus.active
                ? helperStatus.identifier
                : user.identifier,
              reservation: {
                data:
                  guest.type === "standard"
                    ? newReservation
                    : [
                        {
                          ...guest,
                          checkIn: guest.checkIn ? null : new Date().getTime(),
                        },
                      ],
                type: guest.type,
              },
              helpers: helperStatus.active
                ? [helperStatus.id]
                : user.helpers.map((h) => h.id),
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const saveHosted = async ({ data, cleanData }) => {
    const id = random(10, { number: true });
    data.owner = null;
    data.checkOut = null;

    if (reservationSelected.type === "standard") {
      data.ref = reservationSelected.id;
      data.id = id;
      const reserveUpdated = {
        ...reservationSelected,
        hosted: [...reservationSelected.hosted, data],
      };
      dispatch(editRS({ ref: reservationSelected.ref, data: reserveUpdated }));
      await editReservation({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        reservation: {
          data: reserveUpdated,
          type: reservationSelected.type,
        },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    }

    if (reservationSelected.type === "accommodation") {
      data.ref = reservationSelected.ref;
      data.id = id;
      const obj = { ...data };
      const end = addDays(
        new Date(year, month - 1, daySelected),
        parseInt(data.days - 1)
      );
      obj.end = end.getTime();
      obj.start = new Date(year, month - 1, daySelected).getTime();
      obj.amount = reservationSelected.amount;
      obj.discount = data.discount;
      obj.type = reservationSelected.type;
      obj.accommodation = reservationSelected.accommodation;
      obj.payment = 0;
      obj.creationDate = new Date().getTime();
      obj.modificationDate = new Date().getTime();

      dispatch(addRA(obj));

      await addReservation({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        reservation: {
          data: [obj],
          type: reservationSelected.type,
        },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    }

    setDaySelected(null);
    setReservationSelected(null);
    cleanData();
  };

  const navigationStack = useNavigation();

  useEffect(() => {
    const days = new Date(year, month - 1, 0).getDate();
    setDays(Array.from({ length: days }, (_, i) => i + 1));
  }, [month, year]);

  const manageEconomy = async ({ ids, hosted }) => {
    for (let ownerRef of ids) {
      const person =
        customer.find((p) => p.id === ownerRef) ||
        customer.find((p) => p?.clientList?.some((c) => c.id === ownerRef));

      const client = hosted.find((h) => h.owner === ownerRef);

      if (client.payment === "business" || client.payment === 0 || !person)
        continue;

      const foundEconomy = economy.find((e) => e.ref === person.id);
      if (!foundEconomy) {
        const id = random(20);

        const newEconomy = {
          id,
          ref: person.id,
          owner: {
            identification: person.identification,
            name: person.name,
          },
          type: "debt",
          amount: client.payment,
          name: `Deuda ${person.name}`,
          payment: client.payment,
          creationDate: new Date().getTime(),
          modificationDate: new Date().getTime(),
        };

        dispatch(addE(newEconomy));
        await addEconomy({
          identifier: helperStatus.active
            ? helperStatus.identifier
            : user.identifier,
          economy: newEconomy,
          helpers: helperStatus.active
            ? [helperStatus.id]
            : user.helpers.map((h) => h.id),
        });
      } else {
        const currentEconomy = { ...foundEconomy };
        currentEconomy.amount += client.payment;
        currentEconomy.payment += client.payment;
        currentEconomy.modificationDate = new Date().getTime();
        dispatch(editE({ id: foundEconomy.id, data: currentEconomy }));
        await editEconomy({
          identifier: helperStatus.active
            ? helperStatus.identifier
            : user.identifier,
          economy: currentEconomy,
          helpers: helperStatus.active
            ? [helperStatus.id]
            : user.helpers.map((h) => h.id),
        });
      }
    }
  };

  const deleteEconomy = async ({ ids, hosted }) => {
    for (let ownerRef of ids) {
      const person =
        customer.find((p) => p.id === ownerRef) ||
        customer.find((p) => p?.clientList?.some((c) => c.id === ownerRef));

      const foundEconomy = economy.find((e) => e.ref === person.id);
      const client = hosted.find((h) => h.owner === ownerRef);

      if (client.payment === "business" || client.payment === 0 || !person)
        continue;

      if (foundEconomy) {
        const currentEconomy = { ...foundEconomy };
        currentEconomy.amount -= client.payment;
        currentEconomy.payment -= client.payment;
        currentEconomy.modificationDate = new Date().getTime();
        if (currentEconomy.amount <= 0) {
          dispatch(removeE({ id: foundEconomy.id }));
          await removeEconomy({
            identifier: helperStatus.active
              ? helperStatus.identifier
              : user.identifier,
            id: foundEconomy.id,
            helpers: helperStatus.active
              ? [helperStatus.id]
              : user.helpers.map((h) => h.id),
          });
        } else {
          dispatch(editE({ id: foundEconomy.id, data: currentEconomy }));
          await editEconomy({
            identifier: helperStatus.active
              ? helperStatus.identifier
              : user.identifier,
            economy: currentEconomy,
            helpers: helperStatus.active
              ? [helperStatus.id]
              : user.helpers.map((h) => h.id),
          });
        }
      }
    }
  };

  const backgroundSelected = (params) =>
    route === params
      ? mode === "light"
        ? light.main5
        : dark.main2
      : light.main2;

  const textColorSelected = (params) =>
    route === params
      ? mode === "light"
        ? light.textDark
        : dark.textWhite
      : light.textDark;

  const InformationGuest = ({ modalVisible, setModalVisible, item }) => {
    const [openMoreInformation, setOpenMoreInformation] = useState(false);
    const [editing, setEditing] = useState(false);
    const [OF, setOF] = useState(null);
    const [checkOutModalVisible, setCheckOutModalVisible] = useState(false);
    const [businessPayment, setBusinessPayment] = useState(false);
    const [totalToPay, setTotalToPay] = useState(0);
    const [payment, setPayment] = useState("");
    const [tip, setTip] = useState(0);

    const [handler, setHandler] = useState({
      active: true,
      key: Math.random(),
    });

    const total = useRef(
      item?.discount
        ? (item?.amount - item?.discount) * item?.days
        : item?.amount * item?.days
    );
    const hostedChangeRef = useRef(null);

    useEffect(() => {
      setTip(total.current - totalToPay);
    }, [totalToPay, total]);

    useEffect(() => {
      setOF(orders.find((o) => o.ref === item.id && !o.pay));
    }, [orders]);

    const validateCheckOut = ({ hosted }) => {
      const active = () => {
        setCheckOutModalVisible(!checkOutModalVisible);
        hostedChangeRef.current = { ...hosted, payment: hosted.payment };
      };

      if (!hosted.checkIn) {
        Alert.alert(
          `NO HA LLEGADO`,
          `El huésped no ha llegado, ¿Quiere continuar? El CHECK IN se activará`,
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Si",
              onPress: () => active(),
            },
          ],
          { cancelable: true }
        );
      } else active();
    };

    const removeCheckOut = ({ hosted }) => {
      Alert.alert("DESHACER", `¿Quieres remover CHECK OUT?`, [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            const data = [
              {
                ...hosted,
                checkOut: null,
                payment: 0,
              },
            ];

            dispatch(editRA({ id: hosted.id, data: data[0] }));
            const ids = item?.owner ? [item.owner] : [];
            console.log(ids)
            if (ids.length > 0) await deleteEconomy({ ids, hosted: [item] });

            await editReservation({
              identifier: helperStatus.active
                ? helperStatus.identifier
                : user.identifier,
              reservation: {
                data,
                type: "accommodation",
              },
              helpers: helperStatus.active
                ? [helperStatus.id]
                : user.helpers.map((h) => h.id),
            });
          },
        },
      ]);
    };

    const updateHosted = async ({ data, cleanData }) => {
      data.id = item.id;
      data.ref = item.ref;
      data.owner = item.owner;
      data.checkOut = item.checkOut;
      let reserveUpdated;
      let guest;

      if (item.type === "accommodation") {
        guest = accommodationReservations.find(
          (r) => r.id === item.reservationID
        );
        const date = new Date(guest.start);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        const end = addDays(
          new Date(year, month, day),
          parseInt(data.days - 1)
        ).getTime();
        dispatch(editRA({ id: guest.id, data: { ...guest, ...data, end } }));
      }
      if (item.type === "standard") {
        let reservationREF = standardReservations.find(
          (r) => r.ref === item.reservationID
        );
        reserveUpdated = {
          ...reservationREF,
          hosted: reservationREF.hosted.map((h) => {
            if (h.id === item.id) return data;
            return h;
          }),
        };
        dispatch(editRS({ ref: reserveUpdated.ref, data: reserveUpdated }));
      }

      cleanData();
      setModalVisible(!modalVisible);
      await editReservation({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        reservation: {
          data:
            item.type === "standard" ? reserveUpdated : [{ ...guest, ...data }],
          type: item.type,
        },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    };

    const cleanData = () => {
      setBusinessPayment(false);
      setCheckOutModalVisible(false);
      setTotalToPay(0);
      setPayment("");
      hostedChangeRef.current = null;
    };

    return (
      <>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <TouchableWithoutFeedback
            onPress={() => setModalVisible(!modalVisible)}
          >
            <View style={{ backgroundColor: "#0005", height: "100%" }} />
          </TouchableWithoutFeedback>
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: mode === "light" ? light.main4 : dark.main1,
                },
              ]}
            >
              <View style={styles.row}>
                <TextStyle color={light.main2} bigSubtitle>
                  INFORMACIÓN
                </TextStyle>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity onPress={() => setEditing(!editing)}>
                    <Ionicons
                      name="create-outline"
                      size={getFontSize(28)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <Ionicons
                      name="close"
                      size={getFontSize(28)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ marginVertical: 20 }}>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Nombre completo:{" "}
                  <TextStyle color={light.main2}>{item.fullName}</TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Correo electrónico:{" "}
                  <TextStyle color={light.main2}>{item.email}</TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Cédula:{" "}
                  <TextStyle color={light.main2}>
                    {!helperStatus.active || helperStatus.accessToReservations
                      ? thousandsSystem(item.identification)
                      : "PRIVADO"}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Número de teléfono:{" "}
                  <TextStyle color={light.main2}>{item.phoneNumber}</TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  País:{" "}
                  <TextStyle color={light.main2}>{item.country}</TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Grupo: <TextStyle color={light.main2}>{item.zone}</TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Nomenclatura:{" "}
                  <TextStyle color={light.main2}>{item.nomenclature}</TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Tipo:{" "}
                  <TextStyle color={light.main2}>
                    {item.type === "accommodation" ? "Acomodación" : "Estandar"}
                  </TextStyle>
                </TextStyle>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    CHECK IN:{" "}
                  </TextStyle>
                  <TouchableOpacity
                    onPress={() => checkInEvent({ guest: item })}
                  >
                    <TextStyle color={light.main2}>
                      {item.checkIn ? changeDate(new Date(item.checkIn)) : "NO"}
                    </TextStyle>
                  </TouchableOpacity>
                </View>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Cliente registrado:{" "}
                  <TextStyle color={light.main2}>
                    {item.owner ? "SI" : "NO"}
                  </TextStyle>
                </TextStyle>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    CHECK OUT:{" "}
                  </TextStyle>
                  <TouchableOpacity
                    onPress={() => {
                      if (item.type === "standard")
                        return navigation.navigate("ReserveInformation", {
                          reservation: [
                            standardReservations.find(
                              (r) => r.ref === item.reservationID
                            ),
                          ],
                          place: nomenclatures.find(
                            (n) => n.id === item.nomenclatureID
                          ),
                        });
                      if (
                        helperStatus.active &&
                        helperStatus.accessToReservations
                      )
                        return;
                      if (item.checkOut) removeCheckOut({ hosted: item });
                      else validateCheckOut({ hosted: item });
                    }}
                  >
                    <TextStyle color={light.main2}>
                      {item.checkOut
                        ? changeDate(new Date(item.checkOut))
                        : "NO"}
                    </TextStyle>
                  </TouchableOpacity>
                </View>

                {item.type === "accommodation" && (
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Pagado:{" "}
                    <TextStyle color={light.main2}>
                      {!helperStatus.active || helperStatus.accessToReservations
                        ? !item.payment
                          ? "EN ESPERA"
                          : item.payment === "business"
                          ? "POR EMPRESA"
                          : thousandsSystem(item.payment)
                        : "PRIVADO"}
                    </TextStyle>
                  </TextStyle>
                )}
                {openMoreInformation && (
                  <View>
                    {item.type === "accommodation" && (
                      <TextStyle
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Pago total:{" "}
                        <TextStyle color={light.main2}>
                          {thousandsSystem(
                            item.payment === "business"
                              ? "POR EMPRESA"
                              : item.payment
                          )}
                        </TextStyle>
                      </TextStyle>
                    )}
                    {item.type === "accommodation" && (
                      <TextStyle
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Costo total:{" "}
                        <TextStyle color={light.main2}>
                          {thousandsSystem(
                            item.discount
                              ? item.days * (item.amount - item.discount)
                              : item.days * item.amount
                          )}
                        </TextStyle>
                      </TextStyle>
                    )}
                    {item.type === "accommodation" && (
                      <TextStyle
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Costo por dia:{" "}
                        <TextStyle color={light.main2}>
                          {thousandsSystem(
                            item.discount
                              ? item.amount - item.discount
                              : item.amount
                          )}
                        </TextStyle>
                      </TextStyle>
                    )}
                    {item.type === "accommodation" && (
                      <TextStyle
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Costo pagado:{" "}
                        <TextStyle color={light.main2}>
                          {thousandsSystem(
                            item.payment === "business"
                              ? "POR EMPRESA"
                              : item.payment
                          )}
                        </TextStyle>
                      </TextStyle>
                    )}
                    {item.type === "accommodation" && item.discount && (
                      <TextStyle
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Descuento:{" "}
                        <TextStyle color={light.main2}>
                          {thousandsSystem(item.discount)}
                        </TextStyle>
                      </TextStyle>
                    )}
                    {item.type === "accommodation" && (
                      <TextStyle
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Días reservado:{" "}
                        <TextStyle color={light.main2}>
                          {thousandsSystem(item.days)}
                        </TextStyle>
                      </TextStyle>
                    )}
                    {item.type === "accommodation" && item.start && (
                      <TextStyle
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Fecha de registro:{" "}
                        <TextStyle color={light.main2}>
                          {changeDate(new Date(item.start))}
                        </TextStyle>
                      </TextStyle>
                    )}
                    {item.type === "accommodation" && item.end && (
                      <TextStyle
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Fecha de finalización:{" "}
                        <TextStyle color={light.main2}>
                          {changeDate(new Date(item.end))}
                        </TextStyle>
                      </TextStyle>
                    )}
                  </View>
                )}
              </View>
              <View>
                {item.type === "accommodation" && (
                  <ButtonStyle
                    backgroundColor={light.main2}
                    onPress={() => setOpenMoreInformation(!openMoreInformation)}
                  >
                    <TextStyle center>
                      {!openMoreInformation ? "Mostrar más" : "Mostrar menos"}
                    </TextStyle>
                  </ButtonStyle>
                )}
                <View style={styles.row}>
                  <ButtonStyle
                    backgroundColor={light.main2}
                    style={{ width: "49%" }}
                    onPress={() => {
                      navigation.navigate("Sales", {
                        ref: item.id,
                        name: item.fullName,
                        createClient: true,
                      });
                    }}
                  >
                    <TextStyle center>P&S</TextStyle>
                  </ButtonStyle>
                  <ButtonStyle
                    onPress={() => {
                      navigationStack.navigate("CreateOrder", {
                        editing: OF ? true : false,
                        id: OF ? OF.id : undefined,
                        ref: item.id,
                        table: item.fullName,
                        selection: OF ? OF.selection : [],
                        reservation: "Cliente",
                        createClient: true,
                      });
                    }}
                    style={{ width: "49%" }}
                    backgroundColor={
                      !OF
                        ? light.main2
                        : mode === "light"
                        ? dark.main2
                        : light.main4
                    }
                  >
                    <TextStyle
                      center
                      color={
                        !OF
                          ? light.textDark
                          : mode === "light"
                          ? dark.textWhite
                          : light.textDark
                      }
                    >
                      Menú
                    </TextStyle>
                  </ButtonStyle>
                </View>
                <ButtonStyle
                  backgroundColor={light.main2}
                  onPress={() => {
                    Alert.alert(
                      "¿Estás seguro?",
                      "Se eliminarán todos los datos de este huésped",
                      [
                        {
                          text: "No estoy seguro",
                          style: "cancel",
                        },
                        {
                          text: "Estoy seguro",
                          onPress: async () => {
                            let reserve;

                            if (item.type === "standard") {
                              const reservation = standardReservations.find(
                                (r) => r.ref === item.reservationID
                              );

                              reserve = reservation;
                            }

                            if (item.type === "accommodation") {
                              const reservation =
                                accommodationReservations.find(
                                  (r) => r.id === item.reservationID
                                );

                              reserve = { ...reservation, hosted: [item] };
                            }

                            const ids = reserve?.hosted
                              .filter(
                                (h) => h.owner && h.checkOut && h.id === item.id
                              )
                              .map((h) => h.owner);

                            const send = async () => {
                              setModalVisible(!modalVisible);

                              if (item.type === "accommodation") {
                                dispatch(removeRA({ id: item.id }));
                              }

                              if (item.type === "standard") {
                                const newReservation = { ...reserve };
                                const newHosted = reserve?.hosted.filter(
                                  (h) => h.id !== item.id
                                );
                                newReservation.hosted = newHosted;
                                if (reserve?.hosted?.length > 1) {
                                  dispatch(
                                    editRS({
                                      ref: reserve.ref,
                                      data: newReservation,
                                    })
                                  );
                                  await editReservation({
                                    identifier: helperStatus.active
                                      ? helperStatus.identifier
                                      : user.identifier,
                                    reservation: {
                                      data: newReservation,
                                      type: item.type,
                                    },
                                    helpers: helperStatus.active
                                      ? [helperStatus.id]
                                      : user.helpers.map((h) => h.id),
                                  });
                                } else
                                  dispatch(
                                    removeRS({ ref: item.reservationID })
                                  );
                              }

                              if (
                                item.type === "accommodation" ||
                                reserve?.hosted?.length === 1
                              ) {
                                await removeReservation({
                                  identifier: helperStatus.active
                                    ? helperStatus.identifier
                                    : user.identifier,
                                  reservation: {
                                    identifier:
                                      item.type === "standard"
                                        ? item.reservationID
                                        : [item.reservationID],
                                    type: item.type,
                                  },
                                  helpers: helperStatus.active
                                    ? [helperStatus.id]
                                    : user.helpers.map((h) => h.id),
                                });
                              }
                            };

                            if (ids?.length > 0) {
                              Alert.alert(
                                "ECONOMÍA",
                                "¿Quiere eliminar la información de economía de los clientes?",
                                [
                                  {
                                    text: "No",
                                    onPress: async () => await send(),
                                  },
                                  {
                                    text: "Si",
                                    onPress: async () => {
                                      await deleteEconomy({
                                        ids,
                                        hosted: reserve?.hosted,
                                      });
                                      await send();
                                    },
                                  },
                                ]
                              );
                            } else await send();
                          },
                        },
                      ],
                      { cancelable: true }
                    );
                  }}
                >
                  <TextStyle center>Eliminar huésped</TextStyle>
                </ButtonStyle>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={checkOutModalVisible}
          onRequestClose={() => cleanData()}
        >
          <TouchableWithoutFeedback onPress={() => cleanData()}>
            <View style={{ backgroundColor: "#0005", height: "100%" }} />
          </TouchableWithoutFeedback>
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: mode === "light" ? light.main4 : dark.main1,
                },
              ]}
            >
              <View>
                <View style={styles.row}>
                  <TextStyle color={light.main2} bigSubtitle>
                    CHECK OUT
                  </TextStyle>
                  <TouchableOpacity onPress={() => cleanData()}>
                    <Ionicons
                      name="close"
                      size={getFontSize(28)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                </View>
                <TextStyle
                  smallParagraph
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Añade el pago total del huésped
                </TextStyle>
              </View>
              <View>
                <View style={[styles.row, { marginVertical: 10 }]}>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {item?.fullName?.slice(0, 8)}:{" "}
                    {thousandsSystem(total.current)}
                  </TextStyle>
                  <InputStyle
                    editable={!businessPayment}
                    stylesContainer={{
                      width: width / 2.6,
                      opacity: !businessPayment ? 1 : 0.5,
                    }}
                    placeholder="Pagado"
                    keyboardType="numeric"
                    value={payment}
                    onChangeText={(num) => {
                      setPayment(thousandsSystem(num.replace(/[^0-9]/g, "")));
                      setTotalToPay(parseInt(num.replace(/[^0-9]/g, "")) || 0);
                    }}
                    maxLength={13}
                  />
                </View>
                <View>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Monto faltante:{" "}
                    <TextStyle color={light.main2}>
                      {thousandsSystem(total.current)}
                    </TextStyle>
                  </TextStyle>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Monto a pagar:{" "}
                    <TextStyle color={light.main2}>
                      {thousandsSystem(
                        businessPayment ? total.current : totalToPay
                      )}
                    </TextStyle>
                  </TextStyle>
                  {tip < 0 && (
                    <TextStyle
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Propina:{" "}
                      <TextStyle color={light.main2}>
                        {thousandsSystem(Math.abs(tip))}
                      </TextStyle>
                    </TextStyle>
                  )}
                </View>
                <View style={[styles.row, { marginVertical: 10 }]}>
                  <TextStyle smallParagraph color={light.main2}>
                    Lo pago la empresa
                  </TextStyle>
                  <Switch
                    trackColor={{ false: dark.main2, true: light.main2 }}
                    thumbColor={light.main4}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => setBusinessPayment(!businessPayment)}
                    value={businessPayment}
                  />
                </View>
                <ButtonStyle
                  backgroundColor={light.main2}
                  onPress={async () => {
                    const send = async () => {
                      const debugItem = { ...item };
                      delete debugItem.groupID;
                      delete debugItem.nomenclatureID;
                      delete debugItem.reservationID;
                      delete debugItem.zone;
                      delete debugItem.nomenclature;

                      const newData = [
                        {
                          ...debugItem,
                          checkOut: new Date().getTime(),
                          checkIn: new Date().getTime(),
                          payment: businessPayment ? "business" : totalToPay,
                        },
                      ];
                      dispatch(editRA({ id: item.id, data: newData[0] }));
                      const ids = item?.owner ? [item.owner] : [];

                      if (ids.length > 0)
                        await manageEconomy({ ids, hosted: newData });
                      cleanData();

                      await editReservation({
                        identifier: helperStatus.active
                          ? helperStatus.identifier
                          : user.identifier,
                        reservation: {
                          data: newData,
                          type: "accommodation",
                        },
                        helpers: helperStatus.active
                          ? [helperStatus.id]
                          : user.helpers.map((h) => h.id),
                      });
                    };

                    const leftover = total.current - totalToPay;

                    if (leftover !== 0 && !businessPayment) {
                      Alert.alert(
                        "ADVERTENCIA",
                        `El huésped ${
                          totalToPay < total.current
                            ? `debe ${thousandsSystem(
                                total.current - totalToPay
                              )}`
                            : `te dio una propina de ${thousandsSystem(
                                Math.abs(tip)
                              )}`
                        } ¿Estás seguro que desea continuar?`,
                        [
                          {
                            text: "Cancelar",
                            style: "cancel",
                          },
                          {
                            text: "Si",
                            onPress: async () => await send(),
                          },
                        ],
                        { cancelable: true }
                      );
                    } else await send();
                  }}
                >
                  <TextStyle center>Guardar</TextStyle>
                </ButtonStyle>
              </View>
            </View>
          </View>
        </Modal>
        <AddPerson
          key={handler.key}
          setEditing={setHandler}
          modalVisible={editing}
          setModalVisible={setEditing}
          editing={{ active: true, ...item }}
          discount={item.type === "accommodation"}
          handleSubmit={(data) => updateHosted(data)}
          type={item.type}
        />
      </>
    );
  };

  const Hosted = ({ type }) => {
    const [search, setSearch] = useState("");
    const [hosted, setHosted] = useState([]);
    const [activeFilter, setActiveFilter] = useState(false);
    const initialState = {
      active: false,
      zone: "",
      nomenclature: "",
      type: "",
      minDays: "",
      maxDays: "",
      day: "all",
      month: "all",
      year: "all",
    };
    const [filters, setFilters] = useState(initialState);

    const [days, setDays] = useState([]);
    const [years, setYears] = useState([]);
    const [nomenclaturesToChoose, setNomenclaturesToChoose] = useState([]);

    useEffect(() => {
      if (zones.length > 0) {
        const nomenclaturesFound = nomenclatures.filter(
          (n) => n.ref === filters.zone
        );
        setNomenclaturesToChoose(nomenclaturesFound);
      }
    }, [filters.zone]);

    useEffect(() => {
      const date = new Date();
      let years = [date.getFullYear()];

      for (let i = 5; i >= 0; i--) {
        years.push(years[years.length - 1] - 1);
      }

      setYears(years);
    }, []);

    useEffect(() => {
      const date = new Date();
      const days = new Date(
        filters.year === "all" ? date.getFullYear() : filters.year,
        filters.month === "all" ? 1 : filters.month + 1,
        0
      ).getDate();
      const monthDays = [];
      for (let day = 0; day < days; day++) {
        monthDays.push(day + 1);
      }
      setDays(monthDays);
    }, [filters.year, filters.month]);

    const dateValidation = (date) => {
      let error = false;
      if (filters.day !== "all" && date.getDate() !== filters.day) error = true;
      if (filters.month !== "all" && date.getMonth() + 1 !== filters.month)
        error = true;
      if (filters.year !== "all" && date.getFullYear() !== filters.year)
        error = true;
      return error;
    };

    useEffect(() => {
      const standard = standardReservations.flatMap((item) => {
        const { nomenclature, ref } = nomenclatures.find(
          (n) => n.id === item.id
        );
        const { name: zone } = zones.find((g) => g.ref === ref);

        return item.hosted
          .filter((r) =>
            type === "reservation"
              ? !r.checkIn
              : type === "hosted"
              ? !r.checkOut && r.checkIn
              : true
          )
          .map((person) => ({
            ...person,
            type: item.type,
            groupID: ref,
            nomenclatureID: item.id,
            reservationID: item.ref,
            days: item.days,
            zone,
            nomenclature,
            creationDate: item.creationDate,
            start: item.start,
          }));
      });

      const accommodation = accommodationReservations
        .filter((r) =>
          type === "reservation"
            ? !r.checkIn
            : type === "hosted"
            ? !r.checkOut && r.checkIn
            : true
        )
        .flatMap((item) => {
          const { nomenclature, ref } = nomenclatures.find(
            (n) => n.id === item.ref
          );
          const { name: zone } = zones.find((g) => g.ref === ref);

          return {
            ...item,
            groupID: ref,
            nomenclatureID: item.ref,
            reservationID: item.id,
            zone,
            nomenclature,
          };
        });

      const union = [...accommodation, ...standard];
      const hosted = union.sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
      });

      //TODO solo cambiar los que cambiaron :) en changeGeneralInformation para no saturar el guardado

      if (search || filters.active) {
        const hostedWithSearch = hosted.filter((h) => {
          const formatText = (text) =>
            text
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");

          if (
            formatText(h.fullName).includes(formatText(search)) ||
            h?.identification.includes(search) ||
            h?.identification.replace(/[^0-9]/g, "").includes(search) ||
            h?.phoneNumber.includes(search) ||
            formatText(h?.email).includes(formatText(search)) ||
            formatText(h?.country).includes(formatText(search))
          ) {
            if (!filters.active) return h;
            if (dateValidation(new Date(h.creationDate))) return;
            if (
              filters.minDays &&
              h.days < parseInt(filters.minDays.replace(/\D/g, ""))
            )
              return;
            if (
              filters.maxDays &&
              h.days > parseInt(filters.maxDays.replace(/\D/g, ""))
            )
              return;
            if (filters.type && h.type !== filters.type) return;
            if (filters.zone && h.groupID !== filters.zone) return;
            if (
              filters.nomenclature &&
              h.nomenclatureID !== filters.nomenclature
            )
              return;

            return h;
          }
        });
        setHosted(hostedWithSearch);
      } else setHosted(hosted);
    }, [search, filters]);

    const Guest = ({ guest }) => {
      const [informationModalVisible, setInformationModalVisible] =
        useState(false);

      return (
        <>
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.table,
                {
                  width: 85,
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {changeDate(new Date(guest.start))}
              </TextStyle>
            </View>
            <TouchableOpacity
              onPress={() => checkInEvent({ guest })}
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                  width: 85,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {guest.checkIn ? changeDate(new Date(guest.checkIn)) : "NO"}
              </TextStyle>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                  width: 100,
                },
              ]}
              onLongPress={() => {
                const place = nomenclatures.find(
                  (n) => n.id === guest.nomenclatureID
                );
                let reservation = [];

                if (guest?.type === "standard") {
                  const re = standardReservations.find(
                    (r) => r.ref === guest.reservationID
                  );
                  reservation.push(re);
                }

                if (guest?.type === "accommodation") {
                  const re = accommodationReservations.find(
                    (r) => r.id === guest.reservationID
                  );
                  reservation.push(re);
                }

                navigation.navigate("ReserveInformation", {
                  reservation,
                  place,
                });
              }}
              onPress={() =>
                setInformationModalVisible(!informationModalVisible)
              }
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {`${guest.fullName.slice(0, 13)}${
                  guest.fullName.length > 13 ? "..." : ""
                }`}
              </TextStyle>
            </TouchableOpacity>
            <View
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                  width: 40,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {guest.days}
              </TextStyle>
            </View>
            <View
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                  width: 90,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {guest.zone}
              </TextStyle>
            </View>
            <View
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                  width: 100,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {!helperStatus.active || helperStatus.accessToReservations
                  ? guest.checkOut && guest?.type === "standard"
                    ? "PAGADO"
                    : !guest.payment
                    ? "EN ESPERA"
                    : guest.payment === "business"
                    ? "POR EMPRESA"
                    : thousandsSystem(guest.payment)
                  : "PRIVADO"}
              </TextStyle>
            </View>
          </View>
          <InformationGuest
            modalVisible={informationModalVisible}
            setModalVisible={setInformationModalVisible}
            item={guest}
          />
        </>
      );
    };

    return (
      <View style={{ height: height / 1.55 }}>
        <View style={[styles.row, { marginBottom: 15 }]}>
          <InputStyle
            placeholder="Nombre, Cédula, Teléfono, Email"
            value={search}
            onChangeText={(text) => setSearch(text)}
            stylesContainer={{ width: "85%", marginVertical: 0 }}
            stylesInput={{
              paddingHorizontal: 6,
              paddingVertical: 5,
              fontSize: 18,
            }}
          />
          <TouchableOpacity onPress={() => setActiveFilter(!activeFilter)}>
            <Ionicons
              name="filter"
              size={getFontSize(24)}
              color={light.main2}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: "100%",
            backgroundColor: light.main2,
            paddingHorizontal: 15,
            paddingVertical: 8,
          }}
        >
          <TextStyle smallParagraph>LISTADO DE HUÉSPEDES</TextStyle>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={[
                    styles.table,
                    {
                      width: 85,
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    FECHA
                  </TextStyle>
                </View>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                      width: 85,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    CHECK IN
                  </TextStyle>
                </View>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                      width: 100,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    NOMBRE
                  </TextStyle>
                </View>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                      width: 40,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    DÍAS
                  </TextStyle>
                </View>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                      width: 90,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    GRUPO
                  </TextStyle>
                </View>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                      width: 100,
                    },
                  ]}
                >
                  <TextStyle color={light.main2} smallParagraph>
                    PAGADO
                  </TextStyle>
                </View>
              </View>
              {hosted.map((guest) => (
                <Guest guest={guest} key={guest.id} />
              ))}
            </View>
          </ScrollView>
        </ScrollView>
        <Modal
          animationType="fade"
          transparent={true}
          visible={activeFilter}
          onRequestClose={() => {
            setActiveFilter(!activeFilter);
            setFilters(initialState);
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => setActiveFilter(!activeFilter)}
          >
            <View style={{ backgroundColor: "#0005", height: "100%" }} />
          </TouchableWithoutFeedback>
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: mode === "light" ? light.main4 : dark.main1,
                },
              ]}
            >
              <View>
                <View style={styles.row}>
                  <TextStyle bigSubtitle color={light.main2} bold>
                    FILTRA
                  </TextStyle>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveFilter(false);
                      setFilters(initialState);
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={getFontSize(24)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                </View>
                <TextStyle
                  smallParagraph
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Para una búsqueda más precisa
                </TextStyle>
              </View>
              <View style={{ marginTop: 6 }}>
                <View style={[styles.row, { marginTop: 15 }]}>
                  <View style={{ width: "48%" }}>
                    <TextStyle
                      smallParagraph
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Días MIN
                    </TextStyle>
                    <InputStyle
                      value={filters.minDays}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, minDays: value });
                      }}
                      placeholder="MIN"
                      keyboardType="numeric"
                      maxLength={11}
                    />
                  </View>
                  <View style={{ width: "48%" }}>
                    <TextStyle
                      smallParagraph
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Días MAX
                    </TextStyle>
                    <InputStyle
                      value={filters.maxDays}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, maxDays: value });
                      }}
                      placeholder="MAX"
                      keyboardType="numeric"
                      maxLength={11}
                    />
                  </View>
                </View>
                <View style={{ marginTop: 10 }}>
                  <View
                    style={[
                      styles.cardPicker,
                      {
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        width: "100%",
                      },
                    ]}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={filters.type}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, type: itemValue })
                      }
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                        fontSize: 20,
                      }}
                    >
                      <Picker.Item
                        label="Selección de tipo"
                        value=""
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                      <Picker.Item
                        label="Estandar"
                        value="standard"
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />

                      <Picker.Item
                        label="Acomodación"
                        value="accommodation"
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    </Picker>
                  </View>
                </View>
                <View style={[styles.row, { marginTop: 10 }]}>
                  <View
                    style={[
                      styles.cardPicker,
                      {
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      },
                    ]}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={filters.zone}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, zone: itemValue })
                      }
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                        fontSize: 20,
                        width: width / 2.8,
                      }}
                    >
                      <Picker.Item
                        label="Grupo"
                        value=""
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                      {zones.map((zone, index) => (
                        <Picker.Item
                          key={zone.id + index}
                          label={zone.name}
                          value={zone.ref}
                          style={{
                            backgroundColor:
                              mode === "light" ? light.main5 : dark.main2,
                          }}
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      ))}
                    </Picker>
                  </View>
                  <View
                    style={[
                      styles.cardPicker,
                      {
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      },
                    ]}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={filters.nomenclature}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, nomenclature: itemValue })
                      }
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                        fontSize: 20,
                        width: width / 2.8,
                      }}
                    >
                      <Picker.Item
                        label="Nomenclatura"
                        value=""
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                      {nomenclaturesToChoose.map((n) => (
                        <Picker.Item
                          key={n.id}
                          label={n.nomenclature}
                          value={n.id}
                          style={{
                            backgroundColor:
                              mode === "light" ? light.main5 : dark.main2,
                          }}
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View style={[styles.row, { marginTop: 10 }]}>
                  <View
                    style={[
                      styles.cardPicker,
                      {
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      },
                    ]}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={filters.day}
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, day: itemValue })
                      }
                      style={{
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      ))}
                    </Picker>
                  </View>
                  <View
                    style={[
                      styles.cardPicker,
                      {
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      },
                    ]}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={filters.month}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, month: itemValue })
                      }
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      ))}
                    </Picker>
                  </View>
                  <View
                    style={[
                      styles.cardPicker,
                      {
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      },
                    ]}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={filters.year}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, year: itemValue })
                      }
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 20,
                }}
              >
                {filters.active && (
                  <ButtonStyle
                    style={{ width: "35%" }}
                    backgroundColor={
                      mode === "light" ? light.main5 : dark.main2
                    }
                    onPress={() => {
                      setActiveFilter(false);
                      setFilters(initialState);
                    }}
                  >
                    <TextStyle
                      center
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Remover
                    </TextStyle>
                  </ButtonStyle>
                )}
                <ButtonStyle
                  onPress={() => {
                    setActiveFilter(!activeFilter);
                    const compare = { ...filters, active: false };

                    if (
                      JSON.stringify(compare) === JSON.stringify(initialState)
                    ) {
                      setFilters(initialState);
                      return;
                    }
                    setFilters({ ...filters, active: true });
                  }}
                  backgroundColor={light.main2}
                  style={{
                    width: filters.active ? "60%" : "99%",
                  }}
                >
                  <TextStyle center>Buscar</TextStyle>
                </ButtonStyle>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const Location = () => {
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState([]);

    const [activeFilter, setActiveFilter] = useState(false);
    const initialState = {
      active: false,
      minDays: "",
      maxDays: "",
      type: "",
      day: "all",
      month: "all",
      year: "all",
    };
    const [filters, setFilters] = useState(initialState);

    const [days, setDays] = useState([]);
    const [years, setYears] = useState([]);

    useEffect(() => {
      const date = new Date();
      let years = [date.getFullYear()];

      for (let i = 5; i >= 0; i--) {
        years.push(years[years.length - 1] - 1);
      }

      setYears(years);
    }, []);

    useEffect(() => {
      const date = new Date();
      const days = new Date(
        filters.year === "all" ? date.getFullYear() : filters.year,
        filters.month === "all" ? 1 : filters.month + 1,
        0
      ).getDate();
      const monthDays = [];
      for (let day = 0; day < days; day++) {
        monthDays.push(day + 1);
      }
      setDays(monthDays);
    }, [filters.year, filters.month]);

    const dateValidation = (date) => {
      let error = false;
      if (filters.day !== "all" && date.getDate() !== filters.day) error = true;
      if (filters.month !== "all" && date.getMonth() + 1 !== filters.month)
        error = true;
      if (filters.year !== "all" && date.getFullYear() !== filters.year)
        error = true;
      return error;
    };

    useEffect(() => {
      const standard = standardReservations.flatMap((item) => {
        const { nomenclature, ref } = nomenclatures.find(
          (n) => n.id === item.id
        );
        const { name: zone } = zones.find((g) => g.ref === ref);

        return item.hosted.map((person) => ({
          ...person,
          type: item.type,
          groupID: ref,
          nomenclatureID: item.id,
          reservationID: item.ref,
          days: item.days,
          zone,
          nomenclature,
          creationDate: item.creationDate,
          start: item.start,
        }));
      });

      const accommodation = accommodationReservations.flatMap((item) => {
        const { nomenclature, ref } = nomenclatures.find(
          (n) => n.id === item.ref
        );
        const { name: zone } = zones.find((g) => g.ref === ref);

        return {
          ...item,
          groupID: ref,
          nomenclatureID: item.ref,
          reservationID: item.id,
          zone,
          nomenclature,
        };
      });

      const union = [...accommodation, ...standard];
      const organized = union.sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
      });

      const location = nomenclatures
        .filter((n) => n.ref === zoneSelected || !zoneSelected)
        .flatMap((item) => {
          const zone = zones.find((z) => z.ref === item.ref);
          const hosted = organized.filter((r) => r.ref === item.id);

          return { ...item, hosted, zoneName: zone?.name || "" };
        });

      if (search || filters.active) {
        const locationWithSearch = location.map((item) => ({
          ...item,
          hosted: item.hosted.filter((h) => {
            const formatText = (text) =>
              text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            if (
              formatText(h.fullName).includes(formatText(search)) ||
              h?.identification.includes(search) ||
              h?.identification.replace(/[^0-9]/g, "").includes(search) ||
              h?.phoneNumber.includes(search) ||
              formatText(h?.email).includes(formatText(search)) ||
              formatText(h?.country).includes(formatText(search))
            ) {
              if (!filters.active) return h;
              if (dateValidation(new Date(h.creationDate))) return;
              if (
                filters.minDays &&
                h.days < parseInt(filters.minDays.replace(/\D/g, ""))
              )
                return;
              if (
                filters.maxDays &&
                h.days > parseInt(filters.maxDays.replace(/\D/g, ""))
              )
                return;
              if (filters.type && h.type !== filters.type) return;

              return h;
            }
          }),
        }));
        setLocation(locationWithSearch);
      } else setLocation(location);
    }, [search, filters, standardReservations, accommodationReservations]);

    const Guest = ({ guest }) => {
      const [informationModalVisible, setInformationModalVisible] =
        useState(false);

      return (
        <>
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.table,
                {
                  width: 85,
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {changeDate(new Date(guest.start))}
              </TextStyle>
            </View>
            <TouchableOpacity
              onPress={() => checkInEvent({ guest })}
              style={[
                styles.table,
                {
                  width: 85,
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {guest.checkIn ? changeDate(new Date(guest.checkIn)) : "NO"}
              </TextStyle>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.table,
                {
                  width: 100,
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                },
              ]}
              onLongPress={() => {
                const place = nomenclatures.find(
                  (n) => n.id === guest.nomenclatureID
                );
                let reservation = [];

                if (guest?.type === "standard") {
                  const re = standardReservations.find(
                    (r) => r.ref === guest.reservationID
                  );
                  reservation.push(re);
                }

                if (guest?.type === "accommodation") {
                  const re = accommodationReservations.find(
                    (r) => r.id === guest.reservationID
                  );
                  reservation.push(re);
                }

                navigation.navigate("ReserveInformation", {
                  reservation,
                  place,
                });
              }}
              onPress={() =>
                setInformationModalVisible(!informationModalVisible)
              }
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {`${guest.fullName.slice(0, 13)}${
                  guest.fullName.length > 13 ? "..." : ""
                }`}
              </TextStyle>
            </TouchableOpacity>
            <View
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                  width: 45,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {guest.days}
              </TextStyle>
            </View>
            <View
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                  width: 100,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {!helperStatus.active || helperStatus.accessToReservations
                  ? guest.checkOut && guest?.type === "standard"
                    ? "PAGADO"
                    : !guest.payment
                    ? "EN ESPERA"
                    : guest.payment === "business"
                    ? "POR EMPRESA"
                    : thousandsSystem(guest.payment)
                  : "PRIVADO"}
              </TextStyle>
            </View>
          </View>
          <InformationGuest
            modalVisible={informationModalVisible}
            setModalVisible={setInformationModalVisible}
            item={guest}
          />
        </>
      );
    };

    return (
      <View style={{ height: height / 1.55 }}>
        <View style={[styles.row, { marginBottom: 15 }]}>
          <InputStyle
            placeholder="Nombre, Cédula, Teléfono, Email"
            value={search}
            onChangeText={(text) => setSearch(text)}
            stylesContainer={{ width: "85%", marginVertical: 0 }}
            stylesInput={{
              paddingHorizontal: 6,
              paddingVertical: 5,
              fontSize: 18,
            }}
          />
          <TouchableOpacity onPress={() => setActiveFilter(!activeFilter)}>
            <Ionicons
              name="filter"
              size={getFontSize(24)}
              color={light.main2}
            />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {location.map((item) => {
            return (
              <View key={item.id} style={{ marginBottom: 10 }}>
                <View
                  style={{
                    width: "100%",
                    backgroundColor: light.main2,
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                  }}
                >
                  <TextStyle smallParagraph>
                    {item?.zoneName?.toUpperCase()} ({item.nomenclature})
                  </TextStyle>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={{ flexDirection: "row" }}>
                      <View
                        style={[
                          styles.table,
                          {
                            width: 85,
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          FECHA
                        </TextStyle>
                      </View>
                      <View
                        style={[
                          styles.table,
                          {
                            width: 85,
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          CHECK IN
                        </TextStyle>
                      </View>
                      <View
                        style={[
                          styles.table,
                          {
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                            width: 100,
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          NOMBRE
                        </TextStyle>
                      </View>
                      <View
                        style={[
                          styles.table,
                          {
                            width: 45,
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          DÍAS
                        </TextStyle>
                      </View>
                      <View
                        style={[
                          styles.table,
                          {
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                            width: 100,
                          },
                        ]}
                      >
                        <TextStyle color={light.main2} smallParagraph>
                          PAGADO
                        </TextStyle>
                      </View>
                    </View>
                    {item.hosted.map((guest) => (
                      <Guest guest={guest} key={guest.id} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
        <Modal
          animationType="fade"
          transparent={true}
          visible={activeFilter}
          onRequestClose={() => {
            setActiveFilter(!activeFilter);
            setFilters(initialState);
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => setActiveFilter(!activeFilter)}
          >
            <View style={{ backgroundColor: "#0005", height: "100%" }} />
          </TouchableWithoutFeedback>
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: mode === "light" ? light.main4 : dark.main1,
                },
              ]}
            >
              <View>
                <View style={styles.row}>
                  <TextStyle bigSubtitle color={light.main2} bold>
                    FILTRA
                  </TextStyle>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveFilter(false);
                      setFilters(initialState);
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={getFontSize(24)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                </View>
                <TextStyle
                  smallParagraph
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Para una búsqueda más precisa
                </TextStyle>
              </View>
              <View style={{ marginTop: 6 }}>
                <View style={[styles.row, { marginTop: 15 }]}>
                  <View style={{ width: "48%" }}>
                    <TextStyle
                      smallParagraph
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Días MIN
                    </TextStyle>
                    <InputStyle
                      value={filters.minDays}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, minDays: value });
                      }}
                      placeholder="MIN"
                      keyboardType="numeric"
                      maxLength={11}
                    />
                  </View>
                  <View style={{ width: "48%" }}>
                    <TextStyle
                      smallParagraph
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Días MAX
                    </TextStyle>
                    <InputStyle
                      value={filters.maxDays}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, maxDays: value });
                      }}
                      placeholder="MAX"
                      keyboardType="numeric"
                      maxLength={11}
                    />
                  </View>
                </View>
                <View style={[styles.row, { marginTop: 10 }]}>
                  <View
                    style={[
                      styles.cardPicker,
                      {
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      },
                    ]}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={filters.day}
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, day: itemValue })
                      }
                      style={{
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      ))}
                    </Picker>
                  </View>
                  <View
                    style={[
                      styles.cardPicker,
                      {
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      },
                    ]}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={filters.month}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, month: itemValue })
                      }
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      ))}
                    </Picker>
                  </View>
                  <View
                    style={[
                      styles.cardPicker,
                      {
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      },
                    ]}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={filters.year}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, year: itemValue })
                      }
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 20,
                }}
              >
                {filters.active && (
                  <ButtonStyle
                    style={{ width: "35%" }}
                    backgroundColor={
                      mode === "light" ? light.main5 : dark.main2
                    }
                    onPress={() => {
                      setActiveFilter(false);
                      setFilters(initialState);
                    }}
                  >
                    <TextStyle
                      center
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Remover
                    </TextStyle>
                  </ButtonStyle>
                )}
                <ButtonStyle
                  onPress={() => {
                    setActiveFilter(!activeFilter);
                    const compare = { ...filters, active: false };

                    if (
                      JSON.stringify(compare) === JSON.stringify(initialState)
                    ) {
                      setFilters(initialState);
                      return;
                    }
                    setFilters({ ...filters, active: true });
                  }}
                  backgroundColor={light.main2}
                  style={{
                    width: filters.active ? "60%" : "99%",
                  }}
                >
                  <TextStyle center>Buscar</TextStyle>
                </ButtonStyle>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const Groups = () => {
    return (
      <View style={{ height: height / 1.55 }}>
        <TextStyle
          bigParagraph
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          GRUPOS
        </TextStyle>
        <FlatList
          data={zones}
          style={{ marginTop: 20 }}
          keyExtractor={(item) => item.ref}
          renderItem={({ item }) => {
            const hosted = nomenclatures
              .filter((n) => n.ref === item.ref)
              .reduce((a, n) => {
                const value =
                  n.type === "standard"
                    ? standardReservations.reduce((a, b) => {
                        if (b.id === n.id) return a + b.hosted.length;
                        return a;
                      }, 0)
                    : accommodationReservations.reduce((a, b) => {
                        if (b.ref === n.id) return a + 1;
                        return a;
                      }, 0);

                return a + value;
              }, 0);

            return (
              <TouchableOpacity
                onLongPress={() => {
                  navigation.navigate("PlaceInformation", {
                    ref: item.ref,
                    name: item?.name,
                    type: "General",
                  });
                }}
                onPress={() => {
                  navigationStack.navigate("Place", {
                    year,
                    month,
                    ref: item.ref,
                    days,
                  });
                }}
                style={[
                  styles.zone,
                  {
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                  },
                ]}
              >
                <View style={styles.row}>
                  <TextStyle color={light.main2} smallSubtitle>
                    {item?.name}
                  </TextStyle>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("PlaceInformation", {
                          ref: item.ref,
                          name: item?.name,
                          type: "General",
                        });
                      }}
                    >
                      <Ionicons
                        size={getFontSize(24)}
                        color={light.main2}
                        name="information-circle-outline"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("CreateZone", {
                          item,
                          ref: item.ref,
                          editing: true,
                        });
                      }}
                    >
                      <Ionicons
                        size={getFontSize(24)}
                        color={light.main2}
                        name="create-outline"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ marginBottom: 10 }}>
                  {item?.description && (
                    <TextStyle
                      verySmall
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Descripción: {item?.description}
                    </TextStyle>
                  )}
                  {item?.location && (
                    <TextStyle
                      verySmall
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Ubicación: {item?.location}
                    </TextStyle>
                  )}
                </View>
                <View style={styles.row}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Creación:{" "}
                    <TextStyle smallParagraph color={light.main2}>
                      {changeDate(new Date(item.creationDate))}
                    </TextStyle>
                  </TextStyle>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Alojados:{" "}
                    <TextStyle smallParagraph color={light.main2}>
                      {hosted || 0}
                    </TextStyle>
                  </TextStyle>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      {zones.length > 0 && (
        <>
          <View>
            <View style={styles.row}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {route && (
                  <TouchableOpacity
                    onPress={() => setRoute("")}
                    style={{ marginRight: 5 }}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={getFontSize(25)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                )}
                <ButtonStyle
                  style={{ width: "auto" }}
                  backgroundColor={light.main2}
                  onPress={() => setModalVisibleCalendar(!modalVisibleCalendar)}
                >
                  <TextStyle smallParagraph center>
                    Crear una reserva
                  </TextStyle>
                </ButtonStyle>
              </View>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => setRoute("historical")}>
                  <Ionicons
                    name="file-tray-stacked-outline"
                    size={getFontSize(26)}
                    color={light.main2}
                  />
                </TouchableOpacity>
                {route === "" && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("CreateZone")}
                  >
                    <Ionicons
                      name="add-circle"
                      size={getFontSize(26)}
                      color={light.main2}
                      style={{ marginLeft: 5 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {route === "location" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    }}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={zoneSelected || ""}
                      onValueChange={(value) => {
                        if (value === "CreateZone")
                          return navigation.navigate("CreateZone");
                        setZoneSelected(value);
                      }}
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        width: width / 2.8,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                        fontSize: 20,
                      }}
                    >
                      <Picker.Item
                        label="SELECCIONA"
                        value=""
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                          fontSize: getFontSize(10),
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                      {zones.map((zone, index) => (
                        <Picker.Item
                          key={zone.id + index}
                          label={zone.name}
                          value={zone.ref}
                          style={{
                            backgroundColor:
                              mode === "light" ? light.main5 : dark.main2,
                            fontSize: getFontSize(10),
                          }}
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      ))}
                      {(!helperStatus.active ||
                        helperStatus.accessToReservations) && (
                        <Picker.Item
                          label="CREAR"
                          value="CreateZone"
                          style={{
                            backgroundColor:
                              mode === "light" ? light.main5 : dark.main2,
                            fontSize: getFontSize(10),
                          }}
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      )}
                    </Picker>
                  </View>
                </View>
              )}
            </View>
            <View style={[styles.row, { marginVertical: 15 }]}>
              <ButtonStyle
                backgroundColor={backgroundSelected("hosted")}
                onPress={() => setRoute("hosted")}
                style={{ width: "auto" }}
              >
                <TextStyle color={textColorSelected("hosted")} smallParagraph>
                  ALOJADOS
                </TextStyle>
              </ButtonStyle>
              <ButtonStyle
                backgroundColor={backgroundSelected("reservations")}
                onPress={() => setRoute("reservations")}
                style={{ width: "auto" }}
              >
                <TextStyle
                  color={textColorSelected("reservations")}
                  smallParagraph
                >
                  RESERVAS
                </TextStyle>
              </ButtonStyle>
              <ButtonStyle
                backgroundColor={backgroundSelected("location")}
                onPress={() => setRoute("location")}
                style={{ width: "auto" }}
              >
                <TextStyle color={textColorSelected("location")} smallParagraph>
                  UBICACIÓN
                </TextStyle>
              </ButtonStyle>
            </View>
          </View>

          {route === "reservations" && <Hosted type="reservation" />}
          {route === "hosted" && <Hosted type="hosted" />}
          {route === "historical" && <Hosted type="historical" />}
          {!route && <Groups />}
          {route === "location" && <Location />}
        </>
      )}
      {zones.length === 0 && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ButtonStyle
            backgroundColor={light.main2}
            style={{ width: "auto", paddingHorizontal: 35 }}
            onPress={() => navigation.navigate("CreateZone")}
          >
            <TextStyle center color={light.textDark}>
              Crear grupo de alojamiento
            </TextStyle>
          </ButtonStyle>
        </View>
      )}
      <ChooseDate
        modalVisible={modalVisibleCalendar}
        setModalVisible={setModalVisibleCalendar}
        onDayPress={({ data, markedDates, nomenclatureID, cleanData }) => {
          const reservation = markedDates[data.dateString]?.reservation;
          const nom = nomenclatures.find((n) => n.id === nomenclatureID);

          if (reservation) {
            if (
              reservation.type === "standard" &&
              nom.people === reservation?.hosted?.length
            )
              return Alert.alert(
                "OOPS",
                "Ha superado el monto máximo de huéspedes permitidos en la habitación"
              );

            setDaySelected(data.day);
            setReservationSelected(reservation);
            setModalVisiblePeople(!modalVisiblePeople);
          } else {
            navigation.navigate("CreateReserve", {
              year: data.year,
              day: data.day,
              month: data.month,
              place: nom,
            });
            cleanData();
          }
        }}
      />
      <AddPerson
        modalVisible={modalVisiblePeople}
        setModalVisible={setModalVisiblePeople}
        handleSubmit={(data) => saveHosted(data)}
        discount={reservationSelected?.type === "accommodation"}
        type={reservationSelected?.type}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  premium: {
    height: Math.floor(width / 20),
    width: Math.floor(width / 20),
    position: "absolute",
    top: 0,
    right: 0,
    display: "none",
  },
  table: {
    width: 120,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
  available: {
    width: 48,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  days: {
    marginHorizontal: 2,
    height: 34,
    width: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    borderRadius: 8,
    padding: 30,
  },
  cardPicker: {
    padding: 2,
    borderRadius: 8,
  },
  zone: {
    padding: 14,
    borderRadius: 4,
    marginVertical: 4,
  },
});

export default Accommodation;

import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useDispatch, useSelector } from "react-redux";
import {
  editEconomy,
  removeEconomy,
  removeManyEconomy,
  removePerson,
  editUser,
  editReservation,
} from "@api";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import {
  edit as editEco,
  remove as removeEco,
  removeMany as removeManyEco,
} from "@features/function/economySlice";
import {
  removeManyByOwner as removeMBOR,
  edit as editR,
} from "@features/groups/reservationsSlice";
import { removeManyByOwner as removeMBOO } from "@features/tables/ordersSlice";
import { remove as removePer } from "@features/function/peopleSlice";

import { changeDate, thousandsSystem, random } from "@helpers/libs";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const People = ({ navigation, userType }) => {
  const [section, setSection] = useState("general");
  const [providers, setProviders] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filter, setFilter] = useState("");

  const user = useSelector((state) => state.user);
  const activeGroup = useSelector((state) => state.activeGroup);
  const mode = useSelector((state) => state.mode);
  const people = useSelector((state) => state.people);
  const economy = useSelector((state) => state.economy);
  const orders = useSelector((state) => state.orders);
  const groups = useSelector((state) => state.groups);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const reservations = useSelector((state) => state.reservations);

  const [modalVisible, setModalVisible] = useState(false);
  const [nomenclaturesToChoose, setNomenclaturesToChoose] = useState([]);
  const [groupSelected, setGroupSelected] = useState("");
  const [nomenclatureSelected, setNomenclatureSelected] = useState("");
  const [markedDates, setMarkedDates] = useState({});

  const [personSelected, setPersonSelected] = useState({});

  const searchRef = useRef(null);

  const dispatch = useDispatch();

  ///////////////////////

  useEffect(() => {
    if (nomenclaturesToChoose.length > 0) {
      const nomenclatureReservations = reservations.filter(
        (r) => r.id === nomenclatureSelected
      );

      let markedDates = {};
      for (let reservation of nomenclatureReservations) {
        const start = new Date(reservation.start);
        const end = new Date(reservation.end);

        let d = new Date(start);
        while (d <= end) {
          let dateISO = d.toISOString().slice(0, 10);
          const startISO = start.toISOString().slice(0, 10);
          const endISO = end.toISOString().slice(0, 10);
          markedDates[dateISO] = {
            startingDay: dateISO === startISO,
            endingDay: dateISO === endISO,
            color: light.main2,
            textColor: "#000000",
            reservation,
          };
          d.setDate(d.getDate() + 1);
        }
      }
      setMarkedDates(markedDates);
    }
  }, [nomenclatureSelected, reservations]);

  useEffect(() => {
    if (groups.length > 0) {
      const groupFound = groups.find((g) => g.ref === groupSelected);
      const nomenclaturesFound = nomenclatures.filter(
        (n) => n.ref === groupFound?.ref
      );
      setNomenclaturesToChoose(nomenclaturesFound);
    }
  }, [groupSelected]);

  /////////////////////

  const extractData = (p) => {
    const information = economy.find(
      (e) => e.ref === p.id && e.type === "debt" && e.amount !== e.payment
    );
    if (!information) return null;

    const { id, amount, payment } = information;

    const data = {
      ...p,
      economyID: id,
      economyREF: information.ref,
      amount,
      payment,
      personID: p.id,
      details: undefined,
    };
    delete data.id;

    if (userType === "customer") {
      const reser = reservations.filter(({ hosted }) =>
        hosted.some(({ owner }) => owner === p.id)
      );
      const reservationsSorted = reser.map(({ creationDate, hosted }) => {
        const day = new Date(creationDate).getDate();
        const month = new Date(creationDate).getMonth() + 1;
        const client = hosted.find((h) => h.owner === p.id);

        return {
          quantity: hosted.length,
          date: `${("0" + day).slice(-2)}-${("0" + month).slice(-2)}`,
          total:
            client.payment === 0
              ? "EN ESPERA"
              : client.payment === "business"
              ? "POR EMPRESA"
              : client.payment,
          type: "reservations",
        };
      });

      const ordersSorted = orders
        .filter((o) => o.ref === information.ref)
        .map(({ creationDate, selection }) => {
          const day = new Date(creationDate).getDate();
          const month = new Date(creationDate).getMonth() + 1;
          return {
            quantity: selection.reduce(
              (a, { count }) => a + parseInt(count),
              0
            ),
            date: `${("0" + day).slice(-2)}-${("0" + month).slice(-2)}`,
            total: selection.reduce((a, { total }) => a + parseInt(total), 0),
            type: "orders",
          };
        });

      const union = [...reservationsSorted, ...ordersSorted];

      const details = union.reduce((acc, item) => {
        const found = acc.findIndex((d) => d.date === item.date);

        if (found === -1) {
          const data = {
            date: item.date,
            [item.type]: {
              quantity: item.quantity,
              total: item.total,
            },
          };
          acc.push(data);
        } else {
          const type = acc[found][item.type];
          acc[found] = {
            ...acc[found],
            [item.type]: {
              quantity: type ? type.quantity + item.quantity : item.quantity,
              total: type ? type.total + item.total : item.total,
            },
          };
        }
        return acc;
      }, []);

      data.details = details.sort((a, b) => a.date > b.date);
    }
    return data;
  };

  const findProviders = () => {
    if (section === "general") {
      setProviders(
        [
          ...people
            .filter((p) => p.type === userType)
            .map(({ id, ...rest }) => ({ ...rest, personID: id })),
        ].reverse()
      );
    }

    if (section === "debt") {
      if (userType === "customer")
        setProviders(
          [...people.map((p) => extractData(p)).filter((v) => v)].reverse()
        );
      if (userType === "supplier")
        setProviders(
          [
            ...economy
              .filter((e) => e.amount !== e.payment && e.type !== "debt")
              .map(({ ref, id, ...rest }) => ({
                ...rest,
                personID: ref,
                economyID: id,
                economyREF: ref,
              })),
          ].reverse()
        );
    }
  };

  useEffect(() => {
    findProviders();
  }, [people, section, economy]);

  useEffect(() => {
    if (filter.length !== 0) {
      setProviders(
        [
          ...people.filter(
            (p) =>
              (p.name.toLowerCase()?.includes(filter.toLowerCase()) ||
                p.identification?.includes(filter) ||
                thousandsSystem(p.identification)?.includes(filter)) &&
              p.type === userType
          ),
        ].reverse()
      );
    } else findProviders();
  }, [filter]);

  const deletePerson = (data) => {
    const removeP = async () => {
      dispatch(removePer({ id: data.personID }));
      await removePerson({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        id: data.personID,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    };

    const deleteEco = async () => {
      dispatch(removeManyEco({ ref: data.personID }));
      await removeManyEconomy({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        ref: data.personID,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    };

    const sendEditUser = async (change) => {
      await editUser({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        change,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    };

    const newReservations = reservations.reduce((acc, reservation) => {
      const filteredHosted = reservation.hosted.filter(
        (hosted) => hosted.owner !== data.personID
      );
      return filteredHosted.length
        ? [...acc, { ...reservation, hosted: filteredHosted }]
        : acc;
    }, []);

    Alert.alert(
      "Oye!",
      `¿Estás seguro que desea eliminar el ${
        userType === "supplier" ? "proveedor" : "cliente"
      }?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: () => {
            const economies = economy.filter((e) => e.ref === data.personID);
            const reservationRef = reservations.some((r) =>
              r.hosted.some((h) => h.owner === data.personID)
            );
            if (
              (userType === "supplier" && !economies.length) ||
              (userType === "customer" &&
                !reservationRef &&
                !orders.filter((o) => o.ref === data.personID).length)
            ) {
              return removeP();
            }

            Alert.alert(
              "Bien",
              `¿Quieres eliminar los datos económicos hecho por el ${
                userType === "supplier" ? "proveedor" : "cliente"
              }?`,
              [
                {
                  text: "Cancelar",
                  style: "cancel",
                },
                {
                  text: "No",
                  onPress: async () => removeP(),
                },
                {
                  text: "Si",
                  onPress: async () => {
                    if (userType === "supplier") {
                      removeP();
                      return deleteEco();
                    }

                    Alert.alert(
                      "Bien",
                      "¿Quieres eliminar los eventos hechos por el cliente (reservaciones, pedidos, etc)?",
                      [
                        {
                          text: "Solo uno",
                          onPress: () => {
                            Alert.alert(
                              "Ok",
                              "¿Quieres eliminar reservaciones o pedidos del menú?",
                              [
                                {
                                  text: "Cancelar",
                                  style: "cancel",
                                },
                                {
                                  text: "Reservaciones",
                                  onPress: async () => {
                                    removeP();
                                    deleteEco();
                                    dispatch(
                                      removeMBOR({ owner: data.personID })
                                    );
                                    await sendEditUser({
                                      reservations: newReservations,
                                    });
                                  },
                                },
                                {
                                  text: "Pedidos",
                                  onPress: async () => {
                                    removeP();
                                    deleteEco();
                                    dispatch(
                                      removeMBOO({ ref: data.personID })
                                    );
                                    await sendEditUser({
                                      orders: orders.filter(
                                        (o) => o.ref !== data.personID
                                      ),
                                    });
                                  },
                                },
                              ],
                              { cancelable: true }
                            );
                          },
                        },
                        {
                          text: "No",
                          onPress: async () => {
                            removeP();
                            deleteEco();
                          },
                        },
                        {
                          text: "Si",
                          onPress: async () => {
                            removeP();
                            deleteEco();
                            dispatch(removeMBOR({ owner: data.personID }));
                            dispatch(removeMBOO({ ref: data.personID }));

                            await sendEditUser({
                              reservations: newReservations,
                              orders: orders.filter(
                                (o) => o.ref !== data.personID
                              ),
                            });
                          },
                        },
                      ],
                      { cancelable: true }
                    );
                  },
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

  const deleteEconomy = (data) => {
    const deleteEco = async () => {
      dispatch(removeEco({ id: data.economyID }));
      await removeEconomy({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        id: data.economyID,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    };

    const sendEditUser = async (change) => {
      await editUser({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        change,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    };

    Keyboard.dismiss();
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
          onPress: async () => {
            const newReservations = reservations.reduce((acc, reservation) => {
              const filteredHosted = reservation.hosted.filter(
                (hosted) => hosted.owner !== data.personID
              );
              return filteredHosted.length
                ? [...acc, { ...reservation, hosted: filteredHosted }]
                : acc;
            }, []);

            if (userType === "supplier") return deleteEco();
            Alert.alert(
              "Bien",
              "¿Quieres eliminar los eventos hechos por el cliente (reservaciones, pedidos, etc)?",
              [
                {
                  text: "Solo uno",
                  onPress: () => {
                    Alert.alert(
                      "Ok",
                      "¿Quieres eliminar reservaciones o pedidos del menú?",
                      [
                        {
                          text: "Cancelar",
                          style: "cancel",
                        },
                        {
                          text: "Reservaciones",
                          onPress: async () => {
                            deleteEco();
                            dispatch(removeMBOR({ owner: data.personID }));
                            await sendEditUser({
                              reservations: newReservations,
                            });
                          },
                        },
                        {
                          text: "Pedidos",
                          onPress: async () => {
                            deleteEco();
                            dispatch(removeMBOO({ ref: data.personID }));
                            await sendEditUser({
                              orders: orders.filter(
                                (o) => o.ref !== data.personID
                              ),
                            });
                          },
                        },
                      ],
                      { cancelable: true }
                    );
                  },
                },
                {
                  text: "No",
                  onPress: async () => deleteEco(),
                },
                {
                  text: "Si",
                  onPress: async () => {
                    deleteEco();
                    dispatch(removeMBOR({ owner: data.personID }));
                    dispatch(removeMBOO({ ref: data.personID }));

                    await sendEditUser({
                      reservations: newReservations,
                      orders: orders.filter((o) => o.ref !== data.personID),
                    });
                  },
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

  const Provider = ({ item, type }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(true);
    const [OF, setOF] = useState(null);
    const [openDatails, setOpenDatails] = useState(false);
    const [total, setTotal] = useState(0);
    const [paid, setPaid] = useState(0);
    const [existsAccommodation, setExistsAccommodation] = useState({});
    const [reservationFound, setReservationFound] = useState({});

    useEffect(() => {
      for (let reservation of reservations) {
        for (let hosted of reservation.hosted) {
          if (hosted.owner === item.personID) {
            setExistsAccommodation(hosted);
            setReservationFound(reservation);
          }
        }
      }
    }, [reservations]);

    useEffect(() => {
      if (userType === "customer")
        setOF(orders.find((o) => o.ref === item.personID && !o.pay));

      const array = economy.filter(
        (e) => e.ref === item.personID && e.payment !== e.amount
      );

      setTotal(array.reduce((a, b) => a + b.amount, 0));
      setPaid(array.reduce((a, b) => a + b.payment, 0));
    }, [userType, orders]);

    const Details = () => {
      return (
        <View>
          <View style={[styles.row, styles.details]}>
            <TextStyle smallParagraph color={light.main2}>
              Fecha
            </TextStyle>
            <TextStyle smallParagraph color={light.main2}>
              Cantidad
            </TextStyle>
            <TextStyle smallParagraph color={light.main2}>
              Detalle
            </TextStyle>
            <TextStyle smallParagraph color={light.main2}>
              Valor
            </TextStyle>
          </View>
          {item.details.map((item) => (
            <View key={item.date} style={[styles.row, styles.details]}>
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {item.date}
              </TextStyle>
              <View style={{ alignItems: "center" }}>
                {item.orders && (
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {item.orders.quantity}
                  </TextStyle>
                )}
                {item.reservations && (
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {item.reservations.quantity}
                  </TextStyle>
                )}
              </View>
              <View style={{ alignItems: "center" }}>
                {item.orders && (
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Comida
                  </TextStyle>
                )}
                {item.reservations && (
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Alojamiento
                  </TextStyle>
                )}
              </View>
              <View style={{ alignItems: "center" }}>
                {item.orders && (
                  <TextStyle
                    verySmall
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {thousandsSystem(item.orders.total)}
                  </TextStyle>
                )}
                {item.reservations && (
                  <TextStyle
                    verySmall
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {thousandsSystem(item.reservations.total)}
                  </TextStyle>
                )}
              </View>
            </View>
          ))}
        </View>
      );
    };

    const Mode = () => {
      if (type === "General")
        return (
          <>
            <View style={[styles.row, { width: "100%" }]}>
              {(!activeGroup.active ||
                (userType === "customer" && activeGroup.accessToTables) ||
                (userType === "supplier" && activeGroup.accessToSupplier)) && (
                <ButtonStyle
                  backgroundColor={
                    userType === "customer"
                      ? !OF
                        ? light.main2
                        : mode === "light"
                        ? dark.main2
                        : light.main4
                      : mode === "light"
                      ? dark.main2
                      : light.main5
                  }
                  style={{ width: SCREEN_WIDTH / 2.4 }}
                  onPress={() => {
                    if (userType === "supplier") {
                      navigation.navigate("CreateEconomy", {
                        type: "purchase",
                        ref: item.personID,
                        owner: {
                          identification: item.identification,
                          name: item.name,
                        },
                      });
                    }

                    if (userType === "customer") {
                      navigation.navigate("CreateOrder", {
                        editing: OF ? true : false,
                        id: OF ? OF.id : undefined,
                        ref: item.personID,
                        table: item.name,
                        selection: OF ? OF.selection : [],
                        reservation: "Cliente",
                      });
                    }
                  }}
                >
                  <TextStyle
                    paragrahp
                    center
                    color={
                      userType === "customer"
                        ? !OF
                          ? light.textDark
                          : mode === "light"
                          ? dark.textWhite
                          : light.textDark
                        : mode === "light"
                        ? dark.textWhite
                        : light.textDark
                    }
                  >
                    {userType === "supplier" ? "Compra / Costos" : "Menú"}
                  </TextStyle>
                </ButtonStyle>
              )}
              {(!activeGroup.active ||
                (userType === "customer" && activeGroup.accessToTables) ||
                (userType === "supplier" && activeGroup.accessToSupplier)) && (
                <ButtonStyle
                  style={{ width: SCREEN_WIDTH / 2.4 }}
                  backgroundColor={
                    userType === "customer"
                      ? !existsAccommodation.id
                        ? light.main2
                        : mode === "light"
                        ? dark.main2
                        : light.main4
                      : mode === "light"
                      ? dark.main2
                      : light.main5
                  }
                  onPress={() => {
                    if (userType === "supplier") {
                      navigation.navigate("CreateEconomy", {
                        type: "expense",
                        ref: item.personID,
                        owner: {
                          identification: item.identification,
                          name: item.name,
                        },
                      });
                    }

                    if (userType === "customer") {
                      if (existsAccommodation.id)
                        return navigation.navigate("ReserveInformation", {
                          ref: reservationFound.ref,
                          id: reservationFound.id,
                        });

                      setPersonSelected(item);
                      setModalVisible(!modalVisible);
                    }
                  }}
                >
                  <TextStyle
                    paragrahp
                    color={
                      userType === "customer"
                        ? existsAccommodation.id
                          ? dark.textWhite
                          : light.textDark
                        : mode === "light"
                        ? dark.textWhite
                        : light.textDark
                    }
                    center
                  >
                    {userType === "supplier"
                      ? "Gasto / Inversión"
                      : existsAccommodation.id
                      ? "Ya alojado"
                      : "Alojamiento"}
                  </TextStyle>
                </ButtonStyle>
              )}
            </View>
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() => {
                navigation.navigate("PeopleInformation", {
                  type: "person",
                  userType,
                  ref: item.personID,
                });
              }}
            >
              <TextStyle center paragrahp>
                Detalles
              </TextStyle>
            </ButtonStyle>
          </>
        );

      if (type === "Debt")
        return (
          <>
            <View style={{ justifyContent: "center", width: "100%" }}>
              <View style={{ marginBottom: 20 }}>
                {item.type !== "debt" && (
                  <TextStyle color={light.main2}>
                    {item.name?.toUpperCase()}
                  </TextStyle>
                )}
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Creación:{" "}
                  <TextStyle color={light.main2}>
                    {changeDate(new Date(item.creationDate))}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Modificación:{" "}
                  <TextStyle color={light.main2}>
                    {changeDate(new Date(item.modificationDate))}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Total:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(item.amount)}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Deuda:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(item.amount - item.payment)}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Pagado:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(item.payment)}
                  </TextStyle>
                </TextStyle>
              </View>
              <View>
                {openDatails && <Details />}
                {item?.details?.length > 0 && (
                  <ButtonStyle
                    backgroundColor={
                      mode === "light" ? dark.main2 : light.main5
                    }
                    onPress={() => setOpenDatails(!openDatails)}
                  >
                    <TextStyle
                      paragrahp
                      center
                      color={mode === "light" ? dark.textWhite : light.textDark}
                    >
                      {openDatails ? "CERRAR DETALLES" : "MOSTRAR DETALLES"}
                    </TextStyle>
                  </ButtonStyle>
                )}
              </View>
              <View style={[styles.row, { width: "100%" }]}>
                <ButtonStyle
                  backgroundColor={mode === "light" ? dark.main2 : light.main5}
                  style={{ width: SCREEN_WIDTH / 2.5 }}
                  onPress={() =>
                    navigation.navigate("CreateEconomy", {
                      type: item.type,
                      pay: true,
                      item: economy.find((e) => e.id === item.economyID),
                      editing: true,
                    })
                  }
                >
                  <TextStyle
                    paragrahp
                    center
                    color={mode === "light" ? dark.textWhite : light.textDark}
                  >
                    Abonar
                  </TextStyle>
                </ButtonStyle>
                <ButtonStyle
                  style={{ width: SCREEN_WIDTH / 2.5 }}
                  backgroundColor={light.main2}
                  onPress={() => {
                    Alert.alert(
                      "Hey",
                      "¿Has pagado el monto restante, quieres terminar de pagar la deuda?",
                      [
                        {
                          text: "No",
                          style: "cancel",
                        },
                        {
                          text: "Si",
                          onPress: async () => {
                            const newEconomy = {
                              ...economy.find((e) => e.id === item.economyID),
                            };
                            newEconomy.payment = item.amount;

                            dispatch(
                              editEco({ id: newEconomy.id, data: newEconomy })
                            );
                            await editEconomy({
                              identifier: activeGroup.active
                                ? activeGroup.identifier
                                : user.identifier,
                              economy: newEconomy,
                              groups: activeGroup.active
                                ? [activeGroup.id]
                                : user.helpers.map((h) => h.id),
                            });
                          },
                        },
                      ]
                    );
                  }}
                >
                  <TextStyle
                    paragrahp
                    center
                    color={mode === "light" ? dark.textWhite : light.textDark}
                  >
                    Pagado
                  </TextStyle>
                </ButtonStyle>
              </View>
            </View>
          </>
        );
    };

    return (
      <View style={{ marginVertical: 5 }}>
        <TouchableOpacity
          onPress={() => setOpen(!open)}
          style={[
            styles.row,
            styles.card,
            {
              backgroundColor: mode === "light" ? light.main5 : dark.main2,
              borderBottomEndRadius: open ? 0 : 8,
              borderBottomStartRadius: open ? 0 : 8,
            },
          ]}
        >
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            {name
              ? item?.name?.slice(0, 15) +
                `${item?.name?.length >= 15 ? "..." : ""}`
              : thousandsSystem(item?.identification)}
          </TextStyle>
          <View style={styles.events}>
            <TextStyle color={light.main2} paragrahp>
              {thousandsSystem(total)}/{thousandsSystem(paid)}
            </TextStyle>
            <TouchableOpacity
              onPress={() => setName(!name)}
              style={{ marginHorizontal: 5 }}
            >
              <Ionicons
                name="git-compare"
                size={26}
                color={mode === "light" ? dark.main2 : light.main5}
              />
            </TouchableOpacity>
            {open && (
              <TouchableOpacity
                style={{ marginHorizontal: 5 }}
                onPress={() => {
                  if (type === "General") deletePerson(item);
                  else deleteEconomy(item);
                }}
              >
                <Ionicons
                  name="trash"
                  size={26}
                  color={mode === "light" ? dark.main2 : light.main5}
                />
              </TouchableOpacity>
            )}
            {open &&
              item.type !== "debt" &&
              (!activeGroup.active ||
                (userType === "customer" && activeGroup.accessToTables) ||
                (userType === "supplier" && activeGroup.accessToSupplier)) && (
                <TouchableOpacity
                  style={{ marginHorizontal: 5 }}
                  onPress={() => {
                    if (type === "General")
                      navigation.navigate("CreatePerson", {
                        person: item,
                        editing: true,
                      });
                    else
                      navigation.navigate("CreateEconomy", {
                        item,
                        editing: true,
                      });
                  }}
                >
                  <Ionicons
                    name="create"
                    size={26}
                    color={mode === "light" ? dark.main2 : light.main5}
                  />
                </TouchableOpacity>
              )}
          </View>
        </TouchableOpacity>
        {open && (
          <View
            style={[
              styles.card,
              {
                alignItems: "center",
                backgroundColor: mode === "light" ? light.main5 : dark.main2,
                borderTopEndRadius: open ? 0 : 8,
                borderTopStartRadius: open ? 0 : 8,
              },
            ]}
          >
            <Mode />
          </View>
        )}
      </View>
    );
  };

  const Debt = () => {
    return (
      <View style={{ justifyContent: "space-between", flexGrow: 1 }}>
        <View>
          <TextStyle
            subtitle
            color={mode === "light" ? light.textDark : dark.textWhite}
            customStyle={{ marginBottom: 20 }}
          >
            Deudores
          </TextStyle>
          {providers.length === 0 ? (
            <TextStyle color={light.main2} center smallSubtitle>
              No hay deudores
            </TextStyle>
          ) : (
            <ScrollView
              style={{ flexGrow: 1, maxHeight: SCREEN_HEIGHT / 1.4 }}
              showsVerticalScrollIndicator={false}
            >
              {providers.map((item) => (
                <Provider
                  key={item.personID + item.modificationDate}
                  item={item}
                  type="Debt"
                />
              ))}
            </ScrollView>
          )}
        </View>
        <ButtonStyle
          backgroundColor={light.main2}
          onPress={() => setSection("general")}
        >
          <TextStyle center>General</TextStyle>
        </ButtonStyle>
      </View>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      {section === "general" ? (
        <View style={{ justifyContent: "space-between", flexGrow: 1 }}>
          <View>
            {activeFilter && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  marginBottom: 20,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setActiveFilter(false);
                    setFilter("");
                    findProviders();
                  }}
                >
                  <Ionicons
                    name="close"
                    size={30}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                </TouchableOpacity>
                <InputStyle
                  innerRef={searchRef}
                  placeholder="Buscar (Nombre, Cédula, Cotos, Etc)"
                  value={filter}
                  onChangeText={(text) => setFilter(text)}
                  stylesContainer={{ width: "90%", marginVertical: 0 }}
                  stylesInput={{
                    paddingHorizontal: 6,
                    paddingVertical: 5,
                    fontSize: 18,
                  }}
                />
              </View>
            )}
            {!activeFilter && (
              <View style={[styles.row, { marginBottom: 20 }]}>
                <TextStyle
                  subtitle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  General
                </TextStyle>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={{ marginHorizontal: 4 }}
                    onPress={() => {
                      setActiveFilter(true);
                      setTimeout(() => searchRef.current.focus());
                    }}
                  >
                    <Ionicons name="search" size={35} color={light.main2} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginHorizontal: 4 }}
                    onPress={() =>
                      navigation.navigate("PeopleInformation", {
                        type: "general",
                        userType,
                      })
                    }
                  >
                    <Ionicons
                      name="document-text"
                      size={35}
                      color={light.main2}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginHorizontal: 4 }}
                    onPress={() =>
                      navigation.navigate("CreatePerson", { type: userType })
                    }
                  >
                    <Ionicons name="add-circle" size={35} color={light.main2} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {providers.length === 0 ? (
              <TextStyle color={light.main2} center smallSubtitle>
                No hay proveedores
              </TextStyle>
            ) : (
              <ScrollView
                style={{ flexGrow: 1, maxHeight: SCREEN_HEIGHT / 1.4 }}
                showsVerticalScrollIndicator={false}
              >
                {providers.map((item) => (
                  <Provider
                    key={item.personID + item.modificationDate}
                    item={item}
                    type="General"
                  />
                ))}
              </ScrollView>
            )}
          </View>
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={() => setSection("debt")}
          >
            <TextStyle center>Deudas</TextStyle>
          </ButtonStyle>
        </View>
      ) : (
        <Debt />
      )}
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
              styles.accommodationCard,
              {
                backgroundColor: mode === "light" ? light.main4 : dark.main1,
              },
            ]}
          >
            <View>
              <View style={styles.row}>
                <TextStyle color={light.main2} subtitle>
                  ALOJAR
                </TextStyle>
                <TouchableOpacity
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Ionicons
                    name="close"
                    size={34}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: 20,
                }}
              >
                <View
                  style={{
                    marginHorizontal: 2,
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                  }}
                >
                  <Picker
                    mode="dropdown"
                    selectedValue={groupSelected}
                    onValueChange={(value) => {
                      setGroupSelected(value);
                      setNomenclatureSelected("");
                    }}
                    dropdownIconColor={
                      mode === "light" ? light.textDark : dark.textWhite
                    }
                    style={{
                      width: SCREEN_WIDTH / 2.7,
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                      color: mode === "light" ? light.textDark : dark.textWhite,
                      fontSize: 20,
                    }}
                  >
                    <Picker.Item
                      label="SELECCIONE LA ZONA"
                      value=""
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                    {groups.map((group, index) => (
                      <Picker.Item
                        key={group.id + index}
                        label={group.name}
                        value={group.ref}
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
                {nomenclaturesToChoose.length > 0 && (
                  <View
                    style={{
                      marginHorizontal: 2,
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    }}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={nomenclatureSelected}
                      onValueChange={(value) => {
                        setNomenclatureSelected(value);
                      }}
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        width: SCREEN_WIDTH / 2.7,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                        fontSize: 20,
                      }}
                    >
                      <Picker.Item
                        label="SELECCIONA LA NOMENCLATURA"
                        value=""
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                      {nomenclaturesToChoose.map((nomenclature, index) => (
                        <Picker.Item
                          key={nomenclature.id}
                          label={nomenclature.name || nomenclature.nomenclature}
                          value={nomenclature.id}
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
                )}
              </View>
              {nomenclaturesToChoose.length > 0 && nomenclatureSelected ? (
                <Calendar
                  style={{ borderRadius: 8 }}
                  // Specify theme properties to override specific styles for calendar parts. Default = {}
                  theme={{
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                    calendarBackground:
                      mode === "light" ? light.main5 : dark.main2,
                    textSectionTitleColor: light.main2, // TITULO DE SEMANA
                    textSectionTitleDisabledColor: "#d9e1e8", // TITULO DE SEMANA DESACTIVADO
                    selectedDayBackgroundColor: "#00adf5", // NO SE
                    selectedDayTextColor: "#ffffff", // NO SE
                    todayTextColor: light.main2, // COLOR DEL DIA DE HOY
                    dayTextColor:
                      mode === "light" ? light.textDark : dark.textWhite, // COLOR DE LAS FECHAS
                    textDisabledColor: `${
                      mode === "light" ? light.textDark : dark.textWhite
                    }66`, // COLOR QUE NO ES DEL MES
                    dotColor: "#00adf5", // NO SE
                    selectedDotColor: "#ffffff", // NO SE
                    arrowColor:
                      mode === "light" ? light.textDark : dark.textWhite, // COLOR DE LAS FLECHAS
                    disabledArrowColor: `${light.main2}66`, //COLOR DE LAS FECHAS DESHABILITADAS
                    monthTextColor:
                      mode === "light" ? light.textDark : dark.textWhite, // TEXTO DEL MES
                    indicatorColor:
                      mode === "light" ? light.textDark : dark.textWhite, // COLOR DE INDICADOR
                    textDayFontFamily: "monospace", // FONT FAMILY DEL DIA
                    textMonthFontFamily: "monospace", // FONT FAMILY DEL MES
                    textDayHeaderFontFamily: "monospace", // FONT FAMILY DEL ENCABEZADO
                    textDayFontWeight: "300", // FONT WEIGHT DEL LOS DIAS DEL MES
                    textMonthFontWeight: "bold", // FONT WEIGHT DEL TITULO DEL MES
                    textDayHeaderFontWeight: "300", // FONT WEIGHT DEL DIA DEL ENCABEZADO
                    textDayFontSize: 16, // TAMANO DE LA LETRA DEL DIA
                    textMonthFontSize: 18, // TAMANO DE LA LETRA DEL MES
                    textDayHeaderFontSize: 16, // TAMANO DEL ENCABEZADO DEL DIA
                  }}
                  maxDate="2024-12-31"
                  minDate="2023-01-01"
                  firstDay={1}
                  displayLoadingIndicator={false} // ESTA COOL
                  enableSwipeMonths={true}
                  onDayPress={(data) => {
                    const reservation =
                      markedDates[data.dateString]?.reservation;
                    const obj = {
                      fullName: personSelected.name,
                      email: "",
                      identification: personSelected.identification,
                      phoneNumber: "",
                      payment: 0,
                      owner: personSelected.personID,
                      checkIn: null,
                      checkOut: null,
                      id: random(20),
                    };

                    const cleanData = () => {
                      setModalVisible(false);
                      setPersonSelected({});
                      setGroupSelected("");
                      setNomenclatureSelected("");
                      setNomenclatureSelected([]);
                      setMarkedDates({});
                    };

                    if (reservation) {
                      Alert.alert(
                        "Habitación compartida",
                        "¿Deseas compartir la habitación con este cliente?",
                        [
                          {
                            text: "No",
                            style: "cancel",
                          },
                          {
                            text: "Si",
                            onPress: async () => {
                              const reservationUpdated = { ...reservation };

                              const updateReservation = async ({ checkIn }) => {
                                obj.checkIn = checkIn;

                                reservationUpdated.hosted = [
                                  ...reservationUpdated.hosted,
                                  obj,
                                ];
                                dispatch(
                                  editR({
                                    ref: reservationUpdated.ref,
                                    data: reservationUpdated,
                                  })
                                );
                                cleanData();
                                Alert.alert(
                                  "Excelente",
                                  "El cliente ha sido hospedado en una habitación compartida satisfactoriamente"
                                );
                                await editReservation({
                                  identifier: activeGroup.active
                                    ? activeGroup.identifier
                                    : user.identifier,
                                  reservation: reservationUpdated,
                                  groups: activeGroup.active
                                    ? [activeGroup.id]
                                    : user.helpers.map((h) => h.id),
                                });
                              };

                              Alert.alert(
                                "CHECK IN",
                                "¿El cliente ya ha llegado para hospedarse?",
                                [
                                  { text: "Cancelar", style: "cancel" },
                                  {
                                    text: "No",
                                    onPress: () =>
                                      updateReservation({ checkIn: null }),
                                  },
                                  {
                                    text: "Si",
                                    onPress: () =>
                                      updateReservation({ checkIn: new Date().getTime() }),
                                  },
                                ],
                                { cancelable: true }
                              );
                            },
                          },
                        ],
                        { cancelable: true }
                      );
                    } else {
                      navigation.navigate("CreateReserve", {
                        hosted: [obj],
                        year: data.year,
                        day: data.day,
                        month: data.month,
                        id: nomenclatureSelected,
                      });
                      cleanData();
                    }
                  }}
                  onDayLongPress={() => {}}
                  arrowsHitSlop={10}
                  markingType="period"
                  markedDates={markedDates}
                />
              ) : (
                <TextStyle center verySmall color={light.main2}>
                  Seleccione el grupo y la nomenclatura
                </TextStyle>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  events: {
    flexDirection: "row",
    alignItems: "center",
  },
  card: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  details: {
    justifyContent: "space-around",
    marginVertical: 5,
    padding: 5,
    borderColor: light.main2,
    borderRadius: 8,
    borderWidth: 1,
  },
  accommodationCard: {
    width: "90%",
    borderRadius: 8,
    padding: 25,
    justifyContent: "space-between",
  },
});

export default People;

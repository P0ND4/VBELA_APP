import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  editEconomy,
  removeEconomy,
  removeManyEconomy,
  removePerson,
  editUser,
  editReservation,
} from "@api";
import AddPerson from "@components/AddPerson";
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
  removeManyByOwner as removeMBORS,
  edit as editRS,
} from "@features/zones/standardReservationsSlice";
import { removeManyByOwner as removeMBORA } from "@features/zones/standardReservationsSlice";
import { removeManyByOwner as removeMBOO } from "@features/tables/ordersSlice";

import { remove as removeClient } from "@features/people/clientSlice";
import { remove as removeSupplier } from "@features/people/supplierSlice";

import {
  changeDate,
  thousandsSystem,
  random,
  getFontSize,
} from "@helpers/libs";
import theme from "@theme";
import ChooseDate from "@components/ChooseDate";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const People = ({ navigation, userType }) => {
  const [section, setSection] = useState("general");
  const [providers, setProviders] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filter, setFilter] = useState("");
  const [daySelected, setDaySelected] = useState(null);
  const [nomenclatureSelected, setNomenclatureSelected] = useState(null);
  const [reservationSelected, setReservationSelected] = useState(null);
  const [modalVisiblePeople, setModalVisiblePeople] = useState(false);
  const [key, setKey] = useState(Math.random());

  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);

  const client = useSelector((state) => state.client);
  const supplier = useSelector((state) => state.supplier);

  const economy = useSelector((state) => state.economy);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [personSelected, setPersonSelected] = useState({});

  const searchRef = useRef(null);

  const dispatch = useDispatch();

  ///////////////////////

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
      const { clientList } = client?.find((c) => c.id === p.id);

      const standardReservationsSorted = standardReservations
        .filter(({ hosted }) =>
          hosted.some(
            ({ owner }) =>
              owner === p.id || clientList?.some((c) => c.id === owner)
          )
        )
        .map((reservation) => {
          return {
            reservation,
            quantity: reservation?.hosted?.length,
            date: reservation.creationDate,
            total: reservation.payment,
            type: "standard-reservations",
          };
        });

      const accommodationReservationsSorted = accommodationReservations
        .filter(
          ({ owner }) =>
            owner === p.id || clientList?.some((c) => c.id === owner)
        )
        .map((hosted) => {
          return {
            hosted,
            quantity: 1,
            date: hosted.creationDate,
            total:
              hosted.payment === 0
                ? "EN ESPERA"
                : hosted.payment === "business"
                ? "POR EMPRESA"
                : hosted.payment,
            type: "accommodation-reservations",
          };
        });

      const ordersSorted = orders
        .filter((o) => o.ref === information.ref || clientList?.some((c) => c.id === o.ref))
        .map((order) => {
          return {
            data: order,
            quantity: order.selection.reduce(
              (a, { count }) => a + parseInt(count),
              0
            ),
            date: order.creationDate,
            total: order.selection.reduce(
              (a, { paid, value }) => a + paid * value,
              0
            ),
            type: "orders",
          };
        });

      const salesSorted = sales
        .filter((s) => s.ref === information.ref || clientList?.some((c) => c.id === s.ref))
        .map(sale => {
          return {
            data: sale,
            quantity: sale.selection.reduce(
              (a, { count }) => a + parseInt(count),
              0
            ),
            date: sale.creationDate,
            total: sale.selection.reduce((a, { total }) => a + total, 0),
            type: "sales",
          };
        });

      const union = [
        ...accommodationReservationsSorted,
        ...ordersSorted,
        ...salesSorted,
        ...standardReservationsSorted,
      ];

      data.details = union.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return data;
  };

  const findProviders = () => {
    if (section === "general") {
      if (userType === "customer") {
        setProviders(
          [
            ...client.map(({ id, ...rest }) => ({ ...rest, personID: id })),
          ].reverse()
        );
      }

      if (userType === "supplier") {
        setProviders(
          [
            ...supplier.map(({ id, ...rest }) => ({ ...rest, personID: id })),
          ].reverse()
        );
      }
    }

    if (section === "debt") {
      if (userType === "customer")
        setProviders(
          [...client.map((p) => extractData(p)).filter((v) => v)].reverse()
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
  }, [client, supplier, section, economy]);

  useEffect(() => {
    if (filter.length !== 0) {
      if (userType === "customer") {
        setProviders(
          [
            ...client
              .filter((p) => {
                const firstCondition =
                  p.name.toLowerCase()?.includes(filter.toLowerCase()) ||
                  p.identification?.includes(filter) ||
                  thousandsSystem(p.identification)?.includes(filter);

                let secondCondition;

                if (p.special) {
                  secondCondition = p.clientList.some(
                    (c) =>
                      c.name
                        .toLowerCase()
                        ?.includes(filter.toLocaleLowerCase()) ||
                      c.identification?.includes(filter) ||
                      thousandsSystem(c.identification)?.includes(filter)
                  );
                }

                return firstCondition || secondCondition;
              })
              .map(({ id, ...rest }) => ({ ...rest, personID: id })),
          ].reverse()
        );
      }

      if (userType === "supplier") {
        setProviders(
          [
            ...supplier
              .filter(
                (p) =>
                  p.name.toLowerCase()?.includes(filter.toLowerCase()) ||
                  p.identification?.includes(filter) ||
                  thousandsSystem(p.identification)?.includes(filter)
              )
              .map(({ id, ...rest }) => ({ ...rest, personID: id })),
          ].reverse()
        );
      }
    } else findProviders();
  }, [filter]);

  const deletePerson = (data) => {
    const removeP = async () => {
      if (userType === "customer")
        dispatch(removeClient({ id: data.personID }));
      if (userType === "supplier")
        dispatch(removeSupplier({ id: data.personID }));
      await removePerson({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        person: {
          type: userType,
          id: data.personID,
        },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    };

    const deleteEco = async () => {
      dispatch(removeManyEco({ ref: data.personID }));
      await removeManyEconomy({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        ref: data.personID,
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    };

    const sendEditUser = async (change) => {
      await editUser({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        change,
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    };

    const newStandardReservations = standardReservations.reduce(
      (acc, reservation) => {
        const filteredHosted = reservation.hosted.filter(
          (hosted) => hosted.owner !== data.personID
        );
        return filteredHosted.length
          ? [...acc, { ...reservation, hosted: filteredHosted }]
          : acc;
      },
      []
    );

    const newAccommodationReservations = accommodationReservations.reduce(
      (acc, reservation) => {
        return reservation.owner !== data.personID
          ? [...acc, { ...reservation }]
          : acc;
      },
      []
    );

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
            const standardReservationRef = standardReservations.some((r) =>
              r.hosted.some((h) => h.owner === data.personID)
            );
            const accommodationReservationRef = accommodationReservations.some(
              (r) => r.owner === data.personID
            );
            if (
              (userType === "supplier" ||
                (userType === "customer" &&
                  !standardReservationRef &&
                  !accommodationReservationRef &&
                  !orders.filter((o) => o.ref === data.personID).length)) &&
              !economies.length
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
                                      removeMBORS({ owner: data.personID })
                                    );
                                    dispatch(
                                      removeMBORA({ owner: data.personID })
                                    );
                                    await sendEditUser({
                                      "reservations.standard":
                                        newStandardReservations,
                                      "reservations.accommodation":
                                        newAccommodationReservations,
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
                            dispatch(removeMBORS({ owner: data.personID }));
                            dispatch(removeMBORA({ owner: data.personID }));
                            dispatch(removeMBOO({ ref: data.personID }));

                            await sendEditUser({
                              "reservations.standard": newStandardReservations,
                              "reservations.accommodation":
                                newAccommodationReservations,
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
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        id: data.economyID,
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    };

    const sendEditUser = async (change) => {
      await editUser({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        change,
        helpers: helperStatus.active
          ? [helperStatus.id]
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
            const newStandardReservations = standardReservations.reduce(
              (acc, reservation) => {
                const filteredHosted = reservation.hosted.filter(
                  (hosted) => hosted.owner !== data.personID
                );
                return filteredHosted.length
                  ? [...acc, { ...reservation, hosted: filteredHosted }]
                  : acc;
              },
              []
            );

            const newAccommodationReservations =
              accommodationReservations.reduce((acc, reservation) => {
                return reservation.owner !== data.personID
                  ? [...acc, { ...reservation }]
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
                            dispatch(removeMBORS({ owner: data.personID }));
                            dispatch(removeMBORA({ owner: data.personID }));
                            await sendEditUser({
                              "reservations.standard": newStandardReservations,
                              "reservations.accommodation":
                                newAccommodationReservations,
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
                    dispatch(removeMBORS({ owner: data.personID }));
                    dispatch(removeMBORA({ owner: data.personID }));
                    dispatch(removeMBOO({ ref: data.personID }));

                    await sendEditUser({
                      "reservations.standard": newStandardReservations,
                      "reservations.accommodation":
                        newAccommodationReservations,
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

  const cleanModal = () => {
    setModalVisible(!modalVisible);
    setModalVisiblePeople(!modalVisiblePeople);
    setDaySelected(null);
    setReservationSelected(null);
    setNomenclatureSelected(null);
  };

  const updateHosted = async ({ data, cleanData }) => {
    data.ref = nomenclatureSelected.id;
    data.id = random(10, { number: true });
    data.owner = personSelected.personID;
    data.checkOut = null;

    if (reservationSelected.type === "accommodation") {
      const place = nomenclatures.find((n) => n.id === nomenclatureSelected.id);
      navigation.navigate("CreateReserve", {
        year: daySelected[0],
        month: daySelected[1],
        day: daySelected[2],
        place,
        hosted: [data],
      });
    }
    if (reservationSelected.type === "standard") {
      let reservationREF = standardReservations.find(
        (r) => r.ref === reservationSelected.ref
      );
      if (reservationREF.hosted.some((h) => h.checkOut))
        data.checkOut = new Date().getTime();
      reserveUpdated = {
        ...reservationREF,
        hosted: [...reservationREF.hosted, data],
      };
      dispatch(editRS({ ref: reserveUpdated.ref, data: reserveUpdated }));
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
    cleanModal();
    cleanData();
  };

  const saveHosted = async ({ data, cleanData }) => {
    const place = nomenclatures.find((n) => n.id === nomenclatureSelected.id);

    const id = random(10, { number: true });
    data.owner = personSelected.personID;
    data.checkOut = null;
    data.ref = nomenclatureSelected.id;
    data.id = id;

    navigation.navigate("CreateReserve", {
      year: daySelected[0],
      month: daySelected[1],
      day: daySelected[2],
      place,
      hosted: [data],
    });

    cleanModal();
    cleanData();
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
      if (!existsAccommodation.id && !reservationFound.id) {
        for (let reservation of standardReservations) {
          for (let hosted of reservation.hosted) {
            if (hosted.owner === item.personID) {
              setExistsAccommodation(hosted);
              setReservationFound(reservation);
            }
          }
        }

        for (let reservation of accommodationReservations) {
          if (reservation.owner === item.personID) {
            setExistsAccommodation(reservation);
            setReservationFound(reservation);
          }
        }
      }
    }, [standardReservations, accommodationReservations]);

    useEffect(() => {
      if (userType === "customer")
        setOF(orders.find((o) => o.ref === item.personID && !o.pay));

      const array = economy.filter(
        (e) => e.ref === item.personID && e.payment !== e.amount
      );

      setTotal(array.reduce((a, b) => a + b.amount, 0));
      setPaid(array.reduce((a, b) => a + b.payment, 0));
    }, [userType, orders, economy]);

    const Details = () => {
      return (
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Fecha
              </TextStyle>
            </View>
            <View
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Cantidad
              </TextStyle>
            </View>
            <View
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Detalle
              </TextStyle>
            </View>
            <View
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Valor
              </TextStyle>
            </View>
          </View>
          {item.details.map((item, index) => (
            <View key={item.date + index} style={{ flexDirection: "row" }}>
              <View
                style={[
                  styles.table,
                  {
                    borderColor:
                      mode === "light" ? light.textDark : dark.textWhite,
                  },
                ]}
              >
                <TextStyle
                  verySmall
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {changeDate(new Date(item.date))}
                </TextStyle>
              </View>
              <View
                style={[
                  styles.table,
                  {
                    borderColor:
                      mode === "light" ? light.textDark : dark.textWhite,
                  },
                ]}
              >
                <TextStyle
                  verySmall
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {item.quantity}
                </TextStyle>
              </View>
              <TouchableOpacity
                style={[
                  styles.table,
                  {
                    borderColor:
                      mode === "light" ? light.textDark : dark.textWhite,
                  },
                ]}
                onPress={() => {
                  const accommodation =
                    item.type === "accommodation-reservations";
                  const standard = item.type === "standard-reservations";
                  const orders = item.type === "orders";
                  const sales = item.type === "sales";
                  if (orders || sales) {
                    navigation.navigate("History", {
                      item: [item.data],
                      type: sales ? "sales" : "menu",
                    });
                  }
                  if (accommodation || standard) {
                    const place = nomenclatures.find((n) => {
                      const id = accommodation
                        ? item.hosted.ref
                        : item.reservation.id;
                      return n.id === id;
                    });
                    let reservation = [];
                    if (standard) reservation.push(item.reservation);
                    if (accommodation) reservation.push(item.hosted);
                    navigation.navigate("ReserveInformation", {
                      reservation,
                      place,
                    });
                  }
                }}
              >
                <TextStyle
                  verySmall
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {item.type === "sales"
                    ? "P&S"
                    : item.type === "orders"
                    ? "Mesa"
                    : item.type === "accommodation-reservations"
                    ? "Acomodación"
                    : "Estandar"}
                </TextStyle>
              </TouchableOpacity>
              <View
                style={[
                  styles.table,
                  {
                    borderColor:
                      mode === "light" ? light.textDark : dark.textWhite,
                  },
                ]}
              >
                <TextStyle
                  verySmall
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {thousandsSystem(item.total)}
                </TextStyle>
              </View>
            </View>
          ))}
        </View>
      );
    };

    const Client = ({ item, client }) => {
      const [isName, setIsName] = useState(true);
      const [OF, setOF] = useState();
      const [existsAccommodation, setExistsAccommodation] = useState({});
      const [reservationFound, setReservationFound] = useState({});

      useEffect(() => {
        if (!existsAccommodation.id && !reservationFound.id) {
          for (let reservation of standardReservations) {
            for (let hosted of reservation.hosted) {
              if (hosted.owner === item.id) {
                setExistsAccommodation(hosted);
                setReservationFound(reservation);
              }
            }
          }

          for (let reservation of accommodationReservations) {
            if (reservation.owner === item.id) {
              setExistsAccommodation(reservation);
              setReservationFound(reservation);
            }
          }
        }
      }, [standardReservations, accommodationReservations]);

      useEffect(() => {
        setOF(orders.find((o) => o.ref === item.id && !o.pay));
      }, [orders]);

      return (
        <View style={[styles.row, { width: "100%" }]}>
          <TouchableOpacity
            onPress={() => {
              if (item.identification) setIsName(!isName);
            }}
          >
            {isName && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {item.name?.slice(0, 8)}
                {item.name.length > 8 ? "..." : ""}
              </TextStyle>
            )}
            {!isName && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {thousandsSystem(item.identification)}
              </TextStyle>
            )}
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ButtonStyle
              backgroundColor={
                !OF ? light.main2 : mode === "light" ? dark.main2 : light.main4
              }
              onPress={() => {
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
                      onPress: () => {
                        navigation.navigate("CreateOrder", {
                          editing: OF ? true : false,
                          id: OF ? OF.id : undefined,
                          ref: item.id,
                          table: item.name,
                          selection: OF ? OF.selection : [],
                          reservation: "Cliente",
                        });
                      },
                    },
                    {
                      text: "Productos&Servicios",
                      onPress: () => {
                        navigation.navigate("Sales", {
                          ref: item.id,
                          name: item.name,
                        });
                      },
                    },
                  ]
                );
              }}
              style={{ width: 120, marginRight: 6 }}
            >
              <TextStyle
                smallParagraph
                center
                color={
                  !OF
                    ? light.textDark
                    : mode === "light"
                    ? dark.textWhite
                    : light.textDark
                }
              >
                Ventas
              </TextStyle>
            </ButtonStyle>
            <ButtonStyle
              onPress={() => {
                if (existsAccommodation.id) {
                  const place = nomenclatures.find((n) => {
                    const value =
                      reservationFound.type === "standard"
                        ? reservationFound.id
                        : reservationFound.ref;
                    return n.id === value;
                  });
                  let reservation = [];

                  if (reservationFound?.type === "standard") {
                    const re = standardReservations.find(
                      (r) => r.ref === reservationFound.ref
                    );
                    reservation.push(re);
                  }

                  if (reservationFound?.type === "accommodation") {
                    const re = accommodationReservations.find(
                      (r) => r.id === reservationFound.id
                    );
                    reservation.push(re);
                  }

                  return navigation.navigate("ReserveInformation", {
                    reservation,
                    place,
                  });
                }

                setPersonSelected({ ...item, personID: item.id });
                setModalVisible(!modalVisible);
              }}
              backgroundColor={
                !existsAccommodation.id
                  ? light.main2
                  : mode === "light"
                  ? dark.main2
                  : light.main4
              }
              style={{ width: 120 }}
            >
              <TextStyle smallParagraph center color={light.textDark}>
                {existsAccommodation.id ? "Ya alojado" : "Alojamiento"}
              </TextStyle>
            </ButtonStyle>
          </View>
        </View>
      );
    };

    //TODO CUANDO SE ELIMINA UN CLIENTE MULTIPLE CUANDO QUIERE ELIMINAR LAS RESERVACIONES DE LOS SUB-CLIENTES NO SE ELIMINA

    const Mode = () => {
      if (type === "General")
        return (
          <>
            {!item.special && (
              <View style={[styles.row, { width: "100%" }]}>
                {(!helperStatus.active ||
                  (userType === "customer" && helperStatus.accessToTables) ||
                  (userType === "supplier" && helperStatus.accessToSupplier)) &&
                  (userType === "supplier" ||
                    ["both", "sales"].includes(user?.type)) && (
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
                      style={{
                        width:
                          userType === "customer" && user?.type === "sales"
                            ? "100%"
                            : SCREEN_WIDTH / 2.4,
                      }}
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
                                onPress: () => {
                                  navigation.navigate("CreateOrder", {
                                    editing: OF ? true : false,
                                    id: OF ? OF.id : undefined,
                                    ref: item.personID,
                                    table: item.name,
                                    selection: OF ? OF.selection : [],
                                    reservation: "Cliente",
                                  });
                                },
                              },
                              {
                                text: "Productos&Servicios",
                                onPress: () => {
                                  navigation.navigate("Sales", {
                                    ref: item.personID,
                                    name: item.name,
                                  });
                                },
                              },
                            ]
                          );
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
                        {userType === "supplier" ? "Compra / Costos" : "Ventas"}
                      </TextStyle>
                    </ButtonStyle>
                  )}
                {(!helperStatus.active ||
                  (userType === "customer" && helperStatus.accessToTables) ||
                  (userType === "supplier" && helperStatus.accessToSupplier)) &&
                  (userType === "supplier" ||
                    ["both", "accommodation"].includes(user?.type)) && (
                    <ButtonStyle
                      style={{
                        width:
                          userType === "customer" &&
                          user?.type === "accommodation"
                            ? "100%"
                            : SCREEN_WIDTH / 2.4,
                      }}
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
                          if (existsAccommodation.id) {
                            const place = nomenclatures.find((n) => {
                              const value =
                                reservationFound.type === "standard"
                                  ? reservationFound.id
                                  : reservationFound.ref;
                              return n.id === value;
                            });
                            let reservation = [];

                            if (reservationFound?.type === "standard") {
                              const re = standardReservations.find(
                                (r) => r.ref === reservationFound.ref
                              );
                              reservation.push(re);
                            }

                            if (reservationFound?.type === "accommodation") {
                              const re = accommodationReservations.find(
                                (r) => r.id === reservationFound.id
                              );
                              reservation.push(re);
                            }

                            return navigation.navigate("ReserveInformation", {
                              reservation,
                              place,
                            });
                          }

                          setPersonSelected(item);
                          setModalVisible(!modalVisible);
                        }
                      }}
                    >
                      <TextStyle
                        paragrahp
                        color={
                          userType === "customer"
                            ? light.textDark
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
            )}
            {item.special &&
              item.clientList?.map((c) => (
                <Client item={c} client={item} key={c.id} />
              ))}
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
                              identifier: helperStatus.active
                                ? helperStatus.identifier
                                : user.identifier,
                              economy: newEconomy,
                              helpers: helperStatus.active
                                ? [helperStatus.id]
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
            {item?.identification && (
              <TouchableOpacity
                onPress={() => setName(!name)}
                style={{ marginHorizontal: 5 }}
              >
                <Ionicons
                  name="git-compare"
                  size={getFontSize(21)}
                  color={mode === "light" ? dark.main2 : light.main5}
                />
              </TouchableOpacity>
            )}
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
                  size={getFontSize(21)}
                  color={mode === "light" ? dark.main2 : light.main5}
                />
              </TouchableOpacity>
            )}
            {open &&
              item.type !== "debt" &&
              (!helperStatus.active ||
                (userType === "customer" && helperStatus.accessToTables) ||
                (userType === "supplier" && helperStatus.accessToSupplier)) && (
                <TouchableOpacity
                  style={{ marginHorizontal: 5 }}
                  onPress={() => {
                    if (type === "General")
                      navigation.navigate("CreatePerson", {
                        type: userType,
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
                    size={getFontSize(21)}
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
                    size={getFontSize(24)}
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
                    <Ionicons
                      name="search"
                      size={getFontSize(28)}
                      color={light.main2}
                    />
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
                      size={getFontSize(28)}
                      color={light.main2}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginHorizontal: 4 }}
                    onPress={() =>
                      navigation.navigate("CreatePerson", { type: userType })
                    }
                  >
                    <Ionicons
                      name="add-circle"
                      size={getFontSize(28)}
                      color={light.main2}
                    />
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
      <ChooseDate
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onDayPress={({ data, nomenclatureID, markedDates }) => {
          const reservation = markedDates[data.dateString]?.reservation;
          const nom = nomenclatures.find((n) => n.id === nomenclatureID);

          if (
            reservation?.type === "standard" &&
            nom.people === reservation?.hosted?.length
          )
            return Alert.alert(
              "OOPS",
              "Ha superado el monto máximo de huéspedes permitidos en la habitación"
            );

          setKey(Math.random());
          setNomenclatureSelected(nom);
          setDaySelected([data.year, data.month, data.day]);
          setReservationSelected(reservation || null);
          setModalVisiblePeople(!modalVisiblePeople);
        }}
      />
      <AddPerson
        key={key}
        modalVisible={modalVisiblePeople}
        setModalVisible={setModalVisiblePeople}
        editing={{
          active: true,
          fullName: personSelected.name,
          identification: personSelected?.identification,
        }}
        discount={nomenclatureSelected?.type === "accommodation"}
        handleSubmit={(data) =>
          !reservationSelected ? saveHosted(data) : updateHosted(data)
        }
        type={nomenclatureSelected?.type}
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
  events: {
    flexDirection: "row",
    alignItems: "center",
  },
  card: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  table: {
    width: 83,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default People;

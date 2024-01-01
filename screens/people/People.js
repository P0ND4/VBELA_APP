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
  Modal,
  TouchableWithoutFeedback,
  Switch,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  editEconomy,
  removeEconomy,
  removeManyEconomy,
  removePerson,
  editUser,
  editReservation,
  removeReservation,
  addEconomy,
} from "@api";
import AddPerson from "@components/AddPerson";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import { Picker } from "@react-native-picker/picker";
import {
  add as addEco,
  edit as editEco,
  remove as removeEco,
  removeMany as removeManyEco,
} from "@features/function/economySlice";
import {
  remove as removeRS,
  removeManyByOwner as removeMBORS,
  edit as editRS,
} from "@features/zones/standardReservationsSlice";
import {
  remove as removeRA,
  removeManyByOwner as removeMBORA,
  edit as editRA,
} from "@features/zones/accommodationReservationsSlice";
import { removeManyByOwner as removeMBOO } from "@features/tables/ordersSlice";

import { remove as removeClient } from "@features/people/clientSlice";
import { remove as removeSupplier } from "@features/people/supplierSlice";

import {
  changeDate,
  thousandsSystem,
  random,
  getFontSize,
  months,
  addDays,
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
  const [accountsPayable, setAccountsPayable] = useState("");
  const [reservationRoute, setReservationRoute] = useState("");
  const [key, setKey] = useState(Math.random());

  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);

  const customers = useSelector((state) => state.client);
  const suppliers = useSelector((state) => state.supplier);

  const economy = useSelector((state) => state.economy);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);
  const zones = useSelector((state) => state.zones);
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

  const backgroundSelected = (params, compare) =>
    compare === params
      ? mode === "light"
        ? light.main5
        : dark.main2
      : light.main2;

  const textColorSelected = (params, compare) =>
    compare === params
      ? mode === "light"
        ? light.textDark
        : dark.textWhite
      : light.textDark;

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
      const { clientList } = customers?.find((c) => c.id === p.id);

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
        .filter(
          (o) =>
            o.ref === information.ref || clientList?.some((c) => c.id === o.ref)
        )
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
        .filter(
          (s) =>
            s.ref === information.ref || clientList?.some((c) => c.id === s.ref)
        )
        .map((sale) => {
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
            ...customers.map(({ id, ...rest }) => ({ ...rest, personID: id })),
          ].reverse()
        );
      }

      if (userType === "supplier") {
        setProviders(
          [
            ...suppliers.map(({ id, ...rest }) => ({ ...rest, personID: id })),
          ].reverse()
        );
      }
    }

    if (section === "debt") {
      if (userType === "customer")
        setProviders(
          [...customers.map((p) => extractData(p)).filter((v) => v)].reverse()
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
  }, [
    customers,
    suppliers,
    section,
    economy,
    accommodationReservations,
    standardReservations,
    orders,
    sales,
  ]);

  useEffect(() => setReservationRoute(""), [accountsPayable]);

  useEffect(() => {
    if (filter.length !== 0) {
      if (userType === "customer") {
        setProviders(
          [
            ...customers
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
            ...suppliers
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

  const deleteEconomyPerson = (data) => {
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

  const hostedChangeRef = useRef(null);

  const [paymentOptions, setPaymentOptions] = useState({
    checkIn: false,
    checkOut: false,
  });
  const [checkOutModalVisible, setCheckOutModalVisible] = useState({
    active: false,
  });
  const [businessPayment, setBusinessPayment] = useState(false);
  const [totalToPay, setTotalToPay] = useState(0);
  const [payment, setPayment] = useState("");
  const [tip, setTip] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTip(total - totalToPay);
  }, [totalToPay, total]);

  const navigateToReservation = (guest) => {
    const place = nomenclatures.find((n) => n.id === guest.nomenclatureID);
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
  };

  const cleanHosted = (hosted) => {
    const debugItem = { ...hosted };
    delete debugItem.active;
    delete debugItem.groupID;
    delete debugItem.nomenclatureID;
    delete debugItem.reservationID;
    delete debugItem.zone;
    delete debugItem.nomenclature;
    delete debugItem.client;
    return debugItem;
  };

  const removePayment = ({ hosted }) => {
    const debugItem = cleanHosted(hosted);
    Alert.alert(
      "REMOVER",
      `¿Quieres remover el PAGO?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            dispatch(
              editRA({ id: debugItem.id, data: { ...debugItem, payment: 0 } })
            );
            await editReservation({
              identifier: helperStatus.active
                ? helperStatus.identifier
                : user.identifier,
              reservation: {
                data: [{ ...debugItem, payment: 0 }],
                type: debugItem.type,
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

  const paymentEvent = ({ callBack, hosted, options }) => {
    if (helperStatus.active && !helperStatus.accessToReservations) return;

    const event = () => {
      if (!(hosted.payment === 0 && hosted.payment !== "business")) {
        return removePayment({
          type: "unique",
          hosted,
        });
      }

      setCheckOutModalVisible({ active: true, ...hosted });
      setTotal(
        hosted?.discount
          ? (hosted?.amount - hosted?.discount) * hosted?.days
          : hosted?.amount * hosted?.days
      );
      if (options) setPaymentOptions({ ...paymentOptions, ...options });
      hostedChangeRef.current = { ...hosted, payment: hosted.payment };
    };

    if (callBack) {
      Alert.alert(
        "PAGO",
        "¿El huésped ha pagado?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "No",
            onPress: () => callBack(),
          },
          {
            text: "Si",
            onPress: () => event(),
          },
        ],
        { cancelable: true }
      );
    } else event();
  };

  const checkInEvent = ({ item }) => {
    if (helperStatus.active && !helperStatus.accessToReservations) return;

    Alert.alert(
      "CAMBIAR",
      `¿El cliente ${item.checkIn ? "no " : ""} ha llegado?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: () => {
            const event = async () => {
              let newReservation;

              if (item.type === "accommodation") {
                dispatch(
                  editRA({
                    id: item.id,
                    data: {
                      ...item,
                      checkIn: item.checkIn ? null : new Date().getTime(),
                    },
                  })
                );
              }

              if (item.type === "standard") {
                newReservation = {
                  ...standardReservations.find(
                    (r) => r.ref === item.reservationID
                  ),
                };
                const newHosted = newReservation?.hosted.map((i) => {
                  if (i.id === item.id) {
                    const newI = { ...i };
                    newI.checkIn = i.checkIn ? null : new Date().getTime();
                    return newI;
                  }
                  return i;
                });

                newReservation.hosted = newHosted;
                dispatch(
                  editRS({
                    ref: item.reservationID,
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
                    item.type === "standard"
                      ? newReservation
                      : [
                          {
                            ...item,
                            checkIn: item.checkIn ? null : new Date().getTime(),
                          },
                        ],
                  type: item.type,
                },
                helpers: helperStatus.active
                  ? [helperStatus.id]
                  : user.helpers.map((h) => h.id),
              });
            };

            if (
              !item.checkIn &&
              item?.payment === 0 &&
              item?.payment !== "business"
            )
              paymentEvent({
                callBack: event,
                hosted: item,
                options: { checkIn: true },
              });
            else event();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const deleteEconomy = async ({ ids }) => {
    for (let ownerRef of ids) {
      const person = customers.find(
        (p) =>
          p.id === ownerRef || p?.clientList?.some((c) => c.id === ownerRef)
      );

      const foundEconomy = economy.find((e) => e.ref === person.id);
      const reservation =
        standardReservations.find((s) =>
          s.hosted.some((h) => h.owner === ownerRef)
        ) || accommodationReservations.find((a) => a.owner === ownerRef);
      const hosted = reservation?.hosted || [reservation];
      const client = hosted.find((h) => h.owner === ownerRef);

      if (!person) continue;

      if (foundEconomy) {
        const currentEconomy = { ...foundEconomy };
        currentEconomy.amount -=
          client.type === "accommodation"
            ? client.amount * client.days
            : reservation.amount;
        currentEconomy.modificationDate = new Date().getTime();
        if (currentEconomy.amount <= 0) {
          dispatch(removeEco({ id: foundEconomy.id }));
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
          dispatch(editEco({ id: foundEconomy.id, data: currentEconomy }));
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

  const manageEconomy = async ({ ids, hosted }) => {
    if (hosted.length === 0) return;
    for (let ownerRef of ids) {
      const person = customers.find(
        (p) =>
          p.id === ownerRef || p?.clientList?.some((c) => c.id === ownerRef)
      );

      const reservation =
        standardReservations.find((s) =>
          s.hosted.some((h) => h.owner === ownerRef)
        ) || accommodationReservations.find((a) => a.owner === ownerRef);
      const client = hosted.find((h) => h.owner === ownerRef);
      if (!person) continue;

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
          amount:
            client.type === "accommodation"
              ? client.amount * client.days
              : reservation.amount,
          name: `Deuda ${person.name}`,
          payment: 0,
          creationDate: new Date().getTime(),
          modificationDate: new Date().getTime(),
        };

        dispatch(addEco(newEconomy));
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
        currentEconomy.amount +=
          client.type === "accommodation"
            ? client.amount * client.days
            : reservation.amount;
        currentEconomy.modificationDate = new Date().getTime();
        dispatch(editEco({ id: foundEconomy.id, data: currentEconomy }));
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

  const cleanData = () => {
    setBusinessPayment(false);
    setTotal(0);
    setCheckOutModalVisible({ active: false });
    setTotalToPay(0);
    setPayment("");
    hostedChangeRef.current = null;
  };

  useEffect(() => {
    setTip(total - totalToPay);
  }, [totalToPay, total]);

  const Provider = ({ item, type }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(true);
    const [OF, setOF] = useState(null);
    const [openDatails, setOpenDatails] = useState(false);
    const [total, setTotal] = useState(0);
    const [paid, setPaid] = useState(0);
    const [existsAccommodation, setExistsAccommodation] = useState({});
    const [reservationFound, setReservationFound] = useState({});
    const [clientFinished, setClientFinished] = useState(false);

    useEffect(() => {
      const checkReservation = (callBack, personID) => {
        for (let reservation of standardReservations) {
          for (let hosted of reservation.hosted) {
            if (hosted.owner === personID) callBack({ hosted, reservation });
          }
        }

        for (let reservation of accommodationReservations) {
          if (reservation.owner === personID)
            callBack({ hosted: reservation, reservation });
        }
      };

      if (item?.special) {
        const count = item?.clientList.reduce((a, b) => {
          let checkOut = 0;
          checkReservation(({ hosted }) => hosted.checkOut && checkOut++, b.id);
          return a + checkOut;
        }, 0);
        if (count === item?.clientList.length) setClientFinished(true);
      } else {
        checkReservation(({ hosted, reservation }) => {
          setExistsAccommodation(hosted);
          setReservationFound(reservation);
        }, item.personID);
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
                FECHA
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
                CANTIDAD
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
                DETALLE
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
                PAGADO
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
                DEUDA
              </TextStyle>
            </View>
          </View>
          {item.details.map((item, index) => {
            let debt = 0;

            if (
              item.type === "accommodation-reservations" ||
              item.type === "standard-reservations"
            ) {
              const reservation =
                item.type === "accommodation-reservations"
                  ? item.hosted
                  : item.reservation;
              const amount = reservation?.discount
                ? reservation?.amount - reservation?.discount
                : reservation?.amount;

              debt = amount * reservation.days - reservation.payment;
            }

            if (
              (item.type === "sales" || item.type === "orders") &&
              !item.data.pay
            ) {
              debt = item.data.selection.reduce(
                (a, s) => a + (s.count - s.paid) * s.value,
                0
              );
            }

            const navigateToDetail = () => {
              const accommodation = item.type === "accommodation-reservations";
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
            };

            return (
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
                  onPress={() => navigateToDetail()}
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
                <TouchableOpacity
                  onPress={() => {
                    if (!debt) return;
                    if (item.type === "orders") {
                      navigation.navigate("CreateOrder", {
                        editing: true,
                        id: item.data?.id,
                        ref: item.data?.ref,
                        table: item.data?.table,
                        selection: item.data?.selection,
                        reservation: "Cliente",
                      });
                    } else navigateToDetail();
                  }}
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
                    {!debt ? "SIN DEUDA" : thousandsSystem(debt)}
                  </TextStyle>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      );
    };

    const Client = ({ item }) => {
      const [isName, setIsName] = useState(true);
      const [OF, setOF] = useState();
      const [existsAccommodation, setExistsAccommodation] = useState({});
      const [reservationFound, setReservationFound] = useState({});
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        setLoading(true);
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
        setLoading(false);
      }, [standardReservations, accommodationReservations]);

      useEffect(() => {
        setOF(orders.find((o) => o.ref === item.id && !o.pay));
      }, [orders]);

      if (loading || existsAccommodation?.checkOut) return <></>;

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
                {item.name?.slice(0, 28)}
                {item.name.length > 28 ? "..." : ""}
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
              style={{
                width: "auto",
                marginRight: 6,
                paddingVertical: 7,
                paddingHorizontal: 12,
              }}
            >
              <Ionicons
                name="card-outline"
                size={getFontSize(16)}
                color={
                  !OF
                    ? light.textDark
                    : mode === "light"
                    ? dark.textWhite
                    : light.textDark
                }
              />
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
              style={{
                width: "auto",
                paddingVertical: 7,
                paddingHorizontal: 12,
              }}
            >
              <Ionicons
                name="home-outline"
                size={getFontSize(16)}
                color={
                  !OF
                    ? light.textDark
                    : mode === "light"
                    ? dark.textWhite
                    : light.textDark
                }
              />
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
            {(existsAccommodation?.checkOut || clientFinished) && (
              <View style={{ marginBottom: 10 }}>
                <TextStyle
                  center
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  CLIENTE FINALIZADO
                </TextStyle>
              </View>
            )}
            {!item.special && !existsAccommodation?.checkOut && (
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
                {openDatails && (
                  <ScrollView
                    style={{ maxHeight: 300 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <Details />
                    </ScrollView>
                  </ScrollView>
                )}
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
          <TouchableOpacity
            onPress={() => {
              if (!item?.identification) return;
              setName(!name);
            }}
          >
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {name
                ? item?.name?.slice(0, 15) +
                  `${item?.name?.length >= 15 ? "..." : ""}`
                : thousandsSystem(item?.identification)}
            </TextStyle>
          </TouchableOpacity>
          <View style={styles.events}>
            <TextStyle color={light.main2} paragrahp>
              {thousandsSystem(total)}/{thousandsSystem(paid)}
            </TextStyle>
            {open && (
              <TouchableOpacity
                style={{ marginHorizontal: 5 }}
                onPress={() => {
                  if (type === "General") deletePerson(item);
                  else deleteEconomyPerson(item);
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

  const Reservations = () => {
    const [search, setSearch] = useState("");
    const [people, setPeople] = useState([]);
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

    const dayRef = useRef();
    const monthRef = useRef();
    const yearRef = useRef();

    useEffect(() => {
      if (zones.length > 0) {
        const nomenclaturesFound = nomenclatures.filter(
          (n) => n.ref === filters.zone
        );
        setNomenclaturesToChoose(nomenclaturesFound);
      }
    }, [filters.zone]);

    useEffect(() => {
      const years = Array.from({ length: 10 }, (_, i) => {
        const fiveYearsAgo = new Date().setFullYear(
          new Date().getFullYear() - 5
        );
        return new Date(fiveYearsAgo).getFullYear() + i;
      });

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
          .filter((r) => r.owner)
          .filter((r) =>
            !reservationRoute
              ? !r.checkIn
              : reservationRoute === "check-in"
              ? !r.checkOut && r.checkIn
              : reservationRoute === "check-out"
              ? r.checkOut
              : true
          )
          .map((person) => {
            let client = null;
            if (person.owner) {
              // Vemos si tiene afiliacion con cliente
              const individual = customers.find((p) => p.id === person.owner); // Buscamos si es un cliente individual
              if (!individual) {
                // Comprovamos si lo es
                const agency = customers.find((p) =>
                  p?.clientList?.some((c) => c.id === person.owner)
                ); // Buscamos si es un cliente de agencia
                if (agency) client = agency; // Si lo es que lo guarde en clientes si no el parametro cliente queda null
              } else client = individual; // Si lo es pasamos el dato al cliente
            }

            return {
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
              client: person.owner ? client : null,
            };
          });
      });

      const accommodation = accommodationReservations
        .filter((r) => r.owner)
        .filter((r) =>
          !reservationRoute
            ? !r.checkIn
            : reservationRoute === "check-in"
            ? r.checkIn && !r.checkOut
            : reservationRoute === "check-out"
            ? r.checkOut
            : true
        )
        .flatMap((item) => {
          const { nomenclature, ref } = nomenclatures.find(
            (n) => n.id === item.ref
          );
          const { name: zone } = zones.find((g) => g.ref === ref);
          let client = null;
          if (item.owner) {
            // Vemos si tiene afiliacion con cliente
            const individual = customers.find((p) => p.id === item.owner); // Buscamos si es un cliente individual
            if (!individual) {
              // Comprovamos si lo es
              const agency = customers.find((p) =>
                p?.clientList?.some((c) => c.id === item.owner)
              ); // Buscamos si es un cliente de agencia
              if (agency) client = agency; // Si lo es que lo guarde en clientes si no el parametro cliente queda null
            } else client = individual; // Si lo es pasamos el dato al cliente
          }

          return {
            ...item,
            groupID: ref,
            nomenclatureID: item.ref,
            reservationID: item.id,
            zone,
            nomenclature,
            client: item.owner ? client : null,
          };
        });

      const union = [...accommodation, ...standard];
      const organized = union.sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
      });

      const customersOrganized = customers.map((c) => {
        const hosted = organized.filter(
          (r) => r.owner === c.id || c.clientList?.some((c) => c.id === r.owner)
        );
        return {
          id: c.id,
          name: c.name,
          identification: c.identification,
          hosted,
        };
      });

      if (search || filters.active) {
        const hostedWithSearch = customersOrganized.map((item) => ({
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
              if (filters.zone && h.groupID !== filters.zone) return;
              if (
                filters.nomenclature &&
                h.nomenclatureID !== filters.nomenclature
              )
                return;

              return h;
            }
          }),
        }));
        setPeople(hostedWithSearch);
      } else setPeople(customersOrganized);
    }, [search, filters, reservationRoute, customers]);

    const InformationGuest = ({ modalVisible, setModalVisible, item }) => {
      const [openMoreInformation, setOpenMoreInformation] = useState(false);
      const [editing, setEditing] = useState(false);
      const [OF, setOF] = useState(null);

      const [handler, setHandler] = useState({
        active: true,
        key: Math.random(),
      });

      useEffect(() => {
        setOF(orders.find((o) => o.ref === item.owner && !o.pay));
      }, [orders]);

      const checkOutEvent = ({ item }) => {
        if (helperStatus.active && !helperStatus.accessToReservations) return;

        Alert.alert(
          "CAMBIAR",
          `¿El cliente ${item.checkOut ? "no " : ""} se ha ido?`,
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Si",
              onPress: () => {
                const mainEvent = ({ checkIn }) => {
                  const event = async () => {
                    const newReservation = {
                      ...standardReservations.find(
                        (s) => s.ref === item.reservationID
                      ),
                    };

                    if (item.type === "accommodation") {
                      dispatch(
                        editRA({
                          id: item.id,
                          data: {
                            ...item,
                            checkIn: checkIn
                              ? new Date().getTime()
                              : item.checkIn,
                            checkOut: item.checkOut
                              ? null
                              : new Date().getTime(),
                          },
                        })
                      );
                    }

                    if (item.type === "standard") {
                      const newHosted = newReservation?.hosted.map((i) => {
                        if (i.id === item.id) {
                          const newI = { ...i };
                          (newI.checkIn = checkIn
                            ? new Date().getTime()
                            : item.checkIn),
                            (newI.checkOut = i.checkOut
                              ? null
                              : new Date().getTime());
                          return newI;
                        }
                        return i;
                      });

                      newReservation.hosted = newHosted;
                      dispatch(
                        editRS({
                          ref: newReservation.ref,
                          data: newReservation,
                        })
                      );
                    }

                    if (item.owner) {
                      if (item.checkOut)
                        await deleteEconomy({ ids: [item.owner] });
                      else {
                        const reservation =
                          standardReservations.find(
                            (s) => s.ref === item.reservationID
                          ) ||
                          accommodationReservations.find(
                            (a) => a.id === item.reservationID
                          );
                        await manageEconomy({
                          ids: [item.owner],
                          hosted: reservation.hosted || [reservation],
                        });
                      }
                    }

                    await editReservation({
                      identifier: helperStatus.active
                        ? helperStatus.identifier
                        : user.identifier,
                      reservation: {
                        data:
                          item.type === "standard"
                            ? newReservation
                            : [
                                {
                                  ...item,
                                  checkOut: item.checkOut
                                    ? null
                                    : new Date().getTime(),
                                },
                              ],
                        type: item.type,
                      },
                      helpers: helperStatus.active
                        ? [helperStatus.id]
                        : user.helpers.map((h) => h.id),
                    });
                  };

                  if (
                    !item.checkOut &&
                    item.payment === 0 &&
                    item.payment !== "business"
                  )
                    paymentEvent({
                      callBack: event,
                      hosted: item,
                      options: { checkIn, checkOut: true },
                    });
                  else event();
                };

                if (!item.checkIn && !item.checkOut) {
                  Alert.alert(
                    "NO HA LLEGADO",
                    "¿El huésped no ha llegado, desea activar el CHECK IN?",
                    [
                      {
                        text: "Cancelar",
                        style: "cancel",
                      },
                      {
                        text: "No",
                        onPress: () => mainEvent({ checkIn: false }),
                      },
                      {
                        text: "Si",
                        onPress: () => mainEvent({ checkIn: true }),
                      },
                    ],
                    { cancelable: true }
                  );
                } else mainEvent({ checkIn: false });
              },
            },
          ],
          { cancelable: true }
        );
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
              item.type === "standard"
                ? reserveUpdated
                : [{ ...guest, ...data }],
            type: item.type,
          },
          helpers: helperStatus.active
            ? [helperStatus.id]
            : user.helpers.map((h) => h.id),
        });
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
                  styles.cardInformation,
                  {
                    backgroundColor:
                      mode === "light" ? light.main4 : dark.main1,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setModalVisible(!modalVisible)}
                    >
                      <Ionicons
                        name="close"
                        size={getFontSize(28)}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                    <TextStyle color={light.main2}>
                      {item.phoneNumber}
                    </TextStyle>
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
                    Grupo:{" "}
                    <TextStyle color={light.main2}>{item.zone}</TextStyle>
                  </TextStyle>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Nomenclatura:{" "}
                    <TextStyle color={light.main2}>
                      {item.nomenclature}
                    </TextStyle>
                  </TextStyle>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Tipo:{" "}
                    <TextStyle color={light.main2}>
                      {item.type === "accommodation"
                        ? "Acomodación"
                        : "Estandar"}
                    </TextStyle>
                  </TextStyle>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextStyle
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      CHECK IN:{" "}
                    </TextStyle>
                    <TouchableOpacity onPress={() => checkInEvent({ item })}>
                      <TextStyle color={light.main2}>
                        {item.checkIn
                          ? changeDate(new Date(item.checkIn))
                          : "NO"}
                      </TextStyle>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextStyle
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Cliente registrado:{" "}
                    </TextStyle>
                    <TouchableOpacity
                      onPress={() => {
                        if (!item.client) return;
                        navigation.navigate("PeopleInformation", {
                          type: "person",
                          userType: "customer",
                          ref: item.client.id,
                        });
                      }}
                    >
                      <TextStyle color={light.main2}>
                        {!item.client
                          ? "No"
                          : item.client.special
                          ? "Agencia"
                          : "Individual"}
                      </TextStyle>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextStyle
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      CHECK OUT:{" "}
                    </TextStyle>
                    <TouchableOpacity onPress={() => checkOutEvent({ item })}>
                      <TextStyle color={light.main2}>
                        {item.checkOut
                          ? changeDate(new Date(item.checkOut))
                          : "NO"}
                      </TextStyle>
                    </TouchableOpacity>
                  </View>

                  {item.type === "accommodation" && (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <TextStyle
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Pagado:{" "}
                      </TextStyle>
                      <TouchableOpacity
                        onPress={() => paymentEvent({ hosted: item })}
                      >
                        <TextStyle color={light.main2}>
                          {!helperStatus.active ||
                          helperStatus.accessToReservations
                            ? !item.payment
                              ? "EN ESPERA"
                              : item.payment === "business"
                              ? "POR EMPRESA"
                              : thousandsSystem(item.payment)
                            : "PRIVADO"}
                        </TextStyle>
                      </TouchableOpacity>
                    </View>
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
                      onPress={() =>
                        setOpenMoreInformation(!openMoreInformation)
                      }
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
                          ref: item.owner,
                          name: item.fullName,
                        });
                      }}
                    >
                      <TextStyle center>P&S</TextStyle>
                    </ButtonStyle>
                    <ButtonStyle
                      onPress={() => {
                        navigation.navigate("CreateOrder", {
                          editing: OF ? true : false,
                          id: OF ? OF.id : undefined,
                          ref: item.owner,
                          table: item.fullName,
                          selection: OF ? OF.selection : [],
                          reservation: "Cliente",
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
                                  (h) =>
                                    h.owner && h.checkOut && h.id === item.id
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
                                        await deleteEconomyPerson({
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

    const Guest = ({ guest }) => {
      const [informationModalVisible, setInformationModalVisible] =
        useState(false);
      const [debt, setDebt] = useState(0);

      useEffect(() => {
        const amount = guest.discount
          ? guest.amount * guest.days - guest.discount
          : guest.amount * guest.days;
        setDebt(amount - guest.payment);
      }, [guest]);

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
              onPress={() => checkInEvent({ item: guest })}
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
              onLongPress={() => navigateToReservation(guest)}
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
            <TouchableOpacity
              onPress={() => {
                if (guest.type === "standard")
                  return navigateToReservation(guest);
                paymentEvent({ hosted: guest });
              }}
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
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (debt) navigateToReservation(guest);
              }}
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
                {!debt ? "SIN DEUDA" : thousandsSystem(debt)}
              </TextStyle>
            </TouchableOpacity>
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
      <View style={{ height: SCREEN_HEIGHT / 1.4, marginTop: 15 }}>
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
          {people.map((item) => {
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
                    {item?.name?.toUpperCase()}{" "}
                    {item.identification
                      ? `(${thousandsSystem(item.identification)})`
                      : ""}
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
                            width: 40,
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
                            width: 90,
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
                          GRUPO
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
                      <View
                        style={[
                          styles.table,
                          {
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                            width: 90,
                          },
                        ]}
                      >
                        <TextStyle color={light.main2} smallParagraph>
                          DEUDA
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
                styles.cardInformation,
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
                        width: SCREEN_WIDTH / 2.8,
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
                        width: SCREEN_WIDTH / 2.8,
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
                  <View>
                    <ButtonStyle
                      backgroundColor={
                        mode === "light" ? light.main5 : dark.main2
                      }
                      style={{ width: SCREEN_WIDTH / 4.5, paddingVertical: 16 }}
                      onPress={() => dayRef.current?.focus()}
                    >
                      <View style={styles.row}>
                        <TextStyle
                          color={
                            filters.day !== "all"
                              ? mode === "light"
                                ? light.textDark
                                : dark.textWhite
                              : "#888888"
                          }
                          smallParagraph
                        >
                          {filters.day !== "all" ? filters.day : "Día"}
                        </TextStyle>
                        <Ionicons
                          color={
                            filters.day !== "all"
                              ? mode === "light"
                                ? light.textDark
                                : dark.textWhite
                              : "#888888"
                          }
                          size={getFontSize(10)}
                          name="caret-down"
                        />
                      </View>
                    </ButtonStyle>

                    <View style={{ display: "none" }}>
                      <Picker
                        ref={dayRef}
                        mode="dropdown"
                        selectedValue={filters.day}
                        onValueChange={(itemValue) =>
                          setFilters({ ...filters, day: itemValue })
                        }
                        style={{
                          color:
                            mode === "light" ? light.textDark : dark.textWhite,
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
                  </View>
                  <View>
                    <ButtonStyle
                      backgroundColor={
                        mode === "light" ? light.main5 : dark.main2
                      }
                      style={{ width: SCREEN_WIDTH / 3.6, paddingVertical: 16 }}
                      onPress={() => monthRef.current?.focus()}
                    >
                      <View style={styles.row}>
                        <TextStyle
                          color={
                            filters.month !== "all"
                              ? mode === "light"
                                ? light.textDark
                                : dark.textWhite
                              : "#888888"
                          }
                          smallParagraph
                        >
                          {filters.month !== "all"
                            ? months[filters.month - 1]
                            : "Mes"}
                        </TextStyle>
                        <Ionicons
                          color={
                            filters.month !== "all"
                              ? mode === "light"
                                ? light.textDark
                                : dark.textWhite
                              : "#888888"
                          }
                          size={getFontSize(10)}
                          name="caret-down"
                        />
                      </View>
                    </ButtonStyle>
                    <View style={{ display: "none" }}>
                      <Picker
                        ref={monthRef}
                        mode="dropdown"
                        selectedValue={filters.month}
                        onValueChange={(itemValue) =>
                          setFilters({ ...filters, month: itemValue })
                        }
                        style={{
                          color:
                            mode === "light" ? light.textDark : dark.textWhite,
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
                  </View>
                  <View>
                    <ButtonStyle
                      backgroundColor={
                        mode === "light" ? light.main5 : dark.main2
                      }
                      style={{ width: SCREEN_WIDTH / 4.5, paddingVertical: 16 }}
                      onPress={() => yearRef.current?.focus()}
                    >
                      <View style={styles.row}>
                        <TextStyle
                          color={
                            filters.year !== "all"
                              ? mode === "light"
                                ? light.textDark
                                : dark.textWhite
                              : "#888888"
                          }
                          smallParagraph
                        >
                          {filters.year !== "all" ? filters.year : "Año"}
                        </TextStyle>
                        <Ionicons
                          color={
                            filters.year !== "all"
                              ? mode === "light"
                                ? light.textDark
                                : dark.textWhite
                              : "#888888"
                          }
                          size={getFontSize(10)}
                          name="caret-down"
                        />
                      </View>
                    </ButtonStyle>
                    <View style={{ display: "none" }}>
                      <Picker
                        ref={yearRef}
                        mode="dropdown"
                        selectedValue={filters.year}
                        onValueChange={(itemValue) =>
                          setFilters({ ...filters, year: itemValue })
                        }
                        style={{
                          color:
                            mode === "light" ? light.textDark : dark.textWhite,
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

  const Accounts = () => {
    const [people, setPeople] = useState([]);

    useEffect(() => {
      const validation = ({ ref }) =>
        customers.find((p) => p.id === ref) ||
        customers.find((p) => p?.clientList?.some((c) => c.id === ref));

      const ordersSorted = orders
        .filter((o) => o.ref && validation({ ref: o.ref }))
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
        .filter((s) => s.ref && validation({ ref: s.ref }))
        .map((sale) => {
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

      const union = [...ordersSorted, ...salesSorted];
      const organized = union.sort((a, b) => {
        if (a.data.pay !== b.data.pay) {
          return a.data.pay - b.data.pay; // Si pay es diferente, ordenar por pay en orden inverso (de manera que pay = false se muestren antes)
        } else {
          return new Date(b.data.creationDate) - new Date(a.data.creationDate); // Si pay es igual, ordenar por fecha en orden inverso (de manera que la más reciente se muestre antes)
        }
      });

      const customersOrganized = customers.map((c) => {
        const accounts = organized.filter(
          (r) =>
            r.data.ref === c.id ||
            c.clientList?.some((c) => c.id === r.data.ref)
        );

        return {
          id: c.id,
          name: c.name,
          identification: c.identification,
          accounts,
        };
      });

      setPeople(customersOrganized);
    }, [sales, orders]);

    const Paid = ({ item }) => {
      return (
        <View style={{ flexDirection: "row" }}>
          <View
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
                width: 83,
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
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
                width: 83,
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
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
              },
            ]}
            onPress={() => {}}
          >
            <TextStyle
              verySmall
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {item.data.selection.reduce((a, s) => a + s.paid, 0)}
            </TextStyle>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
                width: 83,
              },
            ]}
            onPress={() => {
              const orders = item.type === "orders";
              const sales = item.type === "sales";
              if (orders || sales) {
                navigation.navigate("History", {
                  item: [item.data],
                  type: sales ? "sales" : "menu",
                });
              }
            }}
          >
            <TextStyle
              verySmall
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {item.type === "sales" ? "P&S" : "Mesa"}
            </TextStyle>
          </TouchableOpacity>
          <View
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
                width: 83,
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
          <TouchableOpacity
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
              },
            ]}
            onPress={() => {
              if (item.data.pay) return;
              navigation.navigate("CreateOrder", {
                editing: true,
                id: item.data.id,
                ref: item.data.ref,
                table: item.data.table,
                selection: item.data.selection,
                reservation: "Cliente",
              });
            }}
          >
            <TextStyle
              verySmall
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {!item.data.pay
                ? `(${item.data.selection.reduce(
                    (a, s) => a + s.count - s.paid,
                    0
                  )}) PAGAR`
                : "PAGADO"}
            </TextStyle>
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <View style={{ marginTop: 15 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {people.map((item) => {
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
                    {item?.name?.toUpperCase()}{" "}
                    {item.identification
                      ? `(${thousandsSystem(item.identification)})`
                      : ""}
                  </TextStyle>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={{ flexDirection: "row" }}>
                      <View
                        style={[
                          styles.table,
                          {
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
                          CANTIDAD
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
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          PAGADO
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
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          DETALLE
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
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          VALOR
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
                          },
                        ]}
                      >
                        <TextStyle color={light.main2} smallParagraph>
                          SIN PAGAR
                        </TextStyle>
                      </View>
                    </View>
                    {item.accounts.map((item) => (
                      <Paid item={item} key={item.data?.id} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
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
                {!accountsPayable ? (
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
                ) : (
                  <TouchableOpacity
                    style={{ marginHorizontal: 4 }}
                    onPress={() => setAccountsPayable("")}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={getFontSize(28)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            {userType === "customer" && providers.length !== 0 && (
              <View style={styles.row}>
                <ButtonStyle
                  backgroundColor={backgroundSelected(
                    "reservations",
                    accountsPayable
                  )}
                  style={{ width: "49%" }}
                  onPress={() => {
                    setAccountsPayable("reservations");
                    setReservationRoute("");
                  }}
                >
                  <TextStyle
                    smallParagraph
                    center
                    color={textColorSelected("reservations", accountsPayable)}
                  >
                    RESERVAS
                  </TextStyle>
                </ButtonStyle>
                <ButtonStyle
                  backgroundColor={backgroundSelected(
                    "accounts",
                    accountsPayable
                  )}
                  style={{ width: "49%" }}
                  onPress={() => setAccountsPayable("accounts")}
                >
                  <TextStyle
                    smallParagraph
                    center
                    color={textColorSelected("accounts", accountsPayable)}
                  >
                    CUENTAS
                  </TextStyle>
                </ButtonStyle>
              </View>
            )}
            {accountsPayable === "reservations" && (
              <View style={styles.row}>
                <ButtonStyle
                  backgroundColor={backgroundSelected("", reservationRoute)}
                  style={{ width: "32%" }}
                  onPress={() => setReservationRoute("")}
                >
                  <TextStyle
                    smallParagraph
                    center
                    color={textColorSelected("", reservationRoute)}
                  >
                    AGENDADO
                  </TextStyle>
                </ButtonStyle>
                <ButtonStyle
                  backgroundColor={backgroundSelected(
                    "check-in",
                    reservationRoute
                  )}
                  style={{ width: "32%" }}
                  onPress={() => setReservationRoute("check-in")}
                >
                  <TextStyle
                    smallParagraph
                    center
                    color={textColorSelected("check-in", reservationRoute)}
                  >
                    CHECK IN
                  </TextStyle>
                </ButtonStyle>
                <ButtonStyle
                  backgroundColor={backgroundSelected(
                    "check-out",
                    reservationRoute
                  )}
                  style={{ width: "32%" }}
                  onPress={() => setReservationRoute("check-out")}
                >
                  <TextStyle
                    smallParagraph
                    center
                    color={textColorSelected("check-out", reservationRoute)}
                  >
                    CHECK OUT
                  </TextStyle>
                </ButtonStyle>
              </View>
            )}
            {providers.length === 0 ? (
              <TextStyle color={light.main2} center smallSubtitle>
                No hay proveedores
              </TextStyle>
            ) : !accountsPayable ? (
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
            ) : accountsPayable === "reservations" ? (
              <Reservations />
            ) : (
              <Accounts />
            )}
          </View>
          {!accountsPayable && (
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() => setSection("debt")}
            >
              <TextStyle center>Deudas</TextStyle>
            </ButtonStyle>
          )}
        </View>
      ) : (
        <Debt />
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={checkOutModalVisible.active}
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
              styles.cardInformation,
              {
                backgroundColor: mode === "light" ? light.main4 : dark.main1,
              },
            ]}
          >
            <View>
              <View style={styles.row}>
                <TextStyle color={light.main2} bigSubtitle>
                  PAGO
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
                  {checkOutModalVisible?.fullName?.slice(0, 8)}:{" "}
                  {thousandsSystem(total)}
                </TextStyle>
                <InputStyle
                  editable={!businessPayment}
                  stylesContainer={{
                    width: SCREEN_WIDTH / 2.6,
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
                    {thousandsSystem(total)}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Monto a pagar:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(businessPayment ? total : totalToPay)}
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
              {!checkOutModalVisible?.owner && (
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
              )}
              <ButtonStyle
                backgroundColor={light.main2}
                style={{ marginTop: checkOutModalVisible?.owner ? 20 : 0 }}
                onPress={async () => {
                  const debugItem = cleanHosted(checkOutModalVisible);

                  const send = async () => {
                    const newReservation = {
                      ...standardReservations.find(
                        (s) => s.ref === checkOutModalVisible.reservationID
                      ),
                    };
                    const newData = {
                      ...debugItem,
                      checkOut: paymentOptions.checkOut
                        ? new Date().getTime()
                        : debugItem.checkOut,
                      checkIn: paymentOptions.checkIn
                        ? new Date().getTime()
                        : debugItem.checkIn,
                      payment: businessPayment
                        ? "business"
                        : parseInt(totalToPay),
                    };
                    if (checkOutModalVisible.type === "accommodation")
                      dispatch(editRA({ id: debugItem.id, data: newData }));
                    if (checkOutModalVisible.type === "standard") {
                      const newHosted = newReservation?.hosted.map((h) => ({
                        ...h,
                        checkOut: paymentOptions.checkOut
                          ? new Date().getTime()
                          : h.checkOut,
                        checkIn: paymentOptions.checkIn
                          ? new Date().getTime()
                          : h.checkIn,
                      }));

                      newReservation.hosted = newHosted;
                      newReservation.payment = businessPayment
                        ? "business"
                        : parseInt(totalToPay);

                      dispatch(
                        editRS({
                          ref: newReservation.ref,
                          data: newReservation,
                        })
                      );
                    }

                    if (paymentOptions.checkIn || paymentOptions.checkOut) {
                      const reservation =
                        standardReservations.find(
                          (s) => s.ref === checkOutModalVisible.reservationID
                        ) ||
                        accommodationReservations.find(
                          (a) => a.id === checkOutModalVisible.reservationID
                        );
                      await manageEconomy({
                        ids: [debugItem.owner],
                        hosted: reservation.hosted || [reservation],
                      });
                    }
                    cleanData();

                    await editReservation({
                      identifier: helperStatus.active
                        ? helperStatus.identifier
                        : user.identifier,
                      reservation: {
                        data:
                          checkOutModalVisible.type === "standard"
                            ? newReservation
                            : [newData],
                        type: checkOutModalVisible.type,
                      },
                      helpers: helperStatus.active
                        ? [helperStatus.id]
                        : user.helpers.map((h) => h.id),
                    });
                  };

                  if (totalToPay !== total && !businessPayment) {
                    Alert.alert(
                      "ADVERTENCIA",
                      `Los hospédados ${
                        total > totalToPay
                          ? `deben ${thousandsSystem(total - totalToPay)}`
                          : `te dieron una propina de ${thousandsSystem(
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
  cardInformation: {
    width: "90%",
    borderRadius: 8,
    padding: 30,
  },
  table: {
    width: 83,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
  cardPicker: {
    padding: 2,
    borderRadius: 8,
  },
});

export default People;

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
} from "@api";
import AddPerson from "@components/AddPerson";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import { Picker } from "@react-native-picker/picker";
import {
  edit as editEco,
  remove as removeEco,
  removeMany as removeManyEco,
} from "@features/function/economySlice";
import { edit as editRS } from "@features/zones/standardReservationsSlice";
import { removeManyByOwner as removeMBORS } from "@features/zones/standardReservationsSlice";
import { removeManyByOwner as removeMBORA } from "@features/zones/accommodationReservationsSlice";
import { removeManyByOwner as removeMBOO } from "@features/tables/ordersSlice";

import { remove as removeCustomer } from "@features/people/customersSlice";
import { remove as removeSupplier } from "@features/people/suppliersSlice";

import {
  changeDate,
  thousandsSystem,
  random,
  getFontSize,
} from "@helpers/libs";
import FullFilterDate from "@components/FullFilterDate";
import theme from "@theme";
import ChooseDate from "@components/ChooseDate";
import GuestTable from "@components/GuestTable";

const { light, dark } = theme();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const People = ({ navigation, userType }) => {
  const [section, setSection] = useState("general");
  const [providers, setProviders] = useState([]);
  const [activeSearch, setActiveSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState(false);
  const [search, setSearch] = useState("");
  const initialState = {
    active: false,
    type: "",
    minSubClient: "",
    maxSubClient: "",
    minReservation: "",
    maxReservation: "",
    minDebt: "",
    maxDebt: "",
    identification: "",
    activeReservation: false,
    activeDebt: false,
    day: "all",
    month: "all",
    year: "all",
  };
  const [filters, setFilters] = useState(initialState);
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

  const customers = useSelector((state) => state.customers);
  const suppliers = useSelector((state) => state.suppliers);

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
    setReservationRoute("");
    setActiveSearch(false);
    setSearch("");
    setFilters(initialState);
  }, [accountsPayable]);

  const dateValidation = (date, dateCompare) => {
    let error = false;
    if (dateCompare.day !== "all" && date.getDate() !== dateCompare.day)
      error = true;
    if (
      dateCompare.month !== "all" &&
      date.getMonth() + 1 !== dateCompare.month
    )
      error = true;
    if (dateCompare.year !== "all" && date.getFullYear() !== dateCompare.year)
      error = true;
    return error;
  };

  useEffect(() => {
    if (search || filters.active) {
      if (userType === "customer") {
        setProviders(
          [
            ...customers
              .filter((p) => {
                const firstCondition =
                  p.name.toLowerCase()?.includes(search.toLowerCase()) ||
                  p.identification?.includes(search) ||
                  thousandsSystem(p.identification)?.includes(search);

                let secondCondition;

                if (p.special) {
                  secondCondition = p.clientList.some(
                    (c) =>
                      c.name
                        .toLowerCase()
                        ?.includes(search.toLocaleLowerCase()) ||
                      c.identification?.includes(search) ||
                      thousandsSystem(c.identification)?.includes(search)
                  );
                }

                if (firstCondition || secondCondition) {
                  if (!filters.active) return p;
                  if (
                    dateValidation(new Date(p.creationDate), {
                      day: filters.day,
                      month: filters.month,
                      year: filters.year,
                    })
                  )
                    return;
                  if (
                    filters.identification === "yes-identification" &&
                    !p.identification
                  )
                    return;
                  if (
                    filters.identification === "no-identification" &&
                    p.identification
                  )
                    return;
                  if (filters.type === "customer") {
                    if (p.special) return;
                    if (filters.activeReservation) {
                      const hostedStandard = standardReservations.find((s) =>
                        s.hosted.some((h) => h.owner === p.id)
                      );
                      const hostedAccommodation =
                        accommodationReservations.find((a) => a.owner === p.id);
                      if (!hostedStandard && !hostedAccommodation) return;
                    }
                    if (filters.activeDebt) {
                      const debt = orders.find((o) => o.ref === p.id && !o.pay);
                      if (!debt) return;
                    }
                  }

                  if (filters.type === "agency") {
                    if (!p.special) return;

                    const hostedClients = p.clientList.filter((pc) => {
                      return (
                        standardReservations.some((s) =>
                          s.hosted.some((h) => h.owner === pc.id)
                        ) ||
                        accommodationReservations.some((a) => a.owner === pc.id)
                      );
                    });

                    const debts = p.clientList.filter((pc) =>
                      orders.some((o) => o.ref === pc.id && !o.pay)
                    );

                    if (
                      filters.activeReservation &&
                      hostedClients.length !== p.clientList.length
                    )
                      return;
                    if (
                      filters.activeDebt &&
                      debts.length !== p.clientList.length
                    )
                      return;
                    if (
                      filters.minSubClient &&
                      p.clientList.length <
                        parseInt(filters.minSubClient.replace(/\D/g, ""))
                    )
                      return;
                    if (
                      filters.maxSubClient &&
                      p.clientList.length >
                        parseInt(filters.maxSubClient.replace(/\D/g, ""))
                    )
                      return;
                    if (
                      filters.minReservation &&
                      hostedClients.length <
                        parseInt(filters.minReservation.replace(/\D/g, ""))
                    )
                      return;
                    if (
                      filters.maxReservation &&
                      hostedClients.length >
                        parseInt(filters.maxReservation.replace(/\D/g, ""))
                    )
                      return;
                    if (
                      filters.minDebt &&
                      debts.length <
                        parseInt(filters.minDebt.replace(/\D/g, ""))
                    )
                      return;
                    if (
                      filters.maxDebt &&
                      debts.length >
                        parseInt(filters.maxDebt.replace(/\D/g, ""))
                    )
                      return;
                  }

                  return p;
                }
              })
              .map(({ id, ...rest }) => ({ ...rest, personID: id })),
          ].reverse()
        );
      }

      if (userType === "supplier") {
        setProviders(
          [
            ...suppliers
              .filter((p) => {
                if (
                  p.name.toLowerCase()?.includes(search.toLowerCase()) ||
                  p.identification?.includes(search) ||
                  thousandsSystem(p.identification)?.includes(search)
                ) {
                  if (!filters.active) return p;
                  if (
                    dateValidation(new Date(p.creationDate), {
                      day: filters.day,
                      month: filters.month,
                      year: filters.year,
                    })
                  )
                    return;
                  if (
                    filters.identification === "yes-identification" &&
                    !p.identification
                  )
                    return;
                  if (
                    filters.identification === "no-identification" &&
                    p.identification
                  )
                    return;

                  return p;
                }
              })
              .map(({ id, ...rest }) => ({ ...rest, personID: id })),
          ].reverse()
        );
      }
    } else findProviders();
  }, [
    customers,
    suppliers,
    section,
    economy,
    accommodationReservations,
    standardReservations,
    orders,
    sales,
    search,
    filters,
  ]);

  const deletePerson = (data) => {
    const removeP = async () => {
      if (userType === "customer")
        dispatch(removeCustomer({ id: data.personID }));
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
    if (reservationSelected.type === "accommodation")
      return saveHosted({ data, cleanData });

    data.ref = nomenclatureSelected.id;
    data.id = random(10, { number: true });
    data.owner = personSelected.personID;
    data.checkOut = null;

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

    data.owner = personSelected.personID;
    data.checkOut = null;
    data.ref = nomenclatureSelected.id;
    data.id = random(10, { number: true });

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

    const Customer = ({ item }) => {
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
                          invoice: OF ? OF.invoice : null,
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
                  !existsAccommodation.id
                    ? light.textDark
                    : mode === 'light' ? dark.textWhite : light.textDark
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
                            ? !existsAccommodation.id
                              ? light.textDark
                              : mode === 'light' ? dark.textWhite : light.textDark
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
              item.clientList?.map((c) => <Customer item={c} key={c.id} />)}
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
            style={{ marginBottom: 20 }}
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
      dayCreation: "all",
      monthCreation: "all",
      yearCreation: "all",
      dayCheckIn: "all",
      monthCheckIn: "all",
      yearCheckIn: "all",
      dayCheckOut: "all",
      monthCheckOut: "all",
      yearCheckOut: "all",
    };
    const [filters, setFilters] = useState(initialState);
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
            let customer = null;
            if (person.owner) {
              // Vemos si tiene afiliacion con cliente
              const individual = customers.find((p) => p.id === person.owner); // Buscamos si es un cliente individual
              if (!individual) {
                // Comprovamos si lo es
                const agency = customers.find((p) =>
                  p?.clientList?.some((c) => c.id === person.owner)
                ); // Buscamos si es un cliente de agencia
                if (agency) customer = agency; // Si lo es que lo guarde en clientes si no el parametro cliente queda null
              } else customer = individual; // Si lo es pasamos el dato al cliente
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
              customer: person.owner ? customer : null,
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
          let customer = null;
          if (item.owner) {
            // Vemos si tiene afiliacion con cliente
            const individual = customers.find((p) => p.id === item.owner); // Buscamos si es un cliente individual
            if (!individual) {
              // Comprovamos si lo es
              const agency = customers.find((p) =>
                p?.clientList?.some((c) => c.id === item.owner)
              ); // Buscamos si es un cliente de agencia
              if (agency) customer = agency; // Si lo es que lo guarde en clientes si no el parametro cliente queda null
            } else customer = individual; // Si lo es pasamos el dato al cliente
          }

          return {
            ...item,
            groupID: ref,
            nomenclatureID: item.ref,
            reservationID: item.id,
            zone,
            nomenclature,
            customer: item.owner ? customer : null,
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
              if (
                dateValidation(new Date(h.creationDate), {
                  day: filters.dayCreation,
                  month: filters.monthCreation,
                  year: filters.yearCreation,
                })
              )
                return;
              if (
                dateValidation(new Date(h.checkIn), {
                  day: filters.dayCheckIn,
                  month: filters.monthCheckdayCheckIn,
                  year: filters.yearCheckdayCheckIn,
                })
              )
                return;
              if (
                dateValidation(new Date(h.checkOut), {
                  day: filters.dayCheckOut,
                  month: filters.monthChecdayCheckOut,
                  year: filters.yearChecdayCheckOut,
                })
              )
                return;
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

    const TableDebt = ({
      guest,
      navigateToReservation,
      width,
      paymentEvent,
    }) => {
      const [debt, setDebt] = useState(0);

      useEffect(() => {
        const amount = guest.discount
          ? guest.amount * guest.days - guest.discount
          : guest.amount * guest.days;
        setDebt(amount - guest.payment);
      }, [guest]);

      return (
        <TouchableOpacity
          onPress={() => {
            if (!debt) return;
            if (guest.type === "standard") navigateToReservation(guest);
            if (guest.type === "accommodation") paymentEvent({ hosted: guest });
          }}
          style={[
            styles.table,
            {
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              width,
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
                  <GuestTable
                    addTable={[
                      {
                        title: "DEUDA",
                        width: 100,
                        body: (props) => (
                          <TableDebt {...props} width={100} key={props.key} />
                        ),
                      },
                    ]}
                    hosted={item.hosted}
                  />
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
                <FullFilterDate
                  title="Por fecha (CREACIÓN)"
                  increment={5}
                  defaultValue={{
                    day: filters.dayCreation,
                    month: filters.monthCreation,
                    year: filters.yearCreation,
                  }}
                  onChangeDay={(value) =>
                    setFilters({ ...filters, dayCreation: value })
                  }
                  onChangeMonth={(value) =>
                    setFilters({ ...filters, monthCreation: value })
                  }
                  onChangeYear={(value) =>
                    setFilters({ ...filters, yearCreation: value })
                  }
                />
                {reservationRoute && (
                  <FullFilterDate
                    title="Por fecha (CHECK IN)"
                    defaultValue={{
                      day: filters.dayCheckIn,
                      month: filters.monthCheckIn,
                      year: filters.yearCheckIn,
                    }}
                    onChangeDay={(value) =>
                      setFilters({ ...filters, dayCheckIn: value })
                    }
                    onChangeMonth={(value) =>
                      setFilters({ ...filters, monthCheckIn: value })
                    }
                    onChangeYear={(value) =>
                      setFilters({ ...filters, yearCheckIn: value })
                    }
                  />
                )}
                {reservationRoute === "check-out" && (
                  <FullFilterDate
                    title="Por fecha (CHECK OUT)"
                    defaultValue={{
                      day: filters.dayCheckOut,
                      month: filters.monthCheckOut,
                      year: filters.yearCheckOut,
                    }}
                    onChangeDay={(value) =>
                      setFilters({ ...filters, dayCheckOut: value })
                    }
                    onChangeMonth={(value) =>
                      setFilters({ ...filters, monthCheckOut: value })
                    }
                    onChangeYear={(value) =>
                      setFilters({ ...filters, yearCheckOut: value })
                    }
                  />
                )}
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
    <Layout>
      {section === "general" ? (
        <View style={{ justifyContent: "space-between", flexGrow: 1 }}>
          <View>
            {activeSearch && (
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
                    setActiveSearch(false);
                    setSearch("");
                    setFilters(initialState);
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
                  value={search}
                  onChangeText={(text) => setSearch(text)}
                  stylesContainer={{ width: "78%", marginVertical: 0 }}
                  stylesInput={{
                    paddingHorizontal: 6,
                    paddingVertical: 5,
                    fontSize: 18,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setActiveFilter(!activeFilter)}
                >
                  <Ionicons
                    name="filter"
                    size={getFontSize(24)}
                    color={light.main2}
                  />
                </TouchableOpacity>
              </View>
            )}
            {!activeSearch && (
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
                        setActiveSearch(true);
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
                {userType === "supplier"
                  ? "No hay proveedores"
                  : "No hay clientes"}
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
            <View style={{ marginTop: 25 }}>
              {filters.type === "agency" && (
                <View style={styles.row}>
                  <View style={{ width: "48%" }}>
                    <TextStyle
                      smallParagraph
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Sub-Clientes MIN
                    </TextStyle>
                    <InputStyle
                      value={filters.minSubClient}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, minSubClient: value });
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
                      Sub-Clientes MAX
                    </TextStyle>
                    <InputStyle
                      value={filters.maxSubClient}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, maxSubClient: value });
                      }}
                      placeholder="MAX"
                      keyboardType="numeric"
                      maxLength={11}
                    />
                  </View>
                </View>
              )}
              {filters.type === "agency" && !filters.activeReservation && (
                <View style={styles.row}>
                  <View style={{ width: "48%" }}>
                    <TextStyle
                      smallParagraph
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Reservaciones MIN
                    </TextStyle>
                    <InputStyle
                      value={filters.minReservation}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, minReservation: value });
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
                      Reservaciones MAX
                    </TextStyle>
                    <InputStyle
                      value={filters.maxReservation}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, maxReservation: value });
                      }}
                      placeholder="MAX"
                      keyboardType="numeric"
                      maxLength={11}
                    />
                  </View>
                </View>
              )}
              {filters.type === "agency" && !filters.activeDebt && (
                <View style={styles.row}>
                  <View style={{ width: "48%" }}>
                    <TextStyle
                      smallParagraph
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Deudas MIN
                    </TextStyle>
                    <InputStyle
                      value={filters.minDebt}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, minDebt: value });
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
                      Deudas MAX
                    </TextStyle>
                    <InputStyle
                      value={filters.maxDebt}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, maxDebt: value });
                      }}
                      placeholder="MAX"
                      keyboardType="numeric"
                      maxLength={11}
                    />
                  </View>
                </View>
              )}
              <View style={[styles.row, { marginTop: 10 }]}>
                {userType === "customer" && (
                  <View
                    style={[
                      styles.cardPicker,
                      {
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        width: "49%",
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
                        label="Tipo"
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
                        label="Cliente"
                        value="customer"
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />

                      <Picker.Item
                        label="Agencia"
                        value="agency"
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
                )}
                <View
                  style={[
                    styles.cardPicker,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                      width: userType === "supplier" ? "100%" : "49%",
                    },
                  ]}
                >
                  <Picker
                    mode="dropdown"
                    selectedValue={filters.identification}
                    onValueChange={(itemValue) =>
                      setFilters({ ...filters, identification: itemValue })
                    }
                    dropdownIconColor={
                      mode === "light" ? light.textDark : dark.textWhite
                    }
                    style={{
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                      color: mode === "light" ? light.textDark : dark.textWhite,
                      fontSize: 20,
                    }}
                  >
                    <Picker.Item
                      label="Cédula"
                      value=""
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                    <Picker.Item
                      label="Inactiva"
                      value="no-identification"
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />

                    <Picker.Item
                      label="Activa"
                      value="yes-identification"
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </Picker>
                </View>
              </View>
              <FullFilterDate
                title="Por fecha (CREACIÓN)"
                increment={5}
                defaultValue={{
                  day: filters.day,
                  month: filters.month,
                  year: filters.year,
                }}
                onChangeDay={(value) => setFilters({ ...filters, day: value })}
                onChangeMonth={(value) =>
                  setFilters({ ...filters, month: value })
                }
                onChangeYear={(value) =>
                  setFilters({ ...filters, year: value })
                }
              />
              {filters.type && (
                <View style={{ marginTop: 15 }}>
                  <View style={styles.row}>
                    <TextStyle verySmall color={light.main2}>
                      {filters.type === "agency"
                        ? "Todas las reservas activas"
                        : "Reserva activa"}
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={(value) =>
                        setFilters({
                          ...filters,
                          minReservation: "",
                          maxReservation: "",
                          activeReservation: value,
                        })
                      }
                      value={filters.activeReservation}
                    />
                  </View>
                  <View style={styles.row}>
                    <TextStyle verySmall color={light.main2}>
                      {filters.type === "agency"
                        ? "Todas las deudas activas"
                        : "Deuda activa"}
                    </TextStyle>
                    <Switch
                      trackColor={{ false: dark.main2, true: light.main2 }}
                      thumbColor={light.main4}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={(value) =>
                        setFilters({
                          ...filters,
                          minDebt: "",
                          maxDebt: "",
                          activeDebt: value,
                        })
                      }
                      value={filters.activeDebt}
                    />
                  </View>
                </View>
              )}
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
                  backgroundColor={mode === "light" ? light.main5 : dark.main2}
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

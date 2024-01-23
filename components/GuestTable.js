import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Switch,
  FlatList
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { changeDate, random, addDays, getFontSize, thousandsSystem } from "@helpers/libs";
import {
  removeReservation,
  addEconomy,
  removeEconomy,
  editEconomy,
  editReservation,
} from "@api";
import {
  edit as editRS,
  remove as removeRS,
} from "@features/zones/standardReservationsSlice";
import {
  add as addE,
  edit as editE,
  remove as removeE,
} from "@features/function/economySlice";
import {
  edit as editRA,
  remove as removeRA,
} from "@features/zones/accommodationReservationsSlice";
import AddPerson from "@components/AddPerson";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from '@components/InputStyle';
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();
const { width: SCREEN_WIDTH } = Dimensions.get('screen');

const GuestTable = ({ hosted, tableOptions = {}, addTable = [] }) => {
  const options = {
    date: true,
    checkIn: true,
    name: true,
    days: true,
    group: true,
    customer: true,
    paid: true,
    ...tableOptions,
  };
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );
  const mode = useSelector((state) => state.mode);
  const orders = useSelector((state) => state.orders);
  const economy = useSelector((state) => state.economy);
  const helperStatus = useSelector((state) => state.helperStatus);
  const customers = useSelector(state => state.customers);
  const user = useSelector(state => state.user);

  const [checkOutModalVisible, setCheckOutModalVisible] = useState({
    active: false,
  });
  const [businessPayment, setBusinessPayment] = useState(false);
  const [totalToPay, setTotalToPay] = useState(0);
  const [payment, setPayment] = useState("");
  const [tip, setTip] = useState(0);
  const [total, setTotal] = useState(0);

  const [paymentOptions, setPaymentOptions] = useState({
    checkIn: false,
    checkOut: false,
  });

  useEffect(() => {
    setTip(total - totalToPay);
  }, [totalToPay, total]);

  const hostedChangeRef = useRef(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

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

  //
  const cleanData = () => {
    setBusinessPayment(false);
    setTotal(0);
    setCheckOutModalVisible({ active: false });
    setTotalToPay(0);
    setPayment("");
    hostedChangeRef.current = null;
  };

  const cleanHosted = (hosted) => {
    const debugItem = { ...hosted };
    delete debugItem.active;
    delete debugItem.groupID;
    delete debugItem.nomenclatureID;
    delete debugItem.reservationID;
    delete debugItem.zone;
    delete debugItem.nomenclature;
    delete debugItem.customer;
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

  const getOwners = ({ ids, reservation }) => {
    const manageEconomyHosted = [];
    //manageEconomyHosted, Esto es por si existe mas de un sub-cliente para no crear 2 o mas economy para un cliente
    const reserveOwners = [];
    // reserveOwners, es solo para habitaciones standard.
    // Sirve para que cuando exista varios sub-clientes de una misma agencia se filtren.
    // Cuando todos los sub-clientes hacen check-out de una misma agencia esta se va a cobrar,
    // A la agencia, de lo contrario no se cobra.
    // Si los sub-clientes son de diferentes agencias no pasa nada, corre el codigo normal
    // Solo es para validar cuando hay muchos sub-clientes de una agencia en la misma habitacion

    const getFiltered = (arr) => {
      const result = arr.reduce((acc, item) => {
        const found = acc.find((r) => r.clientID === item.clientID);
        if (found) found.quantity += 1;
        else
          acc.push({ clientID: item.clientID, owner: item.owner, quantity: 1 });
        return acc;
      }, []);

      return result;
    };

    // getFiltered filtramos los elementos que se repite y lo eliminamos, aparte sumamos en una
    // nueva propiedad llamada quantity los elementos que se duplican
    
    if (reservation.type === "standard") {
      for (const h of reservation.hosted.filter(
        (h) => h.owner && !h.checkOut
      )) {
        const found = customers.find(
          (p) =>
            p?.id === h.owner ||
            p?.clientList?.some((c) => c.id === h.owner)
        );
        if (!found) continue;
        reserveOwners.push({ clientID: found?.id, owner: h.owner });
      }
    }

    for (let owner of ids) {
      const found = customers.find(
        (p) => p?.id === owner || p?.clientList?.some((c) => c.id === owner)
      );
      if (!found) continue;
      manageEconomyHosted.push({ clientID: found?.id, owner });
    }

    const compareReserve = getFiltered(reserveOwners);
    const compareEconomy = getFiltered(manageEconomyHosted);

    if (reservation.type === 'standard') {
      return compareEconomy.reduce((acc, curr) => {
        const found = compareReserve.find((r) => r.clientID === curr.clientID);
        if (!found || found.quantity === curr.quantity) acc.push(curr.owner);
        return acc;
      }, []);
    } else return compareEconomy.map(c => c.owner);
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
      const customer = hosted.find((h) => h.owner === ownerRef);

      const owners = getOwners({ ids, reservation });
      
      if (!person || !owners.length) continue;

      if (foundEconomy) {
        const currentEconomy = { ...foundEconomy };
        currentEconomy.amount -=
          customer.type === "accommodation"
            ? customer.amount * customer.days
            : reservation.amount;
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
      const customer = hosted.find((h) => h.owner === ownerRef);

      const owners = getOwners({ ids, reservation });
      
      if (!person || !owners.length) continue;

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
            customer.type === "accommodation"
              ? customer.amount * customer.days
              : reservation.amount,
          name: `Deuda ${person.name}`,
          payment: 0,
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
        currentEconomy.amount +=
          customer.type === "accommodation"
            ? customer.amount * customer.days
            : reservation.amount;
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

  const InformationGuest = ({ modalVisible, setModalVisible, item }) => {
    const [openMoreInformation, setOpenMoreInformation] = useState(false);
    const [editing, setEditing] = useState(false);
    const [OF, setOF] = useState(null);
    const [debt, setDebt] = useState(0);

    const [handler, setHandler] = useState({
      active: true,
      key: Math.random(),
    });

    useEffect(() => {
      const amount = item?.discount
        ? item?.amount - item?.discount
        : item?.amount;

      setDebt(amount * item.days - item.payment);
    }, [item]);

    useEffect(() => {
      setOF(orders.find((o) => o.ref === (item.owner || item.id) && !o.pay));
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
                          checkOut: item.checkOut ? null : new Date().getTime(),
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
                      editRS({ ref: newReservation.ref, data: newReservation })
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
      data.checkIn = item.checkIn && data.checkIn ? item.checkIn : data.checkIn;
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

    const validationToNavigate = ({ selectedSale }) => {
      let reserve;
      if (item.type === "accommodation") {
        const hostedClean = cleanHosted(item);
        reserve = { type: item.type, hosted: [hostedClean] };
      }

      if (item.type === "standard")
        reserve = standardReservations.find(
          (r) => r.ref === item.reservationID
        );

      const navigate = ({ createClient }) => {
        if (selectedSale === "sale") {
          navigation.navigate("Sales", {
            ref: item.owner || item.id,
            name: item.fullName,
            createClient: createClient ? reserve : undefined,
          });
        }

        if (selectedSale === "menu") {
          const OF = orders.find(
            (o) => o.ref === (item.owner || item.id) && o.pay === false
          );
          navigation.navigate("CreateOrder", {
            editing: OF ? true : false,
            id: OF ? OF.id : undefined,
            ref: item.owner || item.id,
            table: item.fullName,
            selection: OF ? OF.selection : [],
            invoice: OF ? OF.invoice : null,
            reservation: "Cliente",
            createClient: createClient ? reserve : undefined,
          });
        }
      };

      if (!item.owner) {
        Alert.alert(
          "NO REGISTRADO",
          "¿El huésped no esta registrado como cliente, desea registrarlo?",
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "No",
              onPress: () => navigate({ createClient: false }),
            },
            {
              text: "Si",
              onPress: () => navigate({ createClient: true }),
            },
          ]
        );
      } else navigate({ createClient: false });
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
                  <TouchableOpacity onPress={() => checkInEvent({ item })}>
                    <TextStyle color={light.main2}>
                      {item.checkIn ? changeDate(new Date(item.checkIn)) : "NO"}
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
                      if (!item.customer) return;
                      navigation.navigate("PeopleInformation", {
                        type: "person",
                        userType: "customer",
                        ref: item.customer.id,
                      });
                    }}
                  >
                    <TextStyle color={light.main2}>
                      {!item.customer
                        ? "No"
                        : item.customer.special
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
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Deuda:{" "}
                    <TextStyle color={light.main2}>
                      {!debt ? "SIN DEUDA" : thousandsSystem(debt)}
                    </TextStyle>
                  </TextStyle>
                )}
                {item.type === "accommodation" && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextStyle
                      color={mode === "light" ? light.textDark : dark.textWhite}
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
                    onPress={() =>
                      validationToNavigate({ selectedSale: "sale" })
                    }
                  >
                    <TextStyle center>P&S</TextStyle>
                  </ButtonStyle>
                  <ButtonStyle
                    onPress={() =>
                      validationToNavigate({ selectedSale: "menu" })
                    }
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

    return (
      <>
        <View style={{ flexDirection: "row" }}>
          {options.date && (
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
          )}
          {options.checkIn && (
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
          )}
          {options.name && (
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
          )}
          {options.days && (
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
          )}
          {options.group && (
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
          )}
          {options.customer && (
            <TouchableOpacity
              onPress={() => {
                if (!guest.customer) return;
                navigation.navigate("PeopleInformation", {
                  type: "person",
                  userType: "customer",
                  ref: guest.customer.id,
                });
              }}
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                  width: 70,
                },
              ]}
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {!guest.customer
                  ? "No"
                  : guest.customer.special
                  ? "Agencia"
                  : "Individual"}
              </TextStyle>
            </TouchableOpacity>
          )}
          {options.paid && (
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
          )}
          {addTable.map((table) =>
            table.body({ guest, navigateToReservation, key: guest?.id, paymentEvent })
          )}
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
    <>
      <View>
        <View style={{ flexDirection: "row" }}>
          {options.date && (
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
          )}
          {options.checkIn && (
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
          )}
          {options.name && (
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
          )}
          {options.days && (
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
          )}
          {options.group && (
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
          )}
          {options.customer && (
            <View
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                  width: 70,
                },
              ]}
            >
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
                smallParagraph
              >
                CLIENTE
              </TextStyle>
            </View>
          )}
          {options.paid && (
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
          )}
          {addTable.map((table) => (
            <View
              key={table.title}
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                  width: table.width || "",
                },
              ]}
            >
              <TextStyle color={light.main2} smallParagraph>
                {table.title}
              </TextStyle>
            </View>
          ))}
        </View>
        <FlatList
          data={hosted}
          scrollEnabled={false}
          initialNumToRender={2}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <Guest guest={item} />}
        />
      </View>
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
              styles.card,
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
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  table: {
    width: 120,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
  card: {
    width: "90%",
    borderRadius: 8,
    padding: 30,
  },
});

export default GuestTable;

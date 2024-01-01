import { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Switch,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import AddPerson from "@components/AddPerson";
import {
  changeDate,
  thousandsSystem,
  print,
  generatePDF,
  random,
  getFontSize,
  addDays,
} from "@helpers/libs";
import {
  removeReservation,
  editReservation,
  editEconomy,
  addEconomy,
  removeEconomy,
} from "@api";
import {
  edit as editRS,
  remove as removeRS,
} from "@features/zones/standardReservationsSlice";
import {
  edit as editRA,
  remove as removeRA,
} from "@features/zones/accommodationReservationsSlice";
import {
  add as addE,
  edit as editE,
  remove as removeE,
} from "@features/function/economySlice";
import helperNotification from "@helpers/helperNotification";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const dark = theme.colors.dark;
const light = theme.colors.light;

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const Hosted = ({ name, id, onChangeText, editable, style = {} }) => {
  const mode = useSelector((state) => state.mode);
  const [payment, setPayment] = useState("");

  return (
    <View key={id} style={[styles.row, style]}>
      <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
        {name}
      </TextStyle>
      <InputStyle
        editable={editable}
        stylesContainer={{ width: width / 2.6, opacity: editable ? 1 : 0.5 }}
        placeholder="Pagado"
        keyboardType="numeric"
        value={payment}
        onChangeText={(num) => {
          setPayment(thousandsSystem(num.replace(/[^0-9]/g, "")));
          onChangeText(num);
        }}
        maxLength={13}
      />
    </View>
  );
};

const ReserveInformation = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );
  const nomenclatureState = useSelector((state) => state.nomenclatures);
  const helperStatus = useSelector((state) => state.helperStatus);
  const user = useSelector((state) => state.user);
  const orders = useSelector((state) => state.orders);
  const economy = useSelector((state) => state.economy);
  const customers = useSelector((state) => state.client);

  const [reserve, setReserve] = useState(null);
  const [totalPayment, setTotalPayment] = useState(0);
  const [nomenclature, setNomenclature] = useState({});
  const [show, setShow] = useState(false);
  const [selectedSale, setSelectedSale] = useState("");

  //////////

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState({
    checkIn: false,
    checkOut: false,
  });
  const [hosted, setHosted] = useState([]);
  const [hostedPayment, setHostedPayment] = useState(0);
  const [businessPayment, setBusinessPayment] = useState(false);
  const [totalToPay, setTotalToPay] = useState(0);
  const [tip, setTip] = useState(0);
  const [amount, setAmount] = useState(0);

  const hostedChangeRef = useRef([]);
  const pickerRef = useRef();
  const navigationStack = useNavigation();

  const place = route.params.place;
  const reservation = route.params.reservation;

  //////////

  const [text, setText] = useState("");

  useEffect(() => {
    if (place.type === "accommodation") {
      const ids = reservation.map((r) => r.id);
      const reserves = accommodationReservations.filter((r) =>
        ids.includes(r.id)
      );
      const data = {
        hosted: reserves,
        days: reserves.map((r) => r.days).every((n) => n === reserves[0]?.days)
          ? reserves[0]?.days
          : "Mixto",
        end: reserves.map((r) => r.end).every((n) => n === reserves[0]?.end)
          ? reserves[0]?.end
          : "Mixto",
        start: reserves
          .map((r) => r.start)
          .every((n) => n === reserves[0]?.start)
          ? reserves[0]?.start
          : "Mixto",
        amount: reserves[0]?.amount,
        discount: reserves
          .map((r) => r.discount)
          .every((n) => n === reserves[0]?.discount)
          ? reserves[0]?.discount
          : "Mixto",
        type: reserves[0]?.type,
        accommodation: reserves[0]?.accommodation,
        creationDate: reserves
          .map((r) => r.creationDate)
          .every((n) => n === reserves[0]?.creationDate)
          ? reserves[0]?.creationDate
          : "Mixto",
        modificationDate: reserves
          .map((r) => r.modificationDate)
          .every((n) => n === reserves[0]?.modificationDate)
          ? reserves[0]?.modificationDate
          : "Mixto",
      };

      setReserve(data);
      const amount = reserves.reduce((a, b) => {
        const value = b?.discount
          ? (b?.amount - b?.discount) * b?.days
          : b?.amount * b?.days;

        return a + value;
      }, 0);

      setAmount(amount);
      setTotalPayment(
        reserves?.reduce((a, b) => {
          if (b.payment === "business") {
            const value = b?.discount
              ? (b?.amount - b?.discount) * b?.days
              : b?.amount * b?.days;
            return a + value;
          } else return a + b.payment;
        }, 0)
      );
    }

    if (place.type === "standard") {
      const reserve = standardReservations.find(
        (r) => r.ref === reservation[0]?.ref
      );
      setReserve(reserve);
      const amount = reserve?.discount
        ? reserve?.amount - reserve?.discount
        : reserve?.amount;

      setAmount(amount);
      setTotalPayment(
        reserve?.payment === "business" ? amount : reserve?.payment
      );
    }

    setNomenclature(nomenclatureState.find((n) => n.id === place.id));
  }, [
    standardReservations,
    accommodationReservations,
    nomenclatureState,
    orders,
  ]);

  useEffect(() => {
    setTip(amount - totalToPay);
  }, [totalToPay, amount]);

  const dispatch = useDispatch();

  useEffect(() => {
    setHostedPayment(
      place.type === "standard"
        ? reserve?.payment
        : reserve?.hosted.reduce((a, b) => {
            if (b.payment === "business") {
              return a + b?.discount
                ? (b?.amount - b?.discount) * b?.days
                : b?.amount * b?.days;
            } else return a + b.payment;
          }, 0)
    );
  }, [reserve]);

  useEffect(() => {
    setText("");
    const text = reserve?.hosted.reduce((a, item) => {
      return (
        a +
        `<tr>
            <td style="width: 100px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600; word-break: break-word;">${
                item.fullName
              }</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600; word-break: break-word;">${
                item.checkIn ? changeDate(new Date(item.checkIn)) : "NO"
              }</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600; word-break: break-word;">${
                item.owner ? "SI" : "NO"
              }</p>
            </td>
          </tr>`
      );
    }, "");
    setText(text);
  }, [reserve?.hosted]);

  const html = `
<html lang="en">

<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Document</title>
<style type="text/css">
  * {
    padding: 0;
    margin: 0;
    box-sizing: 'border-box';
    font-family: sans-serif;
    color: #444444
  }

  @page { margin: 20px; } 
</style>
</head>

<body>
<view style="padding: 20px; width: 500px; display: block; margin: 20px auto; background-color: #FFFFFF;">
    <view style="margin: 10px;">
      <h2 style="text-align: center; color: #444444; font-size: 50px; font-weight: 800;">
        RESERVACIÓN
      </h2>
      <p style="text-align: center; color: #444444; font-size: 38px; font-weight: 800;">
        Huespédes
      </p>
    </view>
    <view style="width: 100%;">
      <table style="width: 100%; margin-top: 30px;">
        <tr>
          <td style="width: 100px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 14px; font-weight: 600;">NOMBRE</p>
          </td>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 14px; font-weight: 600;">CHECK IN</p>
          </td>
          <td style="width: 50px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 14px; font-weight: 600;">REGISTRADO</p>
          </td>
        </tr>
        ${text?.replace(/,/g, "")}
      </table>

      <table style="width: 100%; margin-top: 10px;">
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Alojados</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${reserve?.hosted.length}
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Días reservado</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${reserve?.days}
          </p>
        </td>
      </tr>
      ${
        reserve?.discount
          ? `<tr>
      <td style="text-align: left;">
        <p style="font-size: 28px; font-weight: 600;">Descuento</p>
      </td>
      <td style="text-align: right;">
        <p style="font-size: 28px; font-weight: 600;">
         ${thousandsSystem(reserve?.discount)}
        </p>
      </td>
    </tr>`
          : ""
      }
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">${
            amount - totalPayment === 0
              ? "Sin deuda"
              : amount - totalPayment < 0
              ? "Propina recibida:"
              : "Deuda pendiente:"
          }</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
          ${
            amount - totalPayment !== 0
              ? reserve?.amount
                ? thousandsSystem(Math.abs(amount - totalPayment))
                : "0"
              : ""
          }
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Dinero pagado</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${reserve?.hosted ? thousandsSystem(totalPayment) : "0"}
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Tipo de alojamiento</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${reserve?.valueType === "standard" ? "ESTANDAR" : "POR ACOMODACIÓN"}
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Registro</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${
             reserve?.start === "Mixto"
               ? "Mixto"
               : changeDate(new Date(reserve?.start))
           }
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Finalización</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${
             reserve?.end === "Mixto"
               ? "Mixto"
               : changeDate(new Date(reserve?.end))
           }
          </p>
        </td>
      </tr>
      </table>
          
      <p style="text-align: center; font-size: 30px; font-weight: 600; margin-top: 30px;">Costo de alojamiento: ${
        reserve?.amount ? thousandsSystem(amount) : "0"
      }</p>
      
    </view>
    <p style="text-align: center; font-size: 30px; font-weight: 600;">${changeDate(
      new Date()
    )} ${("0" + new Date().getHours()).slice(-2)}:${(
    "0" + new Date().getMinutes()
  ).slice(-2)}</p>
  </view>
</body>

</html>
`;

  const removePayment = ({ type, hosted }) => {
    Alert.alert(
      "REMOVER",
      `¿Quieres remover ${type === "general" ? "todos los" : "el"} PAGO${
        type === "general" ? "S" : ""
      }?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            const newReservation = { ...reserve };
            const data = [];
            if (place.type === "accommodation") {
              for (let h of hosted) {
                const nh = { ...h, payment: 0 };
                data.push(nh);
                dispatch(editRA({ id: h.id, data: nh }));
              }
            }

            if (place.type === "standard") {
              newReservation.payment = 0;
              dispatch(editRS({ ref: reserve.ref, data: newReservation }));
            }

            await editReservation({
              identifier: helperStatus.active
                ? helperStatus.identifier
                : user.identifier,
              reservation: {
                data: place.type === "standard" ? newReservation : data,
                type: place.type,
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
      const accommodation = !hosted.some(
        (h) => h.payment === 0 && h.payment !== "business"
      );
      const standard = !(
        reserve?.payment === 0 && reserve?.payment !== "business"
      );
      if (
        (place.type === "accommodation" && accommodation) ||
        (place.type === "standard" && standard)
      ) {
        return removePayment({
          type:
            hosted.length > 1 && place.type !== "standard"
              ? "general"
              : "unique",
          hosted,
        });
      }

      const hostedFiltered = hosted.filter(
        (r) => r.payment === 0 && r.payment !== "business"
      );
      setPaymentModalVisible(!paymentModalVisible);
      setHosted(hostedFiltered);
      if (options) setPaymentOptions({ ...paymentOptions, ...options });
      hostedChangeRef.current = hostedFiltered.map((h) => {
        const newHosted = { ...h };
        newHosted.payment = h?.payment;
        return newHosted;
      });
    };

    if (callBack) {
      Alert.alert(
        "PAGO",
        `¿${
          place.type === "standard" && reserve?.hosted?.length > 1
            ? "Los huéspedes han"
            : "El huésped ha"
        } pagado?`,
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
              const newReservation = { ...reserve };

              if (place.type === "accommodation") {
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

              if (place.type === "standard") {
                const newHosted = reserve?.hosted.map((i) => {
                  if (i.id === item.id) {
                    const newI = { ...i };
                    newI.checkIn = i.checkIn ? null : new Date().getTime();
                    return newI;
                  }
                  return i;
                });

                newReservation.hosted = newHosted;
                dispatch(editRS({ ref: reserve.ref, data: newReservation }));
              }

              await editReservation({
                identifier: helperStatus.active
                  ? helperStatus.identifier
                  : user.identifier,
                reservation: {
                  data:
                    place.type === "standard"
                      ? newReservation
                      : [
                          {
                            ...item,
                            checkIn: item.checkIn ? null : new Date().getTime(),
                          },
                        ],
                  type: place.type,
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
                hosted: [item],
                options: { checkIn: true },
              });
            else event();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const debugHosted = ({ current, ids }) => {
    const manageEconomyHosted = ids
      .map((owner) => ({
        clientID: customers.find(
          (p) => p?.id === owner || p?.clientList?.some((c) => c.id === owner)
        )?.id,
        hosted: reserve?.hosted?.find((h) => h.owner === owner),
      }))
      .filter(({ clientID }) => clientID); // Aqui analizamos los ids que nos pasaron, si no existe el cliente que no lo pase

    const duplicates = manageEconomyHosted.filter(
      // Vemos si los datos obtenidos tenemos duplicados >= 2
      (s, i, arr) => arr.filter((m) => m.clientID === s.clientID).length >= 2
    );
    const person = duplicates.find((d) => d.hosted?.owner === current); // Vemos cual es el usuario que se esta buscando

    const amountGeneral = duplicates // Aqui vemos si dentro de los duplicados existe
      .filter((d) => d.clientID === person.clientID)
      .reduce((a, b) => a + b.hosted.amount * b.hosted.days, 0);

    const currentHosted = reserve?.hosted?.find((h) => h.owner === current); // Si no hay duplicados pasaremos el valor normal
    const amountUnique = currentHosted.amount * currentHosted.days;

    return person ? amountGeneral : amountUnique;
  };

  const deleteEconomy = async ({ ids }) => {
    const manageEconomyHosted = [];
    for (let owner of ids) {
      const found = customers.find(
        (p) => p?.clientList?.some((c) => c.id === owner) || p?.id === owner
      );
      if (!found) continue;
      if (!manageEconomyHosted.some((h) => h?.clientID === found?.id)) {
        manageEconomyHosted.push({ clientID: found?.id, owner });
      }
    }
    const owners = manageEconomyHosted.map((m) => m?.owner);

    for (let ownerRef of owners) {
      const person = customers.find(
        (p) =>
          p.id === ownerRef || p?.clientList?.some((c) => c.id === ownerRef)
      );

      const foundEconomy = economy.find((e) => e.ref === person.id);
      const checkedAmount = debugHosted({ current: ownerRef, ids });

      if (!person) continue;

      if (foundEconomy) {
        const currentEconomy = { ...foundEconomy };
        currentEconomy.amount -=
          place.type === "accommodation" ? checkedAmount : amount; //TODO CAMBIAR AMOUNT
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
                const newReservation = { ...reserve };

                if (place.type === "accommodation") {
                  dispatch(
                    editRA({
                      id: item.id,
                      data: {
                        ...item,
                        checkIn: checkIn ? new Date().getTime() : item.checkIn,
                        checkOut: item.checkOut ? null : new Date().getTime(),
                      },
                    })
                  );
                }

                if (place.type === "standard") {
                  const newHosted = reserve?.hosted.map((i) => {
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
                  dispatch(editRS({ ref: reserve.ref, data: newReservation }));
                }

                if (item.owner) {
                  if (item.checkOut) await deleteEconomy({ ids: [item.owner] });
                  else await manageEconomy({ ids: [item.owner] });
                }

                await editReservation({
                  identifier: helperStatus.active
                    ? helperStatus.identifier
                    : user.identifier,
                  reservation: {
                    data:
                      place.type === "standard"
                        ? newReservation
                        : [
                            {
                              ...item,
                              checkOut: item.checkOut
                                ? null
                                : new Date().getTime(),
                            },
                          ],
                    type: place.type,
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
                  hosted: [item],
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

  const cleanData = () => {
    setPaymentOptions({ checkIn: false, checkOut: false });
    setBusinessPayment(false);
    setPaymentModalVisible(false);
    setTotalToPay(0);
    setHosted([]);
    hostedChangeRef.current = [];
  };

  const manageEconomy = async ({ ids }) => {
    const manageEconomyHosted = []; //Esto es por si existe mas de un sub-cliente para no crear 2 o mas economy para un cliente
    for (let owner of ids) {
      const found = customers.find(
        (p) => p?.id === owner || p?.clientList?.some((c) => c.id === owner)
      );
      if (!found) continue;
      if (!manageEconomyHosted.some((h) => h?.clientID === found?.id)) {
        manageEconomyHosted.push({ clientID: found?.id, owner });
      }
    }
    const owners = manageEconomyHosted.map((m) => m?.owner);

    for (let ownerRef of owners) {
      const person = customers.find(
        (p) =>
          p.id === ownerRef || p?.clientList?.some((c) => c.id === ownerRef)
      );

      const checkedAmount = debugHosted({ current: ownerRef, ids });
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
          amount: place.type === "accommodation" ? checkedAmount : amount, //TODO CAMBIAR AMOUNT
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
          place.type === "accommodation" ? checkedAmount : amount; //TODO CAMBIAR AMOUNT
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

  const Table = ({ item }) => {
    const [client, setClient] = useState(null); //TODO QUE NO SE CAMBIE A CADA RATO
    const [informationModalVisible, setInformationModalVisible] =
      useState(false);
    const [editing, setEditing] = useState(false);
    const [openMoreInformation, setOpenMoreInformation] = useState(false);
    const [handler, setHandler] = useState({
      active: true,
      key: Math.random(),
    });

    useEffect(() => {
      if (item.owner) {
        // Vemos si tiene afiliacion con cliente
        const individual = customers.find((p) => p.id === item.owner); // Buscamos si es un cliente individual
        if (!individual) {
          // Comprovamos si lo es
          const agency = customers.find((p) =>
            p?.clientList?.some((c) => c.id === item.owner)
          ); // Buscamos si es un cliente de agencia
          if (agency) setClient(agency); // Si lo es que lo guarde en clientes si no el parametro cliente queda null
        } else setClient(individual); // Si lo es pasamos el dato al cliente
      }
    },[item]);

    const updateHosted = async ({ data, cleanData }) => {
      data.id = item.id;
      data.ref = item.ref;
      data.owner = item.owner;
      data.checkOut = item.checkOut;
      let reserveUpdated;

      if (place.type === "accommodation") {
        const date = new Date(item.start);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        const end = addDays(
          new Date(year, month, day),
          parseInt(data.days - 1)
        ).getTime();
        dispatch(editRA({ id: item.id, data: { ...item, ...data, end } }));
      }
      if (place.type === "standard") {
        let reservationREF = standardReservations.find(
          (r) => r.ref === reservation[0]?.ref
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
      setInformationModalVisible(!informationModalVisible);
      await editReservation({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        reservation: {
          data:
            place.type === "standard" ? reserveUpdated : [{ ...item, ...data }],
          type: place.type,
        },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    };

    return (
      <>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
              },
            ]}
            onPress={() => setInformationModalVisible(!informationModalVisible)}
          >
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {`${item.fullName.slice(0, 15)}${
                item.fullName.length > 15 ? "..." : ""
              }`}
            </TextStyle>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => checkInEvent({ item })}
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
                width: 85,
              },
            ]}
          >
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {item.checkIn ? changeDate(new Date(item.checkIn)) : "NO"}
            </TextStyle>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!client) return;
              navigation.navigate("PeopleInformation", {
                type: "person",
                userType: "customer",
                ref: client.id,
              });
            }}
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
                width: 70,
              },
            ]}
          >
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {!client ? 'No' : client.special ? 'Agencia' : 'Individual'}
            </TextStyle>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => checkOutEvent({ item })}
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
                width: 85,
              },
            ]}
          >
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {item.checkOut ? changeDate(new Date(item.checkOut)) : "NO"}
            </TextStyle>
          </TouchableOpacity>
          {place.type === "accommodation" && (
            <TouchableOpacity
              onPress={() => paymentEvent({ hosted: [item] })}
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
                  ? !item.payment
                    ? "EN ESPERA"
                    : item.payment === "business"
                    ? "POR EMPRESA"
                    : thousandsSystem(item.payment)
                  : "PRIVADO"}
              </TextStyle>
            </TouchableOpacity>
          )}
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={informationModalVisible}
          onRequestClose={() =>
            setInformationModalVisible(!informationModalVisible)
          }
        >
          <TouchableWithoutFeedback
            onPress={() => setInformationModalVisible(!informationModalVisible)}
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
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity onPress={() => setEditing(!editing)}>
                    <Ionicons
                      name="create-outline"
                      size={getFontSize(28)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setInformationModalVisible(!informationModalVisible)
                    }
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
                      if (!client) return;
                      navigation.navigate("PeopleInformation", {
                        type: "person",
                        userType: "customer",
                        ref: client.id,
                      });
                    }}
                  >
                    <TextStyle color={light.main2}>
                      {!client
                        ? "No"
                        : client.special
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
                {place.type === "accommodation" && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextStyle
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Pagado:{" "}
                    </TextStyle>
                    <TouchableOpacity
                      onPress={() => paymentEvent({ hosted: [item] })}
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
                    {place.type === "accommodation" && (
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
                    {place.type === "accommodation" && (
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
                    {place.type === "accommodation" && (
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
                    {place.type === "accommodation" && (
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
                    {place.type === "accommodation" && item.discount && (
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
                    {place.type === "accommodation" && (
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
                    {place.type === "accommodation" && item.start && (
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
                    {place.type === "accommodation" && item.end && (
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
              {place.type === "accommodation" && (
                <ButtonStyle
                  backgroundColor={light.main2}
                  onPress={() => setOpenMoreInformation(!openMoreInformation)}
                >
                  <TextStyle center>
                    {!openMoreInformation ? "Mostrar más" : "Mostrar menos"}
                  </TextStyle>
                </ButtonStyle>
              )}
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
                          const ids = reserve?.hosted
                            .filter(
                              (h) => h.owner && h.checkOut && h.id === item.id
                            )
                            .map((h) => h.owner);

                          const send = async () => {
                            if (reserve?.hosted.length === 1) navigation.pop();
                            else
                              setInformationModalVisible(
                                !informationModalVisible
                              );

                            if (place.type === "accommodation") {
                              dispatch(removeRA({ id: item.id }));
                            }

                            if (place.type === "standard") {
                              const newReservation = { ...reserve };
                              const newHosted = reserve?.hosted.filter(
                                (h) => h.id !== item.id
                              );
                              newReservation.hosted = newHosted;
                              if (reserve?.hosted.length > 1) {
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
                                    type: place.type,
                                  },
                                  helpers: helperStatus.active
                                    ? [helperStatus.id]
                                    : user.helpers.map((h) => h.id),
                                });
                              } else {
                                dispatch(
                                  removeRS({ ref: reservation[0]?.ref })
                                );
                              }
                            }

                            if (
                              place.type === "accommodation" ||
                              reserve?.hosted.length === 1
                            ) {
                              await removeReservation({
                                identifier: helperStatus.active
                                  ? helperStatus.identifier
                                  : user.identifier,
                                reservation: {
                                  identifier:
                                    place.type === "standard"
                                      ? reservation[0]?.ref
                                      : [item.id],
                                  type: place.type,
                                },
                                helpers: helperStatus.active
                                  ? [helperStatus.id]
                                  : user.helpers.map((h) => h.id),
                              });
                            }
                          };

                          if (ids.length > 0) {
                            Alert.alert(
                              "ECONOMÍA",
                              "¿Quiere eliminar la información de economía del cliente?",
                              [
                                {
                                  text: "No",
                                  onPress: async () => await send(),
                                },
                                {
                                  text: "Si",
                                  onPress: async () => {
                                    await deleteEconomy({ ids });
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
        </Modal>
        <AddPerson
          key={handler.key}
          setEditing={setHandler}
          modalVisible={editing}
          setModalVisible={setEditing}
          editing={{ active: true, ...item }}
          discount={place.type === "accommodation"}
          handleSubmit={(data) => updateHosted(data)}
          type={place.type}
        />
      </>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: height / 1.3 }}
        contentContainerStyle={{
          height: height / 1.3,
          justifyContent: "center",
          alignItem: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TextStyle
            smallTitle
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            Reservación
          </TextStyle>
          {(!helperStatus.active || helperStatus.accessToReservations) && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => print({ html })}>
                <Ionicons
                  name="print"
                  size={getFontSize(28)}
                  color={light.main2}
                  style={{ marginHorizontal: 5 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  generatePDF({
                    html,
                    code: reserve?.fullName
                      ? reserve?.fullName
                      : random(6, { number: true }),
                  })
                }
              >
                <Ionicons
                  name="document-attach"
                  size={getFontSize(28)}
                  color={light.main2}
                  style={{ marginHorizontal: 5 }}
                />
              </TouchableOpacity>
              {place.type === "standard" && (
                <TouchableOpacity
                  onPress={() => {
                    const date = new Date(reserve.start);
                    const day = date.getDate();
                    const month = date.getMonth() + 1;
                    const year = date.getFullYear();

                    navigation.navigate("CreateReserve", {
                      reserve,
                      ref: reservation[0]?.ref,
                      place,
                      day,
                      month,
                      year,
                      editing: true,
                    });
                  }}
                  style={{ marginHorizontal: 5 }}
                >
                  <Ionicons
                    name="create-outline"
                    size={getFontSize(31)}
                    color={light.main2}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <TextStyle smallSubtitle color={light.main2}>
          <TextStyle
            smallSubtitle
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            Nomenclatura:{" "}
          </TextStyle>
          {nomenclature.nomenclature}
        </TextStyle>
        <View style={{ marginVertical: 30 }}>
          <ButtonStyle
            backgroundColor={mode === "light" ? light.main5 : dark.main2}
            style={{ marginBottom: 20 }}
            onPress={() => setShow(!show)}
          >
            <TextStyle
              center
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {show ? "Ocultar" : "Mostrar"} Huéspedes
            </TextStyle>
          </ButtonStyle>
          {show && (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 20 }}
              >
                <View>
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
                      <TextStyle color={light.main2} smallParagraph>
                        Nombre
                      </TextStyle>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (
                          helperStatus.active &&
                          !helperStatus.accessToReservations
                        )
                          return;
                        const quantity = reserve?.hosted.reduce((a, b) => {
                          const bc = b.checkIn ? 1 : -1;
                          return a + bc;
                        }, 0);
                        Alert.alert(
                          "CAMBIAR",
                          `¿Pasar a todos los huéspedes que ${
                            quantity >= 0 ? "no" : ""
                          } ha llegado?`,
                          [
                            {
                              text: "Cancelar",
                              style: "cancel",
                            },
                            {
                              text: "Si",
                              onPress: () => {
                                const newReservation = { ...reserve };
                                let reservations = [];

                                const event = async () => {
                                  if (place.type === "accommodation") {
                                    const checkIn =
                                      quantity < 0
                                        ? new Date().getTime()
                                        : null;
                                    for (let re of reserve.hosted) {
                                      dispatch(
                                        editRA({
                                          id: re.id,
                                          data: { ...re, checkIn },
                                        })
                                      );
                                      reservations.push({ ...re, checkIn });
                                    }
                                  }

                                  if (place.type === "standard") {
                                    const newHosted = reserve?.hosted.map(
                                      (i) => {
                                        const newI = { ...i };
                                        newI.checkIn =
                                          quantity < 0
                                            ? new Date().getTime()
                                            : null;
                                        return newI;
                                      }
                                    );

                                    newReservation.hosted = newHosted;
                                    dispatch(
                                      editRS({
                                        ref: reserve.ref,
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
                                        place.type === "standard"
                                          ? newReservation
                                          : reservations,
                                      type: place.type,
                                    },
                                    helpers: helperStatus.active
                                      ? [helperStatus.id]
                                      : user.helpers.map((h) => h.id),
                                  });
                                };

                                const payment = reserve?.hosted.some(
                                  (h) =>
                                    h.payment === 0 && h.payment !== "business"
                                );
                                if (quantity < 0 && payment)
                                  paymentEvent({
                                    callBack: event,
                                    hosted: reserve?.hosted,
                                    options: { checkIn: true },
                                  });
                                else event();
                              },
                            },
                          ],
                          { cancelable: true }
                        );
                      }}
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                          width: 85,
                        },
                      ]}
                    >
                      <TextStyle color={light.main2} smallParagraph>
                        CHECK IN
                      </TextStyle>
                    </TouchableOpacity>
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
                      <TextStyle color={light.main2} smallParagraph>
                        CLIENTE
                      </TextStyle>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (
                          helperStatus.active &&
                          !helperStatus.accessToReservations
                        )
                          return;
                        const quantity = reserve?.hosted.reduce((a, b) => {
                          const bc = b.checkOut ? 1 : -1;
                          return a + bc;
                        }, 0);
                        Alert.alert(
                          "CAMBIAR",
                          `¿Pasar a todos los huéspedes que ${
                            quantity >= 0 ? "no" : ""
                          } se han ido?`,
                          [
                            {
                              text: "Cancelar",
                              style: "cancel",
                            },
                            {
                              text: "Si",
                              onPress: async () => {
                                const newReservation = { ...reserve };
                                let reservations = [];

                                const mainEvent = ({ checkIn }) => {
                                  const event = async () => {
                                    const checkOut =
                                      quantity < 0
                                        ? new Date().getTime()
                                        : null;
                                    if (place.type === "accommodation") {
                                      for (let re of reserve.hosted) {
                                        dispatch(
                                          editRA({
                                            id: re.id,
                                            data: {
                                              ...re,
                                              checkOut,
                                              checkIn: checkIn
                                                ? new Date().getTime()
                                                : re.checkIn,
                                            },
                                          })
                                        );
                                        reservations.push({
                                          ...re,
                                          checkOut,
                                          checkIn: checkIn
                                            ? new Date().getTime()
                                            : re.checkIn,
                                        });
                                      }
                                    }

                                    if (place.type === "standard") {
                                      const newHosted = reserve?.hosted.map(
                                        (i) => {
                                          const newI = { ...i };

                                          newI.checkOut = checkOut;
                                          newI.checkIn = checkIn
                                            ? new Date().getTime()
                                            : newI.checkIn;
                                          return newI;
                                        }
                                      );

                                      newReservation.hosted = newHosted;
                                      dispatch(
                                        editRS({
                                          ref: reserve.ref,
                                          data: newReservation,
                                        })
                                      );
                                    }

                                    const ids = reserve.hosted
                                      .filter((h) => h.owner)
                                      .map((h) => h.owner);
                                    if (checkOut) await manageEconomy({ ids });
                                    else await deleteEconomy({ ids });

                                    await editReservation({
                                      identifier: helperStatus.active
                                        ? helperStatus.identifier
                                        : user.identifier,
                                      reservation: {
                                        data:
                                          place.type === "standard"
                                            ? newReservation
                                            : reservations,
                                        type: place.type,
                                      },
                                      helpers: helperStatus.active
                                        ? [helperStatus.id]
                                        : user.helpers.map((h) => h.id),
                                    });
                                  };

                                  const payment = reserve?.hosted.some(
                                    (h) =>
                                      h.payment === 0 &&
                                      h.payment !== "business"
                                  );
                                  if (quantity < 0 && payment)
                                    paymentEvent({
                                      callBack: event,
                                      hosted: reserve?.hosted,
                                      options: { checkIn, checkOut: true },
                                    });
                                  else event();
                                };

                                const quantityCheckIn = reserve?.hosted.reduce(
                                  (a, b) => {
                                    if (!b.checkIn) return a + 1;
                                    return a;
                                  },
                                  0
                                );
                                if (quantityCheckIn > 1 && quantity < 0) {
                                  Alert.alert(
                                    "NO HAN LLEGADO",
                                    "¿Algunos huéspedes no han llegado, desea activar sus CHECK IN?",
                                    [
                                      {
                                        text: "Cancelar",
                                        style: "cancel",
                                      },
                                      {
                                        text: "No",
                                        onPress: () =>
                                          mainEvent({ checkIn: false }),
                                      },
                                      {
                                        text: "Si",
                                        onPress: () =>
                                          mainEvent({ checkIn: true }),
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
                      }}
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                          width: 85,
                        },
                      ]}
                    >
                      <TextStyle color={light.main2} smallParagraph>
                        CHECK OUT
                      </TextStyle>
                    </TouchableOpacity>

                    {place.type === "accommodation" && (
                      <TouchableOpacity
                        onPress={() =>
                          paymentEvent({ hosted: reserve?.hosted })
                        }
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
                      </TouchableOpacity>
                    )}
                  </View>
                  {reserve?.hosted.map((item) => (
                    <Table item={item} key={item.id + item.ref} />
                  ))}
                </View>
              </ScrollView>
              {(!helperStatus.active || helperStatus.accessToReservations) && (
                <ButtonStyle
                  onPress={() => paymentEvent({ hosted: reserve.hosted })}
                  style={{ marginBottom: 20 }}
                  backgroundColor={light.main2}
                >
                  <TextStyle center>
                    {totalPayment !== amount ? "Pago" : "Eliminar pago"}
                  </TextStyle>
                </ButtonStyle>
              )}
            </View>
          )}
          <View>
            {(!helperStatus.active || helperStatus.accessToReservations) &&
              reserve?.discount && (
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Descuento:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(reserve?.discount)}
                  </TextStyle>
                </TextStyle>
              )}
            {(!helperStatus.active || helperStatus.accessToReservations) && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Costo de alojamiento:{" "}
                <TextStyle color={light.main2}>
                  {reserve?.amount ? thousandsSystem(amount) : "0"}
                </TextStyle>
              </TextStyle>
            )}
            {(!helperStatus.active || helperStatus.accessToReservations) && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {amount - totalPayment === 0
                  ? "Sin deuda"
                  : amount - totalPayment < 0
                  ? "Propina recibida:"
                  : "Deuda pendiente:"}{" "}
                {amount - totalPayment !== 0 && (
                  <TextStyle color={light.main2}>
                    {reserve?.amount
                      ? thousandsSystem(Math.abs(amount - totalPayment))
                      : "0"}
                  </TextStyle>
                )}
              </TextStyle>
            )}
            {(!helperStatus.active || helperStatus.accessToReservations) && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Dinero pagado:{" "}
                <TextStyle color={light.main2}>
                  {reserve?.hosted ? thousandsSystem(totalPayment) : "0"}
                </TextStyle>
              </TextStyle>
            )}
            {(!helperStatus.active || helperStatus.accessToReservations) && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Tipo de alojamiento:{" "}
                <TextStyle color={light.main2}>
                  {reserve?.type === "standard"
                    ? "ESTANDAR"
                    : "POR ACOMODACIÓN"}
                </TextStyle>
              </TextStyle>
            )}
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Personas alojadas:{" "}
              <TextStyle color={light.main2}>
                {reserve?.hosted
                  ? thousandsSystem(reserve?.hosted.length)
                  : "0"}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Días reservado:{" "}
              <TextStyle color={light.main2}>
                {reserve?.days ? thousandsSystem(reserve?.days) : "0"}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Fecha de registro:{" "}
              <TextStyle color={light.main2}>
                {reserve?.start === "Mixto"
                  ? "Mixto"
                  : changeDate(new Date(reserve?.start))}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Fecha de finalización:{" "}
              <TextStyle color={light.main2}>
                {reserve?.end === "Mixto"
                  ? "Mixto"
                  : changeDate(new Date(reserve?.end))}
              </TextStyle>
            </TextStyle>
          </View>
        </View>
        <ButtonStyle
          backgroundColor={light.main2}
          onPress={() => {
            Alert.alert("VENTAS", "¿A cuál de estas ventas quieres ingresar?", [
              {
                text: "Cancelar",
                style: "cancel",
              },
              {
                text: "Menú",
                onPress: () => {
                  setSelectedSale("menu");
                  pickerRef.current?.focus();
                },
              },
              {
                text: "Productos&Servicios",
                onPress: () => {
                  setSelectedSale("sale");
                  pickerRef.current?.focus();
                },
              },
            ]);
          }}
        >
          <TextStyle center>Ventas</TextStyle>
        </ButtonStyle>

        <View style={{ display: "none" }}>
          <Picker
            ref={pickerRef}
            style={{
              color: mode === "light" ? light.textDark : dark.textWhite,
            }}
            onValueChange={(hosted) => {
              const navigate = ({ createClient }) => {
                if (selectedSale === "sale") {
                  navigation.navigate("Sales", {
                    ref: hosted.owner || hosted.id,
                    name: hosted.fullName,
                    createClient: createClient ? reserve : undefined,
                  });
                }

                if (selectedSale === "menu") {
                  const OF = orders.find(
                    (o) =>
                      o.ref === (hosted.owner || hosted.id) && o.pay === false
                  );
                  navigationStack.navigate("CreateOrder", {
                    editing: OF ? true : false,
                    id: OF ? OF.id : undefined,
                    ref: hosted.owner || hosted.id,
                    table: hosted.fullName,
                    selection: OF ? OF.selection : [],
                    reservation: "Cliente",
                    createClient: createClient ? reserve : undefined,
                  });
                }
              };

              if (!hosted.owner) {
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
            }}
            onBlur={() => setSelectedSale("")}
          >
            <Picker.Item
              label="---- SELECCIONA EL HUÉSPED ----"
              value=""
              style={{
                backgroundColor: mode === "light" ? light.main5 : dark.main2,
              }}
              color={mode === "light" ? light.textDark : dark.textWhite}
            />
            {reserve?.hosted.map((h) => (
              <Picker.Item
                key={h.id}
                label={h.fullName}
                value={h}
                style={{
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                }}
                color={mode === "light" ? light.textDark : dark.textWhite}
              />
            ))}
          </Picker>
        </View>

        {(!helperStatus.active || helperStatus.accessToReservations) && (
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={() => {
              Alert.alert(
                "¿Estás seguro?",
                "Se eliminarán todos los datos de esta reserva",
                [
                  {
                    text: "No estoy seguro",
                    style: "cancel",
                  },
                  {
                    text: "Estoy seguro",
                    onPress: async () => {
                      const ids = reserve?.hosted
                        .filter((h) => h.owner && h.checkOut)
                        .map((h) => h.owner);

                      const send = async () => {
                        if (place.type === "accommodation") {
                          for (let h of reserve?.hosted) {
                            dispatch(removeRA({ id: h.id }));
                          }
                        }

                        if (place.type === "standard") {
                          dispatch(removeRS({ ref: reservation[0]?.ref }));
                        }

                        navigation.pop();
                        await removeReservation({
                          identifier: helperStatus.active
                            ? helperStatus.identifier
                            : user.identifier,
                          reservation: {
                            identifier:
                              place.type === "standard"
                                ? reservation[0]?.ref
                                : reserve?.hosted.map((h) => h.id),
                            type: place.type,
                          },
                          helpers: helperStatus.active
                            ? [helperStatus.id]
                            : user.helpers.map((h) => h.id),
                        });
                        await helperNotification(
                          helperStatus,
                          user,
                          "Reservación eliminada",
                          `Una reservación ha sido eliminada por ${user.identifier}`,
                          "accessToReservations"
                        );
                      };

                      if (ids.length > 0) {
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
                                await deleteEconomy({ ids });
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
            <TextStyle center>Eliminar reservación</TextStyle>
          </ButtonStyle>
        )}
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={paymentModalVisible}
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
                {place.type === "accommodation"
                  ? "Añade el pago total del huésped"
                  : "Añade el pago de la reservación"}
              </TextStyle>
            </View>
            <View>
              {place.type === "standard" && (
                <Hosted
                  name="Pago general"
                  id={reserve?.ref}
                  editable={!businessPayment}
                  onChangeText={(num) =>
                    setTotalToPay(num.replace(/[^0-9]/g, "") || 0)
                  }
                  style={{ marginVertical: 10 }}
                />
              )}
              {place.type === "accommodation" && (
                <FlatList
                  data={hosted}
                  keyExtractor={(h) => h.id}
                  renderItem={({ item }) => (
                    <Hosted
                      name={`${item?.fullName?.slice(0, 8)}${
                        place.type === "accommodation"
                          ? ": " +
                            thousandsSystem(
                              item?.discount
                                ? (item?.amount - item?.discount) * item?.days
                                : item?.amount * item?.days
                            )
                          : ""
                      }`}
                      id={item?.id}
                      onChangeText={(num) => {
                        hostedChangeRef.current = hostedChangeRef.current.map(
                          (h) => {
                            if (h.id === item?.id) {
                              const nh = { ...h };
                              nh.payment = num
                                ? parseInt(num.replace(/[^0-9]/g, ""))
                                : 0;
                              return nh;
                            }
                            return h;
                          }
                        );

                        setTotalToPay(
                          hostedChangeRef.current.reduce(
                            (a, b) => a + b.payment,
                            0
                          )
                        );
                      }}
                      editable={!businessPayment}
                    />
                  )}
                  style={{ maxHeight: 200, marginVertical: 10 }}
                />
              )}
              <View>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Monto pagado:{" "}
                  <TextStyle color={light.main2}>
                    {hostedPayment ? thousandsSystem(hostedPayment) : "0"}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Monto faltante:{" "}
                  <TextStyle color={light.main2}>
                    {reserve ? thousandsSystem(amount - hostedPayment) : "0"}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Monto a pagar:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(
                      businessPayment
                        ? place.type === "standard"
                          ? amount
                          : hostedChangeRef.current.reduce((a, b) => {
                              const value = b?.discount
                                ? (b?.amount - b?.discount) * b?.days
                                : b?.amount * b?.days;
                              return a + value;
                            }, 0)
                        : totalToPay
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
              {!hosted.some((h) => h?.owner) && (
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
                style={{
                  marginTop:
                    place.type === "accommodation" &&
                    hosted.some((h) => h?.owner)
                      ? 20
                      : 0,
                }}
                onPress={async () => {
                  const checkOutActive = reserve?.hosted.reduce((a, b) => {
                    if (b.checkOut) return a;
                    return a + 1;
                  }, 0);
                  const isAlertActive = checkOutActive === hosted.length;

                  const send = async () => {
                    const newReservation = { ...reserve };
                    const newData = [];
                    if (place.type === "accommodation") {
                      for (let h of hostedChangeRef.current) {
                        const nh = {
                          ...h,
                          checkOut: paymentOptions.checkOut
                            ? new Date().getTime()
                            : h.checkOut,
                          checkIn: paymentOptions.checkIn
                            ? new Date().getTime()
                            : h.checkIn,
                          payment: businessPayment ? "business" : h.payment,
                        };

                        newData.push(nh);
                        dispatch(editRA({ id: h.id, data: nh }));
                      }
                    }

                    if (place.type === "standard") {
                      const newHosted = reserve?.hosted.map((h) => ({
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
                        editRS({ ref: reserve.ref, data: newReservation })
                      );
                    }

                    if (paymentOptions.checkIn || paymentOptions.checkOut) {
                      await manageEconomy({
                        ids: hostedChangeRef.current //TODO VER SI ESTA BIEN PARA STANDARD
                          .filter((h) => h.owner)
                          .map((h) => h.owner),
                      });
                    }
                    cleanData();

                    await editReservation({
                      identifier: helperStatus.active
                        ? helperStatus.identifier
                        : user.identifier,
                      reservation: {
                        data:
                          place.type === "standard" ? newReservation : newData,
                        type: place.type,
                      },
                      helpers: helperStatus.active
                        ? [helperStatus.id]
                        : user.helpers.map((h) => h.id),
                    });
                  };

                  const leftover = amount - totalPayment;

                  if (
                    isAlertActive &&
                    (leftover > totalToPay || leftover < totalToPay) &&
                    !businessPayment
                  ) {
                    Alert.alert(
                      "ADVERTENCIA",
                      `Los hospédados ${
                        leftover > totalToPay
                          ? `deben ${thousandsSystem(leftover - totalToPay)}`
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
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

export default ReserveInformation;

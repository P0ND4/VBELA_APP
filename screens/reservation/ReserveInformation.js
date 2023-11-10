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
  const folk = useSelector((state) => state.people);

  const [reserve, setReserve] = useState(null);
  const [totalPayment, setTotalPayment] = useState(0);
  const [nomenclature, setNomenclature] = useState({});
  const [show, setShow] = useState(false);
  const [selectedSale, setSelectedSale] = useState("");

  //////////

  const [checkOutModalVisible, setCheckOutModalVisible] = useState(false);
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
  }, [reserve?.hosted]);

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

  const validateCheckOut = ({ type, hosted }) => {
    const active = () => {
      setCheckOutModalVisible(!checkOutModalVisible);
      setHosted(hosted);
      hostedChangeRef.current = hosted.map((h) => {
        const newHosted = { ...h };
        newHosted.payment = h?.payment;
        return newHosted;
      });
    };

    const validation =
      type === "unique"
        ? !hosted[0].checkIn
        : reserve?.hosted.some((item) => !item.checkIn);

    if (validation) {
      Alert.alert(
        `NO HA${type === "general" ? "N" : ""} LLEGADO`,
        `${
          type === "general"
            ? "Algunos huéspedes no han llegado"
            : "El huésped no ha llegado"
        }, ¿Quiere continuar? El CHECK IN se activará`,
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

  const deleteEconomy = async ({ ids }) => {
    for (let ownerRef of ids) {
      const foundEconomy = economy.find((e) => e.ref === ownerRef);
      const client = reserve?.hosted.find((h) => h.owner === ownerRef);
      const person = folk.find((p) => p.id === ownerRef);

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

  const removeCheckOut = ({ type, hosted }) => {
    Alert.alert(
      "DESHACER",
      `¿Quieres remover ${type === "general" ? "todos los" : "el"}  CHECK OUT?`,
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
                const nh = {
                  ...h,
                  checkOut: null,
                  payment: 0,
                };
                data.push(nh);
                dispatch(editRA({ id: h.id, data: nh }));
              }

              const ids = hosted.filter((h) => h.owner).map((h) => h.owner);
              if (ids.length > 0) await deleteEconomy({ ids });
            }

            if (place.type === "standard") {
              const newHosted = reserve?.hosted.map((h) => ({
                ...h,
                checkOut: null,
              }));
              newReservation.hosted = newHosted;
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
      ]
    );
  };

  const cleanData = () => {
    setBusinessPayment(false);
    setCheckOutModalVisible(false);
    setTotalToPay(0);
    setHosted([]);
    hostedChangeRef.current = [];
  };

  const manageEconomy = async ({ ids, hosted }) => {
    for (let ownerRef of ids) {
      const foundEconomy = economy.find((e) => e.ref === ownerRef);
      const client = hosted.find((h) => h.owner === ownerRef);
      const person = folk.find((p) => p.id === ownerRef);

      if (client.payment === "business" || client.payment === 0 || !person)
        continue;

      if (!foundEconomy) {
        const id = random(20);

        const newEconomy = {
          id,
          ref: ownerRef,
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

  const Table = ({ item }) => {
    const [informationModalVisible, setInformationModalVisible] =
      useState(false);
    const [editing, setEditing] = useState(false);
    const [openMoreInformation, setOpenMoreInformation] = useState(false);
    const [handler, setHandler] = useState({
      active: true,
      key: Math.random(),
    });

    const updateHosted = async ({ data, cleanData }) => {
      data.id = item.id;
      data.ref = item.ref;
      data.owner = item.owner;
      data.checkOut = item.checkOut;
      let reserveUpdated;

      if (place.type === "accommodation")
        dispatch(editRA({ id: item.id, data: { ...item, ...data } }));
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
            onPress={() => {
              if (helperStatus.active && !helperStatus.accessToReservations)
                return;

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
                    onPress: async () => {
                      const newReservation = { ...reserve };

                      if (place.type === "accommodation") {
                        dispatch(
                          editRA({
                            id: item.id,
                            data: {
                              ...item,
                              checkIn: item.checkIn
                                ? null
                                : new Date().getTime(),
                            },
                          })
                        );
                      }

                      if (place.type === "standard") {
                        const newHosted = reserve?.hosted.map((i) => {
                          if (i.id === item.id) {
                            const newI = { ...i };
                            newI.checkIn = i.checkIn
                              ? null
                              : new Date().getTime();
                            return newI;
                          }
                          return i;
                        });

                        newReservation.hosted = newHosted;
                        dispatch(
                          editRS({ ref: reserve.ref, data: newReservation })
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
                              : [
                                  {
                                    ...item,
                                    checkIn: item.checkIn
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
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
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
          <View
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
                width: 90,
              },
            ]}
          >
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {item.owner ? "SI" : "NO"}
            </TextStyle>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (place.type === "standard") return;
              if (helperStatus.active && helperStatus.accessToReservations)
                return;
              if (item.checkOut)
                removeCheckOut({ type: "unique", hosted: [item] });
              else validateCheckOut({ type: "unique", hosted: [item] });
            }}
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
                  ? !item.payment
                    ? "EN ESPERA"
                    : item.payment === "business"
                    ? "POR EMPRESA"
                    : thousandsSystem(item.payment)
                  : "PRIVADO"}
              </TextStyle>
            </View>
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
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  CHECK IN:{" "}
                  <TextStyle color={light.main2}>
                    {item.checkIn ? changeDate(new Date(item.checkIn)) : "NO"}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Cliente registrado:{" "}
                  <TextStyle color={light.main2}>
                    {item.owner ? "SI" : "NO"}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  CHECK OUT:{" "}
                  <TextStyle color={light.main2}>
                    {item.checkOut ? changeDate(new Date(item.checkOut)) : "NO"}
                  </TextStyle>
                </TextStyle>
                {place.type === "accommodation" && (
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
                    {place.type === "accommodation" && (
                      <TextStyle
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Pago total:{" "}
                        <TextStyle color={light.main2}>
                          {thousandsSystem(item.payment || "0")}
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
                          {thousandsSystem(item.payment)}
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
                              onPress: async () => {
                                const newReservation = { ...reserve };
                                let reservations = [];

                                if (place.type === "accommodation") {
                                  const checkIn =
                                    quantity < 0 ? new Date().getTime() : null;
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
                                  const newHosted = reserve?.hosted.map((i) => {
                                    const newI = { ...i };
                                    newI.checkIn =
                                      quantity < 0
                                        ? new Date().getTime()
                                        : null;
                                    return newI;
                                  });

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
                          width: 90,
                        },
                      ]}
                    >
                      <TextStyle color={light.main2} smallParagraph>
                        REGISTRADO
                      </TextStyle>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (
                          helperStatus.active &&
                          !helperStatus.accessToReservations
                        )
                          return;
                        if (!reserve?.hosted.some((h) => !h.checkOut)) {
                          removeCheckOut({
                            type: "general",
                            hosted: reserve.hosted,
                          });
                        } else {
                          validateCheckOut({
                            type: "general",
                            hosted: reserve.hosted.filter((r) => !r.checkOut),
                          });
                        }
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
                    )}
                  </View>
                  {reserve?.hosted.map((item) => (
                    <Table item={item} key={item.id + item.ref} />
                  ))}
                </View>
              </ScrollView>
              {(!helperStatus.active || helperStatus.accessToReservations) && (
                <ButtonStyle
                  onPress={() => {
                    if (
                      helperStatus.active &&
                      !helperStatus.accessToReservations
                    )
                      return;
                    if (!reserve?.hosted.some((h) => !h.checkOut)) {
                      removeCheckOut({
                        type: "general",
                        hosted: reserve.hosted,
                      });
                    } else {
                      validateCheckOut({
                        type: "general",
                        hosted: reserve.hosted.filter((r) => !r.checkOut),
                      });
                    }
                  }}
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
              if (selectedSale === "sale") {
                navigation.navigate("Sales", {
                  ref: hosted.id,
                  name: hosted.fullName,
                  createClient: true,
                });
              }

              if (selectedSale === "menu") {
                const OF = orders.find(
                  (o) => o.ref === hosted.id && o.pay === false
                );
                navigationStack.navigate("CreateOrder", {
                  editing: OF ? true : false,
                  id: OF ? OF.id : undefined,
                  ref: hosted.id,
                  table: hosted.fullName,
                  selection: OF ? OF.selection : [],
                  reservation: "Cliente",
                  createClient: true,
                });
              }
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
                  const checkOutActive = reserve?.hosted.reduce((a, b) => {
                    if (b.checkOut) return a;
                    return a + 1;
                  }, 0);
                  const isAlertActive = checkOutActive === hosted.length;

                  const send = async () => {
                    const newReservation = { ...reserve };
                    const newData = [];
                    if (place.type === "accommodation") {
                      const difference = [];

                      for (let h of hostedChangeRef.current) {
                        const nh = {
                          ...h,
                          checkOut: new Date().getTime(),
                          checkIn: new Date().getTime(),
                          payment: businessPayment ? "business" : h.payment,
                        };

                        const amount = h?.discount
                          ? (h?.amount - h?.discount) * h?.days
                          : h?.amount * h?.days;

                        const payment = amount - h.payment;
                        if (payment !== 0) difference.push(amount - h.payment);

                        newData.push(nh);
                        dispatch(editRA({ id: h.id, data: nh }));
                      }

                      const ids = hostedChangeRef.current
                        .filter((h) => h.owner)
                        .map((h) => h.owner);

                      if (ids.length > 0)
                        await manageEconomy({ ids, hosted: newData });
                    }

                    if (place.type === "standard") {
                      const newHosted = reserve?.hosted.map((h) => ({
                        ...h,
                        checkOut: new Date().getTime(),
                        checkIn: new Date().getTime(),
                      }));

                      newReservation.hosted = newHosted;
                      newReservation.payment = businessPayment
                        ? "business"
                        : parseInt(totalToPay);

                      dispatch(
                        editRS({ ref: reserve.ref, data: newReservation })
                      );
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

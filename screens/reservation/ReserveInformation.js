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
import {
  changeDate,
  thousandsSystem,
  print,
  generatePDF,
  random,
} from "@helpers/libs";
import { remove as removeR } from "@features/groups/reservationsSlice";
import {
  removeReservation,
  editReservation,
  editEconomy,
  addEconomy,
  removeEconomy,
} from "@api";
import { edit as editR } from "@features/groups/reservationsSlice";
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

const Hosted = ({
  item,
  amount,
  hostedChangeRef,
  setTotalToPay,
  editable,
  reserve,
}) => {
  const mode = useSelector((state) => state.mode);

  const [payment, setPayment] = useState(
    thousandsSystem(Math.floor(amount / reserve?.hosted.length))
  );

  return (
    <View key={item.id} style={styles.row}>
      <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
        {item?.fullName.slice(0, 14)}
        {item?.fullName.length >= 14 ? "..." : ""}
      </TextStyle>
      <InputStyle
        editable={editable}
        stylesContainer={{ width: width / 2.6, opacity: editable ? 1 : 0.5 }}
        placeholder="Pagado"
        keyboardType="numeric"
        value={payment}
        onChangeText={(num) => {
          setPayment(thousandsSystem(num.replace(/[^0-9]/g, "")));
          hostedChangeRef.current = hostedChangeRef.current.map((h) => {
            if (h.id === item.id) {
              const nh = { ...h };
              nh.payment = num ? parseInt(num.replace(/[^0-9]/g, "")) : 0;
              return nh;
            }
            return h;
          });
          setTotalToPay(
            Math.floor(
              hostedChangeRef.current.reduce((a, b) => a + b.payment, 0)
            )
          );
        }}
        maxLength={13}
      />
    </View>
  );
};

const ReserveInformation = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const reserveState = useSelector((state) => state.reservations);
  const nomenclatureState = useSelector((state) => state.nomenclatures);
  const groupState = useSelector((state) => state.groups);
  const activeGroup = useSelector((state) => state.activeGroup);
  const user = useSelector((state) => state.user);
  const orders = useSelector((state) => state.orders);
  const economy = useSelector((state) => state.economy);
  const folk = useSelector((state) => state.people);

  const [OF, setOF] = useState(null);
  const [reserve, setReserve] = useState(null);
  const [totalPayment, setTotalPayment] = useState(0);
  const [nomenclature, setNomenclature] = useState({});
  const [show, setShow] = useState(false);

  //////////

  const [checkOutModalVisible, setCheckOutModalVisible] = useState(false);
  const [hosted, setHosted] = useState([]);
  const [hostedPayment, setHostedPayment] = useState(0);
  const [businessPayment, setBusinessPayment] = useState(false);
  const [totalToPay, setTotalToPay] = useState(0);
  const [tip, setTip] = useState(0);
  const [amount, setAmount] = useState(0);

  const hostedChangeRef = useRef([]);

  //////////

  const [text, setText] = useState("");

  useEffect(() => {
    const reserve = reserveState.find((r) => r.ref === route.params.ref);
    setReserve(reserve);
    setNomenclature(nomenclatureState.find((n) => n.id === route.params.id));
    setOF(orders.find((o) => o.ref === route.params.ref && o.pay === false));
    setAmount(
      reserve?.discount ? reserve?.amount - reserve?.discount : reserve?.amount
    );
    setTotalPayment(
      reserve?.hosted?.reduce((a, b) => {
        if (b.payment === "business") {
          return a + amount / reserve?.hosted.length;
        } else return a + b.payment;
      }, 0)
    );
  }, [reserveState, nomenclatureState, orders]);

  useEffect(() => {
    setTip(amount - totalToPay);
  }, [totalToPay, amount]);

  useEffect(() => {
    setTotalToPay(
      Math.floor((amount / reserve?.hosted.length) * hosted.length)
    );
  }, [hosted, amount]);

  const dispatch = useDispatch();

  useEffect(() => {
    setHostedPayment(
      reserve?.hosted.reduce((a, b) => {
        if (b.payment === "business") {
          return a + amount / reserve?.hosted.length;
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
            <td style="width: 100px; border: 1px solid #000; padding: 8px;">
              <p style="font-size: 14px; font-weight: 600; word-break: break-word;">${
                item.email
              }</p>
            </td>
            <td style="width: 100px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600; word-break: break-word;">${thousandsSystem(
                item.identification
              )}</p>
            </td>
            <td style="width: 100px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600; word-break: break-word;">${
                item.phoneNumber
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
          <td style="width: 100px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 14px; font-weight: 600;">CORREO</p>
          </td>
          <td style="width: 100px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 14px; font-weight: 600;">CÉDULA</p>
          </td>
          <td style="width: 100px; border: 1px solid #000; padding: 8px">
            <p style="font-size: 14px; font-weight: 600; display: inline-block;">TELÉFONO</p>
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
           ${changeDate(new Date(reserve?.start))}
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Finalización</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${changeDate(new Date(reserve?.end))}
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
        newHosted.payment = amount / reserve?.hosted.length;
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
            identifier: activeGroup.active
              ? activeGroup.identifier
              : user.identifier,
            id: foundEconomy.id,
            groups: activeGroup.active
              ? [activeGroup.id]
              : user.helpers.map((h) => h.id),
          });
        } else {
          dispatch(editE({ id: foundEconomy.id, data: currentEconomy }));
          await editEconomy({
            identifier: activeGroup.active
              ? activeGroup.identifier
              : user.identifier,
            economy: currentEconomy,
            groups: activeGroup.active
              ? [activeGroup.id]
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
            const newHosted = reserve?.hosted.map((h) => {
              const hostedChange = hosted.find((hc) => hc.id === h.id);
              const found = !!hostedChange;
              const nh = found
                ? {
                    ...h,
                    checkOut: null,
                    payment: 0,
                  }
                : h;
              return nh;
            });
            newReservation.hosted = newHosted;
            newReservation.payment = newHosted.reduce(
              (a, b) =>
                a + b.payment === "business"
                  ? amount / reserve?.hosted.length
                  : b.payment,
              0
            );
            dispatch(editR({ ref: reserve.ref, data: newReservation }));

            const ids = hosted.filter((h) => h.owner).map((h) => h.owner);
            if (ids.length > 0) await deleteEconomy({ ids });

            await editReservation({
              identifier: activeGroup.active
                ? activeGroup.identifier
                : user.identifier,
              reservation: newReservation,
              groups: activeGroup.active
                ? [activeGroup.id]
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
          identifier: activeGroup.active
            ? activeGroup.identifier
            : user.identifier,
          economy: newEconomy,
          groups: activeGroup.active
            ? [activeGroup.id]
            : user.helpers.map((h) => h.id),
        });
      } else {
        const currentEconomy = { ...foundEconomy };
        currentEconomy.amount += client.payment;
        currentEconomy.payment += client.payment;
        currentEconomy.modificationDate = new Date().getTime();
        dispatch(editE({ id: foundEconomy.id, data: currentEconomy }));
        await editEconomy({
          identifier: activeGroup.active
            ? activeGroup.identifier
            : user.identifier,
          economy: currentEconomy,
          groups: activeGroup.active
            ? [activeGroup.id]
            : user.helpers.map((h) => h.id),
        });
      }
    }
  };

  const Table = ({ item }) => {
    const [informationModalVisible, setInformationModalVisible] =
      useState(false);

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
          <View
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
              },
            ]}
          >
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {`${item.email.slice(0, 15)}${
                item.email.length > 15 ? "..." : ""
              }`}
            </TextStyle>
          </View>
          <View
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
              },
            ]}
          >
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {!activeGroup.active || activeGroup.accessToReservations
                ? thousandsSystem(item.identification)
                : "PRIVADO"}
            </TextStyle>
          </View>
          <View
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
              },
            ]}
          >
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {item.phoneNumber}
            </TextStyle>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (activeGroup.active && !activeGroup.accessToReservations)
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
                      const newHosted = reserve?.hosted.map((i) => {
                        if (i.id === item.id) {
                          const newI = { ...i };
                          newI.checkIn = i.checkIn
                            ? null
                            : new Date().getTime();
                          newI.checkOut = null;
                          newI.payment = 0;
                          return newI;
                        }
                        return i;
                      });

                      const newReservation = { ...reserve };
                      newReservation.hosted = newHosted;
                      dispatch(
                        editR({ ref: reserve.ref, data: newReservation })
                      );
                      await editReservation({
                        identifier: activeGroup.active
                          ? activeGroup.identifier
                          : user.identifier,
                        reservation: newReservation,
                        groups: activeGroup.active
                          ? [activeGroup.id]
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
              if (activeGroup.active && activeGroup.accessToReservations)
                return;
              if (item.checkOut)
                removeCheckOut({ type: "unique", hosted: [item] });
              else validateCheckOut({ type: "unique", hosted: [item] });
            }}
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
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
          <View
            style={[
              styles.table,
              {
                borderColor: mode === "light" ? light.textDark : dark.textWhite,
              },
            ]}
          >
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {!activeGroup.active || activeGroup.accessToReservations
                ? !item.payment
                  ? "EN ESPERA"
                  : item.payment === "business"
                  ? "POR EMPRESA"
                  : thousandsSystem(item.payment)
                : "PRIVADO"}
            </TextStyle>
          </View>
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
                <TouchableOpacity
                  onPress={() =>
                    setInformationModalVisible(!informationModalVisible)
                  }
                >
                  <Ionicons
                    name="close"
                    size={34}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 20 }}>
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
                    {!activeGroup.active || activeGroup.accessToReservations
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
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Pagado:{" "}
                  <TextStyle color={light.main2}>
                    {!activeGroup.active || activeGroup.accessToReservations
                      ? !item.payment
                        ? "EN ESPERA"
                        : item.payment === "business"
                        ? "POR EMPRESA"
                        : thousandsSystem(item.payment)
                      : "PRIVADO"}
                  </TextStyle>
                </TextStyle>
              </View>
            </View>
          </View>
        </Modal>
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
          {(!activeGroup.active || activeGroup.accessToReservations) && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => print({ html })}>
                <Ionicons
                  name="print"
                  size={35}
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
                  size={35}
                  color={light.main2}
                  style={{ marginHorizontal: 5 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const date = new Date(reserve.start);
                  const day = date.getDate();
                  const month = date.getMonth() + 1;
                  const year = date.getFullYear();

                  navigation.navigate("CreateReserve", {
                    reserve,
                    ref: route.params.ref,
                    id: route.params.id,
                    day,
                    month,
                    year,
                    editing: true,
                  });
                }}
                style={{ marginHorizontal: 5 }}
              >
                <Ionicons name="create-outline" size={38} color={light.main2} />
              </TouchableOpacity>
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
                        CORREO
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
                      <TextStyle color={light.main2} smallParagraph>
                        CÉDULA
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
                      <TextStyle color={light.main2} smallParagraph>
                        TELÉFONO
                      </TextStyle>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (
                          activeGroup.active &&
                          !activeGroup.accessToReservations
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
                                const newHosted = reserve?.hosted.map((i) => {
                                  const newI = { ...i };
                                  newI.checkIn =
                                    quantity < 0 ? new Date().getTime() : null;
                                  newI.checkOut = null;
                                  newI.payment = 0;
                                  return newI;
                                });

                                const newReservation = { ...reserve };
                                newReservation.hosted = newHosted;
                                dispatch(
                                  editR({
                                    ref: reserve.ref,
                                    data: newReservation,
                                  })
                                );
                                await editReservation({
                                  identifier: activeGroup.active
                                    ? activeGroup.identifier
                                    : user.identifier,
                                  reservation: newReservation,
                                  groups: activeGroup.active
                                    ? [activeGroup.id]
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
                          activeGroup.active &&
                          !activeGroup.accessToReservations
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
                        },
                      ]}
                    >
                      <TextStyle color={light.main2} smallParagraph>
                        CHECK OUT
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
                      <TextStyle color={light.main2} smallParagraph>
                        PAGADO
                      </TextStyle>
                    </View>
                  </View>
                  {reserve?.hosted.map((item) => (
                    <Table item={item} key={item.id} />
                  ))}
                </View>
              </ScrollView>
              {reserve?.hosted.some((h) => !h.checkOut) &&
                (!activeGroup.active || activeGroup.accessToReservations) && (
                  <ButtonStyle
                    onPress={() => {
                      validateCheckOut({
                        type: "general",
                        hosted: reserve.hosted.filter((r) => !r.checkOut),
                      });
                    }}
                    style={{ marginBottom: 20 }}
                    backgroundColor={light.main2}
                  >
                    <TextStyle center>CHECK OUT general</TextStyle>
                  </ButtonStyle>
                )}
            </View>
          )}
          <View>
            {(!activeGroup.active || activeGroup.accessToReservations) &&
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
            {(!activeGroup.active || activeGroup.accessToReservations) && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Costo de alojamiento:{" "}
                <TextStyle color={light.main2}>
                  {reserve?.amount ? thousandsSystem(amount) : "0"}
                </TextStyle>
              </TextStyle>
            )}
            {(!activeGroup.active || activeGroup.accessToReservations) && (
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
            {(!activeGroup.active || activeGroup.accessToReservations) && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Dinero pagado:{" "}
                <TextStyle color={light.main2}>
                  {reserve?.hosted ? thousandsSystem(totalPayment) : "0"}
                </TextStyle>
              </TextStyle>
            )}
            {(!activeGroup.active || activeGroup.accessToReservations) && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Tipo de alojamiento:{" "}
                <TextStyle color={light.main2}>
                  {reserve?.valueType === "standard"
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
                {changeDate(new Date(reserve?.start))}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Fecha de finalización:{" "}
              <TextStyle color={light.main2}>
                {changeDate(new Date(reserve?.end))}
              </TextStyle>
            </TextStyle>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ButtonStyle
            style={{ width: width / 1.32 }}
            backgroundColor={
              !OF ? light.main2 : mode === "light" ? dark.main2 : light.main4
            }
            onPress={() => {
              const group = groupState.find((g) => g.ref === nomenclature.ref);
              navigation.navigate("CreateOrder", {
                editing: OF ? true : false,
                id: OF ? OF.id : undefined,
                ref: route.params.ref,
                table: nomenclature.nomenclature,
                selection: OF ? OF.selection : [],
                reservation: reserve?.owner ? "Cliente" : group.name,
              });
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TextStyle
                color={
                  !OF
                    ? dark.textWhite
                    : mode === "light"
                    ? dark.textWhite
                    : light.textDark
                }
                customStyle={{ fontSize: width / 19 }}
              >
                Menu
              </TextStyle>
              <Ionicons
                name="book-outline"
                size={21}
                style={{ marginLeft: 10 }}
                color={
                  !OF
                    ? dark.textWhite
                    : mode === "light"
                    ? dark.textWhite
                    : light.textDark
                }
              />
            </View>
          </ButtonStyle>
          <Ionicons
            name={OF ? "receipt-outline" : "checkbox"}
            size={50}
            color={
              !OF ? light.main2 : mode === "light" ? dark.main2 : light.main4
            }
          />
        </View>
        {(!activeGroup.active || activeGroup.accessToReservations) && (
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
                        dispatch(removeR({ ref: route.params.ref }));
                        navigation.pop();
                        await removeReservation({
                          identifier: activeGroup.active
                            ? activeGroup.identifier
                            : user.identifier,
                          ref: route.params.ref,
                          groups: activeGroup.active
                            ? [activeGroup.id]
                            : user.helpers.map((h) => h.id),
                        });
                        await helperNotification(
                          activeGroup,
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
                    size={34}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                </TouchableOpacity>
              </View>
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Añade el pago total de huésped (por defecto, se divide el dinero
                por la cantidad de huéspedes)
              </TextStyle>
            </View>
            <View>
              <FlatList
                data={hosted}
                keyExtractor={(h) => h.id}
                renderItem={({ item }) => (
                  <Hosted
                    item={item}
                    amount={amount}
                    hostedChangeRef={hostedChangeRef}
                    setTotalToPay={setTotalToPay}
                    editable={!businessPayment}
                    reserve={reserve}
                  />
                )}
                style={{ maxHeight: 200, marginVertical: 10 }}
              />
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
                        ? Math.floor(amount / reserve?.hosted.length) *
                            hosted.length
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
                    const newHosted = reserve?.hosted.map((h) => {
                      const hostedChange = hostedChangeRef.current.find(
                        (hc) => hc.id === h.id
                      );
                      const found = !!hostedChange;
                      const nh = found
                        ? {
                            ...h,
                            checkOut: new Date().getTime(),
                            checkIn: new Date().getTime(),
                            payment: businessPayment
                              ? "business"
                              : hostedChange.payment,
                          }
                        : h;
                      return nh;
                    });
                    newReservation.hosted = newHosted;
                    newReservation.payment = businessPayment
                      ? (amount / reserve?.hosted.length) * hosted.length
                      : newHosted.reduce((a, b) => a + b.payment, 0);
                    dispatch(editR({ ref: reserve.ref, data: newReservation }));
                    const ids = hostedChangeRef.current
                      .filter((h) => h.owner)
                      .map((h) => h.owner);

                    cleanData();

                    if (ids.length > 0)
                      await manageEconomy({ ids, hosted: newHosted });

                    await editReservation({
                      identifier: activeGroup.active
                        ? activeGroup.identifier
                        : user.identifier,
                      reservation: newReservation,
                      groups: activeGroup.active
                        ? [activeGroup.id]
                        : user.helpers.map((h) => h.id),
                    });
                  };

                  const leftover = amount - totalPayment;

                  if (
                    isAlertActive &&
                    (leftover > totalToPay || leftover < totalToPay)
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

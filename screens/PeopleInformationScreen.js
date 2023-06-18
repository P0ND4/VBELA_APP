import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import TextStyle from "../components/TextStyle";
import ButtonStyle from "../components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "../components/Layout";
import {
  removeByEvent,
  removeMany,
  remove,
} from "../features/function/economySlice";
import { removeManyByOwner as removeMBOR } from "../features/groups/reservationsSlice";
import { removeManyByOwner as removeMBOO } from "../features/tables/ordersSlice";
import { removeEconomy, editUser, removeManyEconomy } from "../api";
import { changeDate, random, thousandsSystem } from "../helpers/libs";
import helperNotification from "../helpers/helperNotification";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

import theme from "../theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const PeopleInformation = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const economy = useSelector((state) => state.economy);
  const activeGroup = useSelector((state) => state.activeGroup);
  const reservations = useSelector((state) => state.reservations);
  const orders = useSelector((state) => state.orders);
  const user = useSelector((state) => state.user);
  const people = useSelector((state) => state.people);

  const [registers, setRegisters] = useState([]);
  const [textSupplier, setTextSupplier] = useState("");
  const [textCustomer, setTextCustomer] = useState("");

  const userType = route?.params?.userType;
  const type = route?.params?.type;
  const ref = route?.params?.ref;
  const dispatch = useDispatch();

  const findCustomer = (filter) => {
    setRegisters(
      [
        ...filter.map((e) => {
          const eco = { ...e };
          const details = [];
          const reser = reservations.filter((r) => r.owner === e.ref);
          const reservationsSorted = reser.map((r) => {
            const day = new Date(r.creationDate).getDate();
            const month = new Date(r.creationDate).getMonth() + 1;

            return {
              quantity: r.people,
              date: `${("0" + day).slice(-2)}-${("0" + month).slice(-2)}`,
              total: r.discount ? r.amountWithDiscount : r.amount,
              type: "reservations",
            };
          });

          const ord = orders.filter((o) => o.ref === e.ref);
          const ordersSorted = ord.map((o) => {
            const day = new Date(o.creationDate).getDate();
            const month = new Date(o.creationDate).getMonth() + 1;
            return {
              quantity: o.selection.reduce((a, b) => a + b.count, 0),
              date: `${("0" + day).slice(-2)}-${("0" + month).slice(-2)}`,
              total: o.selection.reduce((a, b) => a + b.total, 0),
              type: "orders",
            };
          });

          const union = reservationsSorted.concat(ordersSorted);

          for (let item of union) {
            const found = details.findIndex((d) => d.date === item.date);

            if (found === -1) {
              const data = {
                date: item.date,
                [item.type]: {
                  quantity: item.quantity,
                  total: item.total,
                },
              };
              details.push(data);
            } else {
              const type = details[found][item.type];
              details[found] = {
                ...details[found],
                [item.type]: {
                  quantity: type
                    ? type.quantity + item.quantity
                    : item.quantity,
                  total: type ? type.total + item.total : item.total,
                },
              };
            }
          }
          const sorted = details.sort((a, b) => a.date > b.date);
          eco.details = sorted;
          eco.people = reser.reduce((a, b) => a + parseInt(b.people), 0);
          eco.orders = details.reduce((a, b) => a + b.orders?.total, 0);
          eco.reservations = details.reduce(
            (a, b) => (a + b.reservations ? b.reservations?.total : 0),
            0
          );
          eco.ordersFinished = ord.length;

          return eco;
        }),
      ].reverse()
    );
  };

  useEffect(() => {
    if (type === "general") {
      if (userType === "supplier")
        setRegisters([...economy.filter((e) => e.type !== "debt")].reverse());
      if (userType === "customer") {
        const filter = economy.filter((e) => e.type === "debt");
        findCustomer(filter);
      }
    }
    if (type === "person") {
      if (userType === "supplier")
        setRegisters([...economy.filter((e) => e.ref === ref)].reverse());
      if (userType === "customer") {
        const filter = economy.filter((e) => e.ref === ref);
        findCustomer(filter);
      }
    }
  }, [economy, type]);

  const customerDataRemove = async (economy) => {
    const person = people.find((p) => p.id === economy.ref);
    dispatch(removeMBOR({ owner: person.id }));
    dispatch(removeMBOO({ ref: person.id }));
    await editUser({
      email: activeGroup.active ? activeGroup.email : user.email,
      change: {
        reservations: reservations.filter((r) => r.owner !== person.id),
        orders: orders.filter((o) => o.ref !== person.id),
      },
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const Register = ({ item }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(true);
    const [openDatails, setOpenDatails] = useState(false);

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
                    {thousandsSystem(item.orders?.total)}
                  </TextStyle>
                )}
                {item.reservations && (
                  <TextStyle
                    verySmall
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {thousandsSystem(item.reservations?.total)}
                  </TextStyle>
                )}
              </View>
            </View>
          ))}
        </View>
      );
    };

    const deleteEconomy = (economy) => {
      Keyboard.dismiss();
      Alert.alert(
        `¿Estás seguro que quieres eliminar ${
          economy.type === "expense"
            ? "el gasto"
            : economy.type === "purchase"
            ? "la compra"
            : "la deuda"
        }?`,
        economy.type === "debt"
          ? "Se eliminaran todos los datos hechos por este cliente. No podrá recuperar esta información una vez borrada"
          : "No podrá recuperar esta información una vez borrada",
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Si",
            onPress: async () => {
              dispatch(remove({ id: economy.id }));
              if (economy.type === "debt") customerDataRemove(economy);
              await removeEconomy({
                email: activeGroup.active ? activeGroup.email : user.email,
                id: economy.id,
                groups: activeGroup.active
                  ? [activeGroup.id]
                  : user.helpers.map((h) => h.id),
              });
              await helperNotification(
                activeGroup,
                user,
                economy.type === "expense"
                  ? "Gasto eliminado"
                  : "Compra eliminada",
                `${
                  economy.type === "expense"
                    ? "Un gasto ha sido eliminado"
                    : "Una compra ha sido eliminada"
                } por ${user.email}`,
                economy.type === "debt" ? 'accessToCustomer' : "accessToSupplier"
              );
            },
          },
        ],
        { cancelable: true }
      );
    };

    const Mode = () => {
      return (
        <View style={{ width: "100%" }}>
          {item.type !== "debt" && (
            <TextStyle color={light.main2}>
              {item?.name?.toUpperCase()}
            </TextStyle>
          )}
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Creación:{" "}
            <TextStyle color={light.main2}>
              {changeDate(new Date(item?.creationDate))}
            </TextStyle>
          </TextStyle>
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Modificación:{" "}
            <TextStyle color={light.main2}>
              {changeDate(new Date(item?.modificationDate))}
            </TextStyle>
          </TextStyle>
          {item.type === "debt" && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Comida:{" "}
              <TextStyle color={light.main2}>
                {thousandsSystem(item.orders)}
              </TextStyle>
            </TextStyle>
          )}
          {item.type === "debt" && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Alojamiento:{" "}
              <TextStyle color={light.main2}>
                {thousandsSystem(item.reservations)}
              </TextStyle>
            </TextStyle>
          )}
          {item.type === "debt" && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Personas alojadas:{" "}
              <TextStyle color={light.main2}>
                {thousandsSystem(item.people)}
              </TextStyle>
            </TextStyle>
          )}
          {item.type === "debt" && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Pedidos realizados:{" "}
              <TextStyle color={light.main2}>
                {thousandsSystem(item.ordersFinished)}
              </TextStyle>
            </TextStyle>
          )}
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Total:{" "}
            <TextStyle color={light.main2}>
              {thousandsSystem(item.amount)}
            </TextStyle>
          </TextStyle>
          {item.amount !== item.payment && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Deuda:{" "}
              <TextStyle color={light.main2}>
                {thousandsSystem(item.amount - item.payment)}
              </TextStyle>
            </TextStyle>
          )}
          {item.amount !== item.payment && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Pagado:{" "}
              <TextStyle color={light.main2}>
                {thousandsSystem(item.payment)}
              </TextStyle>
            </TextStyle>
          )}
          <View>
            {openDatails && <Details />}
            {item?.details?.length > 0 && (
              <ButtonStyle
                style={{ marginVertical: 10 }}
                backgroundColor={mode === "light" ? dark.main2 : light.main5}
                onPress={() => setOpenDatails(!openDatails)}
              >
                <TextStyle
                  paragrahp
                  color={mode === "light" ? dark.textWhite : light.textDark}
                >
                  {openDatails ? "CERRAR DETALLES" : "MOSTRAR DETALLES"}
                </TextStyle>
              </ButtonStyle>
            )}
          </View>
        </View>
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
              ? item.owner
                ? item.owner?.name?.slice(0, 15) +
                  `${item.owner.name?.length >= 15 ? "..." : ""}`
                : "DESCONOCIDO"
              : item.owner
              ? thousandsSystem(item.owner?.identification)
              : "DESCONOCIDO"}
          </TextStyle>
          <View style={styles.events}>
            <TouchableOpacity
              onPress={() => setName(!name)}
              style={{ marginHorizontal: 3 }}
            >
              <Ionicons
                name="git-compare"
                size={26}
                color={mode === "light" ? dark.main2 : light.main5}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginHorizontal: 3 }}
              onPress={() => deleteEconomy(item)}
            >
              <Ionicons
                name="trash"
                size={26}
                color={mode === "light" ? dark.main2 : light.main5}
              />
            </TouchableOpacity>
            {item.type !== "debt" && (
              <TouchableOpacity
                style={{ marginHorizontal: 3 }}
                onPress={() => {
                  navigation.push("CreateEconomy", {
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
            <TextStyle color={light.main2} bigParagraph>
              {changeDate(new Date(item.modificationDate))}
            </TextStyle>
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

  const removeEverything = () => {
    Keyboard.dismiss();
    Alert.alert(
      `¿Estás seguro que quieres eliminar todo el registro?`,
      "No podrá recuperar la información una vez borrada",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            if (type === "general") {
              if (userType === "supplier")
                dispatch(removeByEvent({ event: (e) => e.type !== "debt" }));
              else dispatch(removeByEvent({ event: (e) => e.type === "debt" }));
              await editUser({
                email: activeGroup.active ? activeGroup.email : user.email,
                change: {
                  economy:
                    userType === "supplier"
                      ? economy.filter((e) => e.type !== "debt")
                      : economy.filter((e) => e.type === "debt"),
                },
                groups: activeGroup.active
                  ? [activeGroup.id]
                  : user.helpers.map((h) => h.id),
              });
            }

            if (type === "person") {
              dispatch(removeMany({ ref }));
              if (userType === "customer") customerDataRemove(economy);
              await removeManyEconomy({
                email: activeGroup.active ? activeGroup.email : user.email,
                ref,
                groups: activeGroup.active
                  ? [activeGroup.id]
                  : user.helpers.map((h) => h.id),
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    setTextSupplier("");
    const text = registers.reduce((a, item) => {
      return (
        a +
        `<table style="width: 100%; border: 1px solid #444444; padding: 8px; border-radius: 8px; margin: 20px 0;">
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${
              item.owner?.name
            }</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${item.owner?.identification}
            </p>
          </td>
        </tr>
        <tr/>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${item.name.toUpperCase()}</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Creación</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${changeDate(new Date(item.creationDate))}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Modificación</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${changeDate(new Date(item.modificationDate))}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Total</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.amount)}
            </p>
          </td>
        </tr>
        <tr/>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${
              item.amount !== item.payment ? "PENDIENTE" : "PAGADO"
            }</p>
          </td>
        </tr>
      </table>`
      );
    }, "");
    setTextSupplier(text);
  }, [registers]);

  useEffect(() => {
    setTextCustomer("");
    const text = registers.reduce((a, item) => {
      return (
        a +
        `<table style="width: 100%; border: 1px solid #444444; padding: 8px; border-radius: 8px; margin: 20px 0;">
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${
              item.owner?.name
            }</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${item.owner?.identification}
            </p>
          </td>
        </tr>
        <tr/>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${item.name.toUpperCase()}</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Creación</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${changeDate(new Date(item.creationDate))}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Modificación</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${changeDate(new Date(item.modificationDate))}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Comida</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.orders)}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Alojamiento</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.reservations)}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Personas alojadas</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.people)}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Pedidos realizados</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.ordersFinished)}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Total</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.amount)}
            </p>
          </td>
        </tr>
        <tr/>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${
              item.amount !== item.payment ? "PENDIENTE" : "PAGADO"
            }</p>
          </td>
        </tr>
      </table>`
      );
    }, "");
    setTextCustomer(text);
  }, [registers]);

  const htmlSupplier = `
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
    <h2 style="text-align: center; color: #444444; font-size: 50px; font-weight: 800;">
      DETALLES
    </h2>
    <p style="text-align: center; color: #444444; font-size: 25px; font-weight: 800;">
      ${type === "general" ? "GENERAL" : "ESPECÍFICO"}
    </p>
    <view>
      ${textSupplier}
    </view>
    <p style="text-align: center; font-weight: 600; margin-top: 20px; font-size: 25px; font-weight: 600;">Total:
      ${thousandsSystem(registers.reduce((a, b) => (a += b.amount), 0))}</p>
    <p style="text-align: center; font-size: 25px; font-weight: 600;">${changeDate(
      new Date()
    )} ${new Date().getHours()}:${new Date().getMinutes()}</p>
  </view>
</body>

</html>
`;

  const htmlCustomer = `
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
  <h2 style="text-align: center; color: #444444; font-size: 50px; font-weight: 800;">
    DETALLES
  </h2>
  <p style="text-align: center; color: #444444; font-size: 25px; font-weight: 800;">
    ${type === "general" ? "GENERAL" : "ESPECÍFICO"}
  </p>
  <view>
    ${textCustomer}
  </view>
  <p style="text-align: center; font-weight: 600; margin-top: 20px; font-size: 25px; font-weight: 600;">Total:
    ${thousandsSystem(registers.reduce((a, b) => (a += b.amount), 0))}</p>
  <p style="text-align: center; font-size: 25px; font-weight: 600;">${changeDate(
    new Date()
  )} ${new Date().getHours()}:${new Date().getMinutes()}</p>
</view>
</body>

</html>
`;

  const generatePDF = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        // VAMOS A SUPUESTAMENTE A IMPRIMIR PARA CONSEGUIR EL PDF
        html: userType === "supplier" ? htmlSupplier : htmlCustomer, // HTML A UTILIZAR
        width: 340, // TAMANO DEL PDF (WIDTH)
        height: 520, // TAMANO DEL PDF (HEIGHT)
        base64: true, // USAREMOVE BASE64
      });

      const code = random(6, { number: true });

      if (Platform.OS === "ios") {
        await Sharing.shareAsync(uri);
      } else {
        const base64 = FileSystem.EncodingType.Base64; // CODIFICAMOS A BASE 64
        const storageAccess = FileSystem.StorageAccessFramework; // COLOCAMOS EL ACCESO AL ALMACENAMIENTO

        const fileString = await FileSystem.readAsStringAsync(uri, {
          // LEEMOS EL PDF
          encoding: base64, // USAMOS EL CODIFICADOR DE BASE64
        });

        const permissions =
          await storageAccess.requestDirectoryPermissionsAsync(); // PEDIMOS PERMISO PARA ACCEDER A SUS ARCHIVOS

        if (!permissions.granted) return; // SI NO NOS DA PERMISO RETORNAMOS

        await storageAccess
          .createFileAsync(permissions.directoryUri, code, "application/pdf") // CREAMOS EL ARCHIVO DONDE EL USUARIO NOS DIO ACCESO A LA CARPETA
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, fileString, {
              // AGARRAMOS LA URI OBTENIDA Y ESCRIBIMOS EL ARCHIVO ANTES LEIDO
              encoding: base64, // CODIFICAMOS A BAse 64
            });
            alert("PDF Guardado satisfactoriamente"); // AVISAMOS QUE SE GUARDO EL ARCHIVO
          })
          .catch((e) => console.log(e.message));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const print = async () => {
    const { uri } = await Print.printToFileAsync({
      html: userType === "supplier" ? htmlSupplier : htmlCustomer,
      width: 400,
      height: 520,
      base64: true,
    });
    await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      <View style={[styles.row, { marginBottom: 20 }]}>
        <TextStyle
          subtitle
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          {type === "general" ? "General" : "Específico"}
        </TextStyle>
        <View style={styles.events}>
          {registers.length > 0 && (
            <TouchableOpacity onPress={() => removeEverything()}>
              <Ionicons
                name="trash"
                size={35}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {registers.length > 0 && (
            <TouchableOpacity onPress={() => print()}>
              <Ionicons
                name="print"
                size={35}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {registers.length > 0 && (
            <TouchableOpacity onPress={() => generatePDF()}>
              <Ionicons
                name="document-attach"
                size={35}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {/*registers.length > 0 && (
            <TouchableOpacity>
              <Ionicons
                name="filter"
                size={35}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )*/}
        </View>
      </View>
      <View>
        {registers.length === 0 ? (
          <TextStyle color={light.main2} center smallSubtitle>
            No hay datos
          </TextStyle>
        ) : (
          <ScrollView
            style={{ maxHeight: SCREEN_HEIGHT / 1.3 }}
            showsVerticalScrollIndicator={false}
          >
            {registers.map((item) => (
              <Register key={item.id} item={item} />
            ))}
          </ScrollView>
        )}
      </View>
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
});

export default PeopleInformation;

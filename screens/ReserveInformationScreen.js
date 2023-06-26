import { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  changeDate,
  months,
  thousandsSystem,
  print,
  generatePDF,
  random,
} from "../helpers/libs";
import { remove } from "../features/groups/reservationsSlice";
import { removeReservation } from "../api";
import helperNotification from "../helpers/helperNotification";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "../components/Layout";
import TextStyle from "../components/TextStyle";
import ButtonStyle from "../components/ButtonStyle";
import theme from "../theme";

const dark = theme.colors.dark;
const light = theme.colors.light;

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const StatisticScreen = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const reserve = useSelector((state) =>
    state.reservations.find((r) => r.ref === route.params.ref)
  );
  const nomenclature = useSelector((state) =>
    state.nomenclatures.find((n) => n.id === route.params.id)
  );
  const group = useSelector((state) =>
    state.groups.find((g) => g.ref === nomenclature.ref)
  );

  const activeGroup = useSelector((state) => state.activeGroup);
  const user = useSelector((state) => state.user);
  const orders = useSelector((state) => state.orders);

  const OF = orders.find((o) => o.ref === route.params.ref && o.pay === false);

  useEffect(() => {
    navigation.setOptions({ title: reserve?.fullName });
  }, [reserve]);

  const dispatch = useDispatch();

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
      ${reserve?.fullName ? reserve?.fullName : ""}
      </p>
    </view>
    <view>
      <table style="width: 100%; margin-top: 30px;">
        ${
          reserve?.email
            ? `<tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Correo</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${reserve?.email}
          </p>
        </td>
      </tr>`
            : ""
        }
        ${
          reserve?.phoneNumber
            ? `<tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Teléfono</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${reserve?.phoneNumber}
          </p>
        </td>
      </tr>`
            : ""
        }
        ${
          reserve?.identification
            ? `<tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Cédula</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${reserve?.identification}
          </p>
        </td>
      </tr>`
            : ""
        }
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Alojados</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${reserve?.people}
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
          
      <p style="text-align: center; font-size: 30px; font-weight: 600; margin-top: 30px;">Total: ${
        reserve?.amount
          ? reserve.discount
            ? thousandsSystem(reserve?.amount - reserve?.discount)
            : thousandsSystem(reserve?.amount)
          : "0"
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

  return (
    <Layout style={{ padding: 0, marginTop: 0 }}>
      <View style={{ padding: 30 }}>
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
                    const month = months[date.getMonth()];
                    const year = date.getFullYear();

                    navigation.push("CreateReserve", {
                      name: nomenclature.name
                        ? nomenclature.name
                        : nomenclature.nomenclature,
                      capability: nomenclature.capability,
                      ref: route.params.ref,
                      id: route.params.id,
                      day,
                      days: route.params.days,
                      month,
                      year,
                      editing: true,
                    });
                  }}
                  style={{ marginHorizontal: 5 }}
                >
                  <Ionicons
                    name="create-outline"
                    size={38}
                    color={light.main2}
                  />
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
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Nombre completo:{" "}
              <TextStyle color={light.main2}>{reserve?.fullName}</TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Correo electrónico:{" "}
              <TextStyle color={light.main2}>{reserve?.email}</TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Número de teléfono:{" "}
              <TextStyle color={light.main2}>{reserve?.phoneNumber}</TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Cédula:{" "}
              <TextStyle color={light.main2}>
                {reserve?.identification
                  ? thousandsSystem(reserve?.identification)
                  : ""}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Dinero pagado:{" "}
              <TextStyle color={light.main2}>
                {reserve?.amount
                  ? reserve.discount
                    ? thousandsSystem(reserve?.amount - reserve?.discount)
                    : thousandsSystem(reserve?.amount)
                  : "0"}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Personas alojadas:{" "}
              <TextStyle color={light.main2}>
                {reserve?.people ? thousandsSystem(reserve?.people) : "0"}
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
            {reserve?.discount && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Descuento:{" "}
                <TextStyle color={light.main2}>
                  {thousandsSystem(reserve?.discount)}
                </TextStyle>
              </TextStyle>
            )}
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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ButtonStyle
              style={{ width: width / 1.4 }}
              backgroundColor={
                !OF ? light.main2 : mode === "light" ? dark.main2 : light.main4
              }
              onPress={() => {
                navigation.push("CreateOrder", {
                  editing: OF ? true : false,
                  id: OF ? OF.id : undefined,
                  ref: reserve?.owner ? reserve.owner : route.params.ref,
                  table: nomenclature.nomenclature,
                  selection: OF ? OF.selection : [],
                  reservation: reserve?.owner ? "Cliente" : group.name,
                });
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                        dispatch(remove({ ref: route.params.ref }));
                        navigation.pop();
                        await removeReservation({
                          email: activeGroup.active
                            ? activeGroup.email
                            : user.email,
                          ref: route.params.ref,
                          groups: activeGroup.active
                            ? [activeGroup.id]
                            : user.helpers.map((h) => h.id),
                        });
                        await helperNotification(
                          activeGroup,
                          user,
                          "Reservación eliminada",
                          `Una reservación ha sido eliminada por ${user.email}`,
                          "accessToReservations"
                        );
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              Eliminar reservación
            </ButtonStyle>
          )}
        </ScrollView>
      </View>
    </Layout>
  );
};

export default StatisticScreen;

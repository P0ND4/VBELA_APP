import { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { changeDate, months, thousandsSystem } from "../helpers/libs";
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
  const group = useSelector(state => state.groups.find(g => g.ref === nomenclature.ref));

  const activeGroup = useSelector((state) => state.activeGroup);
  const user = useSelector((state) => state.user);
  const orders = useSelector((state) => state.orders);

  const OF = orders.find((o) => o.ref === route.params.ref && o.pay === false);

  useEffect(() => {
    navigation.setOptions({ title: reserve?.fullName });
  }, [reserve]);

  const dispatch = useDispatch();

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
            >
              <Ionicons name="create-outline" size={38} color={light.main2} />
            </TouchableOpacity>
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
                {reserve?.amount ? thousandsSystem(reserve?.amount) : "0"}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Personas reservadas:{" "}
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
                <TextStyle color={light.main2}>{reserve?.discount}%</TextStyle>
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
                  reservation: reserve?.owner ? "Cliente" : group.name
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
                        'accessToReservations'
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
        </ScrollView>
      </View>
    </Layout>
  );
};

export default StatisticScreen;

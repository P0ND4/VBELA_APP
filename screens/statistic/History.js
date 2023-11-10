import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFontSize, changeDate, thousandsSystem } from "@helpers/libs";
import { remove as removeS } from "@features/sales/salesSlice";
import { remove as removeO } from "@features/tables/ordersSlice";
import { removeOrder, removeSale } from "@api";
import TextStyle from "@components/TextStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "@components/Layout";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const History = ({ route }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);
  const [data, setData] = useState(route.params.item);

  const type = route.params.type;

  const dispatch = useDispatch();

  const Observation = ({ item }) => {
    const [open, isOpen] = useState(false);

    return (
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            <TextStyle color={light.main2} paragrahp>
              {thousandsSystem(item.count)}
            </TextStyle>
            x {item.name}
          </TextStyle>
          <TouchableOpacity onPress={() => isOpen(!open)}>
            <Ionicons
              color={light.main2}
              name={open ? "eye-off" : "eye"}
              size={getFontSize(18)}
            />
          </TouchableOpacity>
        </View>
        {open && (
          <View style={{ marginLeft: 8 }}>
            {item.identifier && (
              <TextStyle
                verySmall
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                <TextStyle color={light.main2} verySmall>
                  Identificador:
                </TextStyle>{" "}
                {item?.identifier}
              </TextStyle>
            )}
            <TextStyle
              verySmall
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              <TextStyle color={light.main2} verySmall>
                Unidad:
              </TextStyle>{" "}
              {item?.unit}
            </TextStyle>
            {item?.discount !== 0 && (
              <TextStyle
                verySmall
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                <TextStyle color={light.main2} verySmall>
                  Descuento:
                </TextStyle>{" "}
                {thousandsSystem(item?.discount)}
              </TextStyle>
            )}
            {item?.value && (
              <TextStyle
                verySmall
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                <TextStyle color={light.main2} verySmall>
                  Precio:
                </TextStyle>{" "}
                {thousandsSystem(item?.value)}
              </TextStyle>
            )}
            <TextStyle
              verySmall
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              <TextStyle color={light.main2} verySmall>
                Total:
              </TextStyle>{" "}
              {thousandsSystem(
                item.discount !== 0 ? item?.total - item?.discount : item?.total
              )}
            </TextStyle>
            {item?.observation && (
              <TextStyle verySmall color={light.main2}>
                {item?.observation}
              </TextStyle>
            )}
          </View>
        )}
      </View>
    );
  };

  const deleteSale = ({ item }) => {
    Alert.alert(
      `¿Estás seguro que quieres eliminar la venta?`,
      "No podrá recuperar esta información una vez borrada",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            setData(data.filter((d) => d.id !== item.id));
            dispatch(
              type === "menu"
                ? removeO({ id: item.id })
                : removeS({ id: item.id })
            );
            if (type === "menu") {
              await removeOrder({
                identifier: helperStatus.active
                  ? helperStatus.identifier
                  : user.identifier,
                id: item.id,
                helpers: helperStatus.active
                  ? [helperStatus.id]
                  : user.helpers.map((h) => h.id),
              });
            }

            if (type === "sales") {
              await removeSale({
                identifier: helperStatus.active
                  ? helperStatus.identifier
                  : user.identifier,
                id: item.id,
                helpers: helperStatus.active
                  ? [helperStatus.id]
                  : user.helpers.map((h) => h.id),
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  const Menu = ({ item }) => {
    const date = new Date(item.creationDate);

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            {changeDate(date)} {date.getHours()}:{date.getMinutes()}:
            {date.getSeconds()}
          </TextStyle>
          <TouchableOpacity onPress={() => deleteSale({ item })}>
            <Ionicons name="trash" color={light.main2} size={getFontSize(18)} />
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 6 }}>
          {item.selection.map((item) => (
            <Observation item={item} />
          ))}
        </View>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Método de pago:{" "}
          <TextStyle color={light.main2}>{item?.method}</TextStyle>
        </TextStyle>
        {item?.discount && (
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Descuento:{" "}
            <TextStyle color={light.main2}>
              {thousandsSystem(item?.discount)}
            </TextStyle>
          </TextStyle>
        )}
        {item?.tax && (
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Impuestos:{" "}
            <TextStyle color={light.main2}>
              {thousandsSystem(item?.tax)}
            </TextStyle>
          </TextStyle>
        )}
        {item?.tip && (
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Propina:{" "}
            <TextStyle color={light.main2}>
              {thousandsSystem(item?.tip)}
            </TextStyle>
          </TextStyle>
        )}
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Pagado:{" "}
          <TextStyle color={light.main2}>
            {item?.pay ? "Si" : "Pendiente"}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Total:{" "}
          <TextStyle color={light.main2}>
            {thousandsSystem(item?.total)}
          </TextStyle>
        </TextStyle>
      </View>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      <View style={[styles.row, { marginBottom: 20 }]}>
        <TextStyle
          subtitle
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          ({data.length}) VENTAS
        </TextStyle>
        <View style={styles.events}>
          {/*data.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                print({
                  html: type === "entry" ? htmlEntry : htmlOutput,
                })
              }
            >
              <Ionicons
                name="print"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
            )*/}
          {/*data.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                generatePDF({
                  html: type === "entry" ? htmlEntry : htmlOutput,
                  code: "PDF VBELA",
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
            )*/}
          {/*data.length > 0 && (
            <TouchableOpacity>
              <Ionicons
                name="filter"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )*/}
        </View>
      </View>
      {
        <View>
          {data.length === 0 && (
            <TextStyle color={light.main2} center smallSubtitle>
              No hay ventas
            </TextStyle>
          )}
          {data.length > 0 && (
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: SCREEN_HEIGHT / 1.3 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <Menu item={item} />}
            />
          )}
        </View>
      }
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  events: {
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: light.main2,
  },
});

export default History;

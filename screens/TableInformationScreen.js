import { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { thousandsSystem } from "../helpers/libs";
import { remove } from "../features/tables/informationSlice";
import { removeTable } from "../api";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "../components/Layout";
import TextStyle from "../components/TextStyle";
import ButtonStyle from "../components/ButtonStyle";
import theme from "../theme";
import { removeMany } from "../features/tables/ordersSlice";

const dark = theme.colors.dark;
const light = theme.colors.light;

const height = Dimensions.get("window").height;

const TableInformation = ({ route, navigation }) => {
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const activeGroup = useSelector((state) => state.activeGroup);
  const table = useSelector((state) =>
    state.tables.find((table) => table.id === route.params.id)
  );

  const ors = useSelector((state) => state.orders);

  const [orders, setOrders] = useState([]);
  const [totalMoney, setTotalMoney] = useState(0);
  const [totalMoneyDrinks, setTotalMoneyDrinks] = useState(0);
  const [totalMoneyFood, setTotalMoneyFood] = useState(0);

  useEffect(() => {
    let orders = [];
    let amount = 0;
    let drinks = 0;
    let food = 0;

    const ordersFilter = ors.filter(
      (o) => o.ref === route.params.id && o.pay === false
    );

    for (let order of ordersFilter) {
      orders.push(order);
      amount += order.amount * order.gave;
      if (order.product === "drink") drinks += order.amount * order.gave;
      if (order.product === "food") food += order.amount * order.gave;
    }

    setOrders(orders);
    setTotalMoneyDrinks(thousandsSystem(drinks));
    setTotalMoneyFood(thousandsSystem(food));
    setTotalMoney(thousandsSystem(amount));
  }, [ors]);

  useEffect(() => {
    navigation.setOptions({ title: table?.name ? table?.name : table?.table });
  }, [table]);

  const dispatch = useDispatch();

  const changeDate = (date) => {
    return `${("0" + date.getDate()).slice(-2)}/${(
      "0" +
      (date.getMonth() + 1)
    ).slice(-2)}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  return (
    <Layout
      style={{
        marginTop: 0,
        justifyContent: "center",
        alignItem: "center",
        padding: 30,
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
          Mesa{" "}
          <TextStyle color={light.main2} smallTitle>
            {table?.table}
          </TextStyle>
        </TextStyle>
        <TouchableOpacity
          onPress={() =>
            navigation.push("CreateTable", { item: table, editing: true })
          }
        >
          <Ionicons name="create-outline" size={38} color={light.main2} />
        </TouchableOpacity>
      </View>
      {table?.description && (
        <View style={{ marginTop: 14 }}>
          {table?.description && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {table?.description}
            </TextStyle>
          )}
        </View>
      )}
      <View style={{ marginVertical: 30 }}>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Deuda total: <TextStyle color={light.main2}>{totalMoney}</TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Dinero en bebidas:{" "}
          <TextStyle color={light.main2}>{totalMoneyDrinks}</TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Dinero en comida:{" "}
          <TextStyle color={light.main2}>{totalMoneyFood}</TextStyle>
        </TextStyle>
        {orders.length > 0 && (
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Creación del pedido:{" "}
            <TextStyle color={light.main2}>
              {changeDate(new Date(orders[orders.length - 1].modificationDate))}
            </TextStyle>
          </TextStyle>
        )}
      </View>
      <View style={{ maxHeight: height / 2.2 }}>
        <FlatList
          data={orders}
          style={{ marginBottom: 20 }}
          inverted
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id + item.modificationDate}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                },
              ]}
              onPress={() => {
                navigation.push("CreateOrder", {
                  data: item.product,
                  item,
                  editing: true,
                });
              }}
            >
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
                smallParagraph
              >
                {item.product === "food" ? "Comida" : "Bebida"}
              </TextStyle>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
                smallParagraph
              >
                {thousandsSystem(item.amount * item.gave)}
              </TextStyle>
              <TextStyle
                color={light.main2}
                smallParagraph
              >
                {item.pay ? "Pagó" : "Pendiente"}
              </TextStyle>
            </TouchableOpacity>
          )}
        />
      </View>
      <ButtonStyle
        backgroundColor={light.main2}
        onPress={() => {
          Alert.alert(
            "¿Estás seguro?",
            "Se eliminarán todos los datos de esta mesa",
            [
              {
                text: "No estoy seguro",
                style: "cancel",
              },
              {
                text: "Estoy seguro",
                onPress: async () => {
                  dispatch(remove({ id: route.params.id }));
                  dispatch(removeMany({ ref: route.params.id }));
                  navigation.pop();
                  await removeTable({
                    email: activeGroup.active ? activeGroup.email : user.email,
                    id: route.params.id,
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
      >
        Eliminar mesa
      </ButtonStyle>
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 6,
  },
});

export default TableInformation;

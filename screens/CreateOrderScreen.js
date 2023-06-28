import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  TouchableNativeFeedback,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
} from "react-native";
import { remove } from "../features/tables/ordersSlice";
import { removeOrder } from "../api";
import { thousandsSystem, random } from "../helpers/libs";
import { add, edit } from "../features/tables/ordersSlice";
import {
  add as addK,
  removeMany as removeManyK,
} from "../features/tables/kitchenSlice";
import { add as addE, edit as editE } from "../features/function/economySlice";
import helperNotification from "../helpers/helperNotification";
import {
  addOrder,
  editOrder,
  addKitchen,
  removeManyKitchen,
  addEconomy,
  editEconomy,
} from "../api";
import Layout from "../components/Layout";
import TextStyle from "../components/TextStyle";
import ButtonStyle from "../components/ButtonStyle";
import InputStyle from "../components/InputStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "../theme";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateOrderScreen = ({ route, navigation }) => {
  const user = useSelector((state) => state.user);
  const activeGroup = useSelector((state) => state.activeGroup);
  const orders = useSelector((state) => state.orders);
  const menu = useSelector((state) => state.menu);
  const mode = useSelector((state) => state.mode);
  const economy = useSelector((state) => state.economy);
  const folk = useSelector((state) => state.people);

  const [products, setProducts] = useState([]);
  const [selection, setSelection] = useState(route.params.selection);
  const [newSelection, setNewSelection] = useState([]);
  const [search, setSearch] = useState(false);
  const [count, setCount] = useState(1);
  const [filter, setFilter] = useState("");
  const [order, setOrder] = useState("");

  const information = route.params;
  const reservation = route.params.reservation;

  useEffect(() => {
    if (route.params.id) {
      setOrder(orders.find((o) => o.id === route.params.id));
    }
  }, []);

  const getTotal = (totalDiscount, selection, tip, tax) =>
    totalDiscount !== 0
      ? selection.reduce(
          (a, b) =>
            a +
            (parseInt(b.discount) !== 0
              ? b.total - parseInt(b.discount)
              : b.total),
          0
        ) -
        totalDiscount +
        tip -
        tax
      : selection.reduce(
          (a, b) =>
            a +
            (parseInt(b.discount) !== 0
              ? b.total - parseInt(b.discount)
              : b.total),
          0
        ) +
        tip -
        tax;

  const extractObject = (d) => {
    return {
      pay: d.pay,
      discount: !d.discount ? null : d.discount,
      tax: !d.tax ? null : d.tax,
      tip: !d.tip ? null : d.tip,
      method: !d.method ? null : d.method,
      ID: !d.ID ? null : d.ID,
    };
  };

  const manageEconomy = async ({ editing, lastTotal, total }) => {
    const foundEconomy = economy.find((e) => e.ref === route.params.ref);

    if (!foundEconomy) {
      const id = random(20);
      const person = folk.find((p) => p.id === route.params.ref);

      const newEconomy = {
        id,
        ref: person.id,
        owner: {
          identification: person.identification,
          name: person.name,
        },
        type: "debt",
        amount: total,
        name: `Deuda ${person.name}`,
        payment: 0,
        creationDate: new Date().getTime(),
        modificationDate: new Date().getTime(),
      };

      dispatch(addE(newEconomy));
      await addEconomy({
        email: activeGroup.active ? activeGroup.email : user.email,
        economy: newEconomy,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    } else {
      const currentEconomy = { ...foundEconomy };
      if (editing) currentEconomy.amount -= lastTotal;
      currentEconomy.amount += total;
      currentEconomy.modificationDate = new Date().getTime();
      dispatch(editE({ id: foundEconomy.id, data: currentEconomy }));
      await editEconomy({
        email: activeGroup.active ? activeGroup.email : user.email,
        economy: currentEconomy,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    }
  };

  const saveOrder = async (dat) => {
    const d = extractObject(dat);
    const id = d.ID ? d.ID : random(20);

    const person = folk.find(p => p.id === route.params.ref);

    if (orders.find((order) => order.id === id)) return saveOrder(dat);
    const data = {};
    const total = getTotal(d.discount, selection, d.tip, d.tax);

    data.id = id;
    data.ref = route.params.ref;
    data.table = information.table;
    data.reservation = reservation;
    data.selection = selection;
    data.pay = d.pay;
    data.discount = d.discount;
    data.tax = d.tax;
    data.tip = d.tip;
    data.method = d.method;
    data.total = total;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(add(data));
    if (d.pay) navigation.pop();
    navigation.replace("OrderCompletion", { data, total });
    if (person) manageEconomy({ editing: false, total });
    await addOrder({
      email: activeGroup.active ? activeGroup.email : user.email,
      order: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const updateOrder = async (dat) => {
    const data = {};
    const d = extractObject(dat);
    const total = getTotal(d.discount, selection, d.tip, d.tax);
    const person = folk.find(p => p.id === route.params.ref);
    const currentOrder = orders.find(o => o.id === route.params.id);

    data.id = route.params.id;
    data.ref = route.params.ref;
    data.table = information.table;
    data.reservation = reservation;
    data.selection = selection;
    data.pay = d.pay;
    data.discount = d.discount;
    data.tax = d.tax;
    data.tip = d.tip;
    data.method = d.method;
    data.total = total;
    data.creationDate = order.creationDate;
    data.modificationDate = new Date().getTime();
    dispatch(edit({ id: information.id, data }));
    if (d.pay) navigation.pop();
    navigation.replace("OrderCompletion", { data, total });
    if (person) manageEconomy({ editing: false, total, lastTotal: currentOrder.total });
    await editOrder({
      email: activeGroup.active ? activeGroup.email : user.email,
      order: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const sendToKitchen = async () => {
    if (newSelection.length > 0) {
      const orderID = route.params.id ? route.params.id : random(20);
      const kitchenID = random(20);
      const orderToKitchen = route.params.id ? newSelection : selection;

      const obj = {
        id: kitchenID,
        ref: orderID,
        selection: orderToKitchen,
        reservation: route.params.reservation,
        table: route.params.table,
        finished: false,
        creationDate: new Date(),
        modificationDate: new Date(),
      };

      dispatch(addK(obj));

      if (information.editing) await updateOrder({ pay: false });
      else await saveOrder({ pay: false, ID: orderID });
      await addKitchen({
        email: activeGroup.active ? activeGroup.email : user.email,
        kitchen: obj,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
      await helperNotification(
        activeGroup,
        user,
        "Nuevo pedido pendiente",
        `Una orden ha sido pedida en ${reservation ? reservation : `la mesa`} ${
          route.params.table
        }`,
        "accessToKitchen"
      );
    } else {
      Alert.alert(
        "El carrito está vacío",
        selection.length > 0
          ? "No hay productos nuevos seleccionado para mandarlo a cocina"
          : "Precisa adicionar un producto al carrito para poder guardarlo"
      );
    }
  };

  const dispatch = useDispatch();

  useEffect(() => {
    let m = menu;

    if (filter.length > 0) {
      m = m.filter((p) => {
        if (p.name.includes(filter) || p.price.toString().includes(filter))
          return p;
      });
    }

    if (m.length - 12 >= 0) {
      setProducts([...m, 0]);
    } else {
      const missing = -m.length + 12;
      let added = m;
      for (let i = 0; i < missing; i++) {
        added = [...added, i];
      }
      setProducts(added);
    }
  }, [menu, filter]);

  const removeO = async () => {
    Alert.alert("Eliminar", "¿Desea eliminar la orden?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Si",
        onPress: async () => {
          dispatch(removeManyK({ ref: route.params.id }));
          dispatch(remove({ id: information.id }));
          navigation.pop();
          await removeManyKitchen({
            email: activeGroup.active ? activeGroup.email : user.email,
            ref: route.params.id,
            groups: activeGroup.active
              ? [activeGroup.id]
              : user.helpers.map((h) => h.id),
          });
          await removeOrder({
            email: activeGroup.active ? activeGroup.email : user.email,
            id: information.id,
            groups: activeGroup.active
              ? [activeGroup.id]
              : user.helpers.map((h) => h.id),
          });
        },
      },
    ]);
  };

  return (
    <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
      <View>
        <View style={styles.title}>
          <TextStyle
            smallSubtitle
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {reservation ? reservation : "Mesa"}:{" "}
            <TextStyle smallSubtitle color={light.main2}>
              {information.table.slice(0,10)}{information.table.length > 10 ? '...' : ''}
            </TextStyle>
          </TextStyle>
          <ButtonStyle
            backgroundColor="transparent"
            style={{
              borderWidth: 2,
              borderColor: light.main2,
              width: "40%",
            }}
            onPress={async () => sendToKitchen()}
          >
            <TextStyle verySmall color={light.main2}>
              Enviar a cocina
            </TextStyle>
          </ButtonStyle>
        </View>
      </View>
      <View style={styles.secondHeader}>
        {!search && (
          <TouchableOpacity onPress={() => setSearch(true)}>
            <Ionicons
              name="search"
              size={26}
              color={mode === "light" ? light.textDark : dark.textWhite}
            />
          </TouchableOpacity>
        )}
        {search && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setFilter("");
                setSearch(false);
              }}
            >
              <Ionicons
                name="close"
                size={30}
                color={mode === "light" ? light.textDark : dark.textWhite}
              />
            </TouchableOpacity>
            <InputStyle
              placeholder="Product, valor"
              value={filter}
              onChangeText={(text) => setFilter(text)}
              stylesContainer={{ width: "86%", marginVertical: 0 }}
              stylesInput={{
                paddingHorizontal: 6,
                paddingVertical: 5,
                fontSize: 18,
              }}
            />
          </View>
        )}
        {!search && (
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderRadius: 2,
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              paddingHorizontal: 10,
              paddingVertical: 2,
            }}
            onPress={() =>
              navigation.push("EditOrder", {
                data: "count",
                count: count.toString(),
                setCount,
              })
            }
          >
            <TextStyle
              verySmall
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {count} X
            </TextStyle>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ marginVertical: 10 }}>
        <ScrollView
          style={{ height: SCREEN_HEIGHT / 1.7 }}
          contentContainerStyle={{
            flexDirection: "row",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
          showsVerticalScrollIndicator={false}
        >
          {products.map((item, index) => {
            return (
              <TouchableNativeFeedback
                key={item.id ? item.id : item}
                onLongPress={() => {
                  if (item.id)
                    return navigation.push("CreateProduct", {
                      editing: true,
                      item,
                      setSelection,
                      selection,
                    });

                  navigation.push("CreateProduct", {
                    setSelection,
                    selection,
                  });
                }}
                onPress={() => {
                  if (item?.id) {
                    const index = selection.findIndex((s) => s.id === item.id);
                    const newIndex = newSelection.findIndex(
                      (s) => s.id === item.id
                    );

                    if (newIndex !== -1) {
                      newSelection[newIndex].count += count;
                      setNewSelection([...newSelection]);
                    } else
                      setNewSelection([...newSelection, { ...item, count }]);

                    const object = {
                      ...item,
                      count,
                      total: item.price * count,
                      discount: 0,
                    };

                    if (index !== -1) {
                      let selected = { ...selection[index] };
                      selected.count += count;
                      selected.total += item.price * count;
                      const changed = selection.map((s) => {
                        if (s.id === selected.id) return selected;
                        return s;
                      });
                      setSelection(changed);
                    } else setSelection([...selection, object]);
                  } else {
                    navigation.push("CreateProduct", {
                      setSelection,
                      selection,
                    });
                  }
                }}
              >
                <View
                  style={[
                    styles.catalogue,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                >
                  {item.id && (
                    <View style={{ flex: 1, justifyContent: "space-between" }}>
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          height: "60%",
                        }}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          {item.name}
                        </TextStyle>
                      </View>
                      <View
                        style={[
                          styles.footerCatalogue,
                          {
                            width: Math.floor(SCREEN_WIDTH / 3.5),
                            paddingHorizontal: 4,
                          },
                        ]}
                      >
                        <TextStyle verySmall>{item.name}</TextStyle>
                        <TextStyle verySmall>
                          {thousandsSystem(item.price)}
                        </TextStyle>
                      </View>
                    </View>
                  )}
                  {!item?.id && index === menu.length && (
                    <Ionicons
                      name="add"
                      size={55}
                      color={mode === "light" ? "#BBBBBB" : dark.main1}
                    />
                  )}
                </View>
              </TouchableNativeFeedback>
            );
          })}
        </ScrollView>
      </View>
      <View>
        {information.editing && (
          <ButtonStyle backgroundColor={light.main2} onPress={() => removeO()}>
            <TextStyle smallParagraph>Eliminar pedido</TextStyle>
          </ButtonStyle>
        )}
        <ButtonStyle
          backgroundColor="transparent"
          style={{
            borderWidth: 2,
            borderColor: light.main2,
          }}
          onPress={() => {
            if (selection.length === 0)
              Alert.alert(
                "El carrito está vacío",
                "Precisa adicionar un producto al carrito para poder velor"
              );
            else
              navigation.push("PreviewOrder", {
                selection,
                setSelection,
                setNewSelection,
                newSelection,
                saveOrder,
                updateOrder,
                sendToKitchen,
                editing: information.editing,
              });
          }}
        >
          <TextStyle color={light.main2} smallParagraph>
            {selection.length === 0
              ? "Ningún ítem"
              : `${thousandsSystem(
                  selection.reduce((a, b) => a + b.count, 0)
                )} ítem = ${thousandsSystem(
                  selection.reduce((a, b) => a + b.total, 0)
                )}`}
          </TextStyle>
        </ButtonStyle>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textHeader: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 8,
  },
  title: {
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerCatalogue: {
    height: "40%",
    justifyContent: "center",
    backgroundColor: light.main2,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    paddingHorizontal: 14,
  },
  catalogue: {
    borderRadius: 5,
    margin: 2,
    height: Math.floor(SCREEN_WIDTH / 3.5),
    width: Math.floor(SCREEN_WIDTH / 3.5),
    justifyContent: "center",
    alignItems: "center",
  },
  secondHeader: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default CreateOrderScreen;

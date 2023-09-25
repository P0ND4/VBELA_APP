import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  TouchableNativeFeedback,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { thousandsSystem, random, months } from "@helpers/libs";
import { add as addM, edit, remove } from "@features/tables/ordersSlice";
import { change as changeM } from "@features/tables/menuSlice";
import {
  add as addK,
  removeMany as removeManyK,
} from "@features/tables/kitchenSlice";
import {
  add as addE,
  edit as editE,
  remove as removeE,
} from "@features/function/economySlice";
import helperNotification from "@helpers/helperNotification";
import {
  addOrder,
  editOrder,
  addKitchen,
  removeManyKitchen,
  addEconomy,
  editEconomy,
  removeOrder,
  removeEconomy,
  editUser,
} from "@api";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreateOrder = ({ route, navigation }) => {
  const user = useSelector((state) => state.user);
  const activeGroup = useSelector((state) => state.activeGroup);
  const orders = useSelector((state) => state.orders);
  const menu = useSelector((state) => state.menu);
  const mode = useSelector((state) => state.mode);
  const economy = useSelector((state) => state.economy);
  const folk = useSelector((state) => state.people);

  const initialState = {
    active: false,
    minValue: "",
    maxValue: "",
    year: "all",
    month: "all",
    day: "all",
  };

  const [products, setProducts] = useState([]);
  const [selection, setSelection] = useState(route.params.selection);
  const [newSelection, setNewSelection] = useState([]);
  const [activeSearch, setActiveSearch] = useState(false);
  const [count, setCount] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(false);
  const [filters, setFilters] = useState(initialState);
  const [order, setOrder] = useState("");

  const [days, setDays] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    const date = new Date();
    let years = [date.getFullYear()];

    for (let i = 5; i >= 0; i--) {
      years.push(years[years.length - 1] - 1);
    }

    setYears(years);
  }, []);

  useEffect(() => {
    const date = new Date();
    const days = new Date(
      filters.year === "all" ? date.getFullYear() : filters.year,
      filters.month === "all" ? 1 : filters.month + 1,
      0
    ).getDate();
    const monthDays = [];
    for (let day = 0; day < days; day++) {
      monthDays.push(day + 1);
    }
    setDays(monthDays);
  }, [filters.year, filters.month]);

  const searchRef = useRef();

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

  const manageEconomy = async ({ editing, lastTotal, total, kitchen }) => {
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
      if ((editing || kitchen) && lastTotal) currentEconomy.amount -= lastTotal;
      currentEconomy.amount += total;
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
  };

  const saveOrder = async (dat, selection) => {
    const d = extractObject(dat);
    const id = d.ID ? d.ID : random(20);

    const person = folk.find((p) => p.id === route.params.ref);

    if (orders.find((order) => order.id === id))
      return saveOrder(dat, selection);
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
    dispatch(addM(data));
    const newMenu = menu.map((m) => {
      const mc = { ...m };
      const found = selection.find((s) => s.id === m.id);
      if (found) {
        mc.quantity -= found.count;
        return mc;
      }
      return m;
    });
    if (d.pay) {
      dispatch(changeM(newMenu));
      navigation.pop();
    }
    navigation.replace("OrderCompletion", { data, total });
    if (person)
      manageEconomy({ editing: d.pay, total, kitchen: dat.isSendtoKitchen });
    if (d.pay) {
      await editUser({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        change: { menu: newMenu },
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    }
    await addOrder({
      identifier: activeGroup.active ? activeGroup.identifier : user.identifier,
      order: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const updateOrder = async (dat, selection) => {
    const data = {};
    const d = extractObject(dat);
    const total = getTotal(d.discount, selection, d.tip, d.tax);
    const person = folk.find((p) => p.id === route.params.ref);
    const currentOrder = orders.find((o) => o.id === route.params.id);

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
    const newMenu = menu.map((m) => {
      const mc = { ...m };
      const found = selection.find((s) => s.id === m.id);
      if (found) {
        mc.quantity -= found.count;
        return mc;
      }
      return m;
    });
    if (d.pay) {
      dispatch(changeM(newMenu));
      navigation.pop();
    }
    navigation.replace("OrderCompletion", { data, total });
    if (person)
      manageEconomy({
        editing: d.pay,
        total,
        lastTotal: currentOrder.total,
        kitchen: dat.isSendtoKitchen,
      });
    if (d.pay) {
      await editUser({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
        change: { menu: newMenu },
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    }
    await editOrder({
      identifier: activeGroup.active ? activeGroup.identifier : user.identifier,
      order: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const sendToKitchen = async (selection, newSelection) => {
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

      if (information.editing)
        await updateOrder({ pay: false, isSendtoKitchen: true }, selection);
      else
        await saveOrder(
          { pay: false, ID: orderID, isSendtoKitchen: true },
          selection
        );
      await addKitchen({
        identifier: activeGroup.active
          ? activeGroup.identifier
          : user.identifier,
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

  const dateValidation = (date) => {
    let error = false;
    if (filters.day !== "all" && date.getDate() !== filters.day) error = true;
    if (filters.month !== "all" && date.getMonth() + 1 !== filters.month)
      error = true;
    if (filters.year !== "all" && date.getFullYear() !== filters.year)
      error = true;
    return error;
  };

  useEffect(() => {
    let m = [...menu].sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    if (search || filters.active) {
      m = m.filter((p) => {
        const text = search.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (
          p.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(text.toLowerCase()) ||
          p.value.toString().includes(text.toLowerCase())
        ) {
          if (!filters.active) return p;

          if (dateValidation(new Date(p.creationDate))) return;
          if (
            filters.minValue &&
            p.value < parseInt(filters.minValue.replace(/\D/g, ""))
          )
            return;
          if (
            filters.maxValue &&
            p.value > parseInt(filters.maxValue.replace(/\D/g, ""))
          )
            return;

          return p;
        }
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
  }, [menu, search, filters]);

  const removeO = async () => {
    Alert.alert("Eliminar", "¿Desea eliminar la orden?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Si",
        onPress: async () => {
          const foundEconomy = economy.find((e) => e.ref === route.params.ref);

          dispatch(removeManyK({ ref: route.params.id }));
          dispatch(remove({ id: information.id }));
          navigation.pop();
          if (foundEconomy) {
            const currentEconomy = { ...foundEconomy };
            currentEconomy.amount -= route.params.selection.reduce(
              (a, b) => a + b.total,
              0
            );
            if (currentEconomy.amount === 0) {
              dispatch(removeE({ id: currentEconomy.id }));
              await removeEconomy({
                identifier: activeGroup.active
                  ? activeGroup.identifier
                  : user.identifier,
                id: currentEconomy.id,
                groups: activeGroup.active
                  ? [activeGroup.id]
                  : user.helpers.map((h) => h.id),
              });
            } else {
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
          await removeManyKitchen({
            identifier: activeGroup.active
              ? activeGroup.identifier
              : user.identifier,
            ref: route.params.id,
            groups: activeGroup.active
              ? [activeGroup.id]
              : user.helpers.map((h) => h.id),
          });
          await removeOrder({
            identifier: activeGroup.active
              ? activeGroup.identifier
              : user.identifier,
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
              {information.table.slice(0, 10)}
              {information.table.length > 10 ? "..." : ""}
            </TextStyle>
          </TextStyle>
          <ButtonStyle
            backgroundColor="transparent"
            style={{
              borderWidth: 2,
              borderColor: light.main2,
              width: "40%",
            }}
            onPress={async () => sendToKitchen(selection, newSelection)}
          >
            <TextStyle center verySmall color={light.main2}>
              Enviar a cocina
            </TextStyle>
          </ButtonStyle>
        </View>
      </View>
      <View style={styles.secondHeader}>
        {!activeSearch && (
          <TouchableOpacity
            onPress={() => {
              setActiveSearch(true);
              setTimeout(() => searchRef.current.focus());
            }}
          >
            <Ionicons
              name="search"
              size={26}
              color={mode === "light" ? light.textDark : dark.textWhite}
            />
          </TouchableOpacity>
        )}
        {activeSearch && (
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
                setSearch("");
                setActiveSearch(false);
                setFilters(initialState);
              }}
            >
              <Ionicons
                name="close"
                size={30}
                color={mode === "light" ? light.textDark : dark.textWhite}
              />
            </TouchableOpacity>
            <InputStyle
              innerRef={searchRef}
              placeholder="Producto, valor"
              value={search}
              onChangeText={(text) => setSearch(text)}
              stylesContainer={{ width: "78%", marginVertical: 0 }}
              stylesInput={{
                paddingHorizontal: 6,
                paddingVertical: 5,
                fontSize: 18,
              }}
            />
            <TouchableOpacity onPress={() => setActiveFilter(!activeFilter)}>
              <Ionicons name="filter" size={30} color={light.main2} />
            </TouchableOpacity>
          </View>
        )}
        {!activeSearch && (
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderRadius: 2,
              borderColor: mode === "light" ? light.textDark : dark.textWhite,
              paddingHorizontal: 10,
              paddingVertical: 2,
            }}
            onPress={() =>
              navigation.navigate("EditOrder", {
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
                key={item.id ? item.id : index}
                onLongPress={() => {
                  if (item.id)
                    return navigation.navigate("CreateProduct", {
                      editing: true,
                      item,
                      setSelection,
                      selection,
                    });

                  navigation.navigate("CreateProduct", {
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
                      total: item.value * count,
                      discount: 0,
                    };

                    if (index !== -1) {
                      let selected = { ...selection[index] };
                      selected.count += count;
                      selected.total += item.value * count;
                      const changed = selection.map((s) => {
                        if (s.id === selected.id) return selected;
                        return s;
                      });
                      setSelection(changed);
                    } else setSelection([...selection, object]);
                  } else {
                    navigation.navigate("CreateProduct");
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
                        <View style={{ flexDirection: "row" }}>
                          <TextStyle
                            verySmall
                            color={
                              item.quantity < item.reorder
                                ? "#F70000"
                                : light.main2
                            }
                          >
                            {item.quantity < 0 ? "-" : ""}
                            {thousandsSystem(Math.abs(item.quantity))}/
                          </TextStyle>
                          <TextStyle
                            verySmall
                            color={
                              mode === "light" ? light.textDark : dark.textWhite
                            }
                          >
                            {thousandsSystem(item.reorder)}
                          </TextStyle>
                        </View>
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
                        <View style={[styles.header, { flexWrap: "wrap" }]}>
                          <TextStyle verySmall>
                            {thousandsSystem(item.value)}
                          </TextStyle>
                          <TextStyle verySmall>{item.unit}</TextStyle>
                        </View>
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
            <TextStyle center smallParagraph>
              Eliminar pedido
            </TextStyle>
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
              navigation.navigate("PreviewOrder", {
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
          <TextStyle color={light.main2} center smallParagraph>
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
      <Modal
        animationType="fade"
        transparent={true}
        visible={activeFilter}
        onRequestClose={() => {
          setActiveFilter(!activeFilter);
          setFilters(initialState);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => setActiveFilter(!activeFilter)}
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
            <View>
              <View style={styles.header}>
                <TextStyle bigSubtitle color={light.main2} bold>
                  FILTRA
                </TextStyle>
                <TouchableOpacity
                  onPress={() => {
                    setActiveFilter(false);
                    setFilters(initialState);
                  }}
                >
                  <Ionicons
                    name="close"
                    size={30}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                </TouchableOpacity>
              </View>
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Para una búsqueda más precisa
              </TextStyle>
            </View>
            <View style={{ marginTop: 6 }}>
              <View style={[styles.header, { marginTop: 15 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Valor MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minValue}
                    onChangeText={(text) => {
                      const value = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, minValue: value });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Valor MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxValue}
                    onChangeText={(text) => {
                      const value = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, maxValue: value });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>
              <View style={[styles.header, { marginTop: 15 }]}>
                <View
                  style={[
                    styles.cardPicker,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                >
                  <Picker
                    mode="dropdown"
                    selectedValue={filters.day}
                    dropdownIconColor={
                      mode === "light" ? light.textDark : dark.textWhite
                    }
                    onValueChange={(itemValue) =>
                      setFilters({ ...filters, day: itemValue })
                    }
                    style={{
                      width: SCREEN_WIDTH / 4.3,
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                      color: mode === "light" ? light.textDark : dark.textWhite,
                      fontSize: 20,
                    }}
                  >
                    <Picker.Item
                      label="Día"
                      value="all"
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                    {days.map((day) => (
                      <Picker.Item
                        key={day}
                        label={`${day}`}
                        value={day}
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    ))}
                  </Picker>
                </View>
                <View
                  style={[
                    styles.cardPicker,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                >
                  <Picker
                    mode="dropdown"
                    selectedValue={filters.month}
                    onValueChange={(itemValue) =>
                      setFilters({ ...filters, month: itemValue })
                    }
                    dropdownIconColor={
                      mode === "light" ? light.textDark : dark.textWhite
                    }
                    style={{
                      width: SCREEN_WIDTH / 4.3,
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                      color: mode === "light" ? light.textDark : dark.textWhite,
                      fontSize: 20,
                    }}
                  >
                    <Picker.Item
                      label="Mes"
                      value="all"
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                    {months.map((month, index) => (
                      <Picker.Item
                        key={month}
                        label={month}
                        value={index + 1}
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    ))}
                  </Picker>
                </View>
                <View
                  style={[
                    styles.cardPicker,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                >
                  <Picker
                    mode="dropdown"
                    selectedValue={filters.year}
                    onValueChange={(itemValue) =>
                      setFilters({ ...filters, year: itemValue })
                    }
                    dropdownIconColor={
                      mode === "light" ? light.textDark : dark.textWhite
                    }
                    style={{
                      width: SCREEN_WIDTH / 4.3,
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                      color: mode === "light" ? light.textDark : dark.textWhite,
                      fontSize: 20,
                    }}
                  >
                    <Picker.Item
                      label="Año"
                      value="all"
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                    {years.map((year, index) => (
                      <Picker.Item
                        key={year}
                        label={`${year}`}
                        value={year}
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              {filters.active && (
                <ButtonStyle
                  style={{ width: "35%" }}
                  backgroundColor={mode === "light" ? light.main5 : dark.main2}
                  onPress={() => {
                    setActiveFilter(false);
                    setFilters(initialState);
                  }}
                >
                  <TextStyle
                    center
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Remover
                  </TextStyle>
                </ButtonStyle>
              )}
              <ButtonStyle
                onPress={() => {
                  setActiveFilter(!activeFilter);
                  const compare = { ...filters, active: false };

                  if (
                    JSON.stringify(compare) === JSON.stringify(initialState)
                  ) {
                    setFilters(initialState);
                    return;
                  }
                  setFilters({ ...filters, active: true });
                }}
                backgroundColor={light.main2}
                style={{
                  width: filters.active ? "60%" : "99%",
                }}
              >
                <TextStyle center>Buscar</TextStyle>
              </ButtonStyle>
            </View>
          </View>
        </View>
      </Modal>
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
  card: {
    width: "90%",
    borderRadius: 8,
    padding: 30,
  },
  cardPicker: {
    padding: 2,
    borderRadius: 8,
  },
});

export default CreateOrder;

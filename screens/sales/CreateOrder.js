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
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { thousandsSystem, random, months, getFontSize } from "@helpers/libs";
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
import { add as addClient } from "@features/people/clientSlice";
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
  addPerson,
  editReservation,
} from "@api";
import { edit as editRS } from "@features/zones/standardReservationsSlice";
import { edit as editRA } from "@features/zones/accommodationReservationsSlice";
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
  const helperStatus = useSelector((state) => state.helperStatus);
  const orders = useSelector((state) => state.orders);
  const menu = useSelector((state) => state.menu);
  const mode = useSelector((state) => state.mode);
  const economy = useSelector((state) => state.economy);
  const client = useSelector((state) => state.client);
  const groupsREF = useSelector((state) => state.groups);

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
  const [categorySelected, setCategorySelected] = useState({
    id: "everything",
    category: "Todos",
    subcategory: [],
  });
  const [subcategorySelected, setSubcategorySelected] = useState(null);
  const [groups, setGroups] = useState([]);

  const [days, setDays] = useState([]);
  const [years, setYears] = useState([]);
  const [keyCategory, setKeyCategory] = useState(Math.random());
  const [keySubcategory, setKeySubcategory] = useState(Math.random());

  const dayRef = useRef();
  const monthRef = useRef();
  const yearRef = useRef();

  useEffect(() => {
    setKeySubcategory(Math.random());
  }, [categorySelected]);

  useEffect(() => {
    const obj = { id: "everything", category: "Todos", subcategory: [] };
    const groups = [obj, ...groupsREF.filter((g) => g.type === "menu")];
    setKeyCategory(Math.random());
    if (categorySelected.id !== "everything") {
      const group = groupsREF.find((g) => g.id === categorySelected.id);
      if (!group) setCategorySelected(obj);
      else setCategorySelected(group);
    }
    setGroups(groups);
  }, [groupsREF]);

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
  const createClient = route.params?.createClient;

  useEffect(() => {
    if (route.params.id) {
      setOrder(orders.find((o) => o.id === route.params.id));
    }
  }, []);

  const getTotal = (totalDiscount = 0, selection = [], tip = 0, tax = 0) =>
    totalDiscount !== 0
      ? selection.reduce((a, b) => {
          const value = b.value * b.paid;
          const percentage = (value / b.total).toFixed(2);
          return (
            a + (b.discount !== 0 ? value - b.discount * percentage : value)
          );
        }, 0) -
        totalDiscount +
        tip +
        tax
      : selection.reduce((a, b) => {
          const value = b.value * b.paid;
          const percentage = (value / b.total).toFixed(2);
          return (
            a + (b.discount !== 0 ? value - b.discount * percentage : value)
          );
        }, 0) +
        tip +
        tax;

  const manageEconomy = async ({
    editing,
    total,
    kitchen,
    callBack,
    person,
  }) => {
    const foundEconomy = economy.find((e) => e.ref === person?.id);
    const clientID = random(20);
    const hosted = createClient?.hosted?.find(h => (h.id || h.owner) === route.params.ref)
    if (createClient && !person) {
      //TODO ---------------------------------- ACOMODAR PONER BONITO
      //TODO ---------------------------------- HAY MUCHAS PETICIONES AL SERVIDOR CAMBIARLO A FUTURO
      const data = {
        name: hosted.fullName,
        identification: hosted.identification,
      };
      data.id = clientID;
      data.type = "customer";
      data.creationDate = new Date().getTime();
      data.modificationDate = new Date().getTime();
      dispatch(addClient(data));

      const newReservation = { ...createClient };
      const newHosted = { ...hosted, owner: clientID };

      if (createClient.type === 'accommodation') dispatch(editRA({ id: hosted.id, data: newHosted }))
      if (createClient.type === "standard") {
        const reservationUpdated = createClient?.hosted.map(h => {
          if ((h.id || h.owner) === route.params.ref) return { ...h, owner: clientID };
          return h;
        })
        newReservation.hosted = reservationUpdated;
        dispatch(editRS({ ref: createClient.ref, data: newReservation }));
      }

      await editReservation({ //TODO  1
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        reservation: {
          data: createClient.type === "standard" ? newReservation : [newHosted],
          type: createClient.type,
        },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });

      await addPerson({ //TODO  2
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        person: { type: 'customer', data },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });

      //TODO ---------------------------------- ACOMODAR PONER BONITO
    }

    if (!foundEconomy) {
      const id = random(20);
      let data = {};
      if (!createClient) data = { ...person };
      else data = { ...hosted, name: hosted.fullName, id: clientID };

      const newEconomy = {
        id,
        ref: data.id,
        owner: {
          identification: data.identification || "",
          name: data.name,
        },
        type: "debt",
        amount: total,
        name: `Deuda ${data.name}`,
        payment: 0,
        creationDate: new Date().getTime(),
        modificationDate: new Date().getTime(),
      };

      dispatch(addE(newEconomy));
      await addEconomy({ //TODO  3
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
      currentEconomy.amount += total;
      currentEconomy.modificationDate = new Date().getTime();
      dispatch(editE({ id: foundEconomy.id, data: currentEconomy }));
      await editEconomy({ //TODO  3
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        economy: currentEconomy,
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    }
    await callBack();
  };

  const saveOrder = async ({
    data: dat,
    completeSelection,
    totalPaid,
    currentSelection,
    back = false,
  }) => {
    const id = dat.ID || random(20);
    const person =
      client.find((p) => p.id === route.params.ref) ||
      client.find((p) => p?.clientList?.some((c) => c.id === route.params.ref));
      
    if (orders.find((order) => order.id === id))
      return saveOrder({
        data: dat,
        completeSelection,
        totalPaid,
        currentSelection,
        back,
      });
    const data = {};
    const total = getTotal(dat.discount, completeSelection, dat.tip, dat.tax);

    data.id = id;
    data.ref = route.params.ref;
    data.table = information.table;
    data.reservation = reservation;
    data.selection = completeSelection;
    data.pay = dat.pay;
    data.discount = dat.discount || null;
    data.tax = dat.tax || null;
    data.tip = dat.tip || null;
    data.total = total;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();

    const close = async () => {
      dispatch(addM(data));
      const newMenu = menu.map((m) => {
        const mc = { ...m };
        const found = completeSelection.find((s) => s.id === m.id);
        if (found) {
          mc.quantity -= found.count;
          return mc;
        }
        return m;
      });
      if (dat.pay) dispatch(changeM(newMenu));
      if (back) navigation.pop();
      navigation.replace("OrderCompletion", {
        selection: currentSelection,
        pay: data.pay,
        kitchen: dat.isSendtoKitchen,
        total: totalPaid,
        extra: {
          discount: dat.discount || null,
          tax: dat.tax || null,
          tip: dat.tip || null,
        },
      });

      if (dat.pay) {
        await editUser({ //TODO 4
          identifier: helperStatus.active
            ? helperStatus.identifier
            : user.identifier,
          change: { menu: newMenu },
          helpers: helperStatus.active
            ? [helperStatus.id]
            : user.helpers.map((h) => h.id),
        });
      }
      await addOrder({ //TODO  5
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        order: data,
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    };

    if (person || createClient)
      await manageEconomy({
        editing: dat.pay,
        total: totalPaid,
        kitchen: dat.isSendtoKitchen,
        callBack: close,
        person
      });
    else close();
  };

  const updateOrder = async ({
    data: dat,
    completeSelection,
    totalPaid,
    currentSelection,
    back = false,
  }) => {
    const data = {};
    const total = getTotal(dat.discount, completeSelection, dat.tip, dat.tax);
    const person =
      client.find((p) => p.id === route.params.ref) ||
      client.find((p) => p?.clientList?.some((c) => c.id === route.params.ref));

    data.id = route.params.id;
    data.ref = route.params.ref;
    data.table = information.table;
    data.reservation = reservation;
    data.selection = completeSelection;
    data.pay = dat.pay;
    data.discount = dat.discount || null;
    data.tax = dat.tax || null;
    data.tip = dat.tip || null;
    data.total = total;
    data.creationDate = order.creationDate;
    data.modificationDate = new Date().getTime();

    const close = async () => {
      dispatch(edit({ id: information.id, data }));
      const newMenu = menu.map((m) => {
        const mc = { ...m };
        const found = completeSelection.find((s) => s.id === m.id);
        if (found) {
          mc.quantity -= found.count;
          return mc;
        }
        return m;
      });
      if (dat.pay) dispatch(changeM(newMenu));
      if (back) navigation.pop();
      navigation.replace("OrderCompletion", {
        total: totalPaid,
        selection: currentSelection,
        kitchen: dat.isSendtoKitchen,
        pay: data.pay,
        extra: {
          discount: dat.discount || null,
          tax: dat.tax || null,
          tip: dat.tip || null,
        },
      });
      if (dat.pay) {
        await editUser({
          identifier: helperStatus.active
            ? helperStatus.identifier
            : user.identifier,
          change: { menu: newMenu },
          helpers: helperStatus.active
            ? [helperStatus.id]
            : user.helpers.map((h) => h.id),
        });
      }
      await editOrder({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        order: data,
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    };

    if (person || createClient)
      await manageEconomy({
        editing: dat.pay,
        total: totalPaid,
        kitchen: dat.isSendtoKitchen,
        callBack: close,
        person,
      });
    else close();
  };

  const sendToKitchen = async ({ selection, newSelection, back }) => {
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

      const params = {
        completeSelection: selection,
        currentSelection: selection,
        totalPaid: null,
        back,
      };

      if (information.editing)
        await updateOrder({
          data: { pay: false, isSendtoKitchen: true },
          ...params,
        });
      else
        await saveOrder({
          data: { pay: false, ID: orderID, isSendtoKitchen: true },
          ...params,
        });
      await addKitchen({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        kitchen: obj,
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
      await helperNotification(
        helperStatus,
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

    if (search || filters.active || categorySelected.id !== "everything") {
      m = m.filter((p) => {
        const convertText = (text) =>
          text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
        if (
          categorySelected.id !== "everything" &&
          !p.category.includes(categorySelected.id)
        )
          return;
        if (
          subcategorySelected &&
          !p.subcategory.includes(subcategorySelected?.id)
        )
          return;
        if (
          convertText(p.name).includes(convertText(search)) ||
          convertText(p.identifier).includes(convertText(search)) ||
          p.value.toString().includes(convertText(search))
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
  }, [menu, search, filters, categorySelected, subcategorySelected]);

  const removeO = async () => {
    Alert.alert("Eliminar", "¿Desea eliminar la orden?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Si",
        onPress: async () => {
          const person =
            client.find((p) => p.id === route.params.ref) ||
            client.find((p) =>
              p?.clientList?.some((c) => c.id === route.params.ref)
            );
          const foundEconomy = economy.find((e) => e.ref === person.id);

          dispatch(removeManyK({ ref: route.params.id }));
          dispatch(remove({ id: information.id }));
          navigation.pop();
          if (foundEconomy) {
            const currentEconomy = { ...foundEconomy };
            currentEconomy.amount -= route.params.selection.reduce(
              (a, b) => a + b.paid * b.value,
              0
            );
            if (currentEconomy.amount === 0) {
              dispatch(removeE({ id: currentEconomy.id }));
              await removeEconomy({
                identifier: helperStatus.active
                  ? helperStatus.identifier
                  : user.identifier,
                id: currentEconomy.id,
                helpers: helperStatus.active
                  ? [helperStatus.id]
                  : user.helpers.map((h) => h.id),
              });
            } else {
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
          await removeManyKitchen({
            identifier: helperStatus.active
              ? helperStatus.identifier
              : user.identifier,
            ref: route.params.id,
            helpers: helperStatus.active
              ? [helperStatus.id]
              : user.helpers.map((h) => h.id),
          });
          await removeOrder({
            identifier: helperStatus.active
              ? helperStatus.identifier
              : user.identifier,
            id: information.id,
            helpers: helperStatus.active
              ? [helperStatus.id]
              : user.helpers.map((h) => h.id),
          });
        },
      },
    ]);
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ justifyContent: "space-between", flexGrow: 1 }}>
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
                  onPress={async () =>
                    sendToKitchen({ selection, newSelection })
                  }
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
                    size={getFontSize(21)}
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
                      size={getFontSize(24)}
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
                  <TouchableOpacity
                    onPress={() => setActiveFilter(!activeFilter)}
                  >
                    <Ionicons
                      name="filter"
                      size={getFontSize(24)}
                      color={light.main2}
                    />
                  </TouchableOpacity>
                </View>
              )}
              {!activeSearch && (
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderRadius: 2,
                    borderColor:
                      mode === "light" ? light.textDark : dark.textWhite,
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
            <View style={{ marginVertical: 8 }}>
              <View style={styles.header}>
                <FlatList
                  key={keyCategory}
                  data={groups}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          setCategorySelected(item);
                          setSubcategorySelected("");
                        }}
                        onLongPress={() => {
                          if (item.id !== "everything") {
                            navigation.navigate("CreateGroup", {
                              editing: true,
                              item,
                            });
                          }
                        }}
                        style={[
                          styles.category,
                          {
                            backgroundColor:
                              categorySelected.id === item.id
                                ? light.main2
                                : mode === "light"
                                ? light.main5
                                : dark.main2,
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            categorySelected.id === item.id
                              ? light.textDark
                              : mode === "light"
                              ? light.textDark
                              : dark.textWhite
                          }
                        >
                          {item.category}
                        </TextStyle>
                      </TouchableOpacity>
                    );
                  }}
                />
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("CreateGroup", { type: "menu" })
                  }
                >
                  <Ionicons
                    name="add-circle"
                    color={light.main2}
                    size={getFontSize(24)}
                  />
                </TouchableOpacity>
              </View>
              <FlatList
                key={keySubcategory}
                data={categorySelected?.subcategory}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  marginTop: categorySelected?.subcategory.length ? 8 : 0,
                }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity
                      onPress={() =>
                        setSubcategorySelected(
                          subcategorySelected?.id === item.id ? null : item
                        )
                      }
                      onLongPress={() =>
                        navigation.navigate("CreateGroup", {
                          editing: true,
                          item: categorySelected,
                        })
                      }
                      style={[
                        styles.category,
                        {
                          backgroundColor:
                            subcategorySelected === item
                              ? light.main2
                              : mode === "light"
                              ? light.main5
                              : dark.main2,
                        },
                      ]}
                    >
                      <TextStyle
                        smallParagraph
                        color={
                          subcategorySelected === item
                            ? light.textDark
                            : mode === "light"
                            ? light.textDark
                            : dark.textWhite
                        }
                      >
                        {item.subcategory}
                      </TextStyle>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
            <View style={{ marginVertical: 5 }}>
              <ScrollView
                style={{ height: SCREEN_HEIGHT / 1.75 }}
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
                          const index = selection.findIndex(
                            (s) => s.id === item.id
                          );
                          const newIndex = newSelection.findIndex(
                            (s) => s.id === item.id
                          );

                          if (newIndex !== -1) {
                            newSelection[newIndex].count += count;
                            setNewSelection([...newSelection]);
                          } else
                            setNewSelection([
                              ...newSelection,
                              { ...item, count },
                            ]);

                          const object = {
                            ...item,
                            count,
                            total: item.value * count,
                            paid: 0,
                            discount: 0, //TODO SI QUITO ESTO SE CAE TODO
                            method: [],
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
                          <View
                            style={{ flex: 1, justifyContent: "space-between" }}
                          >
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
                                  mode === "light"
                                    ? light.textDark
                                    : dark.textWhite
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
                                    mode === "light"
                                      ? light.textDark
                                      : dark.textWhite
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
                              <TextStyle verySmall>{item.identifier}</TextStyle>
                              <View
                                style={[styles.header, { flexWrap: "wrap" }]}
                              >
                                <TextStyle verySmall>
                                  {thousandsSystem(item.value)}
                                </TextStyle>
                                <TextStyle verySmall>{item.unit}</TextStyle>
                              </View>
                            </View>
                          </View>
                        )}
                        {!item?.id &&
                          index ===
                            products.filter((p) => typeof p !== "number")
                              .length && (
                            <Ionicons
                              name="add"
                              size={getFontSize(45)}
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
                <ButtonStyle
                  backgroundColor={light.main2}
                  onPress={() => removeO()}
                >
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
                        selection
                          .filter((s) => s.count !== s.paid)
                          .reduce((a, b) => a + b.count - b.paid, 0)
                      )} ítem = ${thousandsSystem(
                        selection
                          .filter((s) => s.count !== s.paid)
                          .reduce((a, b) => a + (b.count - b.paid) * b.value, 0)
                      )}`}
                </TextStyle>
              </ButtonStyle>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
                    size={getFontSize(24)}
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
              <View style={[styles.header, { marginTop: 10 }]}>
                <View>
                  <ButtonStyle
                    backgroundColor={
                      mode === "light" ? light.main5 : dark.main2
                    }
                    style={{ width: SCREEN_WIDTH / 4.5, paddingVertical: 16 }}
                    onPress={() => dayRef.current?.focus()}
                  >
                    <View style={styles.header}>
                      <TextStyle
                        color={
                          filters.day !== "all"
                            ? mode === "light"
                              ? light.textDark
                              : dark.textWhite
                            : "#888888"
                        }
                        smallParagraph
                      >
                        {filters.day !== "all" ? filters.day : "Día"}
                      </TextStyle>
                      <Ionicons
                        color={
                          filters.day !== "all"
                            ? mode === "light"
                              ? light.textDark
                              : dark.textWhite
                            : "#888888"
                        }
                        size={getFontSize(10)}
                        name="caret-down"
                      />
                    </View>
                  </ButtonStyle>

                  <View style={{ display: "none" }}>
                    <Picker
                      ref={dayRef}
                      mode="dropdown"
                      selectedValue={filters.day}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, day: itemValue })
                      }
                      style={{
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                      }}
                    >
                      <Picker.Item
                        label="Día"
                        value="all"
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                </View>
                <View>
                  <ButtonStyle
                    backgroundColor={
                      mode === "light" ? light.main5 : dark.main2
                    }
                    style={{ width: SCREEN_WIDTH / 3.6, paddingVertical: 16 }}
                    onPress={() => monthRef.current?.focus()}
                  >
                    <View style={styles.header}>
                      <TextStyle
                        color={
                          filters.month !== "all"
                            ? mode === "light"
                              ? light.textDark
                              : dark.textWhite
                            : "#888888"
                        }
                        smallParagraph
                      >
                        {filters.month !== "all"
                          ? months[filters.month - 1]
                          : "Mes"}
                      </TextStyle>
                      <Ionicons
                        color={
                          filters.month !== "all"
                            ? mode === "light"
                              ? light.textDark
                              : dark.textWhite
                            : "#888888"
                        }
                        size={getFontSize(10)}
                        name="caret-down"
                      />
                    </View>
                  </ButtonStyle>
                  <View style={{ display: "none" }}>
                    <Picker
                      ref={monthRef}
                      mode="dropdown"
                      selectedValue={filters.month}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, month: itemValue })
                      }
                      style={{
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                      }}
                    >
                      <Picker.Item
                        label="Mes"
                        value="all"
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                </View>
                <View>
                  <ButtonStyle
                    backgroundColor={
                      mode === "light" ? light.main5 : dark.main2
                    }
                    style={{ width: SCREEN_WIDTH / 4.5, paddingVertical: 16 }}
                    onPress={() => yearRef.current?.focus()}
                  >
                    <View style={styles.header}>
                      <TextStyle
                        color={
                          filters.year !== "all"
                            ? mode === "light"
                              ? light.textDark
                              : dark.textWhite
                            : "#888888"
                        }
                        smallParagraph
                      >
                        {filters.year !== "all" ? filters.year : "Año"}
                      </TextStyle>
                      <Ionicons
                        color={
                          filters.year !== "all"
                            ? mode === "light"
                              ? light.textDark
                              : dark.textWhite
                            : "#888888"
                        }
                        size={getFontSize(10)}
                        name="caret-down"
                      />
                    </View>
                  </ButtonStyle>
                  <View style={{ display: "none" }}>
                    <Picker
                      ref={yearRef}
                      mode="dropdown"
                      selectedValue={filters.year}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, year: itemValue })
                      }
                      style={{
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                      }}
                    >
                      <Picker.Item
                        label="Año"
                        value="all"
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
  category: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 5,
    marginHorizontal: 2,
  },
});

export default CreateOrder;

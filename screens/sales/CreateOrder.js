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
import { thousandsSystem, random, getFontSize } from "@helpers/libs";
import { add as addM, edit, remove } from "@features/tables/ordersSlice";
import { change as changeM } from "@features/tables/menuSlice";
import {
  add as addK,
  removeMany as removeManyK,
} from "@features/tables/kitchenSlice";
import { add as addCustomer } from "@features/people/customersSlice";
import helperNotification from "@helpers/helperNotification";
import {
  addKitchen,
  removeOrder,
  editUser,
  editReservation,
} from "@api";
import { edit as editRS } from "@features/zones/standardReservationsSlice";
import { edit as editRA } from "@features/zones/accommodationReservationsSlice";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import FullFilterDate from "@components/FullFilterDate";
import theme from "@theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const { light, dark } = theme();

const CreateOrder = ({ route, navigation }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const orders = useSelector((state) => state.orders);
  const menu = useSelector((state) => state.menu);
  const mode = useSelector((state) => state.mode);
  const customers = useSelector((state) => state.customers);
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
  const [order, setOrder] = useState(null);
  const [categorySelected, setCategorySelected] = useState({
    id: "everything",
    category: "Todos",
    subcategory: [],
  });
  const [subcategorySelected, setSubcategorySelected] = useState(null);
  const [groups, setGroups] = useState([]);

  const [keyCategory, setKeyCategory] = useState(Math.random());
  const [keySubcategory, setKeySubcategory] = useState(Math.random());

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

  const searchRef = useRef();

  const information = route.params;
  const reservation = route.params.reservation;
  const createClient = route.params?.createClient;

  const code = useRef(
    information?.invoice ? information?.invoice : random(6, { number: true })
  ).current;

  useEffect(() => {
    if (route.params.id) {
      setOrder(orders.find((o) => o.id === route.params.id));
    }
  }, []);

  const getTotal = ({ discount = 0, selection = [], tip = 0, tax = 0 }) => {
    const total =
      selection.reduce((a, b) => {
        const value = b.value * b.paid;
        const percentage = (value / b.total).toFixed(2);
        return a + (b.discount !== 0 ? value - b.discount * percentage : value);
      }, 0) +
      tip +
      tax;

    return discount !== 0 ? total - discount : total;
  };

  const createCustomer = async ({ callBack }) => {
    const clientID = random(20);
    const hosted = createClient?.hosted?.find(
      (h) => (h.id || h.owner) === route.params.ref
    );

    if (customers.find((c) => c.id === hosted.owner)) return await callBack();

    const data = {
      name: hosted.fullName,
      identification: hosted.identification,
    };
    data.id = clientID;
    data.type = "customer";
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(addCustomer(data));

    const newReservation = { ...createClient };
    const newHosted = { ...hosted, owner: clientID };

    if (createClient.type === "accommodation")
      dispatch(editRA({ id: hosted.id, data: newHosted }));
    if (createClient.type === "standard") {
      const reservationUpdated = createClient?.hosted.map((h) => {
        if ((h.id || h.owner) === route.params.ref)
          return { ...h, owner: clientID };
        return h;
      });
      newReservation.hosted = reservationUpdated;
      dispatch(editRS({ ref: createClient.ref, data: newReservation }));
    }

    await editReservation({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      reservation: {
        data: createClient.type === "standard" ? newReservation : [newHosted],
        type: createClient.type,
        createCustomer: data,
      },
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });

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

    if (orders.find((order) => order.id === id))
      return saveOrder({
        data: dat,
        completeSelection,
        totalPaid,
        currentSelection,
        back,
      });
    const data = {};
    const total = getTotal({
      discount: dat.discount,
      selection: completeSelection,
      tip: dat.tip,
      tax: dat.tax,
    });

    data.id = id;
    data.ref = route.params.ref;
    data.table = information.table;
    data.reservation = reservation;
    data.invoice = code;
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
        code,
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

      const change = {};
      if (dat.pay) change.menu = newMenu;

      await editUser({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        change: { ...change, orders: [...orders, data] },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    };

    if (createClient) createCustomer();
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
    const total = getTotal({
      discount: dat.discount,
      selection: completeSelection,
      tip: dat.tip,
      tax: dat.tax,
    });

    data.id = route.params.id;
    data.ref = route.params.ref;
    data.table = information.table;
    data.invoice = order?.invoice;
    data.reservation = reservation;
    data.selection = completeSelection;
    data.pay = dat.pay;
    data.discount = dat.discount || null;
    data.tax = dat.tax || null;
    data.tip = dat.tip || null;
    data.total = total;
    data.creationDate = order?.creationDate;
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
        code,
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

      const change = {};
      if (dat.pay) change.menu = newMenu;
      const newOrders = orders.map((order) => {
        if (order.id === data.id) return data;
        return order;
      });

      await editUser({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        change: { ...change, orders: newOrders },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    };

    if (createClient) createCustomer();
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
          dispatch(removeManyK({ ref: information.id }));
          dispatch(remove({ id: information.id }));
          navigation.pop();

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
    <Layout>
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
              <View style={styles.row}>
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
                              {item.recipe && (
                                <TextStyle
                                  verySmall
                                  color={
                                    mode === "light"
                                      ? light.textDark
                                      : dark.textWhite
                                  }
                                >
                                  {item.recipe.name.length > 12
                                    ? `${item.recipe.name
                                        .slice(0, 12)
                                        .toUpperCase()}...`
                                    : item.recipe.name.toUpperCase()}
                                </TextStyle>
                              )}
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
                              <View style={[styles.row, { flexWrap: "wrap" }]}>
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
                      code,
                      owner: route.params.ref,
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
              <View style={styles.row}>
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
              <View style={[styles.row, { marginTop: 15 }]}>
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
              <FullFilterDate
                title="Por fecha (CREACIÓN)"
                increment={5}
                defaultValue={{
                  day: filters.day,
                  month: filters.month,
                  year: filters.year,
                }}
                onChangeDay={(value) => setFilters({ ...filters, day: value })}
                onChangeMonth={(value) =>
                  setFilters({ ...filters, month: value })
                }
                onChangeYear={(value) =>
                  setFilters({ ...filters, year: value })
                }
              />
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  category: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 5,
    marginHorizontal: 2,
  },
});

export default CreateOrder;

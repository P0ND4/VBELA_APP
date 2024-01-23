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
import { add as addS } from "@features/sales/salesSlice";
import { change as changeP } from "@features/sales/productsSlice";
import { add as addE, edit as editE } from "@features/function/economySlice";
import { add as addCustomer } from "@features/people/customersSlice";
import { edit as editRS } from "@features/zones/standardReservationsSlice";
import { edit as editRA } from "@features/zones/accommodationReservationsSlice";
import { edit as editInv } from "@features/inventory/informationSlice";
import {
  editUser,
  editEconomy,
  addEconomy,
  addPerson,
  editReservation,
  discountInventory
} from "@api";
import { useNavigation } from "@react-navigation/native";
import FullFilterDate from "@components/FullFilterDate";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const { light, dark } = theme();

const Sales = ({ route }) => {
  const user = useSelector((state) => state.user);
  const inventory = useSelector(state => state.inventory);
  const helperStatus = useSelector((state) => state.helperStatus);
  const productsRef = useSelector((state) => state.products);
  const mode = useSelector((state) => state.mode);
  const sales = useSelector((state) => state.sales);
  const groupsREF = useSelector((state) => state.groups);
  const economy = useSelector((state) => state.economy);
  const customers = useSelector((state) => state.customers);

  const initialState = {
    active: false,
    minValue: "",
    maxValue: "",
    year: "all",
    month: "all",
    day: "all",
  };

  const [selection, setSelection] = useState([]);
  const [activeSearch, setActiveSearch] = useState(false);
  const [count, setCount] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(false);
  const [filters, setFilters] = useState(initialState);
  const [products, setProducts] = useState([]);
  const [categorySelected, setCategorySelected] = useState({
    id: "everything",
    category: "Todos",
    subcategory: [],
  });
  const [subcategorySelected, setSubcategorySelected] = useState(null);
  const [groups, setGroups] = useState([]);

  const [keyCategory, setKeyCategory] = useState(Math.random());
  const [keySubcategory, setKeySubcategory] = useState(Math.random());

  const code = useRef(random(6, { number: true })).current;

  useEffect(() => {
    setKeySubcategory(Math.random());
  }, [categorySelected]);

  useEffect(() => {
    const obj = { id: "everything", category: "Todos", subcategory: [] };
    const groups = [obj, ...groupsREF.filter((g) => g.type === "sales")];
    setKeyCategory(Math.random());
    if (categorySelected.id !== "everything") {
      const group = groupsREF.find((g) => g.id === categorySelected.id);
      if (!group) setCategorySelected(obj);
      else setCategorySelected(group);
    }
    setGroups(groups);
  }, [groupsREF]);

  const ref = route.params?.ref;
  const name = route.params?.name;
  const createClient = route.params?.createClient;

  const searchRef = useRef();
  const navigation = useNavigation();
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
    let p = [...productsRef].sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    if (search || filters.active || categorySelected.id !== "everything") {
      p = p.filter((p) => {
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

    if (p.length - 12 >= 0) {
      setProducts([...p, 0]);
    } else {
      const missing = -p.length + 12;
      let added = p;
      for (let i = 0; i < missing; i++) {
        added = [...added, i];
      }
      setProducts(added);
    }
  }, [productsRef, search, filters, categorySelected, subcategorySelected]);

  const manageEconomy = async ({ total, callBack, person }) => {
    const foundEconomy = economy.find((e) => e.ref === person?.id);
    const clientID = random(20);
    const hosted = createClient?.hosted?.find(
      (h) => (h.id || h.owner) === route.params.ref
    );
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
        //TODO  1
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

      await addPerson({
        //TODO  2
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        person: { type: "customer", data },
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
      await addEconomy({
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
    await callBack();
  };

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

  const inventoryDiscountHandler = async (selection) => {
    const ingredients = selection.flatMap((s) =>
      s.recipe?.ingredients.map((i) => {
        const iUpdate = { ...i };
        iUpdate.quantity *= s.count;
        return iUpdate;
      })
    );

    let inventories = [];

    for (let ingredient of ingredients) {
      const inv = inventory.find((i) => i.id === ingredient.id);
      const obj = {
        id: random(20),
        quantity: ingredient.quantity,
        creationDate: new Date().getTime(),
        currentValue: inv.currentValue,
        element: ingredient.id,
      };

      const validation = inventories.find((i) => i.id === ingredient.id);
      if (validation) {
        inventories = inventories.map((i) => {
          if (i.id === validation.id) {
            const newI = { ...i };
            newI.output = [...newI.output, obj];
            return newI;
          }
          return i;
        });
      } else {
        const output = [...inv.output, obj];
        inventories.push({ ...inv, output });
      }
    }

    for (let inventory of inventories) {
      dispatch(editInv({ id: inventory.id, data: inventory }));
    }

    await discountInventory({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      inventories,
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const saveOrder = async ({
    data: dat,
    completeSelection,
    totalPaid,
    currentSelection,
  }) => {
    const id = dat.ID ? dat.ID : random(20);

    const person =
      customers.find((p) => p.id === ref) ||
      customers.find((p) => p?.clientList?.some((c) => c.id === ref));

    if (sales.find((sale) => sale.id === id))
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
    data.ref = ref || null;
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
      navigation.setParams({ ref: null, name: null, createClient: null });
      dispatch(addS(data));
      setSelection([]);
      const newProducts = productsRef.map((p) => {
        const pc = { ...p };
        const found = selection.find((s) => s.id === p.id);
        if (found) {
          pc.quantity -= found.count;
          return pc;
        }
        return p;
      });
      dispatch(changeP(newProducts));
      if (dat.pay) navigation.pop();
      navigation.navigate("OrderCompletion", {
        code,
        selection: currentSelection,
        pay: data.pay,
        total: totalPaid,
        sales: true,
        extra: {
          discount: dat.discount || null,
          tax: dat.tax || null,
          tip: dat.tip || null,
        },
      });

      const selectionWithRecipe = selection.filter((c) => c.recipe);
      if (selectionWithRecipe.length && dat.pay)
        inventoryDiscountHandler(selectionWithRecipe);

      await editUser({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        change: {
          sales: [...sales, data],
          products: newProducts,
        },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    };

    if (person || createClient)
      await manageEconomy({ total, callBack: close, person });
    else close();
  };

  return (
    <Layout>
      <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={80}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ justifyContent: "space-between", flexGrow: 1 }}>
            {ref && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextStyle smallSubtitle color={light.main2}>
                  <TextStyle
                    smallSubtitle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Cliente:
                  </TextStyle>{" "}
                  {name.slice(0, 25)}
                  {name.length > 25 ? "..." : ""}
                </TextStyle>
                <TouchableOpacity
                  onPress={() =>
                    navigation.setParams({ ref: null, name: null })
                  }
                >
                  <Ionicons
                    style={{ marginLeft: 5 }}
                    name="close-circle"
                    size={getFontSize(24)}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                </TouchableOpacity>
              </View>
            )}
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
            <View>
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
                  style={{ marginLeft: 8 }}
                  onPress={() =>
                    navigation.navigate("CreateGroup", { type: "sales" })
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
            <View style={{ marginVertical: 10 }}>
              <ScrollView
                style={{ maxHeight: SCREEN_HEIGHT / 1.7 }}
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
                          return navigation.navigate("CreateProduct", {
                            sales: true,
                            editing: true,
                            item,
                            setSelection,
                            selection,
                          });

                        navigation.navigate("CreateProduct", { sales: true });
                      }}
                      onPress={() => {
                        if (item?.id) {
                          const index = selection.findIndex(
                            (s) => s.id === item.id
                          );

                          const object = {
                            ...item,
                            count,
                            total: item.value * count,
                            paid: 0,
                            discount: 0,
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
                        } else
                          navigation.navigate("CreateProduct", { sales: true });
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
                    "Precisa adicionar un producto/servicio al carrito para poder velor"
                  );
                else
                  navigation.navigate("PreviewOrder", {
                    selection,
                    setSelection,
                    sales: true,
                    saveOrder,
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
                defaultValue={{
                  day: filters.day,
                  month: filters.month,
                  year: filters.year,
                }}
                increment={5}
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

export default Sales;

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
import { add as addS } from "@features/sales/salesSlice";
import { change as changeP } from "@features/sales/productsSlice";
import { editUser } from "@api";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import { useNavigation } from "@react-navigation/native";

const SCREEN_HEIGHT = Dimensions.get("screen").height;
const SCREEN_WIDTH = Dimensions.get("screen").width;

const light = theme.colors.light;
const dark = theme.colors.dark;

const Sales = () => {
  const user = useSelector((state) => state.user);
  const activeGroup = useSelector((state) => state.activeGroup);
  const productsRef = useSelector((state) => state.products);
  const mode = useSelector((state) => state.mode);
  const sales = useSelector((state) => state.sales);

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

    if (search || filters.active) {
      p = p.filter((p) => {
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
  }, [productsRef, search, filters]);

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

  const saveOrder = async (dat, selection) => {
    const d = extractObject(dat);
    const id = d.ID ? d.ID : random(20);

    if (sales.find((sale) => sale.id === id)) return saveOrder(dat, selection);
    const data = {};
    const total = getTotal(d.discount, selection, d.tip, d.tax);

    data.id = id;
    data.selection = selection;
    data.pay = d.pay;
    data.discount = d.discount;
    data.tax = d.tax;
    data.tip = d.tip;
    data.method = d.method;
    data.total = total;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
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
    if (d.pay) navigation.pop();
    navigation.navigate("OrderCompletion", { data, total, sales: true });
    await editUser({
      identifier: activeGroup.active ? activeGroup.identifier : user.identifier,
      change: {
        sales: [...sales, data],
        products: newProducts
      },
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    })
  };

  return (
    <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
      <View>
        <View style={styles.title}>
          <TextStyle smallSubtitle color={light.main2}>
            SERVICIOS/PRODUCTOS
          </TextStyle>
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
                    const index = selection.findIndex((s) => s.id === item.id);

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
                  } else navigation.navigate("CreateProduct", { sales: true });
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
                  {!item?.id && index === productsRef.length && (
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

export default Sales;

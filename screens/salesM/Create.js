import { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TouchableNativeFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { getFontSize, thousandsSystem } from "@helpers/libs";
import Count from "@utils/order/components/Count";
import FrontPage from "@utils/product/FrontPage";
import Ionicons from "@expo/vector-icons/Ionicons";
import ButtonStyle from "@components/ButtonStyle";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import Filters from "@utils/order/Filters";
import Layout from "@components/Layout";
import theme from "@theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const { light, dark } = theme();

const Order = ({ route, navigation }) => {
  const groups = useSelector((state) => state.groups);
  const products = useSelector((state) => state.products);
  const mode = useSelector((state) => state.mode);

  const initialState = {
    active: false,
    minValue: "",
    maxValue: "",
    year: "all",
    month: "all",
    day: "all",
  };

  const [activeSearch, setActiveSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState(false);
  const [activeCount, setActiveCount] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialState);
  const [productsAndServices, setProductsAndServices] = useState(null);
  const [selection, setSelection] = useState([]);
  const [newSelection, setNewSelection] = useState([]);
  const [count, setCount] = useState(1);

  const [categorySelected, setCategorySelected] = useState({
    id: "everything",
    category: "Todos",
    subcategory: [],
  });
  const [subcategorySelected, setSubcategorySelected] = useState(null);
  const [categories, setCategories] = useState([]);

  const [keyCategory, setKeyCategory] = useState(Math.random());
  const [keySubcategory, setKeySubcategory] = useState(Math.random());

  const order = route.params?.order || null;
  const ref = route.params?.ref || null;
  const title = route.params?.title;
  const searchRef = useRef();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);
  const getBackgroundColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);

  useEffect(() => setKeySubcategory(Math.random()), [categorySelected]);

  useEffect(() => {
    const obj = { id: "everything", category: "Todos", subcategory: [] };
    const categories = [obj, ...groups.filter((g) => g.type === "sales")];
    setKeyCategory(Math.random());
    if (categorySelected.id !== "everything") {
      const group = groups.find((g) => g.id === categorySelected.id);
      setCategorySelected(group || obj);
    }
    setCategories(categories);
  }, [groups]);

  const dateValidation = (date) => {
    let error = false;
    if (filters.day !== "all" && date.getDate() !== filters.day) error = true;
    if (filters.month !== "all" && date.getMonth() + 1 !== filters.month) error = true;
    if (filters.year !== "all" && date.getFullYear() !== filters.year) error = true;
    return error;
  };

  useEffect(() => {
    let p = [...products].sort((a, b) => {
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
        if (categorySelected.id !== "everything" && !p.category.includes(categorySelected.id)) return;
        if (subcategorySelected && !p.subcategory.includes(subcategorySelected?.id)) return;
        if (
          convertText(p.name).includes(convertText(search)) ||
          convertText(p.identifier).includes(convertText(search)) ||
          p.value.toString().includes(convertText(search))
        ) {
          if (!filters.active) return p;

          if (dateValidation(new Date(p.creationDate))) return;
          if (filters.minValue && p.value < parseInt(filters.minValue.replace(/\D/g, ""))) return;
          if (filters.maxValue && p.value > parseInt(filters.maxValue.replace(/\D/g, ""))) return;

          return p;
        }
      });
    }

    if (p.length - 12 >= 0) setProductsAndServices([...p, 0]);
    else {
      const stuffed = Array(Math.max(0, 12 - p.length));
      setProductsAndServices([...p, ...stuffed.fill(null).map((_, i) => i)]);
    }
  }, [products, search, filters, categorySelected, subcategorySelected]);

  const changeSelection = (selection) => setSelection(selection);

  return (
    <Layout>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ justifyContent: "space-between", flexGrow: 1 }}>
            {title && (
              <View style={{ flexGrow: 1, marginBottom: 10 }}>
                <TextStyle smallSubtitle color={textColor}>
                  {title?.name}: {""}
                  <TextStyle smallSubtitle color={light.main2}>
                    {title?.value}
                  </TextStyle>
                </TextStyle>
              </View>
            )}
            <View style={[styles.row, { marginBottom: 10, flexGrow: 1 }]}>
              {!activeSearch && (
                <TouchableOpacity
                  onPress={() => {
                    setActiveSearch(true);
                    setTimeout(() => searchRef.current.focus());
                  }}
                >
                  <Ionicons name="search" size={getFontSize(21)} color={textColor} />
                </TouchableOpacity>
              )}
              {activeSearch && (
                <View style={[styles.row, { width: "100%" }]}>
                  <TouchableOpacity
                    onPress={() => {
                      setSearch("");
                      setActiveSearch(false);
                      setFilters(initialState);
                    }}
                  >
                    <Ionicons name="close" size={getFontSize(24)} color={textColor} />
                  </TouchableOpacity>
                  <InputStyle
                    innerRef={searchRef}
                    placeholder="Producto, valor"
                    value={search}
                    onChangeText={(text) => setSearch(text)}
                    stylesContainer={{ width: "78%", marginVertical: 0 }}
                    stylesInput={styles.searchInput}
                  />
                  <TouchableOpacity onPress={() => setActiveFilter(!activeFilter)}>
                    <Ionicons name="filter" size={getFontSize(24)} color={light.main2} />
                  </TouchableOpacity>
                </View>
              )}
              {!activeSearch && (
                <TouchableOpacity
                  style={[styles.count, { borderColor: textColor }]}
                  onPress={() => setActiveCount(!activeCount)}
                >
                  <TextStyle verySmall color={textColor}>
                    {count} X
                  </TextStyle>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ marginVertical: 8 }}>
              <View style={styles.row}>
                <FlatList
                  key={keyCategory}
                  data={categories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const categoryID = categorySelected.id;
                    const background = categoryID === item.id ? light.main2 : backgroundColor;
                    const text = categoryID === item.id ? light.textDark : textColor;

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
                        style={[styles.category, { backgroundColor: background }]}
                      >
                        <TextStyle smallParagraph color={text}>
                          {item.category}
                        </TextStyle>
                      </TouchableOpacity>
                    );
                  }}
                />
                <TouchableOpacity onPress={() => navigation.navigate("CreateGroup", { type: "sales" })}>
                  <Ionicons name="add-circle" color={light.main2} size={getFontSize(24)} />
                </TouchableOpacity>
              </View>

              <FlatList
                key={keySubcategory}
                data={categorySelected?.subcategory}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: categorySelected?.subcategory.length ? 8 : 0 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const background = subcategorySelected === item ? light.main2 : backgroundColor;
                  const text = subcategorySelected === item ? light.textDark : textColor;

                  return (
                    <TouchableOpacity
                      onPress={() =>
                        setSubcategorySelected(subcategorySelected?.id === item.id ? null : item)
                      }
                      onLongPress={() =>
                        navigation.navigate("CreateGroup", {
                          editing: true,
                          item: categorySelected,
                        })
                      }
                      style={[styles.category, { backgroundColor: background }]}
                    >
                      <TextStyle smallParagraph color={text}>
                        {item.subcategory}
                      </TextStyle>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            <ScrollView
              horizontal
              contentContainerStyle={{ alignItems: "center" }}
              scrollEnabled={false}
            >
              <FlatList
                data={productsAndServices || []}
                style={{ height: SCREEN_HEIGHT / 1.87, marginVertical: 5 }}
                keyExtractor={(item) => item.id || item}
                numColumns={3}
                initialNumToRender={6}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableNativeFeedback
                      onLongPress={() => {
                        if (item.id)
                          return navigation.navigate("CreateProduct", {
                            sales: true,
                            editing: true,
                            item,
                            setSelection,
                            selection,
                          });

                        navigation.navigate("CreateProduct", {
                          sales: true,
                          setSelection,
                          selection,
                        });
                      }}
                      onPress={() => {
                        if (item?.id) {
                          const updateSelections = (selections) => {
                            const found = selections.find((s) => s.id === item.id);
                            if (found) {
                              const quantity = found.quantity + count;
                              const updated = { ...found, quantity, total: quantity * found.price };
                              return selections.map((s) => (s.id === item.id ? updated : s));
                            } else {
                              const obj = {
                                id: item.id,
                                name: item.name,
                                total: item.value,
                                price: item.value,
                                recipe: item.recipe,
                                quantity: count,
                                paid: 0,
                                discount: null,
                                observation: null,
                                method: [],
                                status: null,
                              };
                              return [...selections, obj];
                            }
                          };

                          setSelection(updateSelections(selection));
                          setNewSelection(updateSelections(newSelection));
                        } else navigation.navigate("CreateProduct", { sales: true });
                      }}
                    >
                      <View style={[styles.catalogue, { backgroundColor }]}>
                        {item.id && (
                          <FrontPage
                            name={item.name}
                            quantity={item.quantity}
                            reorder={item.reorder}
                            value={item.value}
                            unit={item.unit}
                            identifier={item.identifier}
                            recipe={item.recipe}
                          />
                        )}
                        {!item?.id &&
                          index === productsAndServices.filter((p) => typeof p !== "number").length && (
                            <Ionicons
                              name="add"
                              size={getFontSize(45)}
                              color={mode === "light" ? "#BBBBBB" : dark.main1}
                            />
                          )}
                      </View>
                    </TouchableNativeFeedback>
                  );
                }}
              />
            </ScrollView>

            <View style={{ flexGrow: 1, justifyContent: "flex-end" }}>
              {order?.editing && (
                <ButtonStyle backgroundColor={light.main2} /*onPress={() => removeO()}*/>
                  <TextStyle center smallParagraph>
                    Eliminar pedido
                  </TextStyle>
                </ButtonStyle>
              )}
              <ButtonStyle
                backgroundColor="transparent"
                style={{ borderWidth: 2, borderColor: light.main2 }}
                onPress={() => {
                  if (selection.length === 0)
                    Alert.alert(
                      "El carrito está vacío",
                      "Precisa adicionar un producto al carrito para poder velor"
                    );
                  else
                    navigation.navigate("SalesPreviewOrder", { ref, order, selection, changeSelection });
                }}
              >
                {(() => {
                  const filtered = selection.filter((s) => s.count !== s.paid);

                  return (
                    <TextStyle color={light.main2} center smallParagraph>
                      {selection.length === 0
                        ? "Ningún ítem"
                        : `${thousandsSystem(
                            filtered.reduce((a, b) => a + b.quantity - b.paid, 0)
                          )} ítem = ${thousandsSystem(
                            filtered.reduce(
                              (a, b) => a + (b.quantity - b.paid) * b.price * (1 - b.discount || 0),
                              0
                            )
                          )}`}
                    </TextStyle>
                  );
                })()}
              </ButtonStyle>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Count
        key={activeCount}
        title="MULTIPLICADOR"
        description="Aumente el multiplicador para una mayor facilidad de selección de productos"
        placeholder="Multiplicador"
        modalVisible={activeCount}
        setModalVisible={setActiveCount}
        initialCount={count}
        onSubmit={(count) => setCount(Math.max(count, 1))}
      />
      <Filters
        setActive={setActiveFilter}
        active={activeFilter}
        filters={filters}
        setFilters={setFilters}
        initialState={initialState}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  outline: {
    borderWidth: 2,
    borderColor: light.main2,
  },
  searchInput: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 18,
  },
  count: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  catalogue: {
    borderRadius: 5,
    margin: 2,
    height: SCREEN_WIDTH / 3.5,
    width: SCREEN_WIDTH / 3.5,
    justifyContent: "center",
    alignItems: "center",
  },
  category: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 5,
    marginHorizontal: 2,
  },
});

export default Order;

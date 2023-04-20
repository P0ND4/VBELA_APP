import { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import {
  View,
  StyleSheet,
  Dimensions,
  //FlatList,
  TouchableOpacity,
  TouchableNativeFeedback,
  ScrollView,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "./TextStyle";
import ButtonStyle from "./ButtonStyle";
import InputStyle from "./InputStyle";
import theme from "../theme";
import { thousandsSystem, random } from "../helpers/libs";
import {
  add as addMu,
  edit as editMu,
  remove as removeMu,
} from "../features/tables/menuSlice";
import {
  add as addO,
  remove as deleteO,
  edit as editO,
} from "../features/tables/ordersSlice";
import {
  addOrder,
  editOrder,
  removeOrder,
  addMenu,
  editMenu,
  removeMenu,
} from "../api";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT;

const Menu = ({ active, information, setActive }) => {
  const {
    register: registerProduct,
    setValue: setValueProduct,
    formState: { errors: errorsProduct },
    handleSubmit: handleSubmitProduct,
  } = useForm();

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const activeGroup = useSelector((state) => state.activeGroup);
  const mode = useSelector((state) => state.mode);
  const section = useSelector((state) => state.section);
  const menu = useSelector((state) => state.menu);
  const orders = useSelector((state) => state.orders);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const [route, setRoute] = useState("main");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [pending, setPending] = useState(false);
  const [buy, setBuy] = useState([]);

  const [selection, setSelection] = useState([]);
  const [calculator, setCalculator] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");

  const [isEditingProduct, setIsEditingProduct] = useState({
    id: null,
    editing: false,
  });

  useEffect(() => {
    registerProduct("name", { value: "", required: true });
    registerProduct("price", { value: "", required: true });
  }, []);

  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (menu.length - 12 >= 0) {
      setProducts([...menu, null]);
    } else {
      const missing = -menu.length + 12;
      let added = menu;
      for (let i = 0; i < missing; i++) {
        added = [...added, i];
      }
      setProducts(added);
    }
  }, [menu]);

  useEffect(() => {
    setGroups(["Todos", ...section]);
  }, [section]);

  const scrollTo = useCallback((destination) => {
    "worklet";
    translateY.value = withSpring(destination, { damping: 50 });
  }, []);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
    })
    .onEnd(() => {
      if (translateY.value > -SCREEN_HEIGHT / 1.2) {
        scrollTo(0);
      } else if (translateY.value < -SCREEN_HEIGHT / 2) {
        scrollTo(MAX_TRANSLATE_Y);
      }
    });

  const rBottonSheetStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
      [25, 5],
      Extrapolate.CLAMP
    );
    return {
      borderRadius,
      transform: [{ translateY: translateY.value }],
    };
  });

  const clean = () => {
    setBuy([]);
    setRoute("main");
    setPending(false);
    setSelection([]);
    setCalculator("");
    setPaymentMethod("Efectivo");
  };

  useEffect(() => {
    if (active) {
      if (information.editing) {
        setRoute("pay");
        setSelection(information.selection);
      } else clean();
      scrollTo(MAX_TRANSLATE_Y);
    }
    return () => setActive(false);
  }, [active]);

  const CreateGroup = () => {
    return (
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <TouchableOpacity onPress={() => setRoute("main")}>
            <Ionicons
              name="arrow-back"
              size={35}
              color={light.main2}
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
          <TextStyle
            smallSubtitle
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            Crear grupo
          </TextStyle>
        </View>
        <InputStyle placeholder="Nombre del grupo " />
        <ButtonStyle
          backgroundColor="transparent"
          style={{
            borderWidth: 2,
            borderColor: light.main2,
          }}
          onPress={() => setRoute("main")}
        >
          <TextStyle color={light.main2}>Crear grupo</TextStyle>
        </ButtonStyle>
      </View>
    );
  };

  const cleanCreateProduct = () => {
    setRoute("main");
    setName("");
    setPrice("");
    setValueProduct("name", "");
    setValueProduct("price", "");
  };

  const addProduct = async (data) => {
    const id = random(20);
    if (menu.find((m) => m.id === id)) return addProduct(data);

    data.id = id;
    data.group = null;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();

    dispatch(addMu(data));
    cleanCreateProduct();
    await addMenu({
      email: activeGroup.active ? activeGroup.email : user.email,
      menu: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const editProduct = async (data) => {
    data.id = isEditingProduct.item.id;
    data.group = null;
    data.creationDate = isEditingProduct.item.creationDate;
    data.modificationDate = new Date().getTime();

    dispatch(editMu({ id: isEditingProduct.item.id, data }));
    setSelection(selection.filter((s) => s.id !== isEditingProduct.item.id));
    cleanCreateProduct();
    setIsEditingProduct({ item: null, editing: false });
    await editMenu({
      email: activeGroup.active ? activeGroup.email : user.email,
      menu: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const removeProduct = async () => {
    Alert.alert("Eliminar", "¿Esta seguro que desea eliminar el producto?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Si",
        onPress: async () => {
          dispatch(removeMu({ id: isEditingProduct.item.id }));
          setSelection(
            selection.filter((s) => s.id !== isEditingProduct.item.id)
          );
          cleanCreateProduct();
          setIsEditingProduct({ item: null, editing: false });
          await removeMenu({
            email: activeGroup.active ? activeGroup.email : user.email,
            id: isEditingProduct.item.id,
            groups: activeGroup.active
              ? [activeGroup.id]
              : user.helpers.map((h) => h.id),
          });
        },
      },
    ]);
  };

  const saveOrder = async (pay) => {
    const id = random(20);
    if (orders.find((order) => order.id === id)) return onSubmitCreate(data);
    const data = {};

    data.id = id;
    data.ref = information.ref;
    data.buy = buy;
    data.selection = selection;
    data.pay = pay;
    data.method = paymentMethod;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();
    dispatch(addO(data));

    setRoute("bought");
    await addOrder({
      email: activeGroup.active ? activeGroup.email : user.email,
      order: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const updateOrder = async (pay) => {
    const data = {};

    data.id = information.id;
    data.ref = information.ref;
    data.buy = buy;
    data.selection = selection;
    data.pay = pay;
    data.method = paymentMethod;
    data.creationDate = information.creationDate;
    data.modificationDate = new Date().getTime();
    dispatch(editO({ id: information.id, data }));
    setRoute("bought");
    await editOrder({
      email: activeGroup.active ? activeGroup.email : user.email,
      order: data,
      groups: activeGroup.active
        ? [activeGroup.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const removeO = async () => {
    Alert.alert("Eliminar", "¿Desea eliminar la orden?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Si",
        onPress: async () => {
          dispatch(deleteO({ id: information.id }));
          clean();
          scrollTo(0);
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

  const numericKeyboardEvent = (num) => {
    const calculatorString = calculator.replace(/[^0-9]/g, "");

    if (num !== "backspace") {
      if (calculatorString.length <= 12) {
        if (calculatorString === "0") setCalculator(JSON.stringify(num));
        else setCalculator(thousandsSystem(calculatorString + num));
      }
    } else {
      const substring = calculatorString.slice(0, calculatorString.length - 1);

      if (!substring) setCalculator("0");
      else setCalculator(thousandsSystem(substring));
    }
  };

  useEffect(() => {
    setBuy([]);
    let buy = [];

    for (let s of selection) {
      const b = buy.findIndex((b) => b.id === s.id);

      if (b !== -1) {
        buy[b].count += 1;
        buy[b].total += s.price;
      } else buy.push({ ...s, count: 1, total: s.price });
    }

    setBuy(buy);
  }, [selection]);

  return (
    <Animated.View
      style={[
        styles.bottomSheetContainer,
        rBottonSheetStyle,
        { backgroundColor: mode === "light" ? "#FFF" : dark.main1 },
      ]}
    >
      <GestureDetector gesture={gesture}>
        <View
          style={{
            width: "100%",
            height: 60,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={[
              styles.line,
              { backgroundColor: mode === "light" ? light.main5 : dark.main2 },
            ]}
          />
        </View>
      </GestureDetector>
      <View
        style={{
          paddingHorizontal: 20,
          justifyContent: "space-between",
          height: SCREEN_HEIGHT / 1.2,
        }}
      >
        {route === "main" && (
          <>
            {/*<View style={styles.header}>
              <FlatList
                data={groups}
                keyExtractor={(item) => item}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity>
                    <TextStyle
                      customStyle={[
                        styles.textHeader,
                        {
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        },
                      ]}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      {item}
                    </TextStyle>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                onPress={() => setRoute("createGroup")}
                style={{ marginLeft: 5 }}
              >
                <Ionicons name="add-circle" size={35} color={light.main2} />
              </TouchableOpacity>
            </View>*/}
            <View>
              <View style={styles.title}>
                <TextStyle
                  smallSubtitle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Mesa:{" "}
                  <TextStyle smallSubtitle color={light.main2}>
                    {information.table}
                  </TextStyle>
                </TextStyle>

                <TextStyle
                  bigParagraph
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  PEDIDOS
                </TextStyle>
              </View>
            </View>
            <View style={{ marginVertical: 10 }}>
              <ScrollView
                style={{ height: SCREEN_HEIGHT / 1.6 }}
                contentContainerStyle={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                {products.map((item, index) => {
                  return (
                    <TouchableNativeFeedback
                      key={item.id ? item.id : item}
                      onLongPress={() => {
                        if (item.id) {
                          setIsEditingProduct({ item, editing: true });
                          setValueProduct('name', item.name);
                          setValueProduct('price', item.price);
                          setName(item.name);
                          setPrice(thousandsSystem(item.price));
                        }
                        setRoute("createCatalogue");
                      }}
                      onPress={() =>
                        item?.id
                          ? setSelection([...selection, item])
                          : setRoute("createCatalogue")
                      }
                    >
                      <View
                        style={[
                          styles.catalogue,
                          {
                            backgroundColor:
                              mode === "light" ? light.main4 : dark.main2,
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
                                color={
                                  mode === "light"
                                    ? light.textDark
                                    : dark.textWhite
                                }
                              >
                                {item.name.slice(0, 8)}
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
                              <TextStyle smallParagraph>
                                {item.name.slice(0, 8)}
                              </TextStyle>
                              <TextStyle smallParagraph>
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
                  else setRoute("createOrder");
                }}
              >
                <TextStyle color={light.main2}>
                  {selection.length === 0
                    ? "Ningún ítem"
                    : `${selection.length} ítem = ${thousandsSystem(
                        selection.reduce((a, b) => a + b.price, 0)
                      )}`}
                </TextStyle>
              </ButtonStyle>
            </View>
          </>
        )}
        {route === "createCatalogue" && (
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  cleanCreateProduct();
                  setIsEditingProduct({ item: null, editing: false });
                }}
              >
                <Ionicons
                  name="arrow-back"
                  size={35}
                  color={light.main2}
                  style={{ marginLeft: 5 }}
                />
              </TouchableOpacity>
              <TextStyle
                smallSubtitle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Nuevo producto
              </TextStyle>
            </View>
            <View style={{ alignItems: "center" }}>
              <View
                style={[
                  styles.catalogueCard,
                  {
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                  },
                ]}
              >
                <View
                  style={{
                    height: "60%",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 14,
                  }}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {!name ? "Nombre" : name.slice(0, 8)}
                  </TextStyle>
                </View>
                <View style={styles.footerCatalogue}>
                  <TextStyle smallParagraph>
                    {!name
                      ? "Nombre"
                      : name.length > 18
                      ? name.slice(0, 16) + "..."
                      : name}
                  </TextStyle>
                  <TextStyle smallParagraph>{!price ? "0" : price}</TextStyle>
                </View>
              </View>
              <View style={{ marginTop: 20, width: "100%" }}>
                <InputStyle
                  value={name}
                  onChangeText={(text) => {
                    setValueProduct("name", text);
                    setName(text);
                  }}
                  maxLength={60}
                  placeholder="Nombre del producto"
                />
                {errorsProduct.name?.type && (
                  <TextStyle verySmall color={light.main2}>
                    El nombre es requerido
                  </TextStyle>
                )}
                <InputStyle
                  value={price}
                  placeholder="Precio"
                  maxLength={15}
                  keyboardType="numeric"
                  onChangeText={(num) => {
                    setValueProduct(
                      "price",
                      parseInt(num.replace(/[^0-9]/g, ""))
                    );
                    setPrice(thousandsSystem(num.replace(/[^0-9]/g, "")));
                  }}
                />
                {errorsProduct.price?.type && (
                  <TextStyle verySmall color={light.main2}>
                    El precio es requerido
                  </TextStyle>
                )}
              </View>
            </View>
            <View>
              {isEditingProduct.editing && (
                <ButtonStyle
                  backgroundColor="transparent"
                  style={{
                    marginTop: 10,
                    borderWidth: 2,
                    borderColor: light.main2,
                  }}
                  onPress={() => removeProduct()}
                >
                  <TextStyle color={light.main2}>Eliminar pedido</TextStyle>
                </ButtonStyle>
              )}
              <ButtonStyle
                backgroundColor="transparent"
                style={{
                  borderWidth: 2,
                  borderColor: light.main2,
                }}
                onPress={handleSubmitProduct(
                  !isEditingProduct.editing ? addProduct : editProduct
                )}
              >
                <TextStyle color={light.main2}>
                  {!isEditingProduct.editing ? "Añadir producto" : "Guardar"}
                </TextStyle>
              </ButtonStyle>
            </View>
          </View>
        )}
        {route === "createOrder" && (
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <TouchableOpacity onPress={() => setRoute("main")}>
                  <Ionicons
                    name="arrow-back"
                    size={35}
                    color={light.main2}
                    style={{ marginLeft: 5 }}
                  />
                </TouchableOpacity>
                <TextStyle
                  smallSubtitle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Carrito
                </TextStyle>
              </View>
              {buy.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.chosenProduct,
                    {
                      backgroundColor:
                        mode === "light" ? light.main4 : dark.main2,
                    },
                  ]}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    <TextStyle color={light.main2}>
                      {thousandsSystem(item.count)}
                    </TextStyle>
                    x {item.name.slice(0, 8)}
                  </TextStyle>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {thousandsSystem(item.total)}
                  </TextStyle>
                </View>
              ))}
              <View style={{ alignItems: "flex-end", marginTop: 20 }}>
                <TouchableOpacity onPress={() => {}}>
                  <TextStyle color={light.main2}>Dar descuento</TextStyle>
                </TouchableOpacity>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  TOTAL: {thousandsSystem(buy.reduce((a, b) => a + b.total, 0))}
                </TextStyle>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  padding: 4,
                  borderRadius: 8,
                  marginRight: 10,
                  borderWidth: 2,
                  borderColor: light.main2,
                }}
                onPress={() => {
                  Alert.alert(
                    "Limpiar carrito",
                    "¿Estás seguro que quieres limipiar el carrito?",
                    [
                      {
                        text: "No",
                        style: "cancel",
                      },
                      {
                        text: "Si",
                        onPress: () => {
                          setSelection([]);
                          setRoute("main");
                        },
                      },
                    ]
                  );
                }}
              >
                <Ionicons name="trash" size={32} color={light.main2} />
              </TouchableOpacity>
              <ButtonStyle
                backgroundColor="transparent"
                style={{
                  borderWidth: 2,
                  borderColor: light.main2,
                  width: "85%",
                }}
                onPress={() => setRoute("pay")}
              >
                <TextStyle color={light.main2}>Avanzar</TextStyle>
              </ButtonStyle>
            </View>
          </View>
        )}
        {route === "pay" && (
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <TouchableOpacity onPress={() => setRoute("createOrder")}>
                <Ionicons
                  name="arrow-back"
                  size={35}
                  color={light.main2}
                  style={{ marginLeft: 5 }}
                />
              </TouchableOpacity>
              <TextStyle
                smallSubtitle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Pago
              </TextStyle>
            </View>
            <View style={{ alignItems: "center" }}>
              <TextStyle
                title
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {thousandsSystem(buy.reduce((a, b) => a + b.total, 0))}
              </TextStyle>
              <ButtonStyle
                backgroundColor="transparent"
                style={{
                  marginTop: 10,
                  borderWidth: 2,
                  borderColor: light.main2,
                  width: "40%",
                }}
                onPress={() => {
                  setPending(true);
                  if (information.editing) updateOrder(false);
                  else saveOrder(false);
                }}
              >
                <TextStyle smallParagraph color={light.main2}>
                  Guardar pedido
                </TextStyle>
              </ButtonStyle>
              {information.editing && (
                <ButtonStyle
                  backgroundColor={light.main2}
                  style={{ width: "40%" }}
                  onPress={() => removeO()}
                >
                  <TextStyle smallParagraph>Eliminar pedido</TextStyle>
                </ButtonStyle>
              )}
            </View>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={() => setPaymentMethod("Efectivo")}
                  style={[
                    styles.payOptions,
                    {
                      backgroundColor:
                        paymentMethod === "Efectivo"
                          ? light.main2
                          : mode === "light"
                          ? light.main5
                          : dark.main2,
                    },
                  ]}
                >
                  <Ionicons
                    name="cash"
                    size={35}
                    color={
                      paymentMethod !== "Efectivo"
                        ? light.main2
                        : light.textDark
                    }
                    style={{ marginLeft: 5 }}
                  />
                  <TextStyle
                    smallParagraph
                    customStyle={{ marginTop: 4 }}
                    color={
                      paymentMethod !== "Efectivo"
                        ? light.main2
                        : light.textDark
                    }
                  >
                    Efectivo
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.payOptions,
                    {
                      backgroundColor:
                        paymentMethod === "Tarjeta"
                          ? light.main2
                          : mode === "light"
                          ? light.main5
                          : dark.main2,
                    },
                  ]}
                  onPress={() => setPaymentMethod("Tarjeta")}
                >
                  <Ionicons
                    name="card"
                    size={35}
                    color={
                      paymentMethod !== "Tarjeta" ? light.main2 : light.textDark
                    }
                    style={{ marginLeft: 5 }}
                  />
                  <TextStyle
                    smallParagraph
                    customStyle={{ marginTop: 4 }}
                    color={
                      paymentMethod !== "Tarjeta" ? light.main2 : light.textDark
                    }
                  >
                    Tarjeta
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.payOptions,
                    {
                      backgroundColor:
                        paymentMethod === "Otros"
                          ? light.main2
                          : mode === "light"
                          ? light.main5
                          : dark.main2,
                    },
                  ]}
                  onPress={() => setPaymentMethod("Otros")}
                >
                  <Ionicons
                    name="browsers"
                    size={35}
                    color={
                      paymentMethod !== "Otros" ? light.main2 : light.textDark
                    }
                    style={{ marginLeft: 5 }}
                  />
                  <TextStyle
                    smallParagraph
                    customStyle={{ marginTop: 4 }}
                    color={
                      paymentMethod !== "Otros" ? light.main2 : light.textDark
                    }
                  >
                    Otros
                  </TextStyle>
                </TouchableOpacity>
              </View>
              <ButtonStyle
                backgroundColor="transparent"
                style={{
                  marginTop: 20,
                  borderWidth: 2,
                  borderColor: light.main2,
                }}
                onPress={() => {
                  setCalculator(
                    thousandsSystem(buy.reduce((a, b) => a + b.total, 0))
                  );
                  setRoute("finish");
                }}
              >
                <TextStyle color={light.main2}>Avanzar</TextStyle>
              </ButtonStyle>
            </View>
          </View>
        )}
        {route === "finish" && (
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity onPress={() => setRoute("pay")}>
                <Ionicons
                  name="arrow-back"
                  size={35}
                  color={light.main2}
                  style={{ marginLeft: 5 }}
                />
              </TouchableOpacity>
              <TextStyle
                smallSubtitle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Pago: {paymentMethod}
              </TextStyle>
            </View>
            <View style={{ alignItems: "center" }}>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                VALOR RECIBIDO
              </TextStyle>
              <TextStyle
                title
                customStyle={{ marginVertical: 5 }}
                color={light.main2}
              >
                {calculator}
              </TextStyle>
              {parseInt(calculator.replace(/[^0-9]/g, "")) !==
                buy.reduce((a, b) => a + b.total, 0) && (
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {parseInt(calculator.replace(/[^0-9]/g, "")) -
                    buy.reduce((a, b) => a + b.total, 0) <
                  0
                    ? `Debe: ${thousandsSystem(
                        (parseInt(calculator.replace(/[^0-9]/g, "")) -
                          buy.reduce((a, b) => a + b.total, 0)) *
                          -1
                      )}`
                    : `Vuelto: ${thousandsSystem(
                        parseInt(calculator.replace(/[^0-9]/g, "")) -
                          buy.reduce((a, b) => a + b.total, 0)
                      )}`}
                </TextStyle>
              )}
            </View>
            <View style={{ alignItems: "center" }}>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
                customStyle={{
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  padding: 5,
                  width: "100%",
                }}
                center
              >
                {thousandsSystem(buy.reduce((a, b) => a + b.total, 0))}
              </TextStyle>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                  onPress={() => numericKeyboardEvent(1)}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    1
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                  onPress={() => numericKeyboardEvent(2)}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    2
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                  onPress={() => numericKeyboardEvent(3)}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    3
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                  onPress={() => numericKeyboardEvent(4)}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    4
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                  onPress={() => numericKeyboardEvent(5)}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    5
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                  onPress={() => numericKeyboardEvent(6)}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    6
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                  onPress={() => numericKeyboardEvent(7)}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    7
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                  onPress={() => numericKeyboardEvent(8)}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    8
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                  onPress={() => numericKeyboardEvent(9)}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    9
                  </TextStyle>
                </TouchableOpacity>
                <View
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                  onPress={() => numericKeyboardEvent(0)}
                >
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    0
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.numericKeyboardItem,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                  onPress={() => numericKeyboardEvent("backspace")}
                >
                  <Ionicons
                    name="backspace-outline"
                    size={32}
                    color={light.main2}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <ButtonStyle
                style={{ backgroundColor: light.main2 }}
                onPress={() => {
                  setPending(true);
                  if (information.editing) updateOrder(false);
                  else saveOrder(false);
                }}
              >
                <TextStyle>Guardar pedido</TextStyle>
              </ButtonStyle>
              <ButtonStyle
                backgroundColor="transparent"
                style={{
                  borderWidth: 2,
                  borderColor: light.main2,
                }}
                onPress={() => {
                  if (information.editing) updateOrder(true);
                  else saveOrder(true);
                }}
              >
                <TextStyle color={light.main2}>
                  Finalizar{" "}
                  {thousandsSystem(buy.reduce((a, b) => a + b.total, 0))}
                </TextStyle>
              </ButtonStyle>
            </View>
          </View>
        )}
        {route === "bought" && (
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View />
            <View style={{ alignItems: "center" }}>
              <Ionicons
                name={pending ? "time-outline" : "checkmark-circle-outline"}
                size={180}
                color={light.main2}
              />
              <TextStyle
                bigParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {pending ? "Pedido registrado" : "Hecho"}
              </TextStyle>
              <TextStyle
                smallTitle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {pending
                  ? thousandsSystem(buy.reduce((a, b) => a + b.total, 0))
                  : calculator}
              </TextStyle>
              {parseInt(calculator.replace(/[^0-9]/g, "")) !==
                buy.reduce((a, b) => a + b.total, 0) &&
                calculator && (
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {parseInt(calculator.replace(/[^0-9]/g, "")) -
                      buy.reduce((a, b) => a + b.total, 0) <
                    0
                      ? `Debía: ${thousandsSystem(
                          (parseInt(calculator.replace(/[^0-9]/g, "")) -
                            buy.reduce((a, b) => a + b.total, 0)) *
                            -1
                        )}`
                      : `Vuelto: ${thousandsSystem(
                          parseInt(calculator.replace(/[^0-9]/g, "")) -
                            buy.reduce((a, b) => a + b.total, 0)
                        )}`}
                  </TextStyle>
                )}
            </View>
            <ButtonStyle
              backgroundColor="transparent"
              style={{
                borderWidth: 2,
                borderColor: light.main2,
              }}
              onPress={() => {
                clean();
                scrollTo(0);
              }}
            >
              <TextStyle color={light.main2}>Buscar otra mesa</TextStyle>
            </ButtonStyle>
          </View>
        )}
        {route === "createGroup" && <CreateGroup />}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: "100%",
    position: "absolute",
    top: SCREEN_HEIGHT,
    borderRadius: 25,
  },
  line: {
    width: Math.floor(SCREEN_WIDTH / 5.2),
    height: Math.floor(SCREEN_HEIGHT / 190),
    borderRadius: 2,
  },
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
  catalogue: {
    borderRadius: 5,
    margin: 2,
    height: Math.floor(SCREEN_WIDTH / 3.5),
    width: Math.floor(SCREEN_WIDTH / 3.5),
    justifyContent: "center",
    alignItems: "center",
  },
  catalogueCard: {
    width: Math.floor(SCREEN_WIDTH / 3),
    height: Math.floor(SCREEN_WIDTH / 3),
    borderRadius: 5,
  },
  chosenProduct: {
    marginVertical: 2,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  payOptions: {
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: Math.floor(SCREEN_WIDTH / 3.8),
    height: Math.floor(SCREEN_WIDTH / 5),
    marginHorizontal: 5,
  },
  numericKeyboardItem: {
    width: Math.floor(SCREEN_WIDTH / 3.5),
    height: Math.floor(SCREEN_WIDTH / 5.5),
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
  },
  footerCatalogue: {
    height: "40%",
    justifyContent: "center",
    backgroundColor: light.main2,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    paddingHorizontal: 14,
  },
});

export default Menu;

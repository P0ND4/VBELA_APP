import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { thousandsSystem, random, getFontSize, print } from "@helpers/libs";
import { updateMany as updateManyInventory } from "@features/inventory/informationSlice";
import { add as addS } from "@features/sales/salesSlice";
import { change as changeP } from "@features/sales/productsSlice";
import { editUser, discountInventory } from "@api";
import Card from "@utils/order/preview/Card";
import PaymentButtons from "@components/PaymentButtons";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Layout from "@components/Layout";
import Count from "@utils/order/components/Count";
import Observation from "@utils/order/components/Observation";
import Percentage from "@utils/order/components/Percentage";
import getHTML from "@utils/order/helpers/getHTML";
import theme from "@theme";

const { light, dark } = theme();
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Preview = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const products = useSelector((state) => state.products);
  const invoice = useSelector((state) => state.invoice);
  const sales = useSelector((state) => state.sales);
  const user = useSelector((state) => state.user);
  const customers = useSelector((state) => state.customers);
  const inventory = useSelector((state) => state.inventory);
  const helperStatus = useSelector((state) => state.helperStatus);

  const [total, setTotal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  const [countSettings, setCountSettings] = useState(null);
  const [countVisible, setCountVisible] = useState(false);

  const [observationSettings, setObservationSettings] = useState(null);
  const [observationVisible, setObservationVisible] = useState(false);

  const [percentageSettings, setPercentageSettings] = useState(null);
  const [percentageVisible, setPercentageVisble] = useState(false);

  const [discount, setDiscount] = useState(null);
  const [tip, setTip] = useState(null);
  const [tax, setTax] = useState(null);

  const [previews, setPreviews] = useState(null);

  const [methodType, setMethodType] = useState("others");

  const ref = route.params?.ref;
  const order = route.params?.order;
  const selection = route.params.selection;
  const changeSelection = route.params?.changeSelection;

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const code = useRef(random(6, { number: true, upperCase: true })).current;
  const dispatch = useDispatch();

  useEffect(() => setPreviews(selection), [selection]);

  useEffect(
    () =>
      customers.find((c) => c.id === ref || c?.clientList?.some((cs) => cs.id === ref)) &&
      setMethodType("credit"),
    [ref, customers]
  );

  useEffect(() => {
    let total = previews?.reduce(
      (a, b) => a + (b.quantity - b.paid) * b.price * (1 - b.discount || 0),
      0
    );
    if (discount) total *= 1 - discount;
    if (tip) total *= 1 + tip;
    if (tax) total *= 1 + tax;
    setTotal(Math.floor(total) || null);
  }, [previews, discount, tip, tax]);

  const countHandler = (settings) => {
    setCountSettings({ key: Math.random(), ...settings });
    setCountVisible(!countVisible);
  };

  const observationHandler = (settings) => {
    setObservationSettings({ key: Math.random(), ...settings });
    setObservationVisible(!observationVisible);
  };

  const percentageHandler = (settings) => {
    setPercentageSettings({ key: Math.random(), ...settings });
    setPercentageVisble(!percentageVisible);
  };

  const changePreviews = ({ id, change }) => {
    const updated = { ...(previews.find((p) => p.id === id) || {}), ...change };
    const newPreviews = previews.map((p) => (p.id === id ? updated : p));
    const previewsFiltered = newPreviews.filter((n) => n.quantity > 0);
    changeSelection(previewsFiltered);
    if (previewsFiltered.length === 0) navigation.pop();
    else setPreviews(previewsFiltered);
  };

  const printHandler = ({ previews }) => {
    const total = previews.reduce((a, b) => a + b.total, 0);
    print({
      html: getHTML({
        previews,
        total,
        event: { tip, tax, discount },
        invoice,
        code,
        equivalence: true,
      }),
    });
  };

  const inventoryDiscountHandler = async (selection) => {
    const ingredients = selection.flatMap((s) =>
      (s.recipe?.ingredients || []).map((i) => ({ ...i, quantity: i.quantity * s.paid }))
    );

    const inventoriesMap = ingredients.reduce((map, ingredient) => {
      const inv = inventory.find((i) => i.id === ingredient.id);
      const obj = {
        id: random(20),
        quantity: ingredient.quantity,
        creationDate: Date.now(),
        currentValue: inv.currentValue,
        element: ingredient.id,
      };

      if (!map.has(ingredient.id)) {
        map.set(ingredient.id, { ...inv, output: [...inv.output, obj] });
      } else {
        const existing = map.get(ingredient.id);
        existing.output.push(obj);
        map.set(ingredient.id, existing);
      }

      return map;
    }, new Map());

    const inventories = [...inventoriesMap.values()];
    
    dispatch(updateManyInventory({ data: inventories }));

    await discountInventory({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      inventories,
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  return (
    <Layout style={{ justifyContent: "space-between" }}>
      <View>
        {previews !== null ? (
          <FlatList
            data={previews}
            style={{ maxHeight: SCREEN_HEIGHT / 2 }}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Card
                item={item}
                countHandler={countHandler}
                observationHandler={observationHandler}
                percentageHandler={percentageHandler}
                changePreviews={changePreviews}
              />
            )}
          />
        ) : (
          <ActivityIndicator size="small" color={light.main2} />
        )}
        <View style={{ alignItems: "flex-end", marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {discount && (
              <TouchableOpacity onPress={() => setDiscount(null)}>
                <Ionicons
                  name="close-circle"
                  size={getFontSize(20)}
                  style={{ marginRight: 4 }}
                  color={light.main2}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() =>
                percentageHandler({
                  title: "DESCUENTO",
                  description: "Defina el descuento general que va a tener estos pedidos",
                  limit: true,
                  remove: !!discount,
                  initialCount: total,
                  max: total,
                  onSubmit: ({ count }) => {
                    const discount = count
                      ? discount
                        ? discount + parseFloat((count / total).toFixed(2))
                        : parseFloat((count / total).toFixed(2))
                      : null;
                    setDiscount(discount);
                  },
                })
              }
            >
              <TextStyle color={light.main2}>
                {discount ? `Descuento ${Math.floor(discount * 100)}%` : "Dar descuento"}
              </TextStyle>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {tip && (
              <TouchableOpacity onPress={() => setTip(null)}>
                <Ionicons
                  name="close-circle"
                  size={getFontSize(20)}
                  style={{ marginRight: 4 }}
                  color={light.main2}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() =>
                countHandler({
                  title: "PROPINA",
                  description: "Defina la propina general",
                  initialCount: Math.floor(tip * 100) || "",
                  remove: !!tip,
                  max: 1000,
                  placeholder: "Porcentaje",
                  onSubmit: (percentage) => setTip(percentage / 100 || null),
                })
              }
            >
              <TextStyle color={light.main2}>
                {tip ? `Propina ${thousandsSystem(Math.floor(tip * 100))}%` : "Colocar propina"}
              </TextStyle>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {tax && (
              <TouchableOpacity onPress={() => setTax(null)}>
                <Ionicons
                  name="close-circle"
                  size={getFontSize(20)}
                  style={{ marginRight: 4 }}
                  color={light.main2}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() =>
                countHandler({
                  title: "IMPUESTO",
                  description: "Defina el impuesto general",
                  initialCount: Math.floor(tax * 100) || "",
                  remove: !!tax,
                  max: 100,
                  placeholder: "Porcentaje",
                  onSubmit: (percentage) => setTax(percentage / 100 || null),
                })
              }
            >
              <TextStyle color={light.main2}>
                {tax ? `Impuesto ${Math.floor(tax * 100)}%` : "Colocar impuesto"}
              </TextStyle>
            </TouchableOpacity>
          </View>
          <TextStyle color={textColor}>TOTAL: {total ? thousandsSystem(total) : "GRATIS"}</TextStyle>
        </View>
      </View>
      <View>
        <ButtonStyle
          backgroundColor={light.main2}
          style={{ flexDirection: "row" }}
          onPress={() => printHandler({ previews })}
        >
          <Ionicons
            name="reader-outline"
            color={light.textDark}
            size={getFontSize(16)}
            style={{ marginRight: 10 }}
          />
          <TextStyle>PRE - Factura</TextStyle>
        </ButtonStyle>
        <PaymentButtons
          value={paymentMethod}
          type={methodType}
          setValue={(value) => setPaymentMethod(value === paymentMethod ? "" : value)}
        />
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Limpiar carrito",
                "¿Estás seguro que quieres limpiar el carrito?",
                [
                  {
                    text: "No",
                    style: "cancel",
                  },
                  {
                    text: "Si",
                    onPress: () => {
                      changeSelection([]);
                      navigation.pop();
                    },
                  },
                ],
                { cancelable: true }
              )
            }
            style={[styles.outline, { padding: 4, borderRadius: 4 }]}
          >
            <Ionicons name="trash" color={light.main2} size={getFontSize(20)} />
          </TouchableOpacity>
          <ButtonStyle
            style={[styles.outline, styles.button]}
            backgroundColor="transparent"
            onPress={async () => {
              if (!paymentMethod)
                return Alert.alert("OOPS!", "Por favor, elija el método de pago", null, {
                  cancelable: true,
                });
              changeSelection([]);
              const selection = previews.map((p) => ({
                ...p,
                paid: p.quantity,
                status: p.status === "credit" || paymentMethod === "credit" ? "credit" : "paid",
                method: [
                  ...p.method,
                  { id: random(6), method: paymentMethod, total: p.total, quantity: p.quantity },
                ],
              }));
              const newProducts = products.map((p) => {
                //TODO CAMBIAR ESTO HACERLO DESDE LA API Y NO DESDE LA EDICION DEL USUARIO COMO TAL
                const found = selection.find((s) => s.id === p.id);
                return found ? { ...p, quantity: p.quantity - found.paid } : p;
              }); //TODO ESTO MEJORAR
              dispatch(changeP(newProducts)); //TODO CHANGE THIS

              const data = {
                id: random(20),
                ref,
                invoice: code,
                selection,
                tip,
                tax,
                discount,
                total: selection.reduce((a, b) => a + b.total, 0),
                quantity: selection.reduce((a, b) => a + b.quantity, 0),
                paid: selection.reduce((a, b) => a + b.paid, 0),
                status: "paid",
                creationDate: new Date().getTime(),
                modificationDate: new Date().getTime(),
              };

              dispatch(addS(data));
              const recipe = selection.filter((c) => c.recipe);
              if (recipe.length) inventoryDiscountHandler(recipe);
              navigation.replace("OrderStatus", { data, status: "paid" });

              //TODO CAMBIAR ESTO
              await editUser({
                identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
                change: {
                  sales: [...sales, data],
                  products: newProducts,
                },
                helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
              });
              //TODO CAMBIAR ESTO
            }}
          >
            <TextStyle verySmall center color={light.main2}>
              Finalizar
            </TextStyle>
          </ButtonStyle>
        </View>
      </View>
      <Count
        key={countSettings?.key}
        modalVisible={countVisible}
        setModalVisible={setCountVisible}
        title={countSettings?.title}
        description={countSettings?.description}
        initialCount={countSettings?.initialCount}
        max={countSettings?.max}
        placeholder={countSettings?.placeholder}
        remove={countSettings?.remove}
        onSubmit={countSettings?.onSubmit}
      />
      <Observation
        key={observationSettings?.key}
        modalVisible={observationVisible}
        setModalVisible={setObservationVisible}
        initialValue={observationSettings?.initialValue}
        onSubmit={observationSettings?.onSubmit}
      />
      <Percentage
        key={percentageSettings?.key}
        modalVisible={percentageVisible}
        setModalVisible={setPercentageVisble}
        title={percentageSettings?.title}
        description={percentageSettings?.description}
        limit={percentageSettings?.limit}
        remove={percentageSettings?.remove}
        initialCount={percentageSettings?.initialCount}
        max={percentageSettings?.max}
        onSubmit={percentageSettings?.onSubmit}
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
  button: {
    width: "auto",
    flexGrow: 1,
    marginLeft: 4,
  },
  outline: {
    borderWidth: 1,
    borderColor: light.main2,
  },
});

export default Preview;

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
import { thousandsSystem, getFontSize, random, print, generateBill } from "@helpers/libs";
import { updateMany as updateManyInventory } from "@features/inventory/informationSlice";
import { add as addO, edit as editO } from "@features/tables/ordersSlice";
import { add as addB } from "@features/people/billsSlice";
import { change as changeM } from "@features/tables/menuSlice";
import { editUser, discountInventory } from "@api";
import PaymentManager from "@utils/order/preview/PaymentManager";
import getHTML from "@utils/order/helpers/getHTML";
import PaymentButtons from "@components/PaymentButtons";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Layout from "@components/Layout";
import Count from "@utils/order/components/Count";
import Observation from "@utils/order/components/Observation";
import Percentage from "@utils/order/components/Percentage";
import Card from "@utils/order/preview/Card";
import theme from "@theme";

const { light, dark } = theme();
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Preview = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const menu = useSelector((state) => state.menu);
  const invoice = useSelector((state) => state.invoice);
  const orders = useSelector((state) => state.orders);
  const user = useSelector((state) => state.user);
  const customers = useSelector((state) => state.customers);
  const inventory = useSelector((state) => state.inventory);
  const helperStatus = useSelector((state) => state.helperStatus);
  const recipes = useSelector((state) => state.recipes);
  const bills = useSelector((state) => state.bills);

  const [total, setTotal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  const [countSettings, setCountSettings] = useState(null);
  const [countVisible, setCountVisible] = useState(false);

  const [observationSettings, setObservationSettings] = useState(null);
  const [observationVisible, setObservationVisible] = useState(false);

  const [percentageSettings, setPercentageSettings] = useState(null);
  const [percentageVisible, setPercentageVisble] = useState(false);

  const [paymentManagerVisible, setPaymentManagerVisible] = useState(false);

  const [discount, setDiscount] = useState(null);
  const [tip, setTip] = useState(null);
  const [tax, setTax] = useState(null);

  const [previews, setPreviews] = useState(null);

  const [methodType, setMethodType] = useState("others");

  const ref = route.params?.ref;
  const order = route.params?.order;
  const selection = route.params.selection;
  const changeSelection = route.params.changeSelection;
  const sendToKitchen = route.params.sendToKitchen;

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const dispatch = useDispatch();
  const code = useRef(random(6, { number: true, upperCase: true })).current;

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
    const ingredients = selection.flatMap((s) => {
      const recipe = recipes.find((r) => r.id === s.recipe)?.ingredients || [];
      return recipe.map((i) => ({ ...i, quantity: i.quantity * s.paid }));
    });

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

  const saveOrder = async ({ selection, change }) => {
    const quantity = selection.reduce((a, b) => a + b.quantity, 0);
    const paid = selection.reduce((a, b) => a + b.paid, 0);

    const events = {
      tip,
      tax,
      discount,
    };

    const data = {
      id: order ? order.id : random(20),
      ref,
      invoice: code,
      selection,
      ...events,
      total: selection.reduce((a, b) => a + b.total, 0),
      quantity,
      paid,
      status: quantity === paid ? "paid" : "pending",
      creationDate: order ? order.creationDate : new Date().getTime(),
      modificationDate: new Date().getTime(),
    };

    if (order) dispatch(editO({ id: order.id, data }));
    else dispatch(addO(data)); //TODO ESTO MEJORAR
    changeSelection([]); //TODO ESTO MEJORAR

    const newMenu = menu.map((p) => {
      if (p.recipe) return p;
      //TODO CAMBIAR ESTO HACERLO DESDE LA API Y NO DESDE LA EDICION DEL USUARIO COMO TAL
      const found = change.find((s) => s.id === p.id);
      return found ? { ...p, quantity: p.quantity - found.paid } : p;
    }); //TODO ESTO MEJORAR

    const recipe = selection
      .filter((s) => change.some((c) => c.id === s.id))
      .map((f) => {
        const found = change.find((c) => c.id === f.id);
        return { ...f, paid: found.paid };
      });
    if (recipe.length) inventoryDiscountHandler(recipe);
    dispatch(changeM(newMenu)); //TODO CHANGE THIS

    // ESTO ES LO QUE VAMOS A CAMBIAR EN LA BD
    let toChange = {
      orders: order ? orders.map((o) => (o.id === order.id ? data : o)) : [...orders, data],
      menu: newMenu,
    };

    // ZONA DE PAGO SI ES UN CLIENTE
    const customerFound = customers.find(
      ({ id, clientList }) => id === ref || clientList?.some((c) => c.id === ref)
    );

    // SI EXISTE EL CLIENTE COLOCA LA FACTURA DE PAGO
    if (customerFound && paymentMethod !== "credit") {
      const value = change.reduce((a, { total }) => a + total, 0);

      const bill = generateBill({
        value,
        ref: customerFound.id,
        description: `El cliente ha pagado los servicios dados por el restaurante por un monto de: ${thousandsSystem(
          value
        )}`,
        bills,
      });

      dispatch(addB(bill));
      toChange = { ...toChange, bills: [...bills, bill] };
    }

    // DEFINIMOS EL ESTATUS DE LA ORDEN
    const orderStatus = {
      ...events,
      selection: change,
      total: change.reduce((a, b) => a + b.total, 0),
      invoice: code,
    };

    navigation.pop();
    navigation.replace("OrderStatus", {
      data: orderStatus,
      status: quantity === paid ? "paid" : "pending",
    });

    //TODO CAMBIAR ESTO
    await editUser({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      change: toChange,
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
    //TODO CAMBIAR ESTO
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
                {discount ? `Descuento ${discount * 100}%` : "Dar descuento"}
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
                  initialCount: tip * 100 || "",
                  remove: !!tip,
                  max: 1000,
                  placeholder: "Porcentaje",
                  onSubmit: (percentage) => setTip(parseFloat((percentage / 100).toFixed(2)) || null),
                })
              }
            >
              <TextStyle color={light.main2}>
                {tip ? `Propina ${thousandsSystem(tip * 100)}%` : "Colocar propina"}
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
                  initialCount: tax * 100 || "",
                  remove: !!tax,
                  max: 100,
                  placeholder: "Porcentaje",
                  onSubmit: (percentage) => setTax(parseFloat((percentage / 100).toFixed(2)) || null),
                })
              }
            >
              <TextStyle color={light.main2}>
                {tax ? `Impuesto ${tax * 100}%` : "Colocar impuesto"}
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
            onPress={() => sendToKitchen({ cook: previews })}
          >
            <TextStyle verySmall center color={light.main2}>
              Enviar a cocina
            </TextStyle>
          </ButtonStyle>
          <ButtonStyle
            style={[styles.outline, styles.button]}
            backgroundColor="transparent"
            onPress={() => {
              if (!paymentMethod)
                return Alert.alert("OOPS!", "Por favor, elija el método de pago", null, {
                  cancelable: true,
                });
              Alert.alert(
                "PAGO",
                "¿Desea pagar los pedidos individual o general",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Individual",
                    onPress: () => setPaymentManagerVisible(!paymentManagerVisible),
                  },
                  {
                    text: "General",
                    onPress: async () => {
                      const selection = previews.map((p) => {
                        const quantity = p.quantity - p.paid;
                        const total = quantity * p.price * (1 - p.discount || 0);

                        return {
                          ...p,
                          paid: p.quantity,
                          status:
                            p.status === "credit" || paymentMethod === "credit" ? "credit" : "paid",
                          method: [
                            ...p.method,
                            { id: random(6), method: paymentMethod, total, quantity },
                          ],
                        };
                      });
                      const change = previews.map((p) => ({
                        id: p.id,
                        name: p.name,
                        total: (p.quantity - p.paid) * p.price * (1 - p.discount || 0),
                        discount: p.discount,
                        paid: p.quantity - p.paid,
                      }));
                      await saveOrder({ selection, change });
                    },
                  },
                ],
                { cancelable: true }
              );
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
      <PaymentManager
        key={paymentManagerVisible}
        modalVisible={paymentManagerVisible}
        setModalVisible={setPaymentManagerVisible}
        toPay={previews?.filter((p) => p.quantity !== p.paid)}
        tax={tax}
        tip={tip}
        discount={discount}
        code={code}
        onSubmit={async ({ change }) => {
          const selection = previews.map((p) => {
            const found = change.find((c) => c.id === p.id);
            if (!found) return p;
            const total = found?.paid * p.price * (1 - p.discount || 0);
            const paid = found?.paid + p.paid;
            return {
              ...p,
              paid,
              status:
                p.status === "credit" || paymentMethod === "credit"
                  ? "credit"
                  : p.quantity === paid
                  ? "paid"
                  : "pending",
              method: [
                ...p.method,
                { id: random(6), method: paymentMethod, total, quantity: found?.paid },
              ],
            };
          });
          await saveOrder({ selection, change });
        }}
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
    borderWidth: 1,
    borderColor: light.main2,
  },
  button: { width: "auto", flexGrow: 1, marginHorizontal: 2 },
  card: {
    paddingVertical: 6,
    borderRadius: 2,
  },
  showCard: {
    marginTop: 10,
    paddingTop: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: light.main2,
  },
});

export default Preview;

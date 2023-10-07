import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { thousandsSystem, getFontSize } from "@helpers/libs";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

const light = theme.colors.light;
const dark = theme.colors.dark;

const PreviewOrder = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const mainSelection = route.params.selection;
  const saveOrder = route.params.saveOrder;
  const updateOrder = route.params.updateOrder;
  const sendToKitchen = route.params.sendToKitchen;
  const editing = route.params.editing;
  const sales = route.params?.sales;

  const [newSelection, setNewSelection] = useState(route.params.newSelection);
  const [selection, setSelection] = useState(mainSelection);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [openEditOrder, setOpenEditOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [tip, setTip] = useState(0);
  const [tax, setTax] = useState(0);

  useEffect(() => {
    if (selection.length === 0) navigation.pop();
    route.params.setSelection(selection);
  }, [selection]);

  return (
    <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
      <View>
        <ScrollView style={{ maxHeight: 380 }}>
          {selection.map((item, index) => {
            return (
              <View style={{ marginVertical: 2 }} key={item.id}>
                <TouchableOpacity
                  onPress={() => {
                    if (index === openEditOrder) setOpenEditOrder(null);
                    else setOpenEditOrder(index);
                  }}
                  style={[
                    styles.chosenProduct,
                    {
                      opacity:
                        openEditOrder === index || openEditOrder === null
                          ? 1
                          : 0.6,
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                >
                  <TextStyle
                    paragrahp
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    <TextStyle color={light.main2} paragrahp>
                      {thousandsSystem(item.count)}
                    </TextStyle>
                    x {item.name}
                  </TextStyle>
                  <TextStyle
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {thousandsSystem(
                      item.discount !== 0
                        ? item.total - item.discount
                        : selection.reduce((a, b) => {
                            if (b.id === item.id) {
                              return (
                                a + (b.discount !== 0 ? b.discount : b.total)
                              );
                            }
                            return (a = a);
                          }, 0)
                    )}
                  </TextStyle>
                </TouchableOpacity>
                {openEditOrder === index && (
                  <View
                    style={[
                      styles.chosenProduct,
                      {
                        borderTopWidth: 1,
                        borderColor: light.main2,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={{ alignItems: "center" }}
                      onPress={() =>
                        navigation.navigate("EditOrder", {
                          data: "item",
                          id: item.id,
                          amount: selection.find((s) => s.id === item.id).count,
                          setSelection,
                          selection,
                        })
                      }
                    >
                      <Ionicons
                        name="file-tray-stacked"
                        size={getFontSize(23)}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                        style={{ marginLeft: 5 }}
                      />
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        {thousandsSystem(item.count)} items
                      </TextStyle>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ alignItems: "center" }}
                      onPress={() =>
                        navigation.navigate("EditOrder", {
                          data: "observation",
                          id: item.id,
                          observation: item.observation,
                          setSelection,
                          selection,
                          setNewSelectionFromPreviewOrder: setNewSelection,
                          newSelection: route.params.newSelection,
                          setNewSelection: route.params.setNewSelection,
                        })
                      }
                    >
                      <Ionicons
                        name="reader"
                        size={getFontSize(23)}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                        style={{ marginLeft: 5 }}
                      />
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Observación
                      </TextStyle>
                      {item.observation && (
                        <TextStyle smallParagraph color={light.main2}>
                          {item.observation.length} palabras
                        </TextStyle>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ alignItems: "center" }}
                      onPress={() =>
                        navigation.navigate("EditOrder", {
                          data: "price",
                          id: item.id,
                          price: selection.find((i) => i.id === item.id).price,
                          selection,
                          setSelection,
                        })
                      }
                    >
                      <Ionicons
                        name="cash"
                        size={getFontSize(23)}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                        style={{ marginLeft: 5 }}
                      />
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        {thousandsSystem(
                          selection.find((b) => b.id === item.id).price
                        )}
                      </TextStyle>
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        Unidad
                      </TextStyle>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ alignItems: "center" }}
                      onPress={() => {
                        navigation.navigate("CreatePercentage", {
                          editing: item.discount !== 0,
                          item,
                          title: item.name,
                          amount: item.total,
                          id: item.id,
                          selection,
                          setSelection,
                          setTotalDiscount,
                        });
                      }}
                    >
                      <Ionicons
                        name="pricetag"
                        size={getFontSize(23)}
                        color={light.main2}
                        style={{ marginLeft: 5 }}
                      />
                      <TextStyle smallParagraph color={light.main2}>
                        DESCUENTO
                      </TextStyle>
                      {item.discount !== 0 && (
                        <TextStyle smallParagraph color={light.main2}>
                          {thousandsSystem(item.discount)}
                        </TextStyle>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
        <View style={{ alignItems: "flex-end", marginTop: 20 }}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => {
              navigation.navigate("CreatePercentage", {
                title: "Descuento total",
                amount: selection.reduce(
                  (a, b) =>
                    a +
                    (parseInt(b.discount) !== 0
                      ? b.total - parseInt(b.discount)
                      : b.total),
                  0
                ),
                selection,
                setSelection,
                editing: totalDiscount !== 0,
                item: { discount: totalDiscount },
                setTotalDiscount,
              });
            }}
          >
            {totalDiscount !== 0 && (
              <TouchableOpacity onPress={() => setTotalDiscount(0)}>
                <Ionicons
                  name="close-circle-outline"
                  size={getFontSize(24)}
                  style={{ marginRight: 15 }}
                  color={light.main2}
                />
              </TouchableOpacity>
            )}
            <TextStyle color={light.main2}>
              {totalDiscount !== 0
                ? `Descuento: ${thousandsSystem(totalDiscount)}`
                : "Dar descuento"}
            </TextStyle>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => {
              navigation.navigate("EditOrder", {
                tip: tip !== 0 ? tip.toString() : "",
                data: "tip",
                setTip,
              });
            }}
          >
            {tip !== 0 && (
              <TouchableOpacity onPress={() => setTip(0)}>
                <Ionicons
                  name="close-circle-outline"
                  size={getFontSize(24)}
                  style={{ marginRight: 15 }}
                  color={light.main2}
                />
              </TouchableOpacity>
            )}
            <TextStyle color={light.main2}>
              {tip !== 0 ? `Propina: ${thousandsSystem(tip)}` : "Dar Propina"}
            </TextStyle>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => {
              navigation.navigate("EditOrder", {
                tax: tax !== 0 ? tax.toString() : "",
                data: "tax",
                setTax,
              });
            }}
          >
            {tax !== 0 && (
              <TouchableOpacity onPress={() => setTax(0)}>
                <Ionicons
                  name="close-circle-outline"
                  size={getFontSize(24)}
                  style={{ marginRight: 15 }}
                  color={light.main2}
                />
              </TouchableOpacity>
            )}
            <TextStyle color={light.main2}>
              {tax !== 0
                ? `Impuesto: ${thousandsSystem(tax)}`
                : "Colocar Impueso"}
            </TextStyle>
          </TouchableOpacity>
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            TOTAL:{" "}
            {totalDiscount !== 0
              ? thousandsSystem(
                  selection.reduce(
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
                )
              : thousandsSystem(
                  selection.reduce(
                    (a, b) =>
                      a +
                      (parseInt(b.discount) !== 0
                        ? b.total - parseInt(b.discount)
                        : b.total),
                    0
                  ) +
                    tip -
                    tax
                )}
          </TextStyle>
        </View>
      </View>
      <View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginVertical: 10,
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
              size={getFontSize(28)}
              color={
                paymentMethod !== "Efectivo" ? light.main2 : light.textDark
              }
              style={{ marginLeft: 5 }}
            />
            <TextStyle
              smallParagraph
              customStyle={{ marginTop: 4 }}
              color={
                paymentMethod !== "Efectivo" ? light.main2 : light.textDark
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
              size={getFontSize(28)}
              color={paymentMethod !== "Tarjeta" ? light.main2 : light.textDark}
              style={{ marginLeft: 5 }}
            />
            <TextStyle
              smallParagraph
              customStyle={{ marginTop: 4 }}
              color={paymentMethod !== "Tarjeta" ? light.main2 : light.textDark}
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
              size={getFontSize(28)}
              color={paymentMethod !== "Otros" ? light.main2 : light.textDark}
              style={{ marginLeft: 5 }}
            />
            <TextStyle
              smallParagraph
              customStyle={{ marginTop: 4 }}
              color={paymentMethod !== "Otros" ? light.main2 : light.textDark}
            >
              Otros
            </TextStyle>
          </TouchableOpacity>
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
                    onPress: () => setSelection([]),
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash" size={getFontSize(23)} color={light.main2} />
          </TouchableOpacity>
          {!sales && (
            <ButtonStyle
              backgroundColor="transparent"
              style={{
                borderWidth: 2,
                borderColor: light.main2,
                width: SCREEN_WIDTH / 2.8,
              }}
              onPress={() => sendToKitchen(selection, newSelection)}
            >
              <TextStyle center verySmall color={light.main2}>
                Enviar a cocina
              </TextStyle>
            </ButtonStyle>
          )}
          <ButtonStyle
            backgroundColor="transparent"
            style={{
              borderWidth: 2,
              borderColor: light.main2,
              width: sales ? SCREEN_WIDTH / 1.3 : SCREEN_WIDTH / 2.8,
            }}
            onPress={() => {
              const obj = {
                pay: true,
                discount: totalDiscount,
                tax,
                tip,
                method: paymentMethod,
              };
              if (editing) updateOrder(obj, selection);
              else saveOrder(obj, selection);
            }}
          >
            <TextStyle verySmall center color={light.main2}>
              Finalizar
            </TextStyle>
          </ButtonStyle>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  chosenProduct: {
    paddingVertical: 10,
    paddingHorizontal: 15,
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
});

export default PreviewOrder;

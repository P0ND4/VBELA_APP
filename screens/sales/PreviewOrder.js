import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { thousandsSystem, getFontSize, changeDate, print } from "@helpers/libs";
import Logo from "@assets/logo.png";
import Information from "@components/Information";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import PaymentButtons from "@components/PaymentButtons";

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const { light, dark } = theme();

const Selection = ({ item, setIndividualPayment, individualPayment }) => {
  const mode = useSelector((state) => state.mode);

  const [payment, setPayment] = useState(0);

  return (
    <View style={[styles.row, { marginTop: 5 }]}>
      <View>
        <TextStyle paragrahp color={mode === "light" ? light.textDark : dark.textWhite}>
          <TextStyle color={light.main2} paragrahp>
            {thousandsSystem(payment)}
          </TextStyle>
          x {item.name}
        </TextStyle>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={styles.quantitySelection}
          onPress={() => {
            if (payment <= 0) return;
            setPayment(payment - 1);

            const index = individualPayment.findIndex((i) => i.id === item.id);

            let changed;
            let selected = { ...individualPayment[index] };
            selected.paid -= 1;
            if (selected.paid === 0)
              changed = individualPayment.filter((s) => s.id !== item.id);
            else
              changed = individualPayment.map((s) => {
                if (s.id === selected.id) return selected;
                return s;
              });
            setIndividualPayment(changed);
          }}
        >
          <Ionicons name="remove" size={getFontSize(15)} color={light.main2} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quantitySelection}
          onPress={() => {
            if (payment >= item.count - item.paid) return;
            setPayment(payment + 1);

            const index = individualPayment.findIndex((i) => i.id === item.id);

            if (index !== -1) {
              let selected = { ...individualPayment[index] };
              selected.paid += 1;
              const changed = individualPayment.map((s) => {
                if (s.id === selected.id) return selected;
                return s;
              });
              setIndividualPayment(changed);
            } else setIndividualPayment([...individualPayment, { ...item, paid: 1 }]);
          }}
        >
          <Ionicons name="add" size={getFontSize(15)} color={light.main2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PreviewOrder = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const invoice = useSelector((state) => state.invoice);

  const mainSelection = route.params.selection;
  const saveOrder = route.params.saveOrder;
  const updateOrder = route.params.updateOrder;
  const sendToKitchen = route.params.sendToKitchen;
  const editing = route.params.editing;
  const sales = route.params?.sales;
  const code = route.params?.code;
  const owner = route.params?.owner;

  const [individualPayment, setIndividualPayment] = useState([]);
  const [newSelection, setNewSelection] = useState(route.params.newSelection);
  const [selection, setSelection] = useState(mainSelection);
  const [totalDiscount, setTotalDiscount] = useState(0); //TODO CAMBIAR ESTO Y COLOCAR NULL
  const [openEditOrder, setOpenEditOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [tip, setTip] = useState(0); //TODO CAMBIAR ESTO Y COLOCAR NULL
  const [tax, setTax] = useState(0); //TODO CAMBIAR ESTO Y COLOCAR NULL
  const [generalPrice, setGeneralPrice] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!modalVisible) setIndividualPayment([]);
  }, [modalVisible]);

  useEffect(() => {
    if (selection.filter((s) => s.count !== s.paid).length === 0) navigation.pop();
    route.params.setSelection(selection);
  }, [selection]);

  useEffect(() => {
    setGeneralPrice(
      totalDiscount !== 0
        ? selection
            .filter((s) => s.count !== s.paid)
            .reduce((a, b) => {
              const value = (b.count - b.paid) * b.value;
              return a + (b.discount !== 0 ? value - b.discount : value);
            }, 0) -
            totalDiscount +
            tip +
            tax
        : selection
            .filter((s) => s.count !== s.paid)
            .reduce((a, b) => {
              const value = (b.count - b.paid) * b.value;
              return a + (b.discount !== 0 ? value - b.discount : value);
            }, 0) +
            tip +
            tax
    );
  }, [totalDiscount, selection, tip, tax]);

  const generateHTML = ({ selection, total, type }) => {
    const date = new Date();
    const text = selection.reduce((a, item) => {
      const count = type === "general" ? item.count - item.paid : item.paid;
      return (
        a +
        `<tr>
            <td style="text-align: left;">
              <p style="font-size: 28px; font-weight: 600;">${thousandsSystem(count)}x ${
          item.name
        }</p>
            </td>
            <td style="text-align: right;">
              <p style="font-size: 28px; font-weight: 600;">
              ${thousandsSystem(
                item.discount !== 0
                  ? count * item.value - item.discount
                  : selection.reduce((a, b) => {
                      if (b.id === item.id) {
                        return a + (b.discount !== 0 ? b.discount : count * b.value);
                      }
                      return (a = a);
                    }, 0)
              )}
              </p>
            </td>
          </tr>`
      );
    }, "");

    return `
    <html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style type="text/css">
      * {
        padding: 0;
        margin: 0;
        box-sizing: 'border-box';
        font-family: sans-serif;
        color: #444444
      }
  
      @page { margin: 20px; } 
    </style>
  </head>
  
  <body>
  <view style="padding: 20px; width: 100vw; display: block; margin: 20px auto; background-color: #FFFFFF;">
      <view>
        <img
        src="${Image.resolveAssetSource(Logo).uri}"
        style="width: 22vw; display: block; margin: 0 auto; border-radius: 8px" />
        <p style="font-size: 30px; text-align: center">vbelapp.com</p>
      </view>
      <p style="font-size: 30px; text-align: center; margin: 20px 0; background-color: #444444; padding: 10px 0; color: #FFFFFF">ALQUILERES Y RESTAURANTES</p>
        
      <p style="font-size: 25px; font-weight: 600;">
        ${invoice?.name ? invoice?.name : ""} ${
      invoice?.address ? `- ${invoice?.address}` : ""
    } ${invoice?.number ? `- ${invoice?.number}` : ""} ${
      invoice?.complement ? `- ${invoice?.complement}` : ""
    }
      </p>
        <p style="text-align: center; color: #444444; font-size: 40px; font-weight: 800; margin-top: 20px">
          ${invoice?.name ? invoice?.name : "Sin nombre"}
        </p>
        <p style="text-align: center; color: #444444; font-size: 30px; font-weight: 800; margin-bottom: 20px">
          TICKET N°: ${code}
        </p>
      <view>
        <table style="width: 95vw">
          <tr>
            <td>
              <p style="font-size: 25px; font-weight: 600; color: #444444; margin-bottom: 12px;">${selection.reduce(
                (a, b) => {
                  const value = type === "general" ? b.count - b.paid : b.paid;
                  return a + value;
                },
                0
              )} Artículos
              </p>
            </td>
            <td>
              <p style="font-size: 25px; font-weight: 600; color: #444444; margin-bottom: 12px; text-align: center">
                Fecha: ${changeDate(date)}
              </p>
            </td>
            <td>
              <p style="font-size: 25px; font-weight: 600; color: #444444; margin-bottom: 12px; text-align: right">
              Hora: ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(
      -2
    )}:${("0" + date.getSeconds()).slice(-2)}
              </p>
            </td>
          </tr>
        </table>
      </view>
      <hr/>
      <view>
        <table style="width: 95vw; margin: 10px 0;">
          ${text.replace(/,/g, "")}
        </table>
      </view>
      <hr/>
      <view style="width: 94vw">
      <p style="margin-top: 10px;"/>
      ${
        totalDiscount
          ? `<p style="text-align: right; font-size: 30px; font-weight: 600; width: 95vw;">
            Descuento: ${thousandsSystem(totalDiscount)}
          </p>`
          : ""
      }
      ${
        tip
          ? `<p style="text-align: right; font-size: 30px; font-weight: 600; width: 95vw;">
            Propina: ${thousandsSystem(tip)}
          </p>`
          : ""
      }
      ${
        tax
          ? `<p style="text-align: right; font-size: 30px; font-weight: 600; width: 95vw;">
            Impuesto: ${thousandsSystem(tax)}
          </p>`
          : ""
      }
      <p style="text-align: right; font-size: 30px; font-weight: 600; margin-bottom: 10px; width: 95vw;">Total: ${thousandsSystem(
        total
      )}</p>
      </view>
      <hr/>
      <p style="text-align: center; font-size: 25px; font-weight: 600; margin-top: 15px; width: 95vw;">ESTA ES UNA PRE-FACTURA HECHA POR ${
        invoice?.name ? invoice?.name : "Sin nombre"
      } RECUERDE VISITAR vbelapp.com</p>
    </view>
  </body>
  
  </html>
    `;
  };

  return (
    <Layout style={{ justifyContent: "space-between" }}>
      <View>
        <ScrollView style={{ maxHeight: 380 }}>
          {selection
            .filter((s) => s.count !== s.paid)
            .map((item, index) => {
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
                        opacity: openEditOrder === index || openEditOrder === null ? 1 : 0.6,
                        backgroundColor: mode === "light" ? light.main5 : dark.main2,
                      },
                    ]}
                  >
                    <TextStyle
                      paragrahp
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      <TextStyle color={light.main2} paragrahp>
                        {thousandsSystem(item.count - item.paid)}
                      </TextStyle>
                      x {item.name}
                    </TextStyle>
                    <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
                      {thousandsSystem(
                        item.discount !== 0
                          ? (item.count - item.paid) * item.value - item.discount
                          : selection
                              .filter((s) => s.count !== s.paid)
                              .reduce((a, b) => {
                                if (b.id === item.id) {
                                  return (
                                    a +
                                    (b.discount !== 0
                                      ? b.discount
                                      : (b.count - b.paid) * b.value)
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
                          backgroundColor: mode === "light" ? light.main5 : dark.main2,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={{ alignItems: "center" }}
                        onPress={() => {
                          const amount = selection.find((s) => s.id === item.id);
                          navigation.navigate("EditOrder", {
                            data: "item",
                            id: item.id,
                            amount: amount.count - amount.paid,
                            setSelection,
                            selection,
                          });
                        }}
                      >
                        <Ionicons
                          name="file-tray-stacked"
                          size={getFontSize(23)}
                          color={mode === "light" ? light.textDark : dark.textWhite}
                          style={{ marginLeft: 5 }}
                        />
                        <TextStyle
                          smallParagraph
                          color={mode === "light" ? light.textDark : dark.textWhite}
                        >
                          {thousandsSystem(item.count - item.paid)} items
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
                            sales,
                          })
                        }
                      >
                        <Ionicons
                          name="reader"
                          size={getFontSize(23)}
                          color={mode === "light" ? light.textDark : dark.textWhite}
                          style={{ marginLeft: 5 }}
                        />
                        <TextStyle
                          smallParagraph
                          color={mode === "light" ? light.textDark : dark.textWhite}
                        >
                          Observación
                        </TextStyle>
                        {item.observation && (
                          <TextStyle smallParagraph color={light.main2}>
                            {item.observation.length} letras
                          </TextStyle>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ alignItems: "center" }}
                        onPress={() =>
                          navigation.navigate("EditOrder", {
                            data: "value",
                            id: item.id,
                            value: selection.find((s) => s.id === item.id).value,
                            selection,
                            setSelection,
                          })
                        }
                      >
                        <Ionicons
                          name="cash"
                          size={getFontSize(23)}
                          color={mode === "light" ? light.textDark : dark.textWhite}
                          style={{ marginLeft: 5 }}
                        />
                        <TextStyle
                          smallParagraph
                          color={mode === "light" ? light.textDark : dark.textWhite}
                        >
                          {thousandsSystem(selection.find((s) => s.id === item.id).value)}
                        </TextStyle>
                        <TextStyle
                          smallParagraph
                          color={mode === "light" ? light.textDark : dark.textWhite}
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
                            amount: (item.count - item.paid) * item.value,
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
                amount: selection
                  .filter((s) => s.count !== s.paid)
                  .reduce(
                    (a, b) =>
                      a +
                      (b.discount !== 0
                        ? (b.count - b.paid) * b.value - b.discount
                        : (b.count - b.paid) * b.value),
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
              {tax !== 0 ? `Impuesto: ${thousandsSystem(tax)}` : "Colocar Impueso"}
            </TextStyle>
          </TouchableOpacity>
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            TOTAL: {thousandsSystem(generalPrice)}
          </TextStyle>
        </View>
      </View>
      <View>
        {!sales && (
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={() => {
              const html = generateHTML({
                selection,
                total: generalPrice,
                type: "general",
              });
              print({ html });
            }}
            left={() => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="reader-outline"
                  color={light.textDark}
                  size={getFontSize(16)}
                  style={{ marginRight: 10 }}
                />
                <TextStyle bigParagraph>PRE - Factura</TextStyle>
              </View>
            )}
          />
        )}
        <PaymentButtons type="others" value={paymentMethod} setValue={setPaymentMethod} />
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
              onPress={() => sendToKitchen({ selection, newSelection, back: true })}
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
              const generalEvent = () => {
                const obj = {
                  pay: true,
                  discount: totalDiscount,
                  tax,
                  tip,
                };
                const changed = [];
                const currentSelection = selection.map((s) => {
                  if (s.count !== s.paid) {
                    const se = { ...s };
                    se.method = [
                      ...se.method,
                      {
                        method: paymentMethod,
                        total: (s.count - s.paid) * s.value,
                      },
                    ];
                    se.paid = s.count;
                    changed.push({
                      ...se,
                      paid: s.count - s.paid,
                    });
                    return se;
                  } else return s;
                });

                const params = {
                  data: obj,
                  completeSelection: currentSelection,
                  totalPaid: generalPrice,
                  currentSelection: changed,
                  back: true,
                };

                if (editing) updateOrder(params);
                else saveOrder(params);
              };

              if (sales) generalEvent();
              else {
                Alert.alert(
                  "FINALIZAR",
                  "¿Cómo desea realizar el pago?",
                  [
                    {
                      style: "cancel",
                      text: "Cancelar",
                    },
                    {
                      text: "General",
                      onPress: () => generalEvent(),
                    },
                    {
                      text: "Individual",
                      onPress: () => setModalVisible(!modalVisible),
                    },
                  ],
                  { cancelable: true }
                );
              }
            }}
          >
            <TextStyle verySmall center color={light.main2}>
              Finalizar
            </TextStyle>
          </ButtonStyle>
        </View>
      </View>
      <Information
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        title="¿Qué vas a pagar?"
        style={{ padding: 20, width: "80%" }}
        content={() => {
          const total = individualPayment.reduce((a, b) => {
            const value = b.value * b.paid;
            const percentage = (value / b.total).toFixed(2);
            return a + (b.discount !== 0 ? value - b.discount * percentage : value);
          }, 0);

          const selectionTotal = selection
            .filter((s) => s.count !== s.paid)
            .reduce((a, b) => a + (b.discount !== 0 ? b.total - b.discount : b.total), 0);

          const percentageDiscount = (totalDiscount / selectionTotal).toFixed(2);

          const totalQuantity = selection
            .filter((s) => s.count !== s.paid)
            .reduce((a, b) => {
              if (b.count !== b.paid) return a + b.count - b.paid;
              return a;
            }, 0);

          const totalToPay = Math.round(total - total * percentageDiscount + tip + tax);

          return (
            <View style={{ marginTop: 10 }}>
              <FlatList
                style={{ maxHeight: 400 }}
                showsVerticalScrollIndicator={false}
                data={selection.filter((s) => s.count !== s.paid)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Selection
                    item={item}
                    individualPayment={individualPayment}
                    setIndividualPayment={setIndividualPayment}
                  />
                )}
              />
              <View style={{ marginTop: 10 }}>
                {totalDiscount !== 0 && total !== 0 && (
                  <TextStyle right color={light.main2}>
                    Descuento: {thousandsSystem(Math.round(total * percentageDiscount))}
                  </TextStyle>
                )}
                {tip !== 0 && total !== 0 && (
                  <TextStyle right color={light.main2}>
                    Propina: {thousandsSystem(tip)}
                  </TextStyle>
                )}
                {tax !== 0 && total !== 0 && (
                  <TextStyle right color={light.main2}>
                    Impuesto: {thousandsSystem(tax)}
                  </TextStyle>
                )}
                {total !== 0 && (
                  <TextStyle right color={mode === "light" ? light.textDark : dark.textWhite}>
                    TOTAL: {thousandsSystem(totalToPay)}
                  </TextStyle>
                )}
              </View>
              <View style={{ marginTop: 15 }}>
                <ButtonStyle
                  backgroundColor={light.main2}
                  style={{ opacity: total !== 0 ? 1 : 0.6 }}
                  onPress={() => {
                    if (total === 0) return;
                    const html = generateHTML({
                      selection: individualPayment,
                      total: totalToPay,
                      type: "individual",
                    });
                    print({ html });
                  }}
                  left={() => (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons
                        name="reader-outline"
                        color={light.textDark}
                        size={getFontSize(16)}
                        style={{ marginRight: 10 }}
                      />
                      <TextStyle bigParagraph>PRE - Factura</TextStyle>
                    </View>
                  )}
                />
                <ButtonStyle
                  backgroundColor={light.main2}
                  style={{ opacity: total !== 0 ? 1 : 0.6 }}
                  onPress={() => {
                    if (total === 0) return;
                    const quantitySelected = individualPayment.reduce((a, b) => a + b.paid, 0);

                    const obj = {
                      pay: totalQuantity === quantitySelected,
                      discount: totalDiscount,
                      tax,
                      tip,
                    };
                    const currentSelection = [];
                    for (let se of selection) {
                      const individual = individualPayment.find((i) => i.id === se.id);
                      if (se.id === individual?.id && se.count !== se.paid) {
                        const securrent = { ...se };
                        securrent.paid += individual.paid;
                        securrent.method = [
                          ...securrent.method,
                          {
                            method: paymentMethod,
                            total: individual.paid * securrent.value,
                          },
                        ];
                        currentSelection.push(securrent);
                      } else currentSelection.push(se);
                    }

                    const params = {
                      data: obj,
                      completeSelection: currentSelection,
                      totalPaid: totalToPay,
                      currentSelection: individualPayment,
                      back: true,
                    };

                    if (editing) updateOrder(params);
                    else saveOrder(params);
                  }}
                >
                  <TextStyle center>Pagar</TextStyle>
                </ButtonStyle>
              </View>
            </View>
          );
        }}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  quantitySelection: {
    paddingVertical: 2,
    paddingHorizontal: 3,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: light.main2,
    marginHorizontal: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chosenProduct: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default PreviewOrder;

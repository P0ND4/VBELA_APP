import { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import TextStyle from "@components/TextStyle";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  thousandsSystem,
  random,
  changeDate,
  generatePDF,
  print,
  getFontSize,
} from "@helpers/libs";

import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import theme from "@theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const light = theme.colors.light;
const dark = theme.colors.dark;

const Invoice = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const invoice = useSelector((state) => state.invoice);
  const [text, setText] = useState("");
  const [discount, setDiscount] = useState({ price: 0, percentage: 0 });
  const [tax, setTax] = useState({ price: 0, percentage: 0 });
  const [tip, setTip] = useState({ price: 0, percentage: 0 });

  const extra = route.params.extra;
  const selection = route.params.selection;
  const total = route.params.total;
  const code = useRef(random(6, { number: true })).current;
  const date = useRef(new Date()).current;
  const viewShotRef = useRef();

  const backgroundButton = () => {
    return { backgroundColor: mode === "light" ? light.main5 : dark.main2 };
  };

  const color = () => (mode === "light" ? light.textDark : dark.textWhite);

  useEffect(() => {
    const selectionTotal = selection.reduce((a, b) => {
      const value = b.value * b.paid;
      const percentage = (value / b.total).toFixed(2);
      return a + (b.discount !== 0 ? value - b.discount * percentage : value);
    }, 0);

    setDiscount({
      price: Math.abs(Math.round(parseInt(total) - selectionTotal)),
      percentage: Math.abs(
        Math.round(((parseInt(total) - selectionTotal) / selectionTotal) * 100)
      ),
    });
    setTax({
      price: extra.tax,
      percentage: Math.round((extra.tax / (selectionTotal + extra.tax) * 100)),
    });
    setTip({
      price: extra.tip,
      percentage: Math.round((extra.tip / (selectionTotal + extra.tip) * 100)),
    });
  }, [selection, extra]);

  useEffect(() => {
    setText("");
    const text = selection.reduce((a, item) => {
      return (
        a +
        `<tr>
            <td style="text-align: left;">
              <p style="font-size: 28px; font-weight: 600;">${thousandsSystem(
                item.paid
              )}x ${item.name}</p>
            </td>
            <td style="text-align: right;">
              <p style="font-size: 28px; font-weight: 600;">
              ${thousandsSystem(
                item.discount !== 0
                  ? item.paid * item.value - item.discount
                  : selection.reduce((a, b) => {
                      if (b.id === item.id) {
                        return (
                          a +
                          (b.discount !== 0 ? b.discount : item.paid * b.value)
                        );
                      }
                      return (a = a);
                    }, 0)
              )}
              </p>
            </td>
          </tr>`
      );
    }, "");
    setText(text);
  }, []);

  const html = `
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
<view style="padding: 20px; width: 500px; display: block; margin: 20px auto; background-color: #FFFFFF;">
    <h2 style="text-align: center; color: #444444; font-size: 50px; font-weight: 800;">
      #${code}
    </h2>
    <view style="width: 100%; margin: 20px 0;">
      <p style="font-weight: 600; color: #444444; font-size: 24px; font-weight: 600;">
        ${invoice?.name ? invoice?.name : "Sin nombre"}
      </p>
      <p style="font-size: 32px; font-weight: 600;">
        ${invoice?.name ? invoice?.name : ""} ${
    invoice?.address ? `- ${invoice?.address}` : ""
  } ${invoice?.number ? `- ${invoice?.number}` : ""} ${
    invoice?.complement ? `- ${invoice?.complement}` : ""
  }
      </p>
    </view>
    <p style="font-size: 32px; font-weight: 600; color: #444444; margin-bottom: 12px;">${selection.reduce(
      (a, b) => a + b.paid,
      0
    )} Artículos</p>
    <view>
      <table style="width: 100%">
        ${text.replace(/,/g, "")}
      </table>
      <view style="margin-top: 20px;">
      ${
        extra.discount
          ? `<p style="text-align: right; font-size: 30px; font-weight: 600;">
            Descuento: ${thousandsSystem(discount.price)} (${
              discount.percentage
            }%)
          </p>`
          : ""
      }
      ${
        extra.tip
          ? `<p style="text-align: right; font-size: 30px; font-weight: 600;">
            Propina: ${thousandsSystem(tip.price)} (${tip.percentage}%)
          </p>`
          : ""
      }
      ${
        extra.tax
          ? `<p style="text-align: right; font-size: 30px; font-weight: 600;">
            Impuesto: ${thousandsSystem(tax.price)} (${tax.percentage}%)
          </p>`
          : ""
      }
      <p style="text-align: right; font-size: 30px; font-weight: 600;">Total: ${thousandsSystem(
        total
      )}</p>
      </view>
    </view>
    <p style="text-align: center; font-size: 30px; font-weight: 600;">${changeDate(
      date
    )} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(
    -2
  )}</p>
  </view>
</body>

</html>
`;

  //TODO CUANDO HAY MUCHOS PEDIDOS Y SE LE COLOCA DESCUENTOS IMPUESTOS PROPINA DESCUENTO EN LOS PRODUCTOS ALGO PASA
  //TODO CANDO SE CAMBIA LA CANTIDAD PERO YA PAGO VARIOS OCURRE UN BUG, AL IGUAL QUE EL DESCUENTO, LAS OBSERVACIONES NO SABRIA

  const share = async () => {
    const imageURI = await viewShotRef.current.capture();
    await Sharing.shareAsync(imageURI);
  };

  return (
    <Layout style={{ padding: 0, justifyContent: "space-between" }}>
      <View>
        <View style={[styles.editInvoice, backgroundButton()]}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => navigation.navigate("EditInvoice")}
          >
            <Ionicons
              name="create-outline"
              color={mode === "light" ? light.textDark : dark.textWhite}
              size={getFontSize(24)}
              style={{ marginRight: 10 }}
            />
            <TextStyle color={color()} smallParagraph>
              Editar mi recibo
            </TextStyle>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            style={{ margin: 20 }}
            onPress={() => navigation.pop()}
          >
            <Ionicons
              name="close-outline"
              color={mode === "light" ? light.textDark : dark.textWhite}
              size={getFontSize(32)}
            />
          </TouchableOpacity>
          <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1.0 }}>
            <View
              style={{
                padding: 20,
                backgroundColor: mode === "light" ? light.main4 : dark.main1,
              }}
            >
              <View style={styles.header}>
                <TextStyle color={color()} smallSubtitle>
                  {invoice?.name ? invoice?.name : "Sin nombre"}
                </TextStyle>
                <TextStyle color={color()} smallSubtitle>
                  #{code}
                </TextStyle>
              </View>
              <TextStyle
                color={color()}
                customStyle={{ marginVertical: 30 }}
                smallParagraph
              >
                {invoice?.name && invoice?.name}{" "}
                {invoice?.address && `- ${invoice?.address}`}{" "}
                {invoice?.number && `- ${invoice?.number}`}{" "}
                {invoice?.complement && `- ${invoice?.complement}`}
              </TextStyle>
              <TextStyle color={color()} smallParagraph>
                {selection.reduce((a, b) => a + b.paid, 0)} Artículos
              </TextStyle>
              <View style={styles.orders}>
                <ScrollView style={{ maxHeight: SCREEN_HEIGHT / 4 }}>
                  {selection.map((item) => {
                    const value = item.value * item.paid;
                    const percentage = (value / item.total).toFixed(2);

                    return (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                        key={item.id}
                      >
                        <TextStyle
                          paragrahp
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          <TextStyle color={light.main2} paragrahp>
                            {thousandsSystem(item.paid)}
                          </TextStyle>
                          x {item.name}
                        </TextStyle>
                        <TextStyle
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          {thousandsSystem(
                            item.discount !== 0
                              ? Math.round(value - item.discount * percentage)
                              : value
                          )}
                        </TextStyle>
                      </View>
                    );
                  })}
                </ScrollView>

                <View style={{ marginTop: 20 }}>
                  {extra.discount && (
                    <TextStyle right color={light.main2}>
                      Descuento: {thousandsSystem(discount?.price)} (
                      {discount?.percentage}%)
                    </TextStyle>
                  )}
                  {extra.tip && (
                    <TextStyle right color={light.main2}>
                      Propina: {thousandsSystem(tip.price)} ({tip?.percentage}%)
                    </TextStyle>
                  )}
                  {extra.tax && (
                    <TextStyle right color={light.main2}>
                      Impuesto: {thousandsSystem(tax.price)} ({tax?.percentage}
                      %)
                    </TextStyle>
                  )}

                  <TextStyle right color={light.main2}>
                    Total: {thousandsSystem(total)}
                  </TextStyle>
                </View>
              </View>
              <TextStyle center color={color()} smallParagraph>
                {changeDate(date)} {("0" + date.getHours()).slice(-2)}:
                {("0" + date.getMinutes()).slice(-2)}
              </TextStyle>
            </View>
          </ViewShot>
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={[styles.button, backgroundButton()]}
          onPress={() => generatePDF({ html, code })}
        >
          <Ionicons
            name="document-text-outline"
            color={light.main2}
            size={getFontSize(24)}
            style={{ marginBottom: 5 }}
          />
          <TextStyle color={color()} smallParagraph>
            PDF
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, backgroundButton()]}
          onPress={() =>
            navigation.navigate("InvoiceByEmail", {
              code,
              selection,
              total,
              date,
            })
          }
        >
          <Ionicons
            name="paper-plane-outline"
            color={light.main2}
            size={getFontSize(24)}
            style={{ marginBottom: 5 }}
          />
          <TextStyle color={color()} smallParagraph>
            Email
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, backgroundButton()]}
          onPress={() => print({ html })}
        >
          <Ionicons
            name="print-outline"
            color={light.main2}
            size={getFontSize(24)}
            style={{ marginBottom: 5 }}
          />
          <TextStyle color={color()} smallParagraph>
            Imprimir
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, backgroundButton()]}
          onPress={() => share()}
        >
          <Ionicons
            name="share-social-outline"
            color={light.main2}
            size={getFontSize(24)}
            style={{ marginBottom: 5 }}
          />
          <TextStyle color={color()} smallParagraph>
            Compartir
          </TextStyle>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orders: {
    paddingVertical: 20,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: light.main2,
    marginVertical: 14,
  },
  button: {
    width: SCREEN_WIDTH / 4,
    height: SCREEN_WIDTH / 4,
    borderColor: "#AAAAAA",
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  editInvoice: {
    width: "100%",
    paddingVertical: 8,
    alignItems: "center",
  },
});

export default Invoice;

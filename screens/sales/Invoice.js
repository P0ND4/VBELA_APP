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
  getFontSize
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

  const selection = route.params.data.selection;
  const total = route.params.data.total;
  const code = useRef(random(6, { number: true })).current;
  const date = useRef(new Date()).current;
  const viewShotRef = useRef();

  const backgroundButton = () => {
    return { backgroundColor: mode === "light" ? light.main5 : dark.main2 };
  };

  const color = () => (mode === "light" ? light.textDark : dark.textWhite);

  useEffect(() => {
    setText("");
    const text = selection.reduce((a, item) => {
      return (
        a +
        `<tr>
            <td style="text-align: left;">
              <p style="font-size: 28px; font-weight: 600;">${thousandsSystem(
                item.count
              )}x ${item.name}</p>
            </td>
            <td style="text-align: right;">
              <p style="font-size: 28px; font-weight: 600;">
              ${thousandsSystem(
                item.discount !== 0
                  ? item.total - item.discount
                  : selection.reduce((a, b) => {
                      if (b.id === item.id) {
                        return a + (b.discount !== 0 ? b.discount : b.total);
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
      (a, b) => a + b.count,
      0
    )} Artículos</p>
    <view>
      <table style="width: 100%">
        ${text.replace(/,/g, "")}
      </table>
          
      <p style="text-align: center; font-size: 30px; font-weight: 600; margin-top: 20px;">Total: ${thousandsSystem(
        total
      )}</p>
      
    </view>
    <p style="text-align: center; font-size: 30px; font-weight: 600;">${changeDate(
      date
    )} ${("0" + date.getHours()).slice(-2)}:
    ${("0" + date.getMinutes()).slice(-2)}</p>
  </view>
</body>

</html>
`;

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
                {selection.reduce((a, b) => a + b.count, 0)} Artículos
              </TextStyle>
              <View style={styles.orders}>
                <ScrollView style={{ maxHeight: SCREEN_HEIGHT / 4 }}>
                  {selection.map((item) => (
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
                          {thousandsSystem(item.count)}
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
                            ? item.total - item.discount
                            : selection.reduce((a, b) => {
                                if (b.id === item.id) {
                                  return (
                                    a +
                                    (b.discount !== 0 ? b.discount : b.total)
                                  );
                                }
                                return (a = a);
                              }, 0)
                        )}
                      </TextStyle>
                    </View>
                  ))}
                </ScrollView>

                <TextStyle
                  right
                  color={light.main2}
                  customStyle={{ marginTop: 20 }}
                >
                  Total: {thousandsSystem(total)}
                </TextStyle>
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
              data: route.params.data,
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

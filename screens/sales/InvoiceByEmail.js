import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { View, TouchableOpacity, Alert } from "react-native";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import TextStyle from "@components/TextStyle";
import theme from "@theme";
import Layout from "@components/Layout";
import { thousandsSystem, changeDate } from "@helpers/libs";
import { orderInvoice } from "@api";

const light = theme.colors.light;
const dark = theme.colors.dark;

const InvoiceByEmail = ({ navigation, route }) => {
  const {
    setValue,
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const mode = useSelector((state) => state.mode);
  const invoice = useSelector((state) => state.invoice);

  const [text, setText] = useState("");
  const [email, setEmail] = useState();

  const selection = route.params.data.selection;
  const total = route.params.data.total;
  const code = route.params.code;
  const date = route.params.date;

  useEffect(() => {
    setText("");
    const text = selection.reduce((a, item) => {
      return (
        a +
        `<tr>
            <td style="text-align: left;">${thousandsSystem(item.count)}x ${
          item.name
        }</td>
            <td style="text-align: right;">${thousandsSystem(
              item.discount !== 0
                ? item.total - item.discount
                : selection.reduce((a, b) => {
                    if (b.id === item.id) {
                      return a + (b.discount !== 0 ? b.discount : b.total);
                    }
                    return (a = a);
                  }, 0)
            )}</td>
          </tr>`
      );
    }, "");
    setText(text);
  }, []);

  const html = `
  <view style="padding: 20px; width: 100%; display: block; margin: 20px auto; background-color: #FFFFFF;">
    <h2 style="text-align: center; color: #444444;">
      #${code}
    </h2>
    <view style="width: 100%; margin: 15px;">
      <p style="font-weight: 600; color: #444444">
        ${invoice?.name ? invoice?.name : "Sin nombre"}
      </p>
      <p style="font-size: 14px;">
      ${invoice?.name && invoice?.name} ${
    invoice?.address && `- ${invoice?.address}`
  } ${invoice?.number && `- ${invoice?.number}`} ${
    invoice?.complement && `- ${invoice?.complement}`
  }
      </p>
    </view>
    <p style="font-size: 15px; font-weight: 600; color: #444444; margin-bottom: 12px;">${selection.reduce(
      (a, b) => a + b.count,
      0
    )} Artículos</p>
    <view>
      <table style="width: 100%">
        ${text.replace(/,/g, "")}
      </table>
      <p style="text-align: center; margin-top: 20px; font-weight: 600;">Total: ${total}</p>
    </view>
    <p style="text-align: center; color: #777777">${changeDate(date)} ${(
    "0" + date.getHours()
  ).slice(-2)}:
    ${("0" + date.getMinutes()).slice(-2)}</p>
  </view>
`;

  useEffect(() => {
    register("email", {
      value: "",
      required: true,
      pattern:
        /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/,
    });
  }, []);

  const sendEmail = async () => {
    orderInvoice({
      email,
      html,
      title: `FACTURA ${invoice?.name && invoice?.name}`,
      id: code,
    });
    Alert.alert("ENVIADO", "¡Email en camino!");
    navigation.pop();
  };

  return (
    <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
      <View />
      <View style={{ alignItems: "center" }}>
        <View style={{ marginBottom: 20 }}>
          <InputStyle
            value={email}
            placeholder="Escriba el email del cliente"
            keyboardType="email-address"
            stylesContainer={{ width: "100%" }}
            onChangeText={(text) => {
              setValue("email", text);
              setEmail(text);
            }}
          />
          {errors.email?.type && (
            <TextStyle verySmall color={light.main2}>
              {errors.email?.type === "required"
                ? "El email es requerido"
                : "El email es invalido"}
            </TextStyle>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            setValue("email", "");
            setEmail("");
          }}
          style={{
            borderColor: light.main2,
            borderWidth: 1,
            width: 160,
            paddingVertical: 10,
            paddingHorizontal: 5,
            borderRadius: 8,
          }}
        >
          <TextStyle
            center
            smallParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            Limpiar campo
          </TextStyle>
        </TouchableOpacity>
      </View>
      <ButtonStyle
        onPress={handleSubmit(sendEmail)}
        backgroundColor={light.main2}
      >
        <TextStyle color={light.textDark} center>Enviar</TextStyle>
      </ButtonStyle>
    </Layout>
  );
};

export default InvoiceByEmail;

import { useRef, useEffect, useState, useMemo } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { thousandsSystem, changeDate, generatePDF, print, getFontSize } from "@helpers/libs";
import { orderInvoice } from "@api";
import Information from "@components/Information";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import Logo from "@assets/logo.png";
import getHTML from "@utils/order/helpers/getHTML";

import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import theme from "@theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const { light, dark } = theme();

const Email = ({ modalVisible, setModalVisible, html, code }) => {
  const {
    setValue,
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const invoice = useSelector((state) => state.invoice);
  const mode = useSelector((state) => state.mode);

  const [email, setEmail] = useState("");

  useEffect(() => {
    register("email", {
      value: "",
      required: true,
      pattern:
        /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/,
    });
  }, []);

  const clean = () => {
    setEmail("");
    setValue("email", "");
  };

  const sendEmail = async () => {
    await orderInvoice({
      email,
      html,
      title: `FACTURA ${invoice?.name || ""}`,
      id: code,
    });
    Alert.alert("ENVIADO", "¡Email en camino!");
    setModalVisible(!modalVisible);
    clean();
  };

  return (
    <Information
      onClose={() => clean()}
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      title="CORREO ELECTRÓNICO"
      content={() => (
        <View>
          <TextStyle
            style={{ marginBottom: 5 }}
            smallParagraph
            color={mode === "ligt" ? light.textDark : dark.textWhite}
          >
            Escriba el correo electrónico al que quiere enviar la factura
          </TextStyle>
          <View style={{ marginTop: 10, marginBottom: 15 }}>
            <InputStyle
              value={email}
              placeholder="Correo electrónico"
              keyboardType="email-address"
              stylesContainer={{ width: "100%", borderBottomWidth: 1, borderColor: light.main2 }}
              onChangeText={(text) => {
                setValue("email", text);
                setEmail(text);
              }}
            />
            {errors.email?.type && (
              <TextStyle verySmall color={light.main2}>
                {errors.email?.type === "required" ? "El email es requerido" : "El email es invalido"}
              </TextStyle>
            )}
          </View>
          <View style={styles.row}>
            {email && (
              <ButtonStyle
                backgroundColor={mode === "light" ? dark.main2 : light.main5}
                style={{ width: "auto", flexGrow: 1, marginRight: 2 }}
                onPress={() => clean()}
              >
                <TextStyle center>Limpiar</TextStyle>
              </ButtonStyle>
            )}
            <ButtonStyle
              backgroundColor={light.main2}
              style={{ width: "auto", flexGrow: 1, marginLeft: 2 }}
              onPress={handleSubmit(sendEmail)}
            >
              <TextStyle center>Guardar</TextStyle>
            </ButtonStyle>
          </View>
        </View>
      )}
    />
  );
};

const Invoice = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const invoice = useSelector((state) => state.invoice);

  const [modalVisible, setModalVisible] = useState(false);
  const [invoiceInfo, setInvoiceInfo] = useState([]);

  const data = route.params.data;

  const date = useRef(new Date()).current;
  const html = useRef(
    getHTML({
      previews: data.selection,
      total: data.total,
      event: { discount: data.discount, tip: data.tip, tax: data.tax },
      code: data.invoice,
      invoice,
    })
  ).current;
  const viewShotRef = useRef();

  const getBackgroundColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    setInvoiceInfo(
      [invoice?.name, invoice?.address, invoice?.number, invoice?.complement].filter(Boolean)
    );
  }, [invoice]);

  const Event = ({ name, value }) => {
    return (
      <TextStyle right color={textColor}>
        {name}:{" "}
        <TextStyle color={light.main2}>
          {thousandsSystem(Math.floor(data.total * value))} ({Math.floor(value * 100)}%)
        </TextStyle>
      </TextStyle>
    );
  };

  const Button = ({ onPress, icon, name }) => {
    return (
      <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={onPress}>
        <Ionicons name={icon} color={light.main2} size={getFontSize(24)} style={{ marginBottom: 5 }} />
        <TextStyle color={textColor} smallParagraph>
          {name}
        </TextStyle>
      </TouchableOpacity>
    );
  };

  return (
    <Layout style={{ justifyContent: "space-between", padding: 0, marginTop: 33 }}>
      <View style={[styles.edit, { backgroundColor }]}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => navigation.navigate("EditInvoice")}
        >
          <Ionicons
            name="create-outline"
            color={textColor}
            size={getFontSize(24)}
            style={{ marginRight: 10 }}
          />
          <TextStyle color={textColor} smallParagraph>
            Editar mi recibo
          </TextStyle>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity style={{ marginTop: 20, marginLeft: 20 }} onPress={() => navigation.pop()}>
          <Ionicons name="close-outline" color={textColor} size={getFontSize(32)} />
        </TouchableOpacity>
        <ScrollView style={{ flexGrow: 1, maxHeight: SCREEN_HEIGHT / 1.45 }}>
          <ViewShot ref={viewShotRef} options={{ result: "tmpfile", format: "png", quality: 1.0 }}>
            <View style={{ backgroundColor: mode === "light" ? light.main4 : dark.main1 }}>
              <View style={{ alignItems: "center", marginBottom: 10, paddingTop: 20 }}>
                <Image source={Logo} style={{ width: 90, height: 90, borderRadius: 8 }} />
                <TextStyle style={{ marginTop: 5 }} color={textColor}>
                  vbelapp.com
                </TextStyle>
              </View>
              <View style={styles.bar}>
                <TextStyle center>ALQUILERES Y RESTAURANTES</TextStyle>
              </View>
              <View style={{ padding: 20 }}>
                <TextStyle color={textColor} smallParagraph>
                  {invoiceInfo.join(" - ").trim()}
                </TextStyle>
                <View style={{ alignItems: "center", marginVertical: 14 }}>
                  <TextStyle color={textColor} smallSubtitle>
                    {invoice?.name || "Sin nombre"}
                  </TextStyle>
                  <TextStyle color={textColor}>TICKET N°: {data.invoice}</TextStyle>
                </View>
                <View style={[styles.row, { marginTop: 5 }]}>
                  <TextStyle color={textColor} smallParagraph>
                    {data?.selection.reduce((a, b) => a + b.paid, 0)} Artículos
                  </TextStyle>
                  <TextStyle color={textColor} smallParagraph>
                    Fecha: {changeDate(date)}
                  </TextStyle>
                  <TextStyle color={textColor} smallParagraph>
                    Hora: {("0" + date.getHours()).slice(-2)}:{("0" + date.getMinutes()).slice(-2)}:
                    {("0" + date.getSeconds()).slice(-2)}
                  </TextStyle>
                </View>
                <View style={styles.orders}>
                  {data?.selection.map((item) => {
                    return (
                      <View
                        style={{ flexDirection: "row", justifyContent: "space-between" }}
                        key={item.id}
                      >
                        <TextStyle paragrahp color={textColor}>
                          <TextStyle color={light.main2} paragrahp>
                            {thousandsSystem(item.paid)}
                          </TextStyle>
                          x {item.name}
                        </TextStyle>
                        <TextStyle color={textColor}>
                          {item.total ? thousandsSystem(item.total) : "GRATIS"}
                        </TextStyle>
                        {item.discount && (
                          <TextStyle>
                            {`(${thousandsSystem(Math.floor(item.discount * 100))}% DESCUENTO)`}
                          </TextStyle>
                        )}
                      </View>
                    );
                  })}
                </View>
                <View style={{ paddingBottom: 15, borderBottomWidth: 1, borderColor: light.main2 }}>
                  {data?.discount && <Event name="Descuento" value={data.discount} />}
                  {data?.tip && <Event name="Propina" value={data.tip} />}
                  {data?.tax && <Event name="Impuesto" value={data.tax} />}
                  <TextStyle right color={textColor}>
                    Total:{" "}
                    <TextStyle color={light.main2}>
                      {(() => {
                        let total = data.total;
                        if (data.discount) total *= 1 - data.discount;
                        if (data.tip) total *= 1 + data.tip;
                        if (data.tax) total *= 1 + data.tax;
                        return thousandsSystem(total);
                      })()}
                    </TextStyle>
                  </TextStyle>
                </View>
                <TextStyle center color={textColor} smallParagraph style={{ marginTop: 15 }}>
                  GRACIAS POR COMPRAR EN {invoice?.name || "Sin nombre"} RECUERDE VISITAR vbelapp.com
                </TextStyle>
              </View>
            </View>
          </ViewShot>
        </ScrollView>
      </View>
      <View style={{ flexDirection: "row" }}>
        <Button
          onPress={async () => generatePDF({ html, code: "SIN CODIGO" })}
          icon="document-text-outline"
          name="PDF"
        />
        <Button onPress={() => setModalVisible(!modalVisible)} icon="paper-plane-outline" name="Email" />
        <Button onPress={() => print({ html })} icon="print-outline" name="Imprimir" />
        <Button
          onPress={async () => {
            const imageURI = await viewShotRef.current.capture();
            await Sharing.shareAsync(imageURI);
          }}
          icon="share-social-outline"
          name="Compartir"
        />
      </View>
      <Email
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        html={html}
        code={data.invoice}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  edit: {
    width: "100%",
    paddingVertical: 8,
    alignItems: "center",
  },
  bar: {
    backgroundColor: light.main2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: "100%",
    marginTop: 8,
  },
  orders: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: light.main2,
    marginVertical: 14,
  },
  button: {
    flexGrow: 1,
    height: SCREEN_WIDTH / 4,
    borderColor: "#AAAAAA",
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Invoice;

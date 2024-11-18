import { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions, Alert } from "react-native";
import { useSelector } from "react-redux";
import { thousandsSystem, print } from "@helpers/libs";
import PaymentButtons from "@components/PaymentButtons";
import Ionicons from "@expo/vector-icons/Ionicons";
import getHTML from "@utils/order/helpers/getHTML";
import InputStyle from "@components/InputStyle";
import TextStyle from "@components/TextStyle";
import Information from "@components/Information";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { light, dark } = theme();
const { width: SCREEN_WIDTH } = Dimensions.get("screen");

const Card = ({ item, onChangeText }) => {
  const mode = useSelector((state) => state.mode);
  const [count, setCount] = useState("");

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const change = (value) => {
    setCount(thousandsSystem(value || ""));
    onChangeText(value);
  };

  return (
    <View style={styles.row}>
      <TextStyle color={light.main2} style={{ maxWidth: 90 }}>
        {thousandsSystem(item.quantity - item.paid)}
        <TextStyle smallParagraph color={textColor}>
          x {item.name}
        </TextStyle>
      </TextStyle>
      <View style={styles.center}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const value = parseInt(count.replace(/[^0-9]/g, "") || 0) - 1;
            value >= 0 && change(value);
          }}
        >
          <TextStyle>-</TextStyle>
        </TouchableOpacity>
        <InputStyle
          stylesContainer={{
            maxWidth: 120,
            borderBottomWidth: 1,
            borderColor: textColor,
          }}
          stylesInput={{ textAlign: "center" }}
          value={count}
          placeholder="Cantidad"
          keyboardType="numeric"
          maxLength={thousandsSystem(String(item.quantity - item.paid)).length}
          onChangeText={(num) => {
            const value = parseInt(num.replace(/[^0-9]/g, "")) || "";
            value <= item.quantity - item.paid && change(value);
          }}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const value = parseInt(count.replace(/[^0-9]/g, "") || 0) + 1;
            value <= item.quantity - item.paid && change(value);
          }}
        >
          <TextStyle>+</TextStyle>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PaymentManager = ({
  modalVisible,
  setModalVisible,
  toPay = [],
  onSubmit = () => {},
  paymentMethodActive,
  tip,
  tax,
  discount,
  code,
}) => {
  const mode = useSelector((state) => state.mode);
  const invoice = useSelector((state) => state.invoice);

  const [total, setTotal] = useState(null);
  const [change, setChange] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);

  useEffect(() => setChange(toPay.map((p) => ({ ...p, total: 0, paid: 0 }))), []);

  useEffect(() => {
    let total = change?.reduce((a, b) => a + b.paid * b.price * (1 - b.discount || 0), 0);
    if (discount) total *= 1 - discount;
    if (tip) total *= 1 + tip;
    if (tax) total *= 1 + tax;
    setTotal(Math.floor(total) || null);
  }, [change, discount, tip, tax]);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <Information
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      title="PAGO POR UNIDAD"
      content={() => (
        <View>
          <TextStyle style={{ marginBottom: 5 }} smallParagraph color={textColor}>
            Cantidad de productos a pagar
          </TextStyle>
          <FlatList
            data={toPay}
            keyExtractor={(item) => item.id}
            style={{ marginVertical: 5, maxHeight: 180 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Card
                item={item}
                onChangeText={(num) => {
                  const paid = parseInt(num || "0");
                  setChange(
                    change.map((c) => {
                      if (c.id === item.id)
                        return { ...c, paid, total: paid * c.price * (1 - c.discount || 0) };
                      else return c;
                    })
                  );
                }}
              />
            )}
          />
          <View style={{ alignItems: "flex-end", marginVertical: 5 }}>
            {discount && <TextStyle color={light.main2}>Descuento {discount * 100}%</TextStyle>}
            {tip && <TextStyle color={light.main2}>Propina {thousandsSystem(tip * 100)}%</TextStyle>}
            {tax && <TextStyle color={light.main2}>Impuesto {tax * 100}%</TextStyle>}
            <TextStyle color={textColor}>TOTAL: {thousandsSystem(total || 0)}</TextStyle>
          </View>
          {paymentMethodActive && (
            <PaymentButtons
              value={paymentMethod}
              cardStyle={{ borderWidth: 1, borderColor: light.main2, width: SCREEN_WIDTH / 4.1 }}
              type="others"
              setValue={(value) => setPaymentMethod(value === paymentMethod ? "" : value)}
            />
          )}
          <ButtonStyle
            backgroundColor={light.main2}
            style={{ flexDirection: "row", opacity: change.some((c) => c.paid > 0) ? 1 : 0.6 }}
            onPress={() => {
              if (!change.some((c) => c.paid > 0)) return;
              const total = change.reduce((a, b) => a + b.total, 0);
              print({
                html: getHTML({ previews: change, total, event: { tip, tax, discount }, code, invoice }),
              });
            }}
          >
            <Ionicons
              name="reader-outline"
              color={light.textDark}
              size={22}
              style={{ marginRight: 10 }}
            />
            <TextStyle>PRE - Factura</TextStyle>
          </ButtonStyle>
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={() => {
              if (total) {
                if (paymentMethodActive && !paymentMethod)
                  return Alert.alert(
                    "MÉTODO DE PAGO",
                    "Seleccione un método de pago para continuar",
                    null,
                    {
                      cancelable: true,
                    }
                  );

                setModalVisible(!modalVisible);
                onSubmit({ change, paymentMethod });
              }
            }}
            style={{ opacity: total ? 1 : 0.6 }}
          >
            <TextStyle center>Guardar</TextStyle>
          </ButtonStyle>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  center: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  button: {
    width: SCREEN_WIDTH / 12,
    height: SCREEN_WIDTH / 12,
    borderRadius: 2,
    backgroundColor: light.main2,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PaymentManager;

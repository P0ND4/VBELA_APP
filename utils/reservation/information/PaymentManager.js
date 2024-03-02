import { useState, useMemo, useEffect } from "react";
import { View, StyleSheet, FlatList, Switch, Dimensions, Alert } from "react-native";
import { useSelector } from "react-redux";
import { thousandsSystem } from "@helpers/libs";
import Information from "@components/Information";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import PaymentButtons from "@components/PaymentButtons";
import theme from "@theme";

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const { light, dark } = theme();

const Card = ({ element, onChangeText, editable }) => {
  const mode = useSelector((state) => state.mode);

  const [value, setValue] = useState("");

  useEffect(() => setValue(thousandsSystem(element.amount || "")), [element]);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <View style={styles.row}>
      <TextStyle style={{ maxWidth: 160 }} color={textColor}>
        {element?.name}
      </TextStyle>
      <InputStyle
        editable={editable}
        placeholder="Pagado"
        keyboardType="numeric"
        stylesContainer={{
          maxWidth: 130,
          borderBottomWidth: 1,
          borderColor: textColor,
          opacity: editable ? 1 : 0.4,
        }}
        value={value}
        onChangeText={(num) => {
          setValue(thousandsSystem(num.replace(/[^0-9]/g, "")));
          onChangeText(num.replace(/[^0-9]/g, ""));
        }}
        maxLength={13}
      />
    </View>
  );
};

const PaymentManager = ({
  total,
  payment,
  modalVisible,
  setModalVisible,
  toPay = [],
  business = true,
  paymentType,
  handleSubmit,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentByBusiness, setPaymentByBusiness] = useState(false);
  const [elements, setElements] = useState([]);
  const [amount, setAmount] = useState(0);
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => setElements(toPay), [toPay]);
  useEffect(
    () => setAmount(elements?.reduce((a, b) => a + b?.amount || 0, 0) || "0"),
    [elements]
  );

  const onClose = () => {
    setPaymentMethod("cash");
    setPaymentByBusiness(false);
  };

  return (
    <Information
      onClose={() => onClose()}
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      title="GÉSTION DE PAGO"
      content={() =>
        !elements || !elements.length ? (
          <TextStyle style={{ marginTop: 10 }} smallParagraph color={textColor}>
            NO HAY HUÉSPED PARA EL PAGO
          </TextStyle>
        ) : (
          <View>
            <TextStyle style={{ marginBottom: 5 }} smallParagraph color={textColor}>
              ¿Como y cuanto ha pagado el usuario?
            </TextStyle>
            {!paymentByBusiness && paymentMethod !== "credit" && (
              <FlatList
                data={elements}
                keyExtractor={(item) => item.id}
                style={{ marginVertical: 5, maxHeight: 180 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Card
                    editable={!paymentByBusiness}
                    element={item}
                    onChangeText={(num) => {
                      const amount = parseInt(num || "0");
                      setElements(
                        elements.map((e) => (e.id === item.id ? { ...e, amount } : e))
                      );
                    }}
                  />
                )}
              />
            )}
            {!paymentByBusiness && paymentMethod !== "credit" && (
              <View style={{ marginVertical: 5 }}>
                <TextStyle color={textColor}>
                  Monto pagado:{" "}
                  <TextStyle color={light.main2}>{thousandsSystem(payment)}</TextStyle>
                </TextStyle>
                <TextStyle color={textColor}>
                  Monto faltante:{" "}
                  <TextStyle color={light.main2}>
                    {total - payment < 0 ? "YA PAGADO" : thousandsSystem(total - payment)}
                  </TextStyle>
                </TextStyle>
                <TextStyle color={textColor}>
                  Monto a pagar:{" "}
                  <TextStyle color={light.main2}>{thousandsSystem(amount)}</TextStyle>
                </TextStyle>
                {amount > total - payment && (
                  <TextStyle color={textColor}>
                    Propina:{" "}
                    <TextStyle color={light.main2}>
                      {thousandsSystem(amount - (total - payment))}
                    </TextStyle>
                  </TextStyle>
                )}
              </View>
            )}
            {business && !["mixto", "credit"].includes(paymentType) && (
              <View style={[styles.row, { marginBottom: 5 }]}>
                <TextStyle smallParagraph color={light.main2}>
                  Lo pago la empresa
                </TextStyle>
                <Switch
                  trackColor={{ false: dark.main2, true: light.main2 }}
                  thumbColor={light.main4}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => setPaymentByBusiness(!paymentByBusiness)}
                  value={paymentByBusiness}
                />
              </View>
            )}
            {!paymentByBusiness && (
              <PaymentButtons
                value={paymentMethod}
                setValue={setPaymentMethod}
                cardStyle={{ width: SCREEN_WIDTH / 4.2 }}
                type={paymentType}
              />
            )}
            <ButtonStyle
              backgroundColor={light.main2}
              style={{ marginTop: 5 }}
              onPress={() => {
                if (!amount && !paymentByBusiness)
                  return Alert.alert("OOPS :(", "Necesita colocar el monto pagado", null, {
                    cancelable: true,
                  });

                const validate = (event) => (paymentByBusiness ? null : event);
                const tip = amount > total - payment ? amount - (total - payment) : null;

                const manage = () =>
                  handleSubmit({
                    elements,
                    paymentMethod,
                    amount: validate(amount),
                    tip: validate(tip),
                    payment,
                    total,
                    paymentByBusiness,
                    onClose,
                  });

                const generateAlert = ({ title, description, denial, affirmation }) => {
                  Alert.alert(
                    title,
                    description,
                    [
                      { text: denial, style: "cancel" },
                      { text: affirmation, onPress: async () => await manage() },
                    ],
                    { cancelable: true }
                  );
                };

                if (paymentByBusiness)
                  return generateAlert({
                    title: "POR EMPRESA",
                    description:
                      "El pago será gestionado por la empresa, puedes cambiar esto más adelante",
                    denial: "Cambie de opinión",
                    affirmation: "Esta bien",
                  });

                if (paymentMethod === "credit")
                  return generateAlert({
                    title: "CRÉDITO",
                    description:
                      "El pago del crédito se reflejara en CLIENTES, ¿está seguro que desea continuar?",
                    denial: "No estoy seguro",
                    affirmation: "Estoy seguro",
                  });

                if (tip)
                  return generateAlert({
                    title: "HAY PROPINA",
                    description: `Hay una propina de ${thousandsSystem(
                      tip
                    )}, ¿está seguro que desea continuar?`,
                    denial: "No estoy seguro",
                    affirmation: "Estoy seguro",
                  });

                if (total - payment > amount)
                  return generateAlert({
                    title: "HAY DEUDAS",
                    description: `Hay una deuda de ${thousandsSystem(
                      total - payment - amount
                    )}, ¿está seguro que desea continuar?`,
                    denial: "No estoy seguro",
                    affirmation: "Estoy seguro",
                  });

                return generateAlert({
                  title: "LISTO",
                  description: "¿Está seguro que desea pagar la reservación?",
                  denial: "No estoy seguro",
                  affirmation: "Estoy seguro",
                });
              }}
            >
              <TextStyle center>Guardar</TextStyle>
            </ButtonStyle>
          </View>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default PaymentManager;

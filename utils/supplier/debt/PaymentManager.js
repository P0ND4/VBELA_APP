import { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions, Alert } from "react-native";
import { useSelector } from "react-redux";
import { thousandsSystem } from "@helpers/libs";
import PaymentButtons from "@components/PaymentButtons";
import Information from "@components/Information";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { light, dark } = theme();
const { width: SCREEN_WIDTH } = Dimensions.get("screen");

const Count = ({
  modalVisible,
  setModalVisible,
  title,
  value = 0,
  max = 999,
  min = 0,
  initialCount = "1",
  onSubmit = () => {},
}) => {
  const mode = useSelector((state) => state.mode);

  const [count, setCount] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("");

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => setCount(thousandsSystem(String(initialCount))), [initialCount]);

  return (
    <Information
      onClose={() => setCount("1")}
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      title={title || ""}
      content={() => (
        <View>
          <TextStyle style={{ marginBottom: 5 }} smallParagraph color={textColor}>
            Realiza el pago del siguiente elemento del inventario, seleccionando la cantidad de elementos
            pagada
          </TextStyle>
          <View style={[styles.center, { marginVertical: 15 }]}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                const filtered = parseInt(count?.replace(/[^0-9]/g, "") || 0) - 1;
                filtered >= min && setCount(thousandsSystem(filtered || ""));
              }}
            >
              <TextStyle bigSubtitle>-</TextStyle>
            </TouchableOpacity>
            <InputStyle
              stylesContainer={{
                maxWidth: 130,
                borderBottomWidth: 1,
                borderColor: textColor,
              }}
              stylesInput={{ textAlign: "center" }}
              value={count}
              placeholder="Cantidad"
              keyboardType="numeric"
              maxLength={thousandsSystem(String(max)).length}
              onChangeText={(num) => {
                const value = parseInt(num?.replace(/[^0-9]/g, "")) || "";
                if (value >= min && value <= max) setCount(thousandsSystem(value));
              }}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                const filtered = parseInt(count?.replace(/[^0-9]/g, "") || 0) + 1;
                filtered <= max && setCount(thousandsSystem(filtered));
              }}
            >
              <TextStyle bigSubtitle>+</TextStyle>
            </TouchableOpacity>
          </View>
          <TextStyle color={textColor}>TOTAL: {thousandsSystem(value * +count || 0)}</TextStyle>
          <PaymentButtons
            value={paymentMethod}
            cardStyle={{ borderWidth: 1, borderColor: light.main2, width: SCREEN_WIDTH / 4.1 }}
            type="others"
            setValue={(value) => setPaymentMethod(value === paymentMethod ? "" : value)}
          />
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={() => {
              if (count) {
                if (!paymentMethod)
                  return Alert.alert(
                    "MÉTODO DE PAGO",
                    "Seleccione un método de pago para continuar",
                    null,
                    {
                      cancelable: true,
                    }
                  );

                onSubmit(parseInt(count?.replace(/[^0-9]/g, "")) || null, paymentMethod);
                setCount("1");
                setPaymentMethod("")
                setModalVisible(!modalVisible);
              }
            }}
          >
            <TextStyle center>Guardar</TextStyle>
          </ButtonStyle>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  center: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    height: SCREEN_WIDTH / 10,
    width: SCREEN_WIDTH / 10,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: light.main2,
  },
});

export default Count;

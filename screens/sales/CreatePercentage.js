import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Alert, TouchableOpacity, View } from "react-native";
import { thousandsSystem } from "@helpers/libs";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const CreatePercentage = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);

  const [percentage, setPercentage] = useState("");
  const [discountInAmount, setDiscountInAmount] = useState("");

  const item = route.params.item;
  const editing = route.params.editing;
  const discount = route.params;
  const selection = route.params.selection;
  const setSelection = route.params.setSelection;
  const setTotalDiscount = route.params.setTotalDiscount;

  useEffect(() => {
    if (editing) {
      setDiscountInAmount(thousandsSystem(item.discount));
      const operation = item.discount / parseInt(discount.amount);
      if (isNaN(operation) || operation === Infinity) setPercentage("");
      else setPercentage((operation.toFixed(2) * 100).toString());
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (discount.id) {
              const newBuy = selection.map((b) => {
                const i = { ...b };
                if (i.id === discount.id) i.discount = 0;
                return i;
              });
              setSelection(newBuy);
            } else setTotalDiscount(0);
            navigation.pop();
          }}
        >
          <TextStyle color={light.main2} customStyle={{ paddingRight: 20 }}>
            Limpiar
          </TextStyle>
        </TouchableOpacity>
      ),
    });
  }, []);

  return (
    <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
      <View />
      <View style={{ alignItems: "center" }}>
        <TextStyle
          customStyle={{ marginBottom: 10 }}
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Descuento fijo
        </TextStyle>
        <InputStyle
          placeholder="Valor"
          value={discountInAmount}
          keyboardType="numeric"
          onChangeText={(num) => {
            const per = parseInt(num.replace(/[^0-9]/g, ""));
            if (per > discount.amount || per === 0 || per === "") return;
            const operation = per / parseInt(discount.amount);
            if (isNaN(operation) || operation === Infinity) setPercentage("");
            else setPercentage((operation.toFixed(2) * 100).toString());
            setDiscountInAmount(thousandsSystem(num.replace(/[^0-9]/g, "")));
          }}
          stylesContainer={{ width: "60%" }}
          stylesInput={{ textAlign: "center", width: 0 }}
        />
      </View>
      <View style={{ alignItems: "center" }}>
        <TextStyle
          customStyle={{ marginBottom: 10 }}
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Descuento por porcentaje
        </TextStyle>
        <InputStyle
          maxLength={3}
          placeholder="Porcentaje"
          value={percentage}
          keyboardType="numeric"
          onChangeText={(num) => {
            const per = parseInt(num.replace(/[^0-9]/g, ""));
            if (per > 100 || per === 0 || per === "") return;
            const operation = Math.floor(
              (parseInt(discount.amount) * per) / 100
            ).toString();

            if (!isNaN(operation)) setDiscountInAmount(operation);
            else setDiscountInAmount("");
            setPercentage(thousandsSystem(num.replace(/[^0-9]/g, "")));
          }}
          stylesContainer={{ width: "60%" }}
          stylesInput={{ textAlign: "center", width: 0 }}
        />
      </View>
      <View
        style={{
          paddingVertical: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ marginBottom: 15, alignItems: "center" }}>
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            {discount.title}
          </TextStyle>
          <TextStyle color={light.main2} title>
            {thousandsSystem(
              discount.amount - discountInAmount.replace(/[^0-9]/g, "")
            )}
          </TextStyle>
          {discountInAmount && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
              customStyle={{
                textDecorationLine: "line-through",
                textDecorationStyle: "solid",
              }}
            >
              {thousandsSystem(discount.amount)}
            </TextStyle>
          )}
        </View>
        <ButtonStyle
          backgroundColor={light.main2}
          style={{ opacity: discountInAmount ? 1 : 0.5 }}
          onPress={() => {
            if (discountInAmount) {
              if (discount.id) {
                const newSelection = selection.map((item) => {
                  const b = { ...item };
                  if (b.id === discount.id)
                    b.discount = parseInt(discountInAmount.replace(/[^0-9]/g, ""));
                  return b;
                });
                setTotalDiscount(0);
                setSelection(newSelection);
              } else setTotalDiscount(discountInAmount.replace(/[^0-9]/g, ""));
              navigation.pop();
            } else
              Alert.alert(
                "Oops",
                "Debes escribir el descuento en porcentaje o valor para poder continuar"
              );
          }}
        >
          <TextStyle center>Aplicar descuento</TextStyle>
        </ButtonStyle>
      </View>
    </Layout>
  );
};

export default CreatePercentage;

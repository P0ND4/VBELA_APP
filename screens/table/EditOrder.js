import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { View } from "react-native";
import { thousandsSystem } from "@helpers/libs";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import Layout from "@components/Layout";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const EditOrder = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);

  const id = route.params.id;
  const setSelection = route.params.setSelection;
  const selection = route.params.selection;
  const newSelection = route.params.newSelection;
  const setNewSelection = route.params.setNewSelection;
  const setNewSelectionFromPreviewOrder = route.params.setNewSelectionFromPreviewOrder;

  const [amount, setAmount] = useState(
    route.params.amount ? thousandsSystem(route.params.amount) : ""
  );
  const [price, setPrice] = useState(
    route.params.price ? thousandsSystem(route.params.price) : ""
  );
  const [count, setCount] = useState(
    route.params.count ? thousandsSystem(route.params.count) : ""
  );
  const [tip, setTip] = useState(
    route.params.tip ? thousandsSystem(route.params.tip) : ""
  );
  const [tax, setTax] = useState(
    route.params.tax ? thousandsSystem(route.params.tax) : ""
  );
  const [observation, setObservation] = useState(
    route.params.observation ? thousandsSystem(route.params.observation) : ""
  );

  useEffect(() => {
    navigation.setOptions({
      title:
        route.params.data === "price"
          ? "Precio unitario"
          : route.params.data === "tip"
          ? "Propina"
          : route.params.data === "observation"
          ? "Observación"
          : "Cantidad",
    });
  }, []);

  if (route.params.data === "observation") {
    return (
      <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
        <View />
        <View style={{ alignItems: "center" }}>
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Observación
          </TextStyle>
          <TextStyle
            verySmall
            color={light.main2}
            center
            customStyle={{ width: "80%" }}
          >
            Escriba una breve observación para ser más específico con el pedido,
            esto lo leerá cocina
          </TextStyle>
          <InputStyle
            placeholder="Ejemplo: (La ensalada sin cebolla)"
            maxLength={300}
            value={observation}
            onChangeText={(text) => setObservation(text)}
            stylesContainer={{ marginVertical: 10 }}
            multiline={true}
            numberOfLines={4}
            stylesInput={{ height: 140, textAlignVertical: "top" }}
          />
          <ButtonStyle
            backgroundColor="transparent"
            style={{
              borderWidth: 2,
              borderColor: light.main2,
              width: "50%",
            }}
            onPress={() => {
              const items = selection.map((item) => {
                const i = { ...item };
                if (i.id === id) i.observation = null;
                return i;
              });
              const itemsNew = newSelection.map((item) => {
                const i = { ...item };
                if (i.id === id) i.observation = null;
                return i;
              })
              setSelection(items);
              setNewSelection(itemsNew);
              setNewSelectionFromPreviewOrder(itemsNew);
              navigation.pop();
            }}
          >
            <TextStyle smallParagraph color={light.main2} center>
              Remover observación
            </TextStyle>
          </ButtonStyle>
        </View>
        <ButtonStyle
          backgroundColor={light.main2}
          onPress={() => {
            const items = selection.map((item) => {
              const i = { ...item };
              if (i.id === id) i.observation = observation;
              return i;
            });
            const itemsNew = newSelection.map((item) => {
              const i = { ...item };
              if (i.id === id) i.observation = observation;
              return i;
            });
            setSelection(items);
            setNewSelection(itemsNew);
            setNewSelectionFromPreviewOrder(itemsNew);
            navigation.pop();
          }}
        >
          <TextStyle smallParagraph center>Guardar</TextStyle>
        </ButtonStyle>
      </Layout>
    );
  }

  if (route.params.data === "count") {
    return (
      <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
        <View />
        <View style={{ alignItems: "center" }}>
          <TextStyle color={light.main2}>
            Vender {count === "" ? "1" : count} unidades del proximo producto:{" "}
          </TextStyle>
          <InputStyle
            placeholder="Cantidad"
            value={count}
            maxLength={5}
            keyboardType="numeric"
            onChangeText={(num) => {
              if (parseInt(num.replace(/[^0-9]/g, "")) <= 0) return;
              setCount(thousandsSystem(num.replace(/[^0-9]/g, "")));
            }}
            stylesContainer={{ width: "60%", marginVertical: 10 }}
            stylesInput={{ textAlign: "center", width: 0 }}
          />
        </View>
        <ButtonStyle
          backgroundColor={light.main2}
          onPress={() => {
            route.params.setCount(
              count === "" || count === "0"
                ? 1
                : parseInt(count.replace(/[^0-9]/g, ""))
            );
            navigation.pop();
          }}
        >
          <TextStyle smallParagraph center>Guardar</TextStyle>
        </ButtonStyle>
      </Layout>
    );
  }

  if (route.params.data === "item") {
    return (
      <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
        <View />
        <View style={{ alignItems: "center" }}>
          <TextStyle color={light.main2}>Cantidad: </TextStyle>
          <InputStyle
            placeholder="Cantidad"
            value={amount}
            maxLength={3}
            keyboardType="numeric"
            onChangeText={(num) => {
              if (parseInt(num.replace(/[^0-9]/g, "")) <= 0) return;
              setAmount(thousandsSystem(num.replace(/[^0-9]/g, "")));
            }}
            stylesContainer={{ width: "60%", marginVertical: 10 }}
            stylesInput={{ textAlign: "center", width: 0 }}
          />
          <ButtonStyle
            backgroundColor="transparent"
            style={{
              borderWidth: 2,
              borderColor: light.main2,
              width: "40%",
            }}
            onPress={() => {
              const remove = selection.filter((item) => item.id !== id);
              setSelection(remove);
              navigation.pop();
            }}
          >
            <TextStyle smallParagraph color={light.main2} center>
              Remover producto
            </TextStyle>
          </ButtonStyle>
        </View>
        <ButtonStyle
          backgroundColor={light.main2}
          onPress={() => {
            const items = selection.map((item) => {
              const i = { ...item };
              if (i.id === id) {
                i.count = parseInt(amount.replace(/[^0-9]/g, ""));
                i.total = parseInt(amount.replace(/[^0-9]/g, "")) * i.price;
              }
              return i;
            });
            setSelection(items);
            navigation.pop();
          }}
        >
          <TextStyle smallParagraph center>Guardar</TextStyle>
        </ButtonStyle>
      </Layout>
    );
  }

  if (route.params.data === "tax") {
    return (
      <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
        <View />
        <View style={{ alignItems: "center" }}>
          <TextStyle color={light.main2}>Impuesto establecido</TextStyle>
          <InputStyle
            placeholder="Cantidad"
            value={tax}
            maxLength={13}
            keyboardType="numeric"
            onChangeText={(num) => {
              if (parseInt(num.replace(/[^0-9]/g, "")) <= 0) return;
              setTax(thousandsSystem(num.replace(/[^0-9]/g, "")));
            }}
            stylesContainer={{ width: "60%", marginVertical: 10 }}
            stylesInput={{ textAlign: "center", width: 0 }}
          />
        </View>
        <ButtonStyle
          backgroundColor={light.main2}
          onPress={() => {
            if (tax !== "" && tax !== 0)
              route.params.setTax(parseInt(tax.replace(/[^0-9]/g, "")));
            navigation.pop();
          }}
        >
          <TextStyle smallParagraph center>Guardar</TextStyle>
        </ButtonStyle>
      </Layout>
    );
  }

  if (route.params.data === "tip") {
    return (
      <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
        <View />
        <View style={{ alignItems: "center" }}>
          <TextStyle color={light.main2}>Propina obtenida</TextStyle>
          <InputStyle
            placeholder="Cantidad"
            value={tip}
            maxLength={13}
            keyboardType="numeric"
            onChangeText={(num) => {
              if (parseInt(num.replace(/[^0-9]/g, "")) <= 0) return;
              setTip(thousandsSystem(num.replace(/[^0-9]/g, "")));
            }}
            stylesContainer={{ width: "60%", marginVertical: 10 }}
            stylesInput={{ textAlign: "center", width: 0 }}
          />
        </View>
        <ButtonStyle
          backgroundColor={light.main2}
          onPress={() => {
            if (tip !== "" && tip !== 0)
              route.params.setTip(parseInt(tip.replace(/[^0-9]/g, "")));
            navigation.pop();
          }}
        >
          <TextStyle smallParagraph center>Guardar</TextStyle>
        </ButtonStyle>
      </Layout>
    );
  }

  if (route.params.data === "price") {
    return (
      <Layout style={{ marginTop: 0, justifyContent: "space-between" }}>
        <View />
        <View style={{ alignItems: "center" }}>
          <TextStyle color={light.main2}>Editar precio unitario</TextStyle>
          <InputStyle
            placeholder="Precio"
            value={price}
            maxLength={10}
            keyboardType="numeric"
            onChangeText={(num) => {
              if (parseInt(num.replace(/[^0-9]/g, "")) <= 0) return;
              setPrice(thousandsSystem(num.replace(/[^0-9]/g, "")));
            }}
            stylesContainer={{ width: "60%", marginVertical: 10 }}
            stylesInput={{ textAlign: "center", width: 0 }}
          />
          <TextStyle
            verySmall
            color={mode === "light" ? light.textDark : dark.textWhite}
            customStyle={{ width: "50%" }}
            center
          >
            El precio unitario de este producto será cambiado por solo esta
            venta.
          </TextStyle>
        </View>
        <ButtonStyle
          backgroundColor={light.main2}
          onPress={() => {
            const items = selection.map((item) => {
              const i = { ...item };
              if (i.id === id) {
                i.total =
                  i.count * parseInt(price.replace(/[^0-9]/g, ""));
                i.price = parseInt(price.replace(/[^0-9]/g, ""));
              }
              return i;
            });
            setSelection(items);
            navigation.pop();
          }}
        >
          <TextStyle smallParagraph center>Guardar</TextStyle>
        </ButtonStyle>
      </Layout>
    );
  }
};

export default EditOrder;

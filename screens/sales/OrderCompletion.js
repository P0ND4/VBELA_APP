import { View } from "react-native";
import { useSelector } from "react-redux";
import { thousandsSystem, getFontSize } from "@helpers/libs";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import { useNavigation } from "@react-navigation/native";

const light = theme.colors.light;
const dark = theme.colors.dark;

const OrderCompletion = ({ route }) => {
  const mode = useSelector((state) => state.mode);

  const extra = route.params.extra;
  const selection = route.params.selection;
  const pay = route.params.selection;
  const total = route.params.total;
  const kitchen = route.params.kitchen;
  const sales = route.params.sales;

  const navigation = useNavigation();

  return (
    <Layout>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View />
        <View style={{ alignItems: "center" }}>
          <Ionicons
            name={!pay ? "time-outline" : "checkmark-circle-outline"}
            size={getFontSize(145)}
            color={light.main2}
          />
          <TextStyle
            bigParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {kitchen
              ? "Enviado a cocina"
              : !pay
              ? "Pedido registrado"
              : "Hecho"}
          </TextStyle>
          {!kitchen && (
            <TextStyle
              smallTitle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {thousandsSystem(total)}
            </TextStyle>
          )}
        </View>
        <View style={{ width: "100%" }}>
          {!kitchen && (
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() =>
                navigation.navigate("Invoice", { selection, total, extra })
              }
              left={() => (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="reader-outline"
                    color={light.textDark}
                    size={getFontSize(23)}
                    style={{ marginRight: 10 }}
                  />
                  <TextStyle bigParagraph>Factura</TextStyle>
                </View>
              )}
            />
          )}
          <ButtonStyle
            backgroundColor="transparent"
            style={{
              borderWidth: 2,
              borderColor: light.main2,
            }}
            onPress={() => navigation.pop()}
          >
            <TextStyle color={light.main2} center>
              {kitchen
                ? "Regresar"
                : sales
                ? "Vender más servicios/productos"
                : "Buscar otra mesa"}
            </TextStyle>
          </ButtonStyle>
        </View>
      </View>
    </Layout>
  );
};

export default OrderCompletion;

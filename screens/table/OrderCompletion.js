import { View } from "react-native";
import { useSelector } from "react-redux";
import { thousandsSystem } from "@helpers/libs";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const OrderCompletion = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);

  const data = route.params.data;
  const total = route.params.total;

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
            name={!data.pay ? "time-outline" : "checkmark-circle-outline"}
            size={180}
            color={light.main2}
          />
          <TextStyle
            bigParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {!data.pay ? "Pedido registrado" : "Hecho"}
          </TextStyle>
          <TextStyle
            smallTitle
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {thousandsSystem(total)}
          </TextStyle>
        </View>
        <View style={{ width: "100%" }}>
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={() => navigation.navigate("Invoice", { data })}
            left={() => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="reader-outline"
                  color={light.textDark}
                  size={28}
                  style={{ marginRight: 10 }}
                />
                <TextStyle bigParagraph>Factura</TextStyle>
              </View>
            )}
          />
          <ButtonStyle
            backgroundColor="transparent"
            style={{
              borderWidth: 2,
              borderColor: light.main2,
            }}
            onPress={() => navigation.pop()}
          >
            <TextStyle color={light.main2} center>Buscar otra mesa</TextStyle>
          </ButtonStyle>
        </View>
      </View>
    </Layout>
  );
};

export default OrderCompletion;

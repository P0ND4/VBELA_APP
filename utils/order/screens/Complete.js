import { useMemo } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { thousandsSystem, getFontSize } from "@helpers/libs";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();

const Complete = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);

  const data = route.params?.data;
  const status = route.params?.status;

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <Layout style={{ justifyContent: "space-between", alignItems: "center" }}>
      <View />
      <View style={{ alignItems: "center" }}>
        <Ionicons
          name={status === "paid" ? "checkmark-circle-outline" : "time-outline"}
          size={getFontSize(145)}
          color={light.main2}
        />
        {status !== "kitchen" && (
          <TextStyle subtitle color={light.main2} style={{ marginBottom: 5 }}>
            TICKET N°: {data.invoice}
          </TextStyle>
        )}
        <TextStyle subtitle color={textColor}>
          {status === "kitchen"
            ? "Enviado a cocina"
            : status === "pending"
            ? "Registrado"
            : "Finalizado"}
        </TextStyle>
        {status !== "kitchen" && (
          <TextStyle bigParagraph color={textColor}>
            Monto: {thousandsSystem(data.total)}
          </TextStyle>
        )}
      </View>
      <View style={{ width: "100%" }}>
        {status !== "kitchen" && (
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={() => navigation.navigate("Invoice", { data })}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="reader-outline"
                color={light.textDark}
                size={getFontSize(23)}
                style={{ marginRight: 10 }}
              />
              <TextStyle bigParagraph>Factura</TextStyle>
            </View>
          </ButtonStyle>
        )}
        <ButtonStyle
          backgroundColor="transparent"
          style={{ borderWidth: 2, borderColor: light.main2 }}
          onPress={() => navigation.pop()}
        >
          <TextStyle color={light.main2} center>
            Regresar
          </TextStyle>
        </ButtonStyle>
      </View>
    </Layout>
  );
};

export default Complete;

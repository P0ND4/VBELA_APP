import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { changeDate, thousandsSystem } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import Information from "@components/Information";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const DebtInformation = ({ modalVisible, setModalVisible, item, element, supplier }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const navigation = useNavigation();

  const navigateToInformation = () =>
    navigation.navigate("EntryOutputInformation", {
      type: item.type,
      item: element,
    });

  return (
    <Information
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      style={{ width: "90%" }}
      title="INFORMACIÓN"
      content={() => (
        <View>
          <TextStyle color={textColor}>
            Deudor: <TextStyle color={light.main2}>{supplier?.name}</TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Cédula del deudor:{" "}
            <TextStyle color={light.main2}>{supplier?.identification || "NO DEFINIDO"}</TextStyle>
          </TextStyle>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => navigateToInformation()}
          >
            <TextStyle color={textColor}>Elemento: </TextStyle>
            <TextStyle color={light.main2}>{element?.name}</TextStyle>
          </TouchableOpacity>
          <TextStyle color={textColor}>
            Valor actual:{" "}
            <TextStyle color={light.main2}>{thousandsSystem(element?.currentValue || "0")}</TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Valor de creación:{" "}
            <TextStyle color={light.main2}>{thousandsSystem(item?.currentValue || "0")}</TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Fecha de la {item?.type === "entry" ? "entrada" : "salida"}:{" "}
            <TextStyle color={light.main2}>{changeDate(new Date(item?.date))}</TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Elementos totales:{" "}
            <TextStyle color={light.main2}>{thousandsSystem(item?.quantity || "0")}</TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Elementos pagados:{" "}
            <TextStyle color={light.main2}>
              {thousandsSystem(item?.method?.reduce((a, b) => a + b.quantity, 0) || "0")}
            </TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Elementos por pagar:{" "}
            <TextStyle color={light.main2}>
              {item?.quantity - item?.method?.reduce((a, b) => a + b.quantity, 0)}
            </TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Tipo de deuda:{" "}
            <TextStyle color={light.main2}>{item?.type === "entry" ? "Entrada" : "Salida"}</TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Total:{" "}
            <TextStyle color={light.main2}>
              {thousandsSystem(item?.quantity * item?.currentValue || "0")}
            </TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Pagado:{" "}
            <TextStyle color={light.main2}>
              {thousandsSystem(item?.method?.reduce((a, b) => a + b.total, 0) || "0")}
            </TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Deuda:{" "}
            <TextStyle color={light.main2}>
              {thousandsSystem(
                item?.quantity * item?.currentValue - item?.method?.reduce((a, b) => a + b.total, 0) ||
                  "0"
              )}
            </TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Fecha de creación:{" "}
            <TextStyle color={light.main2}>{changeDate(new Date(item?.creationDate))}</TextStyle>
          </TextStyle>
          <TextStyle color={textColor}>
            Fecha de modificación:{" "}
            <TextStyle color={light.main2}>{changeDate(new Date(item?.modificationDate))}</TextStyle>
          </TextStyle>
        </View>
      )}
    />
  );
};

export default DebtInformation;

import { useState, useEffect, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { thousandsSystem, getFontSize } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import Information from "@components/Information";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const Observation = ({ item }) => {
  const mode = useSelector((state) => state.mode);

  const [open, isOpen] = useState(false);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <View>
      <View style={styles.row}>
        <TextStyle color={textColor}>
          <TextStyle color={light.main2} paragrahp>
            {thousandsSystem(item.quantity)}
          </TextStyle>
          x {item.name}
        </TextStyle>
        <TouchableOpacity onPress={() => isOpen(!open)}>
          <Ionicons color={light.main2} name={open ? "eye-off" : "eye"} size={getFontSize(18)} />
        </TouchableOpacity>
      </View>
      {open && (
        <View style={{ marginLeft: 8 }}>
          {item?.discount && (
            <TextStyle verySmall color={textColor}>
              <TextStyle color={light.main2} verySmall>
                Descuento:
              </TextStyle>{" "}
              {thousandsSystem(item?.discount)}
            </TextStyle>
          )}
          {item?.price && (
            <TextStyle verySmall color={textColor}>
              <TextStyle color={light.main2} verySmall>
                Precio:
              </TextStyle>{" "}
              {thousandsSystem(item?.price)}
            </TextStyle>
          )}
          <TextStyle verySmall color={textColor}>
            <TextStyle color={light.main2} verySmall>
              Total:
            </TextStyle>{" "}
            {thousandsSystem(item.total)}
          </TextStyle>
          {item?.observation && (
            <TextStyle verySmall color={light.main2}>
              {item?.observation}
            </TextStyle>
          )}
        </View>
      )}
    </View>
  );
};

const CommerceInformation = ({ item, modalVisible, setModalVisible }) => {
  const mode = useSelector((state) => state.mode);

  const [openInformationCard, isOpenInformationCard] = useState(false);
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    const totalPayment = item?.selection.reduce((a, b) => [...a, ...b.method], []);

    const simplifiedMethods = totalPayment.reduce((acc, p) => {
      const existingMethod = acc.find((s) => s.method === p.method);
      if (existingMethod)
        return acc.map((s) => (s.method === p.method ? { ...s, total: s.total + p.total } : s));
      else return [...acc, p];
    }, []);

    setMethods(simplifiedMethods);
  }, [item]);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <Information
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      style={{ width: "90%" }}
      title="INFORMACIÓN"
      content={() => (
        <View>
          <TextStyle smallParagraph color={textColor}>
            Información de las solicitudes de los pedidos
          </TextStyle>
          <ScrollView style={{ maxHeight: 400 }}>
            <View style={{ marginRight: 5 }}>
              {item.selection.map((item) => (
                <Observation key={item.id} item={item} />
              ))}
            </View>
            <View style={{ marginRight: 5 }}>
              <TextStyle color={textColor}>
                Identificación: <TextStyle color={light.main2}>{item.invoice}</TextStyle>
              </TextStyle>
              <View style={styles.row}>
                <TextStyle color={textColor}>
                  Método de pago: <TextStyle color={light.main2}>{methods.length} utilizados</TextStyle>
                </TextStyle>
                <TouchableOpacity onPress={() => isOpenInformationCard(!openInformationCard)}>
                  <Ionicons
                    color={light.main2}
                    name={openInformationCard ? "eye-off" : "eye"}
                    size={getFontSize(18)}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {openInformationCard && (
              <View style={{ marginLeft: 8 }}>
                {methods.map((m) => (
                  <TextStyle key={m.method} verySmall color={textColor}>
                    <TextStyle color={light.main2} verySmall>
                      {m.method === "cash"
                        ? "Efectivo"
                        : m.method === "card"
                        ? "Tarjeta"
                        : m.method === "others"
                        ? "Otros"
                        : "Crédito"}
                      :
                    </TextStyle>{" "}
                    {m.total}
                  </TextStyle>
                ))}
              </View>
            )}
            {item?.discount && (
              <TextStyle color={textColor}>
                Descuento: <TextStyle color={light.main2}>{thousandsSystem(item?.discount)}</TextStyle>
              </TextStyle>
            )}
            {item?.tax && (
              <TextStyle color={textColor}>
                Impuestos: <TextStyle color={light.main2}>{thousandsSystem(item?.tax)}</TextStyle>
              </TextStyle>
            )}
            {item?.tip && (
              <TextStyle color={textColor}>
                Propina: <TextStyle color={light.main2}>{thousandsSystem(item?.tip)}</TextStyle>
              </TextStyle>
            )}
            <TextStyle color={textColor}>
              Estado:{" "}
              <TextStyle color={light.main2}>
                {item.selection.some((s) => s.status === "credit")
                  ? "Esperando por pago"
                  : item?.status === "paid"
                  ? "Pagado"
                  : "Pendiente"}
              </TextStyle>
            </TextStyle>
            <TextStyle color={textColor}>
              Total: <TextStyle color={light.main2}>{thousandsSystem(item?.total)}</TextStyle>
            </TextStyle>
          </ScrollView>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default CommerceInformation;

import { useState, useEffect, useMemo } from "react";
import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { useSelector } from "react-redux";
import { thousandsSystem, getFontSize } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const Card = ({ item, countHandler, observationHandler, percentageHandler, changePreviews }) => {
  const mode = useSelector((state) => state.mode);

  const [show, setShow] = useState(false);
  const [total, setTotal] = useState(null);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(
    () => setTotal((item.quantity - item.paid) * item.price || 0 * (1 - item.discount || 0)),
    [item]
  );

  const Option = ({ icon, value, color = textColor, assistant, assistantColor, onPress }) => {
    return (
      <TouchableOpacity style={{ alignItems: "center" }} onPress={onPress}>
        <Ionicons name={icon} size={getFontSize(23)} color={color} />
        <TextStyle smallParagraph color={color}>
          {value}
        </TextStyle>
        {assistant && (
          <TextStyle smallParagraph color={assistantColor || color}>
            {assistant}
          </TextStyle>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: mode === "light" ? light.main5 : dark.main2 }]}>
      <TouchableOpacity style={[styles.row, { paddingHorizontal: 12 }]} onPress={() => setShow(!show)}>
        <TextStyle color={light.main2}>
          {thousandsSystem(item.quantity - item.paid)}
          <TextStyle color={textColor}>x {item.name}</TextStyle>
        </TextStyle>
        <TextStyle color={textColor}>{total ? thousandsSystem(Math.floor(total)) : "GRATIS"}</TextStyle>
      </TouchableOpacity>
      {show && (
        <View style={[styles.row, styles.showCard]}>
          <Option
            icon="file-tray-stacked"
            value={`${thousandsSystem(item.quantity - item.paid)} items`}
            onPress={() =>
              countHandler({
                title: "CANTIDAD",
                description: "Aumente o disminuya la cantidad de productos que desea tener",
                initialCount: item.quantity - item.paid,
                max: 9999999,
                placeholder: "Cantidad",
                onSubmit: (count) => {
                  const quantity = item.paid + count;

                  const send = () => {
                    const total = (quantity - item.paid) * item.price * (1 - item.discount || 0);
                    changePreviews({
                      id: item.id,
                      change: { quantity, total },
                    });
                  };

                  if (quantity) send();
                  else
                    Alert.alert(
                      "ELIMINAR",
                      "¿Estás seguro que desea eliminar esta orden?",
                      [
                        { text: "No estoy seguro", style: "cancel" },
                        { text: "Estoy seguro", onPress: () => send() },
                      ],
                      { cancelable: false }
                    );
                },
              })
            }
          />
          <Option
            icon="reader"
            value="Observación"
            assistant={item.observation ? `(${item?.observation?.length}) letras` : null}
            assistantColor={light.main2}
            onPress={() =>
              observationHandler({
                initialValue: item.observation,
                onSubmit: (value) => changePreviews({ id: item.id, change: { observation: value } }),
              })
            }
          />
          <Option
            icon="cash"
            value={item.price ? thousandsSystem(item.price) : "Gratis"}
            assistant="Unidad"
            onPress={() =>
              countHandler({
                title: "PRECIO",
                description: "Cambie el precio por unidad de este pedido",
                initialCount: item.price,
                max: 999999999,
                placeholder: "Precio",
                onSubmit: (count) => {
                  const total = (item.quantity - item.paid) * count || 0 * (1 - item.discount || 0);
                  changePreviews({
                    id: item.id,
                    change: { price: count || 0, total },
                  });
                },
              })
            }
          />
          <Option
            icon="pricetag"
            value="DESCUENTO"
            assistant={item.discount ? `${Math.floor(item.discount * 100)}%` : null}
            color={light.main2}
            onPress={() => {
              const total = Math.floor(item.total * (1 - item.discount || 0)) || null;
              percentageHandler({
                title: "DESCUENTO",
                description: "Defina el descuento que va a tener este pedido",
                limit: true,
                initialCount: total,
                max: total,
                remove: !!item.discount,
                onSubmit: ({ count }) => {
                  const discount = count
                    ? item.discount
                      ? item.discount + parseFloat((count / item.total).toFixed(2))
                      : parseFloat((count / item.total).toFixed(2))
                    : null;

                  const total = (item.quantity - item.paid) * item.price * (1 - discount || 0);
                  changePreviews({ id: item.id, change: { discount, total } });
                },
              });
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    paddingVertical: 6,
    borderRadius: 2,
    marginBottom: 5,
  },
  showCard: {
    marginTop: 10,
    paddingTop: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: light.main2,
  },
});

export default Card;

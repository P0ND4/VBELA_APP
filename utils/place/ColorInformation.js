import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import Information from "@components/Information";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const ColorInformation = ({ modalVisible, setModalVisible }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) =>
    mode === "light" ? light.textDark : dark.textWhite;
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <Information
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      style={{ width: "90%" }}
      title="COLORES"
      content={() => (
        <View>
          <TextStyle smallParagraph color={textColor}>
            Depende del estado de la reservación, es el color
          </TextStyle>
          <View style={{ marginTop: 15 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={[styles.square, { backgroundColor: "#f87575" }]}
              />
              <TextStyle smallParagraph color={textColor}>
                Algunos se fueron, otros no han llegado
              </TextStyle>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={[styles.square, { backgroundColor: "#b6e0f3" }]}
              />
              <TextStyle smallParagraph color={textColor}>
                Ya se fueron
              </TextStyle>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={[styles.square, { backgroundColor: "#ff9900" }]}
              />
              <TextStyle smallParagraph color={textColor}>
                Algunos se fueron, pero todavía faltan
              </TextStyle>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.square, { backgroundColor: "#00ffbc" }]} />
              <TextStyle smallParagraph color={textColor}>
                Ya llegaron
              </TextStyle>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.square, { backgroundColor: "#ffecb3" }]} />
              <TextStyle smallParagraph color={textColor}>
                Algunos han llegado, pero todavía faltan
              </TextStyle>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.square, { backgroundColor: light.main2 }]} />
              <TextStyle smallParagraph color={textColor}>
                Solo estan reservados (no han llegado)
              </TextStyle>
            </View>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  square: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginRight: 10,
  },
});

export default ColorInformation;

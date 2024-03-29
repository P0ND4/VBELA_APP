import { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useSelector } from "react-redux";
import { thousandsSystem } from "@helpers/libs";
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
  title = "",
  description = "",
  max = 999,
  min = 0,
  initialCount = "1",
  placeholder = "",
  remove,
  onSubmit = () => {},
}) => {
  const mode = useSelector((state) => state.mode);

  const [count, setCount] = useState("1");

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => setCount(thousandsSystem(String(initialCount))), [initialCount]);

  return (
    <Information
      onClose={() => setCount(1)}
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      title={title}
      content={() => (
        <View>
          <TextStyle style={{ marginBottom: 5 }} smallParagraph color={textColor}>
            {description}
          </TextStyle>
          <View style={[styles.center, { marginVertical: 15 }]}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                const filtered = parseInt(count.replace(/[^0-9]/g, "") || 0) - 1;
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
              placeholder={placeholder}
              keyboardType="numeric"
              maxLength={thousandsSystem(String(max)).length}
              onChangeText={(num) => {
                const value = parseInt(num.replace(/[^0-9]/g, "")) || "";
                if (value >= min && value <= max) setCount(thousandsSystem(value));
              }}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                const filtered = parseInt(count.replace(/[^0-9]/g, "") || 0) + 1;
                filtered <= max && setCount(thousandsSystem(filtered));
              }}
            >
              <TextStyle bigSubtitle>+</TextStyle>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            {remove && (
              <ButtonStyle
                backgroundColor={mode === "light" ? dark.main2 : light.main5}
                style={{ width: "auto", flexGrow: 1, marginRight: 2 }}
                onPress={() => {
                  onSubmit(null);
                  setModalVisible(!modalVisible);
                }}
              >
                <TextStyle center>Eliminar</TextStyle>
              </ButtonStyle>
            )}
            <ButtonStyle
              backgroundColor={light.main2}
              style={{ width: "auto", flexGrow: 1, marginLeft: 2 }}
              onPress={() => {
                onSubmit(parseInt(count.replace(/[^0-9]/g, "")) || null);
                setModalVisible(!modalVisible);
              }}
            >
              <TextStyle center>Guardar</TextStyle>
            </ButtonStyle>
          </View>
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

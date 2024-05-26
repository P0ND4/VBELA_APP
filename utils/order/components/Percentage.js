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

const Counter = ({ value, min = 0, max = 999, maxLength, placeholder, onChange = () => {} }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <View style={styles.row}>
      <TextStyle color={textColor}>{placeholder}</TextStyle>
      <View style={[styles.center, { marginVertical: 5 }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const filtered = parseInt(value.replace(/[^0-9]/g, "") || 0) - 1;
            filtered >= min && onChange(filtered || "");
          }}
        >
          <TextStyle bigSubtitle>-</TextStyle>
        </TouchableOpacity>
        <InputStyle
          stylesContainer={{
            maxWidth: 120,
            borderBottomWidth: 1,
            borderColor: textColor,
          }}
          stylesInput={{ textAlign: "center" }}
          value={value}
          placeholder={placeholder}
          keyboardType="numeric"
          maxLength={maxLength}
          onChangeText={(num) => {
            const value = parseInt(num.replace(/[^0-9]/g, "")) || "";
            if (value >= min && value <= max) onChange(value);
          }}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const filtered = parseInt(value.replace(/[^0-9]/g, "") || 0) + 1;
            filtered <= max && onChange(filtered);
          }}
        >
          <TextStyle bigSubtitle>+</TextStyle>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Percentage = ({
  modalVisible,
  setModalVisible,
  title,
  description,
  max = 999,
  min = 0,
  limit,
  remove,
  initialCount = "1",
  onSubmit,
}) => {
  const mode = useSelector((state) => state.mode);

  const [count, setCount] = useState("1");
  const [percentage, setPercentage] = useState("");

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    setCount(thousandsSystem(initialCount || ""));
    setPercentage(initialCount ? "100" : "");
  }, [initialCount]);

  return (
    <Information
      onClose={() => setCount("1")}
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      title={title}
      content={() => (
        <View>
          <TextStyle style={{ marginBottom: 5 }} smallParagraph color={textColor}>
            {description}
          </TextStyle>
          {![null].includes(max, min) && (
            <View style={{ marginVertical: 15 }}>
              <Counter
                value={count}
                min={min}
                max={max}
                placeholder="Cantidad"
                maxLength={thousandsSystem(max).length}
                onChange={(count) => {
                  const converted = parseInt(initialCount);
                  const value = Math.floor((count / converted) * 100);
                  setPercentage(thousandsSystem(value || ""));
                  setCount(thousandsSystem(count));
                }}
              />
              <Counter
                value={percentage}
                placeholder="Porcentaje"
                max={limit ? 100 : 1000}
                maxLength={thousandsSystem(limit ? 100 : 1000).length}
                onChange={(percentage) => {
                  const count = Math.floor((percentage / 100) * parseInt(initialCount)) || "";
                  setCount(thousandsSystem(count));
                  setPercentage(thousandsSystem(percentage));
                }}
              />
            </View>
          )}
          <View style={styles.row}>
            {remove && (
              <ButtonStyle
                backgroundColor={mode === "light" ? dark.main2 : light.main5}
                style={{ width: "auto", flexGrow: 1, marginRight: 2 }}
                onPress={() => {
                  onSubmit({ percentage: null, count: null });
                  setModalVisible(!modalVisible);
                }}
              >
                <TextStyle center>Eliminar</TextStyle>
              </ButtonStyle>
            )}
            {![null].includes(max, min) && (
              <ButtonStyle
                backgroundColor={light.main2}
                style={{ width: "auto", flexGrow: 1, marginLeft: 2 }}
                onPress={() => {
                  const filtered = (value) => parseInt(value.replace(/[^0-9]/g, ""));
                  onSubmit({ percentage: filtered(percentage) || null, count: filtered(count) || null });
                  setModalVisible(!modalVisible);
                }}
              >
                <TextStyle center>Guardar</TextStyle>
              </ButtonStyle>
            )}
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

export default Percentage;

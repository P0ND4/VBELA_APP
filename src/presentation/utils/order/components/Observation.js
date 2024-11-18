import { useEffect, useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import Information from "@components/Information";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { light, dark } = theme();

const Observation = ({ modalVisible, setModalVisible, initialValue = "", onSubmit = () => {} }) => {
  const mode = useSelector((state) => state.mode);

  const [observation, setObservation] = useState("");

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => setObservation(initialValue), [initialValue]);

  const send = (value) => {
    onSubmit(value);
    setObservation("");
    setModalVisible(!modalVisible);
  };

  return (
    <Information
      onClose={() => setObservation("")}
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      title="OBSERVACIÓN"
      content={() => (
        <View>
          <TextStyle style={{ marginBottom: 5 }} smallParagraph color={textColor}>
            Escriba una breve observación para ser más específico con el pedido
          </TextStyle>
          <InputStyle
            placeholder="Escriba su observación"
            maxLength={300}
            value={observation}
            onChangeText={(text) => setObservation(text)}
            stylesContainer={{ marginVertical: 15 }}
            multiline={true}
            numberOfLines={4}
            stylesInput={styles.input}
          />
          <View style={styles.row}>
            {observation && (
              <ButtonStyle
                backgroundColor={mode === "light" ? dark.main2 : light.main5}
                style={{ width: "auto", flexGrow: 1, marginRight: 2 }}
                onPress={() => send(null)}
              >
                <TextStyle center>Eliminar</TextStyle>
              </ButtonStyle>
            )}
            <ButtonStyle
              backgroundColor={light.main2}
              style={{ width: "auto", flexGrow: 1, marginLeft: 2 }}
              onPress={() => send(observation || null)}
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    height: 140,
    textAlignVertical: "top",
    borderRadius: 5,
    borderColor: light.main2,
    borderWidth: 1,
  },
});

export default Observation;

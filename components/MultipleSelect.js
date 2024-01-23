import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getFontSize } from "@helpers/libs";
import InputStyle from "./InputStyle";
import TextStyle from "./TextStyle";
import ButtonStyle from "./ButtonStyle";
import theme from "@theme";
import Ionicons from "@expo/vector-icons/Ionicons";

const { light, dark } = theme();

const MultipleSelect = ({
  modalVisible,
  setModalVisible,
  noItemsText,
  data,
  onSelectedItemsChange,
  selected,
}) => {
  const mode = useSelector((state) => state.mode);
  const [search, setSearch] = useState("");
  const [information, setInformation] = useState(data);
  const [selectedItems, setSelectedItems] = useState(selected || []);

  useEffect(() => {
    if (search) {
      setInformation(
        data.filter((d) => {
          const word = search
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

          if (
            d.name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .includes(word)
          )
            return d;
        })
      );
    } else setInformation(data);
  }, [search]);

  return (
    <Modal
      animationType="fade"
      statusBarTranslucent={false}
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <TouchableWithoutFeedback onPress={() => setModalVisible(!modalVisible)}>
        <View
          style={[{ backgroundColor: "#0004" }, StyleSheet.absoluteFillObject]}
        />
      </TouchableWithoutFeedback>
      <View style={styles.centeredView}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: mode === "light" ? light.main5 : dark.main2,
            },
          ]}
        >
          <View style={styles.row}>
            <InputStyle
              value={search}
              maxLength={50}
              onChangeText={(text) => setSearch(text)}
              placeholder="Buscar"
              stylesContainer={{
                width: "90%",
                borderBottomWidth: 1,
                borderBottomColor: light.main2,
              }}
            />
            <Ionicons
              name="search"
              size={getFontSize(24)}
              color={mode === "light" ? light.textDark : dark.textWhite}
            />
          </View>
          <ScrollView
            style={{ marginVertical: 15, maxHeight: 300 }}
            showsVerticalScrollIndicator={false}
          >
            {!information?.length && (
              <TextStyle center color={light.main2} bigParagraph>
                {noItemsText}
              </TextStyle>
            )}
            {information?.map((item) => {
              return (
                <TouchableOpacity
                  style={styles.row}
                  key={item.id}
                  onPress={() => {
                    const found = selectedItems.includes(item.id);
                    const response = found
                      ? selectedItems.filter((s) => s !== item.id)
                      : [...selectedItems, item.id];
                    setSelectedItems(response);
                  }}
                >
                  <TextStyle
                    bigParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {item.name}
                  </TextStyle>
                  <Ionicons
                    name={
                      selectedItems.find((s) => s === item.id)
                        ? "checkbox-outline"
                        : "square-outline"
                    }
                    size={30}
                    color={light.main2}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {selectedItems.length > 0 && (
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() => setSelectedItems([])}
            >
              <TextStyle center>Remover todo</TextStyle>
            </ButtonStyle>
          )}
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={() => {
              setModalVisible(!modalVisible);
              onSelectedItemsChange(selectedItems);
            }}
          >
            <TextStyle center>Guardar</TextStyle>
          </ButtonStyle>
        </View>
      </View>
      <StatusBar backgroundColor="#0004" />
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  container: {
    width: "90%",
    padding: 20,
    borderRadius: 8,
  },
});

export default MultipleSelect;

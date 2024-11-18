import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import Information from "./Information";
import InputStyle from "./InputStyle";
import TextStyle from "./TextStyle";
import ButtonStyle from "./ButtonStyle";
import theme from "@theme";
import Ionicons from "@expo/vector-icons/Ionicons";

const { light, dark } = theme();

const Card = ({ item, onChange, isActive }) => {
  const mode = useSelector((state) => state.mode);

  return (
    <TouchableOpacity style={styles.row} onPress={() => onChange({ item })}>
      <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>{item.name}</TextStyle>
      <Ionicons
        name={isActive ? "remove-circle" : "add-circle-outline"}
        color={light.main2}
        size={25}
      />
    </TouchableOpacity>
  );
};

const Preview = ({ item, onChange }) => {
  const mode = useSelector((state) => state.mode);

  return (
    <TouchableOpacity
      onPress={() => onChange({ item })}
      style={[styles.previewCard, { backgroundColor: mode === "light" ? light.main4 : dark.main1 }]}
    >
      <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
        {item.name}
      </TextStyle>
      <Ionicons
        name="close-circle-outline"
        style={{ marginLeft: 5 }}
        color={light.main2}
        size={25}
      />
    </TouchableOpacity>
  );
};

const MultipleSelect = ({
  modalVisible,
  setModalVisible,
  title = "",
  noItemsText,
  data,
  onSubmit,
  defaultValue = [],
}) => {
  const mode = useSelector((state) => state.mode);

  const [selections, setSelections] = useState(null);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    if (selected.length !== 0) setSelected(selected.filter((s) => data.some((d) => s.id === d.id)));
    else setSelected(defaultValue);
  }, [data, defaultValue]);

  useEffect(() => {
    if (search) {
      const convertText = (text) =>
        text
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

      const filtered = data.filter((d) => convertText(d.name).includes(convertText(search)));
      setSelections(filtered);
    } else setSelections(data);
  }, [data, search]);

  const onChange = ({ item }) => {
    const exists = selected.some((s) => s.id === item.id);
    if (exists) setSelected(selected.filter((s) => s.id !== item.id));
    else setSelected([...selected, item]);
  };

  return (
    <Information
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      title={title}
      content={() => (
        <View>
          {data?.length > 0 && (
            <InputStyle
              onChangeText={(text) => setSearch(text)}
              value={search}
              placeholder="Busca por nombre"
              stylesContainer={styles.search}
            />
          )}
          {selected.length > 0 && (
            <View style={{ marginVertical: 5 }}>
              <TextStyle color={textColor} verySmall>
                Seleccionado
              </TextStyle>
              <FlatList
                style={{ marginTop: 5 }}
                data={selected}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Preview item={item} onChange={onChange} />}
              />
            </View>
          )}
          {selections?.length === 0 && (
            <TextStyle style={{ marginTop: 5 }} color={textColor} smallParagraph>
              {noItemsText}
            </TextStyle>
          )}
          {data?.length > 0 && (
            <FlatList
              data={selections || []}
              style={{ maxHeight: 400, marginVertical: 5 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isActive = selected.some((s) => s.id === item.id);
                return <Card item={item} onChange={onChange} isActive={isActive} />;
              }}
            />
          )}
          {data?.length > 0 && (
            <View style={styles.row}>
              {false && (
                <ButtonStyle
                  backgroundColor={mode === "light" ? dark.main1 : light.main4}
                  style={{ flexGrow: 1, width: "auto", marginRight: 4 }}
                >
                  <TextStyle center>Remover</TextStyle>
                </ButtonStyle>
              )}
              <ButtonStyle
                backgroundColor={light.main2}
                style={{ flexGrow: 3, width: "auto" }}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  onSubmit(selected);
                }}
              >
                <TextStyle center>Guardar</TextStyle>
              </ButtonStyle>
            </View>
          )}
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
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 2,
  },
  search: {
    borderBottomWidth: 1,
    borderColor: light.main2,
  },
});

export default MultipleSelect;

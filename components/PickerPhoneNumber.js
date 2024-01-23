import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";
import { getFontSize } from "@helpers/libs";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import CountriesImages from "@assets/countries";
import countries from "@countries.json";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();

const PickerPhoneNumber = ({ modalVisible, setModalVisible, onChange }) => {
  const mode = useSelector((state) => state.mode);

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const keyword = filter.toLocaleLowerCase().replace("+", "");

    if (keyword.length === 0) setData(countries);
    else {
      const filteredData = countries.filter((c) =>
        ["country_name", "country_short_name", "country_phone_code"].some(
          (field) => String(c[field]).toLowerCase().includes(keyword)
        )
      );

      setData(filteredData);
    }
  }, [filter]);

  const Country = React.memo(({ item }) => {
    return (
      <TouchableOpacity
        style={[
          {
            paddingVertical: 8,
          },
          styles.row,
        ]}
        onPress={() => {
          onChange(item);
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={CountriesImages[item.country_short_name.toLowerCase()]}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
          <TextStyle
            color={mode === "light" ? light.textDark : dark.textWhite}
            style={{ marginLeft: 10 }}
            smallParagraph
          >
            {item.country_name}
          </TextStyle>
        </View>
        <TextStyle
          color={mode === "light" ? light.textDark : dark.textWhite}
          smallParagraph
        >
          +{item.country_phone_code}
        </TextStyle>
      </TouchableOpacity>
    );
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
        setFilter("");
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          setModalVisible(!modalVisible);
          setFilter("");
        }}
      >
        <View style={{ backgroundColor: "#0005", height: "42%" }} />
      </TouchableWithoutFeedback>
      <View
        style={[
          styles.countriesContainer,
          {
            backgroundColor: mode === "light" ? light.main4 : dark.main1,
          },
        ]}
      >
        <View style={styles.row}>
          <TextStyle
            bigParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            Seleccionar el código de zona
          </TextStyle>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(!modalVisible);
              setFilter("");
            }}
          >
            <Ionicons
              name="close"
              color={
                mode === "light" ? `${light.textDark}66` : `${dark.textWhite}66`
              }
              size={getFontSize(24)}
            />
          </TouchableOpacity>
        </View>
        <InputStyle
          left={() => (
            <Ionicons
              style={{ marginRight: 10 }}
              name="search"
              color={
                mode === "light" ? `${light.textDark}66` : `${dark.textWhite}66`
              }
              size={getFontSize(24)}
            />
          )}
          placeholder="Buscar"
          value={filter}
          onChangeText={(text) => setFilter(text)}
          stylesContainer={{ marginTop: 20, marginBottom: 15 }}
          stylesInput={{ maxWidth: "85%" }}
        />
        <FlatList
          data={data}
          windowSize={25}
          initialNumToRender={10}
          decelerationRate="fast"
          scrollSpeedMultiplier={0.5}
          keyExtractor={(item) => item.country_short_name}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <Country item={item} />}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  countriesContainer: {
    width: "100%",
    height: "60%",
    position: "absolute",
    bottom: 0,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default PickerPhoneNumber;

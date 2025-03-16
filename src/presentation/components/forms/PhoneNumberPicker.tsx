import React, { useState, useEffect, useCallback } from "react";
import { View, TouchableOpacity, FlatList, Image, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import StyledText from "presentation/components/text/StyledText";
import StyledInput from "presentation/components/input/StyledInput";
import CountriesImages from "presentation/assets/countries";
import countries from "shared/data/countries.json";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Country } from "domain/entities/shared/Country";
import FloorModal from "../modal/FloorModal";

type CountryCode = keyof typeof CountriesImages;
type CountryFields = "country_name" | "country_short_name" | "country_phone_code";

type PickerPhoneNumberProps = {
  modalVisible?: boolean;
  setModalVisible?: (value: boolean) => void;
  onChange?: (country: Country) => void;
};

const CountryCard: React.FC<{ country: Country; onPress: (country: Country) => void }> = React.memo(
  ({ country, onPress }) => {
    const countryShortName = country?.country_short_name.toLowerCase() as CountryCode;

    return (
      <TouchableOpacity style={[styles.countryCard, styles.row]} onPress={() => onPress(country)}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={CountriesImages[countryShortName]} style={styles.countryImage} />
          <StyledText style={{ marginLeft: 10 }} smallParagraph>
            {country.country_name}
          </StyledText>
        </View>
        <StyledText smallParagraph>+{country.country_phone_code}</StyledText>
      </TouchableOpacity>
    );
  },
);

CountryCard.displayName = "CountryCard";

const PhoneNumberPicker: React.FC<PickerPhoneNumberProps> = ({
  modalVisible = false,
  setModalVisible = () => {},
  onChange = () => {},
}) => {
  const { colors } = useTheme();
  const [data, setData] = useState<Country[]>([]);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const keyword = filter.toLocaleLowerCase().replace("+", "");

    setData(
      keyword.length === 0
        ? countries
        : countries.filter((c) =>
            (["country_name", "country_short_name", "country_phone_code"] as CountryFields[]).some(
              (field) => String(c[field]).toLowerCase().includes(keyword),
            ),
          ),
    );
  }, [filter]);

  const handleCountryPress = useCallback(
    (country: Country) => {
      onChange(country);
      setModalVisible(false);
      setFilter("");
    },
    [onChange, setModalVisible],
  );

  return (
    <FloorModal
      title="Seleccionar el código de zona"
      animationType="fade"
      style={{ height: "60%" }}
      visible={modalVisible}
      onClose={() => {
        setModalVisible(false);
        setFilter("");
      }}
    >
      <StyledInput
        left={() => <Ionicons name="search" color={colors.text} size={22} />}
        placeholder="Buscar"
        value={filter}
        onChangeText={setFilter}
        stylesContainer={{ marginTop: 20, marginBottom: 15 }}
      />
      <FlatList
        data={data}
        windowSize={25}
        initialNumToRender={10}
        decelerationRate="fast"
        keyExtractor={(item) => item.country_short_name}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        renderItem={({ item }) => <CountryCard country={item} onPress={handleCountryPress} />}
      />
    </FloorModal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countryCard: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  countryImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default PhoneNumberPicker;

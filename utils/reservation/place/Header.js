import { useMemo, useRef } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { useSelector } from "react-redux";
import { getFontSize, months } from "@helpers/libs";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const Header = ({ zoneID, month, setMonth, year, setYear, searchEvent }) => {
  const mode = useSelector((state) => state.mode);

  const navigation = useNavigation();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);
  const getCardColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const cardColor = useMemo(() => getCardColor(mode), [mode]);

  const monthPickerRef = useRef();
  const yearPickerRef = useRef();

  return (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => monthPickerRef.current.focus()}>
              <TextStyle smallTitle color={light.main2}>
                {months[month]}
              </TextStyle>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => yearPickerRef.current.focus()}>
              <TextStyle style={{ marginLeft: 10 }} color={textColor}>
                {year}
              </TextStyle>
            </TouchableOpacity>
          </View>
          <TextStyle bigParagraph color={textColor}>
            Disponibles
          </TextStyle>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "UYUYUYUYUYU",
                "Quiero agregarle filtros, pero el tiempo me cayo encima, asi que, PROXIMAMENTE"
              );
              //searchEvent()
            }}
          >
            <Ionicons name="search" size={getFontSize(31)} color={light.main2} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ZoneInformation", { zoneID })}>
            <Ionicons
              name="information-circle-outline"
              size={getFontSize(31)}
              color={light.main2}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("CreatePlace", { zoneID })}>
            <Ionicons name="add-circle" size={getFontSize(32)} color={light.main2} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ display: "none" }}>
        <Picker
          ref={monthPickerRef}
          style={{ color: textColor }}
          selectedValue={month}
          onValueChange={(value) => setMonth(value)}
        >
          {months.map((item, i) => (
            <Picker.Item
              key={item}
              label={item}
              value={i}
              style={{ backgroundColor: cardColor }}
              color={textColor}
            />
          ))}
        </Picker>
        <Picker
          ref={yearPickerRef}
          style={{ color: textColor }}
          selectedValue={year}
          onValueChange={(value) => setYear(value)}
        >
          {Array.from({ length: 10 }, (_, i) => {
            const fiveYearsAgo = new Date().setFullYear(new Date().getFullYear() - 5);
            return new Date(fiveYearsAgo).getFullYear() + i;
          }).map((item, i) => (
            <Picker.Item
              key={item}
              label={item.toString()}
              value={item}
              style={{ backgroundColor: cardColor }}
              color={textColor}
            />
          ))}
        </Picker>
      </View>
    </>
  );
};

export default Header;

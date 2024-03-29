import { useState, useEffect, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import { months, getFontSize } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();
const { width: SCREEN_WIDTH } = Dimensions.get("screen");

const FullFilterDate = ({
  title,
  defaultValue,
  onChangeDay,
  onChangeMonth,
  onChangeYear,
  increment = 10,
  start = 5,
  containerStyle = {},
  dayButtonStyle = {},
  monthButtonStyle = {},
  yearButtonStyle = {},
  style = {},
}) => {
  const mode = useSelector((state) => state.mode);

  const [day, setDay] = useState(defaultValue?.day || "all");
  const [month, setMonth] = useState(defaultValue?.month || "all");
  const [year, setYear] = useState(defaultValue?.year || "all");

  const [days, setDays] = useState([]);
  const [years, setYears] = useState([]);

  const dayRef = useRef();
  const monthRef = useRef();
  const yearRef = useRef();

  useEffect(() => {
    const years = Array.from({ length: increment }, (_, i) => {
      const fiveYearsAgo = new Date().setFullYear(new Date().getFullYear() - start);
      return new Date(fiveYearsAgo).getFullYear() + i;
    });

    setYears(years);
  }, []);

  useEffect(() => {
    const date = new Date();
    const days = new Date(
      year === "all" ? date.getFullYear() : year,
      month === "all" ? 1 : month + 1,
      0
    ).getDate();
    const monthDays = [];
    for (let day = 0; day < days; day++) {
      monthDays.push(day + 1);
    }
    setDays(monthDays);
  }, [year, month]);

  return (
    <View style={containerStyle}>
      {title && (
        <TextStyle
          smallParagraph
          color={mode === "light" ? light.textDark : dark.textWhite}
          style={{ marginTop: 5 }}
        >
          {title}
        </TextStyle>
      )}
      <View style={[styles.row]}>
        <View>
          <ButtonStyle
            backgroundColor={mode === "light" ? light.main5 : dark.main2}
            style={[
              {
                width: SCREEN_WIDTH / 4.5,
                paddingVertical: 16,
              },
              dayButtonStyle,
              style,
            ]}
            onPress={() => dayRef.current?.focus()}
          >
            <View style={styles.row}>
              <TextStyle
                color={day !== "all" ? (mode === "light" ? light.textDark : dark.textWhite) : "#888888"}
                smallParagraph
              >
                {day !== "all" ? day : "Día"}
              </TextStyle>
              <Ionicons
                color={day !== "all" ? (mode === "light" ? light.textDark : dark.textWhite) : "#888888"}
                size={getFontSize(10)}
                name="caret-down"
              />
            </View>
          </ButtonStyle>

          <View style={{ display: "none" }}>
            <Picker
              ref={dayRef}
              mode="dropdown"
              selectedValue={day}
              onValueChange={(itemValue) => {
                setDay(itemValue);
                if (onChangeDay) onChangeDay(itemValue);
              }}
              style={{ opacity: 0 }}
            >
              <Picker.Item
                label="Día"
                value="all"
                style={{
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                }}
                color={mode === "light" ? light.textDark : dark.textWhite}
              />
              {days.map((day) => (
                <Picker.Item
                  key={day}
                  label={`${day}`}
                  value={day}
                  style={{
                    backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  }}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View>
          <ButtonStyle
            backgroundColor={mode === "light" ? light.main5 : dark.main2}
            style={[
              {
                width: SCREEN_WIDTH / 3.6,
                paddingVertical: 16,
              },
              monthButtonStyle,
              style,
            ]}
            onPress={() => monthRef.current?.focus()}
          >
            <View style={styles.row}>
              <TextStyle
                color={
                  month !== "all" ? (mode === "light" ? light.textDark : dark.textWhite) : "#888888"
                }
                smallParagraph
              >
                {month !== "all" ? months[month - 1] : "Mes"}
              </TextStyle>
              <Ionicons
                color={
                  month !== "all" ? (mode === "light" ? light.textDark : dark.textWhite) : "#888888"
                }
                size={getFontSize(10)}
                name="caret-down"
              />
            </View>
          </ButtonStyle>
          <View style={{ display: "none" }}>
            <Picker
              ref={monthRef}
              mode="dropdown"
              selectedValue={month}
              onValueChange={(itemValue) => {
                setMonth(itemValue);
                if (onChangeMonth) onChangeMonth(itemValue);
              }}
              style={{ opacity: 0 }}
            >
              <Picker.Item
                label="Mes"
                value="all"
                style={{
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                }}
                color={mode === "light" ? light.textDark : dark.textWhite}
              />
              {months.map((month, index) => (
                <Picker.Item
                  key={month}
                  label={month}
                  value={index + 1}
                  style={{
                    backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  }}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View>
          <ButtonStyle
            backgroundColor={mode === "light" ? light.main5 : dark.main2}
            style={[
              {
                width: SCREEN_WIDTH / 4.5,
                paddingVertical: 16,
              },
              yearButtonStyle,
              style,
            ]}
            onPress={() => yearRef.current?.focus()}
          >
            <View style={styles.row}>
              <TextStyle
                color={year !== "all" ? (mode === "light" ? light.textDark : dark.textWhite) : "#888888"}
                smallParagraph
              >
                {year !== "all" ? year : "Año"}
              </TextStyle>
              <Ionicons
                color={year !== "all" ? (mode === "light" ? light.textDark : dark.textWhite) : "#888888"}
                size={getFontSize(10)}
                name="caret-down"
              />
            </View>
          </ButtonStyle>
          <View style={{ display: "none" }}>
            <Picker
              ref={yearRef}
              mode="dropdown"
              selectedValue={year}
              onValueChange={(itemValue) => {
                setYear(itemValue);
                if (onChangeYear) onChangeYear(itemValue);
              }}
              style={{ opacity: 0 }}
            >
              <Picker.Item
                label="Año"
                value="all"
                style={{
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                }}
                color={mode === "light" ? light.textDark : dark.textWhite}
              />
              {years.map((year, index) => (
                <Picker.Item
                  key={year}
                  label={`${year}`}
                  value={year}
                  style={{
                    backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  }}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default FullFilterDate;

import { View, Modal, TouchableWithoutFeedback, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { getFontSize, thousandsSystem } from "@helpers/libs";
import TextStyle from "@components/TextStyle";
import FullFilterDate from "@components/FullFilterDate";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();

const Filters = ({ setActive, active, setFilters, filters, initialState }) => {
  const mode = useSelector((state) => state.mode);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={active}
      onRequestClose={() => {
        setActive(!active);
        setFilters(initialState);
      }}
    >
      <TouchableWithoutFeedback onPress={() => setActive(!active)}>
        <View style={{ backgroundColor: "#0005", height: "100%" }} />
      </TouchableWithoutFeedback>
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: mode === "light" ? light.main4 : dark.main1,
            },
          ]}
        >
          <View>
            <View style={styles.row}>
              <TextStyle bigSubtitle color={light.main2} bold>
                FILTRA
              </TextStyle>
              <TouchableOpacity
                onPress={() => {
                  setActive(false);
                  setFilters(initialState);
                }}
              >
                <Ionicons
                  name="close"
                  size={getFontSize(24)}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                />
              </TouchableOpacity>
            </View>
            <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
              Para una búsqueda más precisa
            </TextStyle>
          </View>
          <View style={{ marginTop: 6 }}>
            <View style={[styles.row, { marginTop: 15 }]}>
              <View style={{ width: "48%" }}>
                <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
                  Valor MIN
                </TextStyle>
                <InputStyle
                  value={filters.minValue}
                  onChangeText={(text) => {
                    const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                    setFilters({ ...filters, minValue: value });
                  }}
                  placeholder="MIN"
                  keyboardType="numeric"
                  maxLength={11}
                />
              </View>
              <View style={{ width: "48%" }}>
                <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
                  Valor MAX
                </TextStyle>
                <InputStyle
                  value={filters.maxValue}
                  onChangeText={(text) => {
                    const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                    setFilters({ ...filters, maxValue: value });
                  }}
                  placeholder="MAX"
                  keyboardType="numeric"
                  maxLength={11}
                />
              </View>
            </View>
            <FullFilterDate
              title="Por fecha (CREACIÓN)"
              defaultValue={{
                day: filters.day,
                month: filters.month,
                year: filters.year,
              }}
              increment={5}
              onChangeDay={(value) => setFilters({ ...filters, day: value })}
              onChangeMonth={(value) => setFilters({ ...filters, month: value })}
              onChangeYear={(value) => setFilters({ ...filters, year: value })}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            {filters.active && (
              <ButtonStyle
                style={{ width: "35%" }}
                backgroundColor={mode === "light" ? light.main5 : dark.main2}
                onPress={() => {
                  setActive(false);
                  setFilters(initialState);
                }}
              >
                <TextStyle center color={mode === "light" ? light.textDark : dark.textWhite}>
                  Remover
                </TextStyle>
              </ButtonStyle>
            )}
            <ButtonStyle
              onPress={() => {
                setActive(!active);
                const compare = { ...filters, active: false };

                if (JSON.stringify(compare) === JSON.stringify(initialState)) {
                  setFilters(initialState);
                  return;
                }
                setFilters({ ...filters, active: true });
              }}
              backgroundColor={light.main2}
              style={{
                width: filters.active ? "60%" : "99%",
              }}
            >
              <TextStyle center>Buscar</TextStyle>
            </ButtonStyle>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    width: "90%",
    borderRadius: 8,
    padding: 30,
  },
  cardPicker: {
    padding: 2,
    borderRadius: 8,
  },
});

export default Filters;

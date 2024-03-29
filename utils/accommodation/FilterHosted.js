import { useMemo, useRef } from "react";
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { getFontSize, thousandsSystem } from "@helpers/libs";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import FullFilterDate from "@components/FullFilterDate";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { light, dark } = theme();
const { width: SCREEN_WIDTH } = Dimensions.get("screen");

const FilterHosted = ({
  modalVisible,
  setModalVisible,
  setFilters,
  filters,
  initialState,
  nomenclaturesToChoose,
  route,
  checkIn = true,
  checkOut = true,
}) => {
  const mode = useSelector((state) => state.mode);
  const zones = useSelector((state) => state.zones);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);
  const getBackgroundColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);

  const pickerStyleRef = useRef({
    backgroundColor,
    color: textColor,
    fontSize: 20,
    width: SCREEN_WIDTH / 2.8,
  }).current;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(!modalVisible)}
    >
      <TouchableWithoutFeedback onPress={() => setModalVisible(!modalVisible)}>
        <View style={{ backgroundColor: "#0005", height: "100%" }} />
      </TouchableWithoutFeedback>
      <View style={[StyleSheet.absoluteFillObject, { justifyContent: "center", alignItems: "center" }]}>
        <View style={[styles.card, { backgroundColor: mode === "light" ? light.main4 : dark.main1 }]}>
          <View>
            <View style={styles.row}>
              <TextStyle bigSubtitle color={light.main2} bold>
                FILTRA
              </TextStyle>
              <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
                <Ionicons name="close" size={getFontSize(24)} color={textColor} />
              </TouchableOpacity>
            </View>
            <TextStyle smallParagraph color={textColor}>
              Para una búsqueda más precisa
            </TextStyle>
          </View>
          <View style={{ marginTop: 6 }}>
            <View style={[styles.row, { marginTop: 15 }]}>
              <View style={{ width: "auto", flexGrow: 1, marginRight: 2 }}>
                <TextStyle smallParagraph color={textColor}>
                  Días MIN
                </TextStyle>
                <InputStyle
                  value={filters.minDays}
                  onChangeText={(text) => {
                    const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                    setFilters({ ...filters, minDays: value });
                  }}
                  placeholder="MIN"
                  keyboardType="numeric"
                  maxLength={11}
                />
              </View>
              <View style={{ width: "auto", flexGrow: 1, marginLeft: 2 }}>
                <TextStyle smallParagraph color={textColor}>
                  Días MAX
                </TextStyle>
                <InputStyle
                  value={filters.maxDays}
                  onChangeText={(text) => {
                    const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                    setFilters({ ...filters, maxDays: value });
                  }}
                  placeholder="MAX"
                  keyboardType="numeric"
                  maxLength={11}
                />
              </View>
            </View>
            <View style={{ marginTop: 10 }}>
              <View style={[styles.cardPicker, { backgroundColor: backgroundColor, width: "100%" }]}>
                <Picker
                  mode="dropdown"
                  selectedValue={filters.type}
                  onValueChange={(itemValue) => setFilters({ ...filters, type: itemValue })}
                  dropdownIconColor={textColor}
                  style={{
                    backgroundColor: backgroundColor,
                    color: textColor,
                    fontSize: 20,
                  }}
                >
                  <Picker.Item
                    label="Selección de tipo"
                    value=""
                    style={{ backgroundColor }}
                    color={textColor}
                  />
                  <Picker.Item
                    label="Estandar"
                    value="standard"
                    style={{ backgroundColor }}
                    color={textColor}
                  />

                  <Picker.Item
                    label="Acomodación"
                    value="accommodation"
                    style={{ backgroundColor }}
                    color={textColor}
                  />
                </Picker>
              </View>
            </View>
            <View style={[styles.row, { marginTop: 10 }]}>
              <View style={[styles.cardPicker, { backgroundColor }]}>
                <Picker
                  mode="dropdown"
                  selectedValue={filters.zone}
                  onValueChange={(itemValue) => setFilters({ ...filters, zone: itemValue })}
                  dropdownIconColor={textColor}
                  style={pickerStyleRef}
                >
                  <Picker.Item label="Grupo" value="" style={{ backgroundColor }} color={textColor} />
                  {zones.map((zone, index) => (
                    <Picker.Item
                      key={zone.id + index}
                      label={zone.name}
                      value={zone.id}
                      style={{ backgroundColor }}
                      color={textColor}
                    />
                  ))}
                </Picker>
              </View>
              <View style={[styles.cardPicker, { backgroundColor }]}>
                <Picker
                  mode="dropdown"
                  selectedValue={filters.nomenclature}
                  onValueChange={(itemValue) => setFilters({ ...filters, nomenclature: itemValue })}
                  dropdownIconColor={textColor}
                  style={pickerStyleRef}
                >
                  <Picker.Item
                    label="Nomenclatura"
                    value=""
                    style={{ backgroundColor }}
                    color={textColor}
                  />
                  {nomenclaturesToChoose.map((n) => (
                    <Picker.Item
                      key={n.id}
                      label={n.nomenclature}
                      value={n.id}
                      style={{ backgroundColor }}
                      color={textColor}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            {checkIn && route !== "reservation" && (
              <FullFilterDate
                title="Por fecha (CHECK IN)"
                defaultValue={{
                  day: filters.dayCheckIn,
                  month: filters.monthCheckIn,
                  year: filters.yearCheckIn,
                }}
                onChangeDay={(value) => setFilters({ ...filters, dayCheckIn: value })}
                onChangeMonth={(value) => setFilters({ ...filters, monthCheckIn: value })}
                onChangeYear={(value) => setFilters({ ...filters, yearCheckIn: value })}
              />
            )}
            {checkOut && route === "historical" && (
              <FullFilterDate
                title="Por fecha (CHECK OUT)"
                defaultValue={{
                  day: filters.dayCheckOut,
                  month: filters.monthCheckOut,
                  year: filters.yearCheckOut,
                }}
                onChangeDay={(value) => setFilters({ ...filters, dayCheckOut: value })}
                onChangeMonth={(value) => setFilters({ ...filters, monthCheckOut: value })}
                onChangeYear={(value) => setFilters({ ...filters, yearCheckOut: value })}
              />
            )}
            <FullFilterDate
              title="Por fecha (CREACIÓN)"
              increment={5}
              start={4}
              defaultValue={{
                day: filters.dayCreation,
                month: filters.monthCreation,
                year: filters.yearCreation,
              }}
              onChangeDay={(value) => setFilters({ ...filters, dayCreation: value })}
              onChangeMonth={(value) => setFilters({ ...filters, monthCreation: value })}
              onChangeYear={(value) => setFilters({ ...filters, yearCreation: value })}
            />
          </View>
          <View style={[styles.row, { marginTop: 20 }]}>
            {filters.active && (
              <ButtonStyle
                style={{ width: "auto", flexGrow: 1, marginRight: 4 }}
                backgroundColor={backgroundColor}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  setFilters(initialState);
                }}
              >
                <TextStyle center color={textColor}>
                  Remover
                </TextStyle>
              </ButtonStyle>
            )}
            <ButtonStyle
              onPress={() => {
                setModalVisible(!modalVisible);
                const compare = { ...filters, active: false };

                if (JSON.stringify(compare) === JSON.stringify(initialState)) {
                  setFilters(initialState);
                  return;
                }
                setFilters({ ...filters, active: true });
              }}
              backgroundColor={light.main2}
              style={{ width: "auto", flexGrow: 3 }}
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

export default FilterHosted;

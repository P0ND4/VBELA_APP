import { useMemo } from "react";
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";
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

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);
  const getBackgroundColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);

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
      <View style={[StyleSheet.absoluteFillObject, { justifyContent: "center", alignItems: "center" }]}>
        <View style={[styles.card, { backgroundColor: mode === "light" ? light.main4 : dark.main1 }]}>
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
                <Ionicons name="close" size={getFontSize(24)} color={textColor} />
              </TouchableOpacity>
            </View>
            <TextStyle smallParagraph color={textColor}>
              Para una búsqueda más precisa
            </TextStyle>
          </View>
          <View style={{ marginTop: 25 }}>
            {filters.type === "agency" && (
              <View style={styles.row}>
                <View style={[styles.symmetry, { marginRight: 2 }]}>
                  <TextStyle smallParagraph color={textColor}>
                    Sub-Clientes MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minSubClient}
                    onChangeText={(text) => {
                      const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, minSubClient: value });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={[styles.symmetry, { marginLeft: 2 }]}>
                  <TextStyle smallParagraph color={textColor}>
                    Sub-Clientes MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxSubClient}
                    onChangeText={(text) => {
                      const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, maxSubClient: value });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>
            )}
            {filters.type === "agency" && !filters.activeReservation && (
              <View style={styles.row}>
                <View style={[styles.symmetry, { marginRight: 2 }]}>
                  <TextStyle smallParagraph color={textColor}>
                    Reservaciones MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minReservation}
                    onChangeText={(text) => {
                      const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, minReservation: value });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={[styles.symmetry, { marginLeft: 2 }]}>
                  <TextStyle smallParagraph color={textColor}>
                    Reservaciones MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxReservation}
                    onChangeText={(text) => {
                      const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, maxReservation: value });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>
            )}
            {filters.type === "agency" && !filters.activeDebt && (
              <View style={styles.row}>
                <View style={[styles.symmetry, { marginRight: 2 }]}>
                  <TextStyle smallParagraph color={textColor}>
                    Deudas MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minDebt}
                    onChangeText={(text) => {
                      const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, minDebt: value });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={[styles.symmetry, { marginLeft: 2 }]}>
                  <TextStyle smallParagraph color={textColor}>
                    Deudas MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxDebt}
                    onChangeText={(text) => {
                      const value = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, maxDebt: value });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>
            )}
            <View style={[styles.row, { marginTop: 10 }]}>
              <View style={[styles.cardPicker, styles.symmetry, { backgroundColor, marginRight: 2 }]}>
                <Picker
                  mode="dropdown"
                  selectedValue={filters.type}
                  onValueChange={(itemValue) => setFilters({ ...filters, type: itemValue })}
                  dropdownIconColor={textColor}
                  style={{ backgroundColor, color: textColor, fontSize: 20 }}
                >
                  <Picker.Item label="Tipo" value="" style={{ backgroundColor }} color={textColor} />
                  <Picker.Item
                    label="Cliente"
                    value="customer"
                    style={{ backgroundColor }}
                    color={textColor}
                  />

                  <Picker.Item
                    label="Agencia"
                    value="agency"
                    style={{ backgroundColor }}
                    color={textColor}
                  />
                </Picker>
              </View>
              <View style={[styles.cardPicker, styles.symmetry, { backgroundColor, marginLeft: 2 }]}>
                <Picker
                  mode="dropdown"
                  selectedValue={filters.identification}
                  onValueChange={(itemValue) => setFilters({ ...filters, identification: itemValue })}
                  dropdownIconColor={textColor}
                  style={{ backgroundColor, color: textColor, fontSize: 20 }}
                >
                  <Picker.Item label="Cédula" value="" style={{ backgroundColor }} color={textColor} />
                  <Picker.Item
                    label="Inactiva"
                    value="no-identification"
                    style={{ backgroundColor }}
                    color={textColor}
                  />

                  <Picker.Item
                    label="Activa"
                    value="yes-identification"
                    style={{ backgroundColor }}
                    color={textColor}
                  />
                </Picker>
              </View>
            </View>
            <FullFilterDate
              title="Por fecha (CREACIÓN)"
              increment={5}
              defaultValue={{
                day: filters.day,
                month: filters.month,
                year: filters.year,
              }}
              onChangeDay={(value) => setFilters({ ...filters, day: value })}
              onChangeMonth={(value) => setFilters({ ...filters, month: value })}
              onChangeYear={(value) => setFilters({ ...filters, year: value })}
            />
            {filters.type && (
              <View style={{ marginTop: 15 }}>
                <View style={styles.row}>
                  <TextStyle verySmall color={light.main2}>
                    {filters.type === "agency" ? "Todas las reservas activas" : "Reserva activa"}
                  </TextStyle>
                  <Switch
                    trackColor={{ false: dark.main2, true: light.main2 }}
                    thumbColor={light.main4}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        minReservation: "",
                        maxReservation: "",
                        activeReservation: value,
                      })
                    }
                    value={filters.activeReservation}
                  />
                </View>
                <View style={styles.row}>
                  <TextStyle verySmall color={light.main2}>
                    {filters.type === "agency" ? "Todas las deudas activas" : "Deuda activa"}
                  </TextStyle>
                  <Switch
                    trackColor={{ false: dark.main2, true: light.main2 }}
                    thumbColor={light.main4}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        minDebt: "",
                        maxDebt: "",
                        activeDebt: value,
                      })
                    }
                    value={filters.activeDebt}
                  />
                </View>
              </View>
            )}
          </View>
          <View style={[styles.row, { marginTop: 20 }]}>
            {filters.active && (
              <ButtonStyle
                style={{ flexGrow: 1, width: "auto", marginRight: 4 }}
                backgroundColor={backgroundColor}
                onPress={() => {
                  setActive(false);
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
                setActive(!active);
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
  symmetry: {
    width: "auto",
    flexGrow: 1,
  },
});

export default Filters;

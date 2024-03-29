import { useMemo } from "react";
import { View, Modal, TouchableWithoutFeedback, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { getFontSize, thousandsSystem } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import FullFilterDate from "@components/FullFilterDate";
import TextStyle from "@components/TextStyle";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { light, dark } = theme();

const FilterLocation = ({ modalVisible, setModalVisible, setFilters, filters, initialState }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

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
            <FullFilterDate
              title="Por fecha (CREACIÓN)"
              increment={5}
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
                backgroundColor={mode === "light" ? light.main5 : dark.main2}
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

export default FilterLocation;

import { useEffect, useMemo, useState } from "react";
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { useSelector } from "react-redux";
import theme from "@theme";
import TextStyle from "@components/TextStyle";
import { Calendar } from "react-native-calendars";
import { calendarTheme } from "@helpers/libs";

const { light, dark } = theme();
const { width: SCREEN_WIDTH } = Dimensions.get("screen");

const ShooseData = ({ modalVisible, setModalVisible, onDayPress }) => {
  const mode = useSelector((state) => state.mode);
  const zones = useSelector((state) => state.zones);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);

  const [nomenclaturesToChoose, setNomenclaturesToChoose] = useState([]);
  const [zoneSelected, setZoneSelected] = useState("");
  const [nomenclatureSelected, setNomenclatureSelected] = useState("");
  const [markedDates, setMarkedDates] = useState({});

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);
  const getBackgroundColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);

  useEffect(() => {
    if (nomenclaturesToChoose.length > 0) {
      const nom = nomenclatures.find((n) => n.id === nomenclatureSelected);

      let nomenclatureReservations =
        nom?.type === "standard"
          ? standardReservations.filter((r) => r.ref === nomenclatureSelected)
          : accommodationReservations.filter((r) => r.ref === nomenclatureSelected);

      let markedDates = {};
      for (let reservation of nomenclatureReservations) {
        const start = new Date(reservation.start);
        const end = new Date(reservation.end);

        let d = new Date(start);
        while (d <= end) {
          let dateISO = d.toISOString().slice(0, 10);
          const startISO = start.toISOString().slice(0, 10);
          const endISO = end.toISOString().slice(0, 10);
          markedDates[dateISO] = {
            startingDay: nom?.type === "accommodation" || dateISO === startISO,
            endingDay: nom?.type === "accommodation" || dateISO === endISO,
            color: light.main2,
            textColor: "#000000",
            reservation,
          };
          d.setDate(d.getDate() + 1);
        }
      }
      setMarkedDates(markedDates);
    }
  }, [nomenclatureSelected, standardReservations, accommodationReservations]);

  useEffect(() => {
    if (zones.length > 0) {
      const nomenclaturesFound = nomenclatures.filter((n) => n.ref === zoneSelected);
      setNomenclaturesToChoose(nomenclaturesFound);
    }
  }, [zoneSelected]);

  const cleanData = () => {
    setModalVisible(!modalVisible);
    setZoneSelected("");
    setNomenclatureSelected("");
    setNomenclaturesToChoose([]);
    setMarkedDates({});
  };

  /////////////////////

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => cleanData()}
    >
      <TouchableWithoutFeedback onPress={() => cleanData()}>
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
            styles.accommodationCard,
            {
              backgroundColor: mode === "light" ? light.main4 : dark.main1,
            },
          ]}
        >
          <View>
            <View style={styles.row}>
              <TextStyle color={light.main2} subtitle>
                ALOJAR
              </TextStyle>
              <TouchableOpacity onPress={() => cleanData()}>
                <Ionicons name="close" size={33} color={textColor} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 20,
              }}
            >
              <View style={{ marginHorizontal: 2, backgroundColor }}>
                <Picker
                  mode="dropdown"
                  selectedValue={zoneSelected}
                  onValueChange={(value) => {
                    setZoneSelected(value);
                    setNomenclatureSelected("");
                  }}
                  dropdownIconColor={textColor}
                  style={{
                    width: SCREEN_WIDTH / 2.7,
                    backgroundColor,
                    color: textColor,
                    fontSize: 20,
                  }}
                >
                  <Picker.Item
                    label="SELECCIONE LA ZONA"
                    value=""
                    style={{ backgroundColor, fontSize: 15 }}
                    color={textColor}
                  />
                  {zones.map((zone, index) => (
                    <Picker.Item
                      key={zone.id + index}
                      label={zone.name}
                      value={zone.id}
                      style={{ backgroundColor, fontSize: 15 }}
                      color={textColor}
                    />
                  ))}
                </Picker>
              </View>
              {nomenclaturesToChoose.length > 0 && (
                <View style={{ marginHorizontal: 2, backgroundColor }}>
                  <Picker
                    mode="dropdown"
                    selectedValue={nomenclatureSelected}
                    onValueChange={(value) => {
                      setNomenclatureSelected(value);
                    }}
                    dropdownIconColor={textColor}
                    style={{
                      width: SCREEN_WIDTH / 2.7,
                      backgroundColor,
                      color: textColor,
                      fontSize: 20,
                    }}
                  >
                    <Picker.Item
                      label="SELECCIONA LA NOMENCLATURA"
                      value=""
                      style={{ backgroundColor, fontSize: 15 }}
                      color={textColor}
                    />
                    {nomenclaturesToChoose.map((nomenclature, index) => (
                      <Picker.Item
                        key={nomenclature.id}
                        label={nomenclature.name || nomenclature.nomenclature}
                        value={nomenclature.id}
                        style={{ backgroundColor, fontSize: 15 }}
                        color={textColor}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>
            {nomenclaturesToChoose.length > 0 && nomenclatureSelected ? (
              <Calendar
                style={{ borderRadius: 8 }}
                // Specify theme properties to override specific styles for calendar parts. Default = {}
                theme={calendarTheme(mode)}
                maxDate="2024-12-31"
                minDate="2023-01-01"
                firstDay={1}
                displayLoadingIndicator={false} // ESTA COOL
                enableSwipeMonths={true}
                onDayPress={(data) => {
                  onDayPress({
                    data,
                    nomenclatureID: nomenclatureSelected,
                    markedDates,
                    cleanData,
                  });
                }}
                onDayLongPress={() => {}}
                arrowsHitSlop={10}
                markingType="period"
                markedDates={markedDates}
              />
            ) : (
              <TextStyle center verySmall color={light.main2}>
                Seleccione el grupo y la nomenclatura
              </TextStyle>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accommodationCard: {
    width: "90%",
    borderRadius: 8,
    padding: 25,
    justifyContent: "space-between",
  },
});

export default ShooseData;

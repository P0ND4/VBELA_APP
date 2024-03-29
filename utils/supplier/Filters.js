import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import { getFontSize } from "@helpers/libs";
import FullFilterDate from "@components/FullFilterDate";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
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
            <TextStyle
              smallParagraph
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Para una búsqueda más precisa
            </TextStyle>
          </View>
          <View style={{ marginTop: 15 }}>
            <View
              style={[
                styles.cardPicker,
                {
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  width: "100%",
                },
              ]}
            >
              <Picker
                mode="dropdown"
                selectedValue={filters.identification}
                onValueChange={(itemValue) =>
                  setFilters({ ...filters, identification: itemValue })
                }
                dropdownIconColor={
                  mode === "light" ? light.textDark : dark.textWhite
                }
                style={{
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  color: mode === "light" ? light.textDark : dark.textWhite,
                  fontSize: 20,
                }}
              >
                <Picker.Item
                  label="Cédula"
                  value=""
                  style={{
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                  }}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                />
                <Picker.Item
                  label="Inactiva"
                  value="no-identification"
                  style={{
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                  }}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                />

                <Picker.Item
                  label="Activa"
                  value="yes-identification"
                  style={{
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                  }}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                />
              </Picker>
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
              onChangeMonth={(value) =>
                setFilters({ ...filters, month: value })
              }
              onChangeYear={(value) => setFilters({ ...filters, year: value })}
            />
          </View>
          <View style={[styles.row, { marginTop: 20 }]}>
            {filters.active && (
              <ButtonStyle
                style={{ width: "35%" }}
                backgroundColor={mode === "light" ? light.main5 : dark.main2}
                onPress={() => {
                  setActive(false);
                  setFilters(initialState);
                }}
              >
                <TextStyle
                  center
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
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
    justifyContent: "space-between",
    alignItems: "center",
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

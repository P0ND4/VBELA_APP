import { View, Text } from "react-native";
import React from "react";

const Filters = () => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={activeFilter}
      onRequestClose={() => {
        setActiveFilter(!activeFilter);
        setFilters(initialState);
      }}
    >
      <TouchableWithoutFeedback onPress={() => setActiveFilter(!activeFilter)}>
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
            styles.cardInformation,
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
                  setActiveFilter(false);
                  setFilters(initialState);
                }}
              >
                <Ionicons
                  name="close"
                  size={30}
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
              <View style={{ width: "48%" }}>
                <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
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
                  selectedValue={filters.type}
                  onValueChange={(itemValue) => setFilters({ ...filters, type: itemValue })}
                  dropdownIconColor={mode === "light" ? light.textDark : dark.textWhite}
                  style={{
                    backgroundColor: mode === "light" ? light.main5 : dark.main2,
                    color: mode === "light" ? light.textDark : dark.textWhite,
                    fontSize: 20,
                  }}
                >
                  <Picker.Item
                    label="Selección de tipo"
                    value=""
                    style={{
                      backgroundColor: mode === "light" ? light.main5 : dark.main2,
                    }}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                  <Picker.Item
                    label="Estandar"
                    value="standard"
                    style={{
                      backgroundColor: mode === "light" ? light.main5 : dark.main2,
                    }}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />

                  <Picker.Item
                    label="Acomodación"
                    value="accommodation"
                    style={{
                      backgroundColor: mode === "light" ? light.main5 : dark.main2,
                    }}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                </Picker>
              </View>
            </View>
            <View style={[styles.row, { marginTop: 10 }]}>
              <View
                style={[
                  styles.cardPicker,
                  {
                    backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  },
                ]}
              >
                <Picker
                  mode="dropdown"
                  selectedValue={filters.zone}
                  onValueChange={(itemValue) => setFilters({ ...filters, zone: itemValue })}
                  dropdownIconColor={mode === "light" ? light.textDark : dark.textWhite}
                  style={{
                    backgroundColor: mode === "light" ? light.main5 : dark.main2,
                    color: mode === "light" ? light.textDark : dark.textWhite,
                    fontSize: 20,
                    width: SCREEN_WIDTH / 2.8,
                  }}
                >
                  <Picker.Item
                    label="Grupo"
                    value=""
                    style={{
                      backgroundColor: mode === "light" ? light.main5 : dark.main2,
                    }}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                  {zones.map((zone, index) => (
                    <Picker.Item
                      key={zone.id + index}
                      label={zone.name}
                      value={zone.ref}
                      style={{
                        backgroundColor: mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  ))}
                </Picker>
              </View>
              <View
                style={[
                  styles.cardPicker,
                  {
                    backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  },
                ]}
              >
                <Picker
                  mode="dropdown"
                  selectedValue={filters.nomenclature}
                  onValueChange={(itemValue) => setFilters({ ...filters, nomenclature: itemValue })}
                  dropdownIconColor={mode === "light" ? light.textDark : dark.textWhite}
                  style={{
                    backgroundColor: mode === "light" ? light.main5 : dark.main2,
                    color: mode === "light" ? light.textDark : dark.textWhite,
                    fontSize: 20,
                    width: SCREEN_WIDTH / 2.8,
                  }}
                >
                  <Picker.Item
                    label="Nomenclatura"
                    value=""
                    style={{
                      backgroundColor: mode === "light" ? light.main5 : dark.main2,
                    }}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                  {nomenclaturesToChoose.map((n) => (
                    <Picker.Item
                      key={n.id}
                      label={n.nomenclature}
                      value={n.id}
                      style={{
                        backgroundColor: mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  ))}
                </Picker>
              </View>
            </View>
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
            {reservationRoute && (
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
            {reservationRoute === "check-out" && (
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
                  setActiveFilter(false);
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
                setActiveFilter(!activeFilter);
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

export default Filters;

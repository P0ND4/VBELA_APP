import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { edit } from "@features/groups/informationStorageSlice";
import InputStyle from "@components/InputStyle";

import { Calendar } from "react-native-calendars";

import Animated, { useSharedValue, withSpring } from "react-native-reanimated";

import { months, thousandsSystem, changeDate } from "@helpers/libs";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";

const light = theme.colors.light;
const dark = theme.colors.dark;

const width = Dimensions.get("window").width;

const Accommodation = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const groups = useSelector((state) => state.groups);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const reservations = useSelector((state) => state.reservations);
  const informationStorage = useSelector((state) => state.informationStorage);
  const activeGroup = useSelector((state) => state.activeGroup);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [groupSelected, setGroupSelected] = useState({});
  const [nomenclatureSelected, setNomenclatureSelected] = useState({});
  const [nomenclaturesToChoose, setNomenclaturesToChoose] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [nomenclatureReservation, setNomenclatureReservation] = useState([]);
  const [activeSearch, setActiveSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(false);

  const [days, setDays] = useState([]);
  const [years, setYears] = useState([]);

  const initialState = {
    active: false,
    minPeople: "",
    maxPeople: "",
    minValue: "",
    maxValue: "",
    minDays: "",
    maxDays: "",
    valueType: "all",
    checkOut: false,
    checkIn: false,
    year: "all",
    month: "all",
    day: "all",
  };

  const [filters, setFilters] = useState(initialState);
  const [filterResult, setFilterResult] = useState([]);

  useEffect(() => {
    const date = new Date();
    let years = [date.getFullYear()];

    for (let i = 5; i >= 0; i--) {
      years.push(years[years.length - 1] - 1);
    }

    setYears(years);
  }, []);

  useEffect(() => {
    const date = new Date();
    const days = new Date(
      filters.year === "all" ? date.getFullYear() : filters.year,
      filters.month === "all" ? 1 : filters.month + 1,
      0
    ).getDate();
    const monthDays = [];
    for (let day = 0; day < days; day++) {
      monthDays.push(day + 1);
    }
    setDays(monthDays);
  }, [filters.year, filters.month]);

  const dispatch = useDispatch();

  /////

  const height = useSharedValue(380);
  const closeCalendar = () => (height.value = withSpring(55, { damping: 20 }));
  const openCalendar = () => (height.value = withSpring(380, { damping: 20 }));

  const handleGesture = ({ nativeEvent }) => {
    const { translationY, state } = nativeEvent;
    if (state === State.ACTIVE && translationY > 0) {
      openCalendar();
    } else if (state === State.ACTIVE && translationY < 0) {
      closeCalendar();
    }
  };

  const searchRef = useRef();

  /////

  useEffect(() => {
    setNomenclatureReservation(
      reservations.filter((r) => r.id === nomenclatureSelected?.id)
    );
    if (nomenclaturesToChoose.length > 0) {
      const nomenclatureReservations = reservations.filter(
        (r) => r.id === nomenclatureSelected.id
      );

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
            startingDay: dateISO === startISO,
            endingDay: dateISO === endISO,
            color: light.main2,
            textColor: "#000000",
            reservation,
          };
          d.setDate(d.getDate() + 1);
        }
      }
      setMarkedDates(markedDates);
    }
  }, [nomenclatureSelected, reservations]);

  useEffect(() => {
    if (groups.length > 0) {
      const groupFound = groups.find((g) => g.ref === groupSelected?.ref);
      const nomenclaturesFound = nomenclatures.filter(
        (n) => n.ref === groupFound?.ref
      );
      setNomenclatureSelected(nomenclaturesFound[0]);
      setNomenclaturesToChoose(nomenclaturesFound);
      setNomenclatureReservation(
        reservations.filter((r) => r.id === nomenclaturesFound[0]?.id)
      );
    }
  }, [groupSelected]);

  useEffect(() => {
    if (groups.length > 0) {
      const groupFound = groups.find((g) => g.ref === informationStorage.group);
      const nomenclatureFound = nomenclatures.find(
        (n) => n.id === informationStorage.nomenclature
      );
      setGroupSelected(groupFound || groups[0]);
      const nomenclaturesFound = nomenclatures.filter(
        (n) => n.ref === (groupFound?.ref || groups[0]?.ref)
      );
      setNomenclatureSelected(nomenclatureFound || nomenclaturesFound[0]);
      setNomenclaturesToChoose(nomenclaturesFound);
      setNomenclatureReservation(
        reservations.filter(
          (r) => r.id === (nomenclatureFound?.id || nomenclaturesFound[0]?.id)
        )
      );
    }
  }, [groups, nomenclatures]);

  const dateValidation = (date) => {
    let error = false;
    if (filters.day !== "all" && date.getDate() !== filters.day) error = true;
    if (filters.month !== "all" && date.getMonth() + 1 !== filters.month)
      error = true;
    if (filters.year !== "all" && date.getFullYear() !== filters.year)
      error = true;
    return error;
  };

  useEffect(() => {
    if (search || filters.active) {
      const found = [];

      const removeSymbols = (text) =>
        text
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
      const text = removeSymbols(search);

      for (let reservation of reservations) {
        for (let guest of reservation.hosted) {
          if (
            removeSymbols(guest.fullName)?.includes(text) ||
            removeSymbols(guest.email)?.includes(text) ||
            guest.identification?.includes(text) ||
            thousandsSystem(guest.identification)?.includes(text) ||
            guest.phoneNumber?.includes(text) ||
            reservation.days?.includes(text) ||
            reservation.amount?.toString().includes(text) ||
            thousandsSystem(reservation.amount?.toString()).includes(text)
          ) {
            if (!filters.active) {
              found.push(reservation);
              break;
            } else {
              const amount = reservation.discount
                ? reservation.amount - reservation.discount
                : reservation.amount;

              if (dateValidation(new Date(guest.start))) continue;
              if (
                filters.minPeople &&
                reservation.hosted.length <
                  parseInt(filters.minPeople.replace(/\D/g, ""))
              )
                continue;
              if (
                filters.maxPeople &&
                reservation.hosted.length >
                  parseInt(filters.maxPeople.replace(/\D/g, ""))
              )
                continue;
              if (
                filters.minValue &&
                amount < parseInt(filters.minValue.replace(/\D/g, ""))
              )
                continue;
              if (
                filters.maxValue &&
                amount > parseInt(filters.maxValue.replace(/\D/g, ""))
              )
                continue;
              if (
                filters.minDays &&
                parseInt(reservation.days) <
                  parseInt(filters.minDays.replace(/\D/g, ""))
              )
                continue;
              if (
                filters.maxDays &&
                parseInt(reservation.days) >
                  parseInt(filters.maxDays.replace(/\D/g, ""))
              )
                continue;
              if (
                filters.valueType !== "all" &&
                reservation.valueType !== filters.valueType
              )
                continue;
              if (filters.checkIn && !guest.checkIn) continue;
              if (filters.checkOut && !guest.checkOut) continue;

              found.push(reservation);
              break;
            }
          }
        }
      }

      setFilterResult(found);
    } else setFilterResult([]);
  }, [reservations, search, filters]);

  const GuestCard = ({ guest }) => {
    const [openPeople, setOpenPeople] = useState(false);
    const amount = guest?.discount
      ? guest?.amount - guest?.discount
      : guest?.amount;
    const totalPayment = guest?.hosted?.reduce((a, b) => {
      if (b.payment === "business") {
        return a + amount / reserve?.hosted.length;
      } else return a + b.payment;
    }, 0);

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("ReserveInformation", {
            ref: guest.ref,
            id: guest.id,
          });
        }}
        key={guest.id + guest.modificationDate}
        style={[
          styles.guestCard,
          {
            backgroundColor: mode === "light" ? light.main5 : dark.main2,
          },
        ]}
      >
        {(!activeGroup.active || activeGroup.accessToReservations) &&
          guest?.discount && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Descuento:{" "}
              <TextStyle color={light.main2}>
                {thousandsSystem(guest?.discount)}
              </TextStyle>
            </TextStyle>
          )}
        {(!activeGroup.active || activeGroup.accessToReservations) && (
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Costo de alojamiento:{" "}
            <TextStyle color={light.main2}>
              {guest?.amount ? thousandsSystem(amount) : "0"}
            </TextStyle>
          </TextStyle>
        )}
        {(!activeGroup.active || activeGroup.accessToReservations) && (
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            {amount - totalPayment === 0
              ? "Sin deuda"
              : amount - totalPayment < 0
              ? "Propina recibida:"
              : "Deuda pendiente:"}{" "}
            {amount - totalPayment !== 0 && (
              <TextStyle color={light.main2}>
                {guest?.amount
                  ? thousandsSystem(Math.abs(amount - totalPayment))
                  : "0"}
              </TextStyle>
            )}
          </TextStyle>
        )}
        {(!activeGroup.active || activeGroup.accessToReservations) && (
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Dinero pagado:{" "}
            <TextStyle color={light.main2}>
              {guest?.hosted ? thousandsSystem(totalPayment) : "0"}
            </TextStyle>
          </TextStyle>
        )}
        {(!activeGroup.active || activeGroup.accessToReservations) && (
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Tipo de alojamiento:{" "}
            <TextStyle color={light.main2}>
              {guest?.valueType === "standard" ? "ESTANDAR" : "POR ACOMODACIÓN"}
            </TextStyle>
          </TextStyle>
        )}
        {(!activeGroup.active || activeGroup.accessToReservations) &&
          guest.valueType === "accommodation" && (
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Nombre de acomodación:{" "}
              <TextStyle color={light.main2}>
                {guest?.accommodation.name}
              </TextStyle>
            </TextStyle>
          )}
        <View style={styles.row}>
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            Personas alojadas:{" "}
            <TextStyle color={light.main2}>
              {guest?.hosted ? thousandsSystem(guest?.hosted.length) : "0"}
            </TextStyle>
          </TextStyle>
          <TouchableOpacity
            onPress={() => setOpenPeople(!openPeople)}
            style={{
              padding: 6,
              borderRadius: 8,
              backgroundColor: light.main2,
            }}
          >
            <Ionicons
              name={openPeople ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={light.textDark}
            />
          </TouchableOpacity>
        </View>
        {openPeople && (
          <View style={{ marginLeft: 20 }}>
            {guest?.hosted.map((item) => (
              <TextStyle key={item.id} color={light.main2}>
                {item.fullName}
              </TextStyle>
            ))}
          </View>
        )}
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Días reservado:{" "}
          <TextStyle color={light.main2}>
            {guest?.days ? thousandsSystem(guest?.days) : "0"}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Fecha inicial:{" "}
          <TextStyle color={light.main2}>
            {changeDate(new Date(guest?.start))}
          </TextStyle>
        </TextStyle>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Fecha de finalización:{" "}
          <TextStyle color={light.main2}>
            {changeDate(new Date(guest?.end))}
          </TextStyle>
        </TextStyle>
      </TouchableOpacity>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      {groups.length > 0 && (
        <>
          <View>
            <View style={styles.row}>
              <View>
                <TextStyle bigParagraph color={light.main2}>
                  {months[month - 1]?.toUpperCase()}
                </TextStyle>
                <TextStyle
                  paragraph
                  color={mode === "light" ? light.textDark : dark.textWhite}
                  customStyle={{ lineHeight: 20 }}
                >
                  {year}
                </TextStyle>
              </View>
              <View>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      marginHorizontal: 2,
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    }}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={groupSelected.ref}
                      onValueChange={(value) => {
                        if (value === "CreateZone") {
                          return navigation.navigate("CreateZone");
                        }
                        const nomenclaturesFound = nomenclatures.filter(
                          (n) => n.ref === value
                        );
                        dispatch(
                          edit({
                            nomenclature: nomenclaturesFound[0]?.id,
                            group: value,
                          })
                        );
                        setGroupSelected(groups.find((g) => g.ref === value));
                      }}
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        width: width / 3.4,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                        fontSize: 20,
                      }}
                    >
                      {groups.map((group, index) => (
                        <Picker.Item
                          key={group.id + index}
                          label={group.name}
                          value={group.ref}
                          style={{
                            backgroundColor:
                              mode === "light" ? light.main5 : dark.main2,
                          }}
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      ))}
                      {(!activeGroup.active ||
                        activeGroup.accessToReservations) && (
                        <Picker.Item
                          label="CREAR"
                          value="CreateZone"
                          style={{
                            backgroundColor:
                              mode === "light" ? light.main5 : dark.main2,
                          }}
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      )}
                    </Picker>
                  </View>
                  {nomenclaturesToChoose.length > 0 && (
                    <View
                      style={{
                        marginHorizontal: 2,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                    >
                      <Picker
                        mode="dropdown"
                        selectedValue={nomenclatureSelected.id}
                        onValueChange={(value) => {
                          if (value === "CreateNomenclature") {
                            return navigation.navigate("CreatePlace", {
                              ref: groupSelected.ref,
                            });
                          }
                          dispatch(
                            edit({ ...informationStorage, nomenclature: value })
                          );
                          setNomenclatureSelected(
                            nomenclatures.find((n) => n.id === value)
                          );
                        }}
                        dropdownIconColor={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                        style={{
                          width: width / 3.4,
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                          color:
                            mode === "light" ? light.textDark : dark.textWhite,
                          fontSize: 20,
                        }}
                      >
                        {nomenclaturesToChoose.map((nomenclature, index) => (
                          <Picker.Item
                            key={nomenclature.id}
                            label={
                              nomenclature.name || nomenclature.nomenclature
                            }
                            value={nomenclature.id}
                            style={{
                              backgroundColor:
                                mode === "light" ? light.main5 : dark.main2,
                            }}
                            color={
                              mode === "light" ? light.textDark : dark.textWhite
                            }
                          />
                        ))}
                        {(!activeGroup.active ||
                          activeGroup.accessToReservations) && (
                          <Picker.Item
                            label="CREAR"
                            value="CreateNomenclature"
                            style={{
                              backgroundColor:
                                mode === "light" ? light.main5 : dark.main2,
                            }}
                            color={
                              mode === "light" ? light.textDark : dark.textWhite
                            }
                          />
                        )}
                      </Picker>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View
              style={[
                styles.row,
                {
                  marginVertical: 15,
                },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/*nomenclaturesToChoose.length > 0 && //TODO TERMINAR ESTO EN EL FUTURO
                  (!activeGroup.active || activeGroup.accessToReservations) && (
                    <TouchableOpacity onPress={() => {}}>
                      <Ionicons
                        name="information-circle-outline"
                        color={light.main2}
                        size={38}
                      />
                    </TouchableOpacity>
                  )*/}
                {nomenclaturesToChoose.length > 0 && !activeSearch && (
                  <TouchableOpacity
                    onPress={() => {
                      setActiveSearch(true);
                      setTimeout(() => searchRef.current.focus());
                    }}
                  >
                    <Ionicons name="search" color={light.main2} size={38} />
                  </TouchableOpacity>
                )}
                {activeSearch && (
                  <>
                    <TouchableOpacity
                      style={{ marginRight: 4 }}
                      onPress={() => {
                        setSearch("");
                        setActiveSearch(false);
                        setFilters(initialState);
                      }}
                    >
                      <Ionicons
                        name="close"
                        size={30}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    </TouchableOpacity>
                    <InputStyle
                      innerRef={searchRef}
                      placeholder="Product, valor"
                      value={search}
                      onChangeText={(text) => setSearch(text)}
                      stylesContainer={{
                        width: "48%",
                        marginVertical: 0,
                      }}
                      stylesInput={{
                        paddingHorizontal: 6,
                        paddingVertical: 5,
                        fontSize: 18,
                      }}
                    />
                    <TouchableOpacity
                      style={{ marginLeft: 8 }}
                      onPress={() => setActiveFilter(!activeFilter)}
                    >
                      <Ionicons name="filter" size={30} color={light.main2} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
              <View>
                <TouchableOpacity
                  style={{ flexDirection: "row" }}
                  onPress={() => {
                    if (activeGroup.active && !activeGroup.accessToReservations)
                      return;
                    navigation.navigate("PlaceInformation", {
                      ref: groupSelected.ref,
                      name: groupSelected?.name,
                      type: "General",
                    });
                  }}
                >
                  {(!activeGroup.active ||
                    activeGroup.accessToReservations) && (
                    <Ionicons
                      style={{ marginLeft: 5 }}
                      name="create-outline"
                      size={20}
                      color={light.main2}
                    />
                  )}
                  <TextStyle
                    bigParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {groupSelected?.name?.toUpperCase()}{" "}
                  </TextStyle>
                </TouchableOpacity>
                {nomenclaturesToChoose.length > 0 && (
                  <TouchableOpacity
                    style={{ flexDirection: "row", justifyContent: "flex-end" }}
                    onPress={() => {
                      if (
                        activeGroup.active &&
                        !activeGroup.accessToReservations
                      )
                        return;
                      navigation.navigate("PlaceInformation", {
                        ref: groupSelected.ref,
                        id: nomenclatureSelected.id,
                        type: "Nomenclatura",
                      });
                    }}
                  >
                    {(!activeGroup.active ||
                      activeGroup.accessToReservations) && (
                      <Ionicons
                        style={{ marginLeft: 5 }}
                        name="create-outline"
                        size={20}
                        color={light.main2}
                      />
                    )}
                    <TextStyle
                      bigParagraph
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      {nomenclatureSelected?.name?.toUpperCase() ||
                        nomenclatureSelected?.nomenclature}
                    </TextStyle>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {activeSearch && (
            <ScrollView style={{ flexGrow: 1 }}>
              {filterResult.length === 0 ? (
                <View style={{ alignItems: "center", marginVertical: 30 }}>
                  <TextStyle
                    center
                    color={light.main2}
                    bigParagraph
                    customStyle={{ width: "50%" }}
                  >
                    No hay huéspedes encontrados
                  </TextStyle>
                </View>
              ) : (
                <View>
                  {filterResult.map((guest, index) => (
                    <GuestCard
                      guest={guest}
                      key={guest.id + guest.modificationDate + index}
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {!activeSearch && nomenclaturesToChoose.length > 0 && (
            <Animated.View
              style={{
                backgroundColor: mode === "light" ? light.main5 : dark.main2,
                borderRadius: 8,
                elevation: 20,
                height,
                maxHeight: 380,
                overflow: "hidden",
              }}
            >
              <Calendar
                key={mode}
                style={{ borderRadius: 8 }}
                // Specify theme properties to override specific styles for calendar parts. Default = {}
                theme={{
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                  calendarBackground:
                    mode === "light" ? light.main5 : dark.main2,
                  textSectionTitleColor: light.main2, // TITULO DE SEMANA
                  textSectionTitleDisabledColor: "#d9e1e8", // TITULO DE SEMANA DESACTIVADO
                  selectedDayBackgroundColor: "#00adf5", // NO SE
                  selectedDayTextColor: "#ffffff", // NO SE
                  todayTextColor: light.main2, // COLOR DEL DIA DE HOY
                  dayTextColor:
                    mode === "light" ? light.textDark : dark.textWhite, // COLOR DE LAS FECHAS
                  textDisabledColor: `${
                    mode === "light" ? light.textDark : dark.textWhite
                  }66`, // COLOR QUE NO ES DEL MES
                  dotColor: "#00adf5", // NO SE
                  selectedDotColor: "#ffffff", // NO SE
                  arrowColor:
                    mode === "light" ? light.textDark : dark.textWhite, // COLOR DE LAS FLECHAS
                  disabledArrowColor: `${light.main2}66`, //COLOR DE LAS FECHAS DESHABILITADAS
                  monthTextColor:
                    mode === "light" ? light.textDark : dark.textWhite, // TEXTO DEL MES
                  indicatorColor:
                    mode === "light" ? light.textDark : dark.textWhite, // COLOR DE INDICADOR
                  textDayFontFamily: "monospace", // FONT FAMILY DEL DIA
                  textMonthFontFamily: "monospace", // FONT FAMILY DEL MES
                  textDayHeaderFontFamily: "monospace", // FONT FAMILY DEL ENCABEZADO
                  textDayFontWeight: "300", // FONT WEIGHT DEL LOS DIAS DEL MES
                  textMonthFontWeight: "bold", // FONT WEIGHT DEL TITULO DEL MES
                  textDayHeaderFontWeight: "300", // FONT WEIGHT DEL DIA DEL ENCABEZADO
                  textDayFontSize: 16, // TAMANO DE LA LETRA DEL DIA
                  textMonthFontSize: 18, // TAMANO DE LA LETRA DEL MES
                  textDayHeaderFontSize: 16, // TAMANO DEL ENCABEZADO DEL DIA
                }}
                maxDate="2024-12-31"
                minDate="2023-01-01"
                firstDay={1}
                displayLoadingIndicator={false} // ESTA COOL
                showSixWeeks={true}
                enableSwipeMonths={true}
                onDayPress={(data) => {
                  const reservation = markedDates[data.dateString]?.reservation;
                  const reservationActiveGroup =
                    activeGroup.active && !activeGroup.accessToReservations;
                  if (reservation) {
                    navigation.navigate("ReserveInformation", {
                      ref: reservation.ref,
                      id: nomenclatureSelected.id,
                    });
                  } else {
                    if (reservationActiveGroup) return;
                    navigation.navigate("CreateReserve", {
                      year: data.year,
                      day: data.day,
                      month: data.month,
                      id: nomenclatureSelected.id,
                    });
                  }
                }}
                onDayLongPress={() => {}}
                onMonthChange={(data) => {
                  setMonth(data.month);
                  setYear(data.year);
                }}
                arrowsHitSlop={10}
                markingType="period"
                markedDates={markedDates}
              />
            </Animated.View>
          )}
          {!activeSearch && nomenclaturesToChoose.length > 0 && (
            <View
              style={{
                flexGrow: 1,
                marginTop: 20,
                borderRadius: 8,
                padding: 20,
                elevation: 20,
                backgroundColor: mode === "light" ? light.main5 : dark.main2,
              }}
            >
              <View style={{ flex: 1 }}>
                <PanGestureHandler
                  onGestureEvent={handleGesture}
                  onHandlerStateChange={handleGesture}
                >
                  <View
                    style={{
                      width: "100%",
                      paddingBottom: 20,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: "20%",
                        height: 5,
                        borderRadius: 8,
                        backgroundColor:
                          mode === "light" ? light.textDark : dark.textWhite,
                      }}
                    />
                  </View>
                </PanGestureHandler>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {nomenclatureReservation.length === 0 && (
                    <View style={{ marginVertical: 8 }}>
                      <TextStyle center color={light.main2}>
                        NO HAY INFORMACIÓN
                      </TextStyle>
                    </View>
                  )}
                  {[...nomenclatureReservation].reverse().map((item) => {
                    return (
                      <View style={{ marginVertical: 8 }} key={item.ref}>
                        <TextStyle subtitle color={light.main2}>
                          {new Date(item.creationDate).getDate()}{" "}
                          {months[
                            new Date(item.creationDate).getMonth()
                          ]?.toUpperCase()}
                        </TextStyle>
                        {item.hosted.map((item) => {
                          return (
                            <TextStyle
                              key={item.id}
                              smallParagraph
                              color={
                                mode === "light"
                                  ? light.textDark
                                  : dark.textWhite
                              }
                            >
                              {item.fullName} - Reservado{" "}
                              <TextStyle color={light.main2} smallParagraph>
                                {item.owner ? "(Cliente)" : ""}
                              </TextStyle>
                            </TextStyle>
                          );
                        })}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          )}
          {nomenclaturesToChoose.length === 0 && (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <ButtonStyle
                backgroundColor={light.main2}
                style={{ width: "auto", paddingHorizontal: 35 }}
                onPress={() =>
                  navigation.navigate("CreatePlace", { ref: groupSelected.ref })
                }
              >
                <TextStyle center color={light.textDark}>
                  Crear nomenclatura
                </TextStyle>
              </ButtonStyle>
            </View>
          )}
        </>
      )}
      {groups.length === 0 && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ButtonStyle
            backgroundColor={light.main2}
            style={{ width: "auto", paddingHorizontal: 35 }}
            onPress={() => navigation.navigate("CreateZone")}
          >
            <TextStyle center color={light.textDark}>
              Crear grupo de alojamiento
            </TextStyle>
          </ButtonStyle>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeFilter}
        onRequestClose={() => {
          setActiveFilter(!activeFilter);
          setFilters(initialState);
        }}
      >
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: mode === "light" ? light.main4 : dark.main1,
              padding: 30,
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
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
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Para una búsqueda más precisa
              </TextStyle>
            </View>
            <View style={{ marginTop: 6 }}>
              <View style={[styles.row, { marginTop: 15 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Personas MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minPeople}
                    onChangeText={(text) => {
                      const people = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, minPeople: people });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Personas MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxPeople}
                    onChangeText={(text) => {
                      const people = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, maxPeople: people });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Valor MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minValue}
                    onChangeText={(text) => {
                      const value = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, minValue: value });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Valor MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxValue}
                    onChangeText={(text) => {
                      const value = thousandsSystem(
                        text.replace(/[^0-9]/g, "")
                      );
                      setFilters({ ...filters, maxValue: value });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Días MIN
                  </TextStyle>
                  <InputStyle
                    value={filters.minDays}
                    onChangeText={(text) => {
                      const days = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, minDays: days });
                    }}
                    placeholder="MIN"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Días MAX
                  </TextStyle>
                  <InputStyle
                    value={filters.maxDays}
                    onChangeText={(text) => {
                      const days = thousandsSystem(text.replace(/[^0-9]/g, ""));
                      setFilters({ ...filters, maxDays: days });
                    }}
                    placeholder="MAX"
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.cardPicker,
                  {
                    marginTop: 15,
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                  },
                ]}
              >
                <Picker
                  mode="dropdown"
                  selectedValue={filters.valueType}
                  dropdownIconColor={
                    mode === "light" ? light.textDark : dark.textWhite
                  }
                  onValueChange={(itemValue) =>
                    setFilters({ ...filters, valueType: itemValue })
                  }
                  style={{
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                    color: mode === "light" ? light.textDark : dark.textWhite,
                    fontSize: 20,
                  }}
                >
                  <Picker.Item
                    label="Tipo de alojamiento"
                    value="all"
                    style={{
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    }}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                  <Picker.Item
                    label="Estandar"
                    value="standard"
                    style={{
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    }}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                  <Picker.Item
                    label="Por acomodación"
                    value="accommodation"
                    style={{
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    }}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                </Picker>
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <View
                  style={[
                    styles.cardPicker,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                >
                  <Picker
                    mode="dropdown"
                    selectedValue={filters.day}
                    dropdownIconColor={
                      mode === "light" ? light.textDark : dark.textWhite
                    }
                    onValueChange={(itemValue) =>
                      setFilters({ ...filters, day: itemValue })
                    }
                    style={{
                      width: width / 3.7,
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                      color: mode === "light" ? light.textDark : dark.textWhite,
                      fontSize: 20,
                    }}
                  >
                    <Picker.Item
                      label="Día"
                      value="all"
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                    {days.map((day) => (
                      <Picker.Item
                        key={day}
                        label={`${day}`}
                        value={day}
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    ))}
                  </Picker>
                </View>
                <View
                  style={[
                    styles.cardPicker,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                >
                  <Picker
                    mode="dropdown"
                    selectedValue={filters.month}
                    onValueChange={(itemValue) =>
                      setFilters({ ...filters, month: itemValue })
                    }
                    dropdownIconColor={
                      mode === "light" ? light.textDark : dark.textWhite
                    }
                    style={{
                      width: width / 3.7,
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                      color: mode === "light" ? light.textDark : dark.textWhite,
                      fontSize: 20,
                    }}
                  >
                    <Picker.Item
                      label="Mes"
                      value="all"
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                    {months.map((month, index) => (
                      <Picker.Item
                        key={month}
                        label={month}
                        value={index + 1}
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    ))}
                  </Picker>
                </View>
                <View
                  style={[
                    styles.cardPicker,
                    {
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    },
                  ]}
                >
                  <Picker
                    mode="dropdown"
                    selectedValue={filters.year}
                    onValueChange={(itemValue) =>
                      setFilters({ ...filters, year: itemValue })
                    }
                    dropdownIconColor={
                      mode === "light" ? light.textDark : dark.textWhite
                    }
                    style={{
                      width: width / 3.8,
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                      color: mode === "light" ? light.textDark : dark.textWhite,
                      fontSize: 20,
                    }}
                  >
                    <Picker.Item
                      label="Año"
                      value="all"
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                      }}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                    {years.map((year, index) => (
                      <Picker.Item
                        key={year}
                        label={`${year}`}
                        value={year}
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <TextStyle verySmall color={light.main2}>
                  Solo los que llegaron (CHECK IN)
                </TextStyle>
                <Switch
                  trackColor={{ false: dark.main2, true: light.main2 }}
                  thumbColor={light.main4}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={(value) =>
                    setFilters({ ...filters, checkIn: value })
                  }
                  value={filters.aboveReorder}
                />
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <TextStyle verySmall color={light.main2}>
                  Solo los que se fueron (CHECK OUT)
                </TextStyle>
                <Switch
                  trackColor={{ false: dark.main2, true: light.main2 }}
                  thumbColor={light.main4}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={(value) =>
                    setFilters({ ...filters, checkOut: value })
                  }
                  value={filters.belowReorder}
                />
              </View>
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
                  style={{ width: "30%" }}
                  backgroundColor={mode === "light" ? light.main5 : dark.main2}
                  onPress={() => {
                    setActiveFilter(false);
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
                  setActiveFilter(!activeFilter);
                  const compare = { ...filters, active: false };

                  if (
                    JSON.stringify(compare) === JSON.stringify(initialState)
                  ) {
                    setFilters(initialState);
                    return;
                  }
                  setFilters({ ...filters, active: true });
                }}
                backgroundColor={light.main2}
                style={{
                  width: filters.active ? "65%" : "99%",
                }}
              >
                <TextStyle center>Buscar</TextStyle>
              </ButtonStyle>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  premium: {
    height: Math.floor(width / 20),
    width: Math.floor(width / 20),
    position: "absolute",
    top: 0,
    right: 0,
    display: "none",
  },
  cardPicker: {
    padding: 2,
    borderRadius: 8,
  },
  guestCard: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 5,
    marginVertical: 5,
  },
});

export default Accommodation;

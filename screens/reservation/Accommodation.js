import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { edit } from "@features/groups/informationStorageSlice";
import { Calendar } from "react-native-calendars";

import Animated, { useSharedValue, withSpring } from "react-native-reanimated";

import { months, changeDate, thousandsSystem } from "@helpers/libs";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Information from "@components/Information";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { width, height } = Dimensions.get("screen");

const Accommodation = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const groups = useSelector((state) => state.groups);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const reservations = useSelector((state) => state.reservations);
  const informationStorage = useSelector((state) => state.informationStorage);
  const activeGroup = useSelector((state) => state.activeGroup);
  const accommodationState = useSelector((state) => state.accommodation);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [days, setDays] = useState();

  const [groupSelected, setGroupSelected] = useState({});
  const [nomenclatureSelected, setNomenclatureSelected] = useState({});
  const [nomenclaturesToChoose, setNomenclaturesToChoose] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [nomenclatureReservation, setNomenclatureReservation] = useState([]);

  const [route, setRoute] = useState("");

  const dispatch = useDispatch();

  /////

  const heightAnimation = useSharedValue(380);
  const closeCalendar = () =>
    (heightAnimation.value = withSpring(55, { damping: 20 }));
  const openCalendar = () =>
    (heightAnimation.value = withSpring(380, { damping: 20 }));

  const handleGesture = ({ nativeEvent }) => {
    const { translationY, state } = nativeEvent;
    if (state === State.ACTIVE && translationY > 0) {
      openCalendar();
    } else if (state === State.ACTIVE && translationY < 0) {
      closeCalendar();
    }
  };

  const monthPickerRef = useRef();
  const yearPickerRef = useRef();

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
    const days = new Date(year, month - 1, 0).getDate();
    setDays(Array.from({ length: days }, (_, i) => i + 1));
  }, [month, year]);

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

  const Available = () => {
    const [activeInformation, setActiveInformation] = useState(false);

    return (
      <View style={{ height: height / 1.55 }}>
        <View
          style={{
            marginBottom: 15,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            ASIGNACIÓN DE COLORES
          </TextStyle>
          <TouchableOpacity
            onPress={() => setActiveInformation(!activeInformation)}
          >
            <Ionicons
              name="help-circle-outline"
              style={{ marginLeft: 5 }}
              size={28}
              color={light.main2}
            />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: "row" }}>
            <View>
              <TouchableOpacity
                style={{
                  backgroundColor: light.main2,
                  width: 100,
                  height: 34,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => monthPickerRef.current?.focus()}
              >
                <TextStyle smallParagraph>
                  {months[month - 1]?.toUpperCase()}
                </TextStyle>
              </TouchableOpacity>
              {nomenclatures
                .filter((n) => n.ref === groupSelected.ref)
                .map((item, i) => {
                  const backgroundColor =
                    mode === "light"
                      ? `${light.main5}${i % 2 === 0 ? "CC" : "FF"}`
                      : `${dark.main2}${i % 2 === 0 ? "CC" : "FF"}`;

                  return (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: 100,
                      }}
                    >
                      <View style={[styles.available, { backgroundColor }]}>
                        <TextStyle
                          verySmall
                          center
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          {item.name?.toUpperCase().slice(0, 5)}
                        </TextStyle>
                      </View>
                      <TouchableOpacity
                        style={[styles.available, { backgroundColor }]}
                        onPress={() =>
                          navigation.navigate("PlaceInformation", {
                            ref: groupSelected.ref,
                            id: item.id,
                            type: "Nomenclatura",
                          })
                        }
                      >
                        <TextStyle
                          verySmall
                          center
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          {item.nomenclature}
                        </TextStyle>
                      </TouchableOpacity>
                    </View>
                  );
                })}
            </View>
            <ScrollView
              style={{ marginLeft: 2 }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View>
                <View style={{ flexDirection: "row" }}>
                  {days.map((item) => {
                    return (
                      <View
                        key={item}
                        style={[styles.days, { backgroundColor: light.main2 }]}
                      >
                        <TextStyle>{item}</TextStyle>
                      </View>
                    );
                  })}
                </View>
                {nomenclatures
                  .filter((n) => n.ref === groupSelected.ref)
                  .map((item, i) => {
                    const reservationsSelected = reservations.filter(
                      (r) => r.id === item.id
                    );
                    return (
                      <View
                        key={item.id}
                        style={{ flexDirection: "row", marginTop: 5 }}
                      >
                        {days.map((day) => {
                          const reservation = reservationsSelected.find((r) => {
                            const start = new Date(r.start);
                            start.setHours(0, 0, 0, 0);
                            const end = new Date(r.end);
                            end.setHours(0, 0, 0, 0);
                            const date = new Date(year, month - 1, day);
                            date.setHours(0, 0, 0, 0);

                            if (date >= start && date <= end) return r;
                          });

                          let backgroundColor =
                            mode === "light"
                              ? `${light.main5}${i % 2 === 0 ? "CC" : "FF"}`
                              : `${dark.main2}${i % 2 === 0 ? "CC" : "FF"}`;

                          if (reservation) {
                            const findBackground = () => {
                              const checkIn = reservation.hosted.reduce(
                                (a, b) => {
                                  if (b.checkIn) return a + 1;
                                  return a;
                                },
                                0
                              );

                              const checkOut = reservation.hosted.reduce(
                                (a, b) => {
                                  if (b.checkOut) return a + 1;
                                  return a;
                                },
                                0
                              );

                              const hosted = reservation.hosted?.length;

                              if (
                                ![0, hosted].includes(checkIn) &&
                                ![0, hosted].includes(checkOut)
                              )
                                return "#f87575"; //ALGUNOS SE FUERON, OTROS NO HA LLEGADO ✅
                              if (checkOut === hosted) return "#b6e0f3"; // CUANDO YA SE FUERON ✅
                              if (![0, hosted].includes(checkOut))
                                return "#ff9900"; // CUANDO SE FUERON PERO FALTAN ALGUNOS ✅
                              if (checkIn === hosted) return "#00ffbc"; // CUANDO YA LLEGARON ✅
                              if (![0, hosted].includes(checkIn))
                                return "#ffecb3"; // CUANDO ALGUNOS HAN LLEGADO PERO OTROS NO ✅
                              if (checkIn === 0) return light.main2; // CUANDO ESTAN RESERVADOS ✅
                            };

                            backgroundColor = findBackground();
                          }

                          return (
                            <TouchableOpacity
                              onPress={() => {
                                if (reservation) {
                                  navigation.navigate("ReserveInformation", {
                                    ref: reservation.ref,
                                    id: item.id,
                                  });
                                } else {
                                  navigation.navigate("CreateReserve", {
                                    year,
                                    day,
                                    month,
                                    id: item.id,
                                  });
                                }
                              }}
                              key={day}
                              style={[styles.days, { backgroundColor }]}
                            >
                              <TextStyle>
                                {reservation?.hosted.length || ""}
                              </TextStyle>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  })}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
        <Information
          modalVisible={activeInformation}
          setModalVisible={setActiveInformation}
          style={{ width: "90%" }}
          title="COLORES"
          content={() => (
            <View>
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Depende del estado de la reservación, es el color
              </TextStyle>
              <View style={{ marginTop: 15 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={[
                      styles.available,
                      {
                        width: 34,
                        backgroundColor: "#f87575",
                        marginRight: 10,
                      },
                    ]}
                  />
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Algunos se fueron, otros no han llegado
                  </TextStyle>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={[
                      styles.available,
                      {
                        width: 34,
                        backgroundColor: "#b6e0f3",
                        marginRight: 10,
                      },
                    ]}
                  />
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Ya se fueron
                  </TextStyle>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={[
                      styles.available,
                      {
                        width: 34,
                        backgroundColor: "#ff9900",
                        marginRight: 10,
                      },
                    ]}
                  />
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Algunos se fueron, pero todavía faltan
                  </TextStyle>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={[
                      styles.available,
                      {
                        width: 34,
                        backgroundColor: "#00ffbc",
                        marginRight: 10,
                      },
                    ]}
                  />
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Ya llegaron
                  </TextStyle>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={[
                      styles.available,
                      {
                        width: 34,
                        backgroundColor: "#ffecb3",
                        marginRight: 10,
                      },
                    ]}
                  />
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Algunos han llegado, pero todavía faltan
                  </TextStyle>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={[
                      styles.available,
                      {
                        width: 34,
                        backgroundColor: light.main2,
                        marginRight: 10,
                      },
                    ]}
                  />
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Solo estan reservados (no han llegado)
                  </TextStyle>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    );
  };

  const Hosted = () => {
    const [search, setSearch] = useState("");
    const [hosted, setHosted] = useState([]);
    const [activeFilter, setActiveFilter] = useState(false);
    const initialState = {
      active: false,
      group: "",
      nomenclature: "",
      type: "",
      minDays: "",
      maxDays: "",
      day: "all",
      month: "all",
      year: "all",
    };
    const [filters, setFilters] = useState(initialState);

    const [days, setDays] = useState([]);
    const [years, setYears] = useState([]);
    const [nomenclaturesToChoose, setNomenclaturesToChoose] = useState([]);

    useEffect(() => {
      if (groups.length > 0) {
        const nomenclaturesFound = nomenclatures.filter(
          (n) => n.ref === filters.group
        );
        setNomenclaturesToChoose(nomenclaturesFound);
      }
    }, [filters.group]);

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
      const hosted = reservations.flatMap((item) => {
        const { nomenclature, ref } = nomenclatures.find(
          (n) => n.id === item.id
        );
        const { name: group } = groups.find((g) => g.ref === ref);

        return item.hosted
          .filter((r) => !r.checkOut && r.checkIn)
          .map((person) => ({
            ...person,
            accommodationID: item.accommodation?.id || "standard",
            accommodation: item?.accommodation?.name || "Estandar",
            groupID: ref,
            nomenclatureID: item.id,
            days: item.days,
            group,
            nomenclature,
            creationDate: item.creationDate,
          }));
      });

      if (search || filters.active) {
        const hostedWithSearch = hosted.filter((h) => {
          const formatText = (text) =>
            text
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");

          if (
            formatText(h.fullName).includes(formatText(search)) ||
            h?.identification.includes(search) ||
            h?.identification.replace(/[^0-9]/g, "").includes(search) ||
            h?.phoneNumber.includes(search) ||
            formatText(h?.email).includes(formatText(search))
          ) {
            if (!filters.active) return h;
            if (dateValidation(new Date(h.creationDate))) return;
            if (
              filters.minDays &&
              h.days < parseInt(filters.minDays.replace(/\D/g, ""))
            )
              return;
            if (
              filters.maxDays &&
              h.days > parseInt(filters.maxDays.replace(/\D/g, ""))
            )
              return;
            if (filters.type && h.accommodationID !== filters.type) return;
            if (filters.group && h.groupID !== filters.group) return;
            if (
              filters.nomenclature &&
              h.nomenclatureID !== filters.nomenclature
            )
              return;

            return h;
          }
        });
        setHosted(hostedWithSearch);
      } else setHosted(hosted);
    }, [search, filters]);

    return (
      <View style={{ height: height / 1.55 }}>
        <View style={[styles.row, { marginBottom: 15 }]}>
          <InputStyle
            placeholder="Nombre, Cédula, Teléfono, Email"
            value={search}
            onChangeText={(text) => setSearch(text)}
            stylesContainer={{ width: "85%", marginVertical: 0 }}
            stylesInput={{
              paddingHorizontal: 6,
              paddingVertical: 5,
              fontSize: 18,
            }}
          />
          <TouchableOpacity onPress={() => setActiveFilter(!activeFilter)}>
            <Ionicons name="filter" size={30} color={light.main2} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: "100%",
            backgroundColor: light.main2,
            padding: 15,
          }}
        >
          <TextStyle bold>LISTADO DE HUÉSPEDES</TextStyle>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Nombre
                  </TextStyle>
                </View>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    CÉDULA
                  </TextStyle>
                </View>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    CHECK IN
                  </TextStyle>
                </View>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    GRUPO
                  </TextStyle>
                </View>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    NOMENCLATURA
                  </TextStyle>
                </View>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    TIPO
                  </TextStyle>
                </View>
                <View
                  style={[
                    styles.table,
                    {
                      borderColor:
                        mode === "light" ? light.textDark : dark.textWhite,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    DÍAS
                  </TextStyle>
                </View>
              </View>
              {hosted.map((guest) => {
                return (
                  <View key={guest.id} style={{ flexDirection: "row" }}>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        {guest.fullName}
                      </TextStyle>
                    </View>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        {guest.identification}
                      </TextStyle>
                    </View>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        {guest.checkIn
                          ? changeDate(new Date(guest.checkIn))
                          : "NO"}
                      </TextStyle>
                    </View>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        {guest.group}
                      </TextStyle>
                    </View>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        {guest.nomenclature}
                      </TextStyle>
                    </View>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        {guest.accommodation}
                      </TextStyle>
                    </View>
                    <View
                      style={[
                        styles.table,
                        {
                          borderColor:
                            mode === "light" ? light.textDark : dark.textWhite,
                        },
                      ]}
                    >
                      <TextStyle
                        smallParagraph
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      >
                        {guest.days}
                      </TextStyle>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>
        <Modal
          animationType="fade"
          transparent={true}
          visible={activeFilter}
          onRequestClose={() => {
            setActiveFilter(!activeFilter);
            setFilters(initialState);
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => setActiveFilter(!activeFilter)}
          >
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
                      Días MIN
                    </TextStyle>
                    <InputStyle
                      value={filters.minDays}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, minDays: value });
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
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
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
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        width: "100%",
                      },
                    ]}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={filters.type}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, type: itemValue })
                      }
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                        fontSize: 20,
                      }}
                    >
                      <Picker.Item
                        label="Selección de tipo"
                        value=""
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                      <Picker.Item
                        label="Estandar"
                        value="standard"
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                      {accommodationState.map((accommodation) => (
                        <Picker.Item
                          key={accommodation.id}
                          label={accommodation.name}
                          value={accommodation.id}
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
                <View style={[styles.row, { marginTop: 10 }]}>
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
                      selectedValue={filters.group}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, group: itemValue })
                      }
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                        fontSize: 20,
                        width: width / 2.8,
                      }}
                    >
                      <Picker.Item
                        label="Grupo"
                        value=""
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
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
                      selectedValue={filters.nomenclature}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, nomenclature: itemValue })
                      }
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                        fontSize: 20,
                        width: width / 2.8,
                      }}
                    >
                      <Picker.Item
                        label="Nomenclatura"
                        value=""
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                      {nomenclaturesToChoose.map((n) => (
                        <Picker.Item
                          key={n.id}
                          label={n.nomenclature}
                          value={n.id}
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
                <View style={[styles.row, { marginTop: 10 }]}>
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
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                    backgroundColor={
                      mode === "light" ? light.main5 : dark.main2
                    }
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
                    width: filters.active ? "60%" : "99%",
                  }}
                >
                  <TextStyle center>Buscar</TextStyle>
                </ButtonStyle>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const Location = () => {
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState([]);

    const [activeFilter, setActiveFilter] = useState(false);
    const initialState = {
      active: false,
      minDays: "",
      maxDays: "",
      type: "",
      day: "all",
      month: "all",
      year: "all",
    };
    const [filters, setFilters] = useState(initialState);

    const [days, setDays] = useState([]);
    const [years, setYears] = useState([]);

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
      const location = nomenclatures
        .filter((n) => n.ref === groupSelected.ref)
        .flatMap((item) => {
          const hosted = reservations
            .filter((r) => r.id === item.id)
            .flatMap((r) => {
              return r.hosted
                .filter((r) => !r.checkOut && r.checkIn)
                .map((person) => ({
                  ...person,
                  accommodationID: r.accommodation?.id || "standard",
                  accommodation: r?.accommodation?.name || "Estandar",
                  days: r.days,
                  creationDate: r.creationDate,
                }));
            });

          return { ...item, hosted };
        });

      if (search || filters.active) {
        const locationWithSearch = location.map((item) => ({
          ...item,
          hosted: item.hosted.filter((h) => {
            const formatText = (text) =>
              text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            if (
              formatText(h.fullName).includes(formatText(search)) ||
              h?.identification.includes(search) ||
              h?.identification.replace(/[^0-9]/g, "").includes(search) ||
              h?.phoneNumber.includes(search) ||
              formatText(h?.email).includes(formatText(search))
            ) {
              if (!filters.active) return h;
              if (dateValidation(new Date(h.creationDate))) return;
              if (
                filters.minDays &&
                h.days < parseInt(filters.minDays.replace(/\D/g, ""))
              )
                return;
              if (
                filters.maxDays &&
                h.days > parseInt(filters.maxDays.replace(/\D/g, ""))
              )
                return;
              if (filters.type && h.accommodationID !== filters.type) return;

              return h;
            }
          }),
        }));
        setLocation(locationWithSearch);
      } else setLocation(location);
    }, [search, filters]);

    return (
      <View style={{ height: height / 1.55 }}>
        <View style={[styles.row, { marginBottom: 15 }]}>
          <InputStyle
            placeholder="Nombre, Cédula, Teléfono, Email"
            value={search}
            onChangeText={(text) => setSearch(text)}
            stylesContainer={{ width: "85%", marginVertical: 0 }}
            stylesInput={{
              paddingHorizontal: 6,
              paddingVertical: 5,
              fontSize: 18,
            }}
          />
          <TouchableOpacity onPress={() => setActiveFilter(!activeFilter)}>
            <Ionicons name="filter" size={30} color={light.main2} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {location.map((item) => {
            return (
              <View key={item.id} style={{ marginBottom: 10 }}>
                <View
                  style={{
                    width: "100%",
                    backgroundColor: light.main2,
                    padding: 15,
                  }}
                >
                  <TextStyle bold>HABITACIÓN {item.nomenclature}</TextStyle>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    <View style={{ flexDirection: "row" }}>
                      <View
                        style={[
                          styles.table,
                          {
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          Nombre
                        </TextStyle>
                      </View>
                      <View
                        style={[
                          styles.table,
                          {
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          CÉDULA
                        </TextStyle>
                      </View>
                      <View
                        style={[
                          styles.table,
                          {
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          CHECK IN
                        </TextStyle>
                      </View>
                      <View
                        style={[
                          styles.table,
                          {
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          TIPO
                        </TextStyle>
                      </View>
                      <View
                        style={[
                          styles.table,
                          {
                            borderColor:
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
                          },
                        ]}
                      >
                        <TextStyle
                          smallParagraph
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        >
                          DÍAS
                        </TextStyle>
                      </View>
                    </View>
                    {item.hosted.map((guest) => {
                      return (
                        <View key={guest.id} style={{ flexDirection: "row" }}>
                          <View
                            style={[
                              styles.table,
                              {
                                borderColor:
                                  mode === "light"
                                    ? light.textDark
                                    : dark.textWhite,
                              },
                            ]}
                          >
                            <TextStyle
                              smallParagraph
                              color={
                                mode === "light"
                                  ? light.textDark
                                  : dark.textWhite
                              }
                            >
                              {guest.fullName}
                            </TextStyle>
                          </View>
                          <View
                            style={[
                              styles.table,
                              {
                                borderColor:
                                  mode === "light"
                                    ? light.textDark
                                    : dark.textWhite,
                              },
                            ]}
                          >
                            <TextStyle
                              smallParagraph
                              color={
                                mode === "light"
                                  ? light.textDark
                                  : dark.textWhite
                              }
                            >
                              {guest.identification}
                            </TextStyle>
                          </View>
                          <View
                            style={[
                              styles.table,
                              {
                                borderColor:
                                  mode === "light"
                                    ? light.textDark
                                    : dark.textWhite,
                              },
                            ]}
                          >
                            <TextStyle
                              smallParagraph
                              color={
                                mode === "light"
                                  ? light.textDark
                                  : dark.textWhite
                              }
                            >
                              {guest.checkIn
                                ? changeDate(new Date(guest.checkIn))
                                : "NO"}
                            </TextStyle>
                          </View>
                          <View
                            style={[
                              styles.table,
                              {
                                borderColor:
                                  mode === "light"
                                    ? light.textDark
                                    : dark.textWhite,
                              },
                            ]}
                          >
                            <TextStyle
                              smallParagraph
                              color={
                                mode === "light"
                                  ? light.textDark
                                  : dark.textWhite
                              }
                            >
                              {guest.accommodation}
                            </TextStyle>
                          </View>
                          <View
                            style={[
                              styles.table,
                              {
                                borderColor:
                                  mode === "light"
                                    ? light.textDark
                                    : dark.textWhite,
                              },
                            ]}
                          >
                            <TextStyle
                              smallParagraph
                              color={
                                mode === "light"
                                  ? light.textDark
                                  : dark.textWhite
                              }
                            >
                              {guest.days}
                            </TextStyle>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
        <Modal
          animationType="fade"
          transparent={true}
          visible={activeFilter}
          onRequestClose={() => {
            setActiveFilter(!activeFilter);
            setFilters(initialState);
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => setActiveFilter(!activeFilter)}
          >
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
                      Días MIN
                    </TextStyle>
                    <InputStyle
                      value={filters.minDays}
                      onChangeText={(text) => {
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, minDays: value });
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
                        const value = thousandsSystem(
                          text.replace(/[^0-9]/g, "")
                        );
                        setFilters({ ...filters, maxDays: value });
                      }}
                      placeholder="MAX"
                      keyboardType="numeric"
                      maxLength={11}
                    />
                  </View>
                </View>
                <View style={[styles.row, { marginTop: 10 }]}>
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
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                        width: width / 4.3,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
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
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
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
                    backgroundColor={
                      mode === "light" ? light.main5 : dark.main2
                    }
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
                    width: filters.active ? "60%" : "99%",
                  }}
                >
                  <TextStyle center>Buscar</TextStyle>
                </ButtonStyle>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      {groups.length > 0 && (
        <>
          <View>
            <View style={styles.row}>
              <View>
                <TouchableOpacity
                  onPress={() => monthPickerRef.current?.focus()}
                >
                  <TextStyle bigParagraph color={light.main2}>
                    {months[month - 1]?.toUpperCase()}
                  </TextStyle>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => yearPickerRef.current?.focus()}
                >
                  <TextStyle
                    paragraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                    customStyle={{ lineHeight: 20 }}
                  >
                    {year}
                  </TextStyle>
                </TouchableOpacity>
              </View>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {route && (
                    <TouchableOpacity
                      style={{ marginRight: route !== "hosted" ? 5 : 0 }}
                      onPress={() => setRoute("")}
                    >
                      <Ionicons
                        name="arrow-back"
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                        size={40}
                      />
                    </TouchableOpacity>
                  )}
                  {(!route || route !== "hosted") && (
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
                  )}
                  {!route && nomenclaturesToChoose.length > 0 && (
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
                {(!activeGroup.active || activeGroup.accessToReservations) && (
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
                    if (activeGroup.active && !activeGroup.accessToReservations)
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
            <View style={[styles.row, { marginBottom: 15 }]}>
              <ButtonStyle
                backgroundColor={light.main2}
                onPress={() => setRoute("hosted")}
                style={{ width: "auto" }}
              >
                <TextStyle smallParagraph bold>
                  ALOJADOS
                </TextStyle>
              </ButtonStyle>
              <ButtonStyle
                backgroundColor={light.main2}
                onPress={() => setRoute("available")}
                style={{ width: "auto" }}
              >
                <TextStyle smallParagraph bold>
                  DISPONIBLES
                </TextStyle>
              </ButtonStyle>
              <ButtonStyle
                backgroundColor={light.main2}
                onPress={() => setRoute("location")}
                style={{ width: "auto" }}
              >
                <TextStyle smallParagraph bold>
                  UBICACIÓN
                </TextStyle>
              </ButtonStyle>
            </View>
          </View>

          {!route && (
            <>
              {nomenclaturesToChoose.length > 0 && (
                <Animated.View
                  style={{
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                    borderRadius: 8,
                    elevation: 20,
                    height: heightAnimation,
                    maxHeight: 380,
                    overflow: "hidden",
                  }}
                >
                  <Calendar
                    key={mode}
                    style={{ borderRadius: 8 }}
                    // Specify theme properties to override specific styles for calendar parts. Default = {}
                    theme={{
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
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
                      const reservation =
                        markedDates[data.dateString]?.reservation;
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
              {nomenclaturesToChoose.length > 0 && (
                <View
                  style={{
                    flexGrow: 1,
                    marginTop: 20,
                    borderRadius: 8,
                    padding: 20,
                    elevation: 20,
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
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
                              mode === "light"
                                ? light.textDark
                                : dark.textWhite,
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
            </>
          )}
          {route === "hosted" && <Hosted />}
          {route === "available" && <Available />}
          {route === "location" && <Location />}

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
      <View style={{ display: "none" }}>
        <Picker
          ref={monthPickerRef}
          style={{
            color: mode === "light" ? light.textDark : dark.textWhite,
          }}
          selectedValue={month}
          onValueChange={(value) => setMonth(value)}
        >
          {months.map((item, i) => (
            <Picker.Item
              key={item}
              label={item}
              value={i + 1}
              style={{
                backgroundColor: mode === "light" ? light.main5 : dark.main2,
              }}
              color={mode === "light" ? light.textDark : dark.textWhite}
            />
          ))}
        </Picker>
        <Picker
          ref={yearPickerRef}
          style={{
            color: mode === "light" ? light.textDark : dark.textWhite,
          }}
          selectedValue={year}
          onValueChange={(value) => setYear(value)}
        >
          {Array.from(
            { length: 5 },
            (_, i) => new Date().getFullYear() + i
          ).map((item, i) => (
            <Picker.Item
              key={item}
              label={item.toString()}
              value={item}
              style={{
                backgroundColor: mode === "light" ? light.main5 : dark.main2,
              }}
              color={mode === "light" ? light.textDark : dark.textWhite}
            />
          ))}
        </Picker>
      </View>
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
  table: {
    width: 120,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
  available: {
    width: 48,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  days: {
    marginHorizontal: 2,
    height: 34,
    width: 34,
    justifyContent: "center",
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

export default Accommodation;

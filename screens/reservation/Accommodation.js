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
import {
  months,
  changeDate,
  thousandsSystem,
  getFontSize,
  random,
} from "@helpers/libs";
import { edit as editR } from "@features/zones/reservationsSlice";
import { editReservation } from "@api";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Information from "@components/Information";
import ChooseDate from "@components/ChooseDate";
import AddPerson from "@components/AddPerson";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { width, height } = Dimensions.get("screen");

const Accommodation = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const zones = useSelector((state) => state.zones);
  const user = useSelector((state) => state.user);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const reservations = useSelector((state) => state.reservations);
  const helperStatus = useSelector((state) => state.helperStatus);
  const accommodationState = useSelector((state) => state.accommodation);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [days, setDays] = useState([]);

  const [zoneSelected, setZoneSelected] = useState("");
  const [route, setRoute] = useState("");
  const [modalVisibleCalendar, setModalVisibleCalendar] = useState(false);

  const [modalVisiblePeople, setModalVisiblePeople] = useState(false);
  const [reservationSelected, setReservationSelected] = useState(null);

  const dispatch = useDispatch();

  const saveHosted = async ({ data, cleanData }) => {
    const id = random(20);
    data.id = id;
    data.owner = null;
    data.payment = 0;
    data.checkOut = null;
    const reserveUpdated = {
      ...reservationSelected,
      hosted: [...reservationSelected.hosted, data],
    };
    dispatch(editR({ ref: reservationSelected.ref, data: reserveUpdated }));
    setReservationSelected(null);
    setModalVisibleCalendar(false)
    cleanData();
    await editReservation({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      reservation: reserveUpdated,
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
  };

  /////

  const monthPickerRef = useRef();
  const yearPickerRef = useRef();

  /////

  useEffect(() => {
    const days = new Date(year, month - 1, 0).getDate();
    setDays(Array.from({ length: days }, (_, i) => i + 1));
  }, [month, year]);

  const Available = () => {
    const [activeInformation, setActiveInformation] = useState(false);
    const [activeScrollView, setActiveScrollView] = useState(null);

    const scrollViewDaysRef = useRef();
    const scrollViewsRefs = useRef([]);

    const handleScroll = (event, index) => {
      if (index === activeScrollView) {
        const { nativeEvent } = event;
        const { contentOffset } = nativeEvent;

        const value = { x: contentOffset.x, animated: false };

        if ('days' !== index) scrollViewDaysRef.current.scrollTo(value);
        scrollViewsRefs.current.forEach((ref, i) => {
          if (i !== index && ref) {
            ref.scrollTo(value);
          }
        });
      }
    };

    const handleTouchStart = (index) => {
      setActiveScrollView(index);
    };

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
              size={getFontSize(23)}
              color={light.main2}
            />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[
                  styles.available,
                  { backgroundColor: light.main2, marginTop: 0, width: 48 },
                ]}
                onPress={() => monthPickerRef.current?.focus()}
              >
                <TextStyle smallParagraph>
                  {months[month - 1]?.toUpperCase().slice(0, 3)}
                </TextStyle>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.available,
                  {
                    backgroundColor: light.main2,
                    marginTop: 0,
                    width: 48,
                    marginLeft: 4,
                  },
                ]}
                onPress={() => yearPickerRef.current?.focus()}
              >
                <TextStyle smallParagraph>{year}</TextStyle>
              </TouchableOpacity>
              <ScrollView
                ref={scrollViewDaysRef}
                style={{ marginLeft: 2 }}
                horizontal
                onScroll={(event) => handleScroll(event, "days")}
                onTouchStart={() => handleTouchStart("days")}
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
              >
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
              </ScrollView>
            </View>
            {zones
              .filter((zones) => zones.ref === zoneSelected || !zoneSelected)
              .map((item, index) => {
                return (
                  <View key={item.ref}>
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: light.main2,
                          padding: 8,
                          marginTop: 5,
                          width: 100,
                        }}
                        onPress={() =>
                          navigation.navigate("PlaceInformation", {
                            ref: item.ref,
                            name: item?.name,
                            type: "General",
                          })
                        }
                      >
                        <TextStyle bold>
                          {item.name.toUpperCase().slice(0, 8)}
                        </TextStyle>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("CreatePlace", { ref: item.ref })
                        }
                        style={{
                          backgroundColor: light.main2,
                          padding: 8,
                          marginTop: 5,
                          flexGrow: 1,
                          marginLeft: 4,
                        }}
                      >
                        <TextStyle bold>AÑADIR NOMENCLATURA</TextStyle>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                      <View>
                        {nomenclatures
                          .filter((n) => n.ref === item.ref)
                          .map((item, i) => {
                            const backgroundColor =
                              mode === "light"
                                ? `${light.main5}${i % 2 === 0 ? "CC" : "FF"}`
                                : `${dark.main2}${i % 2 === 0 ? "CC" : "FF"}`;

                            return (
                              <View
                                key={item.id}
                                style={{ flexDirection: "row" }}
                              >
                                <View
                                  style={[
                                    styles.available,
                                    { backgroundColor, width: 48 },
                                  ]}
                                >
                                  <TextStyle
                                    verySmall
                                    center
                                    color={
                                      mode === "light"
                                        ? light.textDark
                                        : dark.textWhite
                                    }
                                  >
                                    {item.name?.toUpperCase().slice(0, 5)}
                                  </TextStyle>
                                </View>
                                <TouchableOpacity
                                  style={[
                                    styles.available,
                                    {
                                      backgroundColor,
                                      width: 48,
                                      marginLeft: 4,
                                    },
                                  ]}
                                  onPress={() =>
                                    navigation.navigate("PlaceInformation", {
                                      ref: zoneSelected,
                                      id: item.id,
                                      type: "Nomenclatura",
                                    })
                                  }
                                >
                                  <TextStyle
                                    verySmall
                                    center
                                    color={
                                      mode === "light"
                                        ? light.textDark
                                        : dark.textWhite
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
                        ref={(ref) => (scrollViewsRefs.current[index] = ref)}
                        style={{ marginLeft: 2 }}
                        horizontal
                        onScroll={(event) => handleScroll(event, index)}
                        onTouchStart={() => handleTouchStart(index)}
                        scrollEventThrottle={16}
                        showsHorizontalScrollIndicator={false}
                      >
                        <View>
                          {nomenclatures
                            .filter((n) => n.ref === item.ref)
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
                                    const reservation =
                                      reservationsSelected.find((r) => {
                                        const start = new Date(r.start);
                                        start.setHours(0, 0, 0, 0);
                                        const end = new Date(r.end);
                                        end.setHours(0, 0, 0, 0);
                                        const date = new Date(
                                          year,
                                          month - 1,
                                          day
                                        );
                                        date.setHours(0, 0, 0, 0);

                                        if (date >= start && date <= end)
                                          return r;
                                      });

                                    let backgroundColor =
                                      mode === "light"
                                        ? `${light.main5}${
                                            i % 2 === 0 ? "CC" : "FF"
                                          }`
                                        : `${dark.main2}${
                                            i % 2 === 0 ? "CC" : "FF"
                                          }`;

                                    if (reservation) {
                                      const findBackground = () => {
                                        const checkIn =
                                          reservation.hosted.reduce((a, b) => {
                                            if (b.checkIn) return a + 1;
                                            return a;
                                          }, 0);

                                        const checkOut =
                                          reservation.hosted.reduce((a, b) => {
                                            if (b.checkOut) return a + 1;
                                            return a;
                                          }, 0);

                                        const hosted =
                                          reservation.hosted?.length;

                                        if (
                                          ![0, hosted].includes(checkIn) &&
                                          ![0, hosted].includes(checkOut)
                                        )
                                          return "#f87575"; //ALGUNOS SE FUERON, OTROS NO HA LLEGADO ✅
                                        if (checkOut === hosted)
                                          return "#b6e0f3"; // CUANDO YA SE FUERON ✅
                                        if (![0, hosted].includes(checkOut))
                                          return "#ff9900"; // CUANDO SE FUERON PERO FALTAN ALGUNOS ✅
                                        if (checkIn === hosted)
                                          return "#00ffbc"; // CUANDO YA LLEGARON ✅
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
                                            setModalVisiblePeople(
                                              !modalVisiblePeople
                                            );
                                            setReservationSelected(reservation);
                                          } else {
                                            navigation.navigate(
                                              "CreateReserve",
                                              {
                                                year,
                                                day,
                                                month,
                                                id: item.id,
                                              }
                                            );
                                          }
                                        }}
                                        onLongPress={() => {
                                          if (reservation) {
                                            navigation.navigate(
                                              "ReserveInformation",
                                              {
                                                ref: reservation.ref,
                                                id: item.id,
                                              }
                                            );
                                          }
                                        }}
                                        key={day}
                                        style={[
                                          styles.days,
                                          { backgroundColor },
                                        ]}
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
                  </View>
                );
              })}
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

  const Hosted = ({ reservation }) => {
    const [search, setSearch] = useState("");
    const [hosted, setHosted] = useState([]);
    const [activeFilter, setActiveFilter] = useState(false);
    const initialState = {
      active: false,
      zone: "",
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
      if (zones.length > 0) {
        const nomenclaturesFound = nomenclatures.filter(
          (n) => n.ref === filters.zone
        );
        setNomenclaturesToChoose(nomenclaturesFound);
      }
    }, [filters.zone]);

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
        const { name: zone } = zones.find((g) => g.ref === ref);

        return item.hosted
          .filter((r) => (reservation ? !r.checkIn : !r.checkOut && r.checkIn))
          .map((person) => ({
            ...person,
            accommodationID: item.accommodation?.id || "standard",
            accommodation: item?.accommodation?.name || "Estandar",
            groupID: ref,
            nomenclatureID: item.id,
            days: item.days,
            zone,
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
            if (filters.zone && h.groupID !== filters.zone) return;
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
            <Ionicons
              name="filter"
              size={getFontSize(24)}
              color={light.main2}
            />
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
                        {guest.zone}
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
                      selectedValue={filters.zone}
                      onValueChange={(itemValue) =>
                        setFilters({ ...filters, zone: itemValue })
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
                      {zones.map((zone, index) => (
                        <Picker.Item
                          key={zone.id + index}
                          label={zone.name}
                          value={zone.ref}
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
        .filter((n) => n.ref === zoneSelected || !zoneSelected)
        .flatMap((item) => {
          const zone = zones.find((z) => z.ref === item.ref);
          
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

          return { ...item, hosted, zoneName: zone?.name || '' };
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
            <Ionicons
              name="filter"
              size={getFontSize(24)}
              color={light.main2}
            />
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
                  <TextStyle bold>
                    {item?.zoneName?.toUpperCase()} ({item.nomenclature})
                  </TextStyle>
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
      {zones.length > 0 && (
        <>
          <View>
            <View style={styles.row}>
              <ButtonStyle
                style={{ width: "auto" }}
                backgroundColor={light.main2}
                onPress={() => setModalVisibleCalendar(!modalVisibleCalendar)}
              >
                <TextStyle center>Crear una reserva</TextStyle>
              </ButtonStyle>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {route && (
                  <TouchableOpacity onPress={() => setRoute("")}>
                    <Ionicons
                      name="arrow-back"
                      size={getFontSize(25)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                )}
                {(!route ||
                  (route !== "hosted" && route !== "reservations")) && (
                  <View
                    style={{
                      marginHorizontal: 2,
                      backgroundColor:
                        mode === "light" ? light.main5 : dark.main2,
                    }}
                  >
                    <Picker
                      mode="dropdown"
                      selectedValue={zoneSelected || ""}
                      onValueChange={(value) => {
                        if (value === "CreateZone")
                          return navigation.navigate("CreateZone");
                        setZoneSelected(value);
                      }}
                      dropdownIconColor={
                        mode === "light" ? light.textDark : dark.textWhite
                      }
                      style={{
                        width: width / 2.8,
                        backgroundColor:
                          mode === "light" ? light.main5 : dark.main2,
                        color:
                          mode === "light" ? light.textDark : dark.textWhite,
                        fontSize: 20,
                      }}
                    >
                      <Picker.Item
                        label="SELECCIONA"
                        value=""
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
                      {zones.map((zone, index) => (
                        <Picker.Item
                          key={zone.id + index}
                          label={zone.name}
                          value={zone.ref}
                          style={{
                            backgroundColor:
                              mode === "light" ? light.main5 : dark.main2,
                          }}
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      ))}
                      {(!helperStatus.active ||
                        helperStatus.accessToReservations) && (
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
              </View>
            </View>
            <View style={[styles.row, { marginBottom: 15, marginTop: 30 }]}>
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
                onPress={() => setRoute("reservations")}
                style={{ width: "auto" }}
              >
                <TextStyle smallParagraph bold>
                  RESERVAS
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

          {route === "reservations" && <Hosted reservation={true} />}
          {route === "hosted" && <Hosted />}
          {!route && <Available />}
          {route === "location" && <Location />}
        </>
      )}
      {zones.length === 0 && (
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
      <ChooseDate
        modalVisible={modalVisibleCalendar}
        setModalVisible={setModalVisibleCalendar}
        onDayPress={({ data, markedDates, nomenclatureID, cleanData }) => {
          const reservation = markedDates[data.dateString]?.reservation;

          if (reservation) {
            setModalVisiblePeople(!modalVisiblePeople);
            setReservationSelected(reservation);
          } else {
            navigation.navigate("CreateReserve", {
              year: data.year,
              day: data.day,
              month: data.month,
              id: nomenclatureID,
            });
            cleanData();
          }
        }}
      />
      <AddPerson
        modalVisible={modalVisiblePeople}
        setModalVisible={setModalVisiblePeople}
        handleSubmit={(data) => saveHosted(data)}
      />
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

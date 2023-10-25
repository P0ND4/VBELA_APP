import { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { edit as editR } from "@features/zones/reservationsSlice";
import { Picker } from "@react-native-picker/picker";
import {
  months,
  thousandsSystem,
  changeDate,
  getFontSize,
  random,
} from "@helpers/libs";
import { editReservation } from "@api";
import AddPerson from "@components/AddPerson";
import Information from "@components/Information";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;
const height = Dimensions.get("window").height;
const width = Dimensions.get("screen").width;

const PlaceScreen = ({ route, navigation }) => {
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const helperStatus = useSelector((state) => state.helperStatus);
  const zoneState = useSelector((state) => state.zones);
  const nomenclaturesState = useSelector((state) => state.nomenclatures);
  const reservationsState = useSelector((state) => state.reservations);

  const [zone, setZone] = useState([]);
  const [reservations, setReservation] = useState([]);
  const [nomenclatures, setNomenclatures] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filter, setFilter] = useState("");
  const [filterResult, setFilterResult] = useState([]);
  const [activeInformation, setActiveInformation] = useState(false);
  const [modalVisiblePeople, setModalVisiblePeople] = useState(false);
  const [reservationSelected, setReservationSelected] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [days, setDays] = useState([]);

  /////

  const monthPickerRef = useRef();
  const yearPickerRef = useRef();

  /////

  useEffect(() => {
    const days = new Date(year, month, 0).getDate();
    setDays(Array.from({ length: days }, (_, i) => i + 1));
  }, [month, year]);

  const searchRef = useRef();
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

  useEffect(() => {
    let reservations = [];

    for (let n of nomenclatures) {
      const found = reservationsState.filter((r) => r.id === n.id);
      for (let r of found) {
        reservations.push(r);
      }
    }

    setReservation(reservations);
  }, [nomenclatures, reservationsState]);

  useEffect(() => {
    setZone(zoneState.find((zone) => zone.ref === route.params.ref));
    setNomenclatures(
      nomenclaturesState.filter((n) => n.ref === route.params.ref)
    );
  }, [zoneState, nomenclaturesState]);

  useEffect(() => {
    const guests = [];

    const formatText = (text) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    for (let guest of reservations) {
      for (let hosted of guest.hosted) {
        if (
          formatText(hosted.fullName)?.includes(formatText(filter)) ||
          formatText(hosted.email)?.includes(formatText(filter)) ||
          formatText(hosted.identification)?.includes(formatText(filter)) ||
          thousandsSystem(hosted.identification)?.includes(filter) ||
          formatText(hosted.phoneNumber)?.includes(formatText(filter))
        )
          guests.push({ ...hosted, ...guest });
      }
    }

    setFilterResult(guests);
  }, [filter, activeFilter]);

  useEffect(() => {
    if (!activeFilter) setFilter("");
  }, [activeFilter]);

  useEffect(() => {
    navigation.setOptions({ title: zone?.name });
  }, [zone]);

  const DayOfTheMonth = () =>
    nomenclatures?.map((place, i) => (
      <View
        key={place.nomenclature + place.modificationDate}
        style={styles.reservationDate}
      >
        <TouchableOpacity
          onPress={() => {
            if (helperStatus.active && !helperStatus.accessToReservations)
              return;
            navigation.navigate("PlaceInformation", {
              ref: route.params.ref,
              id: place.id,
              type: "Nomenclatura",
            });
          }}
        >
          <TextStyle
            color={light.main2}
            customStyle={{ marginRight: 8 }}
            smallSubtitle
          >
            {place.nomenclature}
          </TextStyle>
        </TouchableOpacity>
        <FlatList
          data={days}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item: day }) => {
            const reservationsSelected = reservations.filter(
              (r) => r.id === place.id
            );

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
                const checkIn = reservation.hosted.reduce((a, b) => {
                  if (b.checkIn) return a + 1;
                  return a;
                }, 0);

                const checkOut = reservation.hosted.reduce((a, b) => {
                  if (b.checkOut) return a + 1;
                  return a;
                }, 0);

                const hosted = reservation.hosted?.length;

                if (
                  ![0, hosted].includes(checkIn) &&
                  ![0, hosted].includes(checkOut)
                )
                  return "#f87575"; //ALGUNOS SE FUERON, OTROS NO HA LLEGADO ✅
                if (checkOut === hosted) return "#b6e0f3"; // CUANDO YA SE FUERON ✅
                if (![0, hosted].includes(checkOut)) return "#ff9900"; // CUANDO SE FUERON PERO FALTAN ALGUNOS ✅
                if (checkIn === hosted) return "#00ffbc"; // CUANDO YA LLEGARON ✅
                if (![0, hosted].includes(checkIn)) return "#ffecb3"; // CUANDO ALGUNOS HAN LLEGADO PERO OTROS NO ✅
                if (checkIn === 0) return light.main2; // CUANDO ESTAN RESERVADOS ✅
              };

              backgroundColor = findBackground();
            }

            return (
              <TouchableOpacity
                onPress={() => {
                  if (reservation) {
                    setModalVisiblePeople(!modalVisiblePeople);
                    setReservationSelected(reservation);
                  } else {
                    navigation.navigate("CreateReserve", {
                      year,
                      day,
                      month,
                      id: place.id,
                    });
                  }
                }}
                onLongPress={() => {
                  if (reservation) {
                    navigation.navigate("ReserveInformation", {
                      ref: reservation.ref,
                      id: place.id,
                    });
                  }
                }}
              >
                <View style={[styles.date, { backgroundColor }]}>
                  <TextStyle
                    customStyle={{
                      position: "absolute",
                      top: 0,
                      left: 1,
                      fontSize: 9,
                    }}
                    color={
                      reservation?.hosted.length
                        ? light.textDark
                        : mode === "light"
                        ? light.textDark
                        : dark.textWhite
                    }
                  >
                    {("0" + day).slice(-2)}
                  </TextStyle>
                  <TextStyle smallParagraph>
                    {reservation?.hosted.length || ""}
                  </TextStyle>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    ));

  const GuestCard = () => {
    return filterResult.length === 0 ? (
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
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("ReserveInformation", {
                ref: guest.ref,
                days,
                id: guest.id,
              });
            }}
            key={guest.id + guest.modificationDate + index}
            style={[
              styles.guestCard,
              { backgroundColor: mode === "light" ? light.main5 : dark.main2 },
            ]}
          >
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Nombre completo:{" "}
              <TextStyle color={light.main2}>{guest?.fullName}</TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Correo electrónico:{" "}
              <TextStyle color={light.main2}>{guest?.email}</TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Número de teléfono:{" "}
              <TextStyle color={light.main2}>{guest?.phoneNumber}</TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Cédula:{" "}
              <TextStyle color={light.main2}>
                {thousandsSystem(guest?.identification || "")}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Dinero pagado:{" "}
              <TextStyle color={light.main2}>
                {thousandsSystem(
                  (guest?.discount
                    ? guest?.amount - guest?.discount
                    : guest?.amount) || ""
                )}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Personas alojadas:{" "}
              <TextStyle color={light.main2}>
                {thousandsSystem(guest?.hosted.length || "0")}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Días reservado:{" "}
              <TextStyle color={light.main2}>
                {thousandsSystem(guest?.days || "0")}
              </TextStyle>
            </TextStyle>
            {guest?.discount && (
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Descuento:{" "}
                <TextStyle color={light.main2}>
                  {thousandsSystem(guest?.discount)}
                </TextStyle>
              </TextStyle>
            )}
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Fecha de registro:{" "}
              <TextStyle color={light.main2}>
                {changeDate(new Date(guest?.start))}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Fecha de finalización:{" "}
              <TextStyle color={light.main2}>
                {changeDate(new Date(guest?.end))}
              </TextStyle>
            </TextStyle>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      <View style={{ width: "100%" }}>
        {activeFilter && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <TouchableOpacity onPress={() => setActiveFilter(false)}>
              <Ionicons
                name="close"
                size={getFontSize(24)}
                color={mode === "light" ? light.textDark : dark.textWhite}
              />
            </TouchableOpacity>
            <InputStyle
              innerRef={searchRef}
              placeholder="Buscar huésped"
              value={filter}
              onChangeText={(text) => setFilter(text)}
              stylesContainer={{ width: "90%", marginVertical: 0 }}
              stylesInput={{
                paddingHorizontal: 6,
                paddingVertical: 5,
                fontSize: 18,
              }}
            />
          </View>
        )}
        {!activeFilter && (
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => monthPickerRef.current.focus()}>
                <TextStyle smallTitle color={light.main2}>
                  {months[month - 1]}
                </TextStyle>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => yearPickerRef.current.focus()}>
                <TextStyle
                  customStyle={{ marginLeft: 10 }}
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {year}
                </TextStyle>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {nomenclatures?.length > 0 &&
                (!helperStatus.active || helperStatus.accessToReservations) && (
                  <TouchableOpacity
                    onPress={() => {
                      setActiveFilter(!activeFilter);
                      setTimeout(() => searchRef.current.focus());
                    }}
                  >
                    <Ionicons
                      name="search"
                      size={getFontSize(31)}
                      color={light.main2}
                    />
                  </TouchableOpacity>
                )}
              {(!helperStatus.active || helperStatus.accessToReservations) && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("PlaceInformation", {
                      ref: route.params.ref,
                      name: zone?.name,
                      type: "General",
                    })
                  }
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={getFontSize(31)}
                    color={light.main2}
                  />
                </TouchableOpacity>
              )}
              {nomenclatures?.length > 0 &&
                (!helperStatus.active || helperStatus.accessToReservations) && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("CreatePlace", {
                        ref: route.params.ref,
                      })
                    }
                  >
                    <Ionicons
                      name="add-circle"
                      size={getFontSize(32)}
                      color={light.main2}
                    />
                  </TouchableOpacity>
                )}
            </View>
          </View>
        )}
        {!activeFilter && (
          <TextStyle
            bigParagraph
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            Disponibles
          </TextStyle>
        )}
      </View>
      <View>
        {!activeFilter && (
          <View
            style={{
              marginVertical: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
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
        )}
        {activeFilter && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: height / 1.22, marginTop: 20 }}
          >
            <GuestCard />
          </ScrollView>
        )}
        {!activeFilter && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: height / 1.5 }}
          >
            <DayOfTheMonth />
          </ScrollView>
        )}
        {nomenclatures?.length === 0 &&
          (!helperStatus.active || helperStatus.accessToReservations) && (
            <ButtonStyle
              onPress={() =>
                navigation.navigate("CreatePlace", { ref: route.params.ref })
              }
              backgroundColor={light.main2}
            >
              <TextStyle center>Agregar subcategoría</TextStyle>
            </ButtonStyle>
          )}
        {nomenclatures?.length === 0 &&
          helperStatus.active &&
          !helperStatus.accessToReservations && (
            <TextStyle center smallParagraph color={light.main2}>
              NO HAY NOMENCLATURAS
            </TextStyle>
          )}
      </View>
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
      <AddPerson
        modalVisible={modalVisiblePeople}
        setModalVisible={setModalVisiblePeople}
        handleSubmit={(data) => saveHosted(data)}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  reservationDate: {
    flexDirection: "row",
    marginVertical: 2,
    alignItems: "center",
  },
  date: {
    width: Math.floor(width / 10),
    height: Math.floor(width / 10),
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  guestCard: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 5,
    marginVertical: 5,
  },
  available: {
    width: 48,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
});

export default PlaceScreen;

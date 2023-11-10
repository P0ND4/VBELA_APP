import { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { edit as editRS } from "@features/zones/standardReservationsSlice";
import { add as addRA } from "@features/zones/accommodationReservationsSlice";
import { Picker } from "@react-native-picker/picker";
import {
  months,
  thousandsSystem,
  changeDate,
  getFontSize,
  random,
  addDays,
} from "@helpers/libs";
import { editReservation, addReservation } from "@api";
import moment from "moment";
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
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );

  const [zone, setZone] = useState([]);
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

  const [daySelected, setDaySelected] = useState(null);

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
    const id = random(10, { number: true });
    data.owner = null;
    data.checkOut = null;

    if (reservationSelected.type === "standard") {
      data.ref = reservationSelected.id;
      data.id = id;
      const reserveUpdated = {
        ...reservationSelected,
        hosted: [...reservationSelected.hosted, data],
      };
      dispatch(editRS({ ref: reservationSelected.ref, data: reserveUpdated }));
      await editReservation({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        reservation: {
          data: reserveUpdated,
          type: reservationSelected.type,
        },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    }

    if (reservationSelected.type === "accommodation") {
      data.ref = reservationSelected.ref;
      data.id = id;
      const obj = { ...data };
      const end = addDays(
        new Date(year, month - 1, daySelected),
        parseInt(data.days - 1)
      );
      obj.end = end.getTime();
      obj.start = new Date(year, month - 1, daySelected).getTime();
      obj.amount = reservationSelected.amount;
      obj.discount = data.discount;
      obj.type = reservationSelected.type;
      obj.accommodation = reservationSelected.accommodation;
      obj.payment = 0;
      obj.creationDate = new Date().getTime();
      obj.modificationDate = new Date().getTime();

      dispatch(addRA(obj));

      await addReservation({
        identifier: helperStatus.active
          ? helperStatus.identifier
          : user.identifier,
        reservation: {
          data: [obj],
          type: reservationSelected.type,
        },
        helpers: helperStatus.active
          ? [helperStatus.id]
          : user.helpers.map((h) => h.id),
      });
    }

    setDaySelected(null);
    setReservationSelected(null);
    cleanData();
  };

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

    const eventHandler = (hosted) => {
      return (
        formatText(hosted.fullName)?.includes(formatText(filter)) ||
        formatText(hosted.email)?.includes(formatText(filter)) ||
        formatText(hosted.identification)?.includes(formatText(filter)) ||
        thousandsSystem(hosted.identification)?.includes(filter) ||
        formatText(hosted.phoneNumber)?.includes(formatText(filter)) ||
        formatText(hosted.country)?.includes(formatText(filter))
      );
    };

    for (let hosted of accommodationReservations) {
      if (eventHandler(hosted)) guests.push({ ...hosted });
    }

    for (let guest of standardReservations) {
      for (let hosted of guest.hosted) {
        if (eventHandler(hosted)) guests.push({ ...hosted, ...guest });
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
          initialNumToRender={32}
          contentOffset={{
            x: (new Date().getDate() - 1) * 43,
            y: 0,
          }}
          renderItem={({ item: day }) => {
            const standard = standardReservations.filter(
              (r) => r.id === place.id
            );
            const accommodation = accommodationReservations.filter(
              (r) => r.ref === place.id
            );

            const reservationsSelected =
              place.type === "accommodation" ? accommodation : standard;

            const reservation = [];

            for (let r of reservationsSelected) {
              const start = new Date(r.start).toISOString().slice(0, 10);
              const end = new Date(r.end).toISOString().slice(0, 10);
              const date = new Date(year, month - 1, day)
                .toISOString()
                .slice(0, 10);

              if (moment(date).isBetween(start, end, null, "[]")) {
                reservation.push(r);
              }
            }

            let backgroundColor =
              mode === "light"
                ? `${light.main5}${i % 2 === 0 ? "CC" : "FF"}`
                : `${dark.main2}${i % 2 === 0 ? "CC" : "FF"}`;

            if (reservation) {
              const findBackground = () => {
                const checkIn =
                  place.type === "standard"
                    ? reservation[0]?.hosted.reduce((a, b) => {
                        if (b.checkIn) return a + 1;
                        return a;
                      }, 0) || 0
                    : reservation.filter((r) => r.checkIn).length;

                const checkOut =
                  place.type === "standard"
                    ? reservation[0]?.hosted.reduce((a, b) => {
                        if (b.checkOut) return a + 1;
                        return a;
                      }, 0) || 0
                    : reservation.filter((r) => r.checkOut).length;

                const hosted =
                  place.type === "standard"
                    ? reservation[0]?.hosted.length || 0
                    : reservation.length || 0;

                if (hosted === 0) return backgroundColor; //SI NO HAY HUESPEDES ✅
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
                  if (
                    place.type === "standard" &&
                    place.people === reservation[0]?.hosted?.length
                  )
                    return Alert.alert(
                      "OOPS",
                      "Ha superado el monto máximo de huéspedes permitidos en la habitación"
                    );
                  if (reservation.length) {
                    setModalVisiblePeople(!modalVisiblePeople);
                    setDaySelected(day);
                    setReservationSelected(reservation[0]);
                  } else {
                    navigation.navigate("CreateReserve", {
                      year,
                      day,
                      month,
                      place,
                    });
                  }
                }}
                onLongPress={() => {
                  if (reservation.length) {
                    navigation.navigate("ReserveInformation", {
                      reservation,
                      place,
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
                      reservation[0]?.hosted?.length || reservation?.length
                        ? light.textDark
                        : mode === "light"
                        ? light.textDark
                        : dark.textWhite
                    }
                  >
                    {("0" + day).slice(-2)}
                  </TextStyle>
                  <TextStyle smallParagraph>
                    {reservation[0]?.hosted?.length ||
                      reservation?.length ||
                      ""}
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
        {filterResult.map((guest, index) => {
          return (
            <TouchableOpacity
              onPress={() => {
                let reservation = [];
                let place = {};

                if (guest?.type === "standard") {
                  const re = standardReservations.find(
                    (r) => r.id === guest.id
                  );
                  place = nomenclatures.find((n) => n.id === guest.id);
                  reservation.push(re);
                }

                if (guest?.type === "accommodation") {
                  const re = accommodationReservations.find(
                    (r) => r.ref === guest.ref
                  );
                  place = nomenclatures.find((n) => n.id === guest.ref);
                  reservation.push(re);
                }

                navigation.navigate("ReserveInformation", {
                  reservation,
                  place,
                });
              }}
              key={guest.id + guest.modificationDate + index}
              style={[
                styles.guestCard,
                {
                  backgroundColor: mode === "light" ? light.main5 : dark.main2,
                },
              ]}
            >
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Nombre completo:{" "}
                <TextStyle color={light.main2}>{guest?.fullName}</TextStyle>
              </TextStyle>
              {guest?.email && (
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Correo electrónico:{" "}
                  <TextStyle color={light.main2}>{guest?.email}</TextStyle>
                </TextStyle>
              )}
              {guest?.phoneNumber && (
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Número de teléfono:{" "}
                  <TextStyle color={light.main2}>
                    {guest?.phoneNumber}
                  </TextStyle>
                </TextStyle>
              )}
              {guest?.identification && (
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Cédula:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(guest?.identification || "")}
                  </TextStyle>
                </TextStyle>
              )}
              {guest?.country && (
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  País:{" "}
                  <TextStyle color={light.main2}>{guest?.country}</TextStyle>
                </TextStyle>
              )}
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
              {guest.type === "standard" && (
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Personas alojadas:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(guest?.hosted?.length || "0")}
                  </TextStyle>
                </TextStyle>
              )}
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
          );
        })}
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
        type={reservationSelected?.type || null}
        discount={reservationSelected?.type === "accommodation" || null}
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

import { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { months, thousandsSystem, changeDate, getFontSize } from "@helpers/libs";
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
  const mode = useSelector((state) => state.mode);
  const helperStatus = useSelector((state) => state.helperStatus);
  const zoneState = useSelector((state) => state.zones);
  const nomenclaturesState = useSelector((state) => state.nomenclatures);
  const reservationsState = useSelector((state) => state.reservations);

  const owner = route.params?.owner;

  const [zone, setZone] = useState([]);
  const [reservations, setReservation] = useState([]);
  const [nomenclatures, setNomenclatures] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filter, setFilter] = useState("");
  const [filterResult, setFilterResult] = useState([]);

  const searchRef = useRef();

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

    for (let guest of reservations) {
      if (
        guest.fullName?.includes(filter) ||
        guest.email?.includes(filter) ||
        guest.identification?.includes(filter) ||
        thousandsSystem(guest.identification)?.includes(filter) ||
        guest.phoneNumber?.includes(filter) ||
        guest.people?.includes(filter) ||
        guest.days?.includes(filter) ||
        guest.amount?.toString().includes(filter) ||
        thousandsSystem(guest.amount?.toString()).includes(filter)
      )
        guests.push(guest);
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
    nomenclatures?.map((place) => (
      <View
        key={place.nomenclature + place.modificationDate}
        style={styles.reservationDate}
      >
        <TouchableOpacity
          onPress={() => {
            if (helperStatus.active && !helperStatus.accessToReservations) return;
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
          data={route.params.days}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            let dayTaken = false;
            let disable = false;
            let information;

            const currentDate = new Date();
            currentDate.setMilliseconds(0);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setHours(0);

            const year = route.params.year;
            const month = months.indexOf(route.params.month);
            const date = new Date(year, month, item).getTime();

            if (date < currentDate) disable = true;

            const belongingReservations = reservations.filter(
              (r) => r.id === place.id
            );

            for (let reserve of belongingReservations) {
              const start = new Date(reserve.start).getTime();
              const end = new Date(reserve.end).getTime();

              if (date >= start && date <= end) {
                dayTaken = true;
                information = reserve;
              }
            }

            return (
              <TouchableOpacity
                onPress={() => {
                  const params = route.params;

                  if (
                    disable ||
                    (!helperStatus.accessToReservations && helperStatus.active)
                  )
                    return;
                  if (!dayTaken) {
                    navigation.navigate("CreateReserve", {
                      owner: owner ? owner : null,
                      name: params.name,
                      year: params.year,
                      day: item,
                      month: params.month,
                      days: params.days,
                      id: place.id,
                    });
                  } else {
                    navigation.navigate("ReserveInformation", {
                      ref: information.ref,
                      days: params.days,
                      id: place.id,
                    });
                  }
                }}
              >
                <View
                  style={[
                    styles.date,
                    {
                      backgroundColor: disable
                        ? mode === "light"
                          ? dark.main2
                          : light.main4
                        : mode === "light"
                        ? dayTaken
                          ? light.main2
                          : light.main5
                        : dayTaken
                        ? light.main2
                        : dark.main2,
                    },
                  ]}
                >
                  <TextStyle
                    smallParagraph
                    color={
                      disable
                        ? mode === "light"
                          ? dark.textWhite
                          : light.textDark
                        : mode === "light"
                        ? light.textDark
                        : dayTaken
                        ? light.textDark
                        : dark.textWhite
                    }
                  >
                    {("0" + item).slice(-2)}
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
      <View style={{ marginTop: 30 }}>
        {filterResult.map((guest, index) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("ReserveInformation", {
                ref: guest.ref,
                days: route.params.days,
                id: guest.id,
              });
            }}
            key={guest.id + guest.modificationDate}
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
                {guest?.identification
                  ? thousandsSystem(guest?.identification)
                  : ""}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Dinero pagado:{" "}
              <TextStyle color={light.main2}>
                {guest?.amount
                  ? guest.discount
                    ? thousandsSystem(guest?.amount - guest?.discount)
                    : thousandsSystem(guest?.amount)
                  : "0"}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Personas alojadas:{" "}
              <TextStyle color={light.main2}>
                {guest?.people ? thousandsSystem(guest?.people) : "0"}
              </TextStyle>
            </TextStyle>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Días reservado:{" "}
              <TextStyle color={light.main2}>
                {guest?.days ? thousandsSystem(guest?.days) : "0"}
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
          <View style={styles.header}>
            <View style={styles.titlesContainer}>
              <TextStyle smallTitle color={light.main2}>
                {route.params.month}
              </TextStyle>
              <TextStyle
                customStyle={{ marginLeft: 10 }}
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {route.params.year}
              </TextStyle>
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
                    <Ionicons name="search" size={getFontSize(31)} color={light.main2} />
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
                      navigation.navigate("CreatePlace", { ref: route.params.ref })
                    }
                  >
                    <Ionicons name="add-circle" size={getFontSize(32)} color={light.main2} />
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
          <TextStyle
            bigParagraph
            customStyle={{ marginVertical: 30 }}
            color={mode === "light" ? light.textDark : dark.textWhite}
          >
            {zone?.name}
          </TextStyle>
        )}
        <ScrollView style={{ maxHeight: height / 1.5 }}>
          {activeFilter ? <GuestCard /> : <DayOfTheMonth />}
        </ScrollView>
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
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titlesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reservationDate: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "center",
  },
  date: {
    width: Math.floor(width / 9.8),
    height: Math.floor(width / 9.8),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  guestCard: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 5,
    marginVertical: 5,
  },
});

export default PlaceScreen;

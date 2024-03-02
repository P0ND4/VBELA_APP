import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { random, getFontSize } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import { edit as editRS } from "@features/zones/standardReservationsSlice";
import { editReservation } from "@api";
import moment from "moment";
import Ionicons from "@expo/vector-icons/Ionicons";
import InputStyle from "@components/InputStyle";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Layout from "@components/Layout";
import Header from "@utils/reservation/place/Header";
import AddPerson from "@components/AddPerson";
import ColorInformation from "@utils/reservation/place/ColorInformation";
import theme from "@theme";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("screen");
const { light, dark } = theme();

const Room = ({ time, item, days, setModalVisible, setSelected, setDay, date }) => {
  const mode = useSelector((state) => state.mode);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const standardReservations = useSelector((state) => state.standardReservations);
  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const [reservations, setReservations] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  const calculateTime = () => setTimeout(() => setLoading(false), time);
  const dateRef = useRef(new Date()).current;

  useEffect(() => {
    calculateTime();
  }, []);

  useEffect(() => {
    const getReservation = (reservations) => reservations.filter((r) => r.ref === item.id);

    const accommodation = getReservation(accommodationReservations);
    const standard = getReservation(standardReservations);

    const reservationsSelected = item.type === "accommodation" ? accommodation : standard;

    setReservations(reservationsSelected);
  }, [accommodationReservations, standardReservations]);

  const validate = useCallback(
    ({ day }) => {
      let backgroundColor = mode === "light" ? light.main5 : dark.main2;

      if (!reservations) return { backgroundColor, color: textColor, hosted: null };

      const reservationsFiltered = reservations.filter((r) => {
        const start = new Date(r.start).toISOString().slice(0, 10);
        const end = new Date(r.end).toISOString().slice(0, 10);
        const lastDate = new Date(date.year, date.month, day).toISOString().slice(0, 10);

        if (moment(lastDate).isBetween(start, end, null, "[]")) return r;
      });

      const findBackground = ({ hosted, checkIn, checkOut }) => {
        if (hosted === 0) return backgroundColor; //SI NO HAY HUESPEDES ✅
        if (![0, hosted].includes(checkIn) && ![0, hosted].includes(checkOut))
          return "#f87575"; //ALGUNOS SE FUERON, OTROS NO HA LLEGADO ✅
        if (checkOut === hosted) return "#b6e0f3"; // CUANDO YA SE FUERON ✅
        if (![0, hosted].includes(checkOut)) return "#ff9900"; // CUANDO SE FUERON PERO FALTAN ALGUNOS ✅
        if (checkIn === hosted) return "#00ffbc"; // CUANDO YA LLEGARON ✅
        if (![0, hosted].includes(checkIn)) return "#ffecb3"; // CUANDO ALGUNOS HAN LLEGADO PERO OTROS NO ✅
        if (checkIn === 0) return light.main2; // CUANDO ESTAN RESERVADOS ✅
      };

      const hosted = reservationsFiltered[0]?.hosted?.length || reservationsFiltered.length;
      const checkIn =
        reservationsFiltered[0]?.hosted?.reduce((a, b) => (a + b.checkIn ? 1 : 0), 0) ||
        reservationsFiltered?.reduce((a, b) => (a + b.checkIn ? 1 : 0), 0);

      const checkOut =
        reservationsFiltered[0]?.hosted?.reduce((a, b) => (a + b.checkOut ? 1 : 0), 0) ||
        reservationsFiltered?.reduce((a, b) => (a + b.checkOut ? 1 : 0), 0);

      const color = hosted ? light.textDark : textColor;

      return {
        backgroundColor: findBackground({ hosted, checkIn, checkOut }),
        color,
        hosted,
        reservations: reservationsFiltered,
      };
    },
    [date, reservations]
  );

  const memoizedDays = useMemo(() => {
    return days.map((day) => {
      const { backgroundColor, hosted, color, reservations } = validate({ day });
      return (
        <TouchableOpacity
          onPress={() => {
            if (item.type === "standard" && item.people === hosted)
              return Alert.alert(
                "OOPS",
                "Ha superado el monto máximo de huéspedes permitidos en la habitación"
              );
            if (hosted) {
              setModalVisible(true);
              setDay(day);
              setSelected(reservations[0]);
            } else
              navigation.navigate(
                item.type === "standard"
                  ? "CreateStandardReserve"
                  : "CreateAccommodationReserve",
                {
                  date: { ...date, day },
                  place: item,
                }
              );
          }}
          onLongPress={() => {
            if (reservations.length) {
              if (item.type === "standard")
                navigation.navigate("StandardReserveInformation", {
                  id: reservations[0]?.id,
                });

              if (item.type === "accommodation")
                navigation.navigate("AccommodationReserveInformation", {
                  ids: reservations.map((r) => r.id),
                });
            }
          }}
        >
          <View style={[styles.square, { backgroundColor }]}>
            <TextStyle style={styles.date} color={color}>
              {("0" + day).slice(-2)}
            </TextStyle>
            <TextStyle smallParagraph>{hosted || ""}</TextStyle>
          </View>
        </TouchableOpacity>
      );
    });
  }, [days, validate, reservations, date]);

  return (
    <View style={[styles.rowTogether, { marginVertical: 2 }]}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("PlaceInformation", {
            zoneID: item.ref,
            nomenclatureID: item.id,
          })
        }
      >
        <TextStyle color={light.main2} style={{ marginRight: 8 }} smallSubtitle>
          {item.nomenclature}
        </TextStyle>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator color={light.main2} size="large" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentOffset={{
            x: dateRef.getMonth() === date.month ? (dateRef.getDate() - 1) * 43 : 0,
          }}
        >
          {memoizedDays}
        </ScrollView>
      )}
    </View>
  );
};

const Place = ({ route, navigation }) => {
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const zones = useSelector((state) => state.zones);
  const helperStatus = useSelector((state) => state.helperStatus);

  const [rooms, setRooms] = useState(null);

  const [activeSearch, setActiveSearch] = useState(false);
  const [activeInformation, setActiveInformation] = useState(false);

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [days, setDays] = useState([]);

  const [daySelected, setDaySelected] = useState(null);
  const [modalVisiblePeople, setModalVisiblePeople] = useState(false);
  const [reservationSelected, setReservationSelected] = useState(null);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const searchRef = useRef();
  const dispatch = useDispatch();

  const zoneID = route.params.zoneID;

  useEffect(() => {
    const days = new Date(year, month + 1, 0).getDate();
    setDays(Array.from({ length: days }, (_, i) => i + 1));
  }, [month, year]);

  useEffect(() => {
    setRooms(nomenclatures.filter((n) => n.ref === zoneID));
  }, [nomenclatures]);

  useEffect(() => {
    const zone = zones.find((zone) => zone.id === zoneID);
    navigation.setOptions({ title: zone?.name });
  }, [zones]);

  const saveHosted = async ({ data, cleanData }) => {
    const place = nomenclatures.find((n) => n.id === reservationSelected.ref);
    data.owner = null;
    data.checkOut = null;
    data.ref = place.id;
    data.id = random(10, { number: true });
    cleanData();

    if (reservationSelected.type === "accommodation")
      return navigation.navigate("CreateAccommodationReserve", {
        date: { month, year, day: daySelected },
        place,
        hosted: [data],
      });

    let reserve = {
      ...reservationSelected,
      hosted: [...reservationSelected.hosted, data],
    };
    if (reservationSelected.type === "standard")
      dispatch(editRS({ id: reserve.id, data: reserve }));

    setDaySelected(null);
    setReservationSelected(null);

    await editReservation({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      reservation: {
        data: reserve,
        type: reservationSelected.type,
      },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  return (
    <Layout>
      <View style={{ width: "100%" }}>
        {activeSearch && (
          <View style={styles.searchContainer}>
            <TouchableOpacity onPress={() => setActiveSearch(!activeSearch)}>
              <Ionicons name="close" size={getFontSize(24)} color={textColor} />
            </TouchableOpacity>
            <InputStyle
              innerRef={searchRef}
              placeholder="Buscar huésped"
              value={filter}
              onChangeText={(text) => setFilter(text)}
              stylesContainer={{ width: "90%", marginVertical: 0 }}
              stylesInput={styles.searchInput}
            />
          </View>
        )}
        {rooms?.length > 0 && !activeSearch && (
          <Header
            zoneID={zoneID}
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
            // searchEvent={() => {
            //   setActiveSearch(!activeSearch);
            //   setTimeout(() => searchRef.current.focus());
            // }}
          />
        )}
      </View>
      {rooms?.length > 0 && !activeSearch && (
        <View style={[styles.rowTogether, { marginVertical: 20 }]}>
          <TextStyle color={textColor}>ASIGNACIÓN DE COLORES</TextStyle>
          <TouchableOpacity onPress={() => setActiveInformation(!activeInformation)}>
            <Ionicons
              name="help-circle-outline"
              style={{ marginLeft: 5 }}
              size={getFontSize(23)}
              color={light.main2}
            />
          </TouchableOpacity>
        </View>
      )}
      {activeSearch && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: SCREEN_HEIGHT / 1.5 }}
        >
          <GuestCard />
        </ScrollView>
      )}
      {rooms === null ? (
        <ActivityIndicator size="small" color={light.main2} />
      ) : (
        !activeSearch && (
          <FlatList
            data={rooms}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: SCREEN_HEIGHT / 1.22, marginTop: 20 }}
            renderItem={({ item, index }) => (
              <Room
                time={600 * index}
                item={item}
                days={days}
                setModalVisible={setModalVisiblePeople}
                setSelected={setReservationSelected}
                setDay={setDaySelected}
                date={{ year, month }}
              />
            )}
          />
        )
      )}
      {rooms?.length === 0 && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <View style={{ width: "70%" }}>
            <ButtonStyle
              onPress={() => navigation.navigate("CreatePlace", { zoneID })}
              backgroundColor={light.main2}
            >
              <TextStyle center>Agregar subcategoría</TextStyle>
            </ButtonStyle>
            <TextStyle center smallParagraph color={light.main2}>
              NO HAY NOMENCLATURAS
            </TextStyle>
          </View>
        </View>
      )}
      <ColorInformation
        modalVisible={activeInformation}
        setModalVisible={setActiveInformation}
      />
      <AddPerson
        key={reservationSelected?.id}
        modalVisible={modalVisiblePeople}
        setModalVisible={setModalVisiblePeople}
        handleSubmit={(data) => saveHosted(data)}
        settings={{ days: reservationSelected?.type === "accommodation" }}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  square: {
    width: Math.floor(SCREEN_WIDTH / 10),
    height: Math.floor(SCREEN_WIDTH / 10),
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  date: {
    position: "absolute",
    top: 0,
    left: 1,
    fontSize: 9,
  },
  rowTogether: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Place;

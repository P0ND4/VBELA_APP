import { useState, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { changeDate, getFontSize, random } from "@helpers/libs";
import { useNavigation } from "@react-navigation/native";
import { edit as editRS } from "@features/zones/standardReservationsSlice";
import { editReservation } from "@api";
import GuestTable from "@components/GuestTable";
import AddPerson from "@components/AddPerson";
import ChooseDate from "@components/ChooseDate";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import theme from "@theme";
import FilterHosted from "@utils/accommodation/FilterHosted";
import FilterLocation from "@utils/accommodation/FilterLocation";

const { light, dark } = theme();
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Search = ({ search, setSearch, setModalVisible, style = {} }) => {
  return (
    <View style={[styles.row, { marginBottom: 15 }, style]}>
      <InputStyle
        placeholder="Nombre, Cédula, Teléfono, Email"
        value={search}
        onChangeText={(text) => setSearch(text)}
        stylesContainer={{ width: "85%", marginVertical: 0 }}
        stylesInput={styles.search}
      />
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Ionicons name="filter" size={getFontSize(24)} color={light.main2} />
      </TouchableOpacity>
    </View>
  );
};

const dateValidation = (date, dateCompare) => {
  let error = false;
  if (dateCompare.day !== "all" && date.getDate() !== dateCompare.day) error = true;
  if (dateCompare.month !== "all" && date.getMonth() + 1 !== dateCompare.month) error = true;
  if (dateCompare.year !== "all" && date.getFullYear() !== dateCompare.year) error = true;
  return error;
};

const Hosted = ({ route }) => {
  const zones = useSelector((state) => state.zones);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const standardReservations = useSelector((state) => state.standardReservations);

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
    dayCheckIn: "all",
    monthCheckIn: "all",
    yearCheckIn: "all",
    dayCheckOut: "all",
    monthCheckOut: "all",
    yearCheckOut: "all",
    dayCreation: "all",
    monthCreation: "all",
    yearCreation: "all",
  };
  const [filters, setFilters] = useState({
    ...initialState,
    active: route === "hosted",
    dayCheckIn: route === "hosted" ? new Date().getDate() : "all",
    monthCheckIn: route === "hosted" ? new Date().getMonth() + 1 : "all",
    yearCheckIn: route === "hosted" ? new Date().getFullYear() : "all",
  });

  const [nomenclaturesToChoose, setNomenclaturesToChoose] = useState([]);

  useEffect(() => {
    if (zones.length > 0) {
      const nomenclaturesFound = nomenclatures.filter((n) => n.ref === filters.zone);
      setNomenclaturesToChoose(nomenclaturesFound);
    }
  }, [filters.zone]);

  useEffect(() => {
    const condition = (r) =>
      route === "reservation" ? !r.checkIn : route === "hosted" ? !r.checkOut && r.checkIn : true;

    const accommodation = accommodationReservations.filter(condition).map((a) => {
      const nom = nomenclatures.find((n) => n.id === a.ref);
      const zon = zones.find((z) => z.id === nom.ref);
      return {
        ...a,
        room: nom.name || nom.nomenclature,
        group: zon.name,
        groupID: zon.id,
        nomenclatureID: nom.id,
      };
    });
    const standard = standardReservations.flatMap((s) =>
      s.hosted.filter(condition).map((h) => {
        const nom = nomenclatures.find((n) => n.id === h.ref);
        const zon = zones.find((z) => z.id === nom.ref);
        return {
          ...h,
          start: s.start,
          days: s.days,
          reservationID: s.id,
          room: nom.name || nom.nomenclature,
          group: zon.name,
          groupID: zon.id,
          nomenclatureID: nom.id,
          type: s.type,
          status: s.status,
        };
      })
    );

    const union = [...accommodation, ...standard];

    const hosted = union.sort((a, b) => {
      if (a.start < b.start) return -1;
      if (a.start > b.start) return 1;
      return 0;
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
          formatText(h?.email).includes(formatText(search)) ||
          formatText(h?.country).includes(formatText(search))
        ) {
          if (!filters.active) return h;
          if (
            dateValidation(new Date(h.checkIn), {
              day: filters.dayCheckIn,
              month: filters.monthCheckIn,
              year: filters.yearCheckIn,
            })
          )
            return;
          if (
            dateValidation(new Date(h.checkOut), {
              day: filters.dayCheckOut,
              month: filters.monthCheckOut,
              year: filters.yearCheckOut,
            })
          )
            return;
          if (
            dateValidation(new Date(h.creationDate), {
              day: filters.dayCreation,
              month: filters.monthCreation,
              year: filters.yearCreation,
            })
          )
            return;
          if (filters.minDays && h.days < parseInt(filters.minDays.replace(/\D/g, ""))) return;
          if (filters.maxDays && h.days > parseInt(filters.maxDays.replace(/\D/g, ""))) return;
          if (filters.type && h.type !== filters.type) return;
          if (filters.zone && h.groupID !== filters.zone) return;
          if (filters.nomenclature && h.nomenclatureID !== filters.nomenclature) return;

          return h;
        }
      });
      setHosted(hostedWithSearch);
    } else setHosted(hosted);
  }, [route, accommodationReservations, standardReservations, search, filters]);

  return (
    <View>
      <Search search={search} setSearch={setSearch} setModalVisible={setActiveFilter} />
      <View style={styles.header}>
        <TextStyle smallParagraph>LISTADO DE HUÉSPEDES</TextStyle>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ height: SCREEN_HEIGHT / 1.55 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <GuestTable hosted={hosted} />
        </ScrollView>
      </ScrollView>
      <FilterHosted
        modalVisible={activeFilter}
        setModalVisible={setActiveFilter}
        setFilters={setFilters}
        filters={filters}
        initialState={initialState}
        nomenclaturesToChoose={nomenclaturesToChoose}
        route={route}
      />
    </View>
  );
};

const Location = () => {
  const zones = useSelector((state) => state.zones);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState([]);
  const [everybody, setEverybody] = useState(false);

  const [activeFilter, setActiveFilter] = useState(false);
  const initialState = {
    active: false,
    minDays: "",
    maxDays: "",
    type: "",
    dayCheckIn: "all",
    monthCheckIn: "all",
    yearCheckIn: "all",
    dayCreation: "all",
    monthCreation: "all",
    yearCreation: "all",
  };
  const [filters, setFilters] = useState({
    ...initialState,
    active: true,
    dayCheckIn: new Date().getDate(),
    monthCheckIn: new Date().getMonth() + 1,
    yearCheckIn: new Date().getFullYear(),
  });

  useEffect(() => {
    const location = nomenclatures.map((n) => {
      const { name } = zones.find((z) => z.id === n.ref);
      let union = [];
      if (n.type === "standard")
        union = standardReservations
          .filter((r) => r.ref === n.id)
          .flatMap((s) =>
            s.hosted.map((h) => ({
              ...h,
              start: s.start,
              days: s.days,
              reservationID: s.id,
              type: s.type,
            }))
          );
      else union = accommodationReservations.filter((r) => r.ref === n.id);
      const hosted = union
        .filter((r) => everybody || (!r.checkOut && r.checkIn))
        .sort((a, b) => {
          if (a.start < b.start) return -1;
          if (a.start > b.start) return 1;
          return 0;
        });
      return { group: name, ...n, hosted };
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
            formatText(h?.email).includes(formatText(search)) ||
            formatText(h?.country).includes(formatText(search))
          ) {
            if (!filters.active) return h;
            if (
              !(everybody && !h.checkIn) &&
              dateValidation(new Date(h.checkIn), {
                day: filters.dayCheckIn,
                month: filters.monthCheckIn,
                year: filters.yearCheckIn,
              })
            )
              return;
            if (
              dateValidation(new Date(h.creationDate), {
                day: filters.dayCreation,
                month: filters.monthCreation,
                year: filters.yearCreation,
              })
            )
              return;
            if (filters.minDays && h.days < parseInt(filters.minDays.replace(/\D/g, ""))) return;
            if (filters.maxDays && h.days > parseInt(filters.maxDays.replace(/\D/g, ""))) return;
            if (filters.type && h.type !== filters.type) return;

            return h;
          }
        }),
      }));
      setLocation(locationWithSearch);
    } else setLocation(location);
  }, [nomenclatures, accommodationReservations, standardReservations, search, filters, everybody]);

  return (
    <View>
      <Search
        search={search}
        setSearch={setSearch}
        setModalVisible={setActiveFilter}
        style={{ marginBottom: 0 }}
      />
      <View style={styles.toggle}>
        <TextStyle smallParagraph color={light.main2} style={{ marginRight: 6 }}>
          TODOS
        </TextStyle>
        <Switch
          trackColor={{ false: dark.main2, true: light.main2 }}
          thumbColor={light.main4}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setEverybody(!everybody)}
          value={everybody}
        />
      </View>
      <FlatList
        data={location}
        keyExtractor={(item) => item.id}
        style={{ maxHeight: SCREEN_HEIGHT / 1.55 }}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <View style={styles.header}>
              <TextStyle smallParagraph>
                {item?.group?.toUpperCase()} ({item.name || item.nomenclature})
              </TextStyle>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <GuestTable
                hosted={item.hosted}
                options={{ group: false, room: false, payment: item.type === "accommodation" }}
              />
            </ScrollView>
          </View>
        )}
      />
      <FilterLocation
        modalVisible={activeFilter}
        setModalVisible={setActiveFilter}
        setFilters={setFilters}
        filters={filters}
        initialState={initialState}
      />
    </View>
  );
};

const Zone = () => {
  const mode = useSelector((state) => state.mode);
  const zones = useSelector((state) => state.zones);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const navigation = useNavigation();

  const Card = ({ item }) => {
    const nomenclatures = useSelector((state) => state.nomenclatures);
    const standardReservations = useSelector((state) => state.standardReservations);
    const accommodationReservations = useSelector((state) => state.accommodationReservations);
    const [hosted, setHosted] = useState(0);

    const dateValidation = (date) => {
      const currentDate = {
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      };
      let error = false;
      if (date.getDate() !== currentDate.day) error = true;
      if (date.getMonth() + 1 !== currentDate.month) error = true;
      if (date.getFullYear() !== currentDate.year) error = true;
      return error;
    };

    useEffect(() => {
      const hosted = nomenclatures.reduce((total, n) => {
        const reservations = n.type === "standard" ? standardReservations : accommodationReservations;
        return (
          total +
          reservations.reduce((count, r) => {
            if (r.ref !== n.id) return count;
            if (r.type === "standard")
              return (
                count + r.hosted.reduce((a, b) => (!dateValidation(new Date(b.checkIn)) ? a + 1 : a), 0)
              );
            return count + (r.type === "accommodation" && !dateValidation(new Date(r.checkIn)) ? 1 : 0);
          }, 0)
        );
      }, 0);
      setHosted(hosted);
    }, [item, standardReservations, accommodationReservations]);

    return (
      <TouchableOpacity
        onLongPress={() => navigation.navigate("ZoneInformation", { zoneID: item.id })}
        onPress={() => navigation.navigate("Place", { zoneID: item.id })}
        style={[styles.zone, { backgroundColor: mode === "light" ? light.main5 : dark.main2 }]}
      >
        <View style={styles.row}>
          <TextStyle color={light.main2} smallSubtitle>
            {item?.name}
          </TextStyle>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ZoneInformation", { zoneID: item.id })}
            >
              <Ionicons size={getFontSize(24)} color={light.main2} name="information-circle-outline" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("CreateZone", { item, editing: true })}>
              <Ionicons size={getFontSize(24)} color={light.main2} name="create-outline" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ marginBottom: 10 }}>
          {item?.description && (
            <TextStyle verySmall color={textColor}>
              Descripción: {item?.description}
            </TextStyle>
          )}
          {item?.location && (
            <TextStyle verySmall color={textColor}>
              Ubicación: {item?.location}
            </TextStyle>
          )}
        </View>
        <View style={styles.row}>
          <TextStyle smallParagraph color={textColor}>
            Creación:{" "}
            <TextStyle smallParagraph color={light.main2}>
              {changeDate(new Date(item.creationDate))}
            </TextStyle>
          </TextStyle>
          <TextStyle smallParagraph color={textColor}>
            Alojados actuales:{" "}
            <TextStyle smallParagraph color={light.main2}>
              {hosted || 0}
            </TextStyle>
          </TextStyle>
        </View>
      </TouchableOpacity>
    );
  };

  return !zones.length ? (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        { flex: 1, alignItems: "center", justifyContent: "center" },
      ]}
    >
      <ButtonStyle
        backgroundColor={light.main2}
        style={{ width: "auto", paddingHorizontal: 30 }}
        onPress={() => navigation.navigate("CreateZone")}
      >
        <TextStyle center>Crear grupo</TextStyle>
      </ButtonStyle>
    </View>
  ) : (
    <View>
      <TextStyle color={textColor}>GRUPOS</TextStyle>
      <FlatList
        data={zones}
        style={{ marginTop: 20, maxHeight: SCREEN_HEIGHT / 1.55 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Card item={item} />}
      />
    </View>
  );
};

const Accommodation = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const zones = useSelector((state) => state.zones);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const standardReservations = useSelector((state) => state.standardReservations);
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);

  const [route, setRoute] = useState("");

  const getBackgrounColor = (mode) => (mode === "light" ? light.main5 : dark.main2);
  const backgroundColor = useMemo(() => getBackgrounColor(mode), [mode]);
  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const dispatch = useDispatch();

  const [chooseDateVisible, setChooseDateVisible] = useState(false);
  const [addPersonVisible, setAddPersonVisible] = useState(false);

  const [nomenclatureSelected, setNomenclatureSelected] = useState(null);
  const [reservationSelected, setReservationSelected] = useState(null);
  const [daySelected, setDaySelected] = useState(null);

  const cleanModal = () => {
    setChooseDateVisible(!chooseDateVisible);
    setAddPersonVisible(!addPersonVisible);
    setDaySelected(null);
    setReservationSelected(null);
    setNomenclatureSelected(null);
  };

  const saveHosted = async ({ data, cleanData }) => {
    const place = nomenclatures.find((n) => n.id === nomenclatureSelected?.id);

    data.owner = null;
    data.checkOut = null;
    data.ref = nomenclatureSelected.id;
    data.id = random(10, { number: true });

    navigation.navigate(
      nomenclatureSelected?.type === "accommodation"
        ? "CreateAccommodationReserve"
        : "CreateStandardReserve",
      {
        date: { year: daySelected.year, month: daySelected.month, day: daySelected.day },
        place,
        hosted: [data],
      }
    );

    cleanModal();
    cleanData();
  };

  const updateHosted = async ({ data, cleanData }) => {
    if (reservationSelected?.type === "accommodation") return saveHosted({ data, cleanData });

    data.ref = nomenclatureSelected.id;
    data.id = random(10, { number: true });
    data.owner = null;
    data.checkOut = null;

    let reservationREF = standardReservations.find((r) => r.id === reservationSelected.id);
    const reserveUpdated = {
      ...reservationREF,
      hosted: [...reservationREF.hosted, data],
    };
    dispatch(editRS({ id: reserveUpdated.id, data: reserveUpdated }));
    await editReservation({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      reservation: {
        data: reserveUpdated,
        type: "standard",
      },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
    cleanModal();
    cleanData();
  };

  return (
    <Layout>
      {zones.length > 0 && (
        <View style={styles.row}>
          <ButtonStyle
            backgroundColor={light.main2}
            style={{ width: "auto" }}
            onPress={() => setChooseDateVisible(!chooseDateVisible)}
          >
            <TextStyle center smallParagraph>
              Crear reserva
            </TextStyle>
          </ButtonStyle>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.navigate("CreateZone")}>
              <Ionicons name="add-circle" color={light.main2} size={getFontSize(26)} />
            </TouchableOpacity>
            {route && (
              <TouchableOpacity onPress={() => setRoute("")} style={{ marginLeft: 5 }}>
                <Ionicons name="arrow-back" color={textColor} size={getFontSize(26)} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {zones.length > 0 && (
        <View style={[{ marginVertical: 15 }, styles.row]}>
          <ButtonStyle
            backgroundColor={route === "hosted" ? backgroundColor : light.main2}
            style={{ width: "auto", paddingHorizontal: 12 }}
            onPress={() => setRoute(route === "hosted" ? "" : "hosted")}
          >
            <TextStyle verySmall center color={route === "hosted" ? textColor : light.textDark}>
              ALOJADOS
            </TextStyle>
          </ButtonStyle>
          <ButtonStyle
            backgroundColor={route === "reservation" ? backgroundColor : light.main2}
            style={{ width: "auto", paddingHorizontal: 12 }}
            onPress={() => setRoute(route === "reservation" ? "" : "reservation")}
          >
            <TextStyle verySmall center color={route === "reservation" ? textColor : light.textDark}>
              RESERVAS
            </TextStyle>
          </ButtonStyle>
          <ButtonStyle
            backgroundColor={route === "location" ? backgroundColor : light.main2}
            style={{ width: "auto", paddingHorizontal: 12 }}
            onPress={() => setRoute(route === "location" ? "" : "location")}
          >
            <TextStyle verySmall center color={route === "location" ? textColor : light.textDark}>
              UBICACIÓN
            </TextStyle>
          </ButtonStyle>
          <ButtonStyle
            backgroundColor={route === "historical" ? backgroundColor : light.main2}
            style={{ width: "auto", paddingHorizontal: 12 }}
            onPress={() => setRoute(route === "historical" ? "" : "historical")}
          >
            <TextStyle verySmall center color={route === "historical" ? textColor : light.textDark}>
              HISTORIAL
            </TextStyle>
          </ButtonStyle>
        </View>
      )}
      {!route && <Zone />}
      {route === "location" && <Location />}
      {route === "hosted" && <Hosted route="hosted" />}
      {route === "reservation" && <Hosted route="reservation" />}
      {route === "historical" && <Hosted route="historical" />}
      <ChooseDate
        modalVisible={chooseDateVisible}
        setModalVisible={setChooseDateVisible}
        onDayPress={({ data, nomenclatureID, markedDates }) => {
          const reservation = markedDates[data.dateString]?.reservation;
          const nom = nomenclatures.find((n) => n.id === nomenclatureID);

          if (reservation?.type === "standard" && nom.people === reservation?.hosted?.length)
            return Alert.alert(
              "OOPS",
              "Ha superado el monto máximo de huéspedes permitidos en la habitación"
            );

          setNomenclatureSelected(nom);
          setDaySelected({ year: data.year, month: data.month - 1, day: data.day });
          setReservationSelected(reservation || null);
          setAddPersonVisible(!addPersonVisible);
        }}
      />
      <AddPerson
        key={addPersonVisible}
        modalVisible={addPersonVisible}
        setModalVisible={setAddPersonVisible}
        settings={{ days: nomenclatureSelected?.type === "accommodation" }}
        handleSubmit={(data) => (!reservationSelected ? saveHosted(data) : updateHosted(data))}
        type={nomenclatureSelected?.type}
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
  zone: {
    padding: 14,
    borderRadius: 4,
    marginVertical: 4,
  },
  header: {
    width: "100%",
    backgroundColor: light.main2,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  search: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 18,
  },
  toggle: {
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Accommodation;

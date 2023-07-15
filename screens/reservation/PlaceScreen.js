import { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { months, thousandsSystem } from "@helpers/libs";
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
  const activeGroup = useSelector((state) => state.activeGroup);
  const groupState = useSelector((state) => state.groups);
  const nomenclaturesState = useSelector((state) => state.nomenclatures);
  const reservationsState = useSelector((state) => state.reservations);

  const owner = route.params?.owner;

  const [group, setGroup] = useState([]);
  const [reservations, setReservation] = useState([]);
  const [nomenclatures, setNomenclatures] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filter, setFilter] = useState("");
  const [filterResult, setFilterResult] = useState([]);

  useEffect(() => {
    let reservations = []

    for (let n of nomenclatures) {
      const found = reservationsState.filter((r) => r.id === n.id);
      for (let r of found) {
        reservations.push(r);
      }
    }

    setReservation(reservations)
  },[nomenclatures, reservationsState]);

  useEffect(() => {
    setGroup(groupState.find((group) => group.ref === route.params.ref))
    setNomenclatures(nomenclaturesState.filter((n) => n.ref === route.params.ref));
  },[groupState, nomenclaturesState]);

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
  }, [filter]);

  useEffect(() => {
    if (!activeFilter) setFilter("");
  }, [activeFilter]);

  useEffect(() => {
    navigation.setOptions({ title: group?.name });
  }, [group]);

  const DayOfTheMonth = () =>
    nomenclatures?.map((place) => (
      <View
        key={place.nomenclature + place.modificationDate}
        style={styles.reservationDate}
      >
        <TouchableOpacity
          onPress={() => {
            if (activeGroup.active && !activeGroup.accessToReservations) return
            navigation.push("PlaceInformation", {
              ref: route.params.ref,
              id: place.id,
              type: "Nomenclatura",
            })
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

                  if (disable || (!activeGroup.accessToReservations && activeGroup.active)) return;
                  if (!dayTaken) {
                    navigation.push("CreateReserve", {
                      owner: owner ? owner : null,
                      capability: place.capability,
                      name: params.name,
                      year: params.year,
                      day: item,
                      month: params.month,
                      days: params.days,
                      id: place.id,
                    });
                  } else {
                    navigation.push("ReserveInformation", {
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
              navigation.push("ReserveInformation", {
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ maxWidth: "100%" }}
              contentContainerStyle={{
                flexGrow: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
                smallParagraph
              >
                Nombre:{" "}
                <TextStyle smallParagraph color={light.main2}>
                  {guest.fullName.slice(0, 15)}
                </TextStyle>
              </TextStyle>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
                smallParagraph
              >
                Dias:{" "}
                <TextStyle smallParagraph color={light.main2}>
                  {guest.days}
                </TextStyle>
              </TextStyle>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
                smallParagraph
              >
                Personas:{" "}
                <TextStyle smallParagraph color={light.main2}>
                  {guest.people}
                </TextStyle>
              </TextStyle>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
                smallParagraph
              >
                Total:{" "}
                <TextStyle smallParagraph color={light.main2}>
                  {thousandsSystem(guest.amount)}
                </TextStyle>
              </TextStyle>
            </ScrollView>
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
                size={30}
                color={mode === "light" ? light.textDark : dark.textWhite}
              />
            </TouchableOpacity>
            <InputStyle
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
                (!activeGroup.active || activeGroup.accessToReservations) && (
                  <TouchableOpacity
                    onPress={() => setActiveFilter(!activeFilter)}
                  >
                    <Ionicons name="search" size={38} color={light.main2} />
                  </TouchableOpacity>
                )}
              {(!activeGroup.active || activeGroup.accessToReservations) && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.push("PlaceInformation", {
                      ref: route.params.ref,
                      name: group?.name,
                      type: "General",
                    })
                  }
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={38}
                    color={light.main2}
                  />
                </TouchableOpacity>
              )}
              {nomenclatures?.length > 0 &&
                (!activeGroup.active || activeGroup.accessToReservations) && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.push("CreatePlace", { ref: route.params.ref })
                    }
                  >
                    <Ionicons name="add-circle" size={40} color={light.main2} />
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
            {group?.name}
          </TextStyle>
        )}
        <ScrollView style={{ maxHeight: height / 1.5 }}>
          {activeFilter ? <GuestCard /> : <DayOfTheMonth />}
        </ScrollView>
        {nomenclatures?.length === 0 &&
          (!activeGroup.active || activeGroup.accessToReservations) && (
            <ButtonStyle
              onPress={() =>
                navigation.push("CreatePlace", { ref: route.params.ref })
              }
              backgroundColor={light.main2}
            >
              Agregar subcategoría
            </ButtonStyle>
          )}
        {nomenclatures?.length === 0 &&
          activeGroup.active &&
          !activeGroup.accessToReservations && (
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

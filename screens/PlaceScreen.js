import { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { months } from "../helpers/libs";
import Layout from "../components/Layout";
import TextStyle from "../components/TextStyle";
import ButtonStyle from "../components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "../theme";

const light = theme.colors.light;
const dark = theme.colors.dark;
const height = Dimensions.get("window").height;
const width = Dimensions.get("screen").width;

const PlaceScreen = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const group = useSelector((state) =>
    state.groups.find((group) => group.ref === route.params.ref)
  );

  const nomenclatures = useSelector((state) =>
    state.nomenclatures.filter((n) => n.ref === route.params.ref)
  );
  const reservations = useSelector((state) => {
    const reservations = [];

    for (let n of nomenclatures) {
      const found = state.reservations.filter((r) => r.id === n.id);
      for (let r of found) {
        reservations.push(r);
      }
    }

    return reservations;
  });

  useEffect(() => {
    navigation.setOptions({ title: group?.name });
  }, [group]);

  return (
    <Layout style={{ marginTop: 0 }}>
      <View style={{ width: "100%" }}>
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
          <View style={{ flexDirection: "row" }}>
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
            {nomenclatures?.length > 0 && (
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
        <TextStyle
          bigParagraph
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          Disponibles
        </TextStyle>
      </View>
      <View>
        <TextStyle
          bigParagraph
          customStyle={{ marginVertical: 30 }}
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          {group?.name}
        </TextStyle>
        <ScrollView style={{ maxHeight: height / 1.5 }}>
          {nomenclatures?.map((place) => (
            <View
              key={place.nomenclature + place.modificationDate}
              style={styles.reservationDate}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.push("PlaceInformation", {
                    ref: route.params.ref,
                    id: place.id,
                    type: "Nomenclatura",
                  })
                }
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

                        if (!disable) {
                          if (!dayTaken) {
                            navigation.push("CreateReserve", {
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
          ))}
        </ScrollView>
        {nomenclatures?.length === 0 && (
          <ButtonStyle
            onPress={() =>
              navigation.push("CreatePlace", { ref: route.params.ref })
            }
            backgroundColor={light.main2}
          >
            Agregar subcategoría
          </ButtonStyle>
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
});

export default PlaceScreen;

import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { change as changeMode } from "../features/settings/modeSlice";
import { inactive as inactiveGroup } from "../features/function/informationSlice";
import { change as changeUser } from "../features/user/informationSlice";
import { editUser } from "../api";
import { months } from "../helpers/libs";
import { Picker } from "@react-native-picker/picker";
import { socket } from "../socket";
import Layout from "../components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "../theme";
import TextStyle from "../components/TextStyle";
import ButtonStyle from "../components/ButtonStyle";
import changeGeneralInformation from "../helpers/changeGeneralInformation";
import helperCameOut from "../helpers/helperCameOut";
import cleanData from "../helpers/cleanData";
import Payu from "../components/Payu";
import PremiumScreen from "../components/Premium";

import Premium from "../assets/icons/premium.png";

import * as WebBrowser from "expo-web-browser";

const light = theme.colors.light;
const dark = theme.colors.dark;

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const HomeScreen = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const groups = useSelector((state) => state.groups);
  const user = useSelector((state) => state.user);
  const helpers = useSelector((state) => state.helpers);

  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(2023);
  const [days, setDays] = useState([]);

  const activeGroup = useSelector((state) => state.activeGroup);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const reservations = useSelector((state) => state.reservations);

  const pickerYearRef = useRef();
  const pickerMonthRef = useRef();
  const timerChangeMode = useRef();

  useEffect(() => {
    const date = new Date();
    setMonth(date.getMonth());
    setYear(date.getFullYear());
  }, []);

  useEffect(() => {
    const days = new Date(year, month + 1, 0).getDate();
    const monthDays = [];
    for (let day = 0; day < days; day++) {
      monthDays.push(day + 1);
    }
    setDays(monthDays);
  }, [year, month]);

  const defineColor = () => (mode === "light" ? light.textDark : dark.main4);

  const dispatch = useDispatch();

  const changeModeState = async () => {
    clearTimeout(timerChangeMode.current);

    const newMode = mode === "light" ? "dark" : "light";
    dispatch(changeMode(newMode));

    timerChangeMode.current = setTimeout(async () => {
      if (user.mode !== newMode) {
        dispatch(changeUser({ ...user, mode: newMode }));
        await editUser({ email: user.email, change: { mode: newMode } });
      }
    }, 1000);
  };

  const logOut = () => {
    navigation.replace("SignIn");
    setTimeout(async () => {
      const active = activeGroup;
      if (helpers.length > 0) {
        const helpers = helpers?.map((helper) => ({
          ...helper,
          expoID: helper.expoID.filter((e) => e !== user.expoID),
        }));

        await editUser({ email: user.email, change: { helpers } });
      }
      const groups = helpers?.map((h) => h.id);
      if (groups.length > 0) socket.emit("leave", { groups });
      cleanData(dispatch);
      if (active.active) {
        socket.emit("leave", { groups: [active.id] });
        await helperCameOut(active, user);
      }
    }, 300);
  };

  const years = [
    "2023",
    "2024",
    "2025",
    "2026",
    "2027",
    "2028",
    "2029",
    "2030",
    "2031",
    "2032",
    "2033",
    "2034",
    "2035",
    "2036",
    "2037",
    "2038",
    "2039",
    "2040",
  ];

  return (
    <Layout>
      <View style={styles.header}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "¿Estás seguro?",
                `Se cerrará la sesión`,
                [
                  {
                    text: "No",
                    style: "cancel",
                  },
                  {
                    text: "Si",
                    onPress: () => logOut(),
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <Ionicons
              name="log-in-outline"
              size={38}
              style={styles.icons}
              color={defineColor()}
            />
          </TouchableOpacity>
          {(!activeGroup.active || activeGroup.accessToStatistics) && (
            <TouchableOpacity onPress={() => navigation.push("Statistic")}>
              <Ionicons
                name="stats-chart-outline"
                size={38}
                style={styles.icons}
                color={defineColor()}
              />
            </TouchableOpacity>
          )}
          {!activeGroup.active && (
            <TouchableOpacity onPress={() => navigation.push("Helper")}>
              <Ionicons
                name="people-outline"
                size={38}
                color={defineColor()}
                style={styles.icons}
              />
              <Image source={Premium} style={[styles.premium, { right: -6 }]} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={async () =>
              await WebBrowser.openBrowserAsync("https://wa.me/+573207623454")
            }
          >
            <Ionicons
              name="logo-whatsapp"
              size={38}
              color={light.main2}
              style={styles.icons}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeModeState()}>
            <Ionicons
              name={mode === "light" ? "moon" : "sunny"}
              size={38}
              color={light.main2}
              style={styles.icons}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row" }}>
          {activeGroup.active && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  `Vas a regresar a tus datos`,
                  "Los datos estan guardados, no se perderán",
                  [
                    {
                      text: "Cancelar",
                      style: "cancel",
                    },
                    {
                      text: "Ok",
                      onPress: async () => {
                        const active = activeGroup;
                        socket.emit("leave", { groups: [activeGroup.id] });
                        const groups = helpers?.map((h) => h.id);
                        if (groups.length > 0)
                          socket.emit("enter_room", { groups });
                        changeGeneralInformation(dispatch, user);
                        dispatch(inactiveGroup());
                        await helperCameOut(active, user);
                      },
                    },
                  ],
                  { cancelable: true }
                )
              }
            >
              <Ionicons
                name="arrow-back"
                size={38}
                color={defineColor()}
                style={styles.icons}
              />
            </TouchableOpacity>
          )}
          {((groups.length > 0 && !activeGroup.active) ||
            (groups.length > 0 && activeGroup.accessToReservations)) && (
            <TouchableOpacity onPress={() => navigation.push("CreateZone")}>
              <Ionicons name="add-circle" size={40} color={light.main2} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.body}>
        <View style={{ alignItems: "center" }}>
          <TextStyle title color={light.main2}>
            VBELA
          </TextStyle>
          {(!activeGroup.active ||
            activeGroup.accessToReservations ||
            activeGroup.accessToTables) && (
            <>
              <Picker
                ref={pickerYearRef}
                mode="dialog"
                selectedValue={months[month]}
                style={{ display: "none" }}
                onValueChange={(itemValue) => setYear(itemValue)}
                dropdownIconColor={mode === "light" ? light.main4 : dark.main1}
              >
                {years.map((year) => (
                  <Picker.Item key={year} label={year} value={year} />
                ))}
              </Picker>
              <TouchableOpacity onPress={() => pickerYearRef.current.focus()}>
                <TextStyle
                  subtitle
                  color={mode === "light" ? light.textDark : dark.main4}
                >
                  {year}
                </TextStyle>
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={styles.content}>
          {(!activeGroup.active ||
            activeGroup.accessToKitchen ||
            activeGroup.accessToTables) && (
            <View>
              <ButtonStyle
                onPress={() => navigation.push("Kitchen")}
                backgroundColor={light.main2}
              >
                <TextStyle color={light.textDark}>Producción</TextStyle>
              </ButtonStyle>
              <Image source={Premium} style={styles.premium} />
            </View>
          )}
          {(!activeGroup.active ||
            activeGroup.accessToCustomer ||
            activeGroup.accessToTables) && (
            <View>
              <ButtonStyle
                onPress={() => navigation.push("People", { type: "customer" })}
                backgroundColor={mode === "light" ? light.main5 : dark.main2}
              >
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Cliente
                </TextStyle>
              </ButtonStyle>
              <Image source={Premium} style={styles.premium} />
            </View>
          )}

          {(!activeGroup.active || activeGroup.accessToSupplier) && (
            <View>
              <ButtonStyle
                onPress={() => navigation.push("People", { type: "supplier" })}
                backgroundColor={mode === "light" ? light.main5 : dark.main2}
              >
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Proveedor
                </TextStyle>
              </ButtonStyle>
              <Image source={Premium} style={styles.premium} />
            </View>
          )}
          {(!activeGroup.active || activeGroup.accessToRoster) && (
            <View>
              <ButtonStyle
                onPress={() => navigation.push("CreateRoster")}
                backgroundColor={light.main2}
              >
                <TextStyle color={light.textDark}>Pagos De Nómina</TextStyle>
              </ButtonStyle>
              <Image source={Premium} style={styles.premium} />
            </View>
          )}
          {(!activeGroup.active || activeGroup.accessToTables) && (
            <View>
              <ButtonStyle
                onPress={() => navigation.push("Tables")}
                backgroundColor={light.main2}
              >
                <TextStyle color={light.textDark}>Menú</TextStyle>
              </ButtonStyle>
              <Image source={Premium} style={styles.premium} />
            </View>
          )}
          {(!activeGroup.active ||
            activeGroup.accessToReservations ||
            activeGroup.accessToTables) && (
            <View style={styles.divider}>
              <TextStyle color={mode === "light" ? null : dark.main4}>
                Control De Reservas
              </TextStyle>
              <Picker
                ref={pickerMonthRef}
                mode="dialog"
                selectedValue={months[month]}
                style={{ display: "none" }}
                onValueChange={(itemValue) => {
                  setMonth(months.indexOf(itemValue));
                }}
                dropdownIconColor={mode === "light" ? light.main4 : dark.main1}
              >
                {months.map((month, index) => (
                  <Picker.Item key={month} label={month} value={month} />
                ))}
              </Picker>
              <TouchableOpacity onPress={() => pickerMonthRef.current.focus()}>
                <TextStyle color={mode === "light" ? null : dark.main4}>
                  <Ionicons name="search" size={30} color={defineColor()} />{" "}
                  {months[month]}
                </TextStyle>
              </TouchableOpacity>
            </View>
          )}
          {(!activeGroup.active ||
            activeGroup.accessToReservations ||
            activeGroup.accessToTables) && (
            <View style={styles.places}>
              <FlatList
                data={groups}
                style={{
                  maxHeight: height / 4,
                }}
                showsVerticalScrollIndicator={false}
                inverted
                renderItem={({ item }) => {
                  const ns = nomenclatures.filter((n) => n.ref === item.ref);
                  const rs = [];
                  const currentDate = new Date();
                  currentDate.setMilliseconds(0);
                  currentDate.setMinutes(0);
                  currentDate.setSeconds(0);
                  currentDate.setHours(0);
                  let refDays = days.filter((day) => {
                    const date = new Date(year, month, day).getTime();

                    return date >= currentDate;
                  });

                  const datesFound = [];

                  for (let n of ns) {
                    const found = reservations.filter((r) => r.id === n.id);
                    for (let r of found) {
                      rs.push(r);
                    }
                  }

                  for (let item of days) {
                    for (let reserve of rs) {
                      const date = new Date(year, month, item).getTime();

                      const start = new Date(reserve.start).getTime();
                      const end = new Date(reserve.end).getTime();

                      if (date >= start && date <= end) {
                        const find = datesFound.find(
                          (d) => d.id === reserve.ref && d.date === date
                        );
                        if (!find) {
                          datesFound.push({ id: reserve.ref, date });
                        }
                      }
                    }
                  }

                  var uniqs = datesFound.map((d) => d.date);

                  for (let date of uniqs) {
                    const dateFound = new Date(date).getDate();

                    const filter = uniqs.filter((d) => d === date);

                    if (filter.length === ns.length) {
                      const newRef = refDays.filter((day) => day !== dateFound);
                      refDays = newRef;
                    }
                  }

                  return (
                    <ButtonStyle
                      onPress={() => {
                        navigation.push("Place", {
                          ref: item.ref,
                          name: item.name,
                          days,
                          month: months[month],
                          year,
                        });
                      }}
                      backgroundColor={
                        refDays.length === 0
                          ? mode === "light"
                            ? dark.main2
                            : light.main4
                          : light.main2
                      }
                      left={() => (
                        <TextStyle
                          color={
                            refDays.length === 0 && mode === "light"
                              ? dark.textWhite
                              : light.textDark
                          }
                        >
                          {item.name}
                        </TextStyle>
                      )}
                      right={() => (
                        <TextStyle color={light.main4}>
                          {refDays.length === 0 ? "" : refDays.length}
                        </TextStyle>
                      )}
                    />
                  );
                }}
              />
              {groups.length === 0 && (
                <ButtonStyle
                  onPress={() => navigation.push("CreateZone")}
                  backgroundColor={light.main2}
                >
                  Agregar categoría
                </ButtonStyle>
              )}
            </View>
          )}
        </View>
      </View>
      {/*<PremiumScreen/> */}
      <Payu activePayment={false} />
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  icons: {
    marginHorizontal: 10,
  },
  body: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  content: {
    marginTop: 30,
    width: "100%",
    paddingHorizontal: 10,
  },
  divider: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  places: {
    marginTop: 5,
  },
  done: {
    backgroundColor: light.main2,
    position: "absolute",
    top: 0,
    right: 0,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomStartRadius: 8,
  },
  premium: {
    height: Math.floor(width / 20),
    width: Math.floor(width / 20),
    position: "absolute",
    top: 0,
    right: 0,
    display: "none",
  }
});

export default HomeScreen;

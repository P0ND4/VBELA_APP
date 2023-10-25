import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  FlatList,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
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
    setModalVisibleCalendar(false);
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

  const navigationStack = useNavigation();

  useEffect(() => {
    const days = new Date(year, month - 1, 0).getDate();
    setDays(Array.from({ length: days }, (_, i) => i + 1));
  }, [month, year]);

  const backgroundSelected = (params) =>
    route === params
      ? mode === "light"
        ? light.main5
        : dark.main2
      : light.main2;

  const textColorSelected = (params) =>
    route === params
      ? mode === "light"
        ? light.textDark
        : dark.textWhite
      : light.textDark;

  const InformationGuest = ({ modalVisible, setModalVisible, item }) => {
    const [editing, setEditing] = useState(false);
    const [handler, setHandler] = useState({
      active: true,
      key: Math.random(),
    });

    const updateHosted = async ({ data, cleanData }) => {
      data.id = item.id;
      data.owner = item.owner;
      data.payment = item.payment;
      data.checkOut = item.checkOut;

      let reserveUpdated = reservations.find(
        (r) => r.ref === item.reservationID
      );
      reserveUpdated = {
        ...reserveUpdated,
        hosted: reserveUpdated.hosted.map((h) => {
          if (h.id === item.id) return data;
          return h;
        }),
      };
      cleanData();
      setModalVisible(!modalVisible);
      dispatch(editR({ ref: reserveUpdated.ref, data: reserveUpdated }));
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

    return (
      <>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <TouchableWithoutFeedback
            onPress={() => setModalVisible(!modalVisible)}
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
              <View style={styles.row}>
                <TextStyle color={light.main2} bigSubtitle>
                  INFORMACIÓN
                </TextStyle>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity onPress={() => setEditing(!editing)}>
                    <Ionicons
                      name="create-outline"
                      size={getFontSize(28)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <Ionicons
                      name="close"
                      size={getFontSize(28)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ marginTop: 20 }}>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Nombre completo:{" "}
                  <TextStyle color={light.main2}>{item.fullName}</TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Correo electrónico:{" "}
                  <TextStyle color={light.main2}>{item.email}</TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Cédula:{" "}
                  <TextStyle color={light.main2}>
                    {!helperStatus.active || helperStatus.accessToReservations
                      ? thousandsSystem(item.identification)
                      : "PRIVADO"}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Número de teléfono:{" "}
                  <TextStyle color={light.main2}>{item.phoneNumber}</TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  CHECK IN:{" "}
                  <TextStyle color={light.main2}>
                    {item.checkIn ? changeDate(new Date(item.checkIn)) : "NO"}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Cliente registrado:{" "}
                  <TextStyle color={light.main2}>
                    {item.owner ? "SI" : "NO"}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  CHECK OUT:{" "}
                  <TextStyle color={light.main2}>
                    {item.checkOut ? changeDate(new Date(item.checkOut)) : "NO"}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Pagado:{" "}
                  <TextStyle color={light.main2}>
                    {!helperStatus.active || helperStatus.accessToReservations
                      ? !item.payment
                        ? "EN ESPERA"
                        : item.payment === "business"
                        ? "POR EMPRESA"
                        : thousandsSystem(item.payment)
                      : "PRIVADO"}
                  </TextStyle>
                </TextStyle>
              </View>
            </View>
          </View>
        </Modal>
        <AddPerson
          key={handler.key}
          setEditing={setHandler}
          modalVisible={editing}
          setModalVisible={setEditing}
          editing={{ active: true, ...item }}
          handleSubmit={(data) => updateHosted(data)}
        />
      </>
    );
  };

  const Hosted = ({ type }) => {
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
          .filter((r) =>
            type === "reservation"
              ? !r.checkIn
              : type === "hosted"
              ? !r.checkOut && r.checkIn
              : true
          )
          .map((person) => ({
            ...person,
            accommodationID: item.accommodation?.id || "standard",
            accommodation: item?.accommodation?.name || "Estandar",
            groupID: ref,
            nomenclatureID: item.id,
            reservationID: item.ref,
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

    const Guest = ({ guest }) => {
      const [informationModalVisible, setInformationModalVisible] =
        useState(false);

      return (
        <>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => {
                if (helperStatus.active && !helperStatus.accessToReservations)
                  return;

                Alert.alert(
                  "CAMBIAR",
                  `¿El cliente ${guest.checkIn ? "no " : ""} ha llegado?`,
                  [
                    {
                      text: "Cancelar",
                      style: "cancel",
                    },
                    {
                      text: "Si",
                      onPress: async () => {
                        const reserve = reservations.find(
                          (r) => r.ref === guest.reservationID
                        );
                        const newHosted = reserve?.hosted.map((i) => {
                          if (i.id === guest.id) {
                            const newI = { ...i };
                            newI.checkIn = i.checkIn
                              ? null
                              : new Date().getTime();
                            newI.checkOut = null;
                            newI.payment = 0;
                            return newI;
                          }
                          return i;
                        });

                        const newReservation = { ...reserve };
                        newReservation.hosted = newHosted;
                        dispatch(
                          editR({
                            ref: guest.reservationID,
                            data: newReservation,
                          })
                        );
                        await editReservation({
                          identifier: helperStatus.active
                            ? helperStatus.identifier
                            : user.identifier,
                          reservation: newReservation,
                          helpers: helperStatus.active
                            ? [helperStatus.id]
                            : user.helpers.map((h) => h.id),
                        });
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
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
                {guest.checkIn ? changeDate(new Date(guest.checkIn)) : "NO"}
              </TextStyle>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                },
              ]}
              onLongPress={() =>
                navigation.navigate("ReserveInformation", {
                  ref: guest.reservationID,
                  id: guest.nomenclatureID,
                })
              }
              onPress={() =>
                setInformationModalVisible(!informationModalVisible)
              }
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {guest.fullName}
              </TextStyle>
            </TouchableOpacity>
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
                {guest.days}
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
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {thousandsSystem(guest.identification)}
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
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {guest.nomenclature}
              </TextStyle>
            </View>
          </View>
          <InformationGuest
            modalVisible={informationModalVisible}
            setModalVisible={setInformationModalVisible}
            item={guest}
          />
        </>
      );
    };

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
            paddingHorizontal: 15,
            paddingVertical: 8,
          }}
        >
          <TextStyle smallParagraph>LISTADO DE HUÉSPEDES</TextStyle>
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
                    NOMBRE
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
              </View>
              {hosted.map((guest) => (
                <Guest guest={guest} key={guest.id} />
              ))}
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
                  reservationID: r.ref,
                  nomenclatureID: r.id,
                  accommodationID: r.accommodation?.id || "standard",
                  accommodation: r?.accommodation?.name || "Estandar",
                  days: r.days,
                  creationDate: r.creationDate,
                }));
            });

          return { ...item, hosted, zoneName: zone?.name || "" };
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

    const Guest = ({ guest }) => {
      const [informationModalVisible, setInformationModalVisible] =
        useState(false);

      return (
        <>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={[
                styles.table,
                {
                  borderColor:
                    mode === "light" ? light.textDark : dark.textWhite,
                },
              ]}
              onLongPress={() =>
                navigation.navigate("ReserveInformation", {
                  ref: guest.reservationID,
                  id: guest.nomenclatureID,
                })
              }
              onPress={() =>
                setInformationModalVisible(!informationModalVisible)
              }
            >
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {guest.fullName}
              </TextStyle>
            </TouchableOpacity>
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
                {guest.identification}
              </TextStyle>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (helperStatus.active && !helperStatus.accessToReservations)
                  return;

                Alert.alert(
                  "CAMBIAR",
                  `¿El cliente ${guest.checkIn ? "no " : ""} ha llegado?`,
                  [
                    {
                      text: "Cancelar",
                      style: "cancel",
                    },
                    {
                      text: "Si",
                      onPress: async () => {
                        const reserve = reservations.find(
                          (r) => r.ref === guest.reservationID
                        );
                        const newHosted = reserve?.hosted.map((i) => {
                          if (i.id === guest.id) {
                            const newI = { ...i };
                            newI.checkIn = i.checkIn
                              ? null
                              : new Date().getTime();
                            newI.checkOut = null;
                            newI.payment = 0;
                            return newI;
                          }
                          return i;
                        });

                        const newReservation = { ...reserve };
                        newReservation.hosted = newHosted;
                        dispatch(
                          editR({
                            ref: guest.reservationID,
                            data: newReservation,
                          })
                        );
                        await editReservation({
                          identifier: helperStatus.active
                            ? helperStatus.identifier
                            : user.identifier,
                          reservation: newReservation,
                          helpers: helperStatus.active
                            ? [helperStatus.id]
                            : user.helpers.map((h) => h.id),
                        });
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
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
                {guest.checkIn ? changeDate(new Date(guest.checkIn)) : "NO"}
              </TextStyle>
            </TouchableOpacity>
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
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {guest.days}
              </TextStyle>
            </View>
          </View>
          <InformationGuest
            modalVisible={informationModalVisible}
            setModalVisible={setInformationModalVisible}
            item={guest}
          />
        </>
      );
    };

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
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                  }}
                >
                  <TextStyle smallParagraph>
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
                    {item.hosted.map((guest) => (
                      <Guest guest={guest} key={guest.id} />
                    ))}
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

  const Groups = () => {
    return (
      <View style={{ height: height / 1.55 }}>
        <TextStyle
          bigParagraph
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          GRUPOS
        </TextStyle>
        <FlatList
          data={zones}
          style={{ marginTop: 20 }}
          keyExtractor={(item) => item.ref}
          renderItem={({ item }) => {
            const hosted = nomenclatures
              .filter((n) => n.ref === item.ref)
              .reduce(
                (a, n) =>
                  a +
                  reservations.reduce((a, b) => {
                    if (b.id === n.id) return a + b.hosted.length;
                    return a;
                  }, 0),
                0
              );

            return (
              <TouchableOpacity
                onLongPress={() => {
                  navigation.navigate("PlaceInformation", {
                    ref: item.ref,
                    name: item?.name,
                    type: "General",
                  });
                }}
                onPress={() => {
                  navigationStack.navigate("Place", {
                    year,
                    month,
                    ref: item.ref,
                    days,
                  });
                }}
                style={[
                  styles.zone,
                  {
                    backgroundColor:
                      mode === "light" ? light.main5 : dark.main2,
                  },
                ]}
              >
                <View style={styles.row}>
                  <TextStyle color={light.main2} smallSubtitle>
                    {item?.name}
                  </TextStyle>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("PlaceInformation", {
                          ref: item.ref,
                          name: item?.name,
                          type: "General",
                        });
                      }}
                    >
                      <Ionicons
                        size={getFontSize(24)}
                        color={light.main2}
                        name="information-circle-outline"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("CreateZone", {
                          item,
                          ref: item.ref,
                          editing: true,
                        });
                      }}
                    >
                      <Ionicons
                        size={getFontSize(24)}
                        color={light.main2}
                        name="create-outline"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ marginBottom: 10 }}>
                  <TextStyle
                    verySmall
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Descripción: {item?.description}
                  </TextStyle>
                  <TextStyle
                    verySmall
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Ubicación: {item?.location}
                  </TextStyle>
                </View>
                <View style={styles.row}>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Creación:{" "}
                    <TextStyle smallParagraph color={light.main2}>
                      {changeDate(new Date(item.creationDate))}
                    </TextStyle>
                  </TextStyle>
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Alojados:{" "}
                    <TextStyle smallParagraph color={light.main2}>
                      {hosted || 0}
                    </TextStyle>
                  </TextStyle>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      {zones.length > 0 && (
        <>
          <View>
            <View style={styles.row}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {route && (
                  <TouchableOpacity
                    onPress={() => setRoute("")}
                    style={{ marginRight: 5 }}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={getFontSize(25)}
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    />
                  </TouchableOpacity>
                )}
                <ButtonStyle
                  style={{ width: "auto" }}
                  backgroundColor={light.main2}
                  onPress={() => setModalVisibleCalendar(!modalVisibleCalendar)}
                >
                  <TextStyle smallParagraph center>
                    Crear una reserva
                  </TextStyle>
                </ButtonStyle>
              </View>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => setRoute("historical")}>
                  <Ionicons
                    name="file-tray-stacked-outline"
                    size={getFontSize(26)}
                    color={light.main2}
                  />
                </TouchableOpacity>
                {route === "" && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("CreateZone")}
                  >
                    <Ionicons
                      name="add-circle"
                      size={getFontSize(26)}
                      color={light.main2}
                      style={{ marginLeft: 5 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {route === "location" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
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
                          fontSize: getFontSize(10),
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
                            fontSize: getFontSize(10),
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
                            fontSize: getFontSize(10),
                          }}
                          color={
                            mode === "light" ? light.textDark : dark.textWhite
                          }
                        />
                      )}
                    </Picker>
                  </View>
                </View>
              )}
            </View>
            <View style={[styles.row, { marginVertical: 15 }]}>
              <ButtonStyle
                backgroundColor={backgroundSelected("hosted")}
                onPress={() => setRoute("hosted")}
                style={{ width: "auto" }}
              >
                <TextStyle color={textColorSelected("hosted")} smallParagraph>
                  ALOJADOS
                </TextStyle>
              </ButtonStyle>
              <ButtonStyle
                backgroundColor={backgroundSelected("reservations")}
                onPress={() => setRoute("reservations")}
                style={{ width: "auto" }}
              >
                <TextStyle
                  color={textColorSelected("reservations")}
                  smallParagraph
                >
                  RESERVAS
                </TextStyle>
              </ButtonStyle>
              <ButtonStyle
                backgroundColor={backgroundSelected("location")}
                onPress={() => setRoute("location")}
                style={{ width: "auto" }}
              >
                <TextStyle color={textColorSelected("location")} smallParagraph>
                  UBICACIÓN
                </TextStyle>
              </ButtonStyle>
            </View>
          </View>

          {route === "reservations" && <Hosted type="reservation" />}
          {route === "hosted" && <Hosted type="hosted" />}
          {route === "historical" && <Hosted type="historical" />}
          {!route && <Groups />}
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
  zone: {
    padding: 14,
    borderRadius: 4,
    marginVertical: 4,
  },
});

export default Accommodation;

import { useState, useEffect } from "react";
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
  Switch,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import { edit as editRS } from "@features/zones/standardReservationsSlice";
import { add as addRA } from "@features/zones/accommodationReservationsSlice";
import {
  changeDate,
  thousandsSystem,
  getFontSize,
  random,
  addDays,
} from "@helpers/libs";
import { editReservation, addReservation } from "@api";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import ChooseDate from "@components/ChooseDate";
import AddPerson from "@components/AddPerson";
import FullFilterDate from "@components/FullFilterDate";
import GuestTable from "@components/GuestTable";

const { light, dark } = theme();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Accommodation = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const zones = useSelector((state) => state.zones);
  const user = useSelector((state) => state.user);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );
  const helperStatus = useSelector((state) => state.helperStatus);
  const customers = useSelector((state) => state.customers);

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const [days, setDays] = useState([]);

  const [zoneSelected, setZoneSelected] = useState("");
  const [route, setRoute] = useState("");
  const [modalVisibleCalendar, setModalVisibleCalendar] = useState(false);
  const [modalVisiblePeople, setModalVisiblePeople] = useState(false);
  const [reservationSelected, setReservationSelected] = useState(null);

  const [daySelected, setDaySelected] = useState(null);

  const dispatch = useDispatch();

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

  const dateValidation = (date, dateCompare) => {
    let error = false;
    if (dateCompare.day !== "all" && date.getDate() !== dateCompare.day)
      error = true;
    if (
      dateCompare.month !== "all" &&
      date.getMonth() + 1 !== dateCompare.month
    )
      error = true;
    if (dateCompare.year !== "all" && date.getFullYear() !== dateCompare.year)
      error = true;
    return error;
  };

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
      active: type === "hosted",
      dayCheckIn: type === "hosted" ? new Date().getDate() : "all",
      monthCheckIn: type === "hosted" ? new Date().getMonth() + 1 : "all",
      yearCheckIn: type === "hosted" ? new Date().getFullYear() : "all",
    });

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
      const standard = standardReservations.flatMap((item) => {
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
          .map((person) => {
            let customer = null;
            if (person.owner) {
              // Vemos si tiene afiliacion con cliente
              const individual = customers.find((p) => p.id === person.owner); // Buscamos si es un cliente individual
              if (!individual) {
                // Comprovamos si lo es
                const agency = customers.find((p) =>
                  p?.clientList?.some((c) => c.id === person.owner)
                ); // Buscamos si es un cliente de agencia
                if (agency) customer = agency; // Si lo es que lo guarde en clientes si no el parametro cliente queda null
              } else customer = individual; // Si lo es pasamos el dato al cliente
            }

            return {
              ...person,
              type: item.type,
              groupID: ref,
              nomenclatureID: item.id,
              reservationID: item.ref,
              days: item.days,
              zone,
              nomenclature,
              creationDate: item.creationDate,
              start: item.start,
              customer: person.owner ? customer : null,
            };
          });
      });

      const accommodation = accommodationReservations
        .filter((r) =>
          type === "reservation"
            ? !r.checkIn
            : type === "hosted"
            ? !r.checkOut && r.checkIn
            : true
        )
        .flatMap((item) => {
          const { nomenclature, ref } = nomenclatures.find(
            (n) => n.id === item.ref
          );
          const { name: zone } = zones.find((g) => g.ref === ref);
          let customer = null;
          if (item.owner) {
            // Vemos si tiene afiliacion con cliente
            const individual = customers.find((p) => p.id === item.owner); // Buscamos si es un cliente individual
            if (!individual) {
              // Comprovamos si lo es
              const agency = customers.find((p) =>
                p?.clientList?.some((c) => c.id === item.owner)
              ); // Buscamos si es un cliente de agencia
              if (agency) customer = agency; // Si lo es que lo guarde en clientes si no el parametro cliente queda null
            } else customer = individual; // Si lo es pasamos el dato al cliente
          }

          return {
            ...item,
            groupID: ref,
            nomenclatureID: item.ref,
            reservationID: item.id,
            zone,
            nomenclature,
            customer: item.owner ? customer : null,
          };
        });

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
            if (filters.type && h.type !== filters.type) return;
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
      <View style={{ height: SCREEN_HEIGHT / 1.55 }}>
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
            <GuestTable hosted={hosted} />
          </ScrollView>
        </ScrollView>
        <Modal
          animationType="fade"
          transparent={true}
          visible={activeFilter}
          onRequestClose={() => setActiveFilter(!activeFilter)}
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
                    onPress={() => setActiveFilter(!activeFilter)}
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

                      <Picker.Item
                        label="Acomodación"
                        value="accommodation"
                        style={{
                          backgroundColor:
                            mode === "light" ? light.main5 : dark.main2,
                        }}
                        color={
                          mode === "light" ? light.textDark : dark.textWhite
                        }
                      />
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
                        width: SCREEN_WIDTH / 2.8,
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
                        width: SCREEN_WIDTH / 2.8,
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
                {type !== "reservation" && (
                  <FullFilterDate
                    title="Por fecha (CHECK IN)"
                    defaultValue={{
                      day: filters.dayCheckIn,
                      month: filters.monthCheckIn,
                      year: filters.yearCheckIn,
                    }}
                    onChangeDay={(value) =>
                      setFilters({ ...filters, dayCheckIn: value })
                    }
                    onChangeMonth={(value) =>
                      setFilters({ ...filters, monthCheckIn: value })
                    }
                    onChangeYear={(value) =>
                      setFilters({ ...filters, yearCheckIn: value })
                    }
                  />
                )}
                {type === "historical" && (
                  <FullFilterDate
                    title="Por fecha (CHECK OUT)"
                    defaultValue={{
                      day: filters.dayCheckOut,
                      month: filters.monthCheckOut,
                      year: filters.yearCheckOut,
                    }}
                    onChangeDay={(value) =>
                      setFilters({ ...filters, dayCheckOut: value })
                    }
                    onChangeMonth={(value) =>
                      setFilters({ ...filters, monthCheckOut: value })
                    }
                    onChangeYear={(value) =>
                      setFilters({ ...filters, yearCheckOut: value })
                    }
                  />
                )}
                <FullFilterDate
                  title="Por fecha (CREACIÓN)"
                  increment={5}
                  defaultValue={{
                    day: filters.dayCreation,
                    month: filters.monthCreation,
                    year: filters.yearCreation,
                  }}
                  onChangeDay={(value) =>
                    setFilters({ ...filters, dayCreation: value })
                  }
                  onChangeMonth={(value) =>
                    setFilters({ ...filters, monthCreation: value })
                  }
                  onChangeYear={(value) =>
                    setFilters({ ...filters, yearCreation: value })
                  }
                />
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
                      setActiveFilter(!activeFilter);
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
      const standard = standardReservations.flatMap((item) => {
        const { nomenclature, ref } = nomenclatures.find(
          (n) => n.id === item.id
        );
        const { name: zone } = zones.find((g) => g.ref === ref);

        return item.hosted
          .filter((r) => everybody || (!r.checkOut && r.checkIn))
          .map((person) => {
            let customer = null;
            if (person.owner) {
              // Vemos si tiene afiliacion con cliente
              const individual = customers.find((p) => p.id === person.owner); // Buscamos si es un cliente individual
              if (!individual) {
                // Comprovamos si lo es
                const agency = customers.find((p) =>
                  p?.clientList?.some((c) => c.id === person.owner)
                ); // Buscamos si es un cliente de agencia
                if (agency) customer = agency; // Si lo es que lo guarde en clientes si no el parametro cliente queda null
              } else customer = individual; // Si lo es pasamos el dato al cliente
            }

            return {
              ...person,
              type: item.type,
              groupID: ref,
              nomenclatureID: item.id,
              reservationID: item.ref,
              days: item.days,
              zone,
              nomenclature,
              creationDate: item.creationDate,
              start: item.start,
              customer: person.owner ? customer : null,
            };
          });
      });

      const accommodation = accommodationReservations
        .filter((r) => everybody || (!r.checkOut && r.checkIn))
        .flatMap((item) => {
          const { nomenclature, ref } = nomenclatures.find(
            (n) => n.id === item.ref
          );
          const { name: zone } = zones.find((g) => g.ref === ref);
          let customer = null;
          if (item.owner) {
            // Vemos si tiene afiliacion con cliente
            const individual = customers.find((p) => p.id === item.owner); // Buscamos si es un cliente individual
            if (!individual) {
              // Comprovamos si lo es
              const agency = customers.find((p) =>
                p?.clientList?.some((c) => c.id === item.owner)
              ); // Buscamos si es un cliente de agencia
              if (agency) customer = agency; // Si lo es que lo guarde en clientes si no el parametro cliente queda null
            } else customer = individual; // Si lo es pasamos el dato al cliente
          }

          return {
            ...item,
            groupID: ref,
            nomenclatureID: item.ref,
            reservationID: item.id,
            zone,
            nomenclature,
            customer: item.owner ? customer : null,
          };
        });

      const union = [...accommodation, ...standard];
      const organized = union.sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
      });

      const location = nomenclatures
        .filter((n) => n.ref === zoneSelected || !zoneSelected)
        .flatMap((item) => {
          const zone = zones.find((z) => z.ref === item.ref);
          const hosted = organized.filter((r) => r.ref === item.id);

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
              if (filters.type && h.type !== filters.type) return;

              return h;
            }
          }),
        }));
        setLocation(locationWithSearch);
      } else setLocation(location);
    }, [
      search,
      filters,
      standardReservations,
      accommodationReservations,
      everybody,
    ]);

    return (
      <View style={{ height: SCREEN_HEIGHT / 1.55 }}>
        <View style={styles.row}>
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
            marginVertical: 10,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TextStyle
            smallParagraph
            color={light.main2}
            style={{ marginRight: 6 }}
          >
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
                  <GuestTable
                    hosted={item.hosted}
                    tableOptions={{ group: false }}
                  />
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
        <Modal
          animationType="fade"
          transparent={true}
          visible={activeFilter}
          onRequestClose={() => setActiveFilter(!activeFilter)}
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
                    onPress={() => setActiveFilter(!activeFilter)}
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
                <FullFilterDate
                  title="Por fecha (CHECK IN)"
                  defaultValue={{
                    day: filters.dayCheckIn,
                    month: filters.monthCheckIn,
                    year: filters.yearCheckIn,
                  }}
                  onChangeDay={(value) =>
                    setFilters({ ...filters, dayCheckIn: value })
                  }
                  onChangeMonth={(value) =>
                    setFilters({ ...filters, monthCheckIn: value })
                  }
                  onChangeYear={(value) =>
                    setFilters({ ...filters, yearCheckIn: value })
                  }
                />
                <FullFilterDate
                  title="Por fecha (CREACIÓN)"
                  increment={5}
                  defaultValue={{
                    day: filters.dayCreation,
                    month: filters.monthCreation,
                    year: filters.yearCreation,
                  }}
                  onChangeDay={(value) =>
                    setFilters({ ...filters, dayCreation: value })
                  }
                  onChangeMonth={(value) =>
                    setFilters({ ...filters, monthCreation: value })
                  }
                  onChangeYear={(value) =>
                    setFilters({ ...filters, yearCreation: value })
                  }
                />
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
                      setActiveFilter(!activeFilter);
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
      <View style={{ height: SCREEN_HEIGHT / 1.55 }}>
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
            const currenDate = {
              day: new Date().getDate(),
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
            };

            const hosted = nomenclatures
              .filter((n) => n.ref === item.ref)
              .reduce((a, n) => {
                const value =
                  n.type === "standard"
                    ? standardReservations.reduce((a, r) => {
                        const value = r.hosted.reduce((a, b) => {
                          if (
                            r.id === n.id &&
                            !dateValidation(new Date(b.checkIn), currenDate)
                          )
                            return a + 1;
                          return a;
                        }, 0);
                        return a + value;
                      }, 0)
                    : accommodationReservations.reduce((a, b) => {
                        if (
                          b.ref === n.id &&
                          !dateValidation(new Date(b.checkIn), currenDate)
                        )
                          return a + 1;
                        return a;
                      }, 0);

                return a + value;
              }, 0);

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
                  navigation.navigate("Place", {
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
                  {item?.description && (
                    <TextStyle
                      verySmall
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Descripción: {item?.description}
                    </TextStyle>
                  )}
                  {item?.location && (
                    <TextStyle
                      verySmall
                      color={mode === "light" ? light.textDark : dark.textWhite}
                    >
                      Ubicación: {item?.location}
                    </TextStyle>
                  )}
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
                    Alojados actuales:{" "}
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
    <Layout>
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
                        width: SCREEN_WIDTH / 2.8,
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
          const nom = nomenclatures.find((n) => n.id === nomenclatureID);

          if (reservation) {
            if (
              reservation.type === "standard" &&
              nom.people === reservation?.hosted?.length
            )
              return Alert.alert(
                "OOPS",
                "Ha superado el monto máximo de huéspedes permitidos en la habitación"
              );

            setDaySelected(data.day);
            setReservationSelected(reservation);
            setModalVisiblePeople(!modalVisiblePeople);
          } else {
            navigation.navigate("CreateReserve", {
              year: data.year,
              day: data.day,
              month: data.month,
              place: nom,
            });
            cleanData();
          }
        }}
      />
      <AddPerson
        modalVisible={modalVisiblePeople}
        setModalVisible={setModalVisiblePeople}
        handleSubmit={(data) => saveHosted(data)}
        discount={reservationSelected?.type === "accommodation"}
        type={reservationSelected?.type}
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
  table: {
    width: 120,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
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

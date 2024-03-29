import { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { getFontSize } from "@helpers/libs";
import Ionicons from "@expo/vector-icons/Ionicons";
import GuestTable from "@components/GuestTable";
import FilterHosted from "@utils/accommodation/FilterHosted";
import InputStyle from "@components/InputStyle";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Layout from "@components/Layout";
import theme from "@theme";

const { light, dark } = theme();
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Reservations = () => {
  const zones = useSelector((state) => state.zones);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const standardReservations = useSelector((state) => state.standardReservations);
  const mode = useSelector((state) => state.mode);

  const [hosted, setHosted] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(false);

  const initialState = {
    active: false,
    zone: "",
    nomenclature: "",
    type: "",
    minDays: "",
    maxDays: "",
    dayCreation: "all",
    monthCreation: "all",
    yearCreation: "all",
  };
  const [filters, setFilters] = useState(initialState);
  const [nomenclaturesToChoose, setNomenclaturesToChoose] = useState([]);
  const [type, setType] = useState("scheduled");

  const getBackgroundColor = (mode) => (mode === "light" ? dark.main2 : light.main5);
  const backgroundColor = useMemo(() => getBackgroundColor(mode), [mode]);
  const getTextColor = (mode) => (mode === "light" ? dark.textWhite : light.textDark);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const dateValidation = (date, dateCompare) => {
    let error = false;
    if (dateCompare.day !== "all" && date.getDate() !== dateCompare.day) error = true;
    if (dateCompare.month !== "all" && date.getMonth() + 1 !== dateCompare.month) error = true;
    if (dateCompare.year !== "all" && date.getFullYear() !== dateCompare.year) error = true;
    return error;
  };

  useEffect(() => {
    if (zones.length > 0) {
      const nomenclaturesFound = nomenclatures.filter((n) => n.ref === filters.zone);
      setNomenclaturesToChoose(nomenclaturesFound);
    }
  }, [filters.zone]);

  useEffect(() => {
    const condition = (r) =>
      r.owner && type === "scheduled"
        ? !r.checkIn
        : type === "check-in"
        ? !r.checkOut && r.checkIn
        : r.checkIn && r.checkOut;

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
    const standard = standardReservations.filter(condition).flatMap((s) =>
      s.hosted.map((h) => {
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
  }, [standardReservations, accommodationReservations, search, filters, type]);

  return (
    <Layout>
      <View style={styles.row}>
        <InputStyle
          placeholder="Nombre, Cédula, Teléfono, Email"
          value={search}
          onChangeText={(text) => setSearch(text)}
          stylesContainer={{ width: "85%", marginVertical: 0 }}
          stylesInput={styles.search}
        />
        <TouchableOpacity onPress={() => setActiveFilter(!activeFilter)}>
          <Ionicons name="filter" size={getFontSize(24)} color={light.main2} />
        </TouchableOpacity>
      </View>
      <View style={[styles.row, { marginVertical: 15 }]}>
        <ButtonStyle
          backgroundColor={type === "scheduled" ? backgroundColor : light.main2}
          style={styles.equality}
          onPress={() => setType("scheduled")}
        >
          <TextStyle color={type === "scheduled" ? textColor : light.textDark} center smallParagraph>
            AGENDADO
          </TextStyle>
        </ButtonStyle>
        <ButtonStyle
          backgroundColor={type === "check-in" ? backgroundColor : light.main2}
          style={[styles.equality, { marginHorizontal: 5 }]}
          onPress={() => setType("check-in")}
        >
          <TextStyle color={type === "check-in" ? textColor : light.textDark} center smallParagraph>
            CHECK IN
          </TextStyle>
        </ButtonStyle>
        <ButtonStyle
          backgroundColor={type === "check-out" ? backgroundColor : light.main2}
          style={styles.equality}
          onPress={() => setType("check-out")}
        >
          <TextStyle color={type === "check-out" ? textColor : light.textDark} center smallParagraph>
            CHECK OUT
          </TextStyle>
        </ButtonStyle>
      </View>
      <View>
        <View style={styles.header}>
          <TextStyle smallParagraph>LISTADO DE HUÉSPEDES</TextStyle>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ height: SCREEN_HEIGHT / 1.55 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <GuestTable hosted={hosted} />
          </ScrollView>
        </ScrollView>
      </View>
      <FilterHosted
        modalVisible={activeFilter}
        setModalVisible={setActiveFilter}
        setFilters={setFilters}
        filters={filters}
        initialState={initialState}
        nomenclaturesToChoose={nomenclaturesToChoose}
        checkIn={false}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  equality: {
    width: "auto",
    flexGrow: 1,
  },
  search: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 18,
  },
  header: {
    width: "100%",
    backgroundColor: light.main2,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
});

export default Reservations;

import { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useSelector } from "react-redux";
import { thousandsSystem } from "@helpers/libs";
import Card from "@utils/customer/Card";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import Filters from "@utils/customer/Filters";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const { light, dark } = theme();

const Customer = ({ navigation }) => {
  const mode = useSelector((state) => state.mode);
  const customers = useSelector((state) => state.customers);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const orders = useSelector((state) => state.orders);

  const [people, setPeople] = useState(null);
  const [activeSearch, setActiveSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState(false);
  const [search, setSearch] = useState("");
  const initialState = {
    active: false,
    type: "",
    minSubClient: "",
    maxSubClient: "",
    minReservation: "",
    maxReservation: "",
    minDebt: "",
    maxDebt: "",
    identification: "",
    activeReservation: false,
    activeDebt: false,
    day: "all",
    month: "all",
    year: "all",
  };
  const [filters, setFilters] = useState(initialState);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const dateValidation = (date, dateCompare) => {
    let error = false;
    if (dateCompare.day !== "all" && date.getDate() !== dateCompare.day) error = true;
    if (dateCompare.month !== "all" && date.getMonth() + 1 !== dateCompare.month) error = true;
    if (dateCompare.year !== "all" && date.getFullYear() !== dateCompare.year) error = true;
    return error;
  };

  useEffect(() => {
    setPeople(null);
    if (search || filters) {
      const customersFiltered = customers.filter((customer) => {
        const firstCondition =
          customer.name.toLowerCase()?.includes(search.toLowerCase()) ||
          customer.identification?.includes(search) ||
          thousandsSystem(customer.identification)?.includes(search);

        let secondCondition;

        if (customer.special) {
          secondCondition = customer.clientList.some(
            (c) =>
              c.name.toLowerCase()?.includes(search.toLocaleLowerCase()) ||
              c.identification?.includes(search) ||
              thousandsSystem(c.identification)?.includes(search)
          );
        }

        if (firstCondition || secondCondition) {
          if (!filters.active) return customer;
          if (
            dateValidation(new Date(customer.creationDate), {
              day: filters.day,
              month: filters.month,
              year: filters.year,
            })
          )
            return;
          if (filters.identification === "yes-identification" && !customer.identification) return;
          if (filters.identification === "no-identification" && customer.identification) return;
          if (filters.type === "customer") {
            if (customer.special) return;
            if (filters.activeReservation) {
              const hostedStandard = standardReservations.find((s) =>
                s.hosted.some((h) => h.owner === customer.id)
              );
              const hostedAccommodation = accommodationReservations.find((a) => a.owner === customer.id);
              if (!hostedStandard && !hostedAccommodation) return;
            }
            if (filters.activeDebt) {
              const debt = orders.find((o) => o.ref === customer.id && o.status === "pending");
              if (!debt) return;
            }
          }

          if (filters.type === "agency") {
            if (!customer.special) return;

            const hostedClients = customer.clientList.filter((pc) => {
              return (
                standardReservations.some((s) => s.hosted.some((h) => h.owner === pc.id)) ||
                accommodationReservations.some((a) => a.owner === pc.id)
              );
            });

            const debts = customer.clientList.filter((pc) =>
              orders.some((o) => o.ref === pc.id && o.status === "pending")
            );

            if (filters.activeReservation && hostedClients.length !== customer.clientList.length) return;
            if (filters.activeDebt && debts.length !== customer.clientList.length) return;
            if (
              filters.minSubClient &&
              customer.clientList.length < parseInt(filters.minSubClient.replace(/\D/g, ""))
            )
              return;
            if (
              filters.maxSubClient &&
              customer.clientList.length > parseInt(filters.maxSubClient.replace(/\D/g, ""))
            )
              return;
            if (
              filters.minReservation &&
              hostedClients.length < parseInt(filters.minReservation.replace(/\D/g, ""))
            )
              return;
            if (
              filters.maxReservation &&
              hostedClients.length > parseInt(filters.maxReservation.replace(/\D/g, ""))
            )
              return;
            if (filters.minDebt && debts.length < parseInt(filters.minDebt.replace(/\D/g, ""))) return;
            if (filters.maxDebt && debts.length > parseInt(filters.maxDebt.replace(/\D/g, ""))) return;
          }

          return customer;
        }
      });
      setPeople([...customersFiltered].reverse());
    } else setPeople([...customers].reverse());
  }, [customers, search, filters, orders, standardReservations, accommodationReservations]);

  const searchRef = useRef();

  return (
    <Layout>
      <View style={styles.row}>
        <ButtonStyle
          style={{ width: SCREEN_WIDTH / 2.5, marginVertical: 0 }}
          onPress={() => navigation.navigate("CreatePerson", { type: "customer" })}
          backgroundColor={light.main2}
        >
          <TextStyle center smallParagraph>
            CREAR CLIENTE
          </TextStyle>
        </ButtonStyle>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {customers.length !== 0 && (
            <TouchableOpacity
              style={{ marginHorizontal: 4 }}
              onPress={() => {
                setActiveSearch(!activeSearch);
                setTimeout(() => searchRef.current?.focus());
              }}
            >
              <Ionicons name="search" size={35} color={light.main2} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ marginHorizontal: 4 }}
            onPress={() => navigation.navigate("CustomerInformation", { type: "general" })}
          >
            <Ionicons name="document-text" size={35} color={light.main2} />
          </TouchableOpacity>
        </View>
      </View>
      {activeSearch && (
        <View style={[styles.row, { width: "100%", marginTop: 10 }]}>
          <TouchableOpacity
            onPress={() => {
              setActiveSearch(false);
              setSearch("");
              setFilters(initialState);
            }}
          >
            <Ionicons name="close" size={30} color={textColor} />
          </TouchableOpacity>
          <InputStyle
            innerRef={searchRef}
            placeholder="Buscar (Nombre, Cédula, Cotos, Etc)"
            value={search}
            onChangeText={(text) => setSearch(text)}
            stylesContainer={{ width: "78%", marginVertical: 0 }}
            stylesInput={styles.search}
          />
          <TouchableOpacity onPress={() => setActiveFilter(!activeFilter)}>
            <Ionicons name="filter" size={30} color={light.main2} />
          </TouchableOpacity>
        </View>
      )}
      <View style={[styles.row, { marginVertical: 15 }]}>
        <ButtonStyle
          style={{ width: SCREEN_WIDTH / 2.5, marginVertical: 0 }}
          onPress={() => navigation.navigate("Charge")}
          backgroundColor={light.main2}
        >
          <TextStyle center smallParagraph>
            FACTURACIÓN
          </TextStyle>
        </ButtonStyle>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("CustomerReservations")}
          >
            <Ionicons name="bed" size={25} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("CustomerSales")}
          >
            <Ionicons name="restaurant" size={25} />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        {!people && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator color={light.main2} size="large" />
            <TextStyle style={{ marginTop: 8 }} center color={textColor}>
              CARGANDO
            </TextStyle>
          </View>
        )}
        {people?.length === 0 && (
          <TextStyle style={{ marginTop: 20 }} center color={light.main2}>
            NO HAY CLIENTES
          </TextStyle>
        )}
        {people && (
          <FlatList
            data={people}
            style={{ flexGrow: 1, maxHeight: SCREEN_HEIGHT / 1.4 }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            initialNumToRender={1}
            renderItem={({ item }) => <Card item={item} />}
          />
        )}
      </View>
      <Filters
        setActive={setActiveFilter}
        active={activeFilter}
        setFilters={setFilters}
        filters={filters}
        initialState={initialState}
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
  iconButton: {
    backgroundColor: light.main2,
    borderRadius: 2,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginHorizontal: 2,
  },
  search: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 18,
  },
});

export default Customer;

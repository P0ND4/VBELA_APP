import { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";
import { getFontSize, thousandsSystem, random } from "@helpers/libs";
import { edit as editRS } from "@features/zones/standardReservationsSlice";
import { useNavigation } from "@react-navigation/native";
import { editReservation } from "@api";
import ChooseDate from "@components/ChooseDate";
import AddPerson from "@components/AddPerson";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import Filters from "@utils/people/customer/Filters";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const { light, dark } = theme();

const Card = ({ item, activeChooseDate }) => {
  const mode = useSelector((state) => state.mode);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const standardReservations = useSelector((state) => state.standardReservations);

  const navigation = useNavigation();

  const [isOpen, setIsOpen] = useState(false);
  const [isName, setIsName] = useState(true);
  const [debt, setDebt] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => setIsName(true), [item.identification]);

  const getSalesPrice = (sales) => {
    // const found = sales.filter(
    //   (s) => s.ref === item.id || item.clientList?.some((c) => s.ref === c.id)
    // );

    // const selections = found.reduce((a, b) => [...a, ...b.selection], []);
    // const methods = selections.reduce((a, b) => [...a, ...b.method], []);

    // return methods.reduce((a, b) => {
    //   if (b.method === "credit") return a + b.total;
    //   return a;
    // }, 0);
    return 0;
  };

  const getAccommodationPrice = (accommodations) => {
    const condition = (a) => {
      const itemIds = item.special ? item.clientList.map((i) => i.id) : [item.id];
      return itemIds.some((id) => id === a.owner || a.hosted?.some((h) => h.owner === id));
    };

    const reservations = accommodations.filter((a) => a.status === "credit" && condition(a));
    const total = reservations.reduce((a, b) => a + b?.total, 0);
    const payment = reservations.reduce(
      (a, b) => a + b?.payment.reduce((a, b) => a + b.amount, 0),
      0
    );

    return total - payment;
  };

  useEffect(() => {
    // const SalesDebt = getSalesPrice(sales);
    // const OrdersDebt = getSalesPrice(orders);
    const accommodationDebt = getAccommodationPrice(accommodationReservations);
    const standardDebt = getAccommodationPrice(standardReservations);
    setDebt(accommodationDebt + standardDebt);
  }, [sales, orders, accommodationReservations, standardReservations]);

  const salesHandler = ({ item, OF }) => {
    const navigateToMenu = () => {
      navigation.navigate("CreateOrder", {
        editing: OF ? true : false,
        id: OF ? OF.id : undefined,
        ref: item.id,
        table: item.name,
        selection: OF ? OF.selection : [],
        reservation: "Cliente",
      });
    };

    const navigateToSales = () => {
      navigation.navigate("Sales", {
        ref: item.id,
        name: item.name,
      });
    };

    Alert.alert(
      "AAAAAA :)",
      "COMO NECESITO RECONSTRUIR VENTAS Y RESTAURANTE/BAR Y ME DEMORARE UN POCO PARA NO ATRASARLO MAS, LAS DEUDAS POR AHORA NO FUNCIONARAN AQUI, PORQUE AL FIN Y AL CABO LO VOY A HACER DE NUEVO",
      [
        {
          text: "ok",
          onPress: () => {
            Alert.alert(
              "VENTAS",
              "¿A cuál de estas ventas quieres ingresar?",
              [
                {
                  text: "Cancelar",
                  style: "cancel",
                },
                {
                  text: "Menú",
                  onPress: () => navigateToMenu(),
                },
                {
                  text: "Productos&Servicios",
                  onPress: () => navigateToSales(),
                },
              ],
              { cancelable: true }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const reservationHandler = ({ reservation, item }) => {
    if (reservation) {
      if (reservation.type === "accommodation")
        return navigation.navigate("AccommodationReserveInformation", {
          ids: [reservation.id],
        });
      else return navigation.navigate("StandardReserveInformation", { id: reservation.id });
    }
    activeChooseDate({ item });
  };

  const textColor = (
    condition //ESTO LO VAMOS A REUTILIZAR POR ESO ESTA ACA ARRIBA, APARTE QUE SIMPLIFICAMOS CODIGO
  ) => (condition ? light.textDark : mode === "light" ? dark.textWhite : light.textDark);

  const backgroundColor = (
    condition //ESTO LO VAMOS A REUTILIZAR POR ESO ESTA ACA ARRIBA, APARTE QUE SIMPLIFICAMOS CODIGO
  ) => (condition ? light.main2 : mode === "light" ? dark.main2 : light.main4);

  const checkReservation = ({ id }) => {
    //REVISAMOS LAS RESERVACIONES LO COLOCAMOS ACA ARRIBA PARA REUTILIZARLO
    const allReservations = [...standardReservations, ...accommodationReservations];
    return allReservations.find(
      (r) => r?.owner === id || r?.hosted?.some((h) => h.owner === id)
    );
  };

  const StandardCustomer = () => {
    const [OF, setOF] = useState(null);
    const [reservationFound, setReservationFound] = useState(null);

    useEffect(() => {
      const found = orders.find((o) => o.ref === item.id && !o.pay);
      if (found) setOF(found);
      else setOF(false);
    }, [orders]);

    useEffect(() => {
      const found = checkReservation({ id: item.id });
      if (found) setReservationFound(found);
      else setReservationFound(false);
    }, [standardReservations, accommodationReservations]);

    return (
      <View style={styles.row}>
        <ButtonStyle
          backgroundColor={backgroundColor(!OF)}
          style={{ width: SCREEN_WIDTH / 2.4 }}
          onPress={() => salesHandler({ item, OF })}
        >
          <TextStyle paragrahp center color={textColor(!OF)}>
            Ventas
          </TextStyle>
        </ButtonStyle>
        <ButtonStyle
          style={{ width: SCREEN_WIDTH / 2.4 }}
          backgroundColor={backgroundColor(!reservationFound)}
          onPress={() => reservationHandler({ reservation: reservationFound, item })}
        >
          <TextStyle paragrahp color={textColor(!reservationFound)} center>
            {reservationFound ? "Ya alojado" : "Alojamiento"}
          </TextStyle>
        </ButtonStyle>
      </View>
    );
  };

  const SpecialCustomer = ({ item }) => {
    const [isName, setIsName] = useState(true);
    const [OF, setOF] = useState(null);
    const [reservationFound, setReservationFound] = useState(null);

    useEffect(() => {
      const found = orders.find((o) => o.ref === item.id && !o.pay);
      if (found) setOF(found);
      else setOF(false);
    }, [orders]);

    useEffect(() => {
      const found = checkReservation({ id: item.id });
      if (found) setReservationFound(found);
      else setReservationFound(false);
    }, [standardReservations, accommodationReservations]);

    return (
      <View style={[styles.row, { marginVertical: 2 }]}>
        <TouchableOpacity onPress={() => item.identification && setIsName(!isName)}>
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            {isName
              ? item?.name?.slice(0, 25) + `${item?.name?.length >= 25 ? "..." : ""}`
              : thousandsSystem(item?.identification)}
          </TextStyle>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={[
              styles.swipeIcon,
              {
                backgroundColor: backgroundColor(!OF),
              },
            ]}
            onPress={() => salesHandler({ item, OF })}
          >
            <Ionicons name="card-outline" size={getFontSize(20)} color={textColor(!OF)} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.swipeIcon, { backgroundColor: backgroundColor(!reservationFound) }]}
            onPress={() => reservationHandler({ reservation: reservationFound, item })}
          >
            <Ionicons
              name="home-outline"
              size={getFontSize(20)}
              color={textColor(!reservationFound)}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const rightSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.swipeIcon, { backgroundColor: "red" }]}
        onPress={() =>
          Alert.alert(
            "PROXIMAMENTE",
            "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR"
          )
        }
      >
        <Ionicons
          name="trash"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeIcon, { backgroundColor: light.main2 }]}
        onPress={() => {
          navigation.navigate("CreatePerson", {
            type: "customer",
            person: item,
            editing: true,
          });
        }}
      >
        <Ionicons
          name="create"
          size={getFontSize(22)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
    </View>
  );

  const SwipeableValidation = ({ condition, children }) =>
    condition ? (
      <Swipeable renderRightActions={rightSwipe}>{children}</Swipeable>
    ) : (
      <View>{children}</View>
    );

  return (
    <SwipeableValidation condition={!isOpen}>
      <View
        style={[styles.card, { backgroundColor: mode === "light" ? light.main5 : dark.main2 }]}
      >
        <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.row}>
          <TouchableOpacity onPress={() => item.identification && setIsName(!isName)}>
            <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
              {isName
                ? item?.name?.slice(0, 15) + `${item?.name?.length >= 15 ? "..." : ""}`
                : thousandsSystem(item?.identification)}
            </TextStyle>
          </TouchableOpacity>
          {debt !== null ? (
            <TextStyle color={light.main2}>{thousandsSystem(debt)}</TextStyle>
          ) : (
            <ActivityIndicator size="small" color={light.main2} />
          )}
        </TouchableOpacity>
        {isOpen && (
          <View style={{ marginTop: 15 }}>
            {item.special ? (
              <FlatList
                data={item.clientList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <SpecialCustomer item={item} />}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
              />
            ) : (
              <StandardCustomer />
            )}
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() => {
                navigation.navigate("CustomerInformation", {
                  type: "individual",
                  id: item.id,
                });
              }}
            >
              <TextStyle center paragrahp>
                Detalles
              </TextStyle>
            </ButtonStyle>
          </View>
        )}
      </View>
    </SwipeableValidation>
  );
};

const Customer = ({ navigation }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);
  const customers = useSelector((state) => state.customers);
  const standardReservations = useSelector((state) => state.standardReservations);
  const nomenclatures = useSelector((state) => state.nomenclatures);

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

  const [daySelected, setDaySelected] = useState(null);
  const [nomenclatureSelected, setNomenclatureSelected] = useState(null);
  const [reservationSelected, setReservationSelected] = useState(null);
  const [modalVisibleAddPerson, setModalVisibleAddPerson] = useState(false);
  const [modalVisibleChooseDate, setModalVisibleChooseDate] = useState(false);
  const [personSelected, setPersonSelected] = useState(null);
  const [changeKey, setChangeKey] = useState(Math.random());

  // const dateValidation = (date, dateCompare) => {
  //   let error = false;
  //   if (dateCompare.day !== "all" && date.getDate() !== dateCompare.day)
  //     error = true;
  //   if (
  //     dateCompare.month !== "all" &&
  //     date.getMonth() + 1 !== dateCompare.month
  //   )
  //     error = true;
  //   if (dateCompare.year !== "all" && date.getFullYear() !== dateCompare.year)
  //     error = true;
  //   return error;
  // };

  useEffect(() => {
    setPeople(null);
    if (search || filters) {
      const customersFiltered = customers;
      setPeople([...customersFiltered].reverse());
    } else setPeople([...customers].reverse());
  }, [customers, search, filters]);

  const dispatch = useDispatch();
  const searchRef = useRef();

  const cleanModal = () => {
    setModalVisibleChooseDate(!modalVisibleChooseDate);
    setModalVisibleAddPerson(!modalVisibleAddPerson);
    setDaySelected(null);
    setReservationSelected(null);
    setNomenclatureSelected(null);
  };

  const activeChooseDate = ({ item }) => {
    setPersonSelected(item);
    setModalVisibleChooseDate(!modalVisibleChooseDate);
  };

  const saveHosted = async ({ data, cleanData }) => {
    const place = nomenclatures.find((n) => n.id === nomenclatureSelected?.id);

    data.owner = personSelected.id;
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
    data.owner = personSelected.id;
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
      <View style={styles.row}>
        <TextStyle subtitle color={mode === "light" ? light.textDark : dark.textWhite}>
          General
        </TextStyle>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {customers.length !== 0 && (
            <TouchableOpacity
              style={{ marginHorizontal: 4 }}
              onPress={() => {
                Alert.alert(
                  "PROXIMAMENTE",
                  "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR"
                );
                // setActiveSearch(!activeSearch);
                // setTimeout(() => searchRef.current?.focus());
              }}
            >
              <Ionicons name="search" size={getFontSize(28)} color={light.main2} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ marginHorizontal: 4 }}
            onPress={() => navigation.navigate("CustomerInformation", { type: "general" })}
          >
            <Ionicons name="document-text" size={getFontSize(28)} color={light.main2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginHorizontal: 4 }}
            onPress={() => navigation.navigate("CreatePerson", { type: "customer" })}
          >
            <Ionicons name="add-circle" size={getFontSize(28)} color={light.main2} />
          </TouchableOpacity>
        </View>
      </View>
      {activeSearch && (
        <View
          style={[
            styles.row,
            {
              width: "100%",
              marginTop: 10,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              setActiveSearch(false);
              setSearch("");
              setFilters(initialState);
            }}
          >
            <Ionicons
              name="close"
              size={getFontSize(24)}
              color={mode === "light" ? light.textDark : dark.textWhite}
            />
          </TouchableOpacity>
          <InputStyle
            innerRef={searchRef}
            placeholder="Buscar (Nombre, Cédula, Cotos, Etc)"
            value={search}
            onChangeText={(text) => setSearch(text)}
            stylesContainer={{ width: "78%", marginVertical: 0 }}
            stylesInput={{
              paddingHorizontal: 6,
              paddingVertical: 5,
              fontSize: 18,
            }}
          />
          <TouchableOpacity onPress={() => setActiveFilter(!activeFilter)}>
            <Ionicons name="filter" size={getFontSize(24)} color={light.main2} />
          </TouchableOpacity>
        </View>
      )}
      <View style={[styles.row, { marginVertical: 15 }]}>
        <ButtonStyle
          style={{ width: SCREEN_WIDTH / 2.5, marginVertical: 0 }}
          onPress={() => navigation.navigate("CustomerDebts")}
          backgroundColor={light.main2}
        >
          <TextStyle center smallParagraph>
            DEUDAS
          </TextStyle>
        </ButtonStyle>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              Alert.alert(
                "PROXIMAMENTE",
                "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR"
              );
              // navigation.navigate("CustomerReservations")
            }}
          >
            <Ionicons name="home" size={getFontSize(20)} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              Alert.alert(
                "PROXIMAMENTE",
                "ME DEDIQUE A RESERVACIONES, EN RESERVACIONES NO PASA ESTO XD :) EN LA PROXIMA ACTUALIZACION ESTO LO HAGO FUNCIONAR"
              );
              // navigation.navigate("CustomerSales")
            }}
          >
            <Ionicons name="ticket" size={getFontSize(20)} />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        {!people && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator color={light.main2} size="large" />
            <TextStyle
              style={{ marginTop: 8 }}
              center
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
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
            renderItem={({ item }) => <Card item={item} activeChooseDate={activeChooseDate} />}
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
      <ChooseDate
        modalVisible={modalVisibleChooseDate}
        setModalVisible={setModalVisibleChooseDate}
        onDayPress={({ data, nomenclatureID, markedDates }) => {
          const reservation = markedDates[data.dateString]?.reservation;
          const nom = nomenclatures.find((n) => n.id === nomenclatureID);

          if (reservation?.type === "standard" && nom.people === reservation?.hosted?.length)
            return Alert.alert(
              "OOPS",
              "Ha superado el monto máximo de huéspedes permitidos en la habitación"
            );

          setChangeKey(Math.random());
          setNomenclatureSelected(nom);
          setDaySelected({
            year: data.year,
            month: data.month - 1,
            day: data.day,
          });
          setReservationSelected(reservation || null);
          setModalVisibleAddPerson(!modalVisibleAddPerson);
        }}
      />
      <AddPerson
        key={changeKey}
        modalVisible={modalVisibleAddPerson}
        setModalVisible={setModalVisibleAddPerson}
        editing={{
          active: true,
          fullName: personSelected?.name,
          identification: personSelected?.identification,
        }}
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    marginVertical: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 2,
  },
  iconButton: {
    backgroundColor: light.main2,
    borderRadius: 2,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginHorizontal: 2,
  },
  swipeIcon: {
    marginHorizontal: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
});

export default Customer;

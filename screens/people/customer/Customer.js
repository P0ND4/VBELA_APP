import { useEffect, useState, useRef, useMemo } from "react";
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
import { editReservation, editUser } from "@api";
import { remove as removeC } from "@features/people/customersSlice";
import { remove as removeRA, edit as editRA } from "@features/zones/accommodationReservationsSlice";
import { updateMany as updateManyO, removeMany as removeManyO } from "@features/tables/ordersSlice";
import { updateMany as updateManyS, removeMany as removeManyS } from "@features/sales/salesSlice";
import {
  removeMany as removeManyRS,
  updateMany as updateManyRS,
} from "@features/zones/standardReservationsSlice";
import ChooseDate from "@components/ChooseDate";
import AddPerson from "@components/AddPerson";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import InputStyle from "@components/InputStyle";
import Layout from "@components/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import Filters from "@utils/customer/Filters";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const { light, dark } = theme();

const Card = ({ item, activeChooseDate }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const customers = useSelector((state) => state.customers);
  const mode = useSelector((state) => state.mode);
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
    const found = sales.filter((s) => s.ref === item.id || item.clientList?.some((c) => s.ref === c.id));

    const selections = found.reduce((a, b) => [...a, ...b.selection], []);
    const methods = selections.reduce((a, b) => [...a, ...b.method], []);

    return methods.reduce((sum, method) => (method.method === "credit" ? sum + method.total : sum), 0);
  };

  const getAccommodationPrice = (accommodations) => {
    const condition = (a) => {
      const itemIds = item.special ? item.clientList.map((i) => i.id) : [item.id];
      return itemIds.some((id) => id === a.owner || a.hosted?.some((h) => h.owner === id));
    };

    const reservations = accommodations.filter((a) => a.status === "credit" && condition(a));
    const total = reservations.reduce((a, b) => a + b?.total, 0);
    const payment = reservations.reduce((a, b) => a + b?.payment.reduce((a, b) => a + b.amount, 0), 0);

    return total - payment;
  };

  useEffect(() => {
    const salesDebt = getSalesPrice(sales);
    const ordersDebt = getSalesPrice(orders);
    const accommodationDebt = getAccommodationPrice(accommodationReservations);
    const standardDebt = getAccommodationPrice(standardReservations);
    setDebt(accommodationDebt + standardDebt + salesDebt + ordersDebt);
  }, [sales, orders, accommodationReservations, standardReservations]);

  const salesHandler = ({ item }) => {
    const navigateToMenu = () => {
      const order = orders.find((o) => o.ref === item.id && o.status === "pending");
      navigation.navigate("RestaurantCreateOrder", {
        ref: item.id,
        title: { name: "Cliente", value: item.name },
        order,
      });
    };

    const navigateToSales = () => {
      const order = sales.find((o) => o.ref === item.id && o.status === "pending");
      navigation.navigate("Sales", {
        ref: item.owner || item.id,
        title: { name: "Cliente", value: item.name },
        order,
      });
    };

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

  const textColor = (condition) =>
    condition ? light.textDark : mode === "light" ? dark.textWhite : light.textDark;

  const backgroundColor = (condition) =>
    condition ? light.main2 : mode === "light" ? dark.main2 : light.main4;

  const checkReservation = ({ id }) => {
    const allReservations = [...standardReservations, ...accommodationReservations];
    return allReservations.find((r) => r?.owner === id || r?.hosted?.some((h) => h.owner === id));
  };

  const StandardCustomer = () => {
    const [reservationFound, setReservationFound] = useState(null);

    useEffect(() => {
      const found = checkReservation({ id: item.id });
      if (found) setReservationFound(found);
      else setReservationFound(false);
    }, [standardReservations, accommodationReservations]);

    return (
      <View style={styles.row}>
        {(() => {
          const exists =
            orders.some((o) => o.ref === item.id && o.status === "pending") ||
            sales.some((o) => o.ref === item.id && o.status === "pending");

          return (
            <ButtonStyle
              backgroundColor={backgroundColor(!exists)}
              style={{ width: SCREEN_WIDTH / 2.4 }}
              onPress={() => salesHandler({ item })}
            >
              <TextStyle paragrahp center color={textColor(!exists)}>
                Ventas
              </TextStyle>
            </ButtonStyle>
          );
        })()}
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
    const [reservationFound, setReservationFound] = useState(null);

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
          {(() => {
            const exists =
              orders.some((o) => o.ref === item.id && o.status === "pending") ||
              sales.some((o) => o.ref === item.id && o.status === "pending");
            return (
              <TouchableOpacity
                style={[
                  styles.swipeIcon,
                  {
                    backgroundColor: backgroundColor(!exists),
                  },
                ]}
                onPress={() => salesHandler({ item })}
              >
                <Ionicons name="restaurant-outline" size={getFontSize(20)} color={textColor(!exists)} />
              </TouchableOpacity>
            );
          })()}
          <TouchableOpacity
            style={[styles.swipeIcon, { backgroundColor: backgroundColor(!reservationFound) }]}
            onPress={() => reservationHandler({ reservation: reservationFound, item })}
          >
            <Ionicons name="bed-outline" size={getFontSize(20)} color={textColor(!reservationFound)} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const removeCustomer = () => {
    //TODO MEJORAR ESTO
    const customerStandard = item?.special
      ? standardReservations.filter((s) => {
          s.hosted.some((h) => item.clientList.some((cc) => h.owner === cc.id));
        })
      : standardReservations.filter((s) => s.hosted.some((h) => h.owner === item.id));

    const standardHostedFilter = (c) =>
      c.hosted.filter((h) => {
        if (item.special) return item.clientList.some((cc) => h.owner === cc.id);
        else return h.owner === item.id;
      });

    const customerAccommodation = item?.special
      ? accommodationReservations.filter((a) => item.clientList.some((cc) => a.owner === cc.id))
      : accommodationReservations.filter((a) => a.owner === item.id);

    const getOrder = (orders) =>
      (item?.special
        ? orders.filter((o) => item.clientList.some((cc) => o.ref === cc.id))
        : orders.filter((o) => o.ref === item.id)
      ).map((o) => o.id);

    const customerOrders = getOrder(orders);
    const customerSales = getOrder(sales);

    const exists = () => {
      if (customerAccommodation.length || customerStandard.length) {
        if (customerOrders.length || customerSales.length) return "all";
        return "reservation";
      } else if (customerOrders.length || customerSales.length) return "sale";
      return null;
    };

    const send = async ({ reservation = null, sale = null }) => {
      let change = {};
      const standardToEdit = customerStandard.filter((c) => standardHostedFilter(c).length > 0);
      const standardToRemove = customerStandard.filter((c) => standardHostedFilter(c).length === 0);

      dispatch(removeC({ id: item.id }));
      if (reservation) {
        const ACOIDS = customerAccommodation.map((a) => a.id);
        const STAIDS = standardToRemove.map((s) => s.id);
        const standardUpdated = standardToEdit.map((s) => ({
          ...s,
          hosted: c.hosted.filter((h) =>
            item?.special ? !item.clientList.some((cc) => h.owner === cc.id) : h.owner !== item.id
          ),
        }));
        change = {
          ...change,
          reservations: {
            accommodation: accommodationReservations.filter((a) => !ACOIDS.includes(a.id)),
            standard: standardReservations
              .filter((s) => !STAIDS.includes(s.id))
              .map((s) => {
                const found = standardUpdated.find((ss) => ss.id === s.id);
                if (found) return found;
                else s;
              }),
          },
        };
        dispatch(removeRA({ ids: ACOIDS }));
        dispatch(updateManyRS({ data: standardUpdated }));
        dispatch(removeManyRS({ ids: STAIDS }));
      }

      if (sale) {
        change = {
          ...change,
          orders: orders.filter((o) => !customerOrders.includes(o.id)),
          sales: sales.filter((s) => !customerSales.includes(s.id)),
        };
        dispatch(removeManyO({ ids: customerOrders }));
        dispatch(removeManyS({ ids: customerSales }));
      }

      if (!sale && customerSales.length) {
        const salesUpdated = customerSales.map((c) => ({ ...c, ref: null }));
        change = {
          ...change,
          sales: sales.map((s) => {
            const found = salesUpdated.find((su) => su.id === s.id);
            if (found) return found;
            else s;
          }),
        };
        dispatch(updateManyS({ data: salesUpdated }));
      }

      if (!sale && customerOrders.length) {
        const ordersUpdated = customerOrders.map((c) => ({ ...c, ref: null }));
        change = {
          ...change,
          orders: orders.map((s) => {
            const found = ordersUpdated.find((su) => su.id === s.id);
            if (found) return found;
            else s;
          }),
        };
        dispatch(updateManyO({ data: ordersUpdated }));
      }

      if (!reservation && customerAccommodation.length) {
        const accommodationUpdated = customerAccommodation.map((c) => ({ ...c, owner: null }));
        change = {
          ...change,
          reservations: {
            ...change?.reservations,
            accommodation: accommodationReservations.map((a) => {
              const found = accommodationUpdated.find((au) => au.id === a.id);
              if (found) return found;
              else return a;
            }),
          },
        };
        dispatch(editRA({ data: accommodationUpdated }));
      }
      if (!reservation && standardReservations.length) {
        const standardUpdated = customerStandard.map((c) => ({
          ...c,
          hosted: c.hosted.map((h) =>
            (item?.special ? item.clientList.some((cc) => h.owner === cc.id) : h.owner === item.id)
              ? { ...h, owner: null }
              : h
          ),
        }));
        change = {
          ...change,
          reservations: {
            ...change?.reservations,
            accommodation: standardReservations.map((s) => {
              const found = standardUpdated.find((su) => su.id === s.id);
              if (found) return found;
              else return s;
            }),
          },
        };
        dispatch(updateManyRS({ data: standardUpdated }));
      }
      await editUser({
        //TODO ESTO NO DEBE SER ASI - ACOMODARLO
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        change: {
          people: { customers: customers.filter((c) => c.id !== item.id) },
          ...change,
        },
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    };

    Alert.alert(
      "ATENCIÓN",
      "¿Desea eliminar los datos de este cliente, no se podrá recuperar la infomación?",
      [
        {
          text: "No estoy seguro",
          style: "cancel",
        },
        {
          text: "Estoy seguro",
          onPress: () => {
            if (!exists()) return send({});
            if (exists() === "sale")
              return Alert.alert(
                "BIEN :)",
                "¿Desea eliminar las ventas asociada al cliente?",
                [
                  {
                    text: "No",
                    onPress: () => send({}),
                  },
                  { text: "Si", onPress: () => send({ sale: true }) },
                ],
                { cancelable: true }
              );

            if (exists() === "reservation")
              return Alert.alert(
                "BIEN :)",
                "¿Desea eliminar las reservaciones asociada al cliente?",
                [
                  {
                    text: "No",
                    onPress: () => send({}),
                  },
                  { text: "Si", onPress: () => send({ reservation: true }) },
                ],
                { cancelable: true }
              );

            return Alert.alert(
              "BIEN :)",
              "¿Desea eliminar la información asociada al cliente (Reservaciones, Ventas), o solo un dato?",
              [
                {
                  text: "No eliminar la información",
                  onPress: () => send({}),
                },
                {
                  text: "Eliminar un solo dato",
                  onPress: () => {
                    Alert.alert(
                      "OK :)",
                      "¿Cuál de las dos informaciones desea eliminar?",
                      [
                        {
                          text: "Reservaciones",
                          onPress: () => send({ reservation: true }),
                        },
                        {
                          text: "Ventas",
                          onPress: () => send({ sale: true }),
                        },
                      ],
                      { cancelable: true }
                    );
                  },
                },
                {
                  text: "Eliminar toda la información asociada",
                  onPress: () => send({}),
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

  const rightSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.swipeIcon, { backgroundColor: "red" }]}
        onPress={() => removeCustomer()}
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
      <View style={[styles.card, { backgroundColor: mode === "light" ? light.main5 : dark.main2 }]}>
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
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const orders = useSelector((state) => state.orders);
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
        <TextStyle subtitle color={textColor}>
          General
        </TextStyle>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {customers.length !== 0 && (
            <TouchableOpacity
              style={{ marginHorizontal: 4 }}
              onPress={() => {
                setActiveSearch(!activeSearch);
                setTimeout(() => searchRef.current?.focus());
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
        <View style={[styles.row, { width: "100%", marginTop: 10 }]}>
          <TouchableOpacity
            onPress={() => {
              setActiveSearch(false);
              setSearch("");
              setFilters(initialState);
            }}
          >
            <Ionicons name="close" size={getFontSize(24)} color={textColor} />
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
            onPress={() => navigation.navigate("CustomerReservations")}
          >
            <Ionicons name="bed" size={getFontSize(20)} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("CustomerSales")}
          >
            <Ionicons name="restaurant" size={getFontSize(20)} />
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
  search: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 18,
  },
});

export default Customer;

import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  editEconomy,
  removeEconomy,
  removeManyEconomy,
  removePerson,
  editUser,
} from "../api";
import ButtonStyle from "../components/ButtonStyle";
import InputStyle from "../components/InputStyle";
import Layout from "../components/Layout";
import TextStyle from "../components/TextStyle";
import {
  edit as editEco,
  remove as removeEco,
  remove as removeManyEco,
} from "../features/function/economySlice";
import { removeManyByOwner as removeMBOR } from "../features/groups/reservationsSlice";
import { removeManyByOwner as removeMBOO } from "../features/tables/ordersSlice";
import { remove as removePer } from "../features/function/peopleSlice";

import helperNotification from "../helpers/helperNotification";
import { changeDate, months, thousandsSystem } from "../helpers/libs";
import theme from "../theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const People = ({ navigation, route }) => {
  const [section, setSection] = useState("general");
  const [providers, setProviders] = useState([]);
  const [activeFilter, setActiveFilter] = useState(false);
  const [filter, setFilter] = useState("");

  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(2023);
  const [days, setDays] = useState([]);

  const user = useSelector((state) => state.user);
  const activeGroup = useSelector((state) => state.activeGroup);
  const mode = useSelector((state) => state.mode);
  const people = useSelector((state) => state.people);
  const economy = useSelector((state) => state.economy);
  const orders = useSelector((state) => state.orders);
  const groups = useSelector((state) => state.groups);
  const reservations = useSelector((state) => state.reservations);

  const userType = route.params?.type;
  const zoneRef = useRef(null);

  const dispatch = useDispatch();

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

  useEffect(() => {
    if (userType === "customer") navigation.setOptions({ title: "Cliente" });
    if (userType === "supplier") navigation.setOptions({ title: "Proveedor" });
  }, [userType]);

  const findProviders = () => {
    if (section === "general") {
      if (userType === "supplier")
        setProviders(
          [...people.filter((p) => p.type === "supplier")].reverse()
        );
      if (userType === "customer")
        setProviders(
          [...people.filter((p) => p.type === "customer")].reverse()
        );
    }
    if (section === "debt") {
      if (userType === "supplier")
        setProviders(
          [
            ...economy.filter(
              (e) => e.amount !== e.payment && e.type !== "debt"
            ),
          ].reverse()
        );

      if (userType === "customer") {
        const filter = economy.filter(
          (e) => e.type === "debt" && e.amount !== e.payment
        );

        setProviders(
          [
            ...filter.map((e) => {
              const eco = { ...e };
              const details = [];
              const reser = reservations.filter((r) => r.owner === e.ref);
              const reservationsSorted = reser.map((r) => {
                const day = new Date(r.creationDate).getDate();
                const month = new Date(r.creationDate).getMonth() + 1;

                return {
                  quantity: r.people,
                  date: `${("0" + day).slice(-2)}-${("0" + month).slice(-2)}`,
                  total: r.discount ? r.amountWithDiscount : r.amount,
                  type: "reservations",
                };
              });

              const ord = orders.filter((o) => o.ref === e.ref);
              const ordersSorted = ord.map((o) => {
                const day = new Date(o.creationDate).getDate();
                const month = new Date(o.creationDate).getMonth() + 1;
                return {
                  quantity: o.selection.reduce(
                    (a, b) => a + parseInt(b.count),
                    0
                  ),
                  date: `${("0" + day).slice(-2)}-${("0" + month).slice(-2)}`,
                  total: o.selection.reduce((a, b) => a + parseInt(b.total), 0),
                  type: "orders",
                };
              });

              const union = reservationsSorted.concat(ordersSorted);

              for (let item of union) {
                const found = details.findIndex((d) => d.date === item.date);

                if (found === -1) {
                  const data = {
                    date: item.date,
                    [item.type]: {
                      quantity: item.quantity,
                      total: item.total,
                    },
                  };
                  details.push(data);
                } else {
                  const type = details[found][item.type];
                  details[found] = {
                    ...details[found],
                    [item.type]: {
                      quantity: type
                        ? type.quantity + item.quantity
                        : item.quantity,
                      total: type ? type.total + item.total : item.total,
                    },
                  };
                }
              }
              const sorted = details.sort((a, b) => a.date > b.date);
              eco.details = sorted;
              return eco;
            }),
          ].reverse()
        );
      }
    }
  };

  useEffect(() => {
    findProviders();
  }, [people, section, economy]);

  useEffect(() => {
    if (filter.length !== 0) {
      setProviders(
        [
          ...people.filter(
            (p) =>
              (p.name.toLowerCase()?.includes(filter.toLowerCase()) ||
                p.identification?.includes(filter) ||
                thousandsSystem(p.identification)?.includes(filter)) &&
              p.type === userType
          ),
        ].reverse()
      );
    } else findProviders();
  }, [filter]);

  const deletePerson = (item) => {
    const removeP = async () => {
      dispatch(removePer({ id: item.id }));
      await removePerson({
        email: activeGroup.active ? activeGroup.email : user.email,
        id: item.id,
        groups: activeGroup.active
          ? [activeGroup.id]
          : user.helpers.map((h) => h.id),
      });
    };

    Alert.alert(
      "Oye!",
      `¿Estás seguro que desea eliminar el ${
        userType === "supplier" ? "proveedor" : "cliente"
      }?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: () => {
            Alert.alert(
              "Bien",
              `¿Quieres eliminar los datos económicos hecho por el ${
                userType === "supplier" ? "proveedor" : "cliente"
              }?`,
              [
                {
                  text: "Cancelar",
                  style: "cancel",
                },
                {
                  text: "No",
                  onPress: async () => removeP(),
                },
                {
                  text: "Si",
                  onPress: async () => {
                    removeP();
                    if (userType === "supplier") {
                      dispatch(removeManyEco({ ref: item.id }));
                      await removeManyEconomy({
                        email: activeGroup.active
                          ? activeGroup.email
                          : user.email,
                        ref: item.id,
                        groups: activeGroup.active
                          ? [activeGroup.id]
                          : user.helpers.map((h) => h.id),
                      });
                      await helperNotification(
                        activeGroup,
                        user,
                        economy.type === "expense"
                          ? "Gasto eliminado"
                          : "Compra eliminada",
                        `${
                          economy.type === "expense"
                            ? `Los gastos del proveedor ${item.name} han sido eliminados`
                            : `Las compras del proveedor ${item.name} han sido eliminadas`
                        } por ${user.email}`,
                        userType === "supplier"
                          ? "accessToSupplier"
                          : "accessToCustomer"
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const deleteEconomy = (economy) => {
    Keyboard.dismiss();
    Alert.alert(
      `¿Estás seguro que quieres eliminar ${
        economy.type === "expense"
          ? "el gasto"
          : economy.type === "purchase"
          ? "la compra"
          : "la deuda"
      }?`,
      economy.type === "debt"
        ? "Se eliminaran todos los datos hechos por este cliente. No podrá recuperar esta información una vez borrada"
        : "No podrá recuperar esta información una vez borrada",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            dispatch(removeEco({ id: economy.id }));
            if (economy.type === "debt") {
              const person = people.find((p) => p.id === economy.ref);
              dispatch(removeMBOR({ owner: person.id }));
              dispatch(removeMBOO({ ref: person.id }));
              await editUser({
                email: activeGroup.active ? activeGroup.email : user.email,
                change: {
                  reservations: reservations.filter(
                    (r) => r.owner !== person.id
                  ),
                  orders: orders.filter((o) => o.ref !== person.id),
                },
                groups: activeGroup.active
                  ? [activeGroup.id]
                  : user.helpers.map((h) => h.id),
              });
            }
            await removeEconomy({
              email: activeGroup.active ? activeGroup.email : user.email,
              id: economy.id,
              groups: activeGroup.active
                ? [activeGroup.id]
                : user.helpers.map((h) => h.id),
            });
            await helperNotification(
              activeGroup,
              user,
              economy.type === "expense"
                ? "Gasto eliminado"
                : "Compra eliminada",
              `${
                economy.type === "expense"
                  ? "Un gasto ha sido eliminado"
                  : "Una compra ha sido eliminada"
              } por ${user.email}`,
              economy.type === "debt" ? "accessToCustomer" : "accessToSupplier"
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const Provider = ({ item, type }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(true);
    const [OF, setOF] = useState(null);
    const [openDatails, setOpenDatails] = useState(false);
    const [total, setTotal] = useState(0);
    const [paid, setPaid] = useState(0);

    useEffect(() => {
      if (userType === "customer") {
        setOF(orders.find((o) => o.ref === item.id && !o.pay));
      }

      const array = economy.filter(
        (e) => e.ref === item.id && e.payment !== e.amount
      );

      setTotal(array.reduce((a, b) => a + b.amount, 0));
      setPaid(array.reduce((a, b) => a + b.payment, 0));
    }, [userType, orders]);

    const Details = () => {
      return (
        <View>
          <View style={[styles.row, styles.details]}>
            <TextStyle smallParagraph color={light.main2}>
              Fecha
            </TextStyle>
            <TextStyle smallParagraph color={light.main2}>
              Cantidad
            </TextStyle>
            <TextStyle smallParagraph color={light.main2}>
              Detalle
            </TextStyle>
            <TextStyle smallParagraph color={light.main2}>
              Valor
            </TextStyle>
          </View>
          {item.details.map((item) => (
            <View key={item.date} style={[styles.row, styles.details]}>
              <TextStyle
                smallParagraph
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                {item.date}
              </TextStyle>
              <View style={{ alignItems: "center" }}>
                {item.orders && (
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {item.orders.quantity}
                  </TextStyle>
                )}
                {item.reservations && (
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {item.reservations.quantity}
                  </TextStyle>
                )}
              </View>
              <View style={{ alignItems: "center" }}>
                {item.orders && (
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Comida
                  </TextStyle>
                )}
                {item.reservations && (
                  <TextStyle
                    smallParagraph
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    Alojamiento
                  </TextStyle>
                )}
              </View>
              <View style={{ alignItems: "center" }}>
                {item.orders && (
                  <TextStyle
                    verySmall
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {thousandsSystem(item.orders.total)}
                  </TextStyle>
                )}
                {item.reservations && (
                  <TextStyle
                    verySmall
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  >
                    {thousandsSystem(item.reservations.total)}
                  </TextStyle>
                )}
              </View>
            </View>
          ))}
        </View>
      );
    };

    const Mode = () => {
      if (type === "General")
        return (
          <>
            <View style={[styles.row, { width: "100%" }]}>
              {(!activeGroup.active ||
                (userType === "customer" && activeGroup.accessToTables) ||
                (userType === "supplier" && activeGroup.accessToSupplier)) && (
                <ButtonStyle
                  backgroundColor={
                    userType === "customer"
                      ? !OF
                        ? light.main2
                        : mode === "light"
                        ? dark.main2
                        : light.main4
                      : mode === "light"
                      ? dark.main2
                      : light.main5
                  }
                  style={{ width: SCREEN_WIDTH / 2.5 }}
                  onPress={() => {
                    if (userType === "supplier") {
                      navigation.push("CreateEconomy", {
                        type: "purchase",
                        ref: item.id,
                        owner: {
                          identification: item.identification,
                          name: item.name,
                        },
                      });
                    }

                    if (userType === "customer") {
                      navigation.push("CreateOrder", {
                        editing: OF ? true : false,
                        id: OF ? OF.id : undefined,
                        ref: item.id,
                        table: item.name,
                        selection: OF ? OF.selection : [],
                        reservation: "Cliente",
                      });
                    }
                  }}
                >
                  <TextStyle
                    paragrahp
                    color={
                      userType === "customer"
                        ? !OF
                          ? dark.textWhite
                          : mode === "light"
                          ? dark.textWhite
                          : light.textDark
                        : mode === "light"
                        ? dark.textWhite
                        : light.textDark
                    }
                  >
                    {userType === "supplier" ? "Compra / Costos" : "Menú"}
                  </TextStyle>
                </ButtonStyle>
              )}
              {(!activeGroup.active ||
                (userType === "customer" && activeGroup.accessToTables) ||
                (userType === "supplier" && activeGroup.accessToSupplier)) && (
                <ButtonStyle
                  style={{ width: SCREEN_WIDTH / 2.5 }}
                  backgroundColor={
                    userType === "customer"
                      ? light.main2
                      : mode === "light"
                      ? dark.main2
                      : light.main5
                  }
                  onPress={() => {
                    if (userType === "supplier") {
                      navigation.push("CreateEconomy", {
                        type: "expense",
                        ref: item.id,
                        owner: {
                          identification: item.identification,
                          name: item.name,
                        },
                      });
                    }

                    if (userType === "customer") zoneRef.current.focus();
                  }}
                >
                  <TextStyle
                    paragrahp
                    color={
                      userType === "customer"
                        ? dark.textWhite
                        : mode === "light"
                        ? dark.textWhite
                        : light.textDark
                    }
                  >
                    {userType === "supplier"
                      ? "Gasto / Inversión"
                      : "Alojamiento"}
                  </TextStyle>
                </ButtonStyle>
              )}
              <Picker
                ref={zoneRef}
                style={{ display: "none" }}
                onValueChange={async (i) => {
                  navigation.push("Place", {
                    ref: i.ref,
                    name: i.name,
                    days,
                    month: months[month],
                    year,
                    owner: item.id,
                  });
                }}
              >
                <Picker.Item label="SELECCIONE LA ZONA" value="" />
                {groups.map((item) => (
                  <Picker.Item key={item.ref} label={item.name} value={item} />
                ))}
              </Picker>
            </View>
            <ButtonStyle
              backgroundColor={light.main2}
              onPress={() => {
                navigation.push("PeopleInformation", {
                  type: "person",
                  userType,
                  ref: item.id,
                });
              }}
            >
              <TextStyle paragrahp>Detalles</TextStyle>
            </ButtonStyle>
          </>
        );

      if (type === "Dept")
        return (
          <>
            <View style={{ justifyContent: "center" }}>
              <View style={{ marginBottom: 20 }}>
                {item.type !== "debt" && (
                  <TextStyle color={light.main2}>
                    {item.name.toUpperCase()}
                  </TextStyle>
                )}
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Creación:{" "}
                  <TextStyle color={light.main2}>
                    {changeDate(new Date(item.creationDate))}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Modificación:{" "}
                  <TextStyle color={light.main2}>
                    {changeDate(new Date(item.modificationDate))}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Total:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(item.amount)}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Deuda:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(item.amount - item.payment)}
                  </TextStyle>
                </TextStyle>
                <TextStyle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  Pagado:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(item.payment)}
                  </TextStyle>
                </TextStyle>
              </View>
              <View>
                {openDatails && <Details />}
                {item?.details?.length > 0 && (
                  <ButtonStyle
                    style={{ width: "96%" }}
                    backgroundColor={
                      mode === "light" ? dark.main2 : light.main5
                    }
                    onPress={() => setOpenDatails(!openDatails)}
                  >
                    <TextStyle
                      paragrahp
                      color={mode === "light" ? dark.textWhite : light.textDark}
                    >
                      {openDatails ? "CERRAR DETALLES" : "MOSTRAR DETALLES"}
                    </TextStyle>
                  </ButtonStyle>
                )}
              </View>
              <View style={[styles.row, { width: "100%" }]}>
                <ButtonStyle
                  backgroundColor={mode === "light" ? dark.main2 : light.main5}
                  style={{ width: SCREEN_WIDTH / 2.5 }}
                  onPress={() =>
                    navigation.push("CreateEconomy", {
                      type: item.type,
                      pay: true,
                      item,
                      editing: true,
                    })
                  }
                >
                  <TextStyle
                    paragrahp
                    color={mode === "light" ? dark.textWhite : light.textDark}
                  >
                    Abonar
                  </TextStyle>
                </ButtonStyle>
                <ButtonStyle
                  style={{ width: SCREEN_WIDTH / 2.5 }}
                  backgroundColor={light.main2}
                  onPress={() => {
                    Alert.alert(
                      "Hey",
                      "¿Has pagado el monto restante, quieres terminar de pagar la deuda?",
                      [
                        {
                          text: "No",
                          style: "cancel",
                        },
                        {
                          text: "Si",
                          onPress: async () => {
                            const newEconomy = { ...item };
                            newEconomy.payment = item.amount;

                            dispatch(
                              editEco({ id: item.id, data: newEconomy })
                            );
                            await editEconomy({
                              email: activeGroup.active
                                ? activeGroup.email
                                : user.email,
                              economy: newEconomy,
                              groups: activeGroup.active
                                ? [activeGroup.id]
                                : user.helpers.map((h) => h.id),
                            });
                            await helperNotification(
                              activeGroup,
                              user,
                              item.type === "expense"
                                ? "Gasto pagado"
                                : "Compra pagado",
                              `${
                                item.type === "expense"
                                  ? "Un gasto ha sido pagado"
                                  : "Una compra ha sido pagado"
                              } por ${user.email}`,
                              userType === "supplier"
                                ? "accessToSupplier"
                                : "accessToCustomer"
                            );
                          },
                        },
                      ]
                    );
                  }}
                >
                  <TextStyle
                    paragrahp
                    color={mode === "light" ? dark.textWhite : light.textDark}
                  >
                    Pagado
                  </TextStyle>
                </ButtonStyle>
              </View>
            </View>
          </>
        );
    };

    const chooseNameAndIdentification = () => {
      if (type === "General") {
        return { identification: item.identification, name: item.name };
      } else {
        return {
          identification: item.owner
            ? item.owner?.identification
            : "DESCONOCIDO",
          name: item.owner ? item.owner?.name : "DESCONOCIDO",
        };
      }
    };

    return (
      <View style={{ marginVertical: 5 }}>
        <TouchableOpacity
          onPress={() => setOpen(!open)}
          style={[
            styles.row,
            styles.card,
            {
              backgroundColor: mode === "light" ? light.main5 : dark.main2,
              borderBottomEndRadius: open ? 0 : 8,
              borderBottomStartRadius: open ? 0 : 8,
            },
          ]}
        >
          <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
            {name
              ? chooseNameAndIdentification()?.name?.slice(0, 15) +
                `${
                  chooseNameAndIdentification()?.name?.length >= 15 ? "..." : ""
                }`
              : thousandsSystem(chooseNameAndIdentification()?.identification)}
          </TextStyle>
          <View style={styles.events}>
            {section !== "debt" && (
              <TextStyle color={light.main2} paragrahp>
                {total}/{paid}
              </TextStyle>
            )}
            <TouchableOpacity
              onPress={() => setName(!name)}
              style={{ marginHorizontal: 5 }}
            >
              <Ionicons
                name="git-compare"
                size={26}
                color={mode === "light" ? dark.main2 : light.main5}
              />
            </TouchableOpacity>
            {open && (
              <TouchableOpacity
                style={{ marginHorizontal: 5 }}
                onPress={() => {
                  if (type === "General") deletePerson(item);
                  else deleteEconomy(item);
                }}
              >
                <Ionicons
                  name="trash"
                  size={26}
                  color={mode === "light" ? dark.main2 : light.main5}
                />
              </TouchableOpacity>
            )}
            {open &&
              item.type !== "debt" &&
              (!activeGroup.active ||
                (userType === "customer" && activeGroup.accessToTables) ||
                (userType === "supplier" && activeGroup.accessToSupplier)) && (
                <TouchableOpacity
                  style={{ marginHorizontal: 5 }}
                  onPress={() => {
                    if (type === "General")
                      navigation.push("CreatePerson", {
                        person: item,
                        editing: true,
                      });
                    else
                      navigation.push("CreateEconomy", {
                        item,
                        editing: true,
                      });
                  }}
                >
                  <Ionicons
                    name="create"
                    size={26}
                    color={mode === "light" ? dark.main2 : light.main5}
                  />
                </TouchableOpacity>
              )}
          </View>
        </TouchableOpacity>
        {open && (
          <View
            style={[
              styles.card,
              {
                alignItems: "center",
                backgroundColor: mode === "light" ? light.main5 : dark.main2,
                borderTopEndRadius: open ? 0 : 8,
                borderTopStartRadius: open ? 0 : 8,
              },
            ]}
          >
            <Mode />
          </View>
        )}
      </View>
    );
  };

  const Debt = () => {
    return (
      <View style={{ justifyContent: "space-between", flexGrow: 1 }}>
        <View>
          <TextStyle
            subtitle
            color={mode === "light" ? light.textDark : dark.textWhite}
            customStyle={{ marginBottom: 20 }}
          >
            Deudores
          </TextStyle>
          {providers.length === 0 ? (
            <TextStyle color={light.main2} center smallSubtitle>
              No hay deudores
            </TextStyle>
          ) : (
            <ScrollView
              style={{ flexGrow: 1, maxHeight: SCREEN_HEIGHT / 1.4 }}
              showsVerticalScrollIndicator={false}
            >
              {providers.map((item) => (
                <Provider
                  key={item.id + item.modificationDate}
                  item={item}
                  type="Dept"
                />
              ))}
            </ScrollView>
          )}
        </View>
        <ButtonStyle
          backgroundColor={light.main2}
          onPress={() => setSection("general")}
        >
          General
        </ButtonStyle>
      </View>
    );
  };

  return (
    <Layout style={{ marginTop: 0 }}>
      {section === "general" ? (
        <View style={{ justifyContent: "space-between", flexGrow: 1 }}>
          <View>
            {activeFilter && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  marginBottom: 20,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setActiveFilter(false);
                    setFilter("");
                    findProviders();
                  }}
                >
                  <Ionicons
                    name="close"
                    size={30}
                    color={mode === "light" ? light.textDark : dark.textWhite}
                  />
                </TouchableOpacity>
                <InputStyle
                  placeholder="Buscar (Nombre, Cédula, Cotos, Etc)"
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
              <View style={[styles.row, { marginBottom: 20 }]}>
                <TextStyle
                  subtitle
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  General
                </TextStyle>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={{ marginHorizontal: 4 }}
                    onPress={() => setActiveFilter(true)}
                  >
                    <Ionicons name="search" size={35} color={light.main2} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginHorizontal: 4 }}
                    onPress={() =>
                      navigation.push("PeopleInformation", {
                        type: "general",
                        userType,
                      })
                    }
                  >
                    <Ionicons
                      name="document-text"
                      size={35}
                      color={light.main2}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginHorizontal: 4 }}
                    onPress={() =>
                      navigation.push("CreatePerson", { type: userType })
                    }
                  >
                    <Ionicons name="add-circle" size={35} color={light.main2} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {providers.length === 0 ? (
              <TextStyle color={light.main2} center smallSubtitle>
                No hay proveedores
              </TextStyle>
            ) : (
              <ScrollView
                style={{ flexGrow: 1, maxHeight: SCREEN_HEIGHT / 1.4 }}
                showsVerticalScrollIndicator={false}
              >
                {providers.map((item) => (
                  <Provider
                    key={item.id + item.modificationDate}
                    item={item}
                    type="General"
                  />
                ))}
              </ScrollView>
            )}
          </View>
          <ButtonStyle
            backgroundColor={light.main2}
            onPress={() => setSection("debt")}
          >
            Deudas
          </ButtonStyle>
        </View>
      ) : (
        <Debt />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  events: {
    flexDirection: "row",
    alignItems: "center",
  },
  card: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  details: {
    justifyContent: "space-around",
    marginVertical: 5,
    padding: 5,
    borderColor: light.main2,
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default People;

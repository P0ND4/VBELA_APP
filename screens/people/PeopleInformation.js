import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import Layout from "@components/Layout";
import {
  removeByEvent,
  removeMany,
  remove,
} from "@features/function/economySlice";
import { removeManyByOwner as removeMBORS } from "@features/zones/standardReservationsSlice";
import { removeManyByOwner as removeMBORA } from "@features/zones/accommodationReservationsSlice";
import { removeManyByOwner as removeMBOO } from "@features/tables/ordersSlice";
import { removeEconomy, editUser, removeManyEconomy } from "@api";
import {
  changeDate,
  thousandsSystem,
  print,
  generatePDF,
  getFontSize,
} from "@helpers/libs";
import helperNotification from "@helpers/helperNotification";

import theme from "@theme";

const light = theme.colors.light;
const dark = theme.colors.dark;

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const PeopleInformation = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const economy = useSelector((state) => state.economy);
  const helperStatus = useSelector((state) => state.helperStatus);
  const standardReservations = useSelector(
    (state) => state.standardReservations
  );
  const accommodationReservations = useSelector(
    (state) => state.accommodationReservations
  );
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);
  const user = useSelector((state) => state.user);
  const customers = useSelector((state) => state.client);
  const suppliers = useSelector((state) => state.supplier);
  const nomenclatures = useSelector((state) => state.nomenclatures);

  const [registers, setRegisters] = useState([]);
  const [textSupplier, setTextSupplier] = useState("");
  const [textCustomer, setTextCustomer] = useState("");

  const userType = route?.params?.userType;
  const type = route?.params?.type;
  const ref = route?.params?.ref;
  const dispatch = useDispatch();

  const findCustomer = (filter) => {
    setRegisters(
      [
        ...filter.map((e) => {
          const eco = { ...e };
          const clientFound = customers?.find((c) => c.id === e.ref);

          const standardReservationsSorted = standardReservations
            .filter(({ hosted }) =>
              hosted.some(
                ({ owner }) =>
                  owner === e.ref ||
                  clientFound?.clientList?.some((c) => c.id === owner)
              )
            )
            .map((reservation) => {
              return {
                reservation,
                quantity: reservation?.hosted?.length,
                date: reservation.creationDate,
                total: reservation.payment,
                type: "standard-reservations",
              };
            });

          const accommodationReservationsSorted = accommodationReservations
            .filter(
              ({ owner }) =>
                owner === e.ref ||
                clientFound?.clientList?.some((c) => c.id === owner)
            )
            .map((hosted) => {
              return {
                hosted,
                quantity: 1,
                date: hosted.creationDate,
                total:
                  hosted.payment === 0
                    ? "EN ESPERA"
                    : hosted.payment === "business"
                    ? "POR EMPRESA"
                    : hosted.payment,
                type: "accommodation-reservations",
              };
            });

          const ordersSorted = orders
            .filter(
              (o) =>
                o.ref === e.ref ||
                clientFound?.clientList?.some((c) => c.id === o.ref)
            )
            .map((order) => {
              return {
                data: order,
                quantity: order.selection.reduce(
                  (a, { count }) => a + parseInt(count),
                  0
                ),
                date: order.creationDate,
                total: order.selection.reduce(
                  (a, { paid, value }) => a + paid * value,
                  0
                ),
                type: "orders",
              };
            });

          const salesSorted = sales
            .filter(
              (s) =>
                s.ref === e.ref ||
                clientFound?.clientList?.some((c) => c.id === s.ref)
            )
            .map((sale) => {
              return {
                data: sale,
                quantity: sale.selection.reduce(
                  (a, { count }) => a + parseInt(count),
                  0
                ),
                date: sale.creationDate,
                total: sale.selection.reduce((a, { total }) => a + total, 0),
                type: "sales",
              };
            });

          const union = [
            ...accommodationReservationsSorted,
            ...ordersSorted,
            ...salesSorted,
            ...standardReservationsSorted,
          ];

          eco.details = union.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          eco.people =
            accommodationReservationsSorted?.length +
            standardReservationsSorted.reduce(
              (a, b) => a + b.reservation?.hosted?.length,
              0
            );
          eco.orders = ordersSorted?.length;
          eco.sales = salesSorted?.length;
          eco.reservations =
            accommodationReservationsSorted?.length +
            standardReservationsSorted?.length;
          return eco;
        }),
      ].reverse()
    );
  };

  useEffect(() => {
    if (type === "general") {
      if (userType === "supplier")
        setRegisters([...economy.filter((e) => e.type !== "debt")].reverse());
      if (userType === "customer") {
        const filter = economy.filter((e) => e.type === "debt");
        findCustomer(filter);
      }
    }
    if (type === "person") {
      if (userType === "supplier")
        setRegisters([...economy.filter((e) => e.ref === ref)].reverse());
      if (userType === "customer") {
        const filter = economy.filter((e) => e.ref === ref);
        findCustomer(filter);
      }
    }
  }, [economy, type, standardReservations, accommodationReservations]);

  const customerDataRemove = async (economy) => {
    const clientREF = customers.find((p) => p.id === economy.ref);
    const supplierREF = suppliers.find((p) => p.id === economy.ref);
    const person = clientREF || supplierREF;
    dispatch(removeMBORS({ owner: person?.id }));
    dispatch(removeMBORA({ owner: person?.id }));
    dispatch(removeMBOO({ ref: person?.id }));
    const newStandardReservations = standardReservations.reduce(
      (acc, reservation) => {
        const filteredHosted = reservation.hosted.filter(
          (hosted) => hosted.owner !== person.id
        );
        return filteredHosted.length
          ? [...acc, { ...reservation, hosted: filteredHosted }]
          : acc;
      },
      []
    );

    const newAccommodationReservations = accommodationReservations.reduce(
      (acc, reservation) => {
        return reservation.owner !== person.id
          ? [...acc, { ...reservation }]
          : acc;
      },
      []
    );
    await editUser({
      identifier: helperStatus.active
        ? helperStatus.identifier
        : user.identifier,
      change: {
        "reservations.standard": newStandardReservations,
        "reservations.accommodation": newAccommodationReservations,
        orders: orders.filter((o) => o.ref !== person.id),
      },
      helpers: helperStatus.active
        ? [helperStatus.id]
        : user.helpers.map((h) => h.id),
    });
  };

  const Register = ({ item }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(true);
    const [openDatails, setOpenDatails] = useState(false);

    const Details = () => {
      return (
        <View style={{ marginVertical: 15 }}>
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
                Fecha
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
                Cantidad
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
                Detalle
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
                Valor
              </TextStyle>
            </View>
          </View>
          {item.details.map((item, index) => (
            <View key={item.date + index} style={{ flexDirection: "row" }}>
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
                  verySmall
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {changeDate(new Date(item.date))}
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
                  verySmall
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {item.quantity}
                </TextStyle>
              </View>
              <TouchableOpacity
                style={[
                  styles.table,
                  {
                    borderColor:
                      mode === "light" ? light.textDark : dark.textWhite,
                  },
                ]}
                onPress={() => {
                  const accommodation =
                    item.type === "accommodation-reservations";
                  const standard = item.type === "standard-reservations";
                  const orders = item.type === "orders";
                  const sales = item.type === "sales";
                  if (orders || sales) {
                    navigation.navigate("History", {
                      item: [item.data],
                      type: sales ? "sales" : "menu",
                    });
                  }
                  if (accommodation || standard) {
                    const place = nomenclatures.find((n) => {
                      const id = accommodation
                        ? item.hosted.ref
                        : item.reservation.id;
                      return n.id === id;
                    });
                    let reservation = [];
                    if (standard) reservation.push(item.reservation);
                    if (accommodation) reservation.push(item.hosted);
                    navigation.navigate("ReserveInformation", {
                      reservation,
                      place,
                    });
                  }
                }}
              >
                <TextStyle
                  verySmall
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {item.type === "sales"
                    ? "P&S"
                    : item.type === "orders"
                    ? "Mesa"
                    : item.type === "accommodation-reservations"
                    ? "Acomodación"
                    : "Estandar"}
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
                  verySmall
                  color={mode === "light" ? light.textDark : dark.textWhite}
                >
                  {thousandsSystem(item.total)}
                </TextStyle>
              </View>
            </View>
          ))}
        </View>
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
              dispatch(remove({ id: economy.id }));
              if (economy.type === "debt") customerDataRemove(economy);
              await removeEconomy({
                identifier: helperStatus.active
                  ? helperStatus.identifier
                  : user.identifier,
                id: economy.id,
                helpers: helperStatus.active
                  ? [helperStatus.id]
                  : user.helpers.map((h) => h.id),
              });
              await helperNotification(
                helperStatus,
                user,
                economy.type === "expense"
                  ? "Gasto eliminado"
                  : "Compra eliminada",
                `${
                  economy.type === "expense"
                    ? "Un gasto ha sido eliminado"
                    : "Una compra ha sido eliminada"
                } por ${user.identifier}`,
                economy.type === "debt"
                  ? "accessToCustomer"
                  : "accessToSupplier"
              );
            },
          },
        ],
        { cancelable: true }
      );
    };

    const Mode = () => {
      return (
        <View style={{ width: "100%" }}>
          {item.type !== "debt" && (
            <TextStyle color={light.main2}>
              {item.owner.name?.toUpperCase().slice(0, 40) +
                `${item.owner.name?.length >= 40 ? "..." : ""}`}
            </TextStyle>
          )}
          <View style={styles.row}>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Creación:
            </TextStyle>
            <TextStyle color={light.main2}>
              {changeDate(new Date(item?.creationDate))}
            </TextStyle>
          </View>
          <View style={styles.row}>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Modificación:
            </TextStyle>
            <TextStyle color={light.main2}>
              {changeDate(new Date(item?.modificationDate))}
            </TextStyle>
          </View>
          {item.type === "debt" && (
            <View style={styles.row}>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Alojamiento:
              </TextStyle>
              <TextStyle color={light.main2}>
                {item.reservations ? thousandsSystem(item.reservations) : "0"}
              </TextStyle>
            </View>
          )}
          {item.type === "debt" && (
            <View style={styles.row}>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Personas alojadas:
              </TextStyle>
              <TextStyle color={light.main2}>
                {item.people ? thousandsSystem(item.people) : "0"}
              </TextStyle>
            </View>
          )}
          {item.type === "debt" && (
            <View style={styles.row}>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Ordenes realizadas/finalizadas:
              </TextStyle>
              <TextStyle color={light.main2}>
                {item.orders ? thousandsSystem(item.orders) : "0"}
              </TextStyle>
            </View>
          )}
          {item.type === "debt" && (
            <View style={styles.row}>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Compras realizadas/finalizadas:
              </TextStyle>
              <TextStyle color={light.main2}>
                {item.sales ? thousandsSystem(item.sales) : "0"}
              </TextStyle>
            </View>
          )}
          <View style={styles.row}>
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              Total:
            </TextStyle>
            <TextStyle color={light.main2}>
              {thousandsSystem(item.amount)}
            </TextStyle>
          </View>
          {item.amount !== item.payment && (
            <View style={styles.row}>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Deuda:
              </TextStyle>
              <TextStyle color={light.main2}>
                {thousandsSystem(item.amount - item.payment)}
              </TextStyle>
            </View>
          )}
          {item.amount !== item.payment && (
            <View style={styles.row}>
              <TextStyle
                color={mode === "light" ? light.textDark : dark.textWhite}
              >
                Pagado:
              </TextStyle>
              <TextStyle color={light.main2}>
                {thousandsSystem(item.payment)}
              </TextStyle>
            </View>
          )}
          <View>
            {openDatails && <Details />}
            {item?.details?.length > 0 && (
              <ButtonStyle
                style={{ marginVertical: 10 }}
                backgroundColor={mode === "light" ? dark.main2 : light.main5}
                onPress={() => setOpenDatails(!openDatails)}
              >
                <TextStyle
                  paragrahp
                  center
                  color={mode === "light" ? dark.textWhite : light.textDark}
                >
                  {openDatails ? "CERRAR DETALLES" : "MOSTRAR DETALLES"}
                </TextStyle>
              </ButtonStyle>
            )}
          </View>
        </View>
      );
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
          <TouchableOpacity
            onPress={() => {
              if (!item?.identification) return;
              setName(!name);
            }}
          >
            <TextStyle
              color={mode === "light" ? light.textDark : dark.textWhite}
            >
              {name
                ? item.name?.slice(0, 15) +
                  `${item.name?.length >= 15 ? "..." : ""}`
                : item.name
                ? thousandsSystem(item.owner?.identification)
                : "DESCONOCIDO"}
            </TextStyle>
          </TouchableOpacity>
          <View style={styles.events}>
            <TouchableOpacity
              style={{ marginHorizontal: 3 }}
              onPress={() => deleteEconomy(item)}
            >
              <Ionicons
                name="trash"
                size={getFontSize(21)}
                color={mode === "light" ? dark.main2 : light.main5}
              />
            </TouchableOpacity>
            {item.type !== "debt" && (
              <TouchableOpacity
                style={{ marginHorizontal: 3 }}
                onPress={() => {
                  navigation.navigate("CreateEconomy", {
                    item,
                    editing: true,
                  });
                }}
              >
                <Ionicons
                  name="create"
                  size={getFontSize(21)}
                  color={mode === "light" ? dark.main2 : light.main5}
                />
              </TouchableOpacity>
            )}
            {!open && (
              <TextStyle color={light.main2} bigParagraph>
                {changeDate(new Date(item.modificationDate))}
              </TextStyle>
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

  const removeEverything = () => {
    Keyboard.dismiss();
    Alert.alert(
      `¿Estás seguro que quieres eliminar todo el registro?`,
      "No podrá recuperar la información una vez borrada",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Si",
          onPress: async () => {
            if (type === "general") {
              if (userType === "supplier")
                dispatch(removeByEvent({ event: (e) => e.type !== "debt" }));
              else dispatch(removeByEvent({ event: (e) => e.type === "debt" }));
              await editUser({
                identifier: helperStatus.active
                  ? helperStatus.identifier
                  : user.identifier,
                change: {
                  economy:
                    userType === "supplier"
                      ? economy.filter(
                          (e) => e.type !== "expense" || e.type !== "purchase"
                        )
                      : economy.filter((e) => e.type !== "debt"),
                },
                helpers: helperStatus.active
                  ? [helperStatus.id]
                  : user.helpers.map((h) => h.id),
              });
            }

            if (type === "person") {
              dispatch(removeMany({ ref }));
              if (userType === "customer") customerDataRemove({ ref });
              await removeManyEconomy({
                identifier: helperStatus.active
                  ? helperStatus.identifier
                  : user.identifier,
                ref,
                helpers: helperStatus.active
                  ? [helperStatus.id]
                  : user.helpers.map((h) => h.id),
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    if (userType === "supplier") {
      setTextSupplier("");
      const text = registers.reduce((a, item) => {
        return (
          a +
          `<table style="width: 100%; border: 1px solid #444444; padding: 8px; border-radius: 8px; margin: 20px 0;">
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${
              item.owner?.name
            }</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.owner?.identification)}
            </p>
          </td>
        </tr>
        <tr/>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${item.name.toUpperCase()}</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Creación</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${changeDate(new Date(item.creationDate))}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Modificación</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${changeDate(new Date(item.modificationDate))}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Total</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.amount)}
            </p>
          </td>
        </tr>
        <tr/>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${
              item.amount !== item.payment ? "PENDIENTE" : "PAGADO"
            }</p>
          </td>
        </tr>
      </table>`
        );
      }, "");
      setTextSupplier(text);
    }

    if (userType === "customer") {
      setTextCustomer("");
      const text = registers.reduce((a, item) => {
        return (
          a +
          `<table style="width: 100%; border: 1px solid #444444; padding: 8px; border-radius: 8px; margin: 20px 0;">
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${
              item.owner?.name
            }</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.owner?.identification)}
            </p>
          </td>
        </tr>
        <tr/>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${item.name.toUpperCase()}</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Creación</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${changeDate(new Date(item.creationDate))}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Modificación</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${changeDate(new Date(item.modificationDate))}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Alojamiento</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.reservations || 0)}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Personas alojadas</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.people)}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Ordenes realizadas/finalizadas</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.orders || 0)}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Compras realizadas/finalizadas</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.sales || 0)}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">Total</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 22px; font-weight: 600;">
              ${thousandsSystem(item.amount)}
            </p>
          </td>
        </tr>
        <tr/>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 22px; font-weight: 600;">${
              item.amount !== item.payment ? "PENDIENTE" : "PAGADO"
            }</p>
          </td>
        </tr>
      </table>`
        );
      }, "");
      setTextCustomer(text);
    }
  }, [registers]);

  const htmlSupplier = `
  <html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style type="text/css">
    * {
      padding: 0;
      margin: 0;
      box-sizing: 'border-box';
      font-family: sans-serif;
      color: #444444
    }

    @page { margin: 20px; } 
  </style>
</head>

<body>
<view style="padding: 20px; width: 500px; display: block; margin: 20px auto; background-color: #FFFFFF;">
    <h2 style="text-align: center; color: #444444; font-size: 50px; font-weight: 800;">
      DETALLES
    </h2>
    <p style="text-align: center; color: #444444; font-size: 25px; font-weight: 800;">
      ${type === "general" ? "GENERAL" : "ESPECÍFICO"}
    </p>
    <view>
      ${textSupplier}
    </view>
    <p style="text-align: center; font-weight: 600; margin-top: 20px; font-size: 25px; font-weight: 600;">Total:
      ${thousandsSystem(
        registers.reduce((a, b) => (a += parseInt(b.amount)), 0)
      )}</p>
    <p style="text-align: center; font-size: 25px; font-weight: 600;">${changeDate(
      new Date()
    )} ${new Date().getHours()}:${new Date().getMinutes()}</p>
  </view>
</body>

</html>
`;

  const htmlCustomer = `
<html lang="en">

<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Document</title>
<style type="text/css">
  * {
    padding: 0;
    margin: 0;
    box-sizing: 'border-box';
    font-family: sans-serif;
    color: #444444
  }

  @page { margin: 20px; } 
</style>
</head>

<body>
<view style="padding: 20px; width: 500px; display: block; margin: 20px auto; background-color: #FFFFFF;">
  <h2 style="text-align: center; color: #444444; font-size: 50px; font-weight: 800;">
    DETALLES
  </h2>
  <p style="text-align: center; color: #444444; font-size: 25px; font-weight: 800;">
    ${type === "general" ? "GENERAL" : "ESPECÍFICO"}
  </p>
  <view>
    ${textCustomer}
  </view>
  <p style="text-align: center; font-weight: 600; margin-top: 20px; font-size: 25px; font-weight: 600;">Total:
    ${thousandsSystem(
      registers.reduce((a, b) => (a += parseInt(b.amount)), 0)
    )}</p>
  <p style="text-align: center; font-size: 25px; font-weight: 600;">${changeDate(
    new Date()
  )} ${new Date().getHours()}:${new Date().getMinutes()}</p>
</view>
</body>

</html>
`;

  return (
    <Layout style={{ marginTop: 0 }}>
      <View style={[styles.row, { marginBottom: 20 }]}>
        <TextStyle
          subtitle
          color={mode === "light" ? light.textDark : dark.textWhite}
        >
          {type === "general" ? "General" : "Específico"}
        </TextStyle>
        <View style={styles.events}>
          {registers.length > 0 && (
            <TouchableOpacity onPress={() => removeEverything()}>
              <Ionicons
                name="trash"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {registers.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                print({
                  html: userType === "supplier" ? htmlSupplier : htmlCustomer,
                })
              }
            >
              <Ionicons
                name="print"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {registers.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                generatePDF({
                  html: userType === "supplier" ? htmlSupplier : htmlCustomer,
                })
              }
            >
              <Ionicons
                name="document-attach"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {/*registers.length > 0 && (
            <TouchableOpacity>
              <Ionicons
                name="filter"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )*/}
        </View>
      </View>
      <View>
        {registers.length === 0 ? (
          <TextStyle color={light.main2} center smallSubtitle>
            No hay datos
          </TextStyle>
        ) : (
          <ScrollView
            style={{ maxHeight: SCREEN_HEIGHT / 1.3 }}
            showsVerticalScrollIndicator={false}
          >
            {registers.map((item) => (
              <Register key={item.id} item={item} />
            ))}
          </ScrollView>
        )}
      </View>
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
  table: {
    width: 83,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default PeopleInformation;

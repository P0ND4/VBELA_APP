import { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { changeDate, thousandsSystem } from "@helpers/libs";
import { edit as editRS, remove as removeRS } from "@features/zones/standardReservationsSlice";
import { edit as editRA, remove as removeRA } from "@features/zones/accommodationReservationsSlice";
import { editReservation, removeReservation } from "@api";
import { useNavigation } from "@react-navigation/native";
import PaymentManager from "@utils/reservation/information/PaymentManager";
import HostedInformation from "@utils/reservation/information/HostedInformation";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { light, dark } = theme();

const Table = ({ item, tableOptions, activePayment, openPaymentToPay }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);

  const [showInformationModal, setShowInformationModal] = useState(false);
  const [reservePayment, setReservePayment] = useState(null);
  const [toPay, setToPay] = useState(null);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => setReservePayment(item?.payment?.reduce((a, p) => a + p.amount, 0)), [item]);

  useEffect(() => {
    const amount = item.total - reservePayment || 0;
    setToPay({
      id: item.id,
      total: item.total,
      name: `${item.fullName}: ${item.total}`,
      amount: Math.max(amount, 0),
      payment: reservePayment,
      owner: item.owner,
    });
  }, [item, reservePayment]);

  const deleteReservation = async () => {
    if (item.type === "accommodation") dispatch(removeRA({ ids: [item.id] }));
    if (item.type === "standard") dispatch(removeRS({ id: item.reservationID }));
    await removeReservation({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      reservation: {
        identifier: item.type === "accommodation" ? [item.id] : item.reservationID,
        type: item.type,
      },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const deleteHosted = () => {
    Alert.alert(
      "¿Estás seguro?",
      "Se eliminarán todos los datos de esta huésped",
      [
        {
          style: "cancel",
          text: "No estoy seguro",
        },
        {
          text: "Estoy seguro",
          onPress: async () => {
            let reserveUpdated;
            if (item.type === "standard") {
              const reserve = standardReservations.find((s) => s.id === item.reservationID);
              const hostedUpdated = reserve?.hosted.filter((h) => h.id !== item.id);
              if (!hostedUpdated.length) return deleteReservation();
              const reserveUpdated = { ...reserve, hosted: hostedUpdated };
              dispatch(editRS({ id: reserve.id, data: reserveUpdated }));
            }
            if (item.type === "accommodation") return deleteReservation();

            await editReservation({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              reservation: {
                data: reserveUpdated,
                type: "standard",
              },
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const event = ({ type }) => {
    Alert.alert(
      "EY!",
      `¿Está seguro que desea ${item[type] ? "eliminar" : "activar"} el ${
        type === "checkIn" ? "CHECK IN" : "CHECK OUT"
      }?`,
      [
        {
          style: "cancel",
          text: "No",
        },
        {
          onPress: async () => {
            let reserveUpdated;
            if (item.type === "standard") {
              const reserve = standardReservations.find((s) => s.id === item.reservationID);
              const hosted = reserve.hosted.map((r) =>
                r.id === item.id ? { ...r, [type]: item[type] ? null : new Date().getTime() } : r
              );
              reserveUpdated = { ...reserve, hosted };
              dispatch(editRS({ id: reserve.id, data: reserveUpdated }));
            }

            if (item.type === "accommodation") {
              const reserve = accommodationReservations.find((s) => s.id === item.id);
              reserveUpdated = [{ ...reserve, [type]: item[type] ? null : new Date().getTime() }];
              dispatch(editRA({ data: reserveUpdated }));
            }

            await editReservation({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              reservation: {
                data: reserveUpdated,
                type: item.type,
              },
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
            });
          },
          text: "Si",
        },
      ],
      { cancelable: true }
    );
  };

  const checkStatus = () =>
    item?.status === "pending"
      ? "PENDIENTE"
      : item?.status === "credit"
      ? "POR CRÉDITO"
      : item?.status === "business"
      ? "POR EMPRESA"
      : item?.status === "paid"
      ? "PAGADO"
      : "ESPERANDO POR PAGO";

  return (
    <>
      <View style={{ flexDirection: "row" }}>
        {tableOptions.start && (
          <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
            <TextStyle smallParagraph color={textColor}>
              {changeDate(new Date(item.start))}
            </TextStyle>
          </View>
        )}
        {tableOptions.checkIn && (
          <TouchableOpacity
            onPress={() => event({ type: "checkIn" })}
            style={[styles.table, { borderColor: textColor, width: 85 }]}
          >
            <TextStyle smallParagraph color={textColor}>
              {item.checkIn ? changeDate(new Date(item.checkIn)) : "NO"}
            </TextStyle>
          </TouchableOpacity>
        )}
        {tableOptions.name && (
          <TouchableOpacity
            style={[styles.table, { borderColor: textColor, width: 100 }]}
            onLongPress={() => {
              if (item.type === "standard")
                return navigation.navigate("StandardReserveInformation", { id: item.reservationID });
              if (item.type === "accommodation")
                return navigation.navigate("AccommodationReserveInformation", { ids: [item.id] });
            }}
            onPress={() => setShowInformationModal(!showInformationModal)}
          >
            <TextStyle smallParagraph color={textColor}>
              {`${item.fullName?.slice(0, 13)}${item.fullName?.length > 13 ? "..." : ""}`}
            </TextStyle>
          </TouchableOpacity>
        )}
        {tableOptions.days && (
          <View style={[styles.table, { borderColor: textColor, width: 40 }]}>
            <TextStyle smallParagraph color={textColor}>
              {thousandsSystem(item.days || "0")}
            </TextStyle>
          </View>
        )}
        {tableOptions.group && (
          <View style={[styles.table, { borderColor: textColor, width: 90 }]}>
            <TextStyle smallParagraph color={textColor}>
              {item.group}
            </TextStyle>
          </View>
        )}
        {tableOptions.room && (
          <View style={[styles.table, { borderColor: textColor, width: 90 }]}>
            <TextStyle smallParagraph color={textColor}>
              {item.room}
            </TextStyle>
          </View>
        )}
        {tableOptions.customer && (
          <View style={[styles.table, { borderColor: textColor, width: 120 }]}>
            <TextStyle smallParagraph color={textColor}>
              {item?.customer || "NO AFILIADO"}
            </TextStyle>
          </View>
        )}
        {tableOptions.payment && (
          <TouchableOpacity
            onLongPress={() => {
              if (item.type === "standard")
                return navigation.navigate("StandardReserveInformation", { id: item.reservationID });
              item.status &&
                !["credit", "business"].includes(item.status) &&
                openPaymentToPay({ toPay });
            }}
            onPress={() => {
              if (item.type === "standard")
                return navigation.navigate("StandardReserveInformation", { id: item.reservationID });
              activePayment({ toPay, item });
            }}
            style={[styles.table, { borderColor: textColor, width: 100 }]}
          >
            <TextStyle smallParagraph color={textColor}>
              {!item?.status
                ? "ESPERANDO"
                : item.status === "paid"
                ? thousandsSystem(reservePayment || "0")
                : checkStatus()}
            </TextStyle>
          </TouchableOpacity>
        )}
      </View>
      <HostedInformation
        item={item}
        event={(type) => event({ type })}
        remove={deleteHosted}
        modalVisible={showInformationModal}
        setModalVisible={setShowInformationModal}
        settings={{ days: item.type === "accommodation" }}
        complement={() =>
          item.type === "accommodation" && (
            <>
              <TextStyle color={textColor}>
                Estado: <TextStyle color={light.main2}>{checkStatus()}</TextStyle>
              </TextStyle>
            </>
          )
        }
        showMoreRight={() =>
          item.type === "accommodation" &&
          item?.status &&
          !["credit", "business"].includes(item.status) && (
            <ButtonStyle
              style={{ flexGrow: 1, width: "auto", marginLeft: 5 }}
              backgroundColor={mode === "light" ? dark.main2 : light.main5}
              onPress={() => openPaymentToPay({ toPay })}
            >
              <TextStyle center color={mode === "light" ? dark.textWhite : light.textDark}>
                Abonar
              </TextStyle>
            </ButtonStyle>
          )
        }
        showMore={() =>
          item.type === "accommodation" && (
            <>
              <TextStyle color={textColor}>
                Costo de alojamiento:{" "}
                <TextStyle color={light.main2}>{thousandsSystem(item.total)}</TextStyle>
              </TextStyle>
              {!["credit", "business"].includes(item?.status) && (
                <TextStyle color={textColor}>
                  Deuda:{" "}
                  <TextStyle color={light.main2}>
                    {item?.total - reservePayment > 0
                      ? thousandsSystem(item?.total - reservePayment || "0")
                      : "YA PAGADO"}
                  </TextStyle>
                </TextStyle>
              )}
              {!["credit", "business"].includes(item?.status) && (
                <TextStyle color={textColor}>
                  Dinero pagado:{" "}
                  <TextStyle color={light.main2}>{thousandsSystem(reservePayment || "0")}</TextStyle>
                </TextStyle>
              )}
              {reservePayment > item?.total && (
                <TextStyle color={textColor}>
                  Propina:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(reservePayment - item?.total)}
                  </TextStyle>
                </TextStyle>
              )}
              <TextStyle color={textColor}>
                Días reservado:{" "}
                <TextStyle color={light.main2}>{thousandsSystem(item.days || "0")}</TextStyle>
              </TextStyle>
              <View>
                <TextStyle color={textColor}>Tipo de acomodación: </TextStyle>
                <View style={{ marginLeft: 10 }}>
                  {item?.accommodation?.map((a) => (
                    <TextStyle color={light.main2}>{a.name}</TextStyle>
                  ))}
                </View>
              </View>
              <TextStyle color={textColor}>
                Fecha de registro:{" "}
                <TextStyle color={light.main2}>{changeDate(new Date(item.start))}</TextStyle>
              </TextStyle>
              <TextStyle color={textColor}>
                Fecha de Finalización:{" "}
                <TextStyle color={light.main2}>{changeDate(new Date(item.end))}</TextStyle>
              </TextStyle>
            </>
          )
        }
        updateHosted={async ({ data, cleanData }) => {
          let reserveUpdated;
          const checkIn = item.checkIn && data.checkIn ? item.checkIn : data.checkIn;
          if (item.type === "standard") {
            const reserve = standardReservations.find((s) => s.id === item.reservationID);
            const hosted = reserve.hosted.find((h) => h.id === item.id);
            const hostedUpdated = { ...hosted, ...data, checkIn };
            reserveUpdated = {
              ...reserve,
              hosted: reserve.hosted.map((h) => (h.id === item.id ? hostedUpdated : h)),
            };
            dispatch(editRS({ id: reserve.id, data: reserveUpdated }));
          }

          if (item.type === "accommodation") {
            const reserve = accommodationReservations.find((a) => a.id === item.id);
            reserveUpdated = [{ ...reserve, ...data, checkIn }];
            dispatch(editRA({ data: reserveUpdated }));
          }

          cleanData();
          await editReservation({
            identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
            reservation: {
              data: reserveUpdated,
              type: item.type,
            },
            helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
          });
        }}
      />
    </>
  );
};

const GuestTable = ({ hosted, options = {} }) => {
  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);

  const tableOptions = {
    start: true,
    checkIn: true,
    name: true,
    days: true,
    group: true,
    room: true,
    customer: true,
    payment: true,
    ...options,
  };

  const [isEditPay, setEditPay] = useState(false);
  const [showPaymentManagement, setShowPaymentManagement] = useState(false);
  const [reserveToPay, setReserveToPay] = useState(null);

  const dispatch = useDispatch();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const openPaymentToPay = ({ toPay }) => {
    setReserveToPay(toPay);
    setEditPay(true);
    setShowPaymentManagement(true);
  };

  const removePayment = ({ item }) => {
    Alert.alert(
      "ALERTA",
      "¿Está seguro que desea eliminar el pago de la reservación?",
      [
        {
          text: "No estoy seguro",
          style: "cancel",
        },
        {
          text: "Estoy seguro",
          onPress: async () => {
            const reserve = accommodationReservations.find((a) => a.id === item.id);
            const reservesUpdated = [{ ...reserve, payment: [], status: null }];
            dispatch(editRA({ data: reservesUpdated }));
            await editReservation({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              reservation: {
                data: reservesUpdated,
                type: "accommodation",
              },
              helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const activePayment = ({ toPay, item }) => {
    setEditPay(false);
    const send = () => {
      setReserveToPay(toPay);
      setShowPaymentManagement(!showPaymentManagement);
    };
    if (item.status) removePayment({ item });
    else send();
  };

  const handlePayment = async ({ elements, paymentMethod, paymentByBusiness, onClose }) => {
    const r = accommodationReservations.find((a) => a.id === reserveToPay.id);
    const payment = r.payment.reduce((a, b) => a + b.amount, 0);

    let reservesUpdated;
    const found = elements.find((e) => e.id === r.id);
    const tip = found.amount > r.total - payment ? found.amount - (r.total - payment) : null;
    let status = null;

    if (r.total - payment > found.amount) status = "pending";
    if (r.total - payment === found.amount || tip) status = "paid";
    if (paymentMethod === "credit") status = "credit";
    if (paymentByBusiness) status = "business";
    if (paymentMethod !== "credit" && !paymentByBusiness) {
      reservesUpdated = [
        {
          ...r,
          status,
          payment: [...r.payment, { method: paymentMethod, amount: found.amount }],
        },
      ];
    } else reservesUpdated = [{ ...r, status }];

    setShowPaymentManagement(false);
    onClose();
    dispatch(editRA({ data: reservesUpdated }));
    await editReservation({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      reservation: {
        data: reservesUpdated,
        type: "accommodation",
      },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        {tableOptions.start && (
          <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
            <TextStyle color={light.main2} smallParagraph>
              FECHA
            </TextStyle>
          </View>
        )}
        {tableOptions.checkIn && (
          <View style={[styles.table, { borderColor: textColor, width: 85 }]}>
            <TextStyle color={light.main2} smallParagraph>
              CHECK IN
            </TextStyle>
          </View>
        )}
        {tableOptions.name && (
          <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
            <TextStyle color={light.main2} smallParagraph>
              NOMBRE
            </TextStyle>
          </View>
        )}
        {tableOptions.days && (
          <View style={[styles.table, { borderColor: textColor, width: 40 }]}>
            <TextStyle color={light.main2} smallParagraph>
              DÍAS
            </TextStyle>
          </View>
        )}
        {tableOptions.group && (
          <View style={[styles.table, { borderColor: textColor, width: 90 }]}>
            <TextStyle color={light.main2} smallParagraph>
              GRUPO
            </TextStyle>
          </View>
        )}
        {tableOptions.room && (
          <View style={[styles.table, { borderColor: textColor, width: 90 }]}>
            <TextStyle color={light.main2} smallParagraph>
              HABITACIÓN
            </TextStyle>
          </View>
        )}
        {tableOptions.customer && (
          <View style={[styles.table, { borderColor: textColor, width: 120 }]}>
            <TextStyle color={light.main2} smallParagraph>
              CLIENTE/AGENCIA
            </TextStyle>
          </View>
        )}
        {tableOptions.payment && (
          <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
            <TextStyle color={light.main2} smallParagraph>
              PAGO
            </TextStyle>
          </View>
        )}
      </View>
      <FlatList
        data={hosted}
        renderItem={({ item }) => (
          <Table
            item={item}
            tableOptions={tableOptions}
            openPaymentToPay={openPaymentToPay}
            activePayment={activePayment}
          />
        )}
        keyExtractor={(item) => item.id}
        initialNumToRender={4}
        scrollEnabled={false}
      />
      <PaymentManager
        key={showPaymentManagement}
        total={reserveToPay?.total || "0"}
        payment={reserveToPay?.payment || "0"}
        modalVisible={showPaymentManagement}
        setModalVisible={setShowPaymentManagement}
        toPay={[reserveToPay]}
        business={!isEditPay}
        paymentType={!isEditPay && reserveToPay?.owner ? "credit" : "others"}
        handleSubmit={handlePayment}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  table: {
    width: 120,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default GuestTable;

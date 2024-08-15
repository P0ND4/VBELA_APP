import { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, FlatList, TouchableNativeFeedback, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { change as changeStandard } from "@features/zones/standardReservationsSlice";
import { change as changeAccommodation } from "@features/zones/accommodationReservationsSlice";
import { change as changeOrders } from "@features/tables/ordersSlice";
import { change as changeSales } from "@features/sales/salesSlice";
import { useNavigation } from "@react-navigation/native";
import { thousandsSystem, random } from "@helpers/libs";
import { editUser } from "@api";
import Information from "@components/Information";
import InputStyle from "@components/InputStyle";
import ButtonStyle from "@components/ButtonStyle";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import CreateInvoice from "@utils/customer/debt/CreateInvoice";
import theme from "@theme";

const { light, dark } = theme();

const Table = ({ item }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const customers = useSelector((state) => state.customers);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const sales = useSelector((state) => state.sales);
  const orders = useSelector((state) => state.orders);
  const mode = useSelector((state) => state.mode);

  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState("");

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  // INFORMACIÓN PURIFICADA PARA EL PAGO
  const purifyInformation = () => {
    const customer = customers.find((c) => c.id === item.ref);
    const IDS = customer.special ? customer.clientList.map((c) => c.id) : [customer.id];

    const a = accommodationReservations?.filter((a) => item?.paymentIDS.includes(a.id));
    const s = standardReservations?.filter((s) => item?.paymentIDS.includes(s.id));
    const o = orders.filter((o) => item?.paymentIDS.includes(o.id));
    const f = sales.filter((o) => item?.paymentIDS.includes(o.id));

    // FUNCIÓN PARA REDUCCIÓN DE CODIGO EN LA PURIFICACIÓN DE LA INFORMACIÓN
    const tradeDebugged = (trade) => {
      const SHosted = s.reduce((a, b) => [...a, ...b.hosted], []);
      const exists = [...a, ...SHosted].find((ac) => ac.owner === trade.ref);
      if (!exists || exists.checkOut) return trade;
    };

    return {
      standard: s?.filter((standard) => {
        const hosted = standard.hosted.filter((h) => IDS.includes(h.owner));
        const checkOut = hosted.filter((h) => h.checkOut);
        return hosted.length === checkOut.length;
      }),
      accommodation: a?.filter((accommodation) => accommodation.checkOut),
      orders: o?.filter(tradeDebugged),
      sales: f?.filter(tradeDebugged),
    };
  };

  // ESTA FUNCION ES QUIEN ENVIA LA INFORMACION AL SERVIDOR
  const sendInformation = async ({ standard, accommodation, orders, sales }) => {
    dispatch(changeStandard(standard));
    dispatch(changeAccommodation(accommodation));
    dispatch(changeOrders(orders));
    dispatch(changeSales(sales));

    setModalVisible(false);

    await editUser({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      change: {
        orders,
        sales,
        standard,
        accommodation,
      },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  // COLOCAR TODAS LAS RESERVACIONES DEL CLIENTE COMO PAGAS
  const reservationPaymentHandler = (reservation) => {
    const payment = reservation?.payment.reduce((a, b) => a + b.amount, 0);
    const amount = Math.max(reservation.total - payment, 0);
    if (amount === 0) return reservation;
    return {
      ...reservation,
      status: "paid",
      payment: [...reservation.payment, { method: "others", amount }],
    };
  };

  // COLOCAR TODAS LAS VENTAS DEL CLIENTE COMO PAGAS
  const tradePaymentHandler = (trade) => {
    const { orders, sales } = purifyInformation();

    if (!orders.some((o) => o.id === trade.id) && !sales.some((s) => s.id === trade.id)) return trade;

    const selection = trade.selection.map((tr) => {
      const credit = tr.method.filter((c) => c.method === "credit");
      const quantity = credit.reduce((a, b) => a + b.quantity, 0);
      const total = quantity * tr.price * (1 - tr.discount || 0);

      const creditRemoved = tr.method.reduce((acc, c) => {
        if (c.method !== "credit") return [...acc, c];
        return acc;
      }, []);

      return {
        ...tr,
        status: "paid",
        method: [...creditRemoved, { id: random(6), method: "others", total, quantity }],
      };
    });

    return { ...trade, selection, status: "paid" };
  };

  // EVENTO PARA PAGARLO TODO Y ACTUALIZARLO AUTOMATICAMENTE
  const everything = async () => {
    const { standard, accommodation } = purifyInformation();

    const standardChanged = standardReservations.map((s) => {
      if (standard.some((st) => st.id === s.id)) return reservationPaymentHandler(s);
      return s;
    });

    const accommodationChanged = accommodationReservations.map((a) => {
      if (accommodation.some((ac) => ac.id === a.id)) return reservationPaymentHandler(a);
      return a;
    });

    const orderChanged = orders.map(tradePaymentHandler);
    const saleChanged = sales.map(tradePaymentHandler);

    // ENVIAMOS TODA LA INFORMACION AL SERVIDOR
    await sendInformation({
      standard: standardChanged,
      accommodation: accommodationChanged,
      orders: orderChanged,
      sales: saleChanged,
    });
  };

  // EXTRAEMOS LA DEUDA QUE TIENE EL COMERCIO
  const commerceDebtsHandler = (trades, { type }) => {
    const { orders, sales } = purifyInformation();

    const condition = ({ id, selection }) =>
      (orders.some((o) => o.id === id) || sales.some((s) => s.id === id)) &&
      selection?.some((s) => s.status === "credit");

    return trades.filter(condition).map(({ id, selection }) => {
      const methods = selection.flatMap((s) => s.method).filter((m) => m.method === "credit");
      const value = methods.reduce((a, b) => a + b.total, 0);
      return { id, value, type };
    });
  };

  // EXTRAEMOS LA DEUDA QUE TIENE LAS RESERVACIONES
  const reservationDebtsHandler = (reservations, type) =>
    reservations.map(({ id, total, payment }) => ({
      id,
      value: total - (payment?.reduce((sum, { amount }) => sum + amount, 0) || 0),
      type,
    }));

  // AQUI DEFINIMOS A QUIEN LE VAMOS A PAGAR
  const payDebts = (amount, debts) =>
    debts.reduce((transactions, debt) => {
      if (amount <= 0) return transactions;
      const paid = Math.min(amount, debt.value);
      transactions.push({ ...debt, paid });
      amount -= paid;
      return transactions;
    }, []);

  // ESTA FUNCION ES ENCARGADA DE GESTIONAR LOS PAGOS DE RESERVACIONES (ABONO)
  const paymentOfReservationDebts = (reservations, toPay) =>
    reservations.map((r) => {
      const found = toPay.find((p) => p.id === r.id);
      if (found)
        return {
          ...r,
          payment: [...r.payment, { method: "others", amount: found.paid }],
          status: found.paid === found.value ? "paid" : "pending",
        };
      return r;
    });

  // ESTA FUNCION ES ENCARGADA DE GESTIONAR LOS PAGOS DE VENTAS (ABONO)
  const paymentOfEcommerceDebts = (ecommerces, toPay) =>
    ecommerces.map((e) => {
      let { paid: amount } = toPay.find((p) => p.id === e.id) || { paid: 0 };
      if (amount <= 0) return e;

      const selection = e.selection.map((s) => {
        const getTotal = (quantity) => quantity * s.price * (1 - (s.discount || 0));
        const method = s.method.reduce((acc, m) => {
          if (m.method !== "credit" || amount <= 0) return [...acc, m];
          const paid = Math.min(amount, m.total);
          acc.push(
            m.total > paid
              ? { ...m, total: m.total - paid }
              : { ...m, method: "others", total: getTotal(s.quantity) }
          );
          amount -= paid;
          return acc;
        }, []);
        return { ...s, status: method.some((m) => m.method === "credit") ? "credit" : "paid", method };
      });
      return { ...e, selection };
    });

  const pay = async (value) => {
    const { standard, accommodation } = purifyInformation();
    // DE AQUI --------------------------------------------------------
    const orderDebt = commerceDebtsHandler(orders, { type: "orders" });
    const saleDebt = commerceDebtsHandler(sales, { type: "sales" });

    const filterReservations = (reservations) =>
      reservations.filter(({ id, total, payment }) => {
        const amount = total - (payment?.reduce((sum, { amount }) => sum + amount, 0) || 0);
        return (
          (standard.some((o) => o.id === id) || accommodation.some((s) => s.id === id)) && amount > 0
        );
      });

    const standardDebt = reservationDebtsHandler(filterReservations(standardReservations), "standard");

    const accommodationDebt = reservationDebtsHandler(
      filterReservations(accommodationReservations),
      "accommodation"
    );

    const sorted = [...orderDebt, ...saleDebt, ...standardDebt, ...accommodationDebt].sort(
      (a, b) => a.value - b.value
    );
    // HASTA AQUI DEFINIMOS QUE ES LO QUE DEBEMOS Y A QUIEN SE LO DEBEMOS Y LO ORGANIZAMOS
    // UTILIZANDO EL ESQUEMA DEL METODO CASCADA O PAGOS DE DEUDAS EN CASCADAS

    // SACAMOS A QUIEN LE VAMOS A PAGAR
    const toPay = payDebts(value, sorted);

    // AQUI ESTAN TODOS LOS PAGOS ACTUALIZADOS
    const standardChanged = paymentOfReservationDebts(standardReservations, toPay);
    const accommodationChanged = paymentOfReservationDebts(accommodationReservations, toPay);
    const orderChanged = paymentOfEcommerceDebts(orders, toPay);
    const saleChanged = paymentOfEcommerceDebts(sales, toPay);

    // ENVIAMOS TODA LA INFORMACION AL SERVIDOR
    await sendInformation({
      standard: standardChanged,
      accommodation: accommodationChanged,
      orders: orderChanged,
      sales: saleChanged,
    });
  };

  const eventHandler = () =>
    Alert.alert(
      "Forma de pago",
      `N° Factura: ${item.id} ¿Qué forma de pago desea realizar?`,
      [
        {
          style: "cancel",
          text: "Cancelar",
        },
        {
          text: "Abono",
          onPress: () => setModalVisible(!modalVisible),
        },
        {
          text: "Pago total",
          onPress: () => everything(),
        },
      ],
      { cancelable: true }
    );

  return (
    <>
      <TouchableNativeFeedback
        onPress={() => eventHandler()}
        onLongPress={() =>
          navigation.navigate("CustomerInvoice", {
            id: item.ref,
            invoice: item.id,
            paymentIDS: item.paymentIDS,
          })
        }
      >
        <View style={{ flexDirection: "row" }}>
          <View style={[styles.table, { borderColor: textColor, width: 70 }]}>
            <TextStyle color={textColor} verySmall>
              {item.id}
            </TextStyle>
          </View>
          <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
            <TextStyle color={textColor} verySmall>
              {item.name}
            </TextStyle>
          </View>
          <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
            <TextStyle color={textColor} verySmall>
              {thousandsSystem(item.value)}
            </TextStyle>
          </View>
          <View style={[styles.table, { borderColor: textColor, flexGrow: 1 }]}>
            <TextStyle color={textColor} verySmall>
              {thousandsSystem(item.expired)}
            </TextStyle>
          </View>
        </View>
      </TouchableNativeFeedback>
      <Information
        onClose={() => setValue("")}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        style={{ width: "90%" }}
        title="ABONAR"
        content={() => (
          <View>
            <TextStyle smallParagraph color={textColor}>
              La deuda pendiente para facturar es de {thousandsSystem(item.value)}
            </TextStyle>
            <InputStyle
              stylesContainer={{ borderBottomWidth: 1, borderColor: textColor }}
              placeholder="Abono"
              keyboardType="numeric"
              onChangeText={(text) => {
                const num = text.replace(/[^0-9]/g, "");
                if (num > item.value) return;
                setValue(thousandsSystem(num));
              }}
              value={value}
              maxLength={thousandsSystem(item.value).length}
            />
            <ButtonStyle
              backgroundColor={light.main2}
              style={{ opacity: value.replace(/[^0-9]/g, "") > 0 ? 1 : 0.4 }}
              onPress={() => {
                const vf = parseInt(value.replace(/[^0-9]/g, ""));
                if (!vf) return;
                Alert.alert(
                  "ATENCIÓN",
                  `¿Está seguro que desea abonar el precio ${
                    vf > item.value
                      ? `total más una propina de ${thousandsSystem(vf - item.value)}?`
                      : `de ${thousandsSystem(vf)}? ${
                          item.value - vf > 0
                            ? `quedará una deuda de ${thousandsSystem(item.value - vf)}`
                            : ""
                        }`
                  }`,
                  [
                    {
                      text: "No",
                      style: "cancel",
                    },
                    {
                      text: "Si",
                      onPress: () => {
                        setValue("");
                        if (vf >= item.value) return everything(vf);
                        return pay(vf);
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <TextStyle center>Pagar</TextStyle>
            </ButtonStyle>
          </View>
        )}
      />
    </>
  );
};

const Charge = () => {
  const mode = useSelector((state) => state.mode);
  const customers = useSelector((state) => state.customers);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const sales = useSelector((state) => state.sales);
  const orders = useSelector((state) => state.orders);
  const invoices = useSelector((state) => state.invoices);

  const [debts, setDebts] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const getTradePrice = (trades) => {
    const selections = trades.reduce((a, b) => [...a, ...b.selection], []);
    const methods = selections.reduce((a, b) => [...a, ...b.method], []);
    const credits = methods.filter((m) => m.method === "credit");
    return credits.reduce((a, b) => a + b.total, 0);
  };

  const getAccommodationPrice = (accommodations) => {
    const total = accommodations.reduce((a, b) => a + b.total, 0);
    const paid = accommodations.reduce((a, b) => a + b.payment.reduce((a, b) => a + b.amount, 0), 0);
    return Math.max(total - paid, 0);
  };

  useEffect(() => {
    const debts = invoices.map(({ id, ref, paymentIDS }) => {
      const customer = customers.find((c) => c.id === ref);
      const IDS = customer.special ? customer.clientList.map((c) => c.id) : [customer.id];

      const a = accommodationReservations?.filter((a) => paymentIDS.includes(a.id));
      const s = standardReservations?.filter((s) => paymentIDS.includes(s.id));
      const o = orders.filter((o) => paymentIDS.includes(o.id));
      const f = sales.filter((o) => paymentIDS.includes(o.id));

      const old = [...a, ...s, ...o, ...f].reduce(
        (old, { creationDate }) => (creationDate < old ? creationDate : old),
        Date.now()
      );

      const SDebugged = s?.filter((standard) => {
        const hosted = standard.hosted.filter((h) => IDS.includes(h.owner));
        const checkOut = hosted.filter((h) => h.checkOut);
        return hosted.length === checkOut.length;
      });
      const ADebugged = a?.filter((accommodation) => accommodation.checkOut);

      const OFDebugged = [...o, ...f].filter((trade) => {
        const SHosted = s.reduce((a, b) => [...a, ...b.hosted], []);
        const exists = [...a, ...SHosted].find((ac) => ac.owner === trade.ref);
        if (!exists || exists.checkOut) return trade;
      });

      const accommodationCalculation = getAccommodationPrice([...ADebugged, ...SDebugged]);
      const tradeCalculation = getTradePrice(OFDebugged);

      return {
        id,
        ref: customer.id,
        paymentIDS,
        name: customer.name,
        value: accommodationCalculation + tradeCalculation,
        expired: Math.floor((Date.now() - old) / (1000 * 60 * 60 * 24)) + 1,
      };
    });
    setDebts(debts.filter((d) => d.value > 0));
  }, [sales, orders, accommodationReservations, standardReservations, invoices]);

  return (
    <>
      <Layout>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <TextStyle subtitle color={mode === "light" ? light.textDark : dark.textWhite}>
              Facturación
            </TextStyle>
            <TextStyle smallParagraph color={textColor}>
              Valor total:{" "}
              <TextStyle smallParagraph color={light.main2}>
                {thousandsSystem(debts?.reduce((a, b) => a + b.value, 0) || "0")}
              </TextStyle>
            </TextStyle>
          </View>
          <ButtonStyle
            backgroundColor={light.main2}
            style={{ width: "auto" }}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <TextStyle center smallParagraph>
              Crear factura
            </TextStyle>
          </ButtonStyle>
        </View>
        {debts?.length === 0 && (
          <TextStyle style={{ marginTop: 20 }} color={light.main2} center smallParagraph>
            NO HAY DEUDAS PARA FACTURAR
          </TextStyle>
        )}
        {debts?.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: "row" }}>
              <View style={[styles.table, { borderColor: textColor, width: 70 }]}>
                <TextStyle color={light.main2} verySmall>
                  N° Factura
                </TextStyle>
              </View>
              <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
                <TextStyle color={light.main2} verySmall>
                  Cliente
                </TextStyle>
              </View>
              <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
                <TextStyle color={light.main2} verySmall>
                  Valor
                </TextStyle>
              </View>
              <View style={[styles.table, { borderColor: textColor, flexGrow: 1 }]}>
                <TextStyle color={light.main2} verySmall>
                  Días vencidos
                </TextStyle>
              </View>
            </View>
            <FlatList
              data={debts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <Table item={item} />}
            />
          </View>
        )}
      </Layout>
      <CreateInvoice modalVisible={modalVisible} setModalVisible={setModalVisible} />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  table: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default Charge;

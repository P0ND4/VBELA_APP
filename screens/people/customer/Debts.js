import { useState, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getFontSize, thousandsSystem, random } from "@helpers/libs";
import { Swipeable } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { edit as editO, remove as removeO } from "@features/tables/ordersSlice";
import { edit as editS, remove as removeS } from "@features/sales/salesSlice";
import { remove as removeRA } from "@features/zones/accommodationReservationsSlice";
import { remove as removeRS } from "@features/zones/standardReservationsSlice";
import { editOrder, editSale, removeReservation, removeOrder, removeSale } from "@api";
import DebtInformation from "@utils/customer/debt/Information";
import PaymentManager from "@utils/order/preview/PaymentManager";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";

const { light, dark } = theme();
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

const Card = ({ item }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [paymentManagerVisible, setPaymentManagerVisible] = useState(false);
  const [order, setOrder] = useState(null);
  const [previews, setPreviews] = useState(null);
  const [informationVisible, setInformationVisible] = useState(false);

  useEffect(() => {
    (() => {
      if (!order) return;
      const filtered = order?.selection.filter((s) => s.method.some((m) => m.method === "credit"));
      const previews = filtered.map((s) => {
        const quantity = s.method.reduce((a, b) => (b.method === "credit" ? a + b.quantity : a), 0);
        return { ...s, quantity, paid: 0 };
      });
      setPreviews(previews);
    })();
  }, [order]);

  useEffect(() => {
    if (item.details === "sale") setOrder(sales.find((s) => s.id === item.id));
    if (item.details === "order") setOrder(orders.find((o) => o.id === item.id));
  }, [item, orders, sales]);

  const leftSwipe = () => (
    <View style={{ justifyContent: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: light.main2 }]}
        onPress={() => setInformationVisible(!informationVisible)}
      >
        <Ionicons
          name="information-circle-outline"
          color={mode === "light" ? dark.main2 : light.main5}
          size={getFontSize(21)}
        />
      </TouchableOpacity>
    </View>
  );

  const remove = () => {
    const send = async () => {
      if (item.details === "accommodation" || item.details === "standard") {
        if (item.details === "accommodation") dispatch(removeRA({ ids: [item.id] }));
        else dispatch(removeRS({ id: item.id }));
        await removeReservation({
          identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
          reservation: {
            identifier: item.details === "accommodation" ? [item.id] : item.id,
            type: item.details,
          },
          helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
        });
      }

      if (item.details === "order") {
        dispatch(removeO({ id: item.id }));
        await removeOrder({
          identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
          id: item?.id,
          helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
        });
      }

      if (item.details === "sale") {
        dispatch(removeS({ id: item.id }));
        await removeSale({
          identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
          id: item?.id,
          helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
        });
      }
    };

    Alert.alert(
      "EY!",
      `¿Estás seguro que desea eliminar ${
        item.details === "accommodation" || item.details === "standard" ? "la reservación" : "la orden"
      }?`,
      [
        {
          text: "No estoy seguro",
          style: "cancel",
        },
        {
          text: "Estoy seguro",
          onPress: () => send(),
        },
      ],
      { cancelable: true }
    );
  };

  const rightSwipe = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.swipe, { marginHorizontal: 2, backgroundColor: "red" }]}
        onPress={() => remove()}
      >
        <Ionicons
          name="trash"
          size={getFontSize(21)}
          color={mode === "light" ? dark.main2 : light.main5}
        />
      </TouchableOpacity>
    </View>
  );

  const saveOrder = async ({ order, change }) => {
    const quantity = change.reduce((a, b) => a + b.quantity, 0);
    const paid = change.reduce((a, b) => a + b.paid, 0);

    if (item.details === "sale") dispatch(editS({ id: order.id, data: order }));
    else dispatch(editO({ id: order.id, data: order }));

    const orderStatus = {
      ...order,
      selection: change,
      total: change.reduce((a, b) => a + b.total, 0),
    };

    navigation.navigate("OrderStatus", {
      data: orderStatus,
      status: quantity === paid ? "paid" : "pending",
    });

    if (item.details === "sale") {
      //TODO QUE PUEDA HABER UN GESTOR DE ORDENES DE LOS 2 PARA EVIAR LA CONDICIONAL
      await editSale({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        sale: order,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    } else {
      await editOrder({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        order,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    }
  };

  return (
    <>
      <Swipeable renderLeftActions={leftSwipe} renderRightActions={rightSwipe}>
        <TouchableOpacity
          style={[
            styles.card,
            styles.row,
            { backgroundColor: mode === "light" ? light.main5 : dark.main2 },
          ]}
          onPress={() => {
            if (item.details === "accommodation")
              navigation.navigate("AccommodationReserveInformation", { ids: [item.id] });
            if (item.details === "standard")
              navigation.navigate("StandardReserveInformation", { id: item.id });
            if (item.details === "sale" || item.details === "order")
              setPaymentManagerVisible(!paymentManagerVisible);
          }}
        >
          <TextStyle color={textColor}>
            {item.details === "accommodation"
              ? "Acomodación"
              : item.details === "standard"
              ? "Estandar"
              : item.details === "sale"
              ? "P&S"
              : "Restaurante"}
          </TextStyle>
          <TextStyle color={light.main2}>{thousandsSystem(item.debt || "0")}</TextStyle>
        </TouchableOpacity>
      </Swipeable>
      {["sale", "order"].includes(item.details) && (
        <PaymentManager
          key={paymentManagerVisible}
          modalVisible={paymentManagerVisible}
          setModalVisible={setPaymentManagerVisible}
          toPay={previews || []}
          tax={order?.tax}
          tip={order?.tip}
          discount={order?.discount}
          code={order?.invoice}
          paymentMethodActive={true}
          onSubmit={async ({ change, paymentMethod }) => {
            const selection = order?.selection.map((s) => {
              const found = change.find((c) => c.id === s.id);
              if (!found) return s;
              const getTotal = (quantity) => quantity * s.price * (1 - s.discount || 0);
              const total = getTotal(found?.paid);

              let remaining = found.paid;
              const method = s.method.reduce((acc, m) => {
                if (m.method !== "credit") return [...acc, m];
                const currentQuantity = m.quantity - remaining;
                if (currentQuantity > 0) {
                  const total = getTotal(currentQuantity);
                  acc.push({ ...m, quantity: currentQuantity, total });
                  remaining = 0;
                } else remaining -= m.quantity;
                return acc;
              }, []);

              return {
                ...s,
                status: found.paid !== found.quantity ? "credit" : "paid",
                method: [
                  ...method,
                  { id: random(6), method: paymentMethod, total, quantity: found?.paid },
                ],
              };
            });
            await saveOrder({ order: { ...order, selection }, change });
          }}
        />
      )}
      <DebtInformation
        modalVisible={informationVisible}
        setModalVisible={setInformationVisible}
        item={item}
      />
    </>
  );
};

const Debts = () => {
  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const customers = useSelector((state) => state.customers);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);

  const [debts, setDebts] = useState(null);

  const getOwners = ({ condition }) => {
    const allTheCustomers = customers.flatMap((c) =>
      c.special
        ? c.clientList.map((cc) => ({ ...cc, special: true, agency: c.name, customerID: c.id }))
        : [{ ...c, customerID: c.id }]
    );
    const found = allTheCustomers.filter(condition);

    return {
      agency: found.filter((f) => f.special).map((f) => ({ name: f.agency, id: f.customerID })),
      owner: found.map((f) => ({ name: f.name, id: f.customerID })),
    };
  };

  const getSales = ({ sales, type }) => {
    return sales.reduce((result, f) => {
      const { agency, owner } = getOwners({ condition: (c) => c.id === f.ref });
      const methods = f.selection.reduce((a, b) => [...a, ...b.method], []);
      const debt = methods.reduce((a, b) => (b.method === "credit" ? a + b.total : a), 0);
      const paid = methods.reduce((a, b) => (b.method !== "credit" ? a + b.total : a), 0);
      if (debt !== 0) {
        result.push({
          id: f.id,
          details: type,
          debt,
          total: f.total,
          agency,
          owner,
          paid,
          type: type === "sale" ? "P&S" : "Restaurante",
          creationDate: f.creationDate,
          modificationDate: f.modificationDate,
        });
      }
      return result;
    }, []);
  };

  const getAccommodation = (reservations) => {
    return reservations.reduce((result, r) => {
      const { owner, agency } = getOwners({
        condition: (c) => c.id === r.owner || r?.hosted?.some((h) => h.owner === c.id),
      });
      const payment = r.payment?.reduce((a, p) => a + p.amount, 0);
      const debt = Math.max(r.total - payment, 0);

      if (debt !== 0) {
        result.push({
          id: r.id,
          details: r.type,
          debt,
          total: r.total,
          agency,
          owner,
          paid: payment,
          type: r.type === "accommodation" ? "Acomodación" : "Estandar",
          creationDate: r.creationDate,
          modificationDate: r.modificationDate,
        });
      }

      return result;
    }, []);
  };

  useEffect(() => {
    const ids = customers
      .map((c) => (c.special ? c.clientList?.map((c) => c.id) : [c.id]))
      .reduce((a, b) => a.concat(b), []);

    const condition = (a) =>
      a.status !== "business" &&
      ids.some((id) => id === a.owner || a.hosted?.some((h) => h.owner === id));

    const accommodation = standardReservations.filter((s) => condition(s));
    const standard = accommodationReservations.filter((a) => condition(a));

    const debts = [
      ...getAccommodation(accommodation),
      ...getAccommodation(standard),
      ...getSales({ sales, type: "sale" }),
      ...getSales({ sales: orders, type: "order" }),
    ].sort((a, b) => a.creationDate - b.creationDate);

    setDebts(debts);
  }, [customers, standardReservations, accommodationReservations, sales, orders]);

  return (
    <Layout>
      <View style={styles.row}>
        <TextStyle subtitle color={mode === "light" ? light.textDark : dark.textWhite}>
          Deudas
        </TextStyle>
        {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
          {debts?.length > 0 && (
            <TouchableOpacity onPress={() => removeEverything()}>
              <Ionicons
                name="trash"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {debts?.length > 0 && (
            <TouchableOpacity onPress={() => print({ html })}>
              <Ionicons
                name="print"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {debts?.length > 0 && (
            <TouchableOpacity onPress={() => generatePDF({ html })}>
              <Ionicons
                name="document-attach"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
          {debts?.length > 0 && (
            <TouchableOpacity>
              <Ionicons
                name="filter"
                size={getFontSize(28)}
                color={light.main2}
                style={{ marginHorizontal: 5 }}
              />
            </TouchableOpacity>
          )}
        </View> */}
      </View>
      <View style={{ marginTop: 20 }}>
        {!debts && (
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
        {debts?.length === 0 && (
          <TextStyle style={{ marginTop: 20 }} center color={light.main2}>
            NO HAY REGISTROS
          </TextStyle>
        )}
        {debts && (
          <FlatList
            data={debts}
            style={{
              flexGrow: 1,
              maxHeight: SCREEN_HEIGHT / 1.3,
            }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            initialNumToRender={2}
            renderItem={({ item }) => <Card item={item} />}
          />
        )}
      </View>
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
  swipe: {
    marginHorizontal: 2,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
});

export default Debts;

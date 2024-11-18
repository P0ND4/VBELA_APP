import { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { thousandsSystem, random } from "@helpers/libs";
import { add, edit } from "@features/people/invoicesSlice";
import { addInvoice, editInvoice } from "@api";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "@components/TextStyle";
import Information from "@components/Information";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const { light, dark } = theme();

const CreateInvoice = ({ modalVisible, setModalVisible, editing, onSubmit = () => {} }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);
  const invoices = useSelector((state) => state.invoices);
  const customers = useSelector((state) => state.customers);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const zones = useSelector((state) => state.zones);
  const nomenclatures = useSelector((state) => state.nomenclatures);

  const [ID, setID] = useState(editing?.ref || null);
  const [available, setAvailable] = useState(null);
  const [selected, setSelected] = useState([]);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const scrollViewRef = useRef(null);
  const dispatch = useDispatch();

  const getTradePrice = (trades) => {
    const selections = trades.reduce((a, b) => [...a, ...b.selection], []);
    const methods = selections.reduce((a, b) => [...a, ...b.method], []);
    const credits = methods.filter((m) => m.method === "credit");
    return credits.reduce((a, b) => a + b.total, 0);
  };

  const getAccommodationPrice = (accommodation) => {
    const total = accommodation.total;
    const paid = accommodation.payment.reduce((a, b) => a + b.amount, 0);
    return Math.max(total - paid, 0);
  };

  const sort = (array) => array.sort((a, b) => b.creationDate - a.creationDate);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      x: ID ? SCREEN_WIDTH * 0.747 : 0,
      animated: true,
    });

    (() => {
      const customer = customers.find((c) => c.id === ID);
      if (!(customer && ID && modalVisible)) return;

      const IDS = customer.special ? customer.clientList.map((c) => c.id) : [customer.id];

      const reviewInvoices = (id) => {
        const filtered = invoices?.filter((i) => i.ref === ID && i.id !== editing?.id);
        return !filtered.reduce((a, b) => [...a, ...b.paymentIDS], []).includes(id);
      };

      const a = accommodationReservations?.filter((a) => IDS.includes(a.owner) && reviewInvoices(a.id));
      const s = standardReservations?.filter(
        (s) => s.hosted?.some((h) => IDS.includes(h.owner)) && reviewInvoices(s.id)
      );
      const o = orders.filter((o) => IDS.includes(o.ref) && reviewInvoices(o.id));
      const f = sales.filter((o) => IDS.includes(o.ref) && reviewInvoices(o.id));

      const SDebugged = s?.filter((standard) => {
        const hosted = standard.hosted.filter((h) => IDS.includes(h.owner));
        const checkOut = hosted.filter((h) => h.checkOut);
        return hosted.length === checkOut.length;
      });
      const ADebugged = a?.filter((accommodation) => accommodation.checkOut);
      const ASUnited = [...SDebugged, ...ADebugged].filter((ac) => {
        const owner = ac?.owner ? [ac.owner] : ac.hosted.map((h) => h.owner);
        const trades = [...o, ...f].filter((trade) => owner.some((ow) => ow === trade.ref));
        return Math.max(getAccommodationPrice(ac) + getTradePrice(trades), 0) > 0;
      });

      const accommodation = ASUnited.map((ac) => {
        const owner = ac?.owner ? [ac.owner] : ac.hosted.map((h) => h.owner);
        const nom = nomenclatures.find((n) => n.id === ac.ref);
        const zon = zones.find((z) => z.id === nom?.ref);

        const trades = [...o, ...f].filter(
          (trade) => owner.some((ow) => ow === trade.ref) && getTradePrice([trade]) > 0
        );

        return {
          id: ac.id,
          details: `Alojamiento (${zon?.name}) (${nom?.nomenclature})`,
          value: getAccommodationPrice(ac) + getTradePrice(trades),
          trades: sort(trades),
          creationDate: ac?.creationDate,
        };
      });

      const noAffiliation = [...o, ...f].filter((trade) => {
        const ADebugged = a?.map((a) => a.owner);
        const SDebugged = s?.reduce((a, b) => [...a, ...b.hosted], []).map((h) => h.owner);
        return ![...ADebugged, ...SDebugged].some((owner) => trade.ref === owner);
      });

      const trade = noAffiliation.map((af) => ({
        id: af.id,
        details: af.selection.reduce((a, b) => [...a, b.name], []).join(" + "),
        value: getTradePrice([af]),
        creationDate: af.creationDate,
      }));

      setAvailable(sort([...accommodation, ...trade]));
    })();
  }, [
    ID,
    standardReservations,
    accommodationReservations,
    orders,
    sales,
    customers,
    invoices,
    modalVisible,
  ]);

  useEffect(() => {
    (() => {
      if (!editing?.paymentIDS) return;
      setSelected(available?.filter((a) => editing?.paymentIDS.includes(a.id)));
    })();
  }, [available]);

  const onSubmitEdit = async ({ selected }) => {
    if (selected.length === 0)
      return Alert.alert("Oops!", "La selección esta vacía", [], { cancelable: true });

    const found = invoices.find((i) => i.id === editing?.id);

    const paymentIDS = selected.flatMap((item) => [
      item.id,
      ...(item?.trades || []).flatMap((trade) => trade.id),
    ]);

    const invoice = {
      ...found,
      paymentIDS,
      modificationDate: Date.now(),
    };

    onSubmit(invoice);
    dispatch(edit({ data: invoice }));
    setModalVisible(!modalVisible);

    await editInvoice({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      invoice,
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitCreate = ({ selected }) => {
    const save = async () => {
      const invoiceID = random(6, { number: true });
      if (invoices.find((i) => i.id === invoiceID)) return save();

      const paymentIDS = selected.flatMap((item) => [
        item.id,
        ...(item?.trades || []).flatMap((trade) => trade.id),
      ]);

      const invoice = {
        id: invoiceID,
        ref: ID,
        paymentIDS,
        creationDate: Date.now(),
        modificationDate: Date.now(),
      };

      onSubmit(invoice);
      dispatch(add(invoice));
      setModalVisible(!modalVisible);

      Alert.alert("Factura generada", `La factura ha sido creada con el número #${invoiceID}`, [], {
        cancelable: true,
      });

      await addInvoice({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        invoice,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    };

    if (selected.length === 0)
      return Alert.alert("Oops!", "La selección esta vacía", [], { cancelable: true });

    Alert.alert(
      "¿Estás seguro?",
      `Va a facturar ${thousandsSystem(selected.length)} servicios`,
      [
        {
          text: "No estoy seguro",
          style: "cancel",
        },
        {
          text: "Estoy seguro",
          onPress: () => save(),
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  const Card = ({ item }) => {
    const [isOpen, setOpen] = useState(false);

    const exists = selected?.some((s) => s.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.customer, { backgroundColor: exists ? light.main2 : null }]}
        onLongPress={() => item?.trades?.length > 0 && setOpen(!isOpen)}
        onPress={() => {
          if (exists) setSelected(selected.filter((s) => s.id !== item.id));
          else setSelected([...selected, item]);
        }}
      >
        <View style={styles.row}>
          <TextStyle smallParagraph color={exists ? light.textDark : textColor}>
            {item.details}
          </TextStyle>
          <TextStyle smallParagraph color={exists ? light.textDark : textColor}>
            {thousandsSystem(item.value)}
          </TextStyle>
        </View>
        {isOpen &&
          item?.trades?.map((tr) => (
            <View style={styles.row}>
              <TextStyle smallParagraph color={exists ? light.textDark : textColor}>
                - {tr.selection.reduce((a, b) => [...a, b.name], []).join(" + ")}
              </TextStyle>
              <TextStyle smallParagraph color={exists ? light.textDark : textColor}>
                {thousandsSystem(getTradePrice([tr]))}
              </TextStyle>
            </View>
          ))}
      </TouchableOpacity>
    );
  };

  const sendInformation = (selected) =>
    !editing ? onSubmitCreate({ selected }) : onSubmitEdit({ selected });

  return (
    <Information
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      style={{ width: "90%" }}
      onClose={() => {
        setID(null);
        setAvailable(null);
        setSelected([]);
      }}
      title="CREAR FACTURA"
      content={() => (
        <View>
          <TextStyle smallParagraph color={textColor} style={{ marginBottom: 10 }}>
            {ID
              ? "Seleccione los servicios a facturar"
              : "Seleccione el cliente al que desea crear la factura"}
          </TextStyle>
          {ID && (
            <View style={[styles.row, { marginBottom: 5 }]}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", opacity: editing ? 0.4 : 1 }}
                onPress={() => !editing && setID(null)}
              >
                <Ionicons
                  name="arrow-back"
                  color={textColor}
                  size={25}
                  style={{ marginRight: 5 }}
                />
                <TextStyle color={textColor}>Regresar</TextStyle>
              </TouchableOpacity>
              {available?.length > 0 && (
                <ButtonStyle
                  backgroundColor={light.main2}
                  style={{ width: "auto", marginVertical: 0 }}
                  onPress={() => sendInformation(available)}
                >
                  <TextStyle center smallParagraph>
                    Facturar todo
                  </TextStyle>
                </ButtonStyle>
              )}
            </View>
          )}
          <ScrollView
            ref={scrollViewRef}
            scrollEnabled={false}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <View style={{ width: SCREEN_WIDTH * 0.747 }}>
              {!ID &&
                customers.map((c) => (
                  <TouchableOpacity
                    onPress={() => setID(c.id)}
                    style={[styles.customer, styles.row, { backgroundColor: light.main2 }]}
                  >
                    <TextStyle smallParagraph>{c.name}</TextStyle>
                    <Ionicons name="arrow-forward" size={17} />
                  </TouchableOpacity>
                ))}
            </View>
            <View style={{ width: SCREEN_WIDTH * 0.747 }}>
              {!available && (
                <ActivityIndicator
                  size={25}
                  color={light.main2}
                  style={{ alignContent: "center" }}
                />
              )}
              {available?.length === 0 && (
                <TextStyle style={{ marginTop: 20 }} color={light.main2} smallParagraph>
                  NO HAY DEUDAS PARA FACTURAR
                </TextStyle>
              )}
              <FlatList
                data={available || []}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: SCREEN_HEIGHT / 2 }}
                renderItem={({ item }) => <Card item={item} />}
              />
              {available?.length > 0 && (
                <ButtonStyle backgroundColor={light.main2} onPress={() => sendInformation(selected)}>
                  <TextStyle center smallParagraph>
                    {editing ? "Guardar" : "Facturar"} seleccionado
                  </TextStyle>
                </ButtonStyle>
              )}
            </View>
          </ScrollView>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customer: {
    borderWidth: 1,
    borderColor: light.main2,
    borderRadius: 2,
    marginVertical: 2,
    padding: 6,
  },
});

export default CreateInvoice;

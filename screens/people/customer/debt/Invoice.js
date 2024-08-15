import { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, Image, ScrollView, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { thousandsSystem, changeDate, generatePDF, print } from "@helpers/libs";
import { remove } from "@features/people/invoicesSlice";
import { removeInvoice } from "@api";
import CreateInvoice from "@utils/customer/debt/CreateInvoice";
import FloatingButton from "@components/FloatingButton";
import Logo from "@assets/logo.png";
import TextStyle from "@components/TextStyle";
import Layout from "@components/Layout";
import theme from "@theme";

const { light, dark } = theme();

const Table = ({ trade, details = "-", people = "-", days = "-", value = "-" }) => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: trade ? (mode === "light" ? light.main5 : dark.main2) : null,
      }}
    >
      <View style={[styles.table, { borderColor: textColor, width: trade ? 265 : 155 }]}>
        <TextStyle color={textColor} verySmall>
          {details}
        </TextStyle>
      </View>
      {!trade && (
        <View style={[styles.table, { borderColor: textColor, width: 70 }]}>
          <TextStyle color={textColor} verySmall>
            {thousandsSystem(people)}
          </TextStyle>
        </View>
      )}
      {!trade && (
        <View style={[styles.table, { borderColor: textColor, width: 40 }]}>
          <TextStyle color={textColor} verySmall>
            {thousandsSystem(days)}
          </TextStyle>
        </View>
      )}
      <View
        style={[
          styles.table,
          { borderColor: textColor, backgroundColor: !trade ? light.main2 : null, flexGrow: 1 },
        ]}
      >
        <TextStyle color={!trade ? light.textDark : textColor} verySmall>
          {thousandsSystem(value)}
        </TextStyle>
      </View>
    </View>
  );
};

const Invoice = ({ navigation, route }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const zones = useSelector((state) => state.zones);
  const customers = useSelector((state) => state.customers);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const sales = useSelector((state) => state.sales);
  const orders = useSelector((state) => state.orders);

  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [paymentIDS, setPaymentIDS] = useState(route.params?.paymentIDS || null);
  const [creationDate, setCreationDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [buttons, setButtons] = useState([]);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const dispatch = useDispatch();

  const id = route.params?.id;
  const invoice = route.params?.invoice;
  const everything = route.params?.everything;

  useEffect(() => {
    const customer = customers.find((c) => c.id === id);
    setCustomer(customer);
    navigation.setOptions({ title: `${customer.name}: Factura` });
  }, [customers]);

  const getTradePrice = (trades) => {
    const selections = trades.reduce((a, b) => [...a, ...b.selection], []);
    const methods = selections.reduce((a, b) => [...a, ...b.method], []);
    const credits = methods.filter((m) => m.method === "credit");
    if (everything) return trades.reduce((a, b) => a + b.total, 0);
    return credits.reduce((a, b) => a + b.total, 0);
  };

  const getAccommodationPrice = (accommodation) => {
    const total = accommodation.total;
    const paid = accommodation.payment.reduce((a, b) => a + b.amount, 0);
    if (everything) return total;
    return Math.max(total - paid, 0);
  };

  const sort = (array) => array.sort((a, b) => b.creationDate - a.creationDate);

  useEffect(() => {
    (() => {
      if (!customer) return;

      const IDS = customer.special ? customer.clientList.map((c) => c.id) : [customer.id];

      const filterEvent = (id, condition) => (paymentIDS ? paymentIDS.includes(id) : condition);
      const compareHosted = (hosted) => hosted?.some((h) => IDS.includes(h.owner));

      const a = accommodationReservations?.filter((a) => filterEvent(a.id, IDS.includes(a.owner)));
      const s = standardReservations?.filter((s) => filterEvent(s.id, compareHosted(s.hosted)));
      const o = orders.filter((o) => filterEvent(o.id, IDS.includes(o.ref)));
      const f = sales.filter((o) => filterEvent(o.id, IDS.includes(o.ref)));

      const SDebugged = s?.filter((standard) => {
        const hosted = standard.hosted.filter((h) => IDS.includes(h.owner));
        const checkOut = hosted.filter((h) => h.checkOut || everything);
        return hosted.length === checkOut.length;
      });
      const ADebugged = a?.filter((accommodation) => accommodation.checkOut || everything);
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
          details: `Alojamiento (${zon?.name}) (${nom?.nomenclature})`,
          people: ac?.hosted?.length || 1,
          days: ac.days,
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
        details: af.selection.reduce((a, b) => [...a, b.name], []).join(" + "),
        people: "-",
        days: "-",
        value: getTradePrice([af]),
        creationDate: af.creationDate,
      }));

      const invoices = sort([...accommodation, ...trade]);

      const condition = (old, { creationDate }) => (creationDate < old ? creationDate : old);
      setCreationDate(invoices?.reduce(condition, new Date())?.creationDate || new Date());
      setInvoices(invoices);
    })();
  }, [customer, orders, sales, standardReservations, accommodationReservations, everything, paymentIDS]);

  useEffect(() => {
    (() => {
      const text = invoices.reduce(
        (a, item) =>
          a +
          `<tr>
            <td style="width: 200px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600;">${item.details}</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600;">${thousandsSystem(item.people)}</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600;">${thousandsSystem(item.days)}</p>
            </td>
            <td style="width: 100px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 18px; font-weight: 600;">${thousandsSystem(item.value)}</p>
            </td>
          </tr>
          ${
            item?.trades?.reduce(
              (a, trade) =>
                a +
                `<tr>
                <td style="width: 200px; border: 1px solid #000; background: #EEEEEE; padding: 8px;" colspan="3">
                  <p style="font-size: 18px; font-weight: 600;">${`Venta (${trade.selection
                    .reduce((a, b) => [...a, b.name], [])
                    .join(" + ")})`}</p>
                </td>
                <td style="width: 100px; border: 1px solid #000; background: #EEEEEE; padding: 8px;">
                  <p style="font-size: 18px; font-weight: 600;">${thousandsSystem(
                    getTradePrice([trade])
                  )}</p>
                </td>
              </tr>`,
              ""
            ) || ""
          }
          `,
        ""
      );

      const html = `
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
          color: #000
        }
    
        @page { margin: 20px; } 
      </style>
    </head>
    
    <body>
      <view style="padding: 20px 0 0 0; display: block; margin: 20px 0 0 0;">
        <view>
          <img
          src="${Image.resolveAssetSource(Logo).uri}"
          style="width: 22vw; display: block; margin: 0 auto; border-radius: 8px" />
          <p style="font-size: 30px; text-align: center">vbelapp.com</p>
        </view>
        <p style="font-size: 30px; text-align: center; margin: 20px 0; background-color: #000; padding: 10px 0; color: #FFFFFF">FACTURA GENERAL</p>
      </view>
      <view>
        <table style="width: 100vw">
          <tr>
            <td style="text-align: left;">
              <p style="font-size: 30px; font-weight: 600;">FACTURA</p>
            </td>
            <td style="text-align: right;">
              <p style="font-size: 30px; font-weight: 600;">#${invoice}</>
            </td>
          </tr>
        </table>
        
        <p style="font-size: 24px; font-weight: 600;">Fecha de creación: ${changeDate(
          new Date(creationDate),
          { time: true }
        )}</p>
  
  
        <view style="display: block; margin: 25px 0">
          <table style="width: 100vw">
            <tr>
              <td style="text-align: left;">
                <p style="font-size: 24px; font-weight: 600;">${customer?.name}</p>
              </td>
              <td style="text-align: right;">
                <p style="font-size: 24px; font-weight: 600;">(${thousandsSystem(
                  invoices.length
                )}) Eventos generados</>
              </td>
            </tr>
          </table>
          <p style="font-size: 24px; text-align: right; font-weight: 600;">(${thousandsSystem(
            customer?.clientList?.length || 1
          )}) clientes</p>
  
          <table style="width: 100vw; margin: 15px 0;">
            <tr>
              <td style="width: 200px; border: 1px solid #000; padding: 8px">
                <p style="font-size: 18px; font-weight: bold;">Detalle</p>
              </td>
              <td style="width: 50px; border: 1px solid #000; padding: 8px">
                <p style="font-size: 18px; font-weight: bold;">Personas</p>
              </td>
              <td style="width: 50px; border: 1px solid #000; padding: 8px">
                <p style="font-size: 18px; font-weight: bold;">Días</p>
              </td>
              <td style="width: 100px; border: 1px solid #000; padding: 8px">
                <p style="font-size: 18px; font-weight: bold;">Valor</p>
              </td>
            </tr>
            ${text.replace(/,/g, "")}
          </table>
  
          <p style="font-size: 24px; text-align: right; font-weight: 600;">Total: ${thousandsSystem(
            invoices.reduce((a, b) => a + b.value, 0)
          )}</p>
        </view>
  
        
  
        <p style="font-size: 24px; font-weight: 600; text-align: center">Factura generada el: ${changeDate(
          new Date(),
          { time: true }
        )}</p>
        <p style="font-size: 16px; font-weight: 600; text-align: center; margin-top: 20px">FACTURA GENERADA POR VBELA POR FAVOR RECUERDE VISITAR vbelapp.com</p>
      </view>
    </body>
    
    </html>
      `;

      const basic = [
        {
          name: "document",
          onPress: async () => generatePDF({ html, code: invoice, width: 425, height: 570 }),
        },
        { name: "print", onPress: () => print({ html }) },
      ];

      if (!paymentIDS) return setButtons(basic);
      setButtons([
        ...basic,
        { name: "create", onPress: () => setModalVisible(!modalVisible) },
        {
          name: "trash",
          backgroundColor: "red",
          color: light.main5,
          onPress: () =>
            Alert.alert(
              "Ey",
              "¿Estás seguro que desea eliminar la factura?",
              [
                {
                  text: "No estoy seguro",
                  style: "cancel",
                },
                {
                  text: "Estoy seguro",
                  onPress: async () => {
                    navigation.pop();
                    dispatch(remove({ id: invoice }));
                    await removeInvoice({
                      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
                      id: invoice,
                      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
                    });
                  },
                },
              ],
              { cancelable: true }
            ),
        },
      ]);
    })();
  }, [paymentIDS, invoices, customer]);

  return (
    <>
      <Layout>
        <ScrollView contentContainerStyle={{ justifyContent: "space-between", flexGrow: 1 }}>
          <View>
            <View style={{ alignItems: "center", marginBottom: 10, paddingTop: 20 }}>
              <Image source={Logo} style={{ width: 90, height: 90, borderRadius: 8 }} />
              <TextStyle style={{ marginTop: 5 }} color={textColor}>
                vbelapp.com
              </TextStyle>
            </View>
            <View style={styles.bar}>
              <TextStyle center>FACTURA GENERAL</TextStyle>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <TextStyle color={textColor}>FACTURA</TextStyle>
                <TextStyle smallParagraph color={textColor}>
                  Fecha de creación:{" "}
                  <TextStyle smallParagraph color={light.main2}>
                    {changeDate(new Date(creationDate), { time: true })}
                  </TextStyle>
                </TextStyle>
              </View>
              <TextStyle color={textColor}>#{invoice}</TextStyle>
            </View>
            <View style={{ marginVertical: 25 }}>
              <View style={styles.row}>
                <TextStyle color={textColor}>{customer?.name}</TextStyle>
                <View>
                  <TextStyle smallParagraph color={textColor}>
                    ({thousandsSystem(invoices.length)}) Eventos generados
                  </TextStyle>
                  <TextStyle smallParagraph color={textColor} right>
                    ({thousandsSystem(customer?.clientList?.length || 1)}) clientes
                  </TextStyle>
                </View>
              </View>
              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: "row" }}>
                  <View style={[styles.table, { borderColor: textColor, width: 155 }]}>
                    <TextStyle color={light.main2} verySmall>
                      Detalle
                    </TextStyle>
                  </View>
                  <View style={[styles.table, { borderColor: textColor, width: 70 }]}>
                    <TextStyle color={light.main2} verySmall>
                      Personas
                    </TextStyle>
                  </View>
                  <View style={[styles.table, { borderColor: textColor, width: 40 }]}>
                    <TextStyle color={light.main2} verySmall>
                      Días
                    </TextStyle>
                  </View>
                  <View style={[styles.table, { borderColor: textColor, flexGrow: 1 }]}>
                    <TextStyle color={light.main2} verySmall>
                      Valor
                    </TextStyle>
                  </View>
                </View>
                <View>
                  {invoices?.map((invoice) => (
                    <View>
                      <Table
                        details={invoice.details}
                        people={invoice.people}
                        days={invoice.days}
                        value={invoice.value}
                      />
                      {invoice.trades?.map((trade) => (
                        <Table
                          trade={true}
                          details={`Venta (${trade.selection
                            .reduce((a, b) => [...a, b.name], [])
                            .join(" + ")})`}
                          value={getTradePrice([trade])}
                        />
                      ))}
                    </View>
                  ))}
                </View>
                <TextStyle right color={textColor} style={{ marginTop: 14 }}>
                  Total:{" "}
                  <TextStyle color={light.main2}>
                    {thousandsSystem(invoices.reduce((a, b) => a + b.value, 0))}
                  </TextStyle>
                </TextStyle>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 15 }}>
            <View>
              <TextStyle color={light.main2} smallParagraph>
                Términos y Condiciones
              </TextStyle>
              <TextStyle color={textColor} smallParagraph style={{ marginVertical: 8 }}>
                Factura generada el:{" "}
                <TextStyle color={light.main2} smallParagraph>
                  {changeDate(new Date(), { time: true })}
                </TextStyle>
              </TextStyle>
            </View>
            <TextStyle color={textColor} smallParagraph>
              FACTURA GENERADA POR VBELA POR FAVOR RECUERDE VISITAR vbelapp.com
            </TextStyle>
          </View>
        </ScrollView>
      </Layout>
      <FloatingButton style={{ top: 20, right: 45 }} buttons={buttons} />
      <CreateInvoice
        key={modalVisible}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        editing={{ id: invoice, ref: id, paymentIDS }}
        onSubmit={({ paymentIDS }) => setPaymentIDS(paymentIDS)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bar: {
    backgroundColor: light.main2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: "100%",
    marginVertical: 8,
  },
  table: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default Invoice;

import { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { thousandsSystem, changeDate } from "@helpers/libs";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import CommerceInformation from "@utils/trade/Information";
import HostedInformation from "@utils/reservation/information/HostedInformation";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const Header = () => {
  const mode = useSelector((state) => state.mode);

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  return (
    <View style={{ flexDirection: "row" }}>
      <View style={[styles.table, { borderColor: textColor, width: 70 }]}>
        <TextStyle color={light.main2} verySmall>
          Fecha
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 180 }]}>
        <TextStyle color={light.main2} verySmall>
          Detalle
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
        <TextStyle color={light.main2} verySmall>
          Nombre
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 110 }]}>
        <TextStyle color={light.main2} verySmall>
          Ubicación
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 40 }]}>
        <TextStyle color={light.main2} verySmall>
          Días
        </TextStyle>
      </View>
      <View style={[styles.table, { borderColor: textColor, width: 100 }]}>
        <TextStyle color={light.main2} verySmall>
          Valor
        </TextStyle>
      </View>
    </View>
  );
};

const Card = ({ item }) => {
  const mode = useSelector((state) => state.mode);

  const [isHostedInformationActive, setIsHostedInformationActive] = useState(false);
  const [isCommerceInformationActive, setIsCommerceInformationActive] = useState(false);

  const navigation = useNavigation();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  const checkStatus = (item) =>
    item?.status === "pending"
      ? "PENDIENTE"
      : item?.status === "business"
      ? "POR EMPRESA"
      : item?.status === "paid"
      ? "PAGADO"
      : "ESPERANDO POR PAGO";

  return (
    <>
      <View style={{ flexDirection: "row" }}>
        <View style={[styles.table, styles.center, { borderColor: textColor, width: 70 }]}>
          <TextStyle color={textColor} verySmall>
            {changeDate(new Date(item.creationDate))}
          </TextStyle>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (item.type === "standard")
              navigation.navigate("StandardReserveInformation", { id: item.id });
            if (item.type === "accommodation")
              navigation.navigate("AccommodationReserveInformation", { ids: [item.id] });
            if (["orders", "sales"].includes(item.type))
              setIsCommerceInformationActive(!isCommerceInformationActive);
          }}
          style={[styles.table, { borderColor: textColor, width: 180 }]}
        >
          <TextStyle color={textColor} verySmall>
            {item.detail}
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => item?.hosted && setIsHostedInformationActive(!isHostedInformationActive)}
          style={[styles.table, styles.center, { borderColor: textColor, width: 100 }]}
        >
          <TextStyle color={textColor} verySmall>
            {item.name}
          </TextStyle>
        </TouchableOpacity>
        <View style={[styles.table, styles.center, { borderColor: textColor, width: 110 }]}>
          <TextStyle color={textColor} verySmall>
            {item.location}
          </TextStyle>
        </View>
        <View style={[styles.table, styles.center, { borderColor: textColor, width: 40 }]}>
          <TextStyle color={textColor} verySmall>
            {thousandsSystem(item.days)}
          </TextStyle>
        </View>
        <View style={[styles.table, styles.center, { borderColor: textColor, width: 100 }]}>
          <TextStyle color={textColor} verySmall>
            {thousandsSystem(item.value)}
          </TextStyle>
        </View>
      </View>
      {item.trade && (
        <CommerceInformation
          item={item.trade}
          modalVisible={isCommerceInformationActive}
          setModalVisible={setIsCommerceInformationActive}
        />
      )}
      {item?.hosted && (
        <HostedInformation
          item={item.hosted}
          modalVisible={isHostedInformationActive}
          setModalVisible={setIsHostedInformationActive}
          complement={
            item.hosted.type === "accommodation"
              ? () => (
                  <>
                    <TextStyle color={textColor}>
                      Estado:{" "}
                      <TextStyle color={light.main2}>{checkStatus(item.hosted.status)}</TextStyle>
                    </TextStyle>
                  </>
                )
              : () => {}
          }
          showMore={
            item.hosted.type === "accommodation"
              ? () => {
                  const reservePayment = item?.hosted?.payment.reduce((a, b) => a + b.amount, 0);

                  return (
                    <>
                      <TextStyle color={textColor}>
                        Costo de alojamiento:{" "}
                        <TextStyle color={light.main2}>{thousandsSystem(item.hosted.total)}</TextStyle>
                      </TextStyle>
                      {item?.hosted?.status !== "business" && (
                        <TextStyle color={textColor}>
                          Deuda:{" "}
                          <TextStyle color={light.main2}>
                            {item.hosted.total - reservePayment > 0
                              ? thousandsSystem(item.hosted.total - reservePayment || "0")
                              : "YA PAGADO"}
                          </TextStyle>
                        </TextStyle>
                      )}
                      {item?.hosted?.status !== "business" && (
                        <TextStyle color={textColor}>
                          Dinero pagado:{" "}
                          <TextStyle color={light.main2}>
                            {thousandsSystem(reservePayment || "0")}
                          </TextStyle>
                        </TextStyle>
                      )}
                      {reservePayment > item.hosted.total && (
                        <TextStyle color={textColor}>
                          Propina:{" "}
                          <TextStyle color={light.main2}>
                            {thousandsSystem(reservePayment - item.hosted.total)}
                          </TextStyle>
                        </TextStyle>
                      )}
                      <TextStyle color={textColor}>
                        Días reservado:{" "}
                        <TextStyle color={light.main2}>{thousandsSystem(item.days)}</TextStyle>
                      </TextStyle>
                      <View>
                        <TextStyle color={textColor}>Tipo de acomodación: </TextStyle>
                        <View style={{ marginLeft: 10 }}>
                          {item?.hosted?.accommodation?.map((a) => (
                            <TextStyle color={light.main2}>{a.name}</TextStyle>
                          ))}
                        </View>
                      </View>
                      <TextStyle color={textColor}>
                        Fecha de registro:{" "}
                        <TextStyle color={light.main2}>
                          {changeDate(new Date(item.hosted.start))}
                        </TextStyle>
                      </TextStyle>
                      <TextStyle color={textColor}>
                        Fecha de Finalización:{" "}
                        <TextStyle color={light.main2}>
                          {changeDate(new Date(item.hosted.end))}
                        </TextStyle>
                      </TextStyle>
                    </>
                  );
                }
              : () => {}
          }
        />
      )}
    </>
  );
};

const Details = ({ route, navigation }) => {
  const mode = useSelector((state) => state.mode);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const sales = useSelector((state) => state.sales);
  const orders = useSelector((state) => state.orders);
  const customers = useSelector((state) => state.customers);
  const nomenclatures = useSelector((state) => state.nomenclatures);
  const zones = useSelector((state) => state.zones);

  const [customer, setCustomer] = useState(null);
  const [reservations, setReservations] = useState(null);
  const [ecommerces, setEcommerces] = useState(null);

  const id = route.params?.id;

  useEffect(() => {
    (() => {
      if (!customer) return;
      navigation.setOptions({ title: `Detalles: ${customer?.name}` });
    })();
  }, [customer]);

  useEffect(() => {
    const customerFound = customers.find((c) => c.id === id);

    // OBTENEMOS LA UBICACION DE LA RESERVACION
    const getLocationDetails = (nomenclatureRef) => {
      if (!nomenclatureRef) return "-";
      const { nomenclature, ref: zoneRef } = nomenclatures.find((n) => n.id === nomenclatureRef);
      const { name } = zones.find((z) => z.id === zoneRef);
      return `${name} ${nomenclature}`;
    };

    // FILTRAMOS EL COMERCIO Y DEVOLVEMOS LO QUE QUEREMOS
    const filterAndMapEcommerces = (ecommerces, type) => {
      const everybody = customerFound.special ? customerFound.clientList : [customerFound];
      const getTotal = (selection) => selection.reduce((a, b) => a + b.total, 0);

      const getPayment = (selection) => {
        const methods = selection.reduce((a, b) => [...a, ...b.method], []);
        // LO SUMAMOS TODO PARA OBTENER EL TOTAL DE TODO LO QUE ESTA EN METHODS
        const everything = methods.reduce((a, b) => a + b.total, 0);
        // AHORA HACEMOS LA SUMA PARA VER SI EXISTE UNA DIFERENCIA
        const differential = getTotal(selection) - everything;
        // AHORA DEFINIMOS LO QUE HEMOS PAGADO
        const paid = methods.filter((m) => m.method !== "credit").reduce((a, b) => a + b.total, 0);
        return paid + differential;
      };

      return ecommerces
        .filter(
          (e) =>
            everybody.some((c) => c.id === e.ref) && getTotal(e.selection) !== getPayment(e.selection)
        )
        .map((e) => {
          const found = everybody.find((customer) => customer.id === e.ref);

          const detail = e.selection.reduce((a, b) => [...a, b.name], []).join(" + ");
          const existsAC = accommodationReservations.find((a) => a.owner === found.id);
          const existsST = standardReservations.find(({ hosted }) =>
            hosted.some((h) => h.owner === found.id)
          );

          return {
            hosted: existsAC || existsST?.hosted.find((h) => h.owner === found.id),
            trade: e,
            id: e.id,
            type,
            creationDate: e.creationDate,
            detail,
            name: found.name,
            location: getLocationDetails(existsAC?.ref || existsST?.ref),
            days: existsAC?.days || existsST?.days || "-",
            value: getTotal(e.selection) - getPayment(e.selection),
          };
        });
    };

    // FILTRAMOS LAS RESERVACIONES Y DEVOLVEMOS LO QUE QUEREMOS
    const filterAndMapReservations = (reservations, type, detailExtractor) => {
      const everybody = customerFound.special ? customerFound.clientList : [customerFound];
      const getPayment = (payment) => payment.reduce((a, b) => a + b.amount, 0);

      return reservations
        .filter((r) => everybody?.some((c) => c.id === r.owner) && r.total !== getPayment(r.payment))
        .map((r) => ({
          hosted: r,
          id: r.id,
          type,
          creationDate: r.creationDate,
          detail: detailExtractor(r),
          name: r.fullName,
          location: getLocationDetails(r.ref),
          days: r.days,
          value: r.total - getPayment(r.payment),
        }));
    };

    // QUE TIPO DE DETALLE TIENE
    const standardDetailExtractor = () => "Alojamiento estandar";
    const accommodationDetailExtractor = (ac) => ac.accommodation?.map((b) => b.name).join(" ") || "";

    // SACAMOS SOLO LOS HUESPEDES Y DEVOLVEMOS LA INFORMACION QUE NECESITAMOS
    const hosted = standardReservations.reduce((a, b) => {
      const changed = b.hosted.map((h) => ({
        ...h,
        id: b.id,
        total: b.total,
        days: b.days,
        payment: b.payment,
        creationDate: b.creationDate,
      }));

      return [...a, ...changed];
    }, []);

    // LA INFORMACION DE RESERVACIÓN
    const standard = filterAndMapReservations(hosted, "standard", standardDetailExtractor);
    const accommodation = filterAndMapReservations(
      accommodationReservations,
      "accommodation",
      accommodationDetailExtractor
    );

    // LA INFORMACION DE COMERCIOS
    const OFound = filterAndMapEcommerces(orders, "orders");
    const SFound = filterAndMapEcommerces(sales, "sales");

    setEcommerces([...OFound, ...SFound]);
    setReservations([...standard, ...accommodation]);
    setCustomer(customerFound);
  }, [id, standardReservations, accommodationReservations, sales, orders]);

  return (
    <Layout>
      <View>
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Detalles del cliente: <TextStyle color={light.main2}>{customer?.name}</TextStyle>
        </TextStyle>
        <TextStyle smallParagraph color={mode === "light" ? light.textDark : dark.textWhite}>
          Valor total:{" "}
          <TextStyle color={light.main2} smallParagraph>
            {thousandsSystem(
              ecommerces?.reduce((a, b) => a + b.value, 0) +
                reservations?.reduce((a, b) => a + b.value, 0)
            )}
          </TextStyle>
        </TextStyle>
      </View>

      {reservations?.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <View style={[styles.header, { backgroundColor: light.main2 }]}>
            <TextStyle verySmall>Alojamiento</TextStyle>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <Header />
              <FlatList
                data={reservations || []}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 250 }}
                renderItem={({ item }) => <Card item={item} />}
              />
            </View>
          </ScrollView>
        </View>
      )}

      {ecommerces?.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <View style={[styles.header, { backgroundColor: light.main2 }]}>
            <TextStyle verySmall>Restaurante - Productos & Servicios</TextStyle>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <Header />
              <FlatList
                data={ecommerces || []}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 250 }}
                renderItem={({ item }) => <Card item={item} />}
              />
            </View>
          </ScrollView>
        </View>
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
  table: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
  header: {
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Details;

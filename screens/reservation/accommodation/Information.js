import { useState, useEffect, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, FlatList, ScrollView, Alert, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { thousandsSystem, changeDate } from "@helpers/libs";
import { edit, remove } from "@features/zones/accommodationReservationsSlice";
import { useNavigation } from "@react-navigation/native";
import { removeReservation, editReservation } from "@api";
import Logo from "@assets/logo.png";
import PaymentManager from "@utils/reservation/information/PaymentManager";
import helperNotification from "@helpers/helperNotification";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";
import Header from "@utils/reservation/information/Header";
import Description from "@utils/reservation/information/Description";
import HostedInformation from "@utils/reservation/information/HostedInformation";

const { light, dark } = theme();

const checkStatus = (item) =>
  item?.status === "pending"
    ? "PENDIENTE"
    : item?.status === "business"
    ? "POR EMPRESA"
    : item?.status === "paid"
    ? "PAGADO"
    : "ESPERANDO POR PAGO";

const Table = ({
  reserves,
  item,
  event,
  setEditPay,
  setShowPaymentManagement,
  setReservesToPay,
  activePayment,
}) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);

  const [showInformationModal, setShowInformationModal] = useState(false);
  const [reservePayment, setReservePayment] = useState(null);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => setReservePayment(item?.payment?.reduce((a, p) => a + p.amount, 0)), [item]);

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
            if (!reserves.filter((r) => r.id !== item.id).length) navigation.pop();
            dispatch(remove({ ids: [item.id] }));
            await removeReservation({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              reservation: {
                identifier: [item.id],
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

  const openPaymentToPay = () => {
    setEditPay(true);
    setShowPaymentManagement(true);
    const amount = item.total - reservePayment;
    setReservesToPay([
      {
        id: item.id,
        total: item.total,
        name: `${item.fullName}: ${item.total}`,
        amount: Math.max(amount, 0),
        payment: reservePayment,
        owner: item.owner,
      },
    ]);
  };

  return (
    <>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={[styles.table, { borderColor: textColor }]}
          onPress={() => setShowInformationModal(!showInformationModal)}
        >
          <TextStyle smallParagraph color={textColor}>
            {`${item.fullName.slice(0, 15)}${item.fullName.length > 15 ? "..." : ""}`}
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => event({ hosted: [item], type: "checkIn" })}
          style={[styles.table, { borderColor: textColor, width: 85 }]}
        >
          <TextStyle smallParagraph color={textColor}>
            {item.checkIn ? changeDate(new Date(item.checkIn)) : "NO"}
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.table, { borderColor: textColor, width: 70 }]}>
          <TextStyle smallParagraph color={textColor}>
            {!item.owner ? "NO" : "SI"}
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => event({ hosted: [item], type: "checkOut" })}
          style={[styles.table, { borderColor: textColor, width: 85 }]}
        >
          <TextStyle smallParagraph color={textColor}>
            {item.checkOut ? changeDate(new Date(item.checkOut)) : "NO"}
          </TextStyle>
        </TouchableOpacity>
        <TouchableOpacity
          onLongPress={() => item.status && !item?.status !== "business" && openPaymentToPay()}
          onPress={() => activePayment({ hosted: [item] })}
          style={[styles.table, { borderColor: textColor, width: 100 }]}
        >
          <TextStyle smallParagraph color={textColor}>
            {!item?.status
              ? "ESPERANDO"
              : item.status === "paid"
              ? thousandsSystem(reservePayment || "0")
              : checkStatus(item)}
          </TextStyle>
        </TouchableOpacity>
      </View>
      <HostedInformation
        item={item}
        event={(type) => event({ hosted: [item], type })}
        remove={deleteHosted}
        settings={{ discount: true }}
        modalVisible={showInformationModal}
        setModalVisible={setShowInformationModal}
        complement={() => (
          <>
            <TextStyle color={textColor}>
              Estado: <TextStyle color={light.main2}>{checkStatus(item)}</TextStyle>
            </TextStyle>
          </>
        )}
        showMoreRight={() =>
          item?.status !== "business" && (
            <ButtonStyle
              style={{ flexGrow: 1, width: "auto", marginLeft: 5 }}
              backgroundColor={mode === "light" ? dark.main2 : light.main5}
              onPress={() => openPaymentToPay()}
            >
              <TextStyle center color={mode === "light" ? dark.textWhite : light.textDark}>
                Abonar
              </TextStyle>
            </ButtonStyle>
          )
        }
        showMore={() => (
          <>
            <TextStyle color={textColor}>
              Costo de alojamiento:{" "}
              <TextStyle color={light.main2}>{thousandsSystem(item.total)}</TextStyle>
            </TextStyle>
            {item?.status !== "business" && (
              <TextStyle color={textColor}>
                Deuda:{" "}
                <TextStyle color={light.main2}>
                  {item?.total - reservePayment > 0
                    ? thousandsSystem(item?.total - reservePayment || "0")
                    : "YA PAGADO"}
                </TextStyle>
              </TextStyle>
            )}
            {item?.status !== "business" && (
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
              Días reservado: <TextStyle color={light.main2}>{thousandsSystem(item.days)}</TextStyle>
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
        )}
        updateHosted={async ({ data, cleanData }) => {
          const hosted = {
            ...item,
            ...data,
            total: (data.discount ? item.amount - data.discount : item.amount) * data.days,
            checkIn: item.checkIn && data.checkIn ? item.checkIn : data.checkIn,
          };

          dispatch(edit({ data: [hosted] }));
          cleanData();
          await editReservation({
            identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
            reservation: {
              data: [hosted],
              type: "accommodation",
            },
            helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
          });
        }}
      />
    </>
  );
};

const Information = ({ route, navigation }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);
  const nomenclatures = useSelector((state) => state.nomenclatures);

  const [reserves, setReserves] = useState(null);
  const [place, setPlace] = useState(null);
  const [showMore, setShowMore] = useState(false);

  const [reservesPayment, setReservesPayment] = useState(null);
  const [reservesTotal, setReservesTotal] = useState(null);
  const [HTMLTable, setHTMLTable] = useState("");

  const [isEditPay, setEditPay] = useState(false);
  const [reservesToPay, setReservesToPay] = useState(null);
  const [showPaymentManagement, setShowPaymentManagement] = useState(false);

  const dispatch = useDispatch();
  const ids = route.params?.ids;

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    const reserves = accommodationReservations.filter((a) => ids.includes(a.id));
    setReservesPayment(reserves?.reduce((a, b) => a + b?.payment?.reduce((a, p) => a + p.amount, 0), 0));
    setReservesTotal(reserves?.reduce((a, b) => a + b.total, 0));
    setReserves(reserves);
  }, [accommodationReservations]);

  useEffect(() => {
    if (reserves) {
      const place = nomenclatures.find((n) => n.id === reserves[0]?.ref);
      setPlace(place);
    }
  }, [nomenclatures, reserves]);

  useEffect(() => {
    setHTMLTable("");
    const table = reserves?.reduce((a, item) => {
      return (
        a +
        `<tr>
            <td style="width: 100px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600; word-break: break-word;">${item.fullName}</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600; word-break: break-word;">${
                item.checkIn ? changeDate(new Date(item.checkIn)) : "NO"
              }</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600; word-break: break-word;">${
                item.checkOut ? changeDate(new Date(item.checkOut)) : "NO"
              }</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600; word-break: break-word;">${
                !item.owner ? "NO" : "SI"
              }</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 12px; font-weight: 600; word-break: break-word;">${
                !item?.status
                  ? "ESPERANDO"
                  : item.status === "paid"
                  ? thousandsSystem(item.payment.reduce((a, b) => a + b.amount, 0))
                  : checkStatus(item)
              }</p>
            </td>
          </tr>`
      );
    }, "");
    setHTMLTable(table);
  }, [reserves]);

  const getHTML = () => {
    const debt = reservesTotal - reservesPayment || "0";

    return `
    <view style="padding: 20px; width: 500px; display: block; margin: 20px auto; background-color: #FFFFFF;">
    <view>
      <img
        src="${Image.resolveAssetSource(Logo).uri}"
        style="width: 22vw; display: block; margin: 0 auto; border-radius: 8px" />
      <p style="font-size: 30px; text-align: center">vbelapp.com</p>
    </view>
    <p style="font-size: 30px; text-align: center; margin: 20px 0; background-color: #444444; padding: 10px 0; color: #FFFFFF">RESERVACIÓN Y HUÉSPED</p>
      <view style="width: 100%;">
        <table style="width: 100%; margin-top: 30px;">
          <tr>
            <td style="width: 100px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600;">NOMBRE</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600;">CHECK IN</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600;">CHECK OUT</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600;">REGISTRADO</p>
            </td>
            <td style="width: 50px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600;">PAGADO</p>
            </td>
          </tr>
          ${HTMLTable?.replace(/,/g, "")}
        </table>
  
        <table style="width: 100%; margin-top: 10px;">
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 28px; font-weight: 600;">Alojados</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 28px; font-weight: 600;">
             ${thousandsSystem(reserves?.length || "0")}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 28px; font-weight: 600;">Días reservado</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 28px; font-weight: 600;">
             ${thousandsSystem(reserves?.reduce((a, b) => a + b.days, 0) || "0")}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 28px; font-weight: 600;">${
              debt === 0 ? "Sin deuda" : debt < 0 ? "Propina recibida:" : "Deuda pendiente:"
            }</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 28px; font-weight: 600;">
            ${thousandsSystem(debt < 0 ? reservesPayment - reservesTotal || "0" : debt)}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 28px; font-weight: 600;">Dinero pagado</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 28px; font-weight: 600;">
             ${thousandsSystem(reservesPayment || "0")}
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 28px; font-weight: 600;">Tipo de alojamiento</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 28px; font-weight: 600;">
             ACOMODACIÓN
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 28px; font-weight: 600;">Registro</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 28px; font-weight: 600;">
             ${
               !reserves
                 ? "CARGANDO"
                 : reserves?.filter((r) => r.start === reserves[0]?.start)?.length === reserves?.length
                 ? changeDate(new Date(reserves[0]?.start))
                 : "MIXTO"
             }
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;">
            <p style="font-size: 28px; font-weight: 600;">Finalización</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 28px; font-weight: 600;">
             ${
               !reserves
                 ? "CARGANDO"
                 : reserves?.filter((r) => r.end === reserves[0]?.end)?.length === reserves?.length
                 ? changeDate(new Date(reserves[0]?.end))
                 : "MIXTO"
             }
            </p>
          </td>
        </tr>
        </table>
      </view>
        <p style="text-align: center; font-size: 30px; font-weight: 600; margin: 20px 0 0 0; padding: 0;">Costo de alojamiento: ${thousandsSystem(
          reservesTotal || "0"
        )}</p>
        <p style="text-align: center; font-size: 30px; font-weight: 600; margin: 0; padding: 0;">${changeDate(
          new Date()
        )} ${("0" + new Date().getHours()).slice(-2)}:${("0" + new Date().getMinutes()).slice(-2)}</p>
    </view>
`;
  };

  const event = ({ hosted = [], type }) => {
    const isCheck = hosted.reduce((a, b) => (a + b[type] ? 1 : 0), 0);
    const noCheck = hosted.reduce((a, b) => (a + !b[type] ? 1 : 0), 0);

    Alert.alert(
      "EY!",
      `¿Está seguro que desea ${isCheck > noCheck ? "eliminar" : "activar"} ${
        hosted.length > 1 ? "los" : "el"
      } ${type === "checkIn" ? "CHECK IN" : "CHECK OUT"}?`,
      [
        {
          style: "cancel",
          text: "No",
        },
        {
          onPress: async () => {
            const reservesUpdated = hosted.map((h) => {
              const check = isCheck > noCheck ? null : new Date().getTime();
              return { ...h, [type]: check };
            });
            dispatch(edit({ data: reservesUpdated }));
            await editReservation({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              reservation: {
                data: reservesUpdated,
                type: "accommodation",
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

  const handlePayment = async ({ elements, paymentMethod, paymentByBusiness, onClose }) => {
    const reservesUpdated = reservesToPay.map((r) => {
      const reserve = reserves.find((re) => re.id === r.id);
      const found = elements.find((e) => e.id === r.id);
      if (found) {
        const tip = found.amount > r.amount - r.payment ? found.amount - (r.amount - r.payment) : null;
        let status = null;

        if (r.amount - r.payment > found.amount) status = "pending";
        if (r.amount - r.payment === found.amount || tip) status = "paid";
        if (paymentByBusiness) status = "business";

        if (!paymentByBusiness) {
          return {
            ...reserve,
            status,
            payment: [...reserve.payment, { method: paymentMethod, amount: found.amount }],
          };
        } else return { ...reserve, status };
      } else reserve;
    });

    setShowPaymentManagement(false);
    onClose();
    dispatch(edit({ data: reservesUpdated }));
    await editReservation({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      reservation: {
        data: reservesUpdated,
        type: "accommodation",
      },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const activePayment = ({ hosted }) => {
    setEditPay(false);

    const send = ({ hosted }) => {
      setReservesToPay(
        hosted.map((r) => {
          const name = `${r.fullName}: ${thousandsSystem(r.total)}`;
          const payment = r.payment?.reduce((a, b) => a + b.amount, 0);
          return { id: r.id, name, total: r.total, amount: r.total, payment, owner: r.owner };
        })
      );
      setShowPaymentManagement(!showPaymentManagement);
    };

    const reservesPayment = hosted.filter((r) => r.status);
    if (reservesPayment.length === hosted.length) removePayment({ hosted });
    else {
      const filtered = hosted.filter((r) => !r.status);
      const hasSingleOwner = filtered.every((h) => h.owner) || filtered.every((h) => !h.owner);
      if (filtered.length === 1 || hasSingleOwner) return send({ hosted: filtered });

      Alert.alert(
        "ELECCIÓN",
        "¿Quieres pagar los usuarios registrados o los usuarios no registrados?",
        [
          {
            text: "",
            style: "cancel",
          },
          {
            text: "No registrados",
            onPress: () => send({ hosted: filtered.filter((h) => !h.owner) }),
          },
          {
            text: "Si registrados",
            onPress: () => send({ hosted: filtered.filter((h) => h.owner) }),
          },
        ],
        { cancelable: true }
      );
    }
  };

  const removePayment = ({ hosted = [] }) => {
    Alert.alert(
      "ALERTA",
      `¿Está seguro que desea eliminar el pago de ${hosted.length > 1 ? "las" : "la"} ${
        hosted.length > 1 ? "reservaciones" : "reservación"
      }?`,
      [
        {
          text: "No estoy seguro",
          style: "cancel",
        },
        {
          text: "Estoy seguro",
          onPress: async () => {
            const reservesUpdated = hosted.map((h) => ({ ...h, payment: [], status: null }));
            dispatch(edit({ data: reservesUpdated }));
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

  return (
    <Layout style={{ justifyContent: "center" }}>
      <Header html={getHTML()} nomenclature={place?.nomenclature} />
      <View>
        <ButtonStyle
          style={{ marginVertical: 15 }}
          backgroundColor={mode === "light" ? light.main5 : dark.main2}
          onPress={() => setShowMore(!showMore)}
        >
          <TextStyle center color={textColor}>
            {showMore ? "Ocultar" : "Mostrar"} Huéspedes
          </TextStyle>
        </ButtonStyle>
        {showMore && (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 150 }}>
              <View>
                <View style={{ flexDirection: "row" }}>
                  <View style={[styles.table, { borderColor: textColor }]}>
                    <TextStyle color={light.main2} smallParagraph>
                      NOMBRE
                    </TextStyle>
                  </View>
                  <TouchableOpacity
                    onPress={() => event({ hosted: reserves, type: "checkIn" })}
                    style={[styles.table, { borderColor: textColor, width: 85 }]}
                  >
                    <TextStyle color={light.main2} smallParagraph>
                      CHECK IN
                    </TextStyle>
                  </TouchableOpacity>
                  <View style={[styles.table, { borderColor: textColor, width: 70 }]}>
                    <TextStyle color={light.main2} smallParagraph>
                      CLIENTE
                    </TextStyle>
                  </View>
                  <TouchableOpacity
                    onPress={() => event({ hosted: reserves, type: "checkOut" })}
                    style={[styles.table, { borderColor: textColor, width: 85 }]}
                  >
                    <TextStyle color={light.main2} smallParagraph>
                      CHECK OUT
                    </TextStyle>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.table, { borderColor: textColor, width: 100 }]}
                    onPress={() => activePayment({ hosted: reserves })}
                  >
                    <TextStyle color={light.main2} smallParagraph>
                      PAGADO
                    </TextStyle>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={reserves}
                  keyExtractor={(item) => item.id}
                  initialNumToRender={2}
                  renderItem={({ item }) => (
                    <Table
                      item={item}
                      event={event}
                      reserves={reserves}
                      setShowPaymentManagement={setShowPaymentManagement}
                      setReservesToPay={setReservesToPay}
                      setEditPay={setEditPay}
                      activePayment={activePayment}
                    />
                  )}
                />
              </View>
            </ScrollView>
            <ButtonStyle
              backgroundColor={light.main2}
              style={{ marginVertical: 15 }}
              onPress={() => activePayment({ hosted: reserves })}
            >
              <TextStyle center>
                {reserves.filter((r) => r.status).length === reserves.length ? "Eliminar pago" : "Pagar"}
              </TextStyle>
            </ButtonStyle>
          </View>
        )}
      </View>
      <View>
        <Description
          cost={thousandsSystem(reservesTotal || "0")}
          debt={
            reserves?.filter((r) => r.status === "business").length === reserves?.length
              ? null
              : reserves?.some((r) => r.status === "business")
              ? "MIXTO"
              : reserves.reduce((a, b) => a + b?.total, 0) - reservesPayment > 0
              ? thousandsSystem(reservesTotal - reservesPayment || "0")
              : "YA PAGADO"
          }
          status={
            reserves?.filter((r) => r.status === "pending").length === reserves?.length
              ? "PENDIENTE"
              : reserves?.filter((r) => r.status === "business").length === reserves?.length
              ? "POR EMPRESA"
              : reserves?.filter((r) => r.status === "paid").length === reserves?.length
              ? "PAGADO"
              : reserves?.filter((r) => !r.status).length === reserves?.length
              ? "ESPERANDO POR PAGO"
              : "MIXTO"
          }
          tip={reservesPayment > reservesTotal && thousandsSystem(reservesPayment - reservesTotal)}
          payment={
            reserves?.filter((r) => r.status === "business").length === reserves?.length
              ? null
              : reserves?.some((r) => r.status === "business")
              ? "MIXTO"
              : thousandsSystem(reservesPayment || "0")
          }
          type="POR ACOMODACIÓN"
          hosted={thousandsSystem(reserves?.length || "0")}
          days={thousandsSystem(reserves?.reduce((a, b) => a + b?.days, 0) || "0")}
          start={
            reserves === null
              ? "CARGANDO"
              : reserves?.filter((r) => r.start === reserves[0]?.start)?.length === reserves?.length
              ? changeDate(new Date(reserves[0]?.start))
              : "MIXTO"
          }
          end={
            reserves === null
              ? "CARGANDO"
              : reserves?.filter((r) => r.end === reserves[0]?.end)?.length === reserves?.length
              ? changeDate(new Date(reserves[0]?.end))
              : "MIXTO"
          }
        />
      </View>
      <ButtonStyle
        style={{ marginTop: 15 }}
        backgroundColor={light.main2}
        onPress={() =>
          Alert.alert(
            "¿Estás seguro?",
            "Se eliminarán todos los datos de esta reserva",
            [
              {
                text: "No estoy seguro",
                style: "cancel",
              },
              {
                text: "Estoy seguro",
                onPress: async () => {
                  dispatch(remove({ ids: reserves.map((r) => r.id) }));
                  navigation.pop();
                  await removeReservation({
                    identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
                    reservation: {
                      identifier: reserves.map((r) => r.id),
                      type: "accommodation",
                    },
                    helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
                  });
                  await helperNotification(
                    helperStatus,
                    user,
                    "Reservación eliminada",
                    `Una reservación ha sido eliminada por ${user.identifier}`,
                    "accessToReservations"
                  );
                },
              },
            ],
            { cancelable: true }
          )
        }
      >
        <TextStyle center>Eliminar reservación</TextStyle>
      </ButtonStyle>
      <PaymentManager
        total={reservesToPay?.reduce((a, b) => a + b.total, 0) || "0"}
        payment={reservesToPay?.reduce((a, b) => a + b.payment, 0) || "0"}
        modalVisible={showPaymentManagement}
        setModalVisible={setShowPaymentManagement}
        toPay={reservesToPay}
        business={!isEditPay}
        handleSubmit={handlePayment}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  table: {
    width: 120,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default Information;

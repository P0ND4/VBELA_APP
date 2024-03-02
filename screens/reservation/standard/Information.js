import { useState, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getFontSize, thousandsSystem, changeDate } from "@helpers/libs";
import { remove, edit } from "@features/zones/standardReservationsSlice";
import { editReservation, removeReservation } from "@api";
import Logo from "@assets/logo.png";
import helperNotification from "@helpers/helperNotification";
import Layout from "@components/Layout";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import Header from "@utils/reservation/information/Header";
import Description from "@utils/reservation/information/Description";
import HostedInformation from "@utils/reservation/information/HostedInformation";
import PaymentManager from "@utils/reservation/information/PaymentManager";

const { light, dark } = theme();

const Table = ({ item, reserve, event, deleteReservation }) => {
  const user = useSelector((state) => state.user);
  const helperStatus = useSelector((state) => state.helperStatus);
  const mode = useSelector((state) => state.mode);

  const [showInformationModal, setShowInformationModal] = useState(false);

  const dispatch = useDispatch();

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

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
            const hostedUpdated = reserve?.hosted.filter((h) => h.id !== item.id);
            if (!hostedUpdated.length) deleteReservation();
            const reserveUpdated = { ...reserve, hosted: hostedUpdated };
            dispatch(edit({ id: reserve.id, data: reserveUpdated }));
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
      </View>
      <HostedInformation
        item={item}
        event={(type) => event({ hosted: [item], type })}
        remove={deleteHosted}
        modalVisible={showInformationModal}
        setModalVisible={setShowInformationModal}
        settings={{ days: false }}
        updateHosted={async ({ data, cleanData }) => {
          const hosted = {
            ...item,
            ...data,
            checkIn: item.checkIn && data.checkIn ? item.checkIn : data.checkIn,
          };

          const reserveUpdated = {
            ...reserve,
            hosted: reserve.hosted.map((h) => (h.id === item.id ? hosted : h)),
          };
          dispatch(edit({ id: reserve.id, data: reserveUpdated }));

          cleanData();
          await editReservation({
            identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
            reservation: {
              data: reserveUpdated,
              type: "standard",
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
  const mode = useSelector((state) => state.mode);
  const standardReservations = useSelector((state) => state.standardReservations);
  const helperStatus = useSelector((state) => state.helperStatus);
  const nomenclatures = useSelector((state) => state.nomenclatures);

  const [reserve, setReserve] = useState(null);
  const [reservePayment, setReservePayment] = useState(null);

  const [showMore, setShowMore] = useState(false);
  const [place, setPlace] = useState(null);
  const [HTMLTable, setHTMLTable] = useState("");

  const [showPaymentManagement, setShowPaymentManagement] = useState(false);
  const [isEditPay, setEditPay] = useState(false);

  const dispatch = useDispatch();
  const id = route.params?.id;

  const getTextColor = (mode) => (mode === "light" ? light.textDark : dark.textWhite);
  const textColor = useMemo(() => getTextColor(mode), [mode]);

  useEffect(() => {
    const reserve = standardReservations.find((s) => s.id === id);
    setReservePayment(reserve?.payment?.reduce((a, p) => a + p.amount, 0));
    setReserve(reserve);
  }, [standardReservations]);

  useEffect(() => {
    const place = nomenclatures.find((n) => n.id === reserve?.ref);
    setPlace(place);
  }, [nomenclatures, reserve]);

  useEffect(() => {
    setHTMLTable("");
    const table = reserve?.hosted.reduce((a, item) => {
      return (
        a +
        `<tr>
            <td style="width: 100px; border: 1px solid #000; padding: 8px">
              <p style="font-size: 14px; font-weight: 600; word-break: break-word;">${
                item.fullName
              }</p>
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
          </tr>`
      );
    }, "");
    setHTMLTable(table);
  }, [reserve?.hosted]);

  const getHTML = () => {
    const debt = reserve?.total - reservePayment || "0";

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
           ${thousandsSystem(reserve?.hosted.length || "0")}
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Días reservado</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${thousandsSystem(reserve?.days || "0")}
          </p>
        </td>
      </tr>
      ${
        reserve?.discount
          ? `<tr>
      <td style="text-align: left;">
        <p style="font-size: 28px; font-weight: 600;">Descuento</p>
      </td>
      <td style="text-align: right;">
        <p style="font-size: 28px; font-weight: 600;">
         ${thousandsSystem(reserve?.discount)}
        </p>
      </td>
    </tr>`
          : ""
      }
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">${
            debt === 0 ? "Sin deuda" : debt < 0 ? "Propina recibida:" : "Deuda pendiente:"
          }</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
          ${thousandsSystem(debt < 0 ? reservePayment - reserve?.total : debt)}
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Dinero pagado</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${thousandsSystem(reservePayment || "0")}
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Tipo de alojamiento</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ESTANDAR
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Registro</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${changeDate(new Date(reserve?.start))}
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: left;">
          <p style="font-size: 28px; font-weight: 600;">Finalización</p>
        </td>
        <td style="text-align: right;">
          <p style="font-size: 28px; font-weight: 600;">
           ${changeDate(new Date(reserve?.end))}
          </p>
        </td>
      </tr>
      </table>
    </view>
      <p style="text-align: center; font-size: 30px; font-weight: 600; margin: 20px 0 0 0; padding: 0;">Costo de alojamiento: ${thousandsSystem(
        reserve?.total || "0"
      )}</p>
      <p style="text-align: center; font-size: 30px; font-weight: 600; margin: 0; padding: 0;">${changeDate(
        new Date()
      )} ${("0" + new Date().getHours()).slice(-2)}:${("0" + new Date().getMinutes()).slice(
      -2
    )}</p>
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
            const ids = hosted.map((h) => h.id);

            const hostedUpdated = reserve?.hosted.map((h) => {
              const check = isCheck > noCheck ? null : new Date().getTime();
              if (ids.includes(h.id)) return { ...h, [type]: check };
              return h;
            });
            const reserveUpdated = { ...reserve, hosted: hostedUpdated };
            dispatch(edit({ id: reserve.id, data: reserveUpdated }));
            await editReservation({
              identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
              reservation: {
                data: reserveUpdated,
                type: "standard",
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

  const deleteReservation = async () => {
    dispatch(remove({ id: reserve?.id }));
    navigation.pop();
    await removeReservation({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      reservation: {
        identifier: reserve?.id,
        type: "standard",
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
  };

  const handlePayment = async ({
    paymentMethod,
    paymentByBusiness,
    tip,
    amount,
    payment,
    total,
    onClose,
  }) => {
    const reserveUpdated = { ...reserve };

    if (total - payment > amount) reserveUpdated.status = "pending";
    if (total - payment === amount || tip) reserveUpdated.status = "paid";
    if (paymentMethod === "credit") reserveUpdated.status = "credit";
    if (paymentByBusiness) reserveUpdated.status = "business";

    if (paymentMethod !== "credit" && !paymentByBusiness)
      reserveUpdated.payment = [...reserve.payment, { method: paymentMethod, amount }];

    setShowPaymentManagement(false);
    onClose();
    dispatch(edit({ id: reserve.id, data: reserveUpdated }));
    await editReservation({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      reservation: {
        data: reserveUpdated,
        type: "standard",
      },
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const removePayment = () => {
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
            const reserveUpdated = { ...reserve, payment: [], status: null };
            dispatch(edit({ id: reserve.id, data: reserveUpdated }));
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

  return (
    <Layout style={{ justifyContent: "center" }}>
      <Header
        html={getHTML()}
        nomenclature={place?.nomenclature}
        rightIcon={() => (
          <TouchableOpacity
            onPress={() => {
              const date = new Date(reserve.start);
              const day = date.getDate();
              const month = date.getMonth();
              const year = date.getFullYear();

              navigation.navigate("CreateStandardReserve", {
                reserve,
                place,
                date: { day, month, year },
                editing: true,
              });
            }}
            style={{ marginHorizontal: 5 }}
          >
            <Ionicons name="create-outline" size={getFontSize(31)} color={light.main2} />
          </TouchableOpacity>
        )}
      />
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ maxHeight: 150 }}
            >
              <View>
                <View style={{ flexDirection: "row" }}>
                  <View style={[styles.table, { borderColor: textColor }]}>
                    <TextStyle color={light.main2} smallParagraph>
                      NOMBRE
                    </TextStyle>
                  </View>
                  <TouchableOpacity
                    onPress={() => event({ hosted: reserve.hosted, type: "checkIn" })}
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
                    onPress={() => event({ hosted: reserve.hosted, type: "checkOut" })}
                    style={[styles.table, { borderColor: textColor, width: 85 }]}
                  >
                    <TextStyle color={light.main2} smallParagraph>
                      CHECK OUT
                    </TextStyle>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={reserve?.hosted}
                  keyExtractor={(item) => item.id}
                  initialNumToRender={2}
                  renderItem={({ item }) => (
                    <Table
                      reserve={reserve}
                      item={item}
                      event={event}
                      deleteReservation={deleteReservation}
                    />
                  )}
                />
              </View>
            </ScrollView>
            <View style={[styles.row, { marginVertical: 15 }]}>
              {reserve?.status && !["credit", "business"].includes(reserve.status) && (
                <ButtonStyle
                  style={{ flexGrow: 1, width: "auto", marginRight: 5 }}
                  backgroundColor={mode === "light" ? light.main5 : dark.main2}
                  onPress={() => {
                    setEditPay(true);
                    setShowPaymentManagement(!showPaymentManagement);
                  }}
                >
                  <TextStyle center color={textColor}>
                    Abonar
                  </TextStyle>
                </ButtonStyle>
              )}
              <ButtonStyle
                style={{ flexGrow: 5, width: "auto" }}
                backgroundColor={light.main2}
                onPress={() => {
                  setEditPay(false);
                  if (reserve.status) removePayment();
                  else setShowPaymentManagement(!showPaymentManagement);
                }}
              >
                <TextStyle center>{reserve?.status ? "Eliminar pago" : "Pagar"}</TextStyle>
              </ButtonStyle>
            </View>
          </View>
        )}
      </View>
      <View>
        <Description
          cost={thousandsSystem(reserve?.total || "0")}
          debt={
            ["credit", "business"].includes(reserve?.status)
              ? null
              : reserve?.total - reservePayment > 0
              ? thousandsSystem(reserve?.total - reservePayment || "0")
              : "YA PAGADO"
          }
          status={
            reserve?.status === "pending"
              ? "PENDIENTE"
              : reserve?.status === "credit"
              ? "POR CRÉDITO"
              : reserve?.status === "business"
              ? "POR EMPRESA"
              : reserve?.status === "paid"
              ? "PAGADO"
              : "ESPERANDO POR PAGO"
          }
          tip={
            reservePayment > reserve?.total && thousandsSystem(reservePayment - reserve?.total)
          }
          payment={
            !["credit", "business"].includes(reserve?.status) &&
            thousandsSystem(reservePayment || "0")
          }
          type="ESTANDAR"
          hosted={thousandsSystem(reserve?.hosted?.length || "0")}
          days={thousandsSystem(reserve?.days || "0")}
          start={changeDate(new Date(reserve?.start))}
          end={changeDate(new Date(reserve?.end))}
        />
      </View>
      <ButtonStyle
        style={{ marginTop: 15 }}
        backgroundColor={light.main2}
        onPress={() => {
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
                onPress: async () => deleteReservation(),
              },
            ],
            { cancelable: true }
          );
        }}
      >
        <TextStyle center>Eliminar reservación</TextStyle>
      </ButtonStyle>
      <PaymentManager
        total={reserve?.total || "0"}
        payment={reservePayment || "0"}
        modalVisible={showPaymentManagement}
        setModalVisible={setShowPaymentManagement}
        toPay={[{ id: reserve?.id, name: "Pago general", amount: reserve?.total }]}
        business={!isEditPay}
        paymentType={!isEditPay && reserve?.hosted.some((h) => h.owner) ? "credit" : "others"}
        handleSubmit={handlePayment}
      />
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
    width: 120,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 0.2,
  },
});

export default Information;

import { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import AddReservation from "./AddReservation";
import TextStyle from "@components/TextStyle";
import ButtonStyle from "@components/ButtonStyle";
import theme from "@theme";

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const { light, dark } = theme();

const StandardCustomer = ({ item, salesHandler }) => {
  const mode = useSelector((state) => state.mode);
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);
  const standardReservations = useSelector((state) => state.standardReservations);
  const accommodationReservations = useSelector((state) => state.accommodationReservations);

  const [hostedFound, setHostedFound] = useState(null);
  const [active, setActive] = useState(true);
  const [personSelected, setPersonSelected] = useState(null);
  const [modalVisibleChooseDate, setModalVisibleChooseDate] = useState(false);

  const textColor = (condition) =>
    condition ? light.textDark : mode === "light" ? dark.textWhite : light.textDark;

  const backgroundColor = (condition) =>
    condition ? light.main2 : mode === "light" ? dark.main2 : light.main4;

  const navigation = useNavigation();

  useEffect(() => {
    const hosted = standardReservations.reduce(
      (a, b) => [...a, ...b.hosted.map((h) => ({ ...h, id: b.id, status: b.status }))],
      []
    );
    const allHosted = [...hosted, ...accommodationReservations];
    const found = allHosted.find((r) => r?.owner === item.id);
    setHostedFound(found);
    setActive(found?.status === "paid" && found?.checkOut);
  }, [standardReservations, accommodationReservations]);

  const reservationHandler = ({ hosted, item }) => {
    if (hosted) {
      const allReservations = [...standardReservations, ...accommodationReservations];
      const reservation = allReservations.find((ac) => ac.id === hosted.id);
      if (reservation.type === "accommodation")
        return navigation.navigate("AccommodationReserveInformation", {
          ids: [reservation.id],
        });
      else return navigation.navigate("StandardReserveInformation", { id: reservation.id });
    }
    setPersonSelected(item);
    setModalVisibleChooseDate(!modalVisibleChooseDate);
  };

  if (hostedFound === null) return <View />;

  if (active)
    return (
      <TextStyle verySmall center color={light.main2} style={{ marginBottom: 10 }}>
        EL CLIENTE YA SE HA IDO Y HA PAGADO
      </TextStyle>
    );

  return (
    <>
      <View style={styles.row}>
        {!hostedFound?.checkOut &&
          (() => {
            const exists =
              orders.some((o) => o.ref === item.id && o.status === "pending") ||
              sales.some((o) => o.ref === item.id && o.status === "pending");

            return (
              <ButtonStyle
                backgroundColor={backgroundColor(!exists)}
                style={{ width: "auto", flexGrow: 1, marginRight: 4 }}
                onPress={() => salesHandler({ item })}
              >
                <TextStyle paragrahp center color={textColor(!exists)}>
                  Ventas
                </TextStyle>
              </ButtonStyle>
            );
          })()}
        <ButtonStyle
          style={{ width: "auto", flexGrow: 1 }}
          backgroundColor={backgroundColor(!hostedFound)}
          onPress={() => reservationHandler({ hosted: hostedFound, item })}
        >
          <TextStyle paragrahp color={textColor(!hostedFound)} center>
            {hostedFound ? "Ya alojado" : "Alojamiento"}
          </TextStyle>
        </ButtonStyle>
      </View>
      <AddReservation
        personSelected={personSelected}
        modalVisible={modalVisibleChooseDate}
        setModalVisible={setModalVisibleChooseDate}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default StandardCustomer;

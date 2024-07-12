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

  const [reservationFound, setReservationFound] = useState(null);
  const [active, setActive] = useState(true);
  const [personSelected, setPersonSelected] = useState(null);
  const [modalVisibleChooseDate, setModalVisibleChooseDate] = useState(false);

  const textColor = (condition) =>
    condition ? light.textDark : mode === "light" ? dark.textWhite : light.textDark;

  const backgroundColor = (condition) =>
    condition ? light.main2 : mode === "light" ? dark.main2 : light.main4;

  const navigation = useNavigation();

  useEffect(() => {
    const allReservations = [...standardReservations, ...accommodationReservations];
    const found = allReservations.find(
      (r) => r?.owner === item.id || r?.hosted?.find((h) => h.owner === item.id)
    );
    const active =
      found?.status === "paid" &&
      (found.checkOut || found.hosted?.find((h) => h.owner === item.id).checkOut);
    setReservationFound(found);
    setActive(active);
  }, [standardReservations, accommodationReservations]);

  const reservationHandler = ({ reservation, item }) => {
    if (reservation) {
      if (reservation.type === "accommodation")
        return navigation.navigate("AccommodationReserveInformation", {
          ids: [reservation.id],
        });
      else return navigation.navigate("StandardReserveInformation", { id: reservation.id });
    }
    setPersonSelected(item);
    setModalVisibleChooseDate(!modalVisibleChooseDate);
  };

  if (reservationFound === null) return <View />;

  if (active)
    return (
      <TextStyle verySmall center color={light.main2} style={{ marginBottom: 10 }}>
        EL CLIENTE YA SE HA IDO Y HA PAGADO
      </TextStyle>
    );

  return (
    <>
      <View style={styles.row}>
        {(() => {
          const exists =
            orders.some((o) => o.ref === item.id && o.status === "pending") ||
            sales.some((o) => o.ref === item.id && o.status === "pending");

          return (
            <ButtonStyle
              backgroundColor={backgroundColor(!exists)}
              style={{ width: SCREEN_WIDTH / 2.4 }}
              onPress={() => salesHandler({ item })}
            >
              <TextStyle paragrahp center color={textColor(!exists)}>
                Ventas
              </TextStyle>
            </ButtonStyle>
          );
        })()}
        <ButtonStyle
          style={{ width: SCREEN_WIDTH / 2.4 }}
          backgroundColor={backgroundColor(!reservationFound)}
          onPress={() => reservationHandler({ reservation: reservationFound, item })}
        >
          <TextStyle paragrahp color={textColor(!reservationFound)} center>
            {reservationFound ? "Ya alojado" : "Alojamiento"}
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
